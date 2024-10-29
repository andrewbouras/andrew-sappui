'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const ManageSubscription: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomerPortal = async () => {
      if (!user) return;

      try {

        const apiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_URL_DEV ;
      
        const response = await axios.post(`${apiUrl}/create-customer-portal-session`, {}, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });

        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          console.error('Error fetching customer portal URL:', response.data.message);
        }
      } catch (error) {
        console.error('Error redirecting to customer portal:', error);
      }
    };

    fetchCustomerPortal();
  }, [user]);

  return <div>Redirecting to your subscription management...</div>;
};

export default ManageSubscription;
