// src/hooks/useAxios.ts
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export const useAxios = () => {
  const { user } = useAuth();
  const token = user?.accessToken;
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:4000/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include credentials if needed

  });

  return instance;
};
