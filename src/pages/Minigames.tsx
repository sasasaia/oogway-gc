import React from 'react';
import { Gamepad2 } from 'lucide-react';

const games = [
  { id: '1', title: 'Orbital Strike', description: 'Defend the Orb from incoming asteroids.', icon: Gamepad2, bgColor: 'bg-indigo-500' },
  { id: '2', title: 'Cosmic Connect', description: 'Match 3 celestial bodies to score points.', icon: Gamepad2, bgColor: 'bg-pink-500' },
  { id: '3', title: 'Neon Racing', description: 'Fast-paced racing through neon circuits.', icon: Gamepad2, bgColor: 'bg-emerald-500' }
];

export const Minigames: React.FC = () => {
  return (
    <div className="p-8 w-full max-w-5xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-2">Minigames</h1>
      <p className="opacity-70 mb-8">Play solo minigames inside Orb.</p>
      
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
              <button className="px-6 py-2 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                Play
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
