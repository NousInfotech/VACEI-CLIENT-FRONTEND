'use client';

import {
  ComposedChart, ResponsiveContainer, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const monthlyAmountData = [
  { month: 'Jan', income: 12000, expense: 8000 },
  { month: 'Feb', income: 15000, expense: 9000 },
  { month: 'Mar', income: 18000, expense: 9500 },
  { month: 'Apr', income: 14000, expense: 11000 },
  { month: 'May', income: 17000, expense: 12000 },
  { month: 'Jun', income: 16000, expense: 10500 },
  { month: 'Jul', income: 19000, expense: 11500 },
];

export default function MonthlyAmountChart() {
  return (
    <ResponsiveContainer width={100} height={60}>
      <ComposedChart data={monthlyAmountData}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00799c" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#00799c" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b11107" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#b11107" stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />

        <Bar
          dataKey="income"
          fill="url(#incomeGradient)"
          name="Income"
          radius={[8, 8, 0, 0]}
          barSize={16}
        />
        <Bar
          dataKey="expense"
          fill="url(#expenseGradient)"
          name="Expense"
          radius={[8, 8, 0, 0]}
          barSize={16}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
