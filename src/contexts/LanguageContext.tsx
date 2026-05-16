"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "EN" | "ES" | "DE";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  cycleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  EN: {
    "nav.services": "Services",
    "nav.fleet": "Our Fleet",
    "nav.help": "Help",
    "nav.signin": "Sign In",
    "hero.title": "Travel in Luxury · Arrive in Style",
    "booking.pickup": "Pickup Location",
    "booking.dropoff": "Dropoff Location",
    "common.booknow": "Book Now",
  },
  ES: {
    "nav.services": "Servicios",
    "nav.fleet": "Nuestra Flota",
    "nav.help": "Ayuda",
    "nav.signin": "Iniciar Sesión",
    "hero.title": "Viaja con Lujo · Llega con Estilo",
    "booking.pickup": "Lugar de Recogida",
    "booking.dropoff": "Lugar de Destino",
    "common.booknow": "Reservar Ahora",
  },
  DE: {
    "nav.services": "Dienstleistungen",
    "nav.fleet": "Unsere Flotte",
    "nav.help": "Hilfe",
    "nav.signin": "Anmelden",
    "hero.title": "Reisen Sie Luxuriös · Kommen Sie Stilvoll An",
    "booking.pickup": "Abholort",
    "booking.dropoff": "Zielort",
    "common.booknow": "Jetzt Buchen",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("wc-language") as Language;
    if (saved && ["EN", "ES", "DE"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("wc-language", newLang);
  };

  const cycleLang = () => {
    const langs: Language[] = ["EN", "ES", "DE"];
    const currentIndex = langs.indexOf(lang);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLang(langs[nextIndex]);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, cycleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
