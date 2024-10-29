'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CheckIcon } from 'lucide-react';
import Link from 'next/link';

const stripePromise = loadStripe("pk_test_51PpzybIT9ulrYerfjEaaJ5CUT8e61jwPjoqYfUF084y7snggVNgWBZacLdRT0zhTpTzEWJJ9ynJ0l7Uva5OdFtVZ00WDr77Ch4");

const UpgradePage: React.FC = () => {
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV;

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await axios.get(`${apiUrl}/user/plan`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });
        setUserPlan(response.data.plan);
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };

    if (user) {
      fetchUserPlan();
    }
  }, [user]);

  const handleJoinPremium = async () => {
    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe is not loaded.');
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/create-checkout-session`,
        {
          email: user?.email,
        },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );

      const sessionId = response.data.sessionId;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (userPlan === 'premium') {
    return <PremiumUserComponent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your MCQ Generation Plan</h1>
          <p className="text-xl text-gray-300">Unlock the power of unlimited question generation</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Free Plan</CardTitle>
              <CardDescription className="text-gray-400">Get started with basic features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-white">$0<span className="text-xl font-normal text-gray-400">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Limited notes and chapters
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Basic MCQ generation
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                  Limited repeats
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-700 text-white" disabled>Current Plan</Button>
            </CardFooter>
          </Card>
          
          {/* Premium Plan */}
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Premium Plan</CardTitle>
              <CardDescription className="text-purple-200">Unlock unlimited potential</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-white">$30<span className="text-xl font-normal text-purple-200">/month</span></p>
              <ul className="space-y-2">
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited notes and chapters
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited MCQ generation
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Unlimited repeats
                </li>
                <li className="flex items-center text-white">
                  <CheckIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Advanced features and priority support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-purple-600 hover:bg-purple-100" onClick={handleJoinPremium}>
                Join Premium for $30/month
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;

const PremiumUserComponent: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <Card className="w-full max-w-3xl bg-gray-800 text-white">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold mb-2">Your MCQ Generation Plan</CardTitle>
        <p className="text-gray-400">Unlock the power of unlimited question generation</p>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="text-2xl font-bold">Premium Plan</div>
          <div className="text-4xl font-bold">$30<span className="text-xl font-normal">/month</span></div>
          <ul className="space-y-2">
            <ListItem>Unlimited notes and chapters</ListItem>
            <ListItem>Unlimited MCQ generation</ListItem>
            <ListItem>Unlimited repeats</ListItem>
            <ListItem>Advanced features and priority support</ListItem>
          </ul>
        </div>
        <div className="flex flex-col justify-between space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-lg font-semibold mb-2">Current Plan</div>
            <div className="text-2xl font-bold text-purple-400">Premium</div>
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled>
            Current Plan
          </Button>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              You're already enjoying all premium features!
            </p>
            <Link href="/manage" className="text-sm text-purple-400 hover:text-purple-300 underline">
              Manage Plan
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center space-x-2">
      <CheckIcon className="h-5 w-5 text-purple-400" />
      <span>{children}</span>
    </li>
  );
}
