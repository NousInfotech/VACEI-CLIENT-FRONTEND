// components/Insights.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import MonthlyAmountChart from "@/components/MonthlyAmountChart";
import Image from "next/image";
import { fetchPaginatedRecurringExpenses, RecurringExpense, Transaction } from "@/api/recurringExpenses"; // Import Transaction
import SkeletonRow from "@/components/SkeletonRow";
import { HugeiconsIcon } from '@hugeicons/react';
import {AttachmentIcon,} from '@hugeicons/core-free-icons';
export default function Insights() {
    const modalRef = useRef<HTMLDivElement>(null);
    const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<RecurringExpense | null>(null);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isModalOpen]);

    useEffect(() => {
        const getRecurringExpenses = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchPaginatedRecurringExpenses({ page: 1, limit: 10 });
                setRecurringExpenses(data.expenses);
            } catch (err: any) {
                console.error("Failed to fetch recurring expenses:", err);
                setError(err.message || "Failed to load recurring expenses.");
            } finally {
                setLoading(false);
            }
        };

        getRecurringExpenses();
    }, []);

    const handleRowClick = (vendor: RecurringExpense) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getChangeData = (index: number) => {
        if (index % 2 === 0) {
            return { change: "+12%", changeColor: "green" };
        } else {
            return { change: "-2%", changeColor: "red" };
        }
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium"> Insights</h1>

                <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto mt-5 transition-all duration-300 hover:shadow-md mb-5">
                    <div className="flex gap-4 items-center">
                        <div className="image flex-1/6">
                            <Image
                                src="/recurring.svg"
                                alt="Recurring Expenses"
                                width={180}
                                height={180}
                            />
                        </div>
                        <div className="content">
                            <h2 className="text-xl leading-normal text-brand-body capitalize font-semibold mb-2">About Recurring Expenses</h2>
                            <p>
                                The report contains the prepaid subscriptions and recurring expenses we've detected on your books.
                                Click a vendor below to see more details about the monthly trend and payment history.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto mt-5 transition-all duration-300 hover:shadow-md mb-5">
                    <div className="relative overflow-x-auto border">
                        <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs text-brand-body uppercase bg-brand-muted">
                                <tr>
                                    <th className="text-foreground h-10 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] p-2 border-r border-border text-center font-medium w-1/2">Vendor</th>
                                    <th className="text-foreground h-10 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] p-2 border-r border-border text-center font-medium">Current Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <SkeletonRow key={i} columns={2} />
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={2} className="text-center py-4 text-red-600">{error}</td>
                                    </tr>
                                ) : recurringExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="text-center py-4">No recurring expenses found.</td>
                                    </tr>
                                ) : (
                                    recurringExpenses.map((expense) => {
                                        return (
                                            <tr
                                                key={expense.id}
                                                className="bg-card border-b border-border cursor-pointer hover:bg-brand-body"
                                                onClick={() => handleRowClick(expense)}
                                            >
                                                <th scope="row" className="flex items-center px-6 py-4 font-medium text-brand-body">
                                                    <div className="ps-3">
                                                        <div className="text-base font-semibold">{expense.vendorName}</div>
                                                    </div>
                                                </th>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-brand-body">{formatAmount(expense.totalAmount)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && selectedVendor && (
                   <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-all">
  <div
    ref={modalRef}
    className="relative bg-card shadow-2xl rounded-2xl p-8 w-full max-w-5xl animate-fade-in border border-border"
  >
    {/* Close button */}
    <button
      onClick={() => setIsModalOpen(false)}
      className="absolute top-5 right-5 text-muted-foreground hover:text-brand-body transition"
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    {/* Header */}
    <div className="pb-6 border-b border-border mb-6 flex justify-between items-center">
      <h2 className="text-3xl font-bold text-gray-800">
        {selectedVendor.vendorName} — Overview
      </h2>
    </div>

    {/* Vendor Details - Grid */}
    <div className="grid grid-cols-2 gap-6 text-sm text-brand-body mb-8">
      <div>
        <span className="font-semibold text-brand-body block">Current Amount:</span>
        <span className="text-lg font-bold text-brand-primary">{formatAmount(selectedVendor.totalAmount)}</span>
      </div>
      <div>
        <span className="font-semibold text-brand-body block">Transaction Count:</span>
        <span>{selectedVendor.transactionCount}</span>
      </div>
      <div>
        <span className="font-semibold text-brand-body block">Active:</span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${selectedVendor.active
            ? "bg-sidebar-background text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {selectedVendor.active ? "Yes" : "No"}
        </span>
      </div>
      <div>
        <span className="font-semibold text-brand-body block">Created At:</span>
        <span>{new Date(selectedVendor.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}</span>
      </div>
    </div>

    {/* Transaction History */}
   {/* Transaction History */}
{selectedVendor.transactions && selectedVendor.transactions.length > 0 ? (
  <div>
    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
      Transactions History
    </h3>
    <div className="max-h-[28rem] overflow-y-auto border border-border rounded-xl shadow-inner">
      <table className="w-full text-sm text-left text-muted-foreground">
        <thead className="text-xs text-brand-body uppercase bg-brand-muted sticky top-0 z-10 border-b">
          <tr>
            <th className="px-5 py-3">#</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3 text-right">Amount</th>
            <th className="px-5 py-3">Attachments</th>
          </tr>
        </thead>
        <tbody>
          {selectedVendor.transactions
            .sort(
              (a, b) =>
                new Date(b.txnDate).getTime() - new Date(a.txnDate).getTime()
            )
            .map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`border-b last:border-0 transition ${
                  index % 2 === 0 ? "bg-card" : "bg-brand-body"
                } hover:bg-brand-primary50`}
              >
                {/* Index */}
                <td className="px-5 py-3 font-medium text-muted-foreground">
                  {index + 1}
                </td>

                {/* Date */}
                <td className="px-5 py-3">
                  {new Date(transaction.txnDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Amount */}
                <td
                  className={`px-5 py-3 text-right font-semibold ${
                    transaction.amount < 0
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {formatAmount(transaction.amount)}
                </td>

                {/* Attachments */}
                <td className="px-5 py-3">
                  {transaction.attachments?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {transaction.attachments.map((att, i) => {
                        const fullUrl = `${backendUrl.replace(/\/$/, "")}/${att.fileUrl.replace(/^\//, "")}`;
                        return (
                          <a
                            key={i}
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-brand-primary100 text-brand-primary700 hover:bg-brand-primary200 transition"
                          >
                              <HugeiconsIcon icon={AttachmentIcon} /> {att.fileName} 
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">None</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
) : (
  <div className="mt-6 p-6 text-center text-muted-foreground bg-brand-body border border-border rounded-lg">
    <p className="text-base font-medium">
      No transactions available for this vendor yet.
    </p>
    <p className="text-sm mt-1">Check back later or add new transactions.</p>
  </div>
)}

  </div>
</div>

                )}
            </div>
        </section>
    );
}