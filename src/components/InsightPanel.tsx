import React from 'react';
import { MiniMaxInsight } from '../sim/insights/minimaxPlaceholder';
import { Sparkles } from 'lucide-react'; // Assuming lucide-react is available, or use a simple SVG

interface InsightPanelProps {
  insight: MiniMaxInsight;
}

export function InsightPanel({ insight }: InsightPanelProps) {
  if (!insight.summary) return null;

  return (
    <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-100 space-y-4">
      <div className="flex items-center gap-2 border-b border-indigo-200 pb-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-indigo-900">AI Policy Insight</h2>
      </div>
      
      <div className="text-gray-800 leading-relaxed">
        {insight.summary}
      </div>

      {insight.drivers.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-indigo-800 text-sm uppercase tracking-wide">Key Drivers</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {insight.drivers.map((driver, idx) => (
              <li key={idx}>{driver}</li>
            ))}
          </ul>
        </div>
      )}

      {insight.tradeoffs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-indigo-800 text-sm uppercase tracking-wide">Strategic Tradeoffs</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {insight.tradeoffs.map((tradeoff, idx) => (
              <li key={idx}>{tradeoff}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 text-xs text-indigo-400 italic border-t border-indigo-100 mt-2">
        Insights are derived from replayed history and policy attribution. Demo mode active.
      </div>
    </div>
  );
}
