"use client";

import { useSession, signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import Sidebar from '@/components/component/Sidebar';
import { DisplayNotes } from '@/components/component/display-notes';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Note {
  title: string;
  content: string;
}

export default function NotePage() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const id = pathname?.split('/').pop(); // Extract the id from the pathname

  useEffect(() => {
    if (status === "authenticated" && id && isAuthenticated) {
      fetchNote();
    }
  }, [id, status, isAuthenticated]);

  const fetchNote = async () => {
    try {
      const token = user?.accessToken;
      console.log("Fetching note with token:", token);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      const response = await axios.get(`${apiUrl}/notes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Fetched note:", response.data.note);
      setNote(response.data.note); // Make sure to access the correct level of the response object
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const handleUpdateNote = async (title: string, content: string) => {
    try {
      const token = user?.accessToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      console.log("Updating note with id:", id, "title:", title, "content:", content);
      const response = await axios.put(`${apiUrl}/notes/${id}`, { title, content }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Updated note:", response.data.note);
      setNote(response.data.note); // Update the note with the new data
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <h1 className="text-2xl">Access Denied</h1>
          <button 
            className="mt-4 p-2 bg-blue-500 text-white rounded"
            onClick={() => signIn("google", { callbackUrl: window.location.pathname })}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} flex justify-center items-center`}>
        {note ? (
          <div className="p-6 w-full max-w-5xl">
            <DisplayNotes initialTitle={note.title} initialContent={note.content} onSave={handleUpdateNote} />
          </div>
        ) : (
          <div>Loading note...</div>
        )}
      </div>
    </div>
  );
}
