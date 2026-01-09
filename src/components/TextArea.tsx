// components/TextArea.tsx
import React from "react";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder = "",
  rows = 3,
  className = "",
}) => {
  return (
    <div className={className}>
      {label && <label className="block text-[15px] text-black mb-2 font-medium uppercase tracking-[0.2em] ml-2">{label}</label>}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-ring/50 resize-y transition-all ${
          error ? "border-destructive" : ""
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextArea;
