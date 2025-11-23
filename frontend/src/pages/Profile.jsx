// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Profile({ currentUser }) {
  const [profile, setProfile] = useState(null); // viewing user's profile
  const [myProfile, setMyProfile] = useState(currentUser);

  useEffect(() => {
    // If already have currentUser, show that; actual implementation may fetch /me
    setMyProfile(currentUser);
    setProfile(currentUser);
  }, [currentUser]);

  const handleBlock = async (userId) => {
    try {
      await api.post(`/users/${userId}/block`);
      alert('Blocked user');
    } catch (err) {
      alert('Block failed');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await api.post(`/users/${userId}/unblock`);
      alert('Unblocked user');
    } catch (err) {
      alert('Unblock failed');
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await api.post(`/users/${userId}/make-admin`);
      alert('User promoted to admin');
    } catch (err) {
      alert('Make admin failed');
    }
  };

  if (!profile) return <div className="max-w-xl mx-auto">Loading...</div>;

  const isMe = myProfile && profile && myProfile.id === profile.id;
  const iBlockedThem = myProfile && myProfile.blockedUsers && profile && myProfile.blockedUsers.includes(profile.id);

  return (
    <div className="max-w-xl mx-auto mt-4">
      <div className="bg-white p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{profile.name || profile.username || 'You'}</div>
            <div className="text-sm text-gray-600">{profile.email || ''}</div>
            <div className="text-xs text-gray-500 mt-1">Role: {profile.role || 'user'}</div>
          </div>

          <div className="flex flex-col gap-2">
            {!isMe && myProfile && (
              <>
                {iBlockedThem ? (
                  <button onClick={() => handleUnblock(profile.id)} className="px-3 py-1 border rounded">Unblock</button>
                ) : (
                  <button onClick={() => handleBlock(profile.id)} className="px-3 py-1 bg-gray-100 rounded">Block</button>
                )}
                { myProfile.role === 'owner' && (
                  <button onClick={() => handleMakeAdmin(profile.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Make Admin</button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          This is your profile. To view another user profile, implement a profile route and fetch /users/:id.
        </div>
      </div>
    </div>
  );
}
