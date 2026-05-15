"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES: ("places")[] = ["places"];
const AIRPORT_KEYWORDS = ["airport", "iad", "dca", "bwi", "jfk", "lga", "ewr", "phl", "rdu", "clt"];

function isAirportPlace(description: string, types: string[]): boolean {
  const lower = description.toLowerCase();
  return types.includes("airport") || AIRPORT_KEYWORDS.some((kw) => lower.includes(kw)) || lower.includes("aviation") || lower.includes("fbo");
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
  types: string[];
}

interface Props {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string, isAirport: boolean) => void;
  icon?: "pickup" | "dropoff";
}

export default function LocationInput({ label, placeholder, value, onChange, icon = "pickup" }: Props) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const svcRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
    libraries: LIBRARIES,
  });

  useEffect(() => { if (isLoaded && !svcRef.current) svcRef.current = new google.maps.places.AutocompleteService(); }, [isLoaded]);
  useEffect(() => { if (value !== query) { setQuery(value); setSelected(!!value); } }, [value]);

  const fetchSuggestions = useCallback((input: string) => {
    if (!svcRef.current || !input || input.length < 2) { setSuggestions([]); setIsOpen(false); return; }
    setIsSearching(true);
    svcRef.current.getPlacePredictions(
      { input, componentRestrictions: { country: "us" }, locationBias: { north: 39.8, south: 37.8, east: -75.5, west: -78.8 } },
      (predictions, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) { setSuggestions(predictions as PlacePrediction[]); setIsOpen(true); }
        else { setSuggestions([]); setIsOpen(false); }
      }
    );
  }, []);

  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    else { setSuggestions([]); setIsOpen(false); }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selected, fetchSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (p: PlacePrediction) => {
    setQuery(p.description); setSelected(true); setIsOpen(false);
    onChange(p.description, isAirportPlace(p.description, p.types));
  };

  const handleClear = () => { setQuery(""); setSelected(false); setSuggestions([]); onChange("", false); };

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-xs uppercase tracking-widest text-white/70 font-body font-medium mb-2">{label}</label>}
      <div className="relative">
        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${icon === "pickup" ? "text-blue-400" : "text-white/60"}`} />
        <input
          type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(false); onChange(e.target.value, false); }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/20 bg-white/5 pl-11 pr-10 py-3.5 text-sm font-body text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-blue-400/40 focus:border-blue-400/30 transition-all"
        />
        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 animate-spin" />}
        {query && !isSearching && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors" type="button">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 rounded-lg border border-white/20 bg-black/95 card-shadow overflow-hidden max-h-80 overflow-y-auto backdrop-blur-xl">
            {suggestions.map((pred) => {
              const isAirport = isAirportPlace(pred.description, pred.types);
              return (
                <button key={pred.place_id} onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelect(pred)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/10 border-l-2 border-l-transparent hover:border-l-blue-400 transition-all text-left" type="button">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-white truncate">{pred.structured_formatting.main_text}</p>
                    <p className="text-xs text-white/60 font-body truncate">{pred.structured_formatting.secondary_text}</p>
                  </div>
                  {isAirport && <span className="ml-auto text-[10px] uppercase tracking-wider text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5 font-body shrink-0">Aviation</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
