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
  light?: boolean;
  restrictToVirginia?: boolean;
  onValidationError?: (error: string) => void;
}

export default function LocationInput({ label, placeholder, value, onChange, icon = "pickup", light = false, restrictToVirginia = false, onValidationError }: Props) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState("");
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
    
    const requestOptions: google.maps.places.AutocompletionRequest = {
      input,
      componentRestrictions: { country: "us" },
    };
    
    if (restrictToVirginia) {
      // Restrict to Virginia bounds
      requestOptions.locationBias = {
        north: 39.4660,
        south: 36.5407,
        east: -75.2420,
        west: -83.6753
      };
      requestOptions.componentRestrictions = { country: "us" };
    } else {
      // Default DMV area bias
      requestOptions.locationBias = {
        north: 39.8,
        south: 37.8,
        east: -75.5,
        west: -78.8
      };
    }
    
    svcRef.current.getPlacePredictions(
      requestOptions,
      (predictions, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          let filtered = predictions as PlacePrediction[];
          
          // If restricting to Virginia, filter results to only Virginia locations
          if (restrictToVirginia) {
            filtered = filtered.filter(p => {
              const desc = p.description.toLowerCase();
              return desc.includes(', va') || desc.includes(', virginia') || desc.includes('virginia');
            });
          }
          
          setSuggestions(filtered);
          setIsOpen(filtered.length > 0);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      }
    );
  }, [restrictToVirginia]);

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
    setQuery(p.description);
    setSelected(true);
    setIsOpen(false);
    setValidationError("");
    if (onValidationError) onValidationError("");
    onChange(p.description, isAirportPlace(p.description, p.types));
  };

  const handleClear = () => {
    setQuery("");
    setSelected(false);
    setSuggestions([]);
    setValidationError("");
    if (onValidationError) onValidationError("");
    onChange("", false);
  };
  
  const validateLocation = () => {
    if (!query || !restrictToVirginia) return true;
    
    const lowerQuery = query.toLowerCase();
    const isVirginiaLocation = lowerQuery.includes(', va') || 
                                lowerQuery.includes(', virginia') || 
                                lowerQuery.includes('virginia');
    
    if (!isVirginiaLocation) {
      const error = "Pickup location must be in Virginia";
      setValidationError(error);
      if (onValidationError) onValidationError(error);
      return false;
    }
    
    setValidationError("");
    if (onValidationError) onValidationError("");
    return true;
  };

  const isLight = !!light;

  return (
    <div ref={ref} className="relative">
      {label && <label className={`block text-xs uppercase tracking-widest ${isLight ? "text-slate-500" : "text-white/70"} font-body font-medium mb-2`}>{label}</label>}
      <div className="relative">
        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${icon === "pickup" ? "text-blue-400" : isLight ? "text-slate-400" : "text-white/60"}`} />
        <input
          type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(false); onChange(e.target.value, false); setValidationError(""); if (onValidationError) onValidationError(""); }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              if (restrictToVirginia && query && !selected) {
                validateLocation();
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full rounded-lg border ${validationError ? "border-red-500" : isLight ? "border-slate-200" : "border-white/20"} ${isLight ? "bg-white text-black" : "bg-white/5 text-white"} pl-11 pr-10 py-3.5 text-sm font-body placeholder:${isLight ? "text-slate-400" : "text-white/50"} focus:outline-none focus:ring-1 focus:ring-blue-400/40 focus:border-blue-400/30 transition-all`}
        />
        {isSearching && <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isLight ? "text-slate-400" : "text-white/60"} animate-spin`} />}
        {query && !isSearching && (
          <button onClick={handleClear} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400 hover:text-slate-600" : "text-white/60 hover:text-white"} transition-colors`} type="button">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {validationError && (
        <p className={`mt-2 text-xs ${isLight ? "text-red-600" : "text-red-400"} font-body`}>
          {validationError}
        </p>
      )}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className={`absolute z-[9999] w-full mt-1 rounded-lg border ${isLight ? "border-slate-200 bg-white" : "border-white/20 bg-black/95"} card-shadow max-h-60 overflow-y-auto backdrop-blur-xl`}>
            {suggestions.map((pred) => {
              const isAirport = isAirportPlace(pred.description, pred.types);
              return (
                <button key={pred.place_id} onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelect(pred)}
                  className={`w-full flex items-start gap-3 px-4 py-3 ${isLight ? "hover:bg-slate-50" : "hover:bg-white/10"} border-l-2 border-l-transparent hover:border-l-blue-400 transition-all text-left`} type="button">
                  <MapPin className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-body truncate ${isLight ? "text-slate-800" : "text-white"}`}>{pred.structured_formatting.main_text}</p>
                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"} font-body truncate`}>{pred.structured_formatting.secondary_text}</p>
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
