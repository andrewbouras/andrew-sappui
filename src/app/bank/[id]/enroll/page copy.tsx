'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Qbankstripe from "@/components/component/qbankstripe"; // Note the capitalized component name

interface QuestionBank {
  title: string;
  description: string;
  paid: boolean;
  price: number;
}

const stripePromise = loadStripe("pk_test_51PpzybIT9ulrYerfjEaaJ5CUT8e61jwPjoqYfUF084y7snggVNgWBZacLdRT0zhTpTzEWJJ9ynJ0l7Uva5OdFtVZ00WDr77Ch4");

const EnrollPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const token = user?.accessToken;

  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const qbank = pathname?.split('/')[2];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api';

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

  const handleEnrollmentSuccess = async (paymentIntentId: string | null) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/qbank/${qbank}/enroll`, {
        paymentIntentId,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message === "Enrollment successful") {
        alert("Enrolled successfully!");
        router.push(`/bank/${qbank}`);
      } else {
        alert(response.data.message || "Failed to enroll");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("An error occurred while enrolling.");
    } finally {
      setLoading(false);
    }
  };

  if (!questionBank) return <p>Loading...</p>;

  if (!showPayment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="flex flex-col items-center">
          <Card className="w-[350px] text-center relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{questionBank.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{questionBank.description}</p>
              <p className="text-3xl font-bold text-green-500">{questionBank.paid ? `$${questionBank.price.toFixed(2)}` : "$0.00"}</p>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${questionBank.paid ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                onClick={() => setShowPayment(true)}
              >
                Enroll Now
              </Button>
            </CardFooter>
            <div className={`absolute top-0 right-0 text-white px-8 py-1 text-sm font-bold transform rotate-45 translate-x-8 translate-y-4 ${questionBank.paid ? "bg-yellow-600" : "bg-green-500"}`}>
              {questionBank.paid ? "PREMIUM" : "FREE"}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Complete Your Enrollment</h1>
        <h2 className="text-xl font-semibold mb-4">
          {questionBank.title} Subscription
        </h2>
        <div className="text-3xl font-bold mb-4 text-yellow-600">${questionBank.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">one-time payment</span></div>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {questionBank.paid ? "Premium" : ""} Renal Question Bank Access
            </span>
            <span>${questionBank.price.toFixed(2)}</span>
          </div>
        </div>
        <div className="border-t border-yellow-300 pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>${questionBank.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax</span>
            <span className="text-sm text-muted-foreground">Calculated at checkout</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total due today</span>
            <span>${questionBank.price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 shadow-md rounded-lg p-8">
        <h3 className="text-lg font-semibold mb-4">Contact information</h3>
        <Elements stripe={stripePromise}>
          <Qbankstripe onSuccess={handleEnrollmentSuccess} />
        </Elements>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-4 col-span-1 md:col-span-2">
        Powered by Stripe | Terms | Privacy
      </div>
    </div>
  );
};

export default EnrollPage;
