import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl shadow-violet-100/50 border border-slate-100 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-3">OOGWAY</h1>
          <p className="text-slate-500 font-medium">Jump back into the fun!</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm mb-6 border border-red-100 font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
              placeholder="e.g. dragonwarrior"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mt-2 text-lg"
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-500 font-medium relative z-10">
          New around here? <Link to="/register" className="text-violet-600 hover:text-fuchsia-500 hover:underline transition-colors font-bold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
