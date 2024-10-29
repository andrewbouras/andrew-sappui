import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface AnswerChoice {
  value: string;
  correct: boolean;
}

interface Question {
  _id: string;
  question: string;
  answerChoices: AnswerChoice[];
  explanation: string;
}

interface UserResponse {
  userId: string;
  questionId: string;
  selectedAnswer: string;
  flagged: boolean;
}

export default function QBankDisplay() {
  const pathname = usePathname();
  const qbank = pathname?.split("/").pop();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState("all");
  const [navVisible, setNavVisible] = useState(true); // State for navigation bar visibility
  const [questionBankTitle, setQuestionBankTitle] = useState(''); // State for question bank title
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV ;
  
    const token = user?.accessToken;
    if (qbank) {
      axios.get(`${apiUrl}/qbank/${qbank}`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
        setQuestions(response.data.questions);
        setUserResponses(response.data.userResponses);
        const flagged = response.data.userResponses.filter((res: UserResponse) => res.flagged).map((res: UserResponse) => res.questionId);
        setFlaggedQuestions(flagged);
      }).catch((error) => {
        console.error('Error fetching data:', error);
      });

      // Fetch question bank title
      axios.get(`${apiUrl}/question-bank-info/${qbank}`).then((response) => {
        setQuestionBankTitle(response.data.title);
      }).catch((error) => {
        console.error('Error fetching question bank info:', error);
      });
    }
  }, [qbank, user]);

  useEffect(() => {
    if (questions.length > 0 && userResponses.length > 0) {
      const response = userResponses.find(res => res.questionId === questions[currentQuestion]._id);
      setSelectedAnswer(response ? response.selectedAnswer : null);
    }
  }, [currentQuestion, questions, userResponses]);

  useEffect(() => {
    // Save filter state to localStorage
    localStorage.setItem('filterBy', filterBy);
  }, [filterBy]);

  useEffect(() => {
    // Retrieve filter state from localStorage
    const savedFilterBy = localStorage.getItem('filterBy');
    if (savedFilterBy) {
      setFilterBy(savedFilterBy);
    }
  }, []);

  useEffect(() => {
    // Load the first unanswered question when the component mounts
    const firstUnansweredIndex = questions.findIndex(q => !userResponses.some(res => res.questionId === q._id));
    if (firstUnansweredIndex !== -1) {
      setCurrentQuestion(firstUnansweredIndex);
    }
  }, [questions, userResponses]);

  const handleAnswerClick = (value: string) => {
    setSelectedAnswer(value);
    saveResponse(value, flaggedQuestions.includes(questions[currentQuestion]._id));
  };

  const handleFlagQuestion = () => {
    const questionId = questions[currentQuestion]._id;
    const isFlagged = flaggedQuestions.includes(questionId);
    const newFlaggedQuestions = isFlagged ? flaggedQuestions.filter((q) => q !== questionId) : [...flaggedQuestions, questionId];

    setFlaggedQuestions(newFlaggedQuestions);

    saveResponse(selectedAnswer, !isFlagged);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion((prevQuestion) => (prevQuestion + 1) % questions.length);
  };

  const handlePreviousQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion((prevQuestion) => (prevQuestion - 1 + questions.length) % questions.length);
  };

  const saveResponse = (answer: string | null, flagged: boolean) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
    const token = user?.accessToken;
    const questionId = questions[currentQuestion]._id;
    axios.post(`${apiUrl}/qbank/${qbank}/response`,
      {
        questionId,
        selectedAnswer: answer,
        flagged
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).then(() => {
      console.log('Response saved successfully');
    }).catch((error) => {
      console.error('Error saving response:', error);
    });
  };

  const filteredQuestions = useMemo(() => {
    switch (filterBy) {
      case "answered":
        return questions.filter((_, index) => userResponses.some(res => res.questionId === questions[index]._id));
      case "unanswered":
        return questions.filter((_, index) => !userResponses.some(res => res.questionId === questions[index]._id));
      case "flagged":
        return questions.filter(q => flaggedQuestions.includes(q._id));
      default:
        return questions;
    }
  }, [filterBy, userResponses, questions, flaggedQuestions]);

  const currentQuestionData = filteredQuestions[currentQuestion];

  if (!currentQuestionData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {navVisible && (
        <nav className="bg-primary text-primary-foreground p-4 w-1/5 border-r overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{questionBankTitle}</h2>
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
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="answered">Answered</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unanswered">Unanswered</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="flagged">Flagged</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="ml-2">
                <PlusIcon className="h-5 w-5 text-primary-foreground" />
                <span className="sr-only">Add more questions</span>
              </Button>
            </div>
          </div>
          <ul>
            {filteredQuestions.map((question, index) => {
              const isAnswered = userResponses.some(res => res.questionId === question._id);
              const isFlagged = flaggedQuestions.includes(question._id);
              return (
                <li
                  key={index}
                  className={`py-2 px-4 cursor-pointer hover:bg-primary/80 ${
                    index === currentQuestion ? "bg-primary/90" : ""
                  } ${!isAnswered && !isFlagged ? "font-bold" : ""}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  Question {index + 1} {isFlagged && <span className="text-yellow-500">🚩</span>}
                </li>
              );
            })}
          </ul>
          <Link href="/">
            <button className="absolute bottom-5 right-5 bg-white text-black p-2 rounded-lg hover:bg-gray-300">
              Exit
            </button>
          </Link>
        </nav>
      )}
      <div className={`flex-1 p-8 ${navVisible ? 'ml-[5%]' : 'ml-0'}`}> {/* Added dynamic margin */}
        <button
          className={`absolute top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-r-full ${navVisible ? 'left-[20%]' : 'left-0'}`}          onClick={() => setNavVisible(!navVisible)}
        >
          <img src={navVisible ? 'https://www.svgrepo.com/show/425979/left-arrow.svg' : 'https://www.svgrepo.com/show/425982/right-arrow.svg'} alt="Toggle Navigation" 
          width="30" 
          height="30" 
          />

        </button>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Question {currentQuestion + 1}</h2>
          <Button variant="outline" className={`flex items-center gap-2 ${flaggedQuestions.includes(currentQuestionData._id) ? 'bg-yellow-500' : ''}`} onClick={handleFlagQuestion}>
            <FlagIcon className="h-5 w-5" />
            <span>Flag</span>
          </Button>
        </div>
        <div className="flex">
          <div className="w-3/5">
            <div className="text-lg mb-4" dangerouslySetInnerHTML={{ __html: currentQuestionData.question }} />
            <div className="space-y-2">
              {currentQuestionData.answerChoices.map((answer, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-200 ${
                    selectedAnswer !== null &&
                    (answer.value === selectedAnswer
                      ? answer.correct
                        ? "bg-green-300 text-green-900"
                        : "bg-red-300 text-red-900"
                      : answer.correct
                      ? "bg-green-300 text-green-900"
                      : "")
                  }`}
                  onClick={() => handleAnswerClick(answer.value)}
                >
                  {selectedAnswer !== null &&
                    (answer.value === selectedAnswer ? (
                      answer.correct ? (
                        <span className="mr-2 text-green-900">✓</span>
                      ) : (
                        <span className="mr-2 text-red-900">✕</span>
                      )
                    ) : answer.correct ? (
                      <span className="mr-2 text-green-900">✓</span>
                    ) : null)}
                  <div dangerouslySetInnerHTML={{ __html: answer.value }} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <Button onClick={handlePreviousQuestion}>
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNextQuestion}>
                Next
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
          {selectedAnswer !== null && (
            <div className="w-2/5 bg-gray-100 p-4 rounded-md ml-8">
              <h3 className="text-lg font-bold mb-4">Explanation</h3>
              <div dangerouslySetInnerHTML={{ __html: currentQuestionData.explanation }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon(props: any) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: any) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

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
  );
}
