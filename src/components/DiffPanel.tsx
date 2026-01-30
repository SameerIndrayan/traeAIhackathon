import React from 'react';
import { DiffMetrics } from '../sim/types';

interface DiffPanelProps {
  metrics: DiffMetrics;
}

export function DiffPanel({ metrics }: DiffPanelProps) {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Impact Analysis (Replay vs Actual)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Runway Delta" 
          value={metrics.runwayDeltaDays === Infinity ? "∞" : 
                 metrics.runwayDeltaDays === -Infinity ? "Broke" : 
                 `${metrics.runwayDeltaDays > 0 ? '+' : ''}${metrics.runwayDeltaDays} days`}
          isGood={metrics.runwayDeltaDays >= 0}
          neutral={metrics.runwayDeltaDays === 0}
        />

        <MetricCard 
          label="Cash at End Delta" 
          value={`${metrics.cashDeltaAtEnd >= 0 ? '+' : ''}${formatMoney(metrics.cashDeltaAtEnd)}`}
          isGood={metrics.cashDeltaAtEnd >= 0}
          neutral={metrics.cashDeltaAtEnd === 0}
        />
        
        <MetricCard 
          label="Worst Cash Dip Delta" 
          value={`${metrics.minCashDelta >= 0 ? '+' : ''}${formatMoney(metrics.minCashDelta)}`}
          isGood={metrics.minCashDelta >= 0}
          neutral={metrics.minCashDelta === 0}
        />

        <MetricCard 
          label="Transactions Changed" 
          value={metrics.numTransactionsChanged.toString()}
          isGood={true}
          neutral={metrics.numTransactionsChanged === 0}
          color="blue"
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, isGood, neutral, color }: { label: string, value: string, isGood: boolean, neutral: boolean, color?: string }) {
  let valueColor = "text-gray-900";
  if (!neutral && !color) {
    valueColor = isGood ? "text-green-600" : "text-red-600";
  } else if (color === "blue") {
    valueColor = "text-blue-600";
  }

  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
