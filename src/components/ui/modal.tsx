"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-brand-body">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-brand-body transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onConfirm?: () => void;
  confirmText?: string;
}

export function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "info",
  onConfirm,
  confirmText = "OK"
}: AlertModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const typeStyles = {
    success: "bg-success/10 text-success border-success/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-4">
          {type === "info" && !onConfirm && (
            <Button onClick={onClose} variant="default" className="min-w-[100px]">
              {confirmText}
            </Button>
          )}
          {onConfirm && (
            <>
              <Button onClick={onClose} variant="outline" className="min-w-[100px]">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                variant="default" 
                className={`min-w-[100px] ${typeStyles[type]}`}
              >
                {confirmText}
              </Button>
            </>
          )}
          {!onConfirm && type !== "info" && (
            <Button onClick={onClose} variant="default" className="min-w-[100px]">
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

