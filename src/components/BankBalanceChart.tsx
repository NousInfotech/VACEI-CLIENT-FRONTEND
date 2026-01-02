'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Legend,
} from 'recharts';
import { useState } from 'react';

const data = [
  { month: 'Jan', bank: 50000, credit: 10000, total: 60000 },
  { month: 'Feb', bank: 52000, credit: 9000, total: 61000 },
  { month: 'Mar', bank: 58000, credit: 8000, total: 66000 },
  { month: 'Apr', bank: 60000, credit: 9500, total: 69500 },
  { month: 'May', bank: 62000, credit: 8500, total: 70500 },
  { month: 'Jun', bank: 65000, credit: 9000, total: 74000 },
  { month: 'Jul', bank: 67000, credit: 8700, total: 75700 },
];

export default function BankBalanceChart() {
  return (
    <>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="bankGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00799c" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#00799c" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b11107" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#b11107" stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
          <XAxis dataKey="month" tickLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '0',
              border: '1px solid #e5e7eb',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
            formatter={(value) => `€${value.toLocaleString()}`}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ padding: '0 10px', marginBottom: '10px' }}
            formatter={(value) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
            layout="horizontal"
            align="center"
            verticalAlign="top"
          />
          
          <Bar
            dataKey="bank"
            fill="url(#bankGradient)"
            name="Bank Account"
            radius={[8, 8, 0, 0]}
            barSize={16}
          >
            <LabelList dataKey="bank" position="top" formatter={(val: number) => `€${val.toLocaleString()}`} />
          </Bar>

          <Bar
            dataKey="credit"
            fill="url(#creditGradient)"
            name="Credit Card"
            radius={[8, 8, 0, 0]}
            barSize={16}
          >
            <LabelList dataKey="credit" position="top" formatter={(val: number) => `€${val.toLocaleString()}`} />
          </Bar>

          <Line
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Total Balance"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}
