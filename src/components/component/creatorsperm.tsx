// components/CreatorsPerm.tsx
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Define custom toolbar options
const modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

const initialQuestions = [
  { id: 1, question: '', options: ['', '', ''], explanation: '' },
];

export const CreatorsPerm: React.FC = () => {
  const [questions, setQuestions] = useState(initialQuestions);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: '',
      options: ['', '', ''],
      explanation: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleAddOption = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options.push('');
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleExplanationChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].explanation = value;
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions }),
    });
    const result = await response.json();
    if (result.insertedId) {
      alert('Questions saved successfully!');
    } else {
      alert('Failed to save questions.');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold">
            <BookIcon className="h-5 w-5" />
            Question Bank
          </a>
        </div>
        <Button onClick={handleSave}>Save</Button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-64 border-r bg-muted/40 sm:block">
          <nav className="flex h-full flex-col overflow-auto p-4">
            <div className="space-y-2">
              <Button onClick={handleAddQuestion} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground">
                <PlusIcon className="h-4 w-4" />
                New Question
              </Button>
              <div className="text-xs font-medium text-muted-foreground">All Questions</div>
              <div className="space-y-1">
                {questions.map((q, index) => (
                  <a
                    key={q.id}
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    {`Question ${q.id}`}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="grid gap-6 p-4 sm:p-6">
            {questions.map((q, index) => (
              <div key={q.id} className="grid gap-4">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <h2 className="text-xl font-semibold">{`Question ${q.id}`}</h2>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`question-${q.id}`}>Question</Label>
                    <ReactQuill
                      value={q.question}
                      onChange={(value) => handleQuestionChange(index, value)}
                      modules={modules}
                      formats={formats}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Options</Label>
                    <div className="grid gap-2">
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <Checkbox id={`option-${q.id}-${oIndex}`} />
                          <ReactQuill
                            value={option}
                            onChange={(value) => handleOptionChange(index, oIndex, value)}
                            modules={modules}
                            formats={formats}
                          />
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" onClick={() => handleAddOption(index)}>
                        <PlusIcon className="h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`explanation-${q.id}`}>Explanation</Label>
                    <ReactQuill
                      value={q.explanation}
                      onChange={(value) => handleExplanationChange(index, value)}
                      modules={modules}
                      formats={formats}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookIcon(props: any) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function FileTextIcon(props: any) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}


function PlusIcon(props: any) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}