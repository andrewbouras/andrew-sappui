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

const MCQsComponent: React.FC<MCQsComponentProps> = ({ mcqs }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: { selected: string; isItCorrect: boolean } }>({});
  const id = usePathname();
  // const { id } = router.query; // Assuming `id` is `noteId`
  const context = useContext(SetNumberContext);
  const { user } = useAuth();

  const token = user?.accessToken;
  // Set the default headers for all requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;



  if (!context) {
    throw new Error("SetNumberContext must be used within a SetNumberProvider");
  }

  const { currentSet } = context;

  const [sendMissedQuestions, setSendMissedQuestions] = useState(false); // New state for the slider

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await axios.get(`/api/${id}/mcqs/responses`, { params: { setNumber: currentSet } });
        const answers = response.data.reduce((acc: any, item: any) => ({
          ...acc,
          [item.mcqId]: { selected: item.answerGiven, isCorrect: item.answeredCorrectly }
        }), {});
        setSelectedAnswers(answers);
      } catch (error) {
        console.error('Failed to fetch responses:', error);
      }
    };

    if (id && currentSet) {
      fetchResponses();
    }
  }, [id, currentSet]);

  const handleAnswerClick = async (mcqId: string, option: string, isItCorrect: boolean) => {
    console.log(`Clicked option isItCorrect value: ${isItCorrect}`);
  
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
        userId: 'UserID_here',
        setNumber: currentSet
      });
    } catch (error) {
      console.error('Error recording answer:', error);
    }
    
    if (!sendMissedQuestions) return; 
    try {
      const userId = 'UserID_here'; // Replace with actual user ID
      await axios.post(`/api/notes/${id}/mcqs/${mcqId}/generate-similar`, { userId });
    } catch (error) {
      console.error('Failed to send missed question:', error);
    }
  };

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" className="p-1">
          <ChevronLeftIcon className="w-6 h-6" />
          <span>Previous Set</span>
        </Button>
        <h1 className="text-3xl font-bold mb-4">Set Number {currentSet}</h1>
        <Button variant="ghost" className="p-1">
          <span>Next Set</span>
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
      </div>
      {mcqs.map((mcq, index) => (
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
      ))}
      <div className="flex justify-between items-center mt-4">
        <Button variant="ghost" className="p-1">
          <ChevronLeftIcon className="w-6 h-6" />
          <span>Previous Set</span>
        </Button>
        <Button variant="ghost" className="p-1">
          <span>Next Set</span>
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
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
  )
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
  )
}

function CircleCheckIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CircleXIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
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
  )
}

function InfoIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function ThumbsDownIcon(props: any) {
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
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}

function ThumbsUpIcon(props: any) {
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
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

export default MCQsComponent;
