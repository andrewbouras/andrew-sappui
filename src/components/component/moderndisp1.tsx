import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { usePathname } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
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
  originalIndex: number;
}

interface UserResponse {
  questionId: string;
  selectedAnswer: string;
  flagged: boolean;
}

export function Moderndisp1() {
  const pathname = usePathname();
  const qbank = pathname?.split("/").pop();

  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<string>('all');
  const [isRandomized, setIsRandomized] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
    const token = user?.accessToken;

    if (qbank && token) {
      axios.get(`${apiUrl}/qbank/${qbank}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          const questionsWithIndex = response.data.questions.map((item: Question, index: number) => ({
            ...item,
            originalIndex: index + 1
          }));

          setQuestions(questionsWithIndex);
          setUserResponses(response.data.userResponses);
          const flagged = response.data.userResponses.filter((res: UserResponse) => res.flagged).map((res: UserResponse) => res.questionId);
          setFlaggedQuestions(flagged);
        })
        .catch((error) => {
          console.error('Error fetching questions:', error);
        });
    }
  }, [qbank, user]);

  useEffect(() => {
    if (questions.length > 0 && userResponses.length > 0) {
      const response = userResponses.find(res => res.questionId === questions[currentQuestion]._id);
      setSelectedAnswer(response ? response.selectedAnswer : null);
    }
  }, [currentQuestion, questions, userResponses]);

  const handleFlagQuestion = () => {
    const questionId = questions[currentQuestion]._id;
    const isFlagged = flaggedQuestions.includes(questionId);
    const newFlaggedQuestions = isFlagged ? flaggedQuestions.filter((q) => q !== questionId) : [...flaggedQuestions, questionId];

    setFlaggedQuestions(newFlaggedQuestions);
    saveResponse(selectedAnswer, !isFlagged);
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prevQuestion) => (prevQuestion + 1) % filteredQuestions.length);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestion((prevQuestion) => (prevQuestion - 1 + filteredQuestions.length) % filteredQuestions.length);
  };

  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(value);
    saveResponse(value, flaggedQuestions.includes(questions[currentQuestion]._id));
  };

  const saveResponse = (answer: string | null, flagged: boolean) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';
    const token = user?.accessToken;
    const questionId = questions[currentQuestion]._id;
    axios.post(`${apiUrl}/qbank/${qbank}/response`, {
      questionId,
      selectedAnswer: answer,
      flagged
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        console.log('Response saved successfully');
        const updatedResponses = [...userResponses];
        const responseIndex = updatedResponses.findIndex(res => res.questionId === questionId);
        if (responseIndex !== -1) {
          updatedResponses[responseIndex] = { questionId, selectedAnswer: answer || '', flagged };
        } else {
          updatedResponses.push({ questionId, selectedAnswer: answer || '', flagged });
        }
        setUserResponses(updatedResponses);
      })
      .catch((error) => {
        console.error('Error saving response:', error);
      });
  };

  const formatHTMLContent = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  const filterQuestions = () => {
    switch (filterBy) {
      case 'answered':
        return questions.filter(q => userResponses.some(res => res.questionId === q._id));
      case 'unanswered':
        return questions.filter(q => !userResponses.some(res => res.questionId === q._id));
      case 'flagged':
        return questions.filter(q => flaggedQuestions.includes(q._id));
      default:
        return questions;
    }
  };

  const filteredQuestions = useMemo(filterQuestions, [filterBy, questions, userResponses, flaggedQuestions]);

  const randomizeQuestions = () => {
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffledQuestions);
    setIsRandomized(true);
  };

  const toggleRandomization = () => {
    if (isRandomized) {
      setQuestions([...questions].sort((a, b) => a.originalIndex - b.originalIndex));
    } else {
      randomizeQuestions();
    }
    setIsRandomized(!isRandomized);
  };

  if (filteredQuestions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestionData = filteredQuestions[currentQuestion];

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 bg-gray-800 text-white">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <span className="text-lg font-semibold cursor-pointer">Smartify</span>
            </Link>
            <span className="ml-4">{qbank}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleRandomization}>
                {isRandomized ? "Undo Randomize" : "Randomize Questions"}
              </Button>
            </div>
            <Link href="/">
              <button className="bg-white text-black p-2 rounded-lg hover:bg-gray-300">
                Exit
              </button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1">
        <aside className="w-20 bg-transparent border-r h-full">
          <div className="flex flex-col items-center py-4 space-y-4 h-full overflow-y-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/80">
                  <FilterIcon className="h-5 w-5 text-primary-foreground" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ backgroundColor: '#FFFFFF' }}>
                <DropdownMenuRadioGroup value={filterBy} onValueChange={setFilterBy}>
                  <DropdownMenuRadioItem value="all">All ({questions.length})</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="answered">Answered ({questions.length - filteredQuestions.length})</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unanswered">Unanswered ({filteredQuestions.length})</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="flagged">Flagged ({flaggedQuestions.length})</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ul className="space-y-2">
              {filteredQuestions.map((question, index) => {
                const isCurrent = index === currentQuestion;
                const isAnswered = userResponses.some(res => res.questionId === question._id);
                const isFlagged = flaggedQuestions.includes(question._id);
                return (
                  <li key={index} className="relative flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 rounded-full w-12 h-12 cursor-pointer font-normal ${isCurrent ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'} ${!isAnswered ? 'font-bold' : ''}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {question.originalIndex}
                      {isFlagged && <FlagIcon className="h-4 w-4 absolute bottom-0 right-1 text-yellow-500 fill-current" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
        <section className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Question {currentQuestionData.originalIndex}</h2>
            <Button variant="outline" size="sm" onClick={handleFlagQuestion}>
              {flaggedQuestions.includes(currentQuestionData._id) ? "Unflag Question" : "Flag Question"}
            </Button>
          </div>
          <div className="text-sm" dangerouslySetInnerHTML={formatHTMLContent(currentQuestionData.question)} />
          <div className="space-y-4">
            {currentQuestionData.answerChoices.map((choice, index) => {
              const isSelected = selectedAnswer === choice.value;
              const isCorrect = choice.correct;
              const choiceClasses = [
                "flex items-center p-4 border rounded-lg cursor-pointer",
                isCorrect && isSelected ? "bg-green-200" : isSelected ? "bg-red-200" : "bg-gray-100",
              ].join(" ");
              return (
                <div key={index} className={choiceClasses} onClick={() => handleSelectAnswer(choice.value)}>
                  <span className="flex-1" dangerouslySetInnerHTML={formatHTMLContent(choice.value)} />
                </div>
              );
            })}
          </div>
          {selectedAnswer !== null && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">Explanation</h3>
              <div dangerouslySetInnerHTML={formatHTMLContent(currentQuestionData.explanation)} />
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousQuestion}>
              Previous
            </Button>
            <Button onClick={handleNextQuestion}>
              Next
            </Button>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-between h-12 px-4 bg-gray-200">
        <span>
          {currentQuestionData.originalIndex} OF {questions.length} QUESTIONS
        </span>
        <span>VERSION 1.8.0</span>
      </footer>
    </div>
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
