# 🎮 The Imposter — Social Deduction Word Game

A real-time browser-based social deduction game with lobbies, private role DMs, live voting, and the Joker mechanic.

## Roles
- **Collective** — get the real prompt, answer it, find the outlier
- **Imposter** — get a different prompt, blend in, survive votes
- **Joker** — no prompt, must get voted out to win

## Role counts
| Players | Imposters | Jokers |
|---------|-----------|--------|
| 3–6     | 1         | 0      |
| 7–9     | 2         | 1      |
| 10–14   | 3         | 1      |
| 15+     | scales    | 1      |

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Deploy**: Vercel (frontend) + Railway (backend)

## Quick Start
See `DEPLOYMENT_GUIDE.txt` for full step-by-step instructions.

```bash
# Backend
cd server && npm install && node index.js

# Frontend (new terminal)
cd client && npm install && npm run dev
```
"# imposter-game" 
