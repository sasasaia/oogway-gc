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
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter text-emerald-500 mb-2">OOGWAY</h1>
          <p className="text-neutral-400">Sign in to your account</p>
        </div>
        
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm mb-6 border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Username</label>
            <input 
              type="text" 
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-neutral-400 text-sm">
          Don't have an account? <Link to="/register" className="text-emerald-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
