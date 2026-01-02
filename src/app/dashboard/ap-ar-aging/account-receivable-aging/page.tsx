'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SkeletonRow from "@/components/SkeletonRow"; // Import SkeletonRow
import { fetchArAgingData, AgingData, AgingRow } from '@/api/agingService';
import { format, subYears, isValid,subDays } from 'date-fns'; // Import format, subYears, isValid
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

const formatCurrency = (amount: number) =>
    `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function FinancialOverviewPage() { // Assuming this is your AR page component name
    const [arAgingData, setArAgingData] = useState<AgingData | null>(null);
    const [loadingAr, setLoadingAr] = useState(true);
    const [errorAr, setErrorAr] = useState<string | null>(null);

    // State for start and end dates (now Date objects for react-datepicker)
    // Default to a date far in the past for startDate to show "all" by default.
   const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 1)); // Default to one day before today
    const [endDate, setEndDate] = useState<Date | null>(new Date()); // Default to today

    // --- Fetch AR Aging Data ---
    useEffect(() => {
        const getArAgingData = async () => {
            setLoadingAr(true);
            setErrorAr(null);

            // Validate dates
            if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
                setErrorAr("Please select valid start and end dates.");
                setArAgingData(null);
                setLoadingAr(false);
                return;
            }

            if (startDate > endDate) {
                setErrorAr("Start date cannot be after end date.");
                setArAgingData(null); // Clear data if dates are invalid
                setLoadingAr(false);
                return; // Stop execution
            }

            try {
                // Format dates to YYYY-MM-DD strings for the API call
                const formattedStartDate = format(startDate, 'yyyy-MM-dd');
                const formattedEndDate = format(endDate, 'yyyy-MM-dd');

                // Use the dedicated function to fetch AR data with date range
                const arRecord = await fetchArAgingData({
                    intuitAccountId: 1, // Replace with dynamic ID if needed
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                });
                setArAgingData(arRecord);
            } catch (err: any) {
                console.error("Error fetching AR aging data:", err); // Log the actual error for debugging
                setErrorAr(err.message || 'Failed to fetch AR aging data.');
            } finally {
                setLoadingAr(false);
            }
        };
        getArAgingData();
    }, [startDate, endDate]); // Re-fetch when either date changes

    const numberOfSkeletonTableRows = 5;

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            {/* AR Aging Section */}
            <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md mb-8">
                <h1 className="text-xl leading-normal text-black capitalize font-medium">Accounts Receivable Aging</h1>
                 <p className="text-sm text-gray-600 mt-2 mb-4">
                    Note: The Accounts Receivable aging report on this page displays data as of the End Date selected. This means the aging buckets (Current, 1-30 Days, etc.) are calculated based on how old the outstanding balances were relative to that specific End Date.
                </p>
                {/* Date Filters and Navigation Button */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center pt-4 pb-4 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Start Date Picker */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="startDatePicker" className="text-sm font-medium text-gray-700">Start Date:</label>
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
                                dateFormat="yyyy-MM-dd" // Daily date format
                                className="border border-gray-200 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                                maxDate={new Date()} // Prevent selecting future dates
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                            />
                        </div>

                        {/* End Date Picker */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="endDatePicker" className="text-sm font-medium text-gray-700">End Date:</label>
                            <DatePicker
                                id="endDatePicker"
                                selected={endDate}
                                onChange={(date: Date | null) => {
                                    setEndDate(date);
                                }}
                                dateFormat="yyyy-MM-dd" // Daily date format
                                className="border border-gray-200 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                                minDate={startDate || undefined} // End date cannot be before start date
                                maxDate={new Date()} // Prevent selecting future dates
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                            />
                        </div>
                    </div>

                    {/* Button to AP Page */}
                    <Link href="/dashboard/ap-ar-aging/account-payble-aging" passHref>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mr-2 w-full md:w-auto">
                            Go to Account Payable Aging
                        </button>
                    </Link>
                </div>

                {errorAr && <p className="text-red-500 mt-4">{errorAr}</p>}

                {loadingAr ? (
                    <>
                        {/* Skeleton for Summary Row */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="border border-neutral-200 bg-white p-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>

                        {/* Skeleton for Table */}
                        <div className="bg-white shadow-sm p-4 mt-4">
                            <div className="border border-neutral-200 rounded-md overflow-hidden">
                                <table className="w-full text-sm text-neutral-800">
                                    <thead className="bg-neutral-100 text-left uppercase text-xs tracking-wide text-neutral-500">
                                        <tr>
                                            <th className="px-4 py-3">Customer</th>
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
                ) : !arAgingData || arAgingData.rows.length === 0 ? (
                   <section className="p-6 flex flex-col justify-center items-center h-40 gap-4">
                     <p className="text-gray-500 text-lg font-medium text-center">
                       No data found. Please try syncing the latest AP Aging AR Aging data using the button below.
                     </p>
                     <Link
                       href="/dashboard/quickbooks-sync"
                       className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
                     >
                       Sync with QuickBooks
                     </Link>
                   </section>
                ) : (
                    <>
                        {/* Summary Row for AR Aging */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4">
                            <div className="border border-neutral-200 bg-white p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Current</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(arAgingData.current)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-white p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">1-30 Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(arAgingData.agingBucket1_30)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-white p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">31-60 Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(arAgingData.agingBucket31_60)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-white p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">61-90 Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(arAgingData.agingBucket61_90)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-white p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">91+ Days</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(arAgingData.agingBucket91Over)}</p>
                            </div>
                            <div className="border border-neutral-200 bg-white p-4">
                                <p className="text-xs text-neutral-500 uppercase mb-1">Total Outstanding AR</p>
                                <p className="text-lg font-semibold text-neutral-800">{formatCurrency(arAgingData.total)}</p>
                            </div>
                        </div>

                        {/* Table for AR Aging */}
                        <div className="bg-white shadow-sm p-4 mt-4">
                            <div className="border border-neutral-200 rounded-md overflow-hidden">
                                <table className="w-full text-sm text-neutral-800">
                                    <thead className="bg-neutral-100 text-left uppercase text-xs tracking-wide text-neutral-500">
                                        <tr>
                                            <th className="px-4 py-3">Customer</th>
                                            <th className="px-4 py-3 text-right">Current</th>
                                            <th className="px-4 py-3 text-right">1-30 Days</th>
                                            <th className="px-4 py-3 text-right">31-60 Days</th>
                                            <th className="px-4 py-3 text-right">61-90 Days</th>
                                            <th className="px-4 py-3 text-right">91+ Days</th>
                                            <th className="px-4 py-3 text-right">Total Outstanding</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {arAgingData.rows.map((entry: AgingRow) => (
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
                                        {/* AR Totals Row */}
                                        <tr className="border-t-2 border-neutral-300 bg-neutral-100 font-bold">
                                            <td className="px-4 py-3">Total AR</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(arAgingData.current)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(arAgingData.agingBucket1_30)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(arAgingData.agingBucket31_60)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(arAgingData.agingBucket61_90)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(arAgingData.agingBucket91Over)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(arAgingData.total)}</td>
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