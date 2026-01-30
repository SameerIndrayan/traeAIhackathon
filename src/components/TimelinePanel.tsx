import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useSimulationStore } from '../store/useSimulationStore';

const TimelinePanel: React.FC = () => {
  const { baselineSeries, alternateSeries } = useSimulationStore();

  // Merge data for chart
  // We need a unified list of dates.
  // Since both series might have different dates (due to shifting), we should union the dates.
  // However, calcDailyCashSeries fills in days between start and end.
  // The ranges might differ.
  
  // Quick merge:
  const dataMap = new Map<string, { date: string; baseline: number | null; alternate: number | null }>();
  
  baselineSeries.forEach(d => {
    dataMap.set(d.date, { date: d.date, baseline: d.balance, alternate: null });
  });
  
  alternateSeries.forEach(d => {
    const existing = dataMap.get(d.date);
    if (existing) {
      existing.alternate = d.balance;
    } else {
      dataMap.set(d.date, { date: d.date, baseline: null, alternate: d.balance });
    }
  });

  // Sort by date
  const data = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Fill nulls if needed for continuous line? Recharts handles nulls by breaking line, 
  // but for "Financial Simulator" we probably want to see the line continue?
  // Actually, if we have a gap, it means no balance change? No, daily series should have every day.
  // If the ranges are different (e.g. alternate starts earlier or ends later), 
  // one line will be null. That's fine.

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Cash Forecast Timeline</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              minTickGap={30}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              tickFormatter={(val) => `$${val / 1000}k`}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip 
              formatter={(val: number) => formatCurrency(val)}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
              type="monotone" 
              dataKey="baseline" 
              stroke="#9ca3af" 
              strokeWidth={2} 
              dot={false} 
              name="Baseline" 
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="alternate" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={false} 
              name="Alternate Scenario"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimelinePanel;
