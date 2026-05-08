import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter text-emerald-500 mb-2">OOGWAY</h1>
          <p className="text-neutral-400">Create a new account</p>
        </div>
        
        {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-sm mb-6 border border-red-500/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">First Name</label>
              <input 
                type="text" 
                name="firstName"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Desired Username</label>
            <input 
              type="text" 
              name="username"
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-neutral-400 text-sm">
          Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
