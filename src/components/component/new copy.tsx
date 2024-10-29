"use client";
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Dropzone, { DropEvent, FileRejection } from 'react-dropzone';
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from '@/contexts/AuthContext';

interface QuestionStyleButtonProps {
  style: string;
  selected: boolean;
  onClick: () => void;
}

const QuestionStyleButton: React.FC<QuestionStyleButtonProps> = ({ style, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`m-1 p-2 rounded-full border-2 ${
        selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'
      } transition-all duration-300`}
    >
      {style}
    </button>
  );
};

const New: React.FC = () => {
  const { toggleTheme } = useTheme();
  const { user } = useAuth();
  const [noteContent, setNoteContent] = useState<string>('');
  const [showQuestionStyles, setShowQuestionStyles] = useState<boolean>(false);
  const [questionStyles, setQuestionStyles] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false);

  const router = useRouter();

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(event.target.value);
  };

  const handleQuestionStyleChange = (value: string) => {
    setQuestionStyles(
      questionStyles.includes(value)
        ? questionStyles.filter(style => style !== value)
        : [...questionStyles, value]
    );
  };

  const handleCustomPromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(event.target.value);
  };

// Modify handleDrop function
const handleDrop = (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
  if (pdfFiles.length + acceptedFiles.length > 5) {
    alert('You can only upload up to 5 files.');
    return;
  }

  const validFiles: File[] = [];
  const fileNames: string[] = [];

  acceptedFiles.forEach(file => {
    const fileType = file.type;

    if (fileType === 'audio/mpeg' || fileType === 'video/mp4' || fileType === 'application/pdf') {
      validFiles.push(file);
      fileNames.push(file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name);
    } else {
      alert('Invalid file type. Please upload an MP3, MP4, or PDF file.');
    }
  });

  setPdfFiles([...pdfFiles, ...validFiles]);
  setUploadedFileNames([...uploadedFileNames, ...fileNames]);
  setUploading(true);
  setTimeout(() => {
    setUploading(false);
    setUploaded(true);
  }, 2000); // Simulating a 2-second upload
};

const handleRemoveFile = (index: number) => {
  const newFiles = [...pdfFiles];
  newFiles.splice(index, 1);
  setPdfFiles(newFiles);

  const newFileNames = [...uploadedFileNames];
  newFileNames.splice(index, 1);
  setUploadedFileNames(newFileNames);

  if (newFiles.length === 0) {
    setUploading(false);
    setUploaded(false);
  }
};

const handleNoteSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (noteContent.length > 8000) {
    alert('Note is too long. Please reduce the size.');
    return;
  }
  setShowQuestionStyles(true);
};

const handleQuestionStylesSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  try {
    const formData = new FormData();
    const noteTitle = noteContent.split(' ').slice(0, 5).join(' '); // Set the title to be the first 5 words of the content
    formData.append('title', noteTitle);
    formData.append('content', noteContent);
    formData.append('questionStyles', JSON.stringify(questionStyles));
    // Check if customPrompt exists, if it does, append it to formData
    if (customPrompt) {
      formData.append('specialInstruction', customPrompt);
  }
    if (pdfFiles.length > 0) {
      pdfFiles.forEach((file, index) => {
        if (file.type === 'application/pdf') {
          formData.append(`pdfs`, file);
        } else if (file.type === 'audio/mpeg') {
          formData.append(`audios`, file);
        } else if (file.type === 'video/mp4') {
          formData.append(`videos`, file);
        }
      });
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';

    const response = await axios.post(`${apiUrl}/notes/new`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${user?.accessToken}` // Add authorization header
      }
    });

    console.log('Note created:', response.data);
    router.push(`/notes/${response.data._id}`); // Navigate to the new note's page
  } catch (error) {
    console.error('Error creating note:', error);
  }
};


  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-white border border-gray-200 rounded-lg shadow-md max-w-2xl mx-auto my-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Create New Note</h1>
        <Toggle aria-label="Toggle dark mode" onClick={toggleTheme}>
          <SunIcon className="w-6 h-6 text-yellow-500" />
        </Toggle>
      </div>
      {!showQuestionStyles ? (
        <form onSubmit={handleNoteSubmit} className="flex flex-col items-center w-full space-y-4">
          <Input
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
            placeholder="Input your custom prompt"
            type="text"
            value={customPrompt}
            onChange={handleCustomPromptChange}
          />
          <textarea
            value={noteContent}
            onChange={handleNoteChange}
            placeholder="Type your note here..."
            rows={10}
            required
            className="w-full min-h-[200px] border border-gray-200 rounded-md focus:ring focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
          ></textarea>
          <Dropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                <input {...getInputProps()} />
                <p className="text-gray-500 dark:text-gray-300">Drag and drop a file here, or click to select a file</p>
                <img src="/path/to/your/upload-icon.png" alt="Upload icon" className="mx-auto mt-2" />
              </div>
            )}
          </Dropzone>
          {uploadedFileNames.map((fileName, index) => (
            <div key={index} className="flex items-center justify-between w-full">
              <Input
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
                value={`PDF: ${fileName}`}
                readOnly
                type="text"
              />
              <div className="flex items-center space-x-2">
                {uploading ? (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-2 border-t-gray-500 animate-spin" />
                  </div>
                ) : uploaded ? (
                  <CheckIcon className="w-6 h-6 text-green-500" />
                ) : null}
                <Button className="ml-4" variant="secondary" onClick={() => handleRemoveFile(index)}>
                  <XIcon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="submit" className="w-full py-2">Next</Button>
        </form>
      ) : (
        <form onSubmit={handleQuestionStylesSubmit} className="flex flex-col items-center w-full space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Select Question Styles</h2>
          <div className="flex flex-wrap justify-center space-x-2">
            {['1st Order', '2nd Order', '3rd Order', 'Vignette', 'MFER (Very Challenging)', 'Inference', 'Analogy', 'Causal Reasoning', 'Hypothetical'].map((style) => (
              <QuestionStyleButton
                key={style}
                style={style}
                selected={questionStyles.includes(style)}
                onClick={() => handleQuestionStyleChange(style)}
              />
            ))}
          </div>
          <Button type="submit" className="w-full py-2">Save</Button>
        </form>
      )}
    </div>
  );
};

function SunIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default New;
