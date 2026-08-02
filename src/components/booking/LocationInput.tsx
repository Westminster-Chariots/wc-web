"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES: ("places")[] = ["places"];
const AIRPORT_KEYWORDS = ["airport", "iad", "dca", "bwi", "jfk", "lga", "ewr", "phl", "rdu", "clt"];

function isAirportPlace(description: string, types: string[]): boolean {
  const lower = description.toLowerCase();
  return (
    types.includes("airport") ||
    AIRPORT_KEYWORDS.some((kw) => lower.includes(kw)) ||
    lower.includes("aviation") ||
    lower.includes("fbo")
  );
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
  types: string[];
}

export interface PlaceDetails {
  formatted_address: string;
  placeId: string;
  lat: number | null;
  lng: number | null;
  city: string;
  state: string;
  zip: string;
}

interface Props {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string, isAirport: boolean) => void;
  onPlaceDetails?: (details: PlaceDetails) => void;
  icon?: "pickup" | "dropoff";
  light?: boolean;
}

export default function LocationInput({
  label,
  placeholder,
  value,
  onChange,
  onPlaceDetails,
  icon = "pickup",
  light = false,
}: Props) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const ref = useRef<HTMLDivElement>(null);
  const svcRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placeSvcRef = useRef<google.maps.places.PlacesService | null>(null);
  const placeSvcElRef = useRef<HTMLDivElement | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (isLoaded && !svcRef.current) {
      svcRef.current = new google.maps.places.AutocompleteService();
      const el = document.createElement("div");
      el.style.display = "none";
      document.body.appendChild(el);
      placeSvcElRef.current = el;
      placeSvcRef.current = new google.maps.places.PlacesService(el);
    }
  }, [isLoaded]);

  // Cleanup PlacesService DOM node on unmount
  useEffect(() => {
    return () => {
      if (placeSvcElRef.current?.parentNode) {
        placeSvcElRef.current.parentNode.removeChild(placeSvcElRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (value !== query) {
      setQuery(value);
      setSelected(!!value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!svcRef.current || !input || input.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setIsSearching(true);

      // Reuse or create a session token (groups keystrokes + getDetails into one billing session)
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }

      // US-only, no state/region bounds or post-selection filtering - any
      // valid US address is a valid pickup/dropoff/stop.
      const request: google.maps.places.AutocompletionRequest = {
        input,
        componentRestrictions: { country: "us" },
        sessionToken: sessionTokenRef.current,
      };

      svcRef.current.getPlacePredictions(request, (predictions, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions as PlacePrediction[]);
          setIsOpen(predictions.length > 0);
          setActiveIndex(-1);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected, fetchSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (p: PlacePrediction) => {
      setQuery(p.description);
      setSelected(true);
      setIsOpen(false);
      setActiveIndex(-1);
      onChange(p.description, isAirportPlace(p.description, p.types));

      // Fetch place details; this call + the preceding predictions share one billing session
      if (placeSvcRef.current) {
        const token = sessionTokenRef.current ?? undefined;
        sessionTokenRef.current = null; // session ends after getDetails
        placeSvcRef.current.getDetails(
          {
            placeId: p.place_id,
            fields: ["formatted_address", "geometry", "place_id", "address_components"],
            sessionToken: token,
          },
          (place, detailStatus) => {
            if (
              detailStatus === google.maps.places.PlacesServiceStatus.OK &&
              place &&
              onPlaceDetails
            ) {
              const comps = place.address_components ?? [];
              onPlaceDetails({
                formatted_address: place.formatted_address ?? p.description,
                placeId: p.place_id,
                lat: place.geometry?.location?.lat() ?? null,
                lng: place.geometry?.location?.lng() ?? null,
                city: comps.find((c) => c.types.includes("locality"))?.long_name ?? "",
                state:
                  comps.find((c) => c.types.includes("administrative_area_level_1"))?.short_name ??
                  "",
                zip: comps.find((c) => c.types.includes("postal_code"))?.long_name ?? "",
              });
            }
          }
        );
      } else {
        sessionTokenRef.current = null;
      }
    },
    [onChange, onPlaceDetails]
  );

  const handleClear = () => {
    setQuery("");
    setSelected(false);
    setSuggestions([]);
    setActiveIndex(-1);
    sessionTokenRef.current = null;
    onChange("", false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const isLight = !!light;

  return (
    <div ref={ref} className="relative">
      {label && (
        <label
          className={`block text-xs uppercase tracking-widest ${isLight ? "text-slate-500" : "text-white/70"} font-body font-medium mb-2`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <MapPin
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
            icon === "pickup" ? "text-blue-400" : isLight ? "text-slate-400" : "text-white/60"
          }`}
        />
        <input
          type="text"
          value={query}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-activedescendant={activeIndex >= 0 ? `loc-suggestion-${activeIndex}` : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(false);
            onChange(e.target.value, false);
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-lg border ${
            isLight ? "border-slate-200" : "border-white/20"
          } ${
            isLight ? "bg-white text-black" : "bg-white/5 text-white"
          } pl-11 pr-10 py-3.5 text-sm font-body placeholder:${
            isLight ? "text-slate-400" : "text-white/50"
          } focus:outline-none focus:ring-1 focus:ring-blue-400/40 focus:border-blue-400/30 transition-all`}
        />
        {isSearching && (
          <Loader2
            className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isLight ? "text-slate-400" : "text-white/60"
            } animate-spin`}
          />
        )}
        {query && !isSearching && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              isLight ? "text-slate-400 hover:text-slate-600" : "text-white/60 hover:text-white"
            } transition-colors`}
            type="button"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`absolute z-[9999] w-full mt-1 rounded-lg border ${
              isLight ? "border-slate-200 bg-white" : "border-white/20 bg-black/95"
            } card-shadow overflow-hidden backdrop-blur-xl`}
          >
            {suggestions.map((pred, idx) => {
              const isAirport = isAirportPlace(pred.description, pred.types);
              const isActive = idx === activeIndex;
              return (
                <button
                  id={`loc-suggestion-${idx}`}
                  role="option"
                  aria-selected={isActive}
                  key={pred.place_id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(pred)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full flex items-start gap-3 px-4 py-3 border-l-2 transition-all text-left ${
                    isActive
                      ? isLight
                        ? "bg-slate-100 border-l-blue-400"
                        : "bg-white/10 border-l-blue-400"
                      : "border-l-transparent " +
                        (isLight ? "hover:bg-slate-50" : "hover:bg-white/10")
                  }`}
                  type="button"
                >
                  <MapPin
                    className={`h-4 w-4 mt-0.5 shrink-0 ${
                      isActive ? "text-blue-400" : isLight ? "text-slate-400" : "text-white/40"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-body truncate ${
                        isLight ? "text-slate-800" : "text-white"
                      }`}
                    >
                      {pred.structured_formatting.main_text}
                    </p>
                    <p
                      className={`text-xs ${
                        isLight ? "text-slate-500" : "text-white/60"
                      } font-body truncate`}
                    >
                      {pred.structured_formatting.secondary_text}
                    </p>
                  </div>
                  {isAirport && (
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-blue-400 bg-blue-400/10 rounded-full px-2 py-0.5 font-body shrink-0">
                      Aviation
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
