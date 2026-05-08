import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-base-bg)] p-4">
      <div className="bg-[var(--color-card-bg)] p-8 rounded-3xl shadow-xl w-full max-w-md border border-[#0000001a] dark:border-[#ffffff1a]">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-2xl">O</div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--color-base-text)]">Sign in to OOGWAY</h1>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Username or Email</label>
            <input 
              required
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Password</label>
            <input 
              required
              type="password"
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--color-primary)] outline-none rounded-xl px-4 py-3 transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm opacity-80">
          Don't have an account? <Link to="/register" className="text-[var(--color-primary)] font-semibold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
};
