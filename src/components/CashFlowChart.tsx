'use client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Using the correct useRouter hook for Next.js 13+
import DashboardCard from './DashboardCard';

// Formats a month string (YYYY-MM) to a short month name and two-digit year (e.g., "Jan '23").
const formatMonth = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}-01`);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.toLocaleString('default', { month: 'short' })} '${date.getFullYear().toString().slice(-2)}`;
};

// Formats a quarter label (e.g., "2023-Q1") to show both the quarter and the two-digit year (e.g., "Q1 '23").
const formatQuarter = (label: string) => {
  const [year, quarter] = label.split('-');
  return `${quarter} '${year.slice(-2)}`;
};

export default function CashFlowChart() {
  const router = useRouter(); // Using the correct Next.js router
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [view, setView] = useState<'Monthly' | 'YTD' | '12-Month'>('Monthly');
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [chartData, setChartData] = useState<{ [key: string]: any[] }>({
    Monthly: [],
    YTD: [],
    '12-Month': [],
  });

  const labelKey = view === 'YTD' ? 'label' : 'month';

  const data = useMemo(() => {
    const currentData = chartData[view];
    if (view === 'YTD') {
      return currentData.map((item: any) => ({
        label: formatQuarter(item.name),
        cash: item.netCashIncrease,
      }));
    }

    return currentData.map((item: any) => ({
      month: formatMonth(item.name),
      cash: item.netCashIncrease,
    }));
  }, [view, chartData]);

  // Handler for redirecting the user to the cash flow statement page.
  const handleRedirect = () => {
    router.push('/dashboard/financial-statements/cash-flow-statement');
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setDataError(false);
      try {
        const token = localStorage.getItem("token") || "";
        const reportType = "CashFlow";

        const today = new Date();
        const formatDate = (date: Date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          return `${yyyy}-${mm}-01`;
        };

        let startParam: string, endParam: string;
        if (view === 'Monthly') {
          startParam = formatDate(new Date(today.getFullYear(), today.getMonth() - 5, 1));
          endParam = formatDate(today);
        } else if (view === 'YTD') {
          startParam = `${today.getFullYear()}-01-01`;
          endParam = formatDate(today);
        } else {
          startParam = formatDate(new Date(today.getFullYear(), today.getMonth() - 11, 1));
          endParam = formatDate(today);
        }

        const url = `${backendUrl?.replace(/\/?$/, "/")}financial-reports/cash-flow-summary?reportType=${reportType}&startDate=${startParam}&endDate=${endParam}`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        if (!result || result.length === 0) {
          setDataError(true);
        }

        setChartData(prev => ({
          ...prev,
          [view]: result,
        }));
      } catch (error) {
        console.error("Error fetching financial reports:", error);
        setDataError(true);
        setChartData(prev => ({ ...prev, [view]: [] }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [view, backendUrl, router]);

  return (
    <DashboardCard className="py-6">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-3 px-5">
        <div>
          <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">Cash Flow Summary</h2>
          <p className="text-xs text-muted-foreground font-normal">
            Based on the latest entries
          </p>
        </div>
        <div className="flex items-center gap-2 bg-brand-muted rounded-full p-1 shadow-inner">
          {(['Monthly', 'YTD', '12-Month'] as const).map((option) => (
            <button
              key={option}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all
                ${view === option
                  ? "bg-sidebar-background text-sidebar-foreground shadow-md" 
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-hover"
                }`}
              onClick={() => setView(option)}
            >
              {option.replace('-', ' ')}
            </button>
          ))}
          <div
            onClick={handleRedirect}
            className="cursor-pointer ml-2 pt-1 text-muted-foreground hover:text-brand-body transition-colors duration-200"
            title="View full report"
          >
            <i className="fi fi-rr-angle-small-right text-2xl"></i>
          </div>
        </div>
      </div>

      <hr className='my-5 border-t border-border' />

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-200 rounded w-1/5"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-[350px] bg-brand-muted rounded-lg"></div>
        </div>
      ) : dataError || data.length === 0 ? (
        <div className="flex items-center justify-center h-[350px] text-muted-foreground text-lg bg-brand-body rounded-lg border border-dashed border-border">
          <p>No data found for this period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
              tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(val) => `€${Number(val).toLocaleString('de-DE')}`}
            />
            <Tooltip
              cursor={{ stroke: '#D1D5DB', strokeWidth: 1.5 }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '0.9rem',
                padding: '12px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                color: '#374151',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}
              itemStyle={{ padding: '2px 0' }}
              formatter={(value: number, name: string) => [
                `€${Number(value).toLocaleString('de-DE')}`,
                'Net Cash Flow',
              ]}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="5 5" strokeWidth={1.5} />
            <Line
              type="monotone"
              dataKey="cash"
              stroke="#2196F3"
              strokeWidth={3}
              dot={{ r: 5, fill: "#2196F3", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#2196F3", stroke: "#fff", strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}