import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { SetNumberContext } from '@/components/component/SetNumberContext';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

interface Option {
  body: string;
  isItCorrect: boolean;
}

interface MCQ {
  _id: string;
  question: string;
  options: Option[];
}

interface MCQsComponentProps {
  mcqs: MCQ[];
}

const MCQsComponent: React.FC<MCQsComponentProps> = ({ mcqs: initialMcqs }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>(initialMcqs || []);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: { selected: string; isItCorrect: boolean } }>({});
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
      try {
        const response = await axios.get(`/api/${id}/mcqs/responses`, { params: { setNumber: currentSet } });
        const answers = response.data.reduce((acc: any, item: any) => ({
          ...acc,
          [item.mcqId]: { selected: item.answerGiven, isCorrect: item.answeredCorrectly }
        }), {});
        setSelectedAnswers(answers);
      } catch (error) {
        console.error('Failed to fetch responses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id && currentSet) {
      fetchResponses();
    }
  }, [id, currentSet]);

  const handleAnswerClick = async (mcqId: string, option: string, isItCorrect: boolean) => {
    const newAnswers = {
      ...selectedAnswers,
      [mcqId]: { selected: option, isItCorrect }
    };
    setSelectedAnswers(newAnswers);

    try {
      await axios.post(`/api/${id}/mcqs/responses`, {
        mcqId,
        answerGiven: option,
        answeredCorrectly: isItCorrect,
        setNumber: currentSet
      });
    } catch (error) {
      console.error('Error recording answer:', error);
    }

    // Check if the answer is incorrect and send the missed question
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
      const response = await axios.get(`/api/${id}/mcqs`, { params: { setNumber } });

      if (response.status === 202) {
        // Retry after a delay if the MCQs are still being generated
        fetchTimeoutRef.current = setTimeout(() => {
          fetchNewSet(setNumber);
        }, 5000);
      } else if (response.status === 200) {
        setCurrentSet(setNumber);
        setSelectedAnswers({});
        setMcqs(response.data.mcqs || []); // Update MCQs here
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
        <div>Loading...</div>
      ) : (
        mcqs.map((mcq, index) => (
          <div key={mcq._id} className="p-6 border border-gray-200 rounded-md space-y-4 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="p-1">
                  <FlagIcon className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-semibold">Question {index + 1}</h2>
              </div>
            </div>
            <div className="mb-8 space-y-2">
              <p className="text-base">{mcq.question}</p>
            </div>
            <div className="space-y-4">
              {mcq.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`q${index + 1}a${idx + 1}`}
                    name={`question${index + 1}`}
                    className="mr-2"
                    checked={selectedAnswers[mcq._id]?.selected === option.body}
                    onChange={() => handleAnswerClick(mcq._id, option.body, option.isItCorrect)}
                    onBlur={() => !selectedAnswers[mcq._id] && sendMissedQuestion(mcq._id)}
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

export default MCQsComponent;
