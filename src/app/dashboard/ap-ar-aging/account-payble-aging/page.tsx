'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SkeletonRow from "@/components/SkeletonRow"; // Ensure this path is correct
// Import the specific fetchApAgingData function
import { fetchApAgingData, AgingData, AgingRow } from '@/api/agingService';
import { format, subYears, isValid,subDays } from 'date-fns'; // Import subYears and isValid
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

const formatCurrency = (amount: number) =>
    `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AccountsPayablePage() {
    const [apAgingData, setApAgingData] = useState<AgingData | null>(null);
    const [loadingAp, setLoadingAp] = useState(true);
    const [errorAp, setErrorAp] = useState<string | null>(null);

    // State for start and end dates (now Date objects for react-datepicker)
    const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 1)); // Default to one day before today
    const [endDate, setEndDate] = useState<Date | null>(new Date()); // Default to today

    // --- Fetch AP Aging Data ---
    useEffect(() => {
        const getApAgingData = async () => {
            setLoadingAp(true);
            setErrorAp(null);

            // Validate dates
            if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
                setErrorAp("Please select valid start and end dates.");
                setApAgingData(null);
                setLoadingAp(false);
                return;
            }

            if (startDate > endDate) {
                setErrorAp("Start date cannot be after end date.");
                setApAgingData(null); // Clear data if dates are invalid
                setLoadingAp(false);
                return; // Stop execution
            }

            try {
                // Format dates to YYYY-MM-DD strings for the API call
                const formattedStartDate = format(startDate, 'yyyy-MM-dd');
                const formattedEndDate = format(endDate, 'yyyy-MM-dd');

                const response = await fetchApAgingData({
                    intuitAccountId: 1, // Replace with dynamic ID if needed
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                });
                setApAgingData(response);

            } catch (err: any) {
                console.error("Error fetching AP aging data:", err); // Log the actual error for debugging
                setErrorAp(err.message || 'Failed to fetch AP aging data.');
            } finally {
                setLoadingAp(false);
            }
        };

        getApAgingData();
    }, [startDate, endDate]); // Re-fetch when either date changes

    const numberOfSkeletonTableRows = 5;

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            {/* AP Aging Section */}
            <div className="bg-card border border-border rounded-[10px] px-5 py-6 overflow-hidden mb-8">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">Accounts Payable Aging</h1>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Note: The Accounts Receivable aging report on this page displays data as of the End Date selected. This means the aging buckets (Current, 1-30 Days, etc.) are calculated based on how old the outstanding balances were relative to that specific End Date.
                </p>

                {/* Date Filters and Navigation Button */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center pt-4 pb-4 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Start Date Picker */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="startDatePicker" className="text-sm font-medium text-brand-body">Start Date:</label>
                            <DatePicker
                                id="startDatePicker"
                                selected={startDate}
                                onChange={(date: Date | null) => {
                                    // If a new start date is selected and it's after the current end date,
                                    // adjust the end date to be the new start date to maintain validity.
                                    if (date && endDate && date > endDate) {
                                        setEndDate(date);
                                    }
                                    setStartDate(date);
                                }}
                                dateFormat="yyyy-MM-dd"
                                className="border border-border rounded-md p-2 text-sm focus:ring-blue-500 focus:border-brand-primary w-full sm:w-auto"
                                maxDate={new Date()}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                            />
                        </div>

                        {/* End Date Picker */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="endDatePicker" className="text-sm font-medium text-brand-body">End Date:</label>
                            <DatePicker
                                id="endDatePicker"
                                selected={endDate}
                                onChange={(date: Date | null) => {
                                    setEndDate(date);
                                }}
                                dateFormat="yyyy-MM-dd"
                                className="border border-border rounded-md p-2 text-sm focus:ring-blue-500 focus:border-brand-primary w-full sm:w-auto"
                                minDate={startDate || undefined}
                                maxDate={new Date()}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                            />
                        </div>
                    </div>

                    {/* Button to AR Page */}
                    <Link href="/dashboard/ap-ar-aging/account-receivable-aging" passHref>
                        <button className="bg-sidebar-background hover:bg-sidebar-hover text-sidebar-foreground font-bold py-2 px-4 rounded transition-colors w-full md:w-auto shadow-md">
                            Go to Account Receivable Aging
                        </button>
                    </Link>
                </div>

                {errorAp && <p className="text-red-500 mt-4">{errorAp}</p>}

                {loadingAp ? (
                    <>
                        {/* Skeleton for Summary Row */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="border border-neutral-200 bg-card p-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>

                        {/* Skeleton for Table */}
                        <div className="bg-card shadow-md p-4 mt-4">
                            <div className="border border-neutral-200 rounded-md overflow-hidden">
                                <table className="w-full text-sm text-neutral-800">
                                    <thead className="bg-neutral-100 text-left uppercase text-xs tracking-wide text-neutral-500">
                                        <tr>
                                            <th className="px-4 py-3">Vendor</th>
                                            <th className="px-4 py-3 text-right">Current</th>
                                            <th className="px-4 py-3 text-right">1-30 Days</th>
                                            <th className="px-4 py-3 text-right">31-60 Days</th>
                                            <th className="px-4 py-3 text-right">61-90 Days</th>
                                            <th className="px-4 py-3 text-right">91+ Days</th>
                                            <th className="px-4 py-3 text-right">Total Outstanding</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(numberOfSkeletonTableRows)].map((_, i) => (
                                            <SkeletonRow key={i} columns={7} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : !apAgingData || apAgingData.rows.length === 0 ? (
                    <p className="mt-4">No AP aging data available for the selected date range.</p>
                ) : (
                    <>
                        {/* Summary Row for AP Aging */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Current</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(apAgingData.current)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">1-30 Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(apAgingData.agingBucket1_30)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">31-60 Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(apAgingData.agingBucket31_60)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">61-90 Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(apAgingData.agingBucket61_90)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">91+ Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(apAgingData.agingBucket91Over)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-card p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Total Outstanding AP</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(apAgingData.total)}</p>
                            </div>
                        </div>

                        {/* Table for AP Aging */}
                        <div className="bg-card shadow-md p-4 mt-4">
                            <div className="border border-neutral-200 rounded-md overflow-hidden">
                                <table className="w-full text-sm text-neutral-800">
                                    <thead className="bg-neutral-100 text-left uppercase text-xs tracking-wide text-neutral-500">
                                        <tr>
                                            <th className="px-4 py-3">Vendor</th>
                                            <th className="px-4 py-3 text-right">Current</th>
                                            <th className="px-4 py-3 text-right">1-30 Days</th>
                                            <th className="px-4 py-3 text-right">31-60 Days</th>
                                            <th className="px-4 py-3 text-right">61-90 Days</th>
                                            <th className="px-4 py-3 text-right">91+ Days</th>
                                            <th className="px-4 py-3 text-right">Total Outstanding</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apAgingData.rows.map((entry: AgingRow) => (
                                            <tr
                                                key={entry.id}
                                                className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium text-neutral-700">{entry.entityName}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(entry.current)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(entry.agingBucket1_30)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(entry.agingBucket31_60)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(entry.agingBucket61_90)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(entry.agingBucket91Over)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(entry.total)}</td>
                                            </tr>
                                        ))}
                                        {/* AP Totals Row */}
                                        <tr className="border-t-2 border-neutral-300 bg-neutral-100 font-bold">
                                            <td className="px-4 py-3">Total AP</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(apAgingData.current)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(apAgingData.agingBucket1_30)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(apAgingData.agingBucket31_60)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(apAgingData.agingBucket61_90)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(apAgingData.agingBucket91Over)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(apAgingData.total)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}