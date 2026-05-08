import { useState } from 'react';

export default function MiniGames() {
  const games = [
    { id: 'snake', name: 'Snake Game', url: '/games/snake/index.html' },
    { id: 'tictactoe', name: 'Tic Tac Toe', url: '/games/tictactoe/index.html' },
  ];

  const [activeGame, setActiveGame] = useState(games[0].url);

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mini Games</h1>
          <p className="text-neutral-400 text-sm">Powered by pure HTML, CSS, and JS files</p>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 max-w-full shrink-0">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.url)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeGame === game.url ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center p-0.5">
        <iframe 
          src={activeGame} 
          className="w-full h-full border-none rounded-xl bg-white"
          title="Mini Game"
        />
      </div>
    </div>
  );
}
