'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { fetchFinancialReports } from '@/api/financialReportsApi';
import Link from "next/link";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/ui/button";

import { ChevronDown } from "lucide-react";

function generateLast12Months() {
    const months: string[] = [];
    const dates: Date[] = [];
    const keys: string[] = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.push(label);
        dates.push(date);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        keys.push(`${yyyy}-${mm}`);
    }
    return { months, dates, keys };
}

export default function ReportTable({ reportType }: { reportType: string }) {
    const searchParams = useSearchParams();
    const metricFromUrl = searchParams.get('filter');
    const { months: monthLabels, dates: monthDates, keys: monthKeys } = React.useMemo(() => generateLast12Months(), []);

    const [filterType, setFilterType] = useState<'12month' | 'custom'>('12month');
    const [startDate, setStartDate] = useState<Date | null>(monthDates[0]);
    const [endDate, setEndDate] = useState<Date | null>(monthDates[11]);
    const [loading, setLoading] = useState(true);
    const [metricsData, setMetricsData] = useState<{ [metricName: string]: { [key: string]: number } }>({});
    const [quickFilterRange, setQuickFilterRange] = useState<string | null>(null);
    const [visibleMonths, setVisibleMonths] = useState<string[]>(monthKeys);

    const availableMonthsFromData = React.useMemo(() => {
        const monthsSet = new Set<string>();
        Object.values(metricsData).forEach(metricData => {
            Object.keys(metricData).forEach(monthKey => monthsSet.add(monthKey));
        });
        return monthKeys.filter(key => monthsSet.has(key));
    }, [metricsData, monthKeys]);

    const quarters = { Q1: [0, 1, 2], Q2: [3, 4, 5], Q3: [6, 7, 8], Q4: [9, 10, 11], 'Last 3 Months': [9, 10, 11] };

    const getMonthKeysInRange = (start: Date, end: Date) => {
        if (!start || !end || start > end) return [];
        const keys: string[] = [];
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const yyyy = currentDate.getFullYear();
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            keys.push(`${yyyy}-${mm}`);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return keys;
    };

    useEffect(() => {
        async function loadData() {
            if (filterType === 'custom' && startDate && endDate && startDate > endDate) {
                console.warn("Start date is after end date.");
                return;
            }

            setLoading(true);
            try {
                const formatDate = (date: Date) => {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    return `${yyyy}-${mm}-01`;
                };

                let startParam = '';
                let endParam = '';

                if (filterType === '12month') {
                    startParam = formatDate(monthDates[0]);
                    endParam = formatDate(monthDates[11]);
                } else {
                    startParam = startDate ? formatDate(startDate) : '';
                    endParam = endDate ? formatDate(endDate) : '';
                }

                const reports = await fetchFinancialReports({
                    reportType,
                    filterType,
                    startDate: startParam,
                    endDate: endParam,
                    quickFilterRange,
                });

                setMetricsData(reports);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [filterType, startDate, endDate, reportType, quickFilterRange, monthDates]);

    useEffect(() => {
        if (filterType === 'custom' && startDate && endDate) {
            const newVisibleMonths = getMonthKeysInRange(startDate, endDate);
            setVisibleMonths(newVisibleMonths);
        } else if (filterType === '12month') {
            setVisibleMonths(availableMonthsFromData);
        }
    }, [filterType, availableMonthsFromData, startDate, endDate]);

    const metrics = Object.keys(metricsData);

    const categorizedMetrics = React.useMemo(() => {
        const categories = new Map();
        const orderedCategories: string[] = [];

        metrics.forEach(metric => {
            const parts = metric.split(":");
            const categoryName = parts.length > 1 ? parts[0].trim() : "Other";
            const metricName = parts.length > 1 ? parts[1].trim() : metric;

            if (!categories.has(categoryName)) {
                categories.set(categoryName, []);
                orderedCategories.push(categoryName);
            }
            categories.get(categoryName).push({ name: metricName, key: metric });
        });

        const result: { categoryName: string; metrics: { name: string; key: string }[] }[] = [];
        for (const category of orderedCategories) {
            const sortedMetrics = categories.get(category).sort((a: { name: string; }, b: { name: string; }) => {
                const aIsTotal = a.name.toLowerCase().startsWith('total') || a.name.toLowerCase().startsWith('net');
                const bIsTotal = b.name.toLowerCase().startsWith('total') || b.name.toLowerCase().startsWith('net');
                if (aIsTotal && !bIsTotal) return 1;
                if (!aIsTotal && bIsTotal) return -1;
                return 0;
            });
            result.push({
                categoryName: category,
                metrics: sortedMetrics,
            });
        }
        return result;
    }, [metrics, metricsData]);

    const filteredKeys =
        metrics.length > 0
            ? [...visibleMonths].reverse()
            : [];

    const filteredMonths = filteredKeys.map(key => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    function handleExportToExcel() {
        const data: any[] = [];

        const header = ['Metric', ...filteredMonths];
        data.push(header);

        categorizedMetrics.forEach(categoryGroup => {
            data.push([`Category: ${categoryGroup.categoryName}`]);
            categoryGroup.metrics.forEach(metric => {
                const row = [metric.name];
                filteredKeys.forEach(key => {
                    const value = metricsData[metric.key]?.[key];
                    row.push(typeof value === 'number' ? value.toString() : '');
                });
                data.push(row);
            });
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        XLSX.writeFile(workbook, 'financial_report.xlsx');
    }

    if (loading) {
        return (
            <section className="p-0">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 rounded w-full"></div>
                </div>
            </section>
        );
    }
    if (metrics.length === 0) {
        return (
            <section className="p-6 flex flex-col justify-center items-center h-40 gap-4">
                <p className="text-muted-foreground text-lg font-medium text-center">
                    No data found. Please try syncing the latest reports data using the button below.
                </p>
                <Link
                    href="/dashboard/quickbooks-sync"
                    className="bg-primary hover:bg-primary/90 text-card-foreground font-medium px-4 py-2 rounded-lg shadow-md transition"
                >
                    Sync with QuickBooks
                </Link>
            </section>
        );
    }

    return (
        <section className="p-0">
            <div className="flex justify-between items-center gap-4 mb-6 flex-wrap">
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setFilterType('12month');
                            setQuickFilterRange(null);
                            setStartDate(monthDates[0]);
                            setEndDate(monthDates[11]);
                        }}
                        className={`px-4 py-2 rounded-md transition-colors cursor-pointer text-sm ${filterType === '12month' ? '-' : 'bg-gray-200'}`}
                    >
                        Last 12 Months
                    </button>
                </div>

                {filterType === '12month' && (
                    <div>
                        <Dropdown
                            label={quickFilterRange || "All Months"}
                            searchable={true}
                            items={[
                                { id: "all", label: "All Months", onClick: () => setQuickFilterRange(null) },
                                ...Object.keys(quarters).map(q => ({
                                    id: q,
                                    label: q,
                                    onClick: () => setQuickFilterRange(q)
                                }))
                            ]}
                            trigger={
                                <div className="border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 min-w-[150px] shadow-sm">
                                    <span className="text-sm text-gray-700 truncate">
                                        {quickFilterRange || "All Months"}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                </div>
                            }
                        />
                    </div>
                )}

                <div className="flex gap-4">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                            setFilterType('custom');
                            if (date && endDate && date > endDate) setEndDate(null);
                            setStartDate(date);
                        }}
                        dateFormat="MMM yyyy"
                        showMonthYearPicker
                        className="border border-border p-2 px-4 text-sm rounded-md focus:outline-0"
                        minDate={monthDates[0]}
                        maxDate={monthDates[11]}
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => {
                            setFilterType('custom');
                            if (date && startDate && date < startDate) {
                                alert("End date must be after start date.");
                                return;
                            }
                            setEndDate(date);
                        }}
                        dateFormat="MMM yyyy"
                        showMonthYearPicker
                        className="border border-border p-2 px-4 text-sm rounded-md focus:outline-0"
                        minDate={startDate || monthDates[0]}
                        maxDate={monthDates[11]}
                    />
                </div>

                <button
                    onClick={handleExportToExcel}
                    className="ml-auto px-4 py-2 bg-sidebar-background text-sidebar-foreground rounded-md hover:bg-sidebar-hover transition-colors cursor-pointer shadow-md"
                >
                    Export to Excel
                </button>
            </div>
            <div className="w-full overflow-x-auto rounded-md border">
                <ScrollArea className="h-[100vh] xl:max-w-[90vw] md:max-w-[65vw] w-full max-w-[76vw]">
                    <Table className="table  text-sm text-muted-foreground border-collapse  table-auto">
                        <TableHeader className="text-xs text-brand-body uppercase bg-brand-body">
                            <TableRow>
                                <TableHead className="  bg-brand-muted z-10 p-2 text-left font-semibold border-border">
                                    Items
                                </TableHead>
                                {filteredMonths.map((month) => (
                                    <TableHead
                                        key={month}
                                        className="p-2 border-r border-border  text-center font-medium"
                                    >
                                        {month}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categorizedMetrics.map((categoryGroup, categoryIdx) => (
                                <React.Fragment key={categoryGroup.categoryName}>
                                    <TableRow className="bg-gray-200 border-b border-border">
                                        <TableCell
                                            colSpan={filteredMonths.length + 1}
                                            className="bg-gray-200 text-brand-body font-bold p-2 pl-4"
                                        >
                                            {categoryGroup.categoryName}
                                        </TableCell>
                                    </TableRow>
                                    {categoryGroup.metrics.map((metric, rowIdx) => {
                                        const hasTotalOrNet = categoryGroup.metrics.some(
                                            (m) =>
                                                m.name.toLowerCase().startsWith("total") ||
                                                m.name.toLowerCase().startsWith("net")
                                        );

                                        const isLastRow =
                                            metric.name.toLowerCase().startsWith("total") ||
                                            metric.name.toLowerCase().startsWith("net") ||
                                            categoryGroup.metrics.length === 1 ||
                                            (!hasTotalOrNet && rowIdx === categoryGroup.metrics.length - 1);

                                        return (
                                            <TableRow
                                                key={metric.key}
                                                className={`${(categoryIdx % 2 === 0 && rowIdx % 2 === 0) ||
                                                    (categoryIdx % 2 !== 0 && rowIdx % 2 !== 0)
                                                    ? "bg-card"
                                                    : "bg-brand-body"
                                                    }`}
                                            >
                                                <TableCell
                                                    className={` z-10 p-2 pr-4 border-r border-border font-medium transition-all duration-200 text-gray-800 ${isLastRow ? "bg-yellow-100 border-t border-border" : ""
                                                        }`}
                                                    style={
                                                        isLastRow
                                                            ? {
                                                                borderBottomStyle: "double",
                                                                borderBottomWidth: "3px",
                                                                borderBottomColor: "#E5E7EB",
                                                            }
                                                            : {}
                                                    }
                                                >
                                                    {metric.name}
                                                </TableCell>

                                                {filteredKeys.map((key) => {
                                                    const currentValue = metricsData[metric.key]?.[key];
                                                    const currentIndex = monthKeys.indexOf(key);
                                                    const prevKey = currentIndex > 0 ? monthKeys[currentIndex - 1] : null;
                                                    const prevValue = prevKey ? metricsData[metric.key]?.[prevKey] : null;

                                                    let colorClass = "";
                                                    if (typeof currentValue === "number" && typeof prevValue === "number") {
                                                        if (currentValue < prevValue) {
                                                            colorClass = "text-red-600 font-semibold";
                                                        } else if (currentValue > prevValue) {
                                                            colorClass = "text-green-600 font-semibold";
                                                        }
                                                    }

                                                    return (
                                                        <TableCell
                                                            key={key}
                                                            className={`text-center  border-r border-border p-2 transition-all duration-300 text-gray-800 font-normal ${isLastRow ? "bg-yellow-100 border-t border-border" : ""
                                                                } ${colorClass}`}
                                                            style={
                                                                isLastRow
                                                                    ? {
                                                                        borderBottomStyle: "double",
                                                                        borderBottomWidth: "3px",
                                                                        borderBottomColor: "#E5E7EB",
                                                                    }
                                                                    : {}
                                                            }
                                                        >
                                                            {typeof currentValue === "number"
                                                                ? `€${currentValue.toLocaleString()}`
                                                                : "€0"}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </section>
    );
}
