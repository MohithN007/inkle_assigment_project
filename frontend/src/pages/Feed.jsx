// src/pages/Feed.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Feed({ currentUser }) {
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activities');
      setActs(res.data.activities || []);
    } catch (err) {
      alert('Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const doBlock = async (userId) => {
    try {
      await api.post(`/users/${userId}/block`);
      alert('User blocked');
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Block failed');
    }
  };

  const doUnblock = async (userId) => {
    try {
      await api.post(`/users/${userId}/unblock`);
      alert('User unblocked');
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Unblock failed');
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      alert('Post deleted');
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user? (soft delete)')) return;
    try {
      await api.delete(`/users/${userId}`);
      alert('User deleted');
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const makeAdmin = async (userId) => {
    if (!confirm('Promote this user to admin?')) return;
    try {
      await api.post(`/users/${userId}/make-admin`);
      alert('User promoted to admin');
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Make admin failed');
    }
  };

  const isBlockedByMe = (actorId) => {
    const u = currentUser;
    if (!u) return false;
    return (u.blockedUsers && u.blockedUsers.includes(actorId)) || false;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Activity Feed</h2>
        <button onClick={fetch} className="text-sm bg-gray-200 px-3 py-1 rounded">Refresh</button>
      </div>

      {loading && <div className="text-center text-sm text-gray-500">Loading...</div>}

      <div className="flex flex-col gap-4">
        {acts.length === 0 && !loading && <div className="text-gray-500">No activities yet</div>}

        {acts.map(a => {
          const actorId = a.actor?.id;
          const actorName = a.actor?.name || 'Someone';
          const targetUser = a.targetUser;
          const targetPost = a.targetPost;
          return (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                  <div className="font-medium mt-1">{actorName} — <span className="text-sm text-gray-600">{a.type}</span></div>
                  {targetUser && <div className="text-sm text-gray-600 mt-1">Target: {targetUser.name}</div>}
                  {targetPost && <div className="text-sm text-gray-700 mt-1">Post preview: {targetPost.preview}</div>}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Block / Unblock buttons (only if not self) */}
                  {currentUser && actorId && currentUser.id !== actorId && (
                    <>
                      { /* Determine block state from stored currentUser.blockedUsers if available */ }
                      { (currentUser.blockedUsers && currentUser.blockedUsers.includes(actorId)) ? (
                        <button onClick={() => doUnblock(actorId)} className="px-3 py-1 text-sm border rounded text-gray-700">Unblock</button>
                      ) : (
                        <button onClick={() => doBlock(actorId)} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Block</button>
                      )}
                    </>
                  )}

                  {/* Admin / Owner actions (Delete post / Delete user / Make admin) */}
                  {currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner') && targetPost && (
                    <button onClick={() => deletePost(targetPost.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded">Delete Post</button>
                  )}

                  {currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner') && actorId && (
                    <button onClick={() => deleteUser(actorId)} className="text-sm px-3 py-1 bg-red-500 text-white rounded">Delete User</button>
                  )}

                  {/* Owner-only: promote to admin (if target is a user and not already admin) */}
                  {currentUser && currentUser.role === 'owner' && actorId && (
                    <button onClick={() => makeAdmin(actorId)} className="text-sm px-3 py-1 bg-indigo-600 text-white rounded">Make Admin</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
