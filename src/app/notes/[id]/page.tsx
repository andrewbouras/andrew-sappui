"use client";

import { useSession, signIn } from "next-auth/react";
import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import Sidebar from "@/components/component/Sidebar";
import { DisplayNotes } from "@/components/component/display-notes";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SetNumberProvider, SetNumberContext } from "@/components/component/SetNumberContext";
import MCQsComponent from "@/components/component/mcq";
import SimilarQuestionComponent from "@/components/component/SimilarQuestionComponent";
import { LoadingNotes } from '@/components/component/lodingnotes'; // Import the loading component
import { Qload } from "@/components/component/qload"; // Ensure correct import path

interface Note {
  title: string;
  content: string;
  status: string;
  progress: number;
  errorMessage?: string;
}

export default function NotePage() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [note, setNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSimilarQuestions, setShowSimilarQuestions] = useState(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setNumberContext = useContext(SetNumberContext);

  const id = pathname?.split("/").pop();

  useEffect(() => {
    if (status === "authenticated" && id && isAuthenticated) {
      fetchNoteAndMCQs(id, 1);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [id, status, isAuthenticated]);

  const prevStatusRef = useRef(note?.status);

  useEffect(() => {
    if (prevStatusRef.current === "processing" && note?.status === "completed") {
      window.location.reload();
    }
    prevStatusRef.current = note?.status;
  }, [note?.status]);

  const fetchNoteAndMCQs = async (noteId: string, setNum: number) => {
    setLoading(true);
    try {
      const token = user?.accessToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:4000/api";
      const noteResponse = await axios.get(`${apiUrl}/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNote(noteResponse.data.note);

      if (noteResponse.data.note.status !== "completed") {
        fetchTimeoutRef.current = setTimeout(() => {
          fetchNoteAndMCQs(noteId, setNum);
        }, 5000);
        return;
      }

      let params = setNum ? { setNumber: setNum } : {};
      const mcqsResponse = await axios.get(`${apiUrl}/notes/${noteId}/mcqs/responses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });

      if (!setNum && mcqsResponse.data.setNumber === undefined) {
        setNumberContext?.setCurrentSet(1);
      } else if (mcqsResponse.data.setNumber !== setNumberContext?.currentSet) {
        setNumberContext?.setCurrentSet(mcqsResponse.data.setNumber);
      }

      setMcqs(mcqsResponse.data.mcqs || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (title: string, content: string) => {
    try {
      const token = user?.accessToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || "http://localhost:4000/api";
      const response = await axios.put(`${apiUrl}/notes/${id}`, { title, content }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNote(response.data.note);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const toggleSimilarQuestions = () => {
    setShowSimilarQuestions(!showSimilarQuestions);
  };

  if (status === "loading") {
    return <Qload/>;
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <h1 className="text-2xl">Access Denied</h1>
          <button 
            className="mt-4 p-2 bg-blue-500 text-white rounded"
            onClick={() => signIn("google", { callbackUrl: window.location.pathname })}
          >
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
    <SetNumberProvider>
      <div className="flex min-h-screen">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"} flex justify-center items-center`}>
          {note ? (
            <div className="p-6 w-full max-w-5xl">
              <button onClick={toggleSimilarQuestions} className="absolute top-4 left-4 p-2 bg-blue-500 text-white rounded">
                {showSimilarQuestions ? "Hide Similar Questions" : "Show Similar Questions"}
              </button>
              {showSimilarQuestions && <SimilarQuestionComponent />}
              <DisplayNotes initialTitle={note.title} initialContent={note.content} onSave={handleUpdateNote} />
              {note.status === "processing" ? (
                <LoadingNotes progress={note.progress} errorMessage={note.errorMessage} />
              ) : (
                <MCQsComponent mcqs={mcqs} />
              )}
            </div>
          ) : (
            <div>Loading note...</div>
          )}
        </div>
      </div>
    </SetNumberProvider>
  );
}
