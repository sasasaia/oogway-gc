import { useState, useEffect } from 'react';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';

export default function Settings() {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'system');
  const [colorTheme, setColorTheme] = useState(localStorage.getItem('colorTheme') || 'violet');

  useEffect(() => {
    // Apply changes
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('colorTheme', colorTheme);

    const isDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    document.documentElement.setAttribute('data-color', colorTheme);
  }, [themeMode, colorTheme]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-800">Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Customize your Oogway experience</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Monitor className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-800">Appearance</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Theme Mode</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setThemeMode('light')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                  themeMode === 'light' ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="font-bold text-sm">Light</span>
              </button>
              <button 
                onClick={() => setThemeMode('dark')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                  themeMode === 'dark' ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="font-bold text-sm">Dark</span>
              </button>
              <button 
                onClick={() => setThemeMode('system')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                  themeMode === 'system' ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <Monitor className="w-6 h-6" />
                <span className="font-bold text-sm">System</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Color Palette</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setColorTheme('violet')}
                className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] border-4 transition-all ${
                  colorTheme === 'violet' ? 'border-white ring-4 ring-violet-500 shadow-lg scale-110' : 'border-transparent hover:scale-105 shadow-sm opacity-80 hover:opacity-100'
                }`}
                title="Violet & Fuchsia"
              />
              <button 
                onClick={() => setColorTheme('emerald')}
                className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#10b981] to-[#0ea5e9] border-4 transition-all ${
                  colorTheme === 'emerald' ? 'border-white ring-4 ring-emerald-500 shadow-lg scale-110' : 'border-transparent hover:scale-105 shadow-sm opacity-80 hover:opacity-100'
                }`}
                title="Emerald & Sky"
              />
              <button 
                onClick={() => setColorTheme('rose')}
                className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#f43f5e] to-[#f97316] border-4 transition-all ${
                  colorTheme === 'rose' ? 'border-white ring-4 ring-rose-500 shadow-lg scale-110' : 'border-transparent hover:scale-105 shadow-sm opacity-80 hover:opacity-100'
                }`}
                title="Rose & Orange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
