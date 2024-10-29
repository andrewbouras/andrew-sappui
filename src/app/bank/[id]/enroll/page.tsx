'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import FancyPaymentConfirmation from "@/components/component/FancyPaymentConfirmation"; 
import { useAuth } from "@/contexts/AuthContext";
import { CheckIcon } from "lucide-react";

interface QuestionBank {
  title: string;
  description: string;
  paid: boolean;
  price: number;
}

const EnrollPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const token = user?.accessToken;

  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failure' | null>(null);

  const qbank = pathname?.split('/')[2];

  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV ;

  useEffect(() => {
    if (qbank && token) {
      const fetchQuestionBank = async () => {
        try {
          const response = await axios.get(`${apiUrl}/question-bank-info/${qbank}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setQuestionBank(response.data);
        } catch (error) {
          console.error("Error fetching question bank:", error);
        }
      };
      fetchQuestionBank();
    }
  }, [qbank, token, apiUrl]);

  const handleJoinPremium = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/bank/create-checkout-session`, 
        { qbank, email: user?.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.sessionId) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentStatus('failure');
    }
  };

  if (!questionBank) return <p>Loading...</p>;

  if (paymentStatus) {
    return <FancyPaymentConfirmation status={paymentStatus} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{questionBank.title}</h1>
          <p className="text-xl text-gray-300">{questionBank.description}</p>
        </div>
        <div className="grid md:grid-cols-1 gap-8">
          {/* Premium Plan */}
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Premium Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-white">${questionBank.price.toFixed(2)}<span className="text-xl font-normal text-purple-200">/one-time</span></p>
              <ul className="space-y-2">
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited access to all notes and chapters
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited MCQ generation
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-purple-600 hover:bg-purple-100" onClick={handleJoinPremium}>
                Enroll Now for ${questionBank.price.toFixed(2)}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnrollPage;
