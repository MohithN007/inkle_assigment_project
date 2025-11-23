// src/pages/Login.jsx
import React, { useState } from 'react';
import api from '../api/axios';

export default function Login({ onDone, onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });

      // backend returns { token, user }
      const { token, user } = res.data;
      if (!token) return alert('Login failed');

      localStorage.setItem('token', token);
      // store user object locally (id,name,role)
      localStorage.setItem('user', JSON.stringify(user));

      if (onDone) onDone(user); // notify App of logged in user
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Login</h2>

      <input className="border p-2 w-full mb-3 rounded" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" className="border p-2 w-full mb-3 rounded" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />

      <button onClick={handleLogin} className="bg-blue-600 text-white p-2 rounded w-full">Login</button>

      <div className="mt-3 text-center">
        <button onClick={onSignup} className="text-sm text-blue-600">Create account</button>
      </div>
    </div>
  );
}
