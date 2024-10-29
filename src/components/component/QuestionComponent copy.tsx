'use client';

import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
}

const QuestionComponent: React.FC<QuestionComponentProps> = ({ fetchUrl, postUrl, title }) => {
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState("all");
  const [navVisible, setNavVisible] = useState(true);
  const [isRandomized, setIsRandomized] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch questions initially
  useEffect(() => {
    if (status === "authenticated" && isAuthenticated) {
      const fetchQuestions = () => {
        axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        })
          .then((response) => {
            const questionsWithResponses = response.data.questionsWithResponses || response.data.questions;
            const questionsWithIndex = questionsWithResponses.map((item: any, index: number) => ({
              ...item.question || item,
              originalIndex: index + 1
            }));

            setQuestions((prevQuestions) => {
              // Check if there are new questions and update the state accordingly
              const newQuestions = questionsWithIndex.filter(
                (newQuestion: Question) => !prevQuestions.some((prevQuestion) => prevQuestion._id === newQuestion._id)
              );
              return [...prevQuestions, ...newQuestions];
            });

            const userResponsesData = questionsWithResponses.map((item: any) => ({
              questionId: item.question?._id || item._id,
              selectedAnswer: item.userResponse,
              flagged: item.flagged
            }));
            setUserResponses(userResponsesData);
            setFlaggedQuestions(questionsWithResponses.filter((item: any) => item.flagged).map((item: any) => item.question?._id || item._id));
          })
          .catch((error) => {
            console.error("Failed to load questions:", error);
          });
      };

      // Initial fetch
      fetchQuestions();

      // Set up the interval to fetch new questions every 3 seconds
      const intervalId = setInterval(fetchQuestions, 10000);

      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [fetchUrl, status, isAuthenticated]);

  useEffect(() => {
    if (initialLoad && questions.length > 0 && userResponses.length > 0) {
      const firstUnansweredIndex = questions.findIndex(
        (q) => !userResponses.some((res) => res && res.questionId === q._id && res.selectedAnswer)
      );
      setCurrentQuestion(firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0);
      setInitialLoad(false);  // Set the flag to false after the initial load
    }
  }, [questions, userResponses, initialLoad]); // Depend on these to ensure the effect runs after data is loaded
  

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

  const answeredCount = useMemo(() => questions.filter(q => userResponses.some(res => res && res.questionId === q._id && res.selectedAnswer)).length, [questions, userResponses]);
  const unansweredCount = useMemo(() => questions.length - answeredCount, [questions, answeredCount]);
  const flaggedCount = useMemo(() => flaggedQuestions.length, [flaggedQuestions]);

  const filteredQuestions = useMemo(() => {
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

  const handleAnswerClick = (value: string) => {
    setSelectedAnswer(value);
    saveResponse(value, flaggedQuestions.includes(questions[currentQuestion]?._id));
    // Remove the automatic navigation to the next question
    // handleNextQuestion();  // Comment this out or remove it entirely
  };
  

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

  const saveResponse = (answer: string | null, flagged: boolean) => {
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
    }).then(() => {
      console.log('Response saved successfully');
    }).catch((error) => {
      console.error('Error saving response:', error);
    });
  };

  const currentQuestionData = filteredQuestions[currentQuestion] || {};

  const toggleRandomization = () => {
    if (isRandomized) {
      setQuestions([...questions].sort((a, b) => a.originalIndex - b.originalIndex));
    } else {
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
    }
    setIsRandomized(!isRandomized);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentQuestionData) return;

      switch (event.key) {
        case "1":
          handleAnswerClick(currentQuestionData.answerChoices[0]?.value || "");
          break;
        case "2":
          handleAnswerClick(currentQuestionData.answerChoices[1]?.value || "");
          break;
        case "3":
          handleAnswerClick(currentQuestionData.answerChoices[2]?.value || "");
          break;
        case "4":
          handleAnswerClick(currentQuestionData.answerChoices[3]?.value || "");
          break;
        case "5":
          handleAnswerClick(currentQuestionData.answerChoices[4]?.value || "");
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

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-gray-800 text-white">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <a href="/"><span className="text-lg font-semibold cursor-pointer">Smartify</span></a>
            <span className="ml-4">{title}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="randomize-questions" checked={isRandomized} onCheckedChange={toggleRandomization} />
              <Label htmlFor="randomize-questions">Randomize Questions</Label>
            </div>
            <Link href="/">
              <button className="bg-white text-black p-2 rounded-lg hover:bg-gray-300">
                Exit
              </button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex h-full">
        {navVisible && (
          <nav className="bg-primary text-primary-foreground p-4 w-20 border-r overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/80">
                      <FilterIcon className="h-5 w-5 text-primary-foreground" />
                      <span className="sr-only">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" style={{ backgroundColor: '#FFFFFF' }}>
                    <DropdownMenuRadioGroup value={filterBy} onValueChange={setFilterBy}>
                      <DropdownMenuRadioItem value="all">
                        All ({questions.length})
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="answered" disabled={answeredCount === 0}>
                        Answered ({answeredCount})
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="unanswered" disabled={unansweredCount === 0}>
                        Unanswered ({unansweredCount})
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="flagged" disabled={flaggedCount === 0}>
                        Flagged ({flaggedCount})
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* <ul className="space-y-2">
              {filteredQuestions.map((question, index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = userResponses.some(res => res && res.questionId === question._id);
                const isFlagged = flaggedQuestions.includes(question._id);
                return (
                  <li
                    key={index}
                    className="relative flex justify-center"
                  >
                    <button
                      className={`inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 rounded-full w-12 h-12 cursor-pointer font-normal ${isCurrent ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'} ${!isAnswered ? 'font-bold' : ''}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {question.originalIndex}
                      {isFlagged && <FlagIcon className="h-4 w-4 absolute bottom-0 right-1 text-yellow-500 fill-current" />}
                    </button>
                  </li>
                );
              })}
            </ul> */}

<ul className="space-y-2">
  {filteredQuestions.map((question, index) => {
    const isCurrent = index === currentQuestion;
    const userResponse = userResponses.find(res => res && res.questionId === question._id);
    const isAnswered = userResponse && userResponse.selectedAnswer !== null;
    const isFlagged = userResponse && userResponse.flagged;
    const isSeen = !!userResponse;

    return (
      <li
        key={index}
        className="relative flex justify-center"
      >
        <button
          className={`inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 rounded-full w-12 h-12 cursor-pointer font-normal ${isCurrent ? 'bg-blue-100 text-blue-500' : isAnswered ? 'bg-gray-100 text-gray-500' : isSeen ? 'bg-gray-200 text-gray-600' : 'bg-gray-300 text-gray-700'} ${!isAnswered ? 'font-bold' : ''}`}
          onClick={() => setCurrentQuestion(index)}
        >
          {question.originalIndex}
          {isFlagged && <FlagIcon className="h-4 w-4 absolute bottom-0 right-1 text-yellow-500 fill-current" />}
        </button>
      </li>
    );
  })}
</ul>
          </nav>
        )}
        <section className={`flex-1 p-6 space-y-6 overflow-y-auto ${navVisible ? 'ml-20' : 'ml-10'}`}>
          <button
            className={`absolute top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-r-full ${navVisible ? 'left-20' : 'left-0'}`}
            onClick={() => setNavVisible(!navVisible)}
          >
            <img src={navVisible ? 'https://www.svgrepo.com/show/425979/left-arrow.svg' : 'https://www.svgrepo.com/show/425982/right-arrow.svg'} alt="Toggle Navigation" width="30" height="30" />
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Question {currentQuestionData?.originalIndex || ''}</h2>
            {filterBy !== "answered" && filterBy !== "unanswered" && (
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 h-9 rounded-md px-3 ${flaggedQuestions.includes(currentQuestionData._id) ? 'bg-yellow-500' : ''}`}
                onClick={handleFlagQuestion}
              >
                FLAG QUESTION
              </button>
            )}
          </div>
          <div className="text-sm">
            <div dangerouslySetInnerHTML={{ __html: currentQuestionData?.question || '' }} />
          </div>
          <div className="space-y-4">
            {currentQuestionData?.answerChoices?.map((answer, index) => (
              <div
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                  selectedAnswer === answer.value
                    ? answer.correct
                      ? "bg-green-200"
                      : "bg-red-200"
                    : selectedAnswer !== null && answer.correct
                    ? "bg-green-200"
                    : "bg-gray-200"
                }`}
                onClick={() => handleAnswerClick(answer.value)}
              >
                <span className="flex-1">
                  <div dangerouslySetInnerHTML={{ __html: answer.value }} />
                </span>
              </div>
            ))}
          </div>
          {selectedAnswer !== null && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">Explanation</h3>
              <div dangerouslySetInnerHTML={{ __html: currentQuestionData?.explanation || '' }} />
            </div>
          )}

          <div className="flex justify-between">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 h-10 px-4 py-2" onClick={handlePreviousQuestion}>
              Previous
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 bg-gray-900 text-gray-50 hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 h-10 px-4 py-2" onClick={handleNextQuestion}>
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

function FilterIcon(props: any) {
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

export default QuestionComponent;