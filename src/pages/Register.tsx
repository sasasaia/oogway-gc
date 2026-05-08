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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans py-12">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl shadow-violet-100/50 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-40 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-100 rounded-full blur-3xl opacity-40 pointer-events-none translate-y-1/3 -translate-x-1/2"></div>
        
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-3">OOGWAY</h1>
          <p className="text-slate-500 font-medium">Join the coolest community!</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm mb-6 border border-red-100 font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">First Name</label>
              <input 
                type="text" 
                name="firstName"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Po"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Panda"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Desired Username</label>
            <input 
              type="text" 
              name="username"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
              value={formData.username}
              onChange={handleChange}
              placeholder="dragonwarrior"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-200 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mt-2 text-lg"
          >
            {loading ? 'Creating...' : 'Let\'s Go!'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-500 font-medium relative z-10">
          Already got an account? <Link to="/login" className="text-violet-600 hover:text-fuchsia-500 hover:underline transition-colors font-bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
