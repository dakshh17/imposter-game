// index.js — Main server
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { assignRoles, resolveVote } = require('./gameLogic');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || '*';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'Imposter Game Server Running' }));

// ─────────────────────────────────────────────
// IN-MEMORY GAME STATE
// Structure: lobbies[code] = { hostId, players, state, words, votes, roleMap }
// ─────────────────────────────────────────────
const lobbies = {};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getLobbyBySocket(socketId) {
  for (const code in lobbies) {
    const lobby = lobbies[code];
    if (lobby.players[socketId]) return { code, lobby };
  }
  return null;
}

function safePlayers(lobby) {
  // Send player list without sensitive role info
  return Object.entries(lobby.players).map(([id, p]) => ({
    id,
    name: p.name,
    isHost: p.isHost,
    hasSubmitted: p.hasSubmitted,
    eliminated: p.eliminated || false
  }));
}

// ─────────────────────────────────────────────
// SOCKET EVENTS
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── CREATE LOBBY ──
  socket.on('create_lobby', ({ playerName }, callback) => {
    let code = generateCode();
    while (lobbies[code]) code = generateCode(); // ensure unique

    lobbies[code] = {
      hostId: socket.id,
      state: 'waiting',   // waiting | role_reveal | submitting | deliberating | voting | result
      players: {
        [socket.id]: {
          name: playerName,
          isHost: true,
          hasSubmitted: false,
          eliminated: false
        }
      },
      words: {},       // socketId → word
      votes: {},       // socketId → targetId
      roleMap: {},
      roundNumber: 0,
      debateTimer: null
    };

    socket.join(code);
    console.log(`[LOBBY] Created ${code} by ${playerName}`);
    callback({ success: true, code });
  });

  // ── JOIN LOBBY ──
  socket.on('join_lobby', ({ code, playerName }, callback) => {
    const upperCode = code.toUpperCase();
    const lobby = lobbies[upperCode];

    if (!lobby) return callback({ success: false, error: 'Lobby not found' });
    if (lobby.state !== 'waiting') return callback({ success: false, error: 'Game already started' });
    if (Object.keys(lobby.players).length >= 20) return callback({ success: false, error: 'Lobby is full' });

    const nameExists = Object.values(lobby.players).some(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameExists) return callback({ success: false, error: 'Name already taken in this lobby' });

    lobby.players[socket.id] = {
      name: playerName,
      isHost: false,
      hasSubmitted: false,
      eliminated: false
    };

    socket.join(upperCode);
    console.log(`[LOBBY] ${playerName} joined ${upperCode}`);

    // Notify all players
    io.to(upperCode).emit('players_updated', {
      players: safePlayers(lobby),
      count: Object.keys(lobby.players).length
    });

    callback({ success: true, code: upperCode });
  });

  // ── START GAME ──
  socket.on('start_game', ({ code }, callback) => {
    const lobby = lobbies[code];
    if (!lobby) return callback({ success: false, error: 'Lobby not found' });
    if (lobby.hostId !== socket.id) return callback({ success: false, error: 'Only host can start' });

    const playerIds = Object.keys(lobby.players).filter(id => !lobby.players[id].eliminated);
    if (playerIds.length < 3) return callback({ success: false, error: 'Need at least 3 players' });

    // Assign roles
    const { roleMap, category } = assignRoles(playerIds);
    lobby.roleMap = roleMap;
    lobby.state = 'role_reveal';
    lobby.roundNumber += 1;
    lobby.words = {};
    lobby.votes = {};

    // Reset submission flags
    playerIds.forEach(id => {
      if (lobby.players[id]) lobby.players[id].hasSubmitted = false;
    });

    // Send each player their private role
    playerIds.forEach(id => {
      const { role, prompt } = roleMap[id];
      io.to(id).emit('role_assigned', {
        role,
        prompt: role === 'joker' ? null : prompt,
        category,
        round: lobby.roundNumber,
        totalPlayers: playerIds.length
      });
    });

    // Tell everyone game has started
    io.to(code).emit('game_started', {
      round: lobby.roundNumber,
      category,
      players: safePlayers(lobby)
    });

    console.log(`[GAME] Started in ${code}, round ${lobby.roundNumber}, category: ${category}`);
    callback({ success: true });
  });

  // ── SUBMIT WORD ──
  socket.on('submit_word', ({ code, word }, callback) => {
    const lobby = lobbies[code];
    if (!lobby) return callback({ success: false, error: 'Lobby not found' });
    if (lobby.state !== 'role_reveal' && lobby.state !== 'submitting') {
      return callback({ success: false, error: 'Not submission phase' });
    }
    if (lobby.words[socket.id]) return callback({ success: false, error: 'Already submitted' });
    if (lobby.players[socket.id]?.eliminated) return callback({ success: false, error: 'You are eliminated' });

    const cleanWord = word.trim().slice(0, 30);
    if (!cleanWord) return callback({ success: false, error: 'Word cannot be empty' });

    lobby.words[socket.id] = cleanWord;
    lobby.players[socket.id].hasSubmitted = true;
    lobby.state = 'submitting';

    io.to(code).emit('players_updated', {
      players: safePlayers(lobby),
      count: Object.keys(lobby.players).length
    });

    // Check if all active players submitted
    const activePlayers = Object.keys(lobby.players).filter(
      id => !lobby.players[id].eliminated
    );
    const allSubmitted = activePlayers.every(id => lobby.words[id]);

    if (allSubmitted) {
      lobby.state = 'deliberating';

      // Build round board
      const board = activePlayers.map(id => ({
        id,
        name: lobby.players[id].name,
        word: lobby.words[id]
      }));

      // Shuffle board order for fairness
      for (let i = board.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [board[i], board[j]] = [board[j], board[i]];
      }

      io.to(code).emit('round_board', { board, round: lobby.roundNumber });

      // Start debate timer (180 seconds)
      let timeLeft = 180;
      lobby.debateTimer = setInterval(() => {
        timeLeft--;
        io.to(code).emit('timer_tick', { timeLeft });
        if (timeLeft <= 0) {
          clearInterval(lobby.debateTimer);
          openVoting(code);
        }
      }, 1000);

      console.log(`[BOARD] Round board revealed in ${code}`);
    }

    callback({ success: true });
  });

  // ── FORCE OPEN VOTING (host can skip timer) ──
  socket.on('open_voting', ({ code }) => {
    const lobby = lobbies[code];
    if (!lobby) return;
    if (lobby.hostId !== socket.id) return;
    if (lobby.state !== 'deliberating') return;
    if (lobby.debateTimer) clearInterval(lobby.debateTimer);
    openVoting(code);
  });

  function openVoting(code) {
    const lobby = lobbies[code];
    if (!lobby) return;
    lobby.state = 'voting';
    lobby.votes = {};
    const activePlayers = Object.keys(lobby.players).filter(id => !lobby.players[id].eliminated);
    io.to(code).emit('voting_open', {
      candidates: activePlayers.map(id => ({ id, name: lobby.players[id].name }))
    });
    console.log(`[VOTE] Voting opened in ${code}`);
  }

  // ── CAST VOTE ──
  socket.on('cast_vote', ({ code, targetId }, callback) => {
    const lobby = lobbies[code];
    if (!lobby) return callback({ success: false, error: 'Lobby not found' });
    if (lobby.state !== 'voting') return callback({ success: false, error: 'Not voting phase' });
    if (lobby.players[socket.id]?.eliminated) return callback({ success: false, error: 'Eliminated players cannot vote' });
    if (socket.id === targetId) return callback({ success: false, error: 'Cannot vote for yourself' });

    lobby.votes[socket.id] = targetId;

    const activePlayers = Object.keys(lobby.players).filter(id => !lobby.players[id].eliminated);
    const voteCount = Object.keys(lobby.votes).length;

    io.to(code).emit('vote_progress', {
      voted: voteCount,
      total: activePlayers.length
    });

    // All voted
    if (voteCount >= activePlayers.length) {
      resolveVoting(code);
    }

    callback({ success: true });
  });

  function resolveVoting(code) {
    const lobby = lobbies[code];
    if (!lobby) return;

    // Tally votes
    const tally = {};
    Object.values(lobby.votes).forEach(targetId => {
      tally[targetId] = (tally[targetId] || 0) + 1;
    });

    // Find most voted
    let maxVotes = 0;
    let eliminated = null;
    for (const [id, count] of Object.entries(tally)) {
      if (count > maxVotes) { maxVotes = count; eliminated = id; }
    }

    // Tie check — no elimination on tie
    const tied = Object.values(tally).filter(c => c === maxVotes).length > 1;

    if (tied || !eliminated) {
      lobby.state = 'waiting';
      io.to(code).emit('vote_result', {
        tie: true,
        message: 'It\'s a tie! No one is eliminated. Host can start a new round.',
        tally,
        players: safePlayers(lobby)
      });
      return;
    }

    // Eliminate player
    lobby.players[eliminated].eliminated = true;

    const result = resolveVote(eliminated, lobby.roleMap);

    // Reveal eliminated player's role to all
    const eliminatedRole = lobby.roleMap[eliminated]?.role || 'unknown';

    lobby.state = 'result';

    io.to(code).emit('vote_result', {
      tie: false,
      eliminated: {
        id: eliminated,
        name: lobby.players[eliminated].name,
        role: eliminatedRole
      },
      winner: result.winner,
      message: result.reason,
      tally,
      players: safePlayers(lobby),
      // If game over, reveal all roles
      ...(result.winner && {
        roleReveal: Object.entries(lobby.roleMap).map(([id, r]) => ({
          id,
          name: lobby.players[id]?.name,
          role: r.role
        }))
      })
    });

    console.log(`[RESULT] ${lobby.players[eliminated]?.name} (${eliminatedRole}) eliminated in ${code}. Winner: ${result.winner}`);
  }

  // ── CHAT MESSAGE ──
  socket.on('chat_message', ({ code, message }) => {
    const lobby = lobbies[code];
    if (!lobby) return;
    if (lobby.state !== 'deliberating') return;
    const player = lobby.players[socket.id];
    if (!player || player.eliminated) return;
    const clean = message.slice(0, 200).trim();
    if (!clean) return;
    io.to(code).emit('chat_message', {
      senderId: socket.id,
      senderName: player.name,
      message: clean,
      timestamp: Date.now()
    });
  });

  // ── DISCONNECT ──
  socket.on('disconnect', () => {
    const found = getLobbyBySocket(socket.id);
    if (!found) return;
    const { code, lobby } = found;

    const playerName = lobby.players[socket.id]?.name;
    delete lobby.players[socket.id];

    console.log(`[-] ${playerName} disconnected from ${code}`);

    if (Object.keys(lobby.players).length === 0) {
      delete lobbies[code];
      console.log(`[LOBBY] Deleted empty lobby ${code}`);
      return;
    }

    // Transfer host if host left
    if (lobby.hostId === socket.id) {
      const newHostId = Object.keys(lobby.players)[0];
      lobby.hostId = newHostId;
      lobby.players[newHostId].isHost = true;
      io.to(newHostId).emit('you_are_host', {});
      console.log(`[HOST] Transferred to ${lobby.players[newHostId].name} in ${code}`);
    }

    io.to(code).emit('player_left', {
      name: playerName,
      players: safePlayers(lobby)
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🎮 Imposter Game Server running on port ${PORT}\n`);
});
