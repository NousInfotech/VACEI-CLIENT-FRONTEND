"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "destructive";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Are you sure you want to discard them?",
  confirmText = "Discard Changes",
  cancelText = "Keep Editing",
  variant = "warning",
}: ConfirmationModalProps) {
  const iconColor = variant === "destructive" ? "bg-red-500 shadow-red-200" : "bg-amber-500 shadow-amber-200";
  const iconBg = variant === "destructive" ? "bg-red-100" : "bg-amber-100";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" showCloseButton={false}>
      <div className="flex flex-col items-center text-center p-2">
        {/* Animated Warning Icon */}
        <div className="relative mb-6">
          <div className={`absolute inset-0 ${iconBg} rounded-full scale-150 opacity-20 animate-pulse`} />
          <div className={`relative flex items-center justify-center w-20 h-20 ${iconColor} rounded-full shadow-lg`}>
            <AlertTriangle className="w-10 h-10 text-white animate-in zoom-in duration-500" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mb-8">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition-all shadow-md active:scale-95"
          >
            {confirmText}
          </Button>
          <Button 
            variant="ghost"
            onClick={onClose}
            className="w-full h-12 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition-all"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
