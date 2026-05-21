import React from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  min?: string;
  onChange: (v: string) => void;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, min, onChange, label }) => {
  return (
    <label className="flex flex-col text-sm">
      {label && <span className="text-xs text-muted-foreground mb-1">{label}</span>}
      <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-input/60">
        <Calendar className="w-4 h-4 text-primary" />
        <input
          type="date"
          className="appearance-none bg-transparent outline-none text-sm w-full"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
};

export default DatePicker;
