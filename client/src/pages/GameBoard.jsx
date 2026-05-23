// pages/GameBoard.jsx
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';

export default function GameBoard({
  code, playerName, isHost, roleData, players: initialPlayers,
  onVoteResult
}) {
  const { socket } = useSocket();
  const [phase, setPhase] = useState('submitting'); // submitting | deliberating | voting
  const [word, setWord] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [board, setBoard] = useState([]);
  const [players, setPlayers] = useState(initialPlayers || []);
  const [timeLeft, setTimeLeft] = useState(180);
  const [voteCandidates, setVoteCandidates] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [voteProgress, setVoteProgress] = useState({ voted: 0, total: 0 });
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const myId = socket.id;
  const isEliminated = players.find(p => p.name === playerName)?.eliminated;

  useEffect(() => {
    const onBoard = ({ board }) => {
      setBoard(board);
      setPhase('deliberating');
    };
    const onTimer = ({ timeLeft }) => setTimeLeft(timeLeft);
    const onVotingOpen = ({ candidates }) => {
      setPhase('voting');
      setVoteCandidates(candidates);
    };
    const onVoteProgress = (data) => setVoteProgress(data);
    const onPlayersUpdated = ({ players }) => setPlayers(players);
    const onChat = (msg) => setChat(prev => [...prev, msg]);
    const onVoteResult = (data) => onVoteResult(data);

    socket.on('round_board', onBoard);
    socket.on('timer_tick', onTimer);
    socket.on('voting_open', onVotingOpen);
    socket.on('vote_progress', onVoteProgress);
    socket.on('players_updated', onPlayersUpdated);
    socket.on('chat_message', onChat);
    socket.on('vote_result', onVoteResult);

    return () => {
      socket.off('round_board', onBoard);
      socket.off('timer_tick', onTimer);
      socket.off('voting_open', onVotingOpen);
      socket.off('vote_progress', onVoteProgress);
      socket.off('players_updated', onPlayersUpdated);
      socket.off('chat_message', onChat);
      socket.off('vote_result', onVoteResult);
    };
  }, [socket, onVoteResult]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  function submitWord() {
    if (!word.trim()) return setError('Enter a word');
    socket.emit('submit_word', { code, word: word.trim() }, (res) => {
      if (res.success) { setSubmitted(true); setError(''); }
      else setError(res.error);
    });
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    socket.emit('chat_message', { code, message: chatInput.trim() });
    setChatInput('');
  }

  function castVote(targetId) {
    if (myVote) return;
    setMyVote(targetId);
    socket.emit('cast_vote', { code, targetId }, (res) => {
      if (!res.success) { setMyVote(null); setError(res.error); }
    });
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 py-6">
      <div className="bg-orb w-64 h-64 bg-accent top-0 right-0" />

      {/* Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full mb-6">
        <div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Round {roleData?.round}</p>
          <h2 className="font-display text-2xl font-700 text-white">{roleData?.category}</h2>
        </div>
        <div className={`font-mono text-2xl font-600 ${timeLeft <= 30 && phase === 'deliberating' ? 'timer-danger' : 'text-white'}`}>
          {phase === 'deliberating' ? formatTime(timeLeft) : phase.toUpperCase()}
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col gap-5 flex-1">

        {/* My role reminder */}
        <div className={`px-4 py-3 rounded-xl border text-sm font-mono flex items-center gap-3 ${
          roleData?.role === 'imposter' ? 'bg-coral/10 border-coral/20 text-coral'
          : roleData?.role === 'joker' ? 'bg-amber/10 border-amber/20 text-amber'
          : 'bg-teal/10 border-teal/20 text-teal'
        }`}>
          <span>{roleData?.role === 'joker' ? '🃏' : roleData?.role === 'imposter' ? '🕵️' : '👁'}</span>
          <span className="uppercase tracking-wider">{roleData?.role}</span>
          {roleData?.prompt && <span className="text-zinc-400 ml-auto">· {roleData.prompt}</span>}
          {roleData?.role === 'joker' && <span className="text-zinc-400 ml-auto">· No prompt</span>}
        </div>

        {/* PHASE: Submitting */}
        {phase === 'submitting' && (
          <div className="card animate-slide-up">
            <h3 className="font-display text-xl font-600 mb-2">Submit your word</h3>
            <p className="text-zinc-400 text-sm font-body mb-5">
              {roleData?.role === 'joker'
                ? 'Enter a generic word that seems vaguely related to almost anything.'
                : `Respond to: "${roleData?.prompt}"`}
            </p>
            {!submitted ? (
              <div className="flex gap-3">
                <input
                  className="input-field text-xl font-mono flex-1"
                  placeholder="1–2 words..."
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitWord()}
                  maxLength={30}
                  disabled={isEliminated}
                />
                <button className="btn-primary px-6" onClick={submitWord} disabled={isEliminated}>
                  Submit
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-jade font-mono">
                  <span>✓</span> Word submitted — waiting for others
                </div>
              </div>
            )}
            {error && <p className="text-coral text-sm mt-3 font-mono">{error}</p>}

            {/* Submission progress */}
            <div className="mt-5">
              <p className="text-zinc-500 text-xs font-mono mb-2">
                {players.filter(p => p.hasSubmitted).length} / {players.filter(p => !p.eliminated).length} submitted
              </p>
              <div className="flex flex-wrap gap-2">
                {players.filter(p => !p.eliminated).map(p => (
                  <div key={p.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono border ${
                    p.hasSubmitted ? 'border-jade/30 bg-jade/10 text-jade' : 'border-border bg-surface text-zinc-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.hasSubmitted ? 'bg-jade' : 'bg-zinc-600'}`} />
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHASE: Deliberating */}
        {(phase === 'deliberating' || phase === 'voting') && board.length > 0 && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-600">Round Board</h3>
              {isHost && phase === 'deliberating' && (
                <button
                  className="text-xs font-mono text-zinc-500 hover:text-accent border border-border hover:border-accent px-3 py-1.5 rounded-lg transition-colors"
                  onClick={() => socket.emit('open_voting', { code })}
                >
                  Skip to vote
                </button>
              )}
            </div>
            <div className="space-y-2">
              {board.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface border border-border"
                >
                  <span className="text-zinc-600 font-mono text-sm w-6">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-zinc-400 font-body flex-1">{entry.name}</span>
                  <span className="font-mono text-white font-600 text-lg">{entry.word}</span>
                  {players.find(p => p.id === entry.id)?.eliminated && (
                    <span className="text-xs text-coral font-mono">eliminated</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE: Voting */}
        {phase === 'voting' && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-600">Cast your vote</h3>
              <span className="font-mono text-sm text-zinc-500">
                {voteProgress.voted}/{voteProgress.total} voted
              </span>
            </div>
            <p className="text-zinc-400 text-sm font-body mb-4">
              Vote anonymously. Who do you think is the outlier?
            </p>
            <div className="space-y-2">
              {voteCandidates.filter(c => c.id !== myId).map(c => (
                <button
                  key={c.id}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                    myVote === c.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-surface hover:border-accent/50 text-white'
                  } font-body`}
                  onClick={() => castVote(c.id)}
                  disabled={!!myVote || isEliminated}
                >
                  <span className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-mono">
                    {c.name[0].toUpperCase()}
                  </span>
                  <span className="flex-1 text-left">{c.name}</span>
                  {myVote === c.id && <span className="font-mono text-xs">✓ your vote</span>}
                </button>
              ))}
            </div>
            {!myVote && !isEliminated && (
              <p className="text-zinc-600 text-xs text-center mt-4 font-mono">Tap a player to vote. You cannot change your vote.</p>
            )}
            {myVote && (
              <p className="text-jade text-center text-sm mt-4 font-mono">✓ Vote cast — waiting for others</p>
            )}
          </div>
        )}

        {/* Chat (deliberation phase) */}
        {phase === 'deliberating' && (
          <div className="card flex flex-col animate-slide-up" style={{ minHeight: '240px' }}>
            <h3 className="font-display text-lg font-600 mb-3">Debate</h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-48">
              {chat.length === 0 && (
                <p className="text-zinc-600 text-sm font-mono text-center py-4">Debate opens now — make your case...</p>
              )}
              {chat.map((msg, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className={`font-mono font-600 shrink-0 ${msg.senderName === playerName ? 'text-accent' : 'text-zinc-400'}`}>
                    {msg.senderName}:
                  </span>
                  <span className="font-body text-zinc-300">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {!isEliminated && (
              <div className="flex gap-2">
                <input
                  className="input-field text-sm flex-1"
                  placeholder="Make your case..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  maxLength={200}
                />
                <button className="btn-primary px-4 py-2 text-sm" onClick={sendChat}>Send</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
