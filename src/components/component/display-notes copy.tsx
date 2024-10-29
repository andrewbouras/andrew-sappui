"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Dynamically import Quill Editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface DisplayNotesProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => void;
}

export function DisplayNotes({ initialTitle, initialContent, onSave }: DisplayNotesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle || "My Notes");
  const [content, setContent] = useState(initialContent || "No content available");

  const toggleExpand = () => {
    if (!isEditing) {
      setIsExpanded(!isExpanded);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setIsExpanded(true);
    }
  };

  const handleSave = () => {
    onSave(title, content);
    setIsEditing(false);
  };

  return (
    <Card className="w-full bg-white rounded-lg shadow-md">
      <CardHeader className="text-center">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-center text-3xl font-semibold p-2 border-2 border-gray-300 rounded-md"
          />
        ) : (
          <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="relative p-4">
        {isEditing ? (
          <ReactQuill
            value={content}
            onChange={setContent}
            style={{ height: "300px" }}
            className="rounded-md border-gray-300"
          />
        ) : (
          <div className={`prose prose-lg max-w-none mx-auto ${isExpanded ? "max-h-full" : "max-h-40 overflow-hidden"}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} 
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl text-center font-bold mt-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-2" {...props} />,
                p: ({node, ...props}) => <p className="mt-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside ml-6" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside ml-6" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
            {!isExpanded && <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white" />}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 p-4">
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpand}
            className={`${
              isExpanded ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "border border-gray-300 hover:bg-gray-100"
            } rounded-md px-4 py-2`}
          >
            {isExpanded ? "Minimize" : "Expand"}
          </Button>
        )}
        {isEditing ? (
          <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-4 py-2">
            Save
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={toggleEdit}
            className="border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100"
          >
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
