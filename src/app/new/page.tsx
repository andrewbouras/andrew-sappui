'use client';

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Plus, MoreVertical, Share2, X, Copy, Trash2 } from "lucide-react";
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import SidebarComponent from '@/components/SidebarComponent';
import ChapterCreationComponent from '@/components/ChapterCreationComponent';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from 'next/navigation';
import { signin } from "@/components/component/signin"; // Ensure the path is correct

type Notebook = {
  _id: string;
  title: string;
  chapters: { _id: string; title: string; notebookId: string }[];
};

type QuestionBank = {
  _id: string;
  bankTitle: string;
  bankUrl: string;
  isEditor: boolean;
  isCreator: boolean;
};

type UserRole = "admin" | "editor" | "viewer";

type Objective = {
  id: string;
  text: string;
};

export default function Page() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [gradientEffect, setGradientEffect] = useState(false);
  const [shareAccess, setShareAccess] = useState<"admin" | "editor" | "view-only">("view-only");
  const [shareLink, setShareLink] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;
      const token = user?.accessToken;

      try {
        console.log('Token:', token); // Log the token to ensure it's set correctly

        const [planResponse, notebookResponse, bankResponse] = await Promise.all([
          fetch(`${apiUrl}/user/plan`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${apiUrl}/notebooks`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${apiUrl}/user/question-banks`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
        ]);

        const planData = await planResponse.json();
        const notebookData = await notebookResponse.json();
        const bankData = await bankResponse.json();

        setIsPremium(planData.plan === 'premium');
        setNotebooks(notebookData);
        setQuestionBanks(bankData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, user, session]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientEffect(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setObjectives([]);
        setShowShareModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!session) {
    return signin();
  }

  const addNotebook = async () => {
    const title = prompt("Enter the title of the new notebook:");
    if (!title) return;

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      const token = user?.accessToken;
      const response = await axios.post(`${apiUrl}/notebooks/new`, { title }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotebooks([...notebooks, response.data]);
    } catch (error) {
      console.error('Error creating notebook:', error);
    }
  };

  const addChapter = () => {
    setShowAddChapter(true);
  };

  const deleteNotebook = (notebookId: string) => {
    setNotebooks(notebooks.filter((n) => n._id !== notebookId));
    if (selectedNotebook?._id === notebookId) {
      setSelectedNotebook(null);
    }
  };

  const handleDeleteChapter = async (notebookId: string, chapterId: string) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      const token = user?.accessToken;
      await axios.delete(`${apiUrl}/notebooks/${notebookId}/chapters/${chapterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotebooks(notebooks.map(notebook => {
        if (notebook._id === notebookId) {
          return {
            ...notebook,
            chapters: notebook.chapters.filter(chapter => chapter._id !== chapterId),
          };
        }
        return notebook;
      }));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const generateShareLink = () => {
    const link = `https://smartify.app/share/${selectedNotebook?._id}?access=${shareAccess}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
  };

  const handleChapterClick = (notebookId: string, chapterId: string) => {
    router.push(`/notebook/${notebookId}/chapters/${chapterId}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-black">
      <SidebarComponent
        notebooks={notebooks}
        setNotebooks={setNotebooks} // Ensure setNotebooks is passed
        questionBanks={questionBanks}
        selectedNotebook={selectedNotebook}
        setSelectedNotebook={setSelectedNotebook}
        deleteNotebook={deleteNotebook}
        deleteChapter={handleDeleteChapter} // Pass handleDeleteChapter as a prop
        setShowSettings={setShowSettings}
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        gradientEffect={gradientEffect}
        userRole={userRole}
        shareAccess={shareAccess}
        setShareAccess={setShareAccess}
        generateShareLink={generateShareLink}
        shareLink={shareLink}
        setShowShareModal={setShowShareModal}
      />
      {selectedNotebook && (
        <div className="w-full md:w-48 bg-white shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-navy-900">{selectedNotebook.title}</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-navy-900">Chapters</h3>
                <Button variant="ghost" size="icon" onClick={addChapter} className="text-navy-900 hover:text-navy-700 hover:bg-gray-100">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedNotebook.chapters.map((chapter) => (
                <div
                  key={chapter._id}
                  className="mb-1 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200 flex justify-between items-center"
                  onClick={() => handleChapterClick(selectedNotebook._id, chapter._id)}
                >
                  <span>{chapter.title}</span>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareModal(true);
                      }}
                      className="text-navy-900 hover:text-navy-700 hover:bg-gray-200 mr-1"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-navy-900 hover:text-navy-700 hover:bg-gray-200">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDeleteChapter(selectedNotebook._id, chapter._id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {showAddChapter && (
        <ChapterCreationComponent
          selectedNotebook={selectedNotebook}
          setSelectedNotebook={setSelectedNotebook}
          notebooks={notebooks}
          setNotebooks={setNotebooks}
          setShowAddChapter={setShowAddChapter}
          setObjectives={setObjectives}
        />
      )}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white relative" ref={modalRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-navy-900">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your settings will appear here.</p>
              <div className="mt-4">
                <Button
                  onClick={() => setIsPremium(!isPremium)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-colors duration-200"
                >
                  Toggle {isPremium ? "Free" : "Premium"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md bg-white relative" ref={modalRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShareModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-lg">Share {selectedNotebook?.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup value={shareAccess} onValueChange={(value: "admin" | "editor" | "view-only") => setShareAccess(value)}>
                {userRole === "admin" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin access</Label> 
                  </div>
                )}
                {(userRole === "admin" || userRole === "editor") && (
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="editor" id="editor" />
                    <Label htmlFor="editor">Editor access</Label>
                  </div>
                )}
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="view-only" id="view-only" />
                  <Label htmlFor="view-only">View-only access</Label>
                </div>
              </RadioGroup>
              <Button onClick={generateShareLink} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Generate Link
              </Button>
              {shareLink && (
                <div className="flex items-center space-x-2 mt-4">
                  <Input value={shareLink} readOnly className="flex-grow" />
                  <Button size="icon" onClick={() => navigator.clipboard.writeText(shareLink)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}