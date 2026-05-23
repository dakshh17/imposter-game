// pages/VoteResult.jsx

const WINNER_CONFIG = {
  collective: {
    headline: 'Collective Wins!',
    emoji: '🏆',
    color: 'teal',
    bg: 'bg-teal/10',
    border: 'border-teal/30',
    textColor: 'text-teal'
  },
  imposter: {
    headline: 'Imposters Win!',
    emoji: '🕵️',
    color: 'coral',
    bg: 'bg-coral/10',
    border: 'border-coral/30',
    textColor: 'text-coral'
  },
  joker: {
    headline: 'Joker Wins!',
    emoji: '🃏',
    color: 'amber',
    bg: 'bg-amber/10',
    border: 'border-amber/30',
    textColor: 'text-amber'
  },
  null: {
    headline: 'Round Over',
    emoji: '⚔️',
    color: 'accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    textColor: 'text-accent'
  }
};

const ROLE_COLORS = {
  collective: 'text-teal',
  imposter: 'text-coral',
  joker: 'text-amber'
};

export default function VoteResult({ result, isHost, onPlayAgain }) {
  const config = WINNER_CONFIG[result.winner] || WINNER_CONFIG.null;

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-orb w-96 h-96 bg-accent top-0 left-0" />
      <div className={`bg-orb w-80 h-80 ${result.winner === 'collective' ? 'bg-teal' : result.winner === 'imposter' ? 'bg-coral' : 'bg-amber'} bottom-0 right-0`} />

      <div className="w-full max-w-lg text-center animate-slide-up">

        {/* Tie result */}
        {result.tie ? (
          <div className="card mb-6">
            <div className="text-5xl mb-4">⚔️</div>
            <h2 className="font-display text-4xl font-800 text-white mb-3">It's a Tie!</h2>
            <p className="text-zinc-400 font-body">{result.message}</p>
          </div>
        ) : (
          <>
            {/* Elimination reveal */}
            <div className="card mb-4 animate-slide-up">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-3">Eliminated</p>
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-display text-2xl font-700">
                  {result.eliminated?.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-display text-2xl font-700 text-white">{result.eliminated?.name}</p>
                  <span className={`role-badge ${
                    result.eliminated?.role === 'imposter' ? 'bg-coral/10 text-coral' :
                    result.eliminated?.role === 'joker' ? 'bg-amber/10 text-amber' :
                    'bg-teal/10 text-teal'
                  } mt-1 inline-block`}>
                    {result.eliminated?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Winner banner */}
            {result.winner && (
              <div className={`card ${config.bg} border ${config.border} mb-4 animate-slide-up`} style={{ animationDelay: '0.15s' }}>
                <div className="text-5xl mb-3">{config.emoji}</div>
                <h2 className={`font-display text-4xl font-800 ${config.textColor} mb-2`}>{config.headline}</h2>
                <p className="text-zinc-400 font-body">{result.message}</p>
              </div>
            )}

            {/* Role reveal (game over) */}
            {result.roleReveal && (
              <div className="card mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-display text-lg font-600 mb-4">All Roles Revealed</h3>
                <div className="space-y-2">
                  {result.roleReveal.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface border border-border">
                      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-mono">
                        {p.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="flex-1 font-body text-white">{p.name}</span>
                      <span className={`role-badge ${
                        p.role === 'imposter' ? 'bg-coral/10 text-coral' :
                        p.role === 'joker' ? 'bg-amber/10 text-amber' :
                        'bg-teal/10 text-teal'
                      }`}>{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vote tally */}
            {result.tally && Object.keys(result.tally).length > 0 && (
              <div className="card mb-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <h3 className="font-display text-base font-600 mb-3 text-zinc-400">Vote Tally</h3>
                <div className="space-y-2">
                  {Object.entries(result.tally)
                    .sort(([, a], [, b]) => b - a)
                    .map(([id, count]) => {
                      const player = result.players?.find(p => p.id === id);
                      return (
                        <div key={id} className="flex items-center gap-3">
                          <span className="font-body text-zinc-300 flex-1 text-sm">{player?.name || id}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: count }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-accent" />
                            ))}
                          </div>
                          <span className="font-mono text-sm text-zinc-500 w-4">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Continue / end */}
        {isHost && (
          <button className="btn-primary w-full py-4 text-lg animate-slide-up" style={{ animationDelay: '0.3s' }} onClick={onPlayAgain}>
            {result.winner ? 'Play Again' : 'Next Round'}
          </button>
        )}
        {!isHost && (
          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <span className="text-zinc-400 font-body">Waiting for host to continue...</span>
          </div>
        )}
      </div>
    </div>
  );
}
