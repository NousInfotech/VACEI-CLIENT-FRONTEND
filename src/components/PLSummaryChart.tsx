'use client';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardCard from './DashboardCard';

type ChartDatum = {
  month: string;
  income: number;
  expense: number;
  profitLoss: number;
  change: number;
};

export default function PnLChart() {
  const router = useRouter();
  const [chartData, setChartData] = useState<{ [key: string]: ChartDatum[] }>({});
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'Monthly' | 'YTD' | '12 Month'>('12 Month');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const reportType = "ProfitAndLoss";

        const today = new Date();
        const formatDate = (date: Date) => {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          return `${yyyy}-${mm}-01`;
        };  

        let startParam: string, endParam: string;

        if (view === 'Monthly') {
          startParam = formatDate(new Date(today.getFullYear(), today.getMonth() - 2, 1));
          endParam = formatDate(today);
        } else if (view === 'YTD') {
          startParam = `${today.getFullYear()}-01-01`;
          endParam = formatDate(today);
        } else {
          startParam = formatDate(new Date(today.getFullYear(), today.getMonth() - 11, 1));
          endParam = formatDate(today);
        }

        // Mock data - simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Generate mock profit & loss data based on view
        let mockSummaryData: any[] = [];
        
        if (view === 'Monthly') {
          // Last 6 months
          mockSummaryData = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            const month = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            const income = Math.floor(Math.random() * 50000) + 80000;
            const expense = Math.floor(Math.random() * 30000) + 40000;
            return {
              month: month,
              income: income,
              expense: expense,
              profit: income - expense,
            };
          });
        } else if (view === 'YTD') {
          // Quarters for current year
          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
          mockSummaryData = quarters.map((q, i) => {
            const income = Math.floor(Math.random() * 150000) + 200000;
            const expense = Math.floor(Math.random() * 100000) + 120000;
            return {
              month: q,
              income: income,
              expense: expense,
              profit: income - expense,
            };
          });
        } else {
          // 12-Month view
          mockSummaryData = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            const month = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            const income = Math.floor(Math.random() * 50000) + 80000;
            const expense = Math.floor(Math.random() * 30000) + 40000;
            return {
              month: month,
              income: income,
              expense: expense,
              profit: income - expense,
            };
          });
        }

        const transformedData: ChartDatum[] = mockSummaryData.map((d: any, index: number) => {
          const prevIncome = index > 0 ? mockSummaryData[index - 1].income : 0;
          const change = prevIncome !== 0 ? (d.income - prevIncome) / prevIncome : 0;
          
          return {
            month: d.month,
            income: d.income,
            expense: d.expense,
            profitLoss: d.profit,
            change: change
          };
        });

        setChartData(prev => ({
          ...prev,
          [view]: transformedData,
        }));
      } catch (error) {
        console.error("Error fetching financial reports:", error);
        setChartData(prev => ({
          ...prev,
          [view]: [],
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [view, backendUrl]);

  const data = chartData[view] || [];

  return (
    <DashboardCard className="py-6">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-3 px-5">
        <div>
          <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">Profit & Loss Summary</h2>
          <p className="text-xs text-muted-foreground font-normal">{view === "Monthly" ? "Last 3 months" : view === "YTD" ? "Year to Date" : "Last 12 months"} Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-muted rounded-full p-1 shadow-inner">
          {["Monthly", "YTD", "12 Month"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all
                ${view === v 
                  ? "bg-sidebar-background text-sidebar-foreground shadow-md" 
                  : "text-muted-foreground"
                }`}
            >
              {v}
            </button>
          ))}
          <div
            onClick={() => router.push('/dashboard/financial-statements/profit-loss')}
            className="cursor-pointer ml-2 pt-1 text-muted-foreground hover:text-brand-body transition-colors duration-200"
            title="View full report"
          >
            <i className="fi fi-rr-angle-small-right text-2xl"></i>
          </div>
        </div>
      </div>

      <hr className="my-5 border-t border-border" />

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-7 bg-gray-200 rounded w-1/5"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-[350px] bg-brand-muted rounded-lg"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[350px] text-muted-foreground text-lg bg-brand-body rounded-lg border border-dashed border-border">
          <p>No data available for this period.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.9} /> {/* Brighter green */}
                <stop offset="95%" stopColor="#81C784" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF5350" stopOpacity={0.9} /> {/* Brighter red */}
                <stop offset="95%" stopColor="#E57373" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} 
              padding={{ left: 10, right: 10 }}
            />
            <YAxis yAxisId="left" 
                   tickLine={false} 
                   axisLine={false} 
                   tick={{ fill: '#6B7280', fontSize: 12 }} 
                   tickFormatter={(val) => `€${Number(val).toLocaleString('de-DE')}`} // Indian Rupee format
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#D1D5DB' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '0.9rem',
                padding: '12px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                color: '#374151'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#1F2937', marginBottom: '4px' }}
              itemStyle={{ padding: '2px 0' }}
              formatter={(value, name) => {
                const safeValue = value ?? 0;
                if (name === 'change') {
                  return [`${(Number(safeValue) * 100).toFixed(1)}%`, 'Change'];
                } else if (name === 'income' || name === 'expense') {
                  return [`€${Number(safeValue).toLocaleString('de-DE')}`, name === 'income' ? 'Income' : 'Expense'];
                }
                return value;
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ padding: '15px 0 0 0', marginTop: '15px', borderTop: '1px solid #F3F4F6' }}
              formatter={(value) => (
                <span className="text-sm font-medium text-brand-body">{value}</span>
              )}
              payload={[
                { value: 'Income', type: 'circle', color: '#4CAF50' },
                { value: 'Expense', type: 'circle', color: '#EF5350' },
                { value: 'Change (%)', type: 'circle', color: '#2196F3' }, // Blue for change line
              ]}
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
            />

            <Bar yAxisId="left" dataKey="income" fill="url(#incomeGradient)" name="income" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="expense" fill="url(#expenseGradient)" name="expense" radius={[6, 6, 0, 0]} barSize={20} />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="change" 
              stroke="#2196F3" // Blue for the change line
              strokeWidth={3} 
              dot={{ r: 5, fill: '#2196F3', stroke: '#fff', strokeWidth: 2 }} 
              activeDot={{ r: 7, fill: '#2196F3', stroke: '#fff', strokeWidth: 3 }}
              name="change" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}
