import React, { createContext, useState, ReactNode } from 'react';

interface SetNumberContextProps {
  currentSet: number;
  setCurrentSet: React.Dispatch<React.SetStateAction<number>>;
}

export const SetNumberContext = createContext<SetNumberContextProps | undefined>(undefined);

interface SetNumberProviderProps {
  children: ReactNode;
}

export const SetNumberProvider: React.FC<SetNumberProviderProps> = ({ children }) => {
  const [currentSet, setCurrentSet] = useState<number>(1);

  return (
    <SetNumberContext.Provider value={{ currentSet, setCurrentSet }}>
      {children}
    </SetNumberContext.Provider>
  );
};
