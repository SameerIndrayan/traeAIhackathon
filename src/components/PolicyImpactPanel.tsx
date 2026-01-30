import React from 'react';
import { PolicyAttribution, Rule } from '../sim/types';

interface PolicyImpactPanelProps {
  attributions: PolicyAttribution[];
  rules: Rule[];
}

export function PolicyImpactPanel({ attributions, rules }: PolicyImpactPanelProps) {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  if (attributions.length === 0) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Policy Impact Breakdown</h2>
      
      <div className="space-y-4">
        {attributions.map((attr) => {
          const rule = rules.find(r => r.id === attr.ruleId);
          const ruleName = rule?.type === 'expenseApprovalThreshold' ? 'Expense Approval' : 
                           rule?.type === 'paymentTiming' ? 'Payment Timing' : 
                           rule?.type === 'butterflyEffect' ? 'Butterfly Effect' : attr.ruleId;
          
          const impactLabel = attr.estimatedCashImpact >= 0 ? "Improved cash position by" : "Reduced cash position by";
          const colorClass = attr.estimatedCashImpact >= 0 ? "text-green-600" : "text-red-600";
          const barWidth = Math.min(100, Math.max(5, (Math.abs(attr.estimatedCashImpact) / 200000) * 100)); // rough scaling

          return (
            <div key={attr.ruleId} className="flex flex-col space-y-1 p-3 bg-gray-50 rounded border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{ruleName}</span>
                <span className="text-sm text-gray-500">{attr.txnCount} transactions affected</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span>Estimated impact (approximate):</span>
                <span className={`font-bold ${colorClass}`}>
                  {attr.estimatedCashImpact >= 0 ? '+' : ''}{formatMoney(attr.estimatedCashImpact)}
                </span>
              </div>
              
              {/* Visual Bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${attr.estimatedCashImpact >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
