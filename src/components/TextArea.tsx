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
      {label && <label className="block text-sm mb-1">{label}</label>}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 bg-white focus:outline-none resize-y ${
          error ? "border-red-500" : "border-blue-200/50"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextArea;
