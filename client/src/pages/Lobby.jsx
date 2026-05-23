// pages/Lobby.jsx
import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

export default function Lobby({ code, playerName, isHost: initialIsHost, onGameStart }) {
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(initialIsHost);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const onPlayers = ({ players }) => setPlayers(players);
    const onGameStarted = ({ round, category, players }) => {
      onGameStart({ round, category, players });
    };
    const onPlayerLeft = ({ name, players }) => {
      setPlayers(players);
    };
    const onYouAreHost = () => setIsHost(true);

    socket.on('players_updated', onPlayers);
    socket.on('game_started', onGameStarted);
    socket.on('player_left', onPlayerLeft);
    socket.on('you_are_host', onYouAreHost);

    return () => {
      socket.off('players_updated', onPlayers);
      socket.off('game_started', onGameStarted);
      socket.off('player_left', onPlayerLeft);
      socket.off('you_are_host', onYouAreHost);
    };
  }, [socket, onGameStart]);

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startGame() {
    if (players.length < 3) return setError('Need at least 3 players to start');
    setStarting(true);
    setError('');
    socket.emit('start_game', { code }, (res) => {
      setStarting(false);
      if (!res.success) setError(res.error || 'Failed to start');
    });
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-orb w-80 h-80 bg-accent top-0 right-0" />

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-2">Waiting Room</p>
          <h2 className="font-display text-4xl font-700 text-white mb-6">Share the code</h2>

          {/* Code display */}
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-3 bg-surface border border-border hover:border-accent rounded-2xl px-8 py-4 transition-all duration-200 group animate-glow"
          >
            <span className="font-mono text-4xl font-600 text-accent tracking-[0.2em]">{code}</span>
            <span className="text-zinc-500 group-hover:text-accent transition-colors text-sm font-mono">
              {copied ? '✓ copied' : 'tap to copy'}
            </span>
          </button>
        </div>

        {/* Players list */}
        <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-600">Players</h3>
            <span className="font-mono text-sm text-zinc-500">
              {players.length} / 20
              {players.length < 3 && <span className="text-amber ml-2">· need {3 - players.length} more</span>}
            </span>
          </div>

          <div className="space-y-2">
            {players.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-mono text-sm font-600">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="font-body text-white flex-1">{p.name}</span>
                {p.isHost && (
                  <span className="role-badge bg-amber/10 text-amber">Host</span>
                )}
                {p.name === playerName && (
                  <span className="text-zinc-500 text-xs font-mono">you</span>
                )}
              </div>
            ))}

            {players.length === 0 && (
              <div className="text-center text-zinc-600 py-4 font-mono text-sm">
                Waiting for players...
              </div>
            )}
          </div>
        </div>

        {/* Start button */}
        {isHost && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              className="btn-primary w-full py-5 text-xl"
              onClick={startGame}
              disabled={players.length < 3 || starting}
            >
              {starting ? 'Starting...' : `Start Game (${players.length} players)`}
            </button>
            {players.length < 3 && (
              <p className="text-center text-zinc-500 text-sm mt-3 font-mono">
                Minimum 3 players required
              </p>
            )}
          </div>
        )}

        {!isHost && (
          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-2 text-zinc-400 font-body">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              Waiting for host to start the game...
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm text-center font-mono">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
