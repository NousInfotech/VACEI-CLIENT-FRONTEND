'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { useState, useEffect, useMemo } from 'react';

type ChartData = {
  label: string;
  grossProfit: number;
};

export default function ProfitLossChart() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [view, setView] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);
  const [chartData, setChartData] = useState<{ [key: string]: ChartData[] }>({
    Monthly: [],
    Weekly: [],
  });

  const data = useMemo(() => {
    return chartData[view] || [];
  }, [view, chartData]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setDataError(false);
      try {
        const token = localStorage.getItem("token") || "";
        const url = `${backendUrl?.replace(/\/?$/, "/")}financial-reports/fetch-profit-loss-chart`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        const dataArr = result?.[view.toLowerCase()] || [];

        const formatted: ChartData[] = dataArr.map((entry: any) => ({
          label: entry.label,
          grossProfit: entry.grossProfit,
        }));

        setChartData(prev => ({ ...prev, [view]: formatted }));
      } catch (error) {
        console.error("Error fetching profit/loss chart:", error);
        setDataError(true);
        setChartData(prev => ({ ...prev, [view]: [] }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [view, backendUrl]);

  return (
    <div className="bg-card border-border border rounded-card p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-lg card-hover">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <div>
            <h2 className="text-lg font-semibold text-brand-body">Gross Profit - {view}</h2>
            <p className="text-xs text-muted-foreground">Based on latest entries</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {(['Monthly'] as const).map((option) => (
            <button
              key={option}
              className={`px-3 py-1.5 text-sm border rounded-md cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring/50 ${
                view === option
                  ? 'bg-sidebar-background text-sidebar-foreground border-sidebar-border shadow-md'
                  : 'text-brand-body border-border hover:bg-muted'
              }`}
              onClick={() => setView(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <hr className='mt-3 mb-4 opacity-10' />

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-[350px] bg-card rounded"></div>
        </div>
      ) : dataError || data.length === 0 ? (
        <div className="flex items-center justify-center h-[350px] text-muted-foreground text-lg">
          No data found for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} style={{ background: '#FFFFFF' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tickLine={false} />
            <YAxis tickLine={false} />
            <Tooltip
              formatter={(value: number) =>
			  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value)
     
              }
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0',
                border: '1px solid #e5e7eb',
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            />
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Legend />
            <Bar
              dataKey="grossProfit"
              name="Gross Profit"
              barSize={28}
              radius={[6, 6, 0, 0]}
              fill="#0069a8"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
