'use client';

import { useSession, signIn } from "next-auth/react";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { usePathname } from "next/navigation";
import QuestionComponent from '@/components/component/QuestionComponent'; 
import ShareButton from '@/components/component/ShareButton';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Shuffle } from "lucide-react";

export default function DynamicPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [isRandomized, setIsRandomized] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const pathParts = pathname?.split("/").filter(Boolean) || [];
  const isChapter = pathParts.includes("chapters");
  const id = pathParts[pathParts.length - 1];

  const [newSimilarQuestionsCount, setNewSimilarQuestionsCount] = useState(0);

  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV;

  const fetchUrl = isChapter 
    ? `${apiUrl}/chapter/${id}/questions`
    : `${apiUrl}/qbank/${id}`;

  const postUrl = isChapter 
    ? `${apiUrl}/questions/${id}/responses`
    : `${apiUrl}/qbank/${id}/response`;

  const handleNewSimilarQuestions = (count: number) => {
    setNewSimilarQuestionsCount((prevCount) => prevCount + count);
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      signIn(); 
      return;
    }

    axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    })
      .then((response: { data: { chapterTitle: string } }) => {
        const chapterTitle = response.data.chapterTitle;
        setTitle(chapterTitle || `Chapter ${id}`);
      })
      .catch((error: any) => {
        console.error("Failed to load title:", error);
      });
  }, [session, status, fetchUrl, id]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // or a loading indicator if you prefer
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const settingsButton = (
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
      <ShareButton type="chapter" id={id} />
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <QuestionComponent 
        fetchUrl={fetchUrl}
        postUrl={postUrl}
        title={title}
        settingsButton={settingsButton}
        isRandomized={isRandomized}
        id={id}
        theme={theme as 'light' | 'dark'}
        onNewSimilarQuestions={handleNewSimilarQuestions}
      />
      {newSimilarQuestionsCount > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
          {newSimilarQuestionsCount} new similar question{newSimilarQuestionsCount > 1 ? 's' : ''} available!
        </div>
      )}
    </div>
  );
}