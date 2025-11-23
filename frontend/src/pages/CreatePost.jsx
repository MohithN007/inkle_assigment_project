import React, { useState } from 'react';
import api from '../api/axios';

export default function CreatePost({ onDone }) {
  const [content, setContent] = useState('');

  const submit = async () => {
    try {
      await api.post('/posts', { content });
      setContent('');
      onDone();
    } catch (err) {
      alert('Error creating post');
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md max-w-xl mx-auto mt-4">
      <textarea
        className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:ring focus:ring-blue-100"
        rows="4"
        placeholder="Write something..."
        value={content}
        onChange={e=>setContent(e.target.value)}
      />

      <button
        onClick={submit}
        className="btn-primary w-full mt-3"
      >
        Post
      </button>
    </div>
  );
}
