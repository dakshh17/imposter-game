// App.jsx — Main game orchestrator
import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import RoleReveal from './pages/RoleReveal';
import GameBoard from './pages/GameBoard';
import VoteResult from './pages/VoteResult';

// Screens: landing → lobby → role_reveal → game → result → lobby (again)
export default function App() {
  const { socket } = useSocket();
  const [screen, setScreen] = useState('landing');
  const [gameState, setGameState] = useState({
    code: null,
    playerName: null,
    isHost: false,
    roleData: null,       // { role, prompt, category, round }
    players: [],
    voteResult: null,
    category: null,
    round: 1
  });

  // Handle reconnection - go back to landing if disconnected mid-game
  useEffect(() => {
    const onDisconnect = () => {
      if (screen !== 'landing') {
        setScreen('landing');
        setGameState(s => ({ ...s, code: null }));
      }
    };
    socket.on('disconnect', onDisconnect);
    return () => socket.off('disconnect', onDisconnect);
  }, [socket, screen]);

  function handleEnterGame({ code, playerName, isHost }) {
    setGameState(s => ({ ...s, code, playerName, isHost }));
    setScreen('lobby');
  }

  function handleGameStart({ round, category, players }) {
    setGameState(s => ({ ...s, category, round, players }));
    // Screen transitions to role_reveal once role is privately received
  }

  function handleRoleAssigned(roleData) {
    setGameState(s => ({ ...s, roleData }));
    setScreen('role_reveal');
  }

  function handleReady() {
    setScreen('game');
  }

  function handleVoteResult(result) {
    setGameState(s => ({ ...s, voteResult: result }));
    setScreen('result');
  }

  function handlePlayAgain() {
    // Return to lobby — host can start a new game
    setGameState(s => ({ ...s, voteResult: null, roleData: null }));
    setScreen('lobby');
  }

  // Listen for role assignment (private socket event)
  useEffect(() => {
    const onRole = (roleData) => handleRoleAssigned(roleData);
    socket.on('role_assigned', onRole);
    return () => socket.off('role_assigned', onRole);
  }, [socket]);

  return (
    <div className="relative min-h-screen">
      {screen === 'landing' && (
        <Landing onEnterGame={handleEnterGame} />
      )}
      {screen === 'lobby' && (
        <Lobby
          code={gameState.code}
          playerName={gameState.playerName}
          isHost={gameState.isHost}
          onGameStart={handleGameStart}
        />
      )}
      {screen === 'role_reveal' && (
        <RoleReveal
          roleData={gameState.roleData}
          onReady={handleReady}
        />
      )}
      {screen === 'game' && (
        <GameBoard
          code={gameState.code}
          playerName={gameState.playerName}
          isHost={gameState.isHost}
          roleData={gameState.roleData}
          players={gameState.players}
          onVoteResult={handleVoteResult}
        />
      )}
      {screen === 'result' && (
        <VoteResult
          result={gameState.voteResult}
          isHost={gameState.isHost}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
