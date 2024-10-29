'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckIcon, ChevronLeftIcon, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const stripePromise = loadStripe("pk_test_51PpzybIT9ulrYerfjEaaJ5CUT8e61jwPjoqYfUF084y7snggVNgWBZacLdRT0zhTpTzEWJJ9ynJ0l7Uva5OdFtVZ00WDr77Ch4");

const UpgradePage: React.FC = () => {
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [showStripe, setShowStripe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV ;

    const fetchUserPlan = async () => {
      try {
        const response = await axios.get( `${apiUrl}/user/plan`,{
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

  const handleJoinPremium = () => {
    setShowStripe(true);
  };

  if (userPlan === 'premium') {
    return <PremiumUserComponent />;
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Choose Your MCQ Generation Plan</h1>
            <p className="text-xl text-gray-300">Unlock the power of unlimited question generation</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
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
                <Button className="w-full bg-gray-700 text-white hover:bg-gray-600" disabled>Current Plan</Button>
              </CardFooter>
            </Card>
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

        {showStripe && <StripePaymentForm setShowStripe={setShowStripe} setShowSuccess={setShowSuccess} setShowFailure={setShowFailure} />}

        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Success!</DialogTitle>
              <DialogDescription>
                You are now a premium member!
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showFailure} onOpenChange={setShowFailure}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Payment Failed</DialogTitle>
              <DialogDescription>
                Something went wrong or wrong credit card number. Please try again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowFailure(false)}>Back</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Elements>
  );
};

export default UpgradePage;

interface StripePaymentFormProps {
  setShowStripe: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFailure: React.Dispatch<React.SetStateAction<boolean>>;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ setShowStripe, setShowSuccess, setShowFailure }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const apiUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
  : process.env.NEXT_PUBLIC_API_URL_DEV ;

  const token = user?.accessToken;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      alert('Please enter your card details');
      return;
    }

    setIsLoading(true);

    const billingDetails = {
      name: (document.getElementById('cardholder-name') as HTMLInputElement).value,
      email: (document.getElementById('email') as HTMLInputElement).value,
      phone: (document.getElementById('phone') as HTMLInputElement).value,
      address: {
        line1: (document.getElementById('address-line1') as HTMLInputElement).value,
        line2: (document.getElementById('address-line2') as HTMLInputElement).value,
        city: (document.getElementById('address-city') as HTMLInputElement).value,
        state: (document.getElementById('address-state') as HTMLInputElement).value,
        postal_code: (document.getElementById('address-zip') as HTMLInputElement).value,
        country: (document.getElementById('country') as HTMLInputElement).value,
      }
    };

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (error) {
        console.error('Error creating payment method:', error);
        setShowFailure(true);
        return;
      }

      if (!paymentMethod) {
        setShowFailure(true);
        return;
      }

      const response = await axios.post(
        `${apiUrl}/upgrade-plan`,
        {
          paymentMethodId: paymentMethod.id,
          ...billingDetails,
          cardBrand: paymentMethod.card?.brand,
          cardLast4: paymentMethod.card?.last4,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setShowSuccess(true);
      } else {
        setShowFailure(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setShowFailure(true);
    } finally {
      setShowStripe(false);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={setShowStripe}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0 gap-0">
        <div className="flex items-center p-4 border-b">
          <ChevronLeftIcon className="h-5 w-5 text-gray-500 cursor-pointer" onClick={() => setShowStripe(false)} />
          <DialogTitle className="flex-grow text-center">MCQ Premium Subscription</DialogTitle>
        </div>
        <div className="p-6">
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required defaultValue={user?.email || ''} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
            </div>
            <div>
              <Label htmlFor="card-element">Card Information</Label>
              <CardElement id="card-element" className="w-full" />
            </div>
            <div>
              <Label htmlFor="cardholder-name">Name on Card</Label>
              <Input id="cardholder-name" placeholder="Full name on card" required />
            </div>
            <div>
              <Label htmlFor="address-line1">Street Address</Label>
              <Input id="address-line1" placeholder="Street address" required className="mb-2" />
              <Input id="address-line2" placeholder="Apt, suite, etc. (optional)" className="mb-2" />
              <div className="flex gap-2">
                <Input id="address-city" placeholder="City" required className="flex-grow" />
                <Input id="address-state" placeholder="State" required className="w-20" />
                <Input id="address-zip" placeholder="ZIP" required className="w-24" />
              </div>
            </div>
            <div>
              <Label htmlFor="country">Country or region</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue id="country" placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked: boolean) => setTermsAccepted(checked === true)} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the terms and conditions
              </label>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!termsAccepted || isLoading}>
                {isLoading ? 'Processing...' : 'Subscribe'}
              </Button>
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            By confirming your subscription, you allow MCQ Premium to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
      <Check className="h-5 w-5 text-purple-400" />
      <span>{children}</span>
    </li>
  );
}
