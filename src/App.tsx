/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.js';
import Home from './pages/Home.js';
import Activities from './pages/Activities.js';
import MiniGames from './pages/MiniGames.js';
import Messages from './pages/Messages.js';
import Profile from './pages/Profile.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: number, firstName: string, lastName: string, username: string, avatarUrl: string } | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Home user={user!} />} />
          <Route path="/activities" element={<Activities user={user!} />} />
          <Route path="/minigames" element={<MiniGames />} />
          <Route path="/messages" element={<Messages user={user!} />} />
          <Route path="/profile" element={<Profile user={user!} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

