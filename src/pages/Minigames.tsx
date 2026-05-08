import React, { useState } from 'react';
import { Gamepad2, ArrowLeft } from 'lucide-react';

const games = [
  { id: 'snake', title: 'Snake', description: 'Classic snake game. Eat the food to grow.', icon: Gamepad2, bgColor: 'bg-green-500' },
  { id: 'pong', title: 'Pong', description: 'Retro ping pong game against an AI.', icon: Gamepad2, bgColor: 'bg-blue-500' }
];

export const Minigames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame) {
    return (
      <div className="w-full h-full flex flex-col bg-black">
        <div className="p-4 bg-[var(--color-card-bg)] flex items-center gap-4 shadow-md z-10 border-b border-[#0000001a] dark:border-[#ffffff1a]">
          <button 
            onClick={() => setActiveGame(null)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-bold text-xl">{games.find(g => g.id === activeGame)?.title}</h2>
        </div>
        <div className="flex-1 w-full bg-black">
          <iframe 
            src={`/minigames/${activeGame}.html`} 
            className="w-full h-full border-none outline-none"
            title="Minigame"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-5xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-2">Minigames</h1>
      <p className="opacity-70 mb-8">Play solo minigames inside OOGWAY.</p>
      
      <div className="flex flex-col gap-4">
        {games.map(game => {
          const Icon = game.icon;
          return (
            <div key={game.id} className="bg-[var(--color-card-bg)] p-4 rounded-2xl flex items-center justify-between border border-[#0000001a] dark:border-[#ffffff1a] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center shadow-lg ${game.bgColor} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{game.title}</h3>
                  <p className="opacity-70 text-sm mt-1">{game.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveGame(game.id)}
                className="px-6 py-2 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                Play
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
