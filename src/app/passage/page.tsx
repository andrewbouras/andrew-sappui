'use client'; // Add this at the top to mark this as a client component

import { useSession, signIn } from "next-auth/react";
import React, { useState } from "react";
import New from '@/components/component/new';
import { Authloading } from '@/components/component/authloading';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { signin } from "@/components/component/signin"; // Ensure the path is correct

export default function NewPage() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return signin(); 
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider>
      <div className="flex">
          <Authloading />
      </div>
    </ThemeProvider>
  );
}
