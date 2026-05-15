"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export default function DatePicker({ value, onChange, minDate, maxDate }: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  
  const today = new Date();
  const minDateObj = minDate ? new Date(minDate) : today;
  const maxDateObj = maxDate ? new Date(maxDate) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  // Get month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate days array
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Weekday labels
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    setSelectedDate(selected);
    onChange(selected.toISOString().split('T')[0]);
  };

  // Check if date is disabled
  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date < minDateObj || date > maxDateObj;
  };

  // Check if date is today
  const isToday = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-black/95 rounded-xl border border-white/20 p-4 backdrop-blur-xl shadow-2xl">
      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-300 text-white/80 hover:text-white"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <h3 className="text-lg font-semibold text-white">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-300 text-white/80 hover:text-white"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-white/60 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}

        {/* Days of the month */}
        {days.map((day) => {
          const disabled = isDateDisabled(day);
          const today = isToday(day);
          const selected = isSelected(day);
          
          return (
            <button
              key={day}
              onClick={() => !disabled && handleDateSelect(day)}
              disabled={disabled}
              className={`
                h-8 rounded-md flex items-center justify-center text-xs font-medium
                transition-all duration-300 relative
                ${disabled 
                  ? 'text-white/30 cursor-not-allowed' 
                  : selected
                    ? 'bg-blue-gradient text-white scale-105'
                    : today
                      ? 'text-blue-400 hover:bg-blue-400/10'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {day}
              {today && !selected && (
                <div className="absolute -bottom-0.5 w-0.5 h-0.5 rounded-full bg-blue-400"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Today Button */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            setSelectedDate(today);
            onChange(today.toISOString().split('T')[0]);
          }}
          className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all duration-300 text-sm font-medium"
        >
          Select Today
        </button>
      </div>
    </div>
  );
}