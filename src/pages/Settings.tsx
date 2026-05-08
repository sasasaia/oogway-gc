import React from 'react';
import { useTheme } from '../ThemeContext';
import { Moon, Sun, Palette, Droplets } from 'lucide-react';

export const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode, colorTheme, setColorTheme } = useTheme();

  return (
    <div className="p-8 w-full max-w-3xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-[var(--color-card-bg)] rounded-3xl shadow-sm border border-[#0000001a] dark:border-[#ffffff1a] p-8 space-y-8">
        
        {/* Appearance Section */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-[#0000001a] dark:border-[#ffffff1a] pb-2">
            <Moon className="w-5 h-5 opacity-70" />
            Appearance
          </h2>
          
          <div className="flex gap-4">
            <button 
              onClick={() => { if(isDarkMode) toggleDarkMode(); }}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-colors ${!isDarkMode ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[#0000001a] dark:border-[#ffffff1a] opacity-60 hover:opacity-100'}`}
            >
              <Sun className="w-8 h-8" />
              <span className="font-semibold text-sm">Light Mode</span>
            </button>
            <button 
              onClick={() => { if(!isDarkMode) toggleDarkMode(); }}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-colors ${isDarkMode ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[#0000001a] dark:border-[#ffffff1a] opacity-60 hover:opacity-100'}`}
            >
              <Moon className="w-8 h-8" />
              <span className="font-semibold text-sm">Dark Mode</span>
            </button>
          </div>
        </section>

        {/* Color Theme Section */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-[#0000001a] dark:border-[#ffffff1a] pb-2">
            <Palette className="w-5 h-5 opacity-70" />
            Color Theme
          </h2>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setColorTheme('multi')}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-colors ${colorTheme === 'multi' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[#0000001a] dark:border-[#ffffff1a] opacity-60 hover:opacity-100'}`}
            >
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[var(--color-card-bg)]"></div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[var(--color-card-bg)]"></div>
                <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-[var(--color-card-bg)]"></div>
              </div>
              <span className="font-semibold text-sm mt-1">Multi-color Theme</span>
            </button>
            <button 
              onClick={() => setColorTheme('mono')}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-colors ${colorTheme === 'mono' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[#0000001a] dark:border-[#ffffff1a] opacity-60 hover:opacity-100'}`}
            >
              <Droplets className="w-8 h-8 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-sm">Monochrome Theme</span>
            </button>
          </div>
          <p className="mt-4 text-sm opacity-70">
            Multi-color highlights UI elements with vibrant different colors. Monochrome uses refined slate grays.
          </p>
        </section>

      </div>
    </div>
  );
};
