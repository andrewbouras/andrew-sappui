'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { signIn } from 'next-auth/react';

interface EnrollmentData {
  title?: string;
  notebookId?: string;
  chapterId?: string;
  accessType?: string;
  itemType?: 'notebook' | 'chapter';
}

const EnrollPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const shortToken = pathname?.split("/")[2];

  useEffect(() => {
    if (isAuthenticated) {
      const fetchEnrollmentData = async () => {
        try {
          const apiUrl = process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
          : process.env.NEXT_PUBLIC_API_URL_DEV ;
        
          const response = await axios.get(`${apiUrl}/shared/${shortToken}`, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
          setEnrollmentData(response.data);
        } catch (error) {
          console.error("Failed to fetch enrollment data:", error);
        }
      };
      fetchEnrollmentData();
    }
  }, [shortToken, user?.accessToken, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated || !enrollmentData) {
      alert("You must be logged in to enroll.");
      return;
    }
    try {
      const token = user?.accessToken;
      const apiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
      : process.env.NEXT_PUBLIC_API_URL_DEV ;

      const enrollEndpoint = enrollmentData.itemType === 'chapter'
        ? `${apiUrl}/chapters/${enrollmentData.chapterId}/enroll`
        : `${apiUrl}/notebooks/${enrollmentData.notebookId}/enroll`;

      await axios.post(enrollEndpoint, {
        accessType: enrollmentData.accessType
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEnrolled(true);
      alert("You have been successfully enrolled!");
      
      // Redirect based on item type
      if (enrollmentData.itemType === 'chapter') {
        router.push(`/notebook/${enrollmentData.notebookId}/chapters/${enrollmentData.chapterId}`);
      } else {
        router.push(`/notebook/${enrollmentData.notebookId}`);
      }
    } catch (error) {
      console.error("Failed to enroll:", error);
      alert("Enrollment failed. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <h1 className="text-2xl">Access Denied</h1>
          <button className="mt-4 p-2 bg-blue-500 text-white rounded" onClick={() => signIn("google")}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!enrollmentData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        Enroll in {enrollmentData.title} ({enrollmentData.itemType}) as {enrollmentData.accessType === 'view-only' ? 'View Only' : 'Editor'}
      </h1>
      <Button onClick={handleEnroll} className="bg-blue-500 text-white p-2 rounded">
        Enroll
      </Button>
      {isEnrolled && <p className="mt-4 text-green-500">You are now enrolled!</p>}
    </div>
  );
};

export default EnrollPage;