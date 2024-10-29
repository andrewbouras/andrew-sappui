'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Flag, Filter, Menu } from "lucide-react";
import Notification from '@/components/ui/Notification';

interface AnswerChoice {
  value: string;
  correct: boolean;
}

interface Question {
  _id: string;
  question: string;
  answerChoices: AnswerChoice[];
  explanation: string;
  originalIndex: number;
}

interface UserResponse {
  userId: string;
  questionId: string;
  selectedAnswer: string | null;
  flagged: boolean;
}

interface QuestionComponentProps {
  fetchUrl: string;
  postUrl: string;
  title: string;
  settingsButton: React.ReactNode;
  isRandomized: boolean;
  id: string;
  theme: 'light' | 'dark';
  onNewSimilarQuestions: (count: number) => void;
}

const QuestionComponent: React.FC<QuestionComponentProps> = React.memo(({ fetchUrl, postUrl, title, settingsButton, isRandomized, id, theme, onNewSimilarQuestions }) => {
  console.log("QuestionComponent rendered with fetchUrl:", fetchUrl);

  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState("all");
  const [navVisible, setNavVisible] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [questionLoaded, setQuestionLoaded] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(fetchUrl, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      setQuestions(response.data.questions || []);
      setUserResponses(response.data.userResponses || []);
      setIsLoading(false);
      setTimeout(() => setQuestionLoaded(true), 100);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setIsLoading(false);
    }
  }, [fetchUrl, session]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (initialLoad && questions && questions.length > 0 && userResponses.length > 0) {
      const firstUnansweredIndex = questions.findIndex(
        (q) => !userResponses.some((res) => res && res.questionId === q._id && res.selectedAnswer)
      );
      setCurrentQuestion(firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0);
      setInitialLoad(false);
    }
  }, [questions, userResponses, initialLoad]);

  useEffect(() => {
    if (questions.length > 0 && userResponses.length > 0) {
      const response = userResponses.find(res => res && res.questionId === questions[currentQuestion]?._id);
      setSelectedAnswer(response ? response.selectedAnswer : null);
    }
  }, [currentQuestion, questions, userResponses]);

  useEffect(() => {
    localStorage.setItem('filterBy', filterBy);
  }, [filterBy]);

  useEffect(() => {
    const savedFilterBy = localStorage.getItem('filterBy');
    if (savedFilterBy) {
      setFilterBy(savedFilterBy);
    }
  }, []);

  useEffect(() => {
    // Handle randomization when isRandomized changes
    if (isRandomized) {
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
    } else {
      setQuestions([...questions].sort((a, b) => a.originalIndex - b.originalIndex));
    }
  }, [isRandomized]);

  const answeredCount = useMemo(() => questions ? questions.filter(q => userResponses.some(res => res && res.questionId === q._id && res.selectedAnswer)).length : 0, [questions, userResponses]);
  const unansweredCount = useMemo(() => questions ? questions.length - answeredCount : 0, [questions, answeredCount]);
  const flaggedCount = useMemo(() => flaggedQuestions ? flaggedQuestions.length : 0, [flaggedQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    switch (filterBy) {
      case "answered":
        return questions.filter((q) =>
          userResponses.some((res) => res && res.questionId === q._id && res.selectedAnswer !== null && res.selectedAnswer !== '')
        );
      case "unanswered":
        return questions.filter((q) =>
          !userResponses.some((res) => res && res.questionId === q._id && res.selectedAnswer !== null && res.selectedAnswer !== '')
        );
      case "flagged":
        return questions.filter((q) => flaggedQuestions.includes(q._id));
      default:
        return questions;
    }
  }, [filterBy, userResponses, questions, flaggedQuestions]);

  const saveResponse = useCallback((answer: string | null, flagged: boolean) => {
    const token = user?.accessToken;
    const questionId = questions[currentQuestion]?._id;

    const updatedUserResponses = userResponses.map((res) => {
      if (res.questionId === questionId) {
        return {
          ...res,
          selectedAnswer: answer,
          flagged: flagged,
        };
      }
      return res;
    });

    setUserResponses(updatedUserResponses);

    axios.post(postUrl, {
      questionId,
      selectedAnswer: answer,
      flagged
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      console.log('Response saved successfully');
      if (response.data.newSimilarQuestions > 0) {
        setNotificationMessage(`${response.data.newSimilarQuestions} new similar question${response.data.newSimilarQuestions > 1 ? 's' : ''} added!`);
        setShowNotification(true);
        onNewSimilarQuestions(response.data.newSimilarQuestions);
      }
    }).catch((error) => {
      console.error('Error saving response:', error);
    });
  }, [questions, currentQuestion, userResponses, postUrl, user, onNewSimilarQuestions]);

  const handleAnswerClick = useCallback((value: string) => {
    setSelectedAnswer(value);
    saveResponse(value, flaggedQuestions.includes(questions[currentQuestion]?._id));
  }, [currentQuestion, questions, flaggedQuestions, saveResponse]);

  const handleFlagQuestion = () => {
    const questionId = questions[currentQuestion]?._id;
    const isFlagged = flaggedQuestions.includes(questionId);
    const newFlaggedQuestions = isFlagged ? flaggedQuestions.filter((q) => q !== questionId) : [...flaggedQuestions, questionId];

    setFlaggedQuestions(newFlaggedQuestions);
    saveResponse(selectedAnswer, !isFlagged);
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prevQuestion) =>
      (prevQuestion + 1) % filteredQuestions.length
    );
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion((prevQuestion) =>
      (prevQuestion - 1 + filteredQuestions.length) % filteredQuestions.length
    );
  };

  const currentQuestionData = filteredQuestions[currentQuestion] || {};

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentQuestionData) return;

      switch (event.key) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          const index = parseInt(event.key) - 1;
          if (currentQuestionData.answerChoices[index]) {
            handleAnswerClick(currentQuestionData.answerChoices[index].value);
          }
          break;
        case " ":
          event.preventDefault();
          handleNextQuestion();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionData]);

  const handleQuestionClick = (index: number) => {
    const questionId = filteredQuestions[index]._id;
    setVisitedQuestions(prev => new Set(prev).add(questionId));
    setCurrentQuestion(index);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading questions...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div className="flex items-center justify-center h-screen">No questions available. Please check your connection and try again.</div>;
  }

  console.log('currentQuestionData:', currentQuestionData);

  return (
    <div className="flex flex-col h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNavVisible(!navVisible)}
              className="mr-2 text-gray-600 dark:text-gray-300"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/smart" className="text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300">Smartify</Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          </div>
          <div className="flex items-center space-x-4">
            {settingsButton}
            <Link href="/smart">
              <Button variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600">Exit</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out ${navVisible ? 'w-20' : 'w-0'}`}>
          {navVisible && (
            <nav className="w-20 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
              <div className="p-3">
                <div className="mb-3 flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-10 h-10 p-0 hover:bg-transparent focus:ring-0"
                      >
                        <Filter className="h-6 w-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <DropdownMenuRadioGroup value={filterBy} onValueChange={setFilterBy}>
                        <DropdownMenuRadioItem value="all" className="cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          All ({questions.length})
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem 
                          value="answered" 
                          disabled={answeredCount === 0} 
                          className={`${answeredCount === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
                        >
                          Answered ({answeredCount})
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem 
                          value="unanswered" 
                          disabled={unansweredCount === 0} 
                          className={`${unansweredCount === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
                        >
                          Unanswered ({unansweredCount})
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem 
                          value="flagged" 
                          disabled={flaggedCount === 0} 
                          className={`${flaggedCount === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'}`}
                        >
                          Flagged ({flaggedCount})
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  {filteredQuestions.map((question, index) => {
                    const isCurrent = index === currentQuestion;
                    const userResponse = userResponses.find(res => res && res.questionId === question._id);
                    const isAnswered = userResponse && userResponse.selectedAnswer !== null;
                    const isFlagged = userResponse && userResponse.flagged;
                    const isVisited = visitedQuestions.has(question._id);

                    return (
                      <button
                        key={index}
                        className={`
                          relative w-14 h-14 rounded-full flex items-center justify-center
                          text-sm font-medium transition-colors duration-200
                          ${isCurrent ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}
                          ${!isVisited ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 
                            isAnswered ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 
                            'bg-blue-100 dark:bg-blue-600 text-blue-600 dark:text-blue-100'}
                          hover:bg-blue-300 dark:hover:bg-blue-700
                        `}
                        onClick={() => handleQuestionClick(index)}
                      >
                        <span className={isFlagged ? 'font-bold' : ''}>
                          {question.originalIndex}
                        </span>
                        {isFlagged && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 dark:bg-amber-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          )}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {currentQuestionData && (
            <div className={`transition-all duration-300 ${questionLoaded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
              <h2 className="text-xl font-semibold mb-4">{currentQuestionData.question}</h2>
              <div className="space-y-4">
                {currentQuestionData.answerChoices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(choice.value)}
                    className={`w-full text-left p-3 rounded-lg ${
                      selectedAnswer === choice.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {choice.value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>Previous</Button>
        <Button onClick={handleNextQuestion} disabled={currentQuestion === filteredQuestions.length - 1}>Next</Button>
      </div>
      {showNotification && (
        <Notification
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
});

export default QuestionComponent;
