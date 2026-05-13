"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import BookingModal from "./BookingModal";

interface BookingBarProps {
  bookingMode: "oneway" | "hourly";
  pickup: string;
  dropoff: string;
  pickupDate: string;
  pickupTime: string;
  onPickupChange: (value: string, isAirport?: boolean) => void;
  onDropoffChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSubmit: () => void;
  todayIso: string;
  currentTime: string;
}

export default function BookingBar({
  bookingMode,
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  onPickupChange,
  onDropoffChange,
  onDateChange,
  onTimeChange,
  onSubmit,
  todayIso,
  currentTime,
}: BookingBarProps) {
  const [activeModal, setActiveModal] = useState<"pickup" | "dropoff" | "date" | "time" | null>(null);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });

  const openModal = (type: "pickup" | "dropoff" | "date" | "time", event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const isFormValid = pickup && (bookingMode === "hourly" || dropoff) && pickupDate && pickupTime;

  return (
    <>
      <div className="max-w-[1280px] mx-auto glass-strong rounded-md p-0 flex flex-col md:flex-row md:items-center overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center w-full">
          {/* Pickup */}
          <button
            onClick={(e) => openModal("pickup", e)}
            className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] flex-1 text-left"
          >
            <div className="text-[12px] font-semibold text-foreground">Pickup location</div>
            <div className="mt-1 border-b border-white/15 pb-1">
              <div className="text-[14px] text-foreground">
                {pickup || <span className="text-foreground/45">Address, airport, hotel, …</span>}
              </div>
            </div>
          </button>

          <div className="hidden md:block h-12 w-px bg-white/10" />

          {/* Dropoff (only for oneway) */}
          {bookingMode === "oneway" && (
            <>
              <button
                onClick={(e) => openModal("dropoff", e)}
                className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] flex-1 text-left"
              >
                <div className="text-[12px] font-semibold text-foreground">Drop-off location</div>
                <div className="mt-1 border-b border-white/15 pb-1">
                  <div className="text-[14px] text-foreground">
                    {dropoff || <span className="text-foreground/45">Address, airport, hotel, …</span>}
                  </div>
                </div>
              </button>
              <div className="hidden md:block h-12 w-px bg-white/10" />
            </>
          )}

          {/* Date */}
          <button
            onClick={(e) => openModal("date", e)}
            className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] md:w-[200px] text-left"
          >
            <div className="text-[12px] font-semibold text-foreground">Date</div>
            <div className="mt-1 border-b border-white/15 pb-1">
              <div className="text-[14px] text-foreground">
                {pickupDate || <span className="text-foreground/45">Select a date</span>}
              </div>
            </div>
          </button>

          <div className="hidden md:block h-12 w-px bg-white/10" />

          {/* Time */}
          <button
            onClick={(e) => openModal("time", e)}
            className="group block px-6 py-4 transition-colors hover:bg-white/[0.03] md:w-[200px] text-left"
          >
            <div className="text-[12px] font-semibold text-foreground">Pickup time</div>
            <div className="mt-1 border-b border-white/15 pb-1">
              <div className="text-[14px] text-foreground">
                {pickupTime || <span className="text-foreground/45">Select time</span>}
              </div>
            </div>
          </button>

          {/* Submit Button */}
          <div className="p-3 md:p-4">
            <Button
              onClick={onSubmit}
              className="bg-blue-gradient shadow-blue w-full md:w-auto rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid}
            >
              View options
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={activeModal === "pickup"}
        type="pickup"
        origin={modalOrigin}
        value={pickup}
        onClose={closeModal}
        onChange={onPickupChange}
      />

      <BookingModal
        isOpen={activeModal === "dropoff"}
        type="dropoff"
        origin={modalOrigin}
        value={dropoff}
        onClose={closeModal}
        onChange={onDropoffChange}
      />

      <BookingModal
        isOpen={activeModal === "date"}
        type="date"
        origin={modalOrigin}
        value={pickupDate}
        onClose={closeModal}
        onChange={onDateChange}
        minDate={todayIso}
      />

      <BookingModal
        isOpen={activeModal === "time"}
        type="time"
        origin={modalOrigin}
        value={pickupTime}
        onClose={closeModal}
        onChange={onTimeChange}
        minTime={pickupDate === todayIso ? currentTime : "00:00"}
      />
    </>
  );
}
