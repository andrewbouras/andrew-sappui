'use client';

import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useAuth } from '@/contexts/AuthContext';

const StripePayment: React.FC<{ qbank: string; onSuccess: (paymentIntentId: string) => void; }> = ({ qbank, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const token = user?.accessToken;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV ;   

    try {
      const { data } = await axios.post(
        `${apiUrl}/create-payment-intent`,
        { qbank },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const clientSecret = data.clientSecret;
      if (!stripe || !elements) {
        throw new Error("Stripe or Elements has not loaded.");
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: (document.getElementById('cardholder-name') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            address: { line1: (document.getElementById('billing-address') as HTMLInputElement).value },
          },
        },
      });

      if (paymentResult.error) {
        alert(paymentResult.error.message);
      } else if (paymentResult.paymentIntent?.status === "succeeded") {
        alert("Payment successful!");
        onSuccess(paymentResult.paymentIntent.id);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input id="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700">Cardholder Name</label>
        <input id="cardholder-name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">Card Information</label>
        <CardElement id="card-element" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">Billing Address</label>
        <input id="billing-address" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-5 bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default StripePayment;
