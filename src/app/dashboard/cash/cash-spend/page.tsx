'use client';

import React, { useState, useEffect } from 'react';
import { fetchCashSpend, CashOutflowCategory, CashSpendApiResponse } from '@/api/financialReportsApi';

export default function ChangeInCashPage() {
    const today = new Date();

    const prevMonth = today.getMonth() === 0 ? 12 : today.getMonth();
    const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    const [cashFlowOutflows, setCashFlowOutflows] = useState<CashOutflowCategory[]>([]);
    const [totalCashSpend, setTotalCashSpend] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonthLabel, setCurrentMonthLabel] = useState<string>('');

    const [selectedMonth, setSelectedMonth] = useState(prevMonth); // last month by default
    const [selectedYear, setSelectedYear] = useState(prevYear);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);

    async function loadCashSpendData(year: number, month: number) {
        setLoading(true);
        setError(null);

        try {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

            const response = await fetchCashSpend(startDate, endDate);

            if (response?.data && response.data.categories && response.data.categories.length > 0) {
                setCashFlowOutflows(response.data.categories);
                setTotalCashSpend(response.data.totalSpend);
                setCurrentMonthLabel(response.data.month);
            } else {
                setCashFlowOutflows([]);
                setTotalCashSpend(0);
                setCurrentMonthLabel('');
                setError("No detailed cash outflow data available for this period.");
            }
        } catch (err) {
            console.error('Error fetching cash spend data:', err);
            setError("Failed to load cash outflow data. Please try again later.");
            setCashFlowOutflows([]);
            setTotalCashSpend(0);
            setCurrentMonthLabel('');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCashSpendData(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    const todayStr = new Date().toLocaleString();

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-5 md:items-center justify-between border-b border-gray-200 pb-3">
                    <div className="">
                        <h1 className="text-xl leading-normal text-black capitalize font-medium">Cash Spend Report</h1>
                    </div>
                    <div className='flex flex-col md:flex-row gap-3 items-center'>
                        {currentMonthLabel && (
                            <p className="w-full md:w-auto border border-blue-200/50 rounded-lg bg-white focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-green-700">
                                {currentMonthLabel}
                            </p>
                        )}
                        {todayStr && (
                            <p className="w-full md:w-auto border border-blue-200/50 rounded-lg bg-white focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-green-700">
                                {todayStr}
                            </p>
                        )}
                        <select
                            className="w-full md:w-auto border border-blue-200/50 rounded-lg bg-white focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-gray-700"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        >
                            {months.map((m, idx) => (
                                <option key={idx} value={idx + 1}>{m}</option>
                            ))}
                        </select>
                        <select
                            className="w-full md:w-auto border border-blue-200/50 rounded-lg bg-white focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-3 py-2 text-sm text-gray-700"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {loading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="mb-4 flex items-start gap-2 p-3 border-l-4 border-red-600 bg-red-100/50 backdrop-blur-lg text-red-800 rounded-lg shadow shadow-red-50">
                        <p className="font-medium text-[#b11107]">
                            {error}
                        </p>
                    </div>
                ) : cashFlowOutflows.length > 0 ? (
                    <table className="w-full">
                        <tbody>
                            {cashFlowOutflows.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300">
                                    <td className="py-2 px-1 text-gray-800">{item.category}</td>
                                    <td className="py-2 px-1 text-right text-gray-800 font-medium">
                                        -€{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-gray-400 font-bold">
                                <td className="py-2 px-1 text-lg">TOTAL</td>
                                <td className="py-2 px-1 text-right text-lg">
                                    -€{totalCashSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                ) : (
                    <p className="text-center text-gray-600 py-4">No Cash Outflow Data</p>
                )}
            </div>
        </section>
    );
}