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
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Arcade & Games</h1>
          <p className="text-slate-500 font-medium mt-1">Play local games built with pure HTML/JS</p>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0 max-w-full shrink-0">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.url)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                activeGame === game.url ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-violet-200 transform scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 flex items-center justify-center p-2 shadow-inner">
        <iframe 
          src={activeGame} 
          className="w-full h-full border-none rounded-[1.5rem] bg-white shadow-sm"
          title="Mini Game"
        />
      </div>
    </div>
  );
}
