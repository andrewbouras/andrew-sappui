'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Sidebar from '@/components/component/Sidebar';
import { DisplayNotes } from '@/components/component/display-notes';
import MCQsComponent from '@/components/component/mcq';
import { Button } from '@/components/ui/button';
import { Qload } from '@/components/component/qload';
import NewChapter from '@/components/component/new';
import { useAuth } from '@/contexts/AuthContext';
import ShareButton from '@/components/component/ShareButton';

interface Chapter {
  _id: string;
  title: string;
  content: string;
}

interface Notebook {
  title: string;
  chapters: Chapter[];
}

export default function NotebookPage() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [loading, setLoading] = useState(false);
  const notebookId = pathname?.split('/').pop();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && notebookId) {
      fetchNotebook(notebookId);
    }
  }, [notebookId, status]);

  const fetchNotebook = async (notebookId: string) => {
    setLoading(true);
    try {
      const token = user?.accessToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
      const response = await axios.get(`${apiUrl}/notebooks/${notebookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotebook(response.data);
    } catch (error) {
      console.error('Failed to load notebook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    router.push(`/notebook/${notebookId}/chapters/${chapter._id}`);
  };

  if (status === 'loading') {
    return <Qload />;
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <h1 className="text-2xl">Access Denied</h1>
          <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={() => signIn('google')}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Qload />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} flex flex-col items-center`}>
        {notebook ? (
          <>
            <h1 className="text-3xl font-bold mt-6 mb-4">{notebook.title}</h1>
            <ShareButton type="notebook" id={notebookId!} />
            <div className="flex w-full">
              <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-1/4' : 'w-1/4'} p-4 bg-gray-100 shadow-lg rounded-lg`}>
                <h2 className="text-2xl font-semibold mb-4">Question Banks</h2>
                <ul>
                  {notebook.chapters.map((chapter) => (
                    <li key={chapter._id} className="p-2 cursor-pointer hover:bg-gray-200 rounded-md" onClick={() => handleChapterClick(chapter)}>
                      {chapter.title}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => setIsCreatingChapter(true)} className="mt-4 w-full">Create New Questions</Button>
              </div>
              <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-3/4' : 'w-full'} p-6`}>
                {selectedChapter ? (
                  <div>
                    <h2 className="text-2xl font-semibold">{selectedChapter.title}</h2>
                    <DisplayNotes initialTitle={selectedChapter.title} initialContent={selectedChapter.content} onSave={() => {}} />
                  </div>
                ) : isCreatingChapter ? (
                  <NewChapter notebookId={notebookId!} />
                ) : (
                  <div>Select a Question Bank to view its content.</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div>Loading notebook...</div>
        )}
      </div>
    </div>
  );
}
