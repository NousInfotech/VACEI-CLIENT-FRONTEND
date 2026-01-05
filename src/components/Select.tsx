// components/Select.tsx
import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  error,
  disabled = false,
  placeholder = "Select an option",
  className = "",
}) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <option value="" >
          {placeholder}
        </option>
        {options.map(({ value: optValue, label: optLabel }) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Select;
