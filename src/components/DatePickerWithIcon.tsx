import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Styles based on src/components/ui/input.tsx
const inputClasses = "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

interface DatePickerWithIconProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const DatePickerWithIcon = ({
  selected,
  onChange,
  placeholder,
  className,
  id,
  minDate,
  maxDate,
  disabled
}: DatePickerWithIconProps) => {
  return (
    <div className="relative w-full">
      <DatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        className={cn(inputClasses, "pr-10", className)}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        // Ensure z-index is high enough and it breaks out of overflow hidden containers if needed
        popperProps={{
          strategy: "fixed",
        }}
        // Use portal to ensure it renders on top of everything (modals, etc)
        withPortal={false} 
        portalId="root-portal" // If a portal root exists, use it. Otherwise, default behavior usually works or we can use document.body
        
        // Custom header or other props can be added here
        onKeyDown={(e) => {
            // Ensure Tab works naturally
            if (e.key === 'Tab') {
                // let default behavior happen
            }
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default DatePickerWithIcon;
