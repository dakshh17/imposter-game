// pages/RoleReveal.jsx
import { useState, useEffect } from 'react';

const ROLE_CONFIG = {
  collective: {
    label: 'The Collective',
    color: 'teal',
    bg: 'bg-teal/10',
    border: 'border-teal/30',
    textColor: 'text-teal',
    icon: '👁',
    tagline: 'Find the outsider. Your words must match.',
    instruction: 'You received the real prompt. Answer it in 1–2 words in the public chat.'
  },
  imposter: {
    label: 'The Imposter',
    color: 'coral',
    bg: 'bg-coral/10',
    border: 'border-coral/30',
    textColor: 'text-coral',
    icon: '🕵️',
    tagline: "Blend in. Don't get caught.",
    instruction: "You have a different prompt. Pick words that seem to fit the group without revealing yourself."
  },
  joker: {
    label: 'The Joker',
    color: 'amber',
    bg: 'bg-amber/10',
    border: 'border-amber/30',
    textColor: 'text-amber',
    icon: '🃏',
    tagline: 'Get yourself eliminated. That's your win.',
    instruction: 'You have no prompt. Say something vague enough to seem suspicious. You win if you get voted out.'
  }
};

export default function RoleReveal({ roleData, onReady }) {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const config = ROLE_CONFIG[roleData?.role] || ROLE_CONFIG.collective;

  function reveal() {
    setRevealed(true);
    // Auto-continue after 8s
    let t = 8;
    setCountdown(t);
    const iv = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 0) { clearInterval(iv); onReady(); }
    }, 1000);
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-orb w-96 h-96 bg-accent top-[-50px] left-[-50px]" />

      <div className="w-full max-w-md text-center animate-slide-up">
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mb-8">
          Round {roleData?.round} · {roleData?.category}
        </p>

        {!revealed ? (
          <div className="card">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="font-display text-3xl font-700 text-white mb-3">Your role is ready</h2>
            <p className="text-zinc-400 font-body mb-8">
              Make sure no one is looking at your screen before revealing.
            </p>
            <button className="btn-primary w-full py-5 text-xl" onClick={reveal}>
              Reveal My Role
            </button>
          </div>
        ) : (
          <div className={`card ${config.bg} border ${config.border} animate-slide-up`}>
            <div className="text-5xl mb-4">{config.icon}</div>
            <div className={`role-badge ${config.bg} ${config.textColor} mb-4 inline-block text-sm`}>
              {config.label}
            </div>
            <p className={`font-display text-xl font-600 ${config.textColor} mb-6`}>
              {config.tagline}
            </p>

            {roleData?.role !== 'joker' && roleData?.prompt && (
              <div className="bg-void/50 border border-border rounded-xl p-4 mb-6">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Your prompt</p>
                <p className="text-white font-display text-xl font-600">{roleData.prompt}</p>
              </div>
            )}

            {roleData?.role === 'joker' && (
              <div className="bg-void/50 border border-amber/20 rounded-xl p-4 mb-6">
                <p className="text-amber text-xs font-mono uppercase tracking-wider mb-2">No prompt assigned</p>
                <p className="text-zinc-300 font-body text-sm">You know nothing — and that's the point.</p>
              </div>
            )}

            <p className="text-zinc-400 font-body text-sm mb-8 leading-relaxed">
              {config.instruction}
            </p>

            <button className="btn-primary w-full py-4" onClick={onReady}>
              I'm ready {countdown !== null && `(${countdown})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
