"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";

type AlertVariant = "success" | "danger" | "warning" | "info";

interface Alert {
  message: string;
  variant?: AlertVariant;
  duration?: number;
}

interface AlertContextType {
  setAlert: (alert: Alert) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used inside AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const setAlert = (alert: Alert) => {
    switch (alert.variant) {
      case "success":
        toast.success(alert.message);
        break;
      case "danger":
        toast.error(alert.message);
        break;
      case "warning":
        toast.warning(alert.message);
        break;
      case "info":
        toast.info(alert.message);
        break;
      default:
        toast(alert.message);
    }
  };

  return (
    <AlertContext.Provider value={{ setAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
