"use client"; // Add this directive at the top

import React, { useState } from "react";
import Sidebar from "@/components/component/Sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import CreateQuestionBank from '@/components/component/CreateQuestionBank';

const NewQuestionBankPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider>
      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-grow p-5 transition-all duration-500 ${isSidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <CreateQuestionBank />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default NewQuestionBankPage;
