import LanguageContext from "context/LanguageContext";
import { useContext } from "react";

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLanguage must be used within LanguageContextProvider");

  return ctx;
}
