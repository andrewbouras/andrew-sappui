'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/component/Sidebar';
import QuestionComponent from '@/components/component/QuestionComponent';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { signin } from "@/components/component/signin";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Shuffle } from "lucide-react";
import ShareButton from "@/components/component/ShareButton";
import { useFocusManagement } from '@/hooks/useFocusManagement';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

type Notebook = {
  _id: string;
  title: string;
  chapters: { _id: string; title: string; notebookId: string }[];
};

type Chapter = {
  _id: string;
  title: string;
  notebookId: string;
};

export default function Page() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRandomized, setIsRandomized] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { data: session, status } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const homeViewRef = useFocusManagement(!selectedChapter);
  const chapterViewRef = useFocusManagement(!!selectedChapter);

  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV;

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user?.accessToken) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/notebooks`, { 
        headers: { Authorization: `Bearer ${user.accessToken}` } 
      });

      setNotebooks(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An error occurred while loading your data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const notebookId = searchParams.get('notebookId');
    const chapterId = searchParams.get('chapterId');

    if (notebookId && chapterId) {
      const notebook = notebooks.find(n => n._id === notebookId);
      if (notebook) {
        setSelectedNotebook(notebook);
        const chapter = notebook.chapters.find(c => c._id === chapterId);
        if (chapter) {
          setSelectedChapter(chapter);
        }
      }
    }
  }, [searchParams, notebooks]);

  const handleChapterClick = useCallback((notebookId: string, chapter: Chapter) => {
    setSelectedChapter(chapter);
    router.push(`/smart?notebookId=${notebookId}&chapterId=${chapter._id}`, undefined, { shallow: true });
  }, [router]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const settingsButton = useMemo(() => (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsRandomized(!isRandomized)}
        className={`text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isRandomized ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        title={isRandomized ? "Randomize Questions (On)" : "Randomize Questions (Off)"}
      >
        <Shuffle className={`h-5 w-5 ${isRandomized ? 'text-blue-500 dark:text-blue-400' : ''}`} />
      </Button>
      {selectedChapter && <ShareButton type="chapter" id={selectedChapter._id} />}
    </div>
  ), [isRandomized, selectedChapter]);

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return signin();
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar
          isPremium={false}
          onDeleteChapter={() => {}}
          onShareChapter={() => {}}
          onOpenNotebookCreation={() => {}}
          onSelectNotebook={(id) => setSelectedNotebook(notebooks.find(n => n._id === id) || null)}
          selectedNotebookId={selectedNotebook?._id}
          notebooks={notebooks}
          onDeleteNotebook={() => {}}
          onShareNotebook={() => {}}
          onChapterClick={handleChapterClick}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          {selectedChapter ? (
            <div ref={chapterViewRef}>
              <QuestionComponent
                fetchUrl={`${apiUrl}/chapter/${selectedChapter._id}/questions`}
                postUrl={`${apiUrl}/questions/${selectedChapter._id}/responses`}
                title={selectedChapter.title}
                settingsButton={settingsButton}
                isRandomized={isRandomized}
                id={selectedChapter._id}
                theme="light"
                onNewSimilarQuestions={() => {}}
              />
            </div>
          ) : (
            <div ref={homeViewRef} className="p-4">
              <h1>Welcome to Smartify</h1>
              <p>Select a chapter to start learning.</p>
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    </TooltipProvider>
  );
}
