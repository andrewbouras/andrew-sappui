'use client';

import React, { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

interface UpgradePlanStripeProps {
  onSuccess: (paymentIntentId: string | null) => void;
}

const UpgradePlanStripe: React.FC<UpgradePlanStripeProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("us");
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      const emailInput = document.getElementById("email") as HTMLInputElement;
      if (emailInput) {
        emailInput.value = user.email;
      }
    }
  }, [user]);

  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) {
      console.error("CardElement not found or not mounted.");
      alert("Card information is missing. Please re-enter your card details.");
      setIsLoading(false);
      return;
    }

    const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV ;
    
    const token = user?.accessToken;

    try {
      const paymentMethod = await stripe?.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: (document.getElementById("cardholder-name") as HTMLInputElement).value,
          email: (document.getElementById("email") as HTMLInputElement).value,
          phone: (document.getElementById("phone") as HTMLInputElement).value,
          address: {
            line1: (document.getElementById("address-line1") as HTMLInputElement).value,
            line2: (document.getElementById("address-line2") as HTMLInputElement).value || "",
            city: (document.getElementById("city") as HTMLInputElement).value,
            state: (document.getElementById("state") as HTMLInputElement).value,
            postal_code: (document.getElementById("zip-code") as HTMLInputElement).value,
            country: country,
          },
        },
      });

      if (!paymentMethod?.paymentMethod?.id) {
        throw new Error("Failed to create payment method.");
      }

      const response = await axios.post(
        `${apiUrl}/upgrade-plan`,
        {
          paymentMethodId: paymentMethod.paymentMethod.id,
          name: paymentMethod.paymentMethod.billing_details.name,
          phone: paymentMethod.paymentMethod.billing_details.phone,
          address: paymentMethod.paymentMethod.billing_details.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === 'Subscription successful') {
        onSuccess(paymentMethod.paymentMethod.id);
      } else {
        alert('Subscription failed. Please try again.');
        onSuccess(null);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      onSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required className="w-full" defaultValue={user?.email || ""} disabled />
      </div>

      <div className="mb-4">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" required className="w-full" />
      </div>

      <div className="mb-4">
        <Label htmlFor="cardholder-name">Cardholder Name</Label>
        <Input id="cardholder-name" type="text" required className="w-full" />
      </div>

      <div className="mb-4">
        <Label htmlFor="card-element">Card Information</Label>
        <CardElement id="card-element" className="w-full" />
      </div>

      <div className="mb-4">
        <Label htmlFor="billing-address">Billing Address</Label>
        <div className="flex flex-col space-y-2">
          <Input id="address-line1" type="text" required placeholder="Address Line 1" className="w-full" />
          <Input id="address-line2" type="text" placeholder="Address Line 2" className="w-full" />
          <div className="flex space-x-2">
            <Input id="city" type="text" required placeholder="City" className="w-full" />
            <Input id="zip-code" type="text" required placeholder="ZIP" className="w-1/2" />
          </div>
          <Input id="state" type="text" required placeholder="State" className="w-full" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select value={country} onValueChange={(value) => setCountry(value)}>
          <SelectTrigger id="country" className="bg-white">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" required />
        <label htmlFor="terms" className="text-sm font-medium leading-none">
          I agree to the Terms of Service and Privacy Policy
        </label>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="mt-5 bg-blue-500 text-white font-bold py-2 px-4 rounded w-full"
      >
        {isLoading ? "Processing..." : "Complete Purchase"}
      </Button>
    </form>
  );
};

export default UpgradePlanStripe;
