"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  showCloseButton?: boolean;
  footer?: ReactNode;
  size?: "default" | "wide";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  footer,
  size = "default",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent page scroll when modal opens
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

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div
        className={`relative z-10 w-full h-[85vh] max-h-[calc(100vh-2rem)]
        bg-card border border-border rounded-lg shadow-2xl
        flex flex-col overflow-hidden
        ${size === "wide" ? "max-w-2xl" : "max-w-md"}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 className="text-xl font-semibold text-brand-body">{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-brand-body transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="shrink-0 p-4 sm:p-6 border-t border-border bg-muted/30">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ---------------- ALERT MODAL ---------------- */

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
  confirmText = "OK",
}: AlertModalProps) {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
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
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          {onConfirm ? (
            <>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="default"
                className={typeStyles[type]}
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>{confirmText}</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
