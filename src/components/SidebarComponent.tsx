import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Plus, Settings, Share2, MoreVertical, Trash2, ChevronDown, FileText, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import NotebookCreationComponent from "@/components/NotebookCreationComponent";
import axios from 'axios';
import { useDropzone } from "react-dropzone";
import ChapterCreationComponent from "@/components/ChapterCreationComponent";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

const SidebarComponent = ({
  notebooks,
  setNotebooks,
  questionBanks,
  selectedNotebook,
  setSelectedNotebook,
  deleteNotebook,
  deleteChapter,
  setShowSettings,
  isPremium,
  setIsPremium,
  gradientEffect,
  userRole,
  shareAccess,
  setShareAccess,
  generateShareLink,
  shareLink,
  setShowShareModal,
  setObjectives,
  setSelectedChapter,
  theme,
  setTheme,
}: {
  notebooks: Notebook[];
  setNotebooks: (notebooks: Notebook[]) => void;
  questionBanks: QuestionBank[];
  selectedNotebook: Notebook | null;
  setSelectedNotebook: (notebook: Notebook | null) => void;
  deleteNotebook: (id: string) => void;
  deleteChapter: (notebookId: string, chapterId: string) => void;
  setShowSettings: (show: boolean) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  gradientEffect: boolean;
  userRole: UserRole;
  shareAccess: "admin" | "editor" | "view-only";
  setShareAccess: (access: "admin" | "editor" | "view-only") => void;
  generateShareLink: () => void;
  shareLink: string;
  setShowShareModal: (show: boolean) => void;
  setObjectives: Dispatch<SetStateAction<any[]>>;
  setSelectedChapter: (chapter: { _id: string; title: string; notebookId: string } | null) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [showAddNotebook, setShowAddNotebook] = useState(false);
  const [questionBanksCollapsed, setQuestionBanksCollapsed] = useState(false);
  const [notebooksCollapsed, setNotebooksCollapsed] = useState(false);
  const [expandedNotebooks, setExpandedNotebooks] = useState<{ [key: string]: boolean }>({});
  const [showAddChapter, setShowAddChapter] = useState(false);

  const handleQuestionBankClick = (bankUrl: string) => {
    router.push(`/bank/${bankUrl}`);
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      const token = user?.accessToken;
      await axios.delete(`${apiUrl}/notebooks/${notebookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotebooks(notebooks.filter(notebook => notebook._id !== notebookId));
      if (selectedNotebook?._id === notebookId) {
        setSelectedNotebook(null);
      }
    } catch (error) {
      console.error('Error deleting notebook:', error);
    }
  };

  const toggleNotebookExpansion = (notebookId: string) => {
    setExpandedNotebooks(prev => ({
      ...prev,
      [notebookId]: !prev[notebookId]
    }));
  };

  const handleDeleteQuestionBank = async (bankId: string) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV;

      const token = user?.accessToken;
      await axios.delete(`${apiUrl}/question-banks/${bankId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the state to remove the deleted question bank
      setQuestionBanks(questionBanks.filter(bank => bank._id !== bankId));
    } catch (error) {
      console.error('Error deleting question bank:', error);
    }
  };

  const handleAddChapter = (notebookId: string) => {
    const notebook = notebooks.find(n => n._id === notebookId);
    if (notebook) {
      setSelectedNotebook(notebook);
      setShowAddChapter(true);
    }
  };

  const handleNotebookClick = (notebookId: string) => {
    const notebook = notebooks.find(n => n._id === notebookId);
    if (notebook) {
      setSelectedNotebook(notebook);
      // If you want to navigate to a notebook overview page:
      // router.push(`/notebook/${notebookId}`);
    }
  };

  const handleChapterClick = (notebookId: string, chapterId: string) => {
    router.push(`/notebook/${notebookId}/chapters/${chapterId}`);
  };

  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md h-screen flex flex-col">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Smartify</h1>
        {/* UserStatusButton has been removed from here */}
      </div>

      <ScrollArea className="flex-1">
        {/* Question banks section */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2 cursor-pointer">
            <div className="flex items-center space-x-2" onClick={() => setQuestionBanksCollapsed(!questionBanksCollapsed)}>
              <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${questionBanksCollapsed ? 'rotate-180' : ''}`} />
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Smartify Question Banks</h2>
            </div>
          </div>
          {!questionBanksCollapsed && (
            <div className="space-y-1">
              {questionBanks.map((bank) => (
                <div
                  key={bank._id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors duration-200 group relative"
                  onClick={() => handleQuestionBankClick(bank.bankUrl)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{bank.bankTitle}</span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border border-gray-200">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowShareModal(true);
                            }}
                            className="text-gray-600 hover:bg-gray-50"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Question Bank
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuestionBank(bank._id);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Question Bank
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notebooks section */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2 cursor-pointer">
            <div className="flex items-center space-x-2" onClick={() => setNotebooksCollapsed(!notebooksCollapsed)}>
              <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${notebooksCollapsed ? 'rotate-180' : ''}`} />
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Notebooks</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setShowAddNotebook(true);
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {!notebooksCollapsed && (
            <div className="space-y-1">
              {notebooks.slice().reverse().map((notebook) => (
                <div key={notebook._id} className="mb-2">
                  <div
                    className={`p-2 rounded cursor-pointer transition-colors duration-200 group relative ${
                      selectedNotebook?._id === notebook._id ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => handleNotebookClick(notebook._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${expandedNotebooks[notebook._id] ? 'rotate-180' : ''}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNotebookExpansion(notebook._id);
                          }}
                        />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{notebook.title}</span>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddChapter(notebook._id);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white border border-gray-200">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotebook(notebook);
                                setShowShareModal(true);
                              }}
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Notebook
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotebook(notebook._id);
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Notebook
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  {expandedNotebooks[notebook._id] && notebook.chapters.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {notebook.chapters.map((chapter) => (
                        <div
                          key={chapter._id}
                          className="p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
                          onClick={() => handleChapterClick(notebook._id, chapter._id)}
                        >
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm font-normal">{chapter.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSettings(true)} 
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 w-full justify-start"
        >
          <Settings className="h-5 w-5 mr-2" />
          Settings
        </Button>
      </div>

      {showAddNotebook && (
        <NotebookCreationComponent
          setShowAddNotebook={setShowAddNotebook}
          setNotebooks={setNotebooks}
          notebooks={notebooks}
        />
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
    </div>
  );
};

export default SidebarComponent;