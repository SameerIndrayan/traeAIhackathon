import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CashPoint } from '../sim/types';

interface TimelineChartProps {
  baseline: CashPoint[];
  alternate: CashPoint[];
}

export function TimelineChart({ baseline, alternate }: TimelineChartProps) {
  // Merge data for chart
  // Assumes both series have same length and dates for simplicity, 
  // but we can align them by date if needed. 
  // Since our calcCashSeries creates dense series for the same range if txns are roughly same range,
  // we might need to handle slight range mismatches if rules shift dates outside original bounds.
  // For this UI, we'll map by index or date. Best to map by date.
  
  const dataMap = new Map<string, { date: string, baseline?: number, alternate?: number }>();
  
  baseline.forEach(p => {
    dataMap.set(p.date, { date: p.date, baseline: p.balance });
  });
  
  alternate.forEach(p => {
    const existing = dataMap.get(p.date) || { date: p.date };
    dataMap.set(p.date, { ...existing, alternate: p.balance });
  });

  const data = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Cash Timeline: Actual vs Replayed</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => {
              const d = new Date(str);
              return `${d.getMonth()+1}/${d.getDate()}`;
            }}
            minTickGap={30}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(val) => `$${val/1000}k`}
          />
          <Tooltip 
            formatter={(val: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val))}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="baseline" 
            stroke="#000000" 
            strokeWidth={2} 
            dot={false} 
            name="Actual History"
          />
          <Line 
            type="monotone" 
            dataKey="alternate" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false} 
            name="Replayed History"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
