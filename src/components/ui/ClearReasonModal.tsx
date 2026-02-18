"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { AlertTriangle } from "lucide-react";

interface ClearReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ClearReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Clear Document",
  message = "Please provide a reason for clearing this document. This will be logged for audit purposes.",
  confirmText = "Clear Document",
  cancelText = "Cancel",
}: ClearReasonModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setReason("");
    setIsSubmitting(false);
    onClose();
  };

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(trimmed);
      handleClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} showCloseButton={true}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" strokeWidth={2} />
          </div>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Enter reason for clearing..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Clearing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
