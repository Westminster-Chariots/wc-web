"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, getTranslation } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;
  cycleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("wc-language") as Language;
    if (savedLang && ["EN", "ES", "DE"].includes(savedLang)) {
      setLangState(savedLang);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("wc-language", newLang);
  };

  // Cycle through languages
  const cycleLang = () => {
    const languages: Language[] = ["EN", "ES", "DE"];
    const currentIndex = languages.indexOf(lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLang(languages[nextIndex]);
  };

  const t = getTranslation(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, cycleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
