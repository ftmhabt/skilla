import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

interface Field {
  fields: {
    name: string;
    checklist: {
      topic: {
        name: string;
        isChecked: boolean;
      };
      subTopic: {
        name: string;
        isChecked: boolean;
      }[];
    }[];
  };
}

interface GlobalContextType {
  fields: Field[];
  setFields: Dispatch<SetStateAction<Field[]>>;
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
