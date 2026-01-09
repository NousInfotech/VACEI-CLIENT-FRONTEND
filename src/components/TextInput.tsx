// components/TextInput.tsx
import React from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder = "",
  type = "text",
  className = "",
}) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-black mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all ${
          error ? "border-destructive" : ""
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;
