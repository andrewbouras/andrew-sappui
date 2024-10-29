import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { SetNumberContext } from '@/components/component/SetNumberContext';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Qload } from "@/components/component/qload"; // Ensure correct import path


const apiUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
  : process.env.NEXT_PUBLIC_API_URL_DEV ;


interface Option {
  body: string;
  isItCorrect: boolean;
  explanation: string;
}

interface MCQ {
  _id: string;
  question: string;
  options: Option[];
  answerGiven: string | null;
  answeredCorrectly: boolean | null;
  style: string;
}

interface MCQsComponentProps {
  mcqs: MCQ[];
}

const MCQsComponent: React.FC<MCQsComponentProps> = ({ mcqs: initialMcqs }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>(initialMcqs || []);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: { selected: string | null; isItCorrect: boolean | null } }>({});
  const [loading, setLoading] = useState(false);
  const id = usePathname();
  const context = useContext(SetNumberContext);
  const { user } = useAuth();
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const token = user?.accessToken;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  if (!context) {
    throw new Error("SetNumberContext must be used within a SetNumberProvider");
  }

  const { currentSet, setCurrentSet } = context;

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      const retryDelay = 2000; // Delay between retries in milliseconds
    
      const fetchData = async () => {
        try {
          const response = await axios.get(`${apiUrl}${id}/mcqs/responses`, { params: { setNumber: currentSet } });
          if (response.data.mcqs === undefined) {
            throw new Error('mcqs is undefined');
          }
          const answers = response.data.mcqs.reduce((acc: any, item: any) => ({
            ...acc,
            [item._id]: { selected: item.answerGiven, isItCorrect: item.answeredCorrectly }
          }), {});
          setSelectedAnswers(answers);
          setMcqs(response.data.mcqs);
          setLoading(false);
          return; // Exit the function upon successful fetch
        } catch (error) {
          console.error('Failed to fetch responses:', error);
          setTimeout(fetchData, retryDelay); // Retry after a delay
        }
      };
    
      fetchData();
    };

    if (id && currentSet) {
      // fetchResponses();
    }
  }, [id, currentSet]);

  const handleAnswerClick = async (mcqId: string, option: string, isItCorrect: boolean) => {
    const newAnswers = {
      ...selectedAnswers,
      [mcqId]: { selected: option, isItCorrect }
    };
    setSelectedAnswers(newAnswers);

    try {
      await axios.post(`${apiUrl}${id}/mcqs/responses`, {
        mcqId,
        answerGiven: option,
        answeredCorrectly: isItCorrect,
        setNumber: currentSet
      });
    } catch (error) {
      console.error('Error recording answer:', error);
    }

    if (!isItCorrect) {
      sendMissedQuestion(mcqId);
    }
  };

  const sendMissedQuestion = async (mcqId: string) => {
    try {
      await axios.post(`/api/${id}/mcqs/${mcqId}/generate-similar`);
    } catch (error) {
      console.error('Error sending missed question:', error);
    }
  };

  const fetchNewSet = async (setNumber: number) => {
    setLoading(true);
    try {

      const response = await axios.get(`${apiUrl}${id}/mcqs/responses`, { params: { setNumber } });

      if (response.status === 202) {
        fetchTimeoutRef.current = setTimeout(() => {
          fetchNewSet(setNumber);
        }, 5000);
      } else if (response.status === 200) {
        setCurrentSet(setNumber);
        setSelectedAnswers({});
        setMcqs(response.data.mcqs || []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch new set:', error);
      setLoading(false);
    }
  };

  const handleNextSet = () => {
    if (!loading) {
      fetchNewSet(currentSet + 1);
    }
  };

  const handlePreviousSet = () => {
    if (!loading && currentSet > 1) {
      fetchNewSet(currentSet - 1);
    }
  };

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" className="p-1" onClick={handlePreviousSet} disabled={loading || currentSet === 1}>
          <ChevronLeftIcon className="w-6 h-6" />
          <span>Previous Set</span>
        </Button>
        <h1 className="text-3xl font-bold mb-4">Set Number {currentSet}</h1>
        <Button variant="ghost" className="p-1" onClick={handleNextSet} disabled={loading}>
          <span>Next Set</span>
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </div>
      {loading ? (
        <Qload />
      ) : (
        mcqs.map((mcq, index) => (
          <div key={mcq._id} className="p-6 border border-gray-200 rounded-md space-y-4 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="p-1">
                  <FlagIcon className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-semibold">Question {index + 1}</h2>
                <div className="relative group">
                  <Button variant="ghost" className="p-1">
                    <InfoIcon className="w-6 h-6" />
                  </Button>
                  <div className="hidden group-hover:block absolute z-10 w-48 bg-white shadow-lg p-2 rounded-md">
                    <p className="text-base">Style: {mcq.style}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8 space-y-2">
              <p className="text-base">{mcq.question}</p>
            </div>
            <div className="space-y-4">
              {mcq.options.map((option, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`q${index + 1}a${idx + 1}`}
                      name={`question${index + 1}`}
                      className="mr-2"
                      checked={selectedAnswers[mcq._id]?.selected === option.body}
                      onChange={() => handleAnswerClick(mcq._id, option.body, option.isItCorrect)}
                    />
                    <label htmlFor={`q${index + 1}a${idx + 1}`} className="flex items-center text-base">
                      {option.body}
                      {selectedAnswers[mcq._id]?.selected === option.body && (
                        option.isItCorrect ? (
                          <CircleCheckIcon className="w-6 h-6 text-green-500 ml-2" />
                        ) : (
                          <CircleXIcon className="w-6 h-6 text-red-500 ml-2" />
                        )
                      )}
                    </label>
                  </div>
                  {(selectedAnswers[mcq._id]?.selected !== null) && (
                    <div className={`mt-4 border p-4 rounded-md ${option.isItCorrect ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
                      <p className="text-base">{option.explanation}</p>
                    </div>
                  )}
                  <hr />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <div className="flex justify-between items-center mt-4">
        <Button variant="ghost" className="p-1" onClick={handlePreviousSet} disabled={loading || currentSet === 1}>
          <ChevronLeftIcon className="w-6 h-6" />
          <span>Previous Set</span>
        </Button>
        <Button variant="ghost" className="p-1" onClick={handleNextSet} disabled={loading}>
          <span>Next Set</span>
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

function ChevronLeftIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CircleCheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CircleXIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function FlagIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function InfoIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}

export default MCQsComponent;
