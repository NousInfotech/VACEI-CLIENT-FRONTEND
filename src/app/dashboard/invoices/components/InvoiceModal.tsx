"use client";

import React from "react";
import { HugeiconsIcon } from '@hugeicons/react';
import { AttachmentIcon } from '@hugeicons/core-free-icons';

// Types
type InvoiceItem = {
  itemName: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
};

type InvoiceAttachment = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  attachableId: string;
  originalName: string;
};

type Invoice = {
  id: string;
  docNumber: string;
  txnDate: string;
  dueDate: string;
  customerName: string;
  totalAmount: number;
  balance: number;
  status: string;
  lineItems?: InvoiceItem[];
  attachments?: InvoiceAttachment[];
};

type InvoiceModalProps = {
  invoice: Invoice | null;
  onClose: () => void;
};

const InvoiceModal = ({ invoice, onClose }: InvoiceModalProps) => {
  const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-[16px] shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md max-w-6xl relative overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-4 pt-3">
          <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">
            Invoice #{invoice.docNumber}
          </h2>
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-rose-700 text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>
        <hr className="mt-3 mb-4 border-t border-border"></hr>

        <div className="pt-0 p-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 text-sm">
            <div>
              <strong className="text-brand-body">Date:</strong> {invoice.txnDate?.slice(0, 10) || "-"}
            </div>
            <div>
              <strong className="text-brand-body">Due:</strong> {invoice.dueDate?.slice(0, 10) || "-"}
            </div>
            <div>
              <strong className="text-brand-body">Customer:</strong> {invoice.customerName || "-"}
            </div>
            <div>
              <strong className="text-brand-body">Total:</strong> €{invoice.totalAmount?.toFixed(2) || "0.00"}
            </div>
            <div>
              <strong className="text-brand-body">Balance:</strong> €{invoice.balance?.toFixed(2) || "0.00"}
            </div>
            <div>
              <strong className="text-brand-body">Status:</strong> {invoice.status || "-"}
            </div>
          </div>
          {/* Line Items */}
          <h3 className="text-lg leading-normal text-brand-body capitalize font-medium mb-2">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border mb-3">
              <thead className="bg-brand-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 border text-left">Item</th>
                  <th className="px-3 py-2 border text-center">Qty</th>
                  <th className="px-3 py-2 border text-center">Unit Price</th>
                  <th className="px-3 py-2 border text-center">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems?.length ? (
                  invoice.lineItems.map((item, i) => (
                    <tr key={i} className="text-center">
                      <td className="p-2 border text-left">{item.itemName || "-"}</td>
                      <td className="p-2 border">{item.quantity ?? "-"}</td>
                      <td className="p-2 border">€{item.unitPrice?.toFixed(2) ?? "-"}</td>
                      <td className="p-2 border">€{item.amount?.toFixed(2) ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-3 text-muted-foreground">
                      No line items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Attachments */}
          <h3 className="text-lg leading-normal text-brand-body capitalize font-medium mb-2">Attachments</h3>
          {invoice.attachments?.length ? (
            <ul className="space-y-2 text-sm">
              {invoice.attachments.map((att, idx) => {
                const fullUrl = `${backendUrl.replace(/\/$/, "")}/${att.fileUrl.replace(/^\//, "")}`;
                return (
                  <li
                    key={idx}
                    className="flex items-center justify-between border p-3 rounded hover:bg-brand-body"
                  >
                    <span
                      className="truncate"
                      title={att.originalName || att.fileName}
                    >
                      {att.originalName || att.fileName}
                    </span>
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-primary hover:underline text-xs"
                    >

                      View / Download
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No attachments</p>
          )}

        </div>


      </div>
    </div>
  );
};

export default InvoiceModal;
