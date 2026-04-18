"use client";
import { createContext, useContext, useState } from "react";

type Lang = "en" | "es";

const translations = {
  en: {
    "nav.services": "Services",
    "nav.fleet": "Fleet",
    "nav.signIn": "Sign In",
    "nav.dashboard": "Dashboard",
    "nav.signOut": "Sign Out",
    "hero.badge": "DC's Premier Black Car Service",
    "hero.title1": "Your Chariot",
    "hero.title2": "Awaits",
    "hero.desc": "Westminster Chariots delivers professional chauffeur service across Washington DC, Northern Virginia, and Maryland — built on reliability, discretion, and exceptional service.",
    "hero.bookRide": "Book Your Ride",
    "hero.callDispatch": "Call Dispatch",
    "hero.licensed": "Licensed & Insured",
    "hero.247": "24/7 Availability",
    "hero.rated": "5-Star Rated",
    "search.title": "Where are you going?",
    "search.from": "From",
    "search.fromPlaceholder": "Airport, hotel, or address...",
    "search.to": "To",
    "search.toPlaceholder": "Destination address...",
    "search.date": "Date",
    "search.time": "Time",
    "search.button": "Search",
    "search.calculating": "Calculating route...",
    "search.wait": "Chauffeur will wait 15 minutes free of charge",
    "services.label": "Our Services",
    "services.heading": "Executive Transportation, Elevated",
    "services.desc": "From airport transfers to diplomatic convoys, we deliver white-glove service across the entire DC Metropolitan area.",
    "services.airport": "Airport Transfers",
    "services.airportDesc": "DCA, IAD, BWI — flight tracking, meet & greet signage, complimentary 15-minute wait. FBO and general aviation supported.",
    "services.corporate": "Corporate & Diplomatic",
    "services.corporateDesc": "Secure executive transport for government officials, diplomats, and corporate leadership. Discretion guaranteed.",
    "services.p2p": "Point-to-Point",
    "services.p2pDesc": "Premium black car service across DC, Virginia, and Maryland. Hotels, embassies, restaurants, events — anywhere you need to be.",
    "fleet.label": "The Fleet",
    "fleet.heading": "Mercedes-Benz Excellence",
    "fleet.desc": "Every ride is a statement. Our meticulously maintained Mercedes-Benz fleet delivers the executive environment you expect — premium leather, bottled water, climate control, and a professional chauffeur who knows the capital like the back of their hand.",
    "fleet.sedan": "Business Sedan",
    "fleet.sedanSub": "Mercedes E-Class · 1–3 Pax",
    "fleet.suv": "Business SUV",
    "fleet.suvSub": "GLS / Suburban · 1–6 Pax",
    "fleet.wifi": "WiFi Available",
    "fleet.wifiSub": "Stay connected on the move",
    "fleet.flight": "Flight Tracking",
    "fleet.flightSub": "We monitor your arrival",
    "why.heading": "Why Westminster Chariots",
    "why.chauffeurs": "Vetted Chauffeurs",
    "why.chauffeursDesc": "Background-checked, professionally trained, and suited.",
    "why.fleet": "Mercedes Fleet",
    "why.fleetDesc": "Late-model E-Class sedans and GLS/Suburban SUVs.",
    "why.ontime": "On-Time Guarantee",
    "why.ontimeDesc": "We arrive 15 minutes early, every time.",
    "why.corporate": "Corporate Accounts",
    "why.corporateDesc": "Monthly billing, priority booking, and dedicated support.",
    "footer.location": "Triangle, VA · Serving the DMV",
    "cta.bookNow": "Book Now",
  },
  es: {
    "nav.services": "Servicios",
    "nav.fleet": "Flota",
    "nav.signIn": "Iniciar Sesión",
    "nav.dashboard": "Panel",
    "nav.signOut": "Cerrar Sesión",
    "hero.badge": "Servicio Premier de Auto Negro en DC",
    "hero.title1": "Tu Carruaje",
    "hero.title2": "Te Espera",
    "hero.desc": "Westminster Chariots ofrece servicio profesional de chófer en Washington DC, el norte de Virginia y Maryland — basado en confiabilidad, discreción y un servicio excepcional.",
    "hero.bookRide": "Reservar Viaje",
    "hero.callDispatch": "Llamar Despacho",
    "hero.licensed": "Licenciado y Asegurado",
    "hero.247": "Disponibilidad 24/7",
    "hero.rated": "Calificación 5 Estrellas",
    "search.title": "¿A dónde vas?",
    "search.from": "Desde",
    "search.fromPlaceholder": "Aeropuerto, hotel o dirección...",
    "search.to": "Hasta",
    "search.toPlaceholder": "Dirección de destino...",
    "search.date": "Fecha",
    "search.time": "Hora",
    "search.button": "Buscar",
    "search.calculating": "Calculando ruta...",
    "search.wait": "El chófer esperará 15 minutos sin cargo",
    "services.label": "Nuestros Servicios",
    "services.heading": "Transporte Ejecutivo, Elevado",
    "services.desc": "Desde traslados al aeropuerto hasta convoyes diplomáticos, brindamos servicio de primera clase en toda el área metropolitana de DC.",
    "services.airport": "Traslados al Aeropuerto",
    "services.airportDesc": "DCA, IAD, BWI — seguimiento de vuelos, señalización de bienvenida, espera gratuita de 15 minutos.",
    "services.corporate": "Corporativo y Diplomático",
    "services.corporateDesc": "Transporte ejecutivo seguro para funcionarios gubernamentales, diplomáticos y líderes corporativos.",
    "services.p2p": "Punto a Punto",
    "services.p2pDesc": "Servicio premium de auto negro en DC, Virginia y Maryland. Hoteles, embajadas, restaurantes, eventos.",
    "fleet.label": "La Flota",
    "fleet.heading": "Excelencia Mercedes-Benz",
    "fleet.desc": "Cada viaje es una declaración. Nuestra flota Mercedes-Benz meticulosamente mantenida ofrece el ambiente ejecutivo que esperas.",
    "fleet.sedan": "Sedán Ejecutivo",
    "fleet.sedanSub": "Mercedes E-Class · 1–3 Pax",
    "fleet.suv": "SUV Ejecutivo",
    "fleet.suvSub": "GLS / Suburban · 1–6 Pax",
    "fleet.wifi": "WiFi Disponible",
    "fleet.wifiSub": "Mantente conectado en movimiento",
    "fleet.flight": "Seguimiento de Vuelo",
    "fleet.flightSub": "Monitoreamos tu llegada",
    "why.heading": "¿Por Qué Westminster Chariots?",
    "why.chauffeurs": "Chóferes Verificados",
    "why.chauffeursDesc": "Con verificación de antecedentes, profesionalmente capacitados.",
    "why.fleet": "Flota Mercedes",
    "why.fleetDesc": "Sedanes E-Class y SUVs GLS/Suburban de último modelo.",
    "why.ontime": "Garantía de Puntualidad",
    "why.ontimeDesc": "Llegamos 15 minutos antes, siempre.",
    "why.corporate": "Cuentas Corporativas",
    "why.corporateDesc": "Facturación mensual, reservas prioritarias y soporte dedicado.",
    "footer.location": "Triangle, VA · Sirviendo el DMV",
    "cta.bookNow": "Reservar Ahora",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType>({ lang: "en", toggleLang: () => {}, t: (k) => k });
export const useLanguage = () => useContext(LangContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = () => setLang((l) => (l === "en" ? "es" : "en"));
  const t = (key: TranslationKey): string => translations[lang][key] ?? key;
  return <LangContext.Provider value={{ lang, toggleLang, t }}>{children}</LangContext.Provider>;
}
