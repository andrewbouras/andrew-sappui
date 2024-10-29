'use client';

import { useSession, signIn } from "next-auth/react";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { usePathname } from "next/navigation";
import Sidebar from '@/components/component/Sidebar'; 
import { Moderndisp1 } from '@/components/component/moderndisp1'; 
import  QuestionComponent  from '@/components/component/QuestionComponent'; 
import ShareButton from '@/components/component/ShareButton';



export default function DynamicPage() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [title, setTitle] = useState('');
  const pathname = usePathname();
  const pathParts = pathname?.split("/").filter(Boolean) || [];
  const isChapter = pathParts.includes("chapters");
  const id = pathParts[pathParts.length - 1];


  const apiUrl = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL_PRODUCTION
  : process.env.NEXT_PUBLIC_API_URL_DEV ;

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

    // Fetch title from API
    axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    })
      .then((response: { data: { chapterTitle: string } }) => {
        const chapterTitle = response.data.chapterTitle;
        setTitle(chapterTitle || `Chapter ${id}`);
      })
      .catch((error: any) => {
        console.error("Failed to load title:", error);
      });
  }, [session, status, fetchUrl]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return signIn(); 
  }

  return (
    <div className="flex">
      <div className="flex-grow transition-all duration-300">
        <ShareButton type="chapter" id={id} />
        <QuestionComponent 
          fetchUrl={fetchUrl}
          postUrl={postUrl}
          title={title}
        />
      </div>
    </div>
  );
}