import React from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  min?: string;
  onChange: (v: string) => void;
  label?: string;
  light?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, min, onChange, label, light }) => {
  const isLight = !!light;
  return (
    <label className="flex flex-col text-sm">
      {label && <span className={`text-xs mb-1 ${isLight ? "text-slate-500" : "text-muted-foreground"}`}>{label}</span>}
      <div className={`flex items-center gap-2 border rounded-md px-3 py-2 ${isLight ? "bg-white" : "bg-input/60"}`}>
        <Calendar className="w-4 h-4 text-primary" />
        <input
          type="date"
          className={`appearance-none bg-transparent outline-none text-sm w-full ${isLight ? "text-black" : "text-inherit"}`}
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
};

export default DatePicker;
