"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { Check } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  onAction,
  title = "Request Submitted!",
  message = "Your service request has been successfully received. Our team will review it and get back to you shortly.",
  buttonText = "Got it, thanks!",
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" showCloseButton={false}>
      <div className="flex flex-col items-center text-center p-2">
        {/* Animated Checkmark Container */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-green-100 rounded-full scale-150 opacity-20 animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg shadow-green-200">
            <Check className="w-10 h-10 text-white animate-in zoom-in duration-500" strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mb-8">
          {message}
        </p>

        {/* Action Button */}
        <Button 
          onClick={onAction || onClose}
          className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition-all shadow-md active:scale-95"
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
