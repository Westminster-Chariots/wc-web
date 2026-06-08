"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import LocationInput from "./LocationInput";

type ModalType = "pickup" | "dropoff" | "date" | "time";

interface BookingModalProps {
  isOpen: boolean;
  type: ModalType;
  origin: { x: number; y: number };
  value: string;
  onClose: () => void;
  onChange: (value: string, isAirport?: boolean) => void;
  minDate?: string;
  minTime?: string;
}

const modalContent = {
  pickup: {
    title: "Where are we picking you up?",
    subtitle: "Set your pickup in over 64 countries. We'll be there on time.",
  },
  dropoff: {
    title: "Where to?",
    subtitle: "Your destination awaits. Professional service, every mile.",
  },
  date: {
    title: "When do you need us?",
    subtitle: "Choose your date. We're available 24/7, every day of the year.",
  },
  time: {
    title: "What time?",
    subtitle: "Select your pickup time. Punctuality is our promise.",
  },
};

export default function BookingModal({
  isOpen,
  type,
  origin,
  value,
  onClose,
  onChange,
  minDate,
  minTime,
}: BookingModalProps) {
  const content = modalContent[type];
  const [validationError, setValidationError] = useState("");

  const handleConfirm = () => {
    if (value && !validationError) {
      onClose();
    }
  };

  // Calculate the offset from origin to center
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
  const offsetX = origin.x - centerX;
  const offsetY = origin.y - centerY;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{
                scale: 0.3,
                x: offsetX,
                y: offsetY,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                x: 0,
                y: 0,
                opacity: 1,
              }}
              exit={{
                scale: 0.3,
                x: offsetX,
                y: offsetY,
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
                opacity: { duration: 0.3 },
              }}
              className="glass-strong rounded-3xl p-8 max-w-2xl w-full pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-serif text-foreground mb-2">{content.title}</h2>
                <p className="text-foreground/70">{content.subtitle}</p>
              </motion.div>

              {/* Input Field */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {(type === "pickup" || type === "dropoff") && (
                  <div className="location-input-wrapper">
                    <LocationInput
                      placeholder="Address, airport, hotel, …"
                      value={value}
                      onChange={(v, isAirport) => onChange(v, isAirport)}
                      icon={type}
                      restrictToVirginia={type === "pickup"}
                      onValidationError={(error) => setValidationError(error)}
                    />
                  </div>
                )}

                {type === "date" && (
                  <input
                    type="date"
                    value={value}
                    min={minDate}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-lg text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                  />
                )}

                {type === "time" && (
                  <input
                    type="time"
                    value={value}
                    min={minTime}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-lg text-foreground focus:outline-none focus:border-blue-400 transition-colors"
                  />
                )}
              </motion.div>

              {/* Confirm Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                onClick={handleConfirm}
                disabled={!value || (type === "pickup" && validationError !== "")}
                className="w-full mt-6 bg-blue-gradient shadow-blue rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Confirm
              </motion.button>
              {validationError && type === "pickup" && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-red-400 font-body text-center"
                >
                  Please select a valid location in Virginia
                </motion.p>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
