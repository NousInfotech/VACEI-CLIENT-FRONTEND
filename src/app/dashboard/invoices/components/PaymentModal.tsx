"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Types
type Invoice = {
  id: string;
  docNumber: string;
  invoiceId: number;
  txnDate: string;
  dueDate: string;
  customerName: string;
  totalAmount: number;
  balance: number;
  status: string;
};

type PaymentModalProps = {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: () => void;
};

const PaymentModal = ({ invoice, onClose, onPaymentSuccess }: PaymentModalProps) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const [amount, setAmount] = useState(invoice.balance || 0);
  const [date, setDate] = useState<Date | null>(new Date());
  const [mode, setMode] = useState("");
  const [txnId, setTxnId] = useState("");
  const [note, setNote] = useState("");
  const [suppressEmail, setSuppressEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: error + success states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!amount || amount <= 0) newErrors.amount = "Amount is required and must be greater than 0.";
    if (!date) newErrors.date = "Payment date is required.";
    if (!mode) newErrors.mode = "Payment mode is required.";
    return newErrors;
  };

  const submitPayment = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setApiError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${backendUrl}invoices/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: invoice.invoiceId,
          amount,
          date: date?.toISOString().slice(0, 10),
          mode,
          txnId,
          note,
          suppressEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to record payment");
      }

      // ✅ Show success message
      setSuccessMessage("Payment recorded successfully!");
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1500); // close after 1.5s
    } catch (err: any) {
      console.error("Payment failed:", err);
      setApiError(err.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-[16px] shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md max-w-md relative">
        <div className="flex items-center justify-between px-4 pt-3">
          <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">
            Record Payment for Invoice #{invoice.docNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-rose-700 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>
        <hr className="mt-3 mb-4 border-t border-border"></hr>

        <div className="pt-0 p-4">
          {/* Amount */}
          <div className="mb-3">
            <label htmlFor="amount" className="block mb-1 font-medium">
              Amount Received *
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
            />
            {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Payment Date */}
          <div className="w-full grid mb-3">
            <label htmlFor="paymentDate" className="block mb-1 font-medium">
              Payment Date *
            </label>
            <DatePicker
              id="paymentDate"
              selected={date}
              onChange={(d) => setDate(d)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
              dateFormat="yyyy-MM-dd"
            />
            {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Payment Mode */}
          <div className="mb-3">
            <label htmlFor="paymentMode" className="block mb-1 font-medium">
              Payment Mode *
            </label>
            <select
              id="paymentMode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
            </select>
            {errors.mode && <p className="text-red-600 text-xs mt-1">{errors.mode}</p>}
          </div>

          {/* Transaction ID */}
          <div className="mb-3">
            <label htmlFor="txnId" className="block mb-1 font-medium">
              Transaction ID
            </label>
            <input
              type="text"
              id="txnId"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
              placeholder="Optional"
            />
          </div>

          {/* Note */}
          <div className="mb-3">
            <label htmlFor="note" className="block mb-1 font-medium">
              Note
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
              rows={2}
            />
          </div>

          {/* Suppress Email */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="suppressEmail"
              checked={suppressEmail}
              onChange={(e) => setSuppressEmail(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="suppressEmail" className="text-sm">
              Do not send invoice payment recorded email
            </label>
          </div>

          {/* API Error */}
          {apiError && <p className="text-red-600 text-sm mt-2">{apiError}</p>}

          {/* Success Message */}
          {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-rose-700 text-card-foreground cursor-pointer hover:bg-rose-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={submitPayment}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-sidebar-background hover:bg-sidebar-background cursor-pointer text-card-foreground disabled:opacity-50"
            >
              {loading ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
