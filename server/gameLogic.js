// gameLogic.js — Role assignment, win condition checks

const prompts = require('./prompts');

/**
 * Assigns roles based on player count
 * Rules:
 *   3–6 players  → 1 imposter, 0 jokers
 *   7–9 players  → 2 imposters, 1 joker
 *   10–14 players → 3 imposters, 1 joker
 *   15+ players  → +1 imposter per 5 extra beyond 10, 1 joker always
 */
function getRoleCounts(n) {
  if (n < 3) throw new Error('Minimum 3 players required');
  let imposters = 1;
  let jokers = 0;

  if (n >= 7 && n <= 9)  { imposters = 2; jokers = 1; }
  else if (n >= 10 && n <= 14) { imposters = 3; jokers = 1; }
  else if (n >= 15) {
    imposters = 3 + Math.floor((n - 10) / 5);
    jokers = 1;
  }

  return { imposters, jokers, collective: n - imposters - jokers };
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Assign roles to players and return role map + prompt info
 */
function assignRoles(playerIds) {
  const n = playerIds.length;
  const { imposters, jokers } = getRoleCounts(n);

  const shuffled = shuffle(playerIds);
  const roleMap = {};

  // Pick a random prompt pair
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  shuffled.forEach((id, i) => {
    if (i < imposters) {
      roleMap[id] = { role: 'imposter', prompt: prompt.imposter, category: prompt.category };
    } else if (i < imposters + jokers) {
      roleMap[id] = { role: 'joker', prompt: null, category: null };
    } else {
      roleMap[id] = { role: 'collective', prompt: prompt.collective, category: prompt.category };
    }
  });

  return { roleMap, promptId: prompt.id, category: prompt.category };
}

/**
 * Determine winner after a vote
 * Returns: { winner: 'collective'|'imposter'|'joker', reason: string }
 */
function resolveVote(eliminatedPlayer, players) {
  const role = players[eliminatedPlayer]?.role;

  if (role === 'joker') {
    return { winner: 'joker', reason: 'The Joker was eliminated — Joker wins!' };
  }

  if (role === 'imposter') {
    // Check if all imposters are eliminated
    const remainingImposters = Object.values(players).filter(
      p => p.role === 'imposter' && !p.eliminated
    );
    if (remainingImposters.length === 0) {
      return { winner: 'collective', reason: 'All Imposters eliminated — Collective wins!' };
    }
    return { winner: null, reason: 'One Imposter eliminated. Game continues.' };
  }

  // Collective member was eliminated
  return { winner: 'imposter', reason: 'An innocent was eliminated — Imposters win!' };
}

module.exports = { assignRoles, getRoleCounts, resolveVote };
