"use client";

import { useState } from "react";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  minTime?: string;
  maxTime?: string;
}

export default function TimePicker({ value, onChange, minTime, maxTime }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(value ? parseInt(value.split(':')[0]) : null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(value ? parseInt(value.split(':')[1]) : null);
  const [isAM, setIsAM] = useState<boolean>(value ? parseInt(value.split(':')[0]) < 12 : true);

  // Generate hours (12-hour format)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Handle hour selection
  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    updateTime(hour, selectedMinute);
  };

  // Handle minute selection
  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
    updateTime(selectedHour, minute);
  };

  // Handle AM/PM toggle
  const handleAmPmToggle = (isAm: boolean) => {
    setIsAM(isAm);
    updateTime(selectedHour, selectedMinute, isAm);
  };

  // Update the time value
  const updateTime = (hour: number | null, minute: number | null, amPm?: boolean) => {
    if (hour !== null && minute !== null) {
      const currentIsAM = amPm !== undefined ? amPm : isAM;
      const hour24 = currentIsAM ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
      const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      onChange(timeString);
    }
  };

  // Check if time is disabled
  const isTimeDisabled = (hour: number, minute: number, isAm: boolean) => {
    if (!minTime && !maxTime) return false;
    
    const hour24 = isAm ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (minTime && timeString < minTime) return true;
    if (maxTime && timeString > maxTime) return false;
    
    return false;
  };

  return (
    <div className="bg-black/95 rounded-xl border border-white/20 p-4 backdrop-blur-xl shadow-2xl">
      {/* Time Display */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-white mb-1">
          {selectedHour !== null ? selectedHour.toString().padStart(2, '0') : '--'}:{selectedMinute !== null ? selectedMinute.toString().padStart(2, '0') : '--'}
          <span className="text-base font-normal text-white/60 ml-1">{isAM ? 'AM' : 'PM'}</span>
        </div>
        <div className="text-xs text-white/60">Selected Time</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Hours Column */}
        <div>
          <div className="text-xs font-medium text-white/60 mb-2 text-center">Hour</div>
          <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {hours.map((hour) => {
              const disabled = isTimeDisabled(hour, selectedMinute || 0, isAM);
              const selected = selectedHour === hour;
              
              return (
                <button
                  key={hour}
                  onClick={() => !disabled && handleHourSelect(hour)}
                  disabled={disabled}
                  className={`
                    py-2 rounded-lg text-xs font-medium transition-all duration-300
                    ${disabled 
                      ? 'text-white/30 cursor-not-allowed' 
                      : selected
                        ? 'bg-blue-gradient text-white scale-105'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {hour}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minutes Column */}
        <div>
          <div className="text-xs font-medium text-white/60 mb-2 text-center">Minute</div>
          <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {minutes.map((minute) => {
              const disabled = isTimeDisabled(selectedHour || 1, minute, isAM);
              const selected = selectedMinute === minute;
              
              return (
                <button
                  key={minute}
                  onClick={() => !disabled && handleMinuteSelect(minute)}
                  disabled={disabled}
                  className={`
                    py-2 rounded-lg text-xs font-medium transition-all duration-300
                    ${disabled 
                      ? 'text-white/30 cursor-not-allowed' 
                      : selected
                        ? 'bg-blue-gradient text-white scale-105'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AM/PM Toggle */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex gap-1.5">
          <button
            onClick={() => handleAmPmToggle(true)}
            className={`
              flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300
              ${isAM 
                ? 'bg-blue-gradient text-white' 
                : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
              }
            `}
          >
            AM
          </button>
          <button
            onClick={() => handleAmPmToggle(false)}
            className={`
              flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300
              ${!isAM 
                ? 'bg-blue-gradient text-white' 
                : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
              }
            `}
          >
            PM
          </button>
        </div>
      </div>

      {/* Quick Time Buttons */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => {
            const now = new Date();
            const hour = now.getHours() % 12 || 12;
            const minute = Math.ceil(now.getMinutes() / 5) * 5;
            const isAm = now.getHours() < 12;
            
            setSelectedHour(hour);
            setSelectedMinute(minute);
            setIsAM(isAm);
            updateTime(hour, minute, isAm);
          }}
          className="py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all duration-300 text-xs"
        >
          Now
        </button>
        <button
          onClick={() => {
            setSelectedHour(12);
            setSelectedMinute(0);
            setIsAM(true);
            updateTime(12, 0, true);
          }}
          className="py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all duration-300 text-xs"
        >
          12:00 PM
        </button>
      </div>
    </div>
  );
}