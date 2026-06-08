"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LocationInput from "@/components/booking/LocationInput";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";

interface BookingModalsProps {
  activeModal: "pickup" | "dropoff" | "date" | "time" | null;
  modalOrigin: { x: number; y: number };
  setActiveModal: (modal: "pickup" | "dropoff" | "date" | "time" | null) => void;
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  setPickup: (value: string) => void;
  setDropoff: (value: string) => void;
  setPickupDate: (value: string) => void;
  setPickupTime: (value: string) => void;
  setIsPickupAirport: (isAirport: boolean) => void;
  bookingMode: "oneway" | "hourly";
  handlePickupConfirm: () => void;
  handleDropoffConfirm: () => void;
  handleDateConfirm: () => void;
  handleTimeConfirm: () => void;
}

export default function BookingModals({
  activeModal,
  modalOrigin,
  setActiveModal,
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  setPickup,
  setDropoff,
  setPickupDate,
  setPickupTime,
  setIsPickupAirport,
  bookingMode,
  handlePickupConfirm,
  handleDropoffConfirm,
  handleDateConfirm,
  handleTimeConfirm,
}: BookingModalsProps) {
  const [pickupError, setPickupError] = useState("");
  
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const currentTime = `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;
  
  const canProceedPickup = pickup && !pickupError;

  if (!activeModal) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={() => setActiveModal(null)}
    >
      <motion.div
        initial={{ 
          scale: 0,
          x: modalOrigin.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0),
          y: modalOrigin.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0),
          opacity: 0 
        }}
        animate={{ 
          scale: 1,
          x: 0,
          y: 0,
          opacity: 1 
        }}
        exit={{ 
          scale: 0,
          x: modalOrigin.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0),
          y: modalOrigin.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0),
          opacity: 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative rounded-2xl p-6 max-w-md w-full"
        style={{
          background: '#1a1a1a66',
          backdropFilter: 'blur(80px) saturate(200%)',
          WebkitBackdropFilter: 'blur(80px) saturate(200%)',
          border: '1px solid #fff3',
          boxShadow: '0 32px 100px -20px #000c, inset 0 1px #ffffff1a'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {activeModal === "pickup" && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-serif text-white mb-1">Where are we picking you up?</h2>
              <p className="text-white/70 mb-4 text-sm">Set your pickup location.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <LocationInput 
                placeholder="Address, airport, hotel, …" 
                value={pickup}
                onChange={(v, isAirport) => { 
                  setPickup(v); 
                  if (v) setIsPickupAirport(isAirport); 
                }} 
                icon="pickup"
                restrictToVirginia={true}
                onValidationError={(error) => setPickupError(error)}
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handlePickupConfirm}
              disabled={!canProceedPickup}
              className="w-full mt-4 bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Continue
            </motion.button>
            {pickupError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-red-400 font-body text-center"
              >
                Please select a valid location in Virginia to continue
              </motion.p>
            )}
          </div>
        )}

        {activeModal === "dropoff" && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-serif text-white mb-1">Where to?</h2>
              <p className="text-white/70 mb-4 text-sm">Your destination awaits.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <LocationInput 
                placeholder="Address, airport, hotel, …" 
                value={dropoff}
                onChange={(v) => setDropoff(v)} 
                icon="dropoff" 
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleDropoffConfirm}
              disabled={!dropoff}
              className="w-full mt-4 bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </motion.button>
          </div>
        )}

        {activeModal === "date" && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-serif text-white mb-1">When do you need us?</h2>
              <p className="text-white/70 mb-4 text-sm">Choose your date. We're available 24/7.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <DatePicker 
                value={pickupDate}
                onChange={setPickupDate}
                minDate={todayIso}
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleDateConfirm}
              disabled={!pickupDate}
              className="w-full mt-4 bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue/50"
            >
              Continue
            </motion.button>
          </div>
        )}

        {activeModal === "time" && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-serif text-white mb-1">What time?</h2>
              <p className="text-white/70 mb-4 text-sm">Select your pickup time.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <TimePicker 
                value={pickupTime}
                onChange={setPickupTime}
                minTime={pickupDate === todayIso ? currentTime : "00:00"}
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleTimeConfirm}
              disabled={!pickupTime}
              className="w-full mt-4 bg-blue-gradient shadow-blue rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue/50"
            >
              View Options
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}