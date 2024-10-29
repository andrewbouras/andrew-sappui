"use client"; // This indicates the component runs on the client side

import { SessionProvider } from "next-auth/react";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
};

export default ClientLayout;
