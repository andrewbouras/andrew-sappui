import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Trash2 } from "lucide-react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Slider } from "@/components/ui/slider";
import { toast } from "react-toastify";

type Notebook = {
  _id: string;
  title: string;
  chapters: { _id: string; title: string; notebookId: string }[];
};

type Objective = {
  id: string;
  text: string;
};

const ChapterCreationComponent = ({
  selectedNotebook,
  setSelectedNotebook,
  notebooks,
  setNotebooks,
  setShowAddChapter,
  onSubmit,
  initialPdfFile,
}: {
  selectedNotebook: Notebook | null;
  setSelectedNotebook: (notebook: Notebook | null) => void;
  notebooks: Notebook[];
  setNotebooks: (notebooks: Notebook[]) => void;
  setShowAddChapter: (show: boolean) => void;
  onSubmit: (submissionData: any) => Promise<void>;
  initialPdfFile?: File | null;
}) => {
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialPdfFile) {
      setPdfFile(initialPdfFile);
      setNewChapterTitle(initialPdfFile.name.replace('.pdf', ''));
    }
  }, [initialPdfFile]);

  const handleSubmit = async () => {
    if (!selectedNotebook || !newChapterTitle || !pdfFile) {
      toast.error("Please provide a chapter title and upload a PDF file.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", newChapterTitle);
      formData.append("notebookId", selectedNotebook._id);

      await onSubmit(formData);
      setShowAddChapter(false);
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast.error("Failed to create chapter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPdfFile(event.target.files[0]);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setPdfFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleFileRemove = () => {
    setPdfFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAddChapter(false)}
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-navy-900 dark:text-white">Add New Chapter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chapterTitle" className="text-navy-900 dark:text-white">
                Chapter Title
              </Label>
              <Input
                id="chapterTitle"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <Label htmlFor="pdfUpload" className="text-navy-900 dark:text-white">
                Upload PDF
              </Label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
              >
                {pdfFile ? (
                  <div className="flex items-center justify-between w-full">
                    <p className="text-gray-600 dark:text-gray-300">{pdfFile.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleFileRemove}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-300">
                      <label
                        htmlFor="pdfUpload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="pdfUpload"
                          name="pdfUpload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              disabled={isLoading || !pdfFile}
            >
              {isLoading ? "Loading..." : "Add Chapter"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-lg">Processing...</div>
        </div>
      )}
    </div>
  );
};

export default ChapterCreationComponent;