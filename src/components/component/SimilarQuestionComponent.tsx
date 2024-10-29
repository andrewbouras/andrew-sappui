import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface Option {
  body: string;
  isItCorrect: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: Option[];
  answerGiven?: string;
}

const SimilarQuestionComponent: React.FC = () => {
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: { selected: string; isItCorrect: boolean } }>({});
  const [showAnswered, setShowAnswered] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const id = pathname?.split('/').pop()  as string;

  const token = user?.accessToken;
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const fetchQuestions = async () => {
    try {
      const unanswered = await axios.get(`/api/notes/${id}/mcqs/unanswered`);
      const answered = await axios.get(`/api/notes/${id}/mcqs/answered`);
      setUnansweredQuestions(unanswered.data);
      setAnsweredQuestions(answered.data);

      const answeredMap = answered.data.reduce((acc: any, question: Question) => {
        const selectedOption = question.options.find(option => option.body === question.answerGiven);
        acc[question._id] = { selected: question.answerGiven!, isItCorrect: selectedOption?.isItCorrect || false };
        return acc;
      }, {});
      setSelectedAnswers(answeredMap);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSelect = async (questionId: string, choiceBody: string, isItCorrect: boolean) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: { selected: choiceBody, isItCorrect }
    };
    setSelectedAnswers(newAnswers);

    try {
      await axios.post(`/api/notes/${id}/similar/responses`, {
        similarQuestionId: questionId,
        answerGiven: choiceBody,
        answeredCorrectly: isItCorrect
      });
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  };

  const toggleShowAnswered = () => {
    setShowAnswered(!showAnswered);
  };

  const handleButtonClick = () => {
    setShowQuestions(!showQuestions);
    if (!showQuestions) {
      fetchQuestions();
    }
  };

  const questions = showAnswered ? answeredQuestions : unansweredQuestions;

  return (
    <div className="relative">
      <Button variant="ghost" className="absolute top-4 left-4 p-1" onClick={handleButtonClick}>
        {showQuestions ? 'Hide Similar Questions' : 'Show Similar Questions'}
      </Button>
      {showQuestions && (
        <div className="flex flex-col items-center p-5 bg-white">
          <Button variant="ghost" onClick={toggleShowAnswered}>
            {showAnswered ? 'Hide' : 'Show'} answered questions
          </Button>
          {questions.map((question, index) => (
            <div key={question._id} className="bg-white border border-gray-200 rounded p-4 mb-4 w-full max-w-xl">
              <h3 className="mb-4">{index + 1}. {question.question}</h3>
              <div className="flex flex-col items-start">
                {question.options ? question.options.map((option, idx) => (
                  <button
                    key={option.body}
                    className={`p-2 mt-1 rounded text-left w-full ${
                      selectedAnswers[question._id]?.selected === option.body
                        ? (option.isItCorrect ? 'bg-green-300' : 'bg-red-300')
                        : (selectedAnswers[question._id] && option.isItCorrect ? 'bg-green-300' : 'bg-gray-100')
                    }`}
                    onClick={() => handleSelect(question._id, option.body, option.isItCorrect)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {String.fromCharCode(97 + idx)}) {option.body}
                  </button>
                )) : <p>No options available for this question.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarQuestionComponent;
