// pages/Landing.jsx
import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

export default function Landing({ onEnterGame }) {
  const { socket, connected } = useSocket();
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleCreate() {
    if (!playerName.trim()) return setError('Enter your name first');
    setLoading(true);
    setError('');
    socket.emit('create_lobby', { playerName: playerName.trim() }, (res) => {
      setLoading(false);
      if (res.success) {
        onEnterGame({ code: res.code, playerName: playerName.trim(), isHost: true });
      } else {
        setError(res.error || 'Failed to create lobby');
      }
    });
  }

  function handleJoin() {
    if (!playerName.trim()) return setError('Enter your name first');
    if (!lobbyCode.trim()) return setError('Enter a lobby code');
    setLoading(true);
    setError('');
    socket.emit('join_lobby', { code: lobbyCode.trim().toUpperCase(), playerName: playerName.trim() }, (res) => {
      setLoading(false);
      if (res.success) {
        onEnterGame({ code: res.code, playerName: playerName.trim(), isHost: false });
      } else {
        setError(res.error || 'Failed to join lobby');
      }
    });
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background orbs */}
      <div className="bg-orb w-96 h-96 bg-accent top-[-100px] left-[-100px]" />
      <div className="bg-orb w-80 h-80 bg-coral bottom-[-80px] right-[-80px]" />

      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono tracking-widest uppercase mb-6">
          Social Deduction
        </div>
        <h1 className="font-display text-6xl md:text-8xl font-800 text-white mb-4 leading-none tracking-tight">
          THE<br />
          <span className="text-accent">IMPOSTER</span>
        </h1>
        <p className="font-body text-zinc-400 text-lg max-w-sm mx-auto leading-relaxed">
          Words reveal everything.<br />Trust no one.
        </p>
      </div>

      {/* Connection status */}
      {!connected && (
        <div className="mb-6 px-4 py-2 rounded-full bg-amber/10 border border-amber/20 text-amber text-sm font-mono">
          ⚡ Connecting to server...
        </div>
      )}

      {/* Main card */}
      <div className="card w-full max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Name input — always shown */}
        <div className="mb-5">
          <label className="block text-zinc-400 text-sm font-mono mb-2 uppercase tracking-wider">Your name</label>
          <input
            className="input-field text-lg"
            placeholder="Enter your name..."
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && mode === 'join') handleJoin(); }}
            maxLength={20}
          />
        </div>

        {/* Mode selector */}
        {!mode && (
          <div className="grid grid-cols-2 gap-3">
            <button
              className="btn-primary py-4 text-lg"
              onClick={() => setMode('create')}
              disabled={!connected}
            >
              Create Lobby
            </button>
            <button
              className="btn-secondary py-4 text-lg"
              onClick={() => setMode('join')}
              disabled={!connected}
            >
              Join Lobby
            </button>
          </div>
        )}

        {/* Create mode */}
        {mode === 'create' && (
          <div className="animate-slide-up">
            <button
              className="btn-primary w-full py-4 text-lg mb-3"
              onClick={handleCreate}
              disabled={loading || !connected}
            >
              {loading ? 'Creating...' : '🚀 Create Lobby'}
            </button>
            <button className="btn-secondary w-full" onClick={() => { setMode(null); setError(''); }}>
              Back
            </button>
          </div>
        )}

        {/* Join mode */}
        {mode === 'join' && (
          <div className="animate-slide-up">
            <label className="block text-zinc-400 text-sm font-mono mb-2 uppercase tracking-wider">Lobby code</label>
            <input
              className="input-field text-2xl text-center font-mono tracking-[0.3em] uppercase mb-4"
              placeholder="ABC123"
              value={lobbyCode}
              onChange={e => setLobbyCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
            />
            <button
              className="btn-primary w-full py-4 text-lg mb-3"
              onClick={handleJoin}
              disabled={loading || !connected}
            >
              {loading ? 'Joining...' : '🎮 Join Lobby'}
            </button>
            <button className="btn-secondary w-full" onClick={() => { setMode(null); setError(''); }}>
              Back
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm text-center font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {[
          { role: 'Collective', color: 'teal', desc: 'Find the outsiders' },
          { role: 'Imposter', color: 'coral', desc: 'Blend in, survive' },
          { role: 'Joker', color: 'amber', desc: 'Get caught to win' }
        ].map(r => (
          <div key={r.role} className="card p-3 text-center">
            <div className={`role-badge bg-${r.color}/10 text-${r.color} mb-2 inline-block`}>{r.role}</div>
            <p className="text-zinc-500 text-xs font-body">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
