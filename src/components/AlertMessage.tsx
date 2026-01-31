"use client";

import React, { useEffect, useState } from "react";

export type AlertVariant = "success" | "danger" | "warning" | "info";

export type AlertProps = {
  message: string;
  variant?: AlertVariant;
  duration?: number;
  onClose?: () => void;
};

const variantStyles: Record<AlertVariant, string> = {
  success: "bg-success/10 text-success border border-success/30",
  danger: "bg-destructive/10 text-destructive border border-destructive/30",
  warning: "bg-warning/10 text-warning border border-warning/30",
  info: "bg-info/10 text-info border border-info/30",
};

const AlertMessage: React.FC<AlertProps> = ({
  message,
  variant = "success",
  duration = 6000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg flex justify-between items-center mb-4 transition-all duration-300 ease-out ${variantStyles[variant]}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className="ml-4 text-lg font-bold leading-none focus:outline-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default AlertMessage;
