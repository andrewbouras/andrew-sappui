'use client';

import React, { FC, ReactNode, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Dropzone, { DropEvent, FileRejection } from 'react-dropzone';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface QuestionTypeButtonProps {
  type: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}

const QuestionTypeButton: React.FC<QuestionTypeButtonProps> = ({ type, count, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`m-1 p-2 rounded-full border-2 ${
        selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'
      } transition-all duration-300`}
    >
      {type} ({count})
    </button>
  );
};

interface NewChapterProps {
  notebookId: string;
}

const NewChapter: FC<NewChapterProps> = ({ notebookId }): ReactNode => {
  const { user } = useAuth();
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [chapterContent, setChapterContent] = useState<string>('');
  const [showQuestionStyles, setShowQuestionStyles] = useState<boolean>(false);
  const [questionStyles, setQuestionStyles] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [questionCounts, setQuestionCounts] = useState<{ large: number; medium: number; small: number }>({ large: 0, medium: 0, small: 0 });
  const [ocrContent, setOcrContent] = useState<string>('');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('');
  const [selectedQuestionStyle, setSelectedQuestionStyle] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(0);
  const [strategicMode, setStrategicMode] = useState<boolean>(false);

  const router = useRouter();

  const handleChapterTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChapterTitle(event.target.value);
  };

  const handleChapterContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setChapterContent(event.target.value);
  };

  const handleQuestionStyleChange = (value: string) => {
    setQuestionStyles(
      questionStyles.includes(value)
        ? questionStyles.filter(style => style !== value)
        : [...questionStyles, value]
    );
  };

  const handleDrop = (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
    if (pdfFiles.length + acceptedFiles.length > 5) {
      alert('You can only upload up to 5 files.');
      return;
    }

    const validFiles: File[] = [];
    const fileNames: string[] = [];

    acceptedFiles.forEach(file => {
      const fileType = file.type;

      if (fileType === 'application/pdf') {
        validFiles.push(file);
        fileNames.push(file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name);
      } else {
        alert('Invalid file type. Please upload a PDF file.');
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

  const handleNext = async () => {
    setLoading(true);
    try {
      let response;
      if (pdfFiles.length > 0) {
        const formData = new FormData();
        formData.append('file', pdfFiles[0]);
        response = await axios.post('https://mcqgen-942718354644.us-central1.run.app/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post('http://localhost:5000/process_notes', {
          content: chapterContent,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { content, summary } = response.data;
      setQuestionCounts({ large: summary.Large.count, medium: summary.Medium.count, small: summary.Small.count });
      setOcrContent(content);
      setLoading(false);
      setShowQuestionStyles(true);
    } catch (error) {
      console.error('Error processing notes:', error);
      alert('Error processing notes. Please try again.');
      setLoading(false);
    }
  };

  const handleQuestionStylesSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
      : process.env.NEXT_PUBLIC_API_URL_DEV ;
    
      const token = user?.accessToken;

      const questionCount = selectedQuestionType === 'Large' ? questionCounts.large : selectedQuestionType === 'Medium' ? questionCounts.medium : questionCounts.small;

      const response = await axios.post(`${apiUrl}/notebooks/${notebookId}/chapters/new`, {
        title: chapterTitle,
        questionType: selectedQuestionType,
        questionStyle: selectedQuestionStyle,
        ocr_content: ocrContent,
        numberOfQuestions: questionCount,
        strategicMode: strategicMode ? 'on' : 'off'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data._id) {
        router.push(`/notebook/${notebookId}/chapters/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 bg-white border border-gray-200 rounded-lg shadow-md max-w-2xl mx-auto my-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Add Chapter</h1>
      </div>
      {!showQuestionStyles ? (
        <>
          <Input
            className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
            placeholder="Chapter Title"
            type="text"
            value={chapterTitle}
            onChange={handleChapterTitleChange}
            required
          />
          <Dropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                <input {...getInputProps()} />
                <p className="text-gray-500 dark:text-gray-300">Drag and drop a file here, or click to select a file</p>
                <img src="https://www.svgrepo.com/show/506113/attachment.svg" alt="Upload icon" className="w-10 h-10 mr-2" />
              </div>
            )}
          </Dropzone>
          {uploadedFileNames.map((fileName, index) => (
            <div key={index} className="flex items-center justify-between w-full">
              <Input
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
                value={`File: ${fileName}`}
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
          <textarea
            value={chapterContent}
            onChange={handleChapterContentChange}
            placeholder="Type your chapter content here..."
            rows={10}
            required
            className="w-full min-h-[200px] border border-gray-200 rounded-md focus:ring focus:ring-opacity-50 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-200"
          ></textarea>
          <Button onClick={handleNext} className="w-full py-2">Next</Button>
        </>
      ) : (
        <form onSubmit={handleQuestionStylesSubmit} className="flex flex-col items-center w-full space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Select Question Types</h2>
          <div className="flex flex-wrap justify-center space-x-2">
            {['Large', 'Medium', 'Small'].map((type, index) => (
              <QuestionTypeButton
                key={type}
                type={type}
                count={Object.values(questionCounts)[index]}
                selected={selectedQuestionType === type}
                onClick={() => setSelectedQuestionType(type)}
              />
            ))}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Select Question Styles</h2>
          <div className="flex flex-wrap justify-center space-x-2">
            {['Simple', 'Complex'].map((style) => (
              <QuestionStyleButton
                key={style}
                style={style}
                selected={selectedQuestionStyle === style}
                onClick={() => setSelectedQuestionStyle(style)}
              />
            ))}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Strategic Mode</h2>
          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={() => setStrategicMode(false)}
              className={`m-1 p-2 rounded-full border-2 ${
                !strategicMode ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'
              } transition-all duration-300`}
            >
              Off
            </button>
            <button
              type="button"
              onClick={() => setStrategicMode(true)}
              className={`m-1 p-2 rounded-full border-2 ${
                strategicMode ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'
              } transition-all duration-300`}
            >
              On
            </button>
          </div>
          <Button type="submit" className="w-full py-2">Submit</Button>
        </form>
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
          <div className="w-16 h-16 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};


const SunIcon: FC<{ className: string }> = ({ className }) => (
  <svg
    className={className}
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

const CheckIcon: FC<{ className: string }> = ({ className }) => (
  <svg
    className={className}
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

const XIcon: FC<{ className: string }> = ({ className }) => (
  <svg
    className={className}
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

export default NewChapter;
