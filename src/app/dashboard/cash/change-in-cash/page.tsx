'use client';

import { useState, useEffect } from 'react';
import CashFlowChart from '@/components/CashFlowChart';
import SkeletonRow from '@/components/SkeletonRow';
import {
    fetchMonthlyCashFlowReport,
    MonthlyCashFlowReportResponse,
} from '@/api/financialReportsApi';

const CurrentBalanceDisplay = ({ label, value, isEstimated = true }: { label: string; value: string; isEstimated?: boolean }) => {
    const valueColorClass = parseFloat(value.replace(/€|,/g, '')) < 0 ? 'text-red-600' : 'text-2xl font-semibold text-brand-body';
    return (
        <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100">
            <p className="text-sm font-semibold text-brand-body">{label}</p>
            <p className="text-2xl font-bold flex items-center justify-between">
                {isEstimated && (
                    <span className="text-xs text-brand-primary">
                        Estimated
                    </span>
                )}
                <span className={valueColorClass}>{value}</span>
            </p>
        </div>
    );
};

const formatCurrency = (amount: string | number) => {
    if (typeof amount === 'number') {
        return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return amount;
};

export default function ChangeInCashPage() {
    const [monthlyCashFlowData, setMonthlyCashFlowData] = useState<MonthlyCashFlowReportResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getReportData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setMonth(endDate.getMonth() - 5);

                const formattedStartDate = startDate.toISOString().split('T')[0];
                const formattedEndDate = endDate.toISOString().split('T')[0];

                const data = await fetchMonthlyCashFlowReport(formattedStartDate, formattedEndDate);
                setMonthlyCashFlowData(data);
            } catch (err) {
                console.error("Failed to fetch monthly cash flow report:", err);
                setError("Failed to load cash flow data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        getReportData();
    }, []);

    const currentBankBalance = monthlyCashFlowData?.endingCash[0] ?? 0;
    const changeInCashMonthToDate = monthlyCashFlowData?.cashIncrease[0] ?? 0;

    const showDataContent =
        !isLoading &&
        !error &&
        monthlyCashFlowData &&
        monthlyCashFlowData.data &&
        Array.isArray(monthlyCashFlowData.data) &&
        monthlyCashFlowData.data.length > 0 &&
        monthlyCashFlowData.months &&
        Array.isArray(monthlyCashFlowData.months) &&
        monthlyCashFlowData.months.length > 0;

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">
                    Change in Cash
                </h1>
                <p className="text-md text-neutral-600 mb-4 mt-1">
                    Track your current bank balance, cash inflows, and outflows based on transactions from your linked bank accounts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
                    {isLoading ? (
                        <>
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="rounded-xl p-3 w-full bg-card backdrop-blur-sm shadow-md hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </>
                    ) : showDataContent ? (
                        <>
                            <CurrentBalanceDisplay
                                label="Ending Cash"
                                value={formatCurrency(currentBankBalance)}
                            />
                            <CurrentBalanceDisplay
                                label="Change in Cash"
                                value={formatCurrency(changeInCashMonthToDate)}
                            />
                            <CurrentBalanceDisplay
                                label="Beginning Cash"
                                value={formatCurrency(monthlyCashFlowData?.beginningCash[0] ?? 0)}
                            />
                        </>
                    ) : (
                        <div className="col-span-full text-center py-4 text-neutral-500">
                            {error ? error : "No summary data available for this period."}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="flex space-x-2">
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                        <div className="h-[350px] bg-brand-muted rounded"></div>
                    </div>
                ) : showDataContent ? (
                    <div className="mt-">
                        <CashFlowChart />
                    </div>
                ) : (
                    <div className="text-center py-10 text-neutral-500">
                        No chart data available for the selected period.
                    </div>
                )}

                <h2 className="text-xl leading-normal text-brand-body capitalize font-medium mt-10 mb-6 border-t pt-6 border-border">
                    Detailed Cash Flow Report
                </h2>
                <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                    {isLoading ? (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[800px]">
                                <table className="w-full text-sm text-brand-body border-collapse table_custom1">
                                    <thead className="text-xs text-brand-body uppercase bg-brand-body">
                                        <tr>
                                            <th className="bg-brand-muted z-10 p-2 px-8 w-60 text-left font-semibold border-border"></th>
                                            {Array.from({ length: 6 }).map((_, index) => (
                                                <th key={index} className="bg-brand-muted z-10 p-2 px-8 w-60 text-left font-semibold border-border">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <SkeletonRow key={index} columns={7} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">{error}</div>
                    ) : !showDataContent ? (
                        <div className="text-center py-10 text-neutral-500">
                            No detailed cash flow data available for the selected period.
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[800px]">
                                <table className="w-full text-sm text-brand-body border-collapse table_custom1">
                                    <thead className="text-xs text-brand-body uppercase bg-brand-body">
                                        <tr>
                                            <th className="bg-brand-muted z-10 p-2 px-8 w-60 text-left font-semibold border-border sticky left-0">
                                                Category
                                            </th>
                                            {monthlyCashFlowData.months.map((month, index) => (
                                                <th key={index} className="bg-brand-muted z-10 p-2 px-8 w-60 text-left font-semibold border-border">
                                                    {month}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyCashFlowData.data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="border-b border-gray-100 last:border-b-0">
                                                <th className={`px-4 py-3 text-left bg-card sticky left-0 ${row.name === 'Ending Bank Balance' ? 'font-bold text-brand-body' : 'text-neutral-700'}`}>
                                                    {row.name}
                                                </th>
                                                {monthlyCashFlowData.months.map((monthHeader, colIndex) => {
                                                    const monthKey = Object.keys(row).find((key) => {
                                                        if (key === 'name') return false;
                                                        const [year, monthNum] = key.split('-');
                                                        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                                                        return date.toLocaleString('default', { month: 'short', year: 'numeric' }) === monthHeader;
                                                    });
                                                    const value = monthKey ? row[monthKey] : '-';
                                                    const isNegative = typeof value === 'string' && value.includes('-');
                                                    const isEndingBalance = row.name === 'Ending Bank Balance';

                                                    return (
                                                        <td
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={`px-4 py-3 text-right ${isNegative ? 'text-red-700' : ''} ${isEndingBalance ? 'font-bold text-brand-body' : 'text-neutral-700'}`}
                                                        >
                                                            {formatCurrency(value)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}