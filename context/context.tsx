"use client";
import { createContext, ReactNode, useState, useContext } from "react";

export interface Field {
  id: number;
  name: string;
  roadmap: {
    id: number;
    topic: string;
    subtopics:
      | {
          name: string;
          isChecked: boolean;
          checklist:
            | {
                name: string;
                isChecked: boolean;
              }[]
            | null;
        }[]
      | null;
  }[];
}

interface GlobalContextType {
  fields: Field[];
  setFields: (input: Field[]) => void;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [fields, setFields] = useState<Field[]>([]);

  return (
    <GlobalContext.Provider value={{ fields, setFields }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
