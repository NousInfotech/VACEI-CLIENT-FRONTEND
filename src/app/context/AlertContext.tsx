"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AlertMessage from "@/components/AlertMessage";

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
  const [alert, setAlertState] = useState<Alert | null>(null);

  const setAlert = (alert: Alert) => {
    setAlertState(alert);
  };

  return (
    <AlertContext.Provider value={{ setAlert }}>
      {alert && (
        <AlertMessage
          message={alert.message}
          variant={alert.variant}
          duration={alert.duration}
          onClose={() => setAlertState(null)}
        />
      )}
      {children}
    </AlertContext.Provider>
  );
};
