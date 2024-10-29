"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Moderndisp1() {
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [cancelledChoices, setCancelledChoices] = useState<string[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<{ [key: number]: number | null }>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const handleFlagQuestion = (questionNumber: number) => {
    if (flaggedQuestions.includes(questionNumber)) {
      setFlaggedQuestions(flaggedQuestions.filter((q) => q !== questionNumber));
    } else {
      setFlaggedQuestions([...flaggedQuestions, questionNumber]);
    }
  };

  const handleNavigateQuestion = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    setShowExplanation(false);
  };

  const handleCancelChoice = (questionNumber: number, choiceIndex: number) => {
    const choiceIdentifier = `${questionNumber}-${choiceIndex}`;
    if (cancelledChoices.includes(choiceIdentifier)) {
      setCancelledChoices(cancelledChoices.filter((c) => c !== choiceIdentifier));
    } else {
      setCancelledChoices([...cancelledChoices, choiceIdentifier]);
    }
  };

  const handleSelectChoice = (questionNumber: number, choiceIndex: number, isCorrect: boolean) => {
    setSelectedChoices({ ...selectedChoices, [questionNumber]: choiceIndex });
    setShowExplanation(true);
  };

  const questions = [
    {
      number: 1,
      text: "What is the capital city of France?",
      choices: [
        { label: "A. Paris", isCorrect: true },
        { label: "B. London", isCorrect: false },
        { label: "C. Berlin", isCorrect: false },
        { label: "D. Madrid", isCorrect: false },
      ],
    },
    {
      number: 2,
      text: "What is the largest ocean in the world?",
      choices: [
        { label: "A. Atlantic Ocean", isCorrect: false },
        { label: "B. Indian Ocean", isCorrect: false },
        { label: "C. Arctic Ocean", isCorrect: false },
        { label: "D. Pacific Ocean", isCorrect: true },
      ],
    },
    {
      number: 3,
      text: "What is the chemical symbol for gold?",
      choices: [
        { label: "A. Au", isCorrect: true },
        { label: "B. Ag", isCorrect: false },
        { label: "C. Cu", isCorrect: false },
        { label: "D. Fe", isCorrect: false },
      ],
    },
    {
      number: 4,
      text: "What is the largest planet in our solar system?",
      choices: [
        { label: "A. Saturn", isCorrect: false },
        { label: "B. Mars", isCorrect: false },
        { label: "C. Jupiter", isCorrect: true },
        { label: "D. Neptune", isCorrect: false },
      ],
    },
    {
      number: 5,
      text: "What is the tallest mountain in the world?",
      choices: [
        { label: "A. Everest", isCorrect: true },
        { label: "B. K2", isCorrect: false },
        { label: "C. Kangchenjunga", isCorrect: false },
        { label: "D. Lhotse", isCorrect: false },
      ],
    },
    {
      number: 6,
      text: "What is the largest mammal in the world?",
      choices: [
        { label: "A. Elephant", isCorrect: false },
        { label: "B. Giraffe", isCorrect: false },
        { label: "C. Blue Whale", isCorrect: true },
        { label: "D. Hippopotamus", isCorrect: false },
      ],
    },
    {
      number: 7,
      text: "What is the chemical symbol for sodium?",
      choices: [
        { label: "A. Na", isCorrect: true },
        { label: "B. Cl", isCorrect: false },
        { label: "C. K", isCorrect: false },
        { label: "D. Ca", isCorrect: false },
      ],
    },
    {
      number: 8,
      text: "What is the largest continent in the world?",
      choices: [
        { label: "A. North America", isCorrect: false },
        { label: "B. South America", isCorrect: false },
        { label: "C. Asia", isCorrect: true },
        { label: "D. Africa", isCorrect: false },
      ],
    },
    {
      number: 9,
      text: "What is the smallest planet in our solar system?",
      choices: [
        { label: "A. Mercury", isCorrect: true },
        { label: "B. Venus", isCorrect: false },
        { label: "C. Mars", isCorrect: false },
        { label: "D. Pluto", isCorrect: false },
      ],
    },
    {
      number: 10,
      text: "What is the currency used in Japan?",
      choices: [
        { label: "A. Dollar", isCorrect: false },
        { label: "B. Euro", isCorrect: false },
        { label: "C. Yen", isCorrect: true },
        { label: "D. Pound", isCorrect: false },
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-gray-800 text-white">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <CodeIcon className="h-6 w-6" />
            <span className="text-lg font-semibold">Examplify</span>
            <span className="ml-4">NEWEST UI 1-8 Mock | TEST TESTER (Test123)</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>TIME REMAINING 01:45</span>
            <div className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <MonitorCheckIcon className="h-6 w-6" />
              </Button>
              <span>EXAM CONTROLS</span>
            </div>
            <div className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <PenToolIcon className="h-6 w-6" />
              </Button>
              <span>TOOL KIT</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-1">
        <aside className="w-16 bg-gray-100 border-r overflow-y-auto">
          <nav className="flex flex-col items-center py-4 space-y-4">
            {questions.map((question) => (
              <div key={question.number} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-12 h-12 cursor-pointer"
                  onClick={() => handleNavigateQuestion(question.number)}
                >
                  {question.number}
                </Button>
                {flaggedQuestions.includes(question.number) && (
                  <FlagIcon className="h-4 w-4 absolute bottom-0 right-1 text-yellow-500 fill-current" />
                )}
              </div>
            ))}
          </nav>
        </aside>
        <section className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Question {questions[currentQuestion - 1].number}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFlagQuestion(questions[currentQuestion - 1].number)}
            >
              {flaggedQuestions.includes(questions[currentQuestion - 1].number) ? "UNFLAG QUESTION" : "FLAG QUESTION"}
            </Button>
          </div>
          <p className="text-sm">{questions[currentQuestion - 1].text}</p>
          <div className="space-y-4">
            {questions[currentQuestion - 1].choices.map((choice, index) => {
              const choiceIdentifier = `${questions[currentQuestion - 1].number}-${index}`;
              const isSelected = selectedChoices[questions[currentQuestion - 1].number] === index;
              const isCorrect = choice.isCorrect;
              const isCancelled = cancelledChoices.includes(choiceIdentifier);
              const choiceClasses = [
                "flex items-center p-4 border rounded-lg cursor-pointer",
                isCorrect && isSelected ? "bg-green-200" : isSelected ? "bg-red-200" : "bg-gray-100",
                isCancelled ? "opacity-50 line-through" : "",
              ].join(" ");
              return (
                <div key={index} className={choiceClasses} onClick={() => handleSelectChoice(questions[currentQuestion - 1].number, index, isCorrect)}>
                  <span className="flex-1">{choice.label}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-transparent text-gray-500 hover:text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelChoice(questions[currentQuestion - 1].number, index);
                    }}
                  >
                    <EyeOffIcon className="h-6 w-6" />
                  </Button>
                </div>
              );
            })}
          </div>
          {showExplanation && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">Explanation</h3>
              <p className="text-sm">
                This is where you can provide an explanation for the correct answer. Explain why the correct option is
                correct and why the other options are incorrect.
              </p>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => handleNavigateQuestion(Math.max(currentQuestion - 1, 1))}>
              Previous
            </Button>
            <Button onClick={() => handleNavigateQuestion(Math.min(currentQuestion + 1, questions.length))}>
              Next
            </Button>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-between h-12 px-4 bg-gray-200">
        <span>
          {currentQuestion} OF {questions.length} QUESTIONS
        </span>
        <span>VERSION 1.8.0</span>
      </footer>
    </div>
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

function CodeIcon(props: any) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function EyeOffIcon(props: any) {
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
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function FlagIcon(props: any) {
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
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function MonitorCheckIcon(props: any) {
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
      <path d="m9 10 2 2 4-4" />
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

function PenToolIcon(props: any) {
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
      <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
      <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
      <path d="m2.3 2.3 7.286 7.286" />
      <circle cx="11" cy="11" r="2" />
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
