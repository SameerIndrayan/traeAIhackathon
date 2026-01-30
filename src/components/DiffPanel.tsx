import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const DiffPanel: React.FC = () => {
  const { metrics } = useSimulationStore();

  if (!metrics) return null;

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    const str = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(absVal);
    return val >= 0 ? `+${str}` : `-${str}`;
  };

  const MetricCard = ({ label, value, type }: { label: string, value: string | number, type: 'good' | 'bad' | 'neutral' }) => {
    let colorClass = 'text-gray-900';
    if (type === 'good') colorClass = 'text-green-600';
    if (type === 'bad') colorClass = 'text-red-600';

    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      </div>
    );
  };

  // Determine "Good/Bad" logic
  // More cash is good. More runway is good.
  const runwayType = metrics.runwayDaysDelta > 0 ? 'good' : (metrics.runwayDaysDelta < 0 ? 'bad' : 'neutral');
  const cashEndType = metrics.cashAtEndDelta > 0 ? 'good' : (metrics.cashAtEndDelta < 0 ? 'bad' : 'neutral');
  const minCashType = metrics.minCashDelta > 0 ? 'good' : (metrics.minCashDelta < 0 ? 'bad' : 'neutral');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Impact Analysis</h2>
      
      <div className="grid grid-cols-1 gap-4 mb-8">
        <MetricCard 
          label="Runway Impact" 
          value={`${metrics.runwayDaysDelta > 0 ? '+' : ''}${metrics.runwayDaysDelta} days`} 
          type={runwayType} 
        />
        <MetricCard 
          label="Cash at End" 
          value={formatCurrency(metrics.cashAtEndDelta)} 
          type={cashEndType} 
        />
        <MetricCard 
          label="Min Cash (Dip)" 
          value={formatCurrency(metrics.minCashDelta)} 
          type={minCashType} 
        />
        <MetricCard 
          label="Transactions Modified" 
          value={metrics.transactionsChangedCount} 
          type="neutral" 
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-800 mb-4">Top Contributors</h3>
        <div className="space-y-3">
          {metrics.topContributors.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No rules applied yet.</p>
          ) : (
            metrics.topContributors.map((c) => (
              <div key={c.ruleId} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">
                  {c.ruleId.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {c.count} txns
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffPanel;
