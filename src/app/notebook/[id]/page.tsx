'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Sidebar from '@/components/component/Sidebar';
import { DisplayNotes } from '@/components/component/display-notes';
import { Button } from '@/components/ui/button';
import { Qload } from '@/components/component/qload';
import NewChapter from '@/components/component/new';
import { useAuth } from '@/contexts/AuthContext';
import ShareButton from '@/components/component/ShareButton';
import { useTheme } from 'next-themes';
import { Settings } from 'lucide-react';

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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated && notebookId) {
      fetchNotebook(notebookId);
    }
  }, [notebookId, status, isAuthenticated]);

  const fetchNotebook = async (notebookId: string) => {
    if (!user?.accessToken) {
      console.error("User token not available");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV ;

      const response = await axios.get(`${apiUrl}/notebooks/${notebookId}`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      setNotebook(response.data);
      console.log("Response data", response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to load notebook:', error.message);
      } else {
        console.error('An unknown error occurred:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    router.push(`/notebook/${notebookId}/chapters/${chapter._id}`);
  };

  if (status === 'loading' || loading) {
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

  return (
    <div className="flex min-h-screen relative">
      <Sidebar 
        isPremium={false} // or true, depending on your logic
        onDeleteChapter={async (notebookId, chapterId) => {
          // Implement delete logic here
        }}
        onShareChapter={(notebookId, chapterId) => {
          // Implement share logic here
        }}
      />
      <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-0'} flex flex-col items-center`}>
        {notebook ? (
          <>
            <div className="flex justify-between items-center w-full px-6 py-4">
              <h1 className="text-3xl font-bold">{notebook.title}</h1>
              <ShareButton type="notebook" id={notebookId!} />
            </div>
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
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute bottom-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}
