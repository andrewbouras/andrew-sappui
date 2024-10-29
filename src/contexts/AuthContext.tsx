import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

// Define the User type
interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
}

// Define the context structure
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        if (status === "authenticated" && session?.user) {
          console.log("Session User:", session.user); // Log session user for debugging
          setUser({
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            accessToken: (session as any).user?.accessToken, // Ensure accessToken is from session.user
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to fetch user session:', (error as Error).message, (error as Error).stack);
        setIsAuthenticated(false);
      }
    };

    checkUserLoggedIn();
  }, [session, status]);

  const login = async () => {
    signIn('google');
  };

  const logout = async () => {
    signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
