import { createContext, ReactNode, useEffect, useState } from "react";

type LanguageType = "ko" | "en";

interface ICreateContext {
  language: LanguageType;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<ICreateContext | null>(null);

export const LanguageContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [language, setLanguage] = useState<LanguageType>("ko");

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === "ko" ? "en" : "ko";
      localStorage.setItem("language", next);
      return next;
    });
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage as LanguageType);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

// export const useLanguage = () => {
//   const context = useContext(LanguageContext);
//   if (!context)
//     throw new Error("useLanguage must be used within LanguageContextProvider");

//   return context;
// };
