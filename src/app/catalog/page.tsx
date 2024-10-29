'use client';

import { useSession, signIn } from "next-auth/react";
import React, { useState } from "react";
import { QBank } from '@/components/component/qbank'; // Ensure the path is correct
import Sidebar from '@/components/component/Sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { signin } from "@/components/component/signin"; // Ensure the path is correct

export default function Catalog() {
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
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <QBank />
        </div>
      </div>
    </ThemeProvider>
  );
}
