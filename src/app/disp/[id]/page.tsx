'use client';

import { useSession, signIn } from "next-auth/react";
import React, { useState } from "react";
import { Moderndisp1 } from '@/components/component/moderndisp1'; // Ensure the path is correct
import Sidebar from '@/components/component/Sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function Bank() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return signIn(); 
  }

  return (
    <ThemeProvider>
      <div className="flex">
        <div className={`flex-grow transition-all duration-300`}>
          <Moderndisp1 />
        </div>
      </div>
    </ThemeProvider>
  );
}
