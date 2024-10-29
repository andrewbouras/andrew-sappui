import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

type Notebook = {
  _id: string;
  title: string;
  chapters: { _id: string; title: string; notebookId: string }[];
};

const NotebookCreationComponent = ({
  setShowAddNotebook,
  setNotebooks,
  notebooks,
  initialPdfFile,
}: {
  setShowAddNotebook: (show: boolean) => void;
  setNotebooks: (notebooks: Notebook[]) => void;
  notebooks: Notebook[];
  initialPdfFile?: File;
}) => {
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [selectedNotebook, setSelectedNotebook] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAddNotebook(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowAddNotebook]);

  useEffect(() => {
    if (initialPdfFile) {
      // You can use the file name as the initial chapter title, for example
      setChapterTitle(initialPdfFile.name.replace('.pdf', ''));
    }
  }, [initialPdfFile]);

  const handleAddChapter = async () => {
    if (chapterTitle && (selectedNotebook || newNotebookTitle) && initialPdfFile) {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
          : process.env.NEXT_PUBLIC_API_URL_DEV;

        const token = user?.accessToken;
        
        let notebookId = selectedNotebook;
        
        if (!selectedNotebook) {
          // Create a new notebook if none selected
          const newNotebookResponse = await axios.post(`${apiUrl}/notebooks/new`, { title: newNotebookTitle }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          notebookId = newNotebookResponse.data._id;
          setNotebooks([...notebooks, newNotebookResponse.data]);
        }

        // Create a new chapter
        const chapterResponse = await axios.post(`${apiUrl}/chapters/new`, {
          title: chapterTitle,
          notebookId: notebookId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Upload and process the PDF file
        const formData = new FormData();
        formData.append('file', initialPdfFile);
        formData.append('chapterId', chapterResponse.data._id);

        await axios.post(`${apiUrl}/upload-pdf`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
          },
        });

        setShowAddNotebook(false);
      } catch (error) {
        console.error('Error creating chapter:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 relative" ref={modalRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAddNotebook(false)}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-navy-900 dark:text-white">Create New Chapter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chapterTitle" className="text-navy-900 dark:text-white">Chapter Title</Label>
              <Input
                id="chapterTitle"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="notebookSelect" className="text-navy-900 dark:text-white">Select Notebook</Label>
              <select
                id="notebookSelect"
                value={selectedNotebook}
                onChange={(e) => setSelectedNotebook(e.target.value)}
                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white"
              >
                <option value="">Create New Notebook</option>
                {notebooks.map((notebook) => (
                  <option key={notebook._id} value={notebook._id}>{notebook.title}</option>
                ))}
              </select>
            </div>
            {!selectedNotebook && (
              <div>
                <Label htmlFor="newNotebookTitle" className="text-navy-900 dark:text-white">New Notebook Title</Label>
                <Input
                  id="newNotebookTitle"
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                />
              </div>
            )}
            <Button 
              onClick={handleAddChapter} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Create Chapter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotebookCreationComponent;