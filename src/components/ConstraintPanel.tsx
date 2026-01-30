import React from 'react';
import { ConstraintMetrics, ConstraintComparison } from '../sim/types';

interface ConstraintPanelProps {
  constraints: ConstraintComparison;
}

export function ConstraintPanel({ constraints }: ConstraintPanelProps) {
  const { baseline, alternate } = constraints;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Constraint & Risk Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Min Cash Buffer */}
        <ConstraintCard 
          title="Cash below $75k"
          baselineValue={`${baseline.minCashBuffer.daysBelowThreshold} days`}
          alternateValue={`${alternate.minCashBuffer.daysBelowThreshold} days`}
          improved={alternate.minCashBuffer.daysBelowThreshold < baseline.minCashBuffer.daysBelowThreshold}
          worsened={alternate.minCashBuffer.daysBelowThreshold > baseline.minCashBuffer.daysBelowThreshold}
          subtext={`Longest streak: ${alternate.minCashBuffer.longestStreakBelow} days`}
        />

        {/* 2. Sharp Cash Drops */}
        <ConstraintCard 
          title="Sharp Drops (>$30k / 7 days)"
          baselineValue={`${baseline.sharpDrops.eventCount} events`}
          alternateValue={`${alternate.sharpDrops.eventCount} events`}
          improved={alternate.sharpDrops.eventCount < baseline.sharpDrops.eventCount}
          worsened={alternate.sharpDrops.eventCount > baseline.sharpDrops.eventCount}
          subtext={`Worst drop: $${(alternate.sharpDrops.worstDrop / 1000).toFixed(0)}k`}
        />

        {/* 3. Delayed Obligations */}
        <ConstraintCard 
          title="Long Payment Delays (>30 days)"
          baselineValue={`${baseline.delayedObligations.countDelayedOver30Days} txns`}
          alternateValue={`${alternate.delayedObligations.countDelayedOver30Days} txns`}
          improved={false} // Usually delays are a tradeoff, rarely an "improvement" in risk unless we define it so.
          worsened={alternate.delayedObligations.countDelayedOver30Days > baseline.delayedObligations.countDelayedOver30Days}
          subtext={`Max delay: ${alternate.delayedObligations.maxDelayDays} days`}
          neutralIsBad={true} // If this goes up, it's a risk/tradeoff
        />
      </div>
    </div>
  );
}

function ConstraintCard({ 
  title, baselineValue, alternateValue, improved, worsened, subtext, neutralIsBad 
}: { 
  title: string, baselineValue: string, alternateValue: string, improved: boolean, worsened: boolean, subtext: string, neutralIsBad?: boolean 
}) {
  return (
    <div className="flex flex-col space-y-2 p-3 bg-gray-50 rounded border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Actual:</span>
        <span className="font-medium text-gray-900">{baselineValue}</span>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Replayed:</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${improved ? 'text-green-600' : worsened ? 'text-red-600' : 'text-gray-900'}`}>
            {alternateValue}
          </span>
          {improved && <span className="text-green-600">✅</span>}
          {worsened && <span className="text-red-600">⚠️</span>}
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-200">
        {subtext}
      </div>
    </div>
  );
}
