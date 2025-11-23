// src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';

export default function App() {
  // page state
  const [page, setPage] = useState(localStorage.getItem('token') ? 'feed' : 'login');

  // current user info (id + role + name) — set on login
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage at start (if present)
    const u = localStorage.getItem('user');
    if (u) {
      try { setCurrentUser(JSON.parse(u)); }
      catch { localStorage.removeItem('user'); }
    }
  }, []);

  const onLogin = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setPage('feed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setPage('login');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="font-semibold text-lg">My Social's</div>

          <div className="ml-4 flex gap-3">
            <button onClick={() => setPage('feed')} className="text-sm hover:text-gray-700">Feed</button>
            <button onClick={() => setPage('create')} className="text-sm hover:text-gray-700">Create</button>
            <button onClick={() => setPage('profile')} className="text-sm hover:text-gray-700">Profile</button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="text-sm text-gray-600 hidden sm:block">Signed in as <span className="font-medium">{currentUser.name}</span></div>
                <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded-sm text-sm">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => setPage('login')} className="text-sm">Login</button>
                <button onClick={() => setPage('signup')} className="text-sm">Sign up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="p-6 max-w-3xl mx-auto">
        {page === 'login' && <Login onDone={onLogin} onSignup={() => setPage('signup')} /> }
        {page === 'signup' && <Signup onDone={() => setPage('login')} /> }
        {page === 'feed' && <Feed currentUser={currentUser} /> }
        {page === 'create' && <CreatePost onDone={() => setPage('feed')} currentUser={currentUser} /> }
        {page === 'profile' && <Profile currentUser={currentUser} /> }
      </main>
    </div>
  );
}
