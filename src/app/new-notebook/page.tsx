// pages/new-notebook.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NewNotebook = () => {
  const [title, setTitle] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {

      const apiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
      : process.env.NEXT_PUBLIC_API_URL_DEV ;
    
      const token = user?.accessToken;
      const response = await axios.post(`${apiUrl}/notebooks/new`, { title }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push(`/notebook/${response.data._id}`);
    } catch (error) {
      console.error('Error creating notebook:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Create New Notebook</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700">Notebook Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
      </form>
    </div>
  );
};

export default NewNotebook;
