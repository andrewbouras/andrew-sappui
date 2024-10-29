'use client';

import { useSession, signIn } from "next-auth/react";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter, usePathname } from "next/navigation";
import Sidebar from '@/components/component/Sidebar'; 
import { Moderndisp1 } from '@/components/component/moderndisp1'; 
import  QuestionComponent  from '@/components/component/QuestionComponent'; 

export default function DynamicPage() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [hasAccess, setHasAccess] = useState(false); // New state for access control
  const router = useRouter();
  const pathname = usePathname();
  const pathParts = pathname?.split("/").filter(Boolean) || [];
  const isChapter = pathParts.includes("chapters");
  const id = pathParts[pathParts.length - 1];

  const apiUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_API_URL_DEV;

  const fetchUrl = isChapter 
    ? `${apiUrl}/chapter/${id}/questions`
    : `${apiUrl}/qbank/${id}`;

  const postUrl = isChapter 
    ? `${apiUrl}/questions/${id}/responses`
    : `${apiUrl}/qbank/${id}/response`;

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    
    if (!session) {
      signIn(); 
    }

    // Fetch question bank access status and title from API
    axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    })
    .then((response: { data: { chapterTitle: string, hasAccess: boolean } }) => {
      const { chapterTitle, hasAccess } = response.data;
      setTitle(chapterTitle || `Chapter ${id}`);
      setHasAccess(hasAccess); // Set access status

      // If the user doesn't have access, redirect to the enroll page
      if (!hasAccess) {
        router.push(`/bank/${id}/enroll`);
      }
    })
    .catch((error: any) => {
      console.error("Failed to load title or access:", error);
    });
  }, [session, status, fetchUrl, id, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return signIn(); 
  }

  return (
    <div className="flex">
      <div className="flex-grow transition-all duration-300">
        {hasAccess && ( // Render the component only if user has access
          <QuestionComponent 
            fetchUrl={fetchUrl}
            postUrl={postUrl}
            title={title}
          />
        )}
      </div>
    </div>
  );
}
