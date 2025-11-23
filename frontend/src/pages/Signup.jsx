import React, { useState } from 'react';
import api from '../api/axios';

export default function Signup({ onDone }) {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const handleSignup = async () => {
    try {
      await api.post('/auth/signup', { name, email, password });
      alert('Account created!');
      onDone();
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4">Create Account</h2>

      <input className="input-box" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="input-box" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="input-box" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />

      <button onClick={handleSignup} className="btn-primary w-full">
        Sign Up
      </button>
    </div>
  );
}
