"use client";

import React, { useState, useMemo } from 'react';
import { Transaction, Rule } from '../sim/types';
import { applyRules } from '../sim/applyRules';
import { calcDailyCashSeries } from '../sim/calcCashSeries';
import { diffSeries, computeAttribution, computeConstraints } from '../sim/diff';
import { generateMiniMaxInsight } from '../sim/insights/minimaxPlaceholder';
import { RulePanel } from './RulePanel';
import { TimelineChart } from './TimelineChart';
import { DiffPanel } from './DiffPanel';
import { PolicyImpactPanel } from './PolicyImpactPanel';
import { InsightPanel } from './InsightPanel';
import { ConstraintPanel } from './ConstraintPanel';

interface SimulatorProps {
  initialTransactions: Transaction[];
}

export default function Simulator({ initialTransactions }: SimulatorProps) {
  const [showReplay, setShowReplay] = useState(false);
  const [rules, setRules] = useState<Rule[]>([
    {
      id: 'rule-expense-1',
      type: 'expenseApprovalThreshold',
      params: { threshold: 5000, delayDays: 30 },
      enabled: false,
    },
    {
      id: 'rule-payment-1',
      type: 'paymentTiming',
      params: { shiftDays: 0 },
      enabled: false,
    }
  ]);

  // Simulation Loop
  const { baselineSeries, alternateSeries, metrics, attributions, insight, constraints } = useMemo(() => {
    // 1. Baseline
    const baselineSeries = calcDailyCashSeries(initialTransactions, 0);

    // If Replay is OFF, alternate is just baseline
    if (!showReplay) {
      return { 
        baselineSeries, 
        alternateSeries: [], // Hide line
        metrics: null, // Hide metrics
        attributions: [],
        insight: null,
        constraints: null
      };
    }

    // 2. Apply Rules
    const alternateTransactions = applyRules(initialTransactions, rules);

    // 3. Alternate Series
    const alternateSeries = calcDailyCashSeries(alternateTransactions, 0);

    // 4. Diff
    const metrics = diffSeries(baselineSeries, alternateSeries, alternateTransactions);

    // 5. Attribution
    const attributions = computeAttribution(baselineSeries, alternateSeries, alternateTransactions, rules);

    // 6. Insight (MiniMax Placeholder)
    const insight = generateMiniMaxInsight(metrics, attributions, rules);

    // 7. Constraints
    const constraints = computeConstraints(baselineSeries, alternateSeries, initialTransactions, alternateTransactions);

    return { baselineSeries, alternateSeries, metrics, attributions, insight, constraints };
  }, [initialTransactions, rules, showReplay]);

  const handleToggleRule = (id: string, enabled: boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r));
  };

  const handleUpdateParams = (id: string, params: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, params } : r));
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle: Time Travel Demo Switch */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">Compare with replayed history</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showReplay} 
              onChange={(e) => setShowReplay(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <p className="text-sm text-gray-500">
          {showReplay ? "Showing Diff Analysis" : "Showing Baseline Only"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Controls (Always visible, but disabled/dimmed if replay is off? Or maybe just let them edit settings?) 
            Let's keep them enabled so user can set up rules before toggling replay, or just leave as is.
        */}
        <div className={`w-full lg:w-1/4 transition-opacity duration-300 ${showReplay ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <RulePanel 
            rules={rules} 
            onToggleRule={handleToggleRule} 
            onUpdateParams={handleUpdateParams} 
          />
        </div>

        {/* Center/Right: Visualization */}
        <div className="w-full lg:w-3/4 space-y-6">
          <TimelineChart baseline={baselineSeries} alternate={alternateSeries} />
          {metrics && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <DiffPanel metrics={metrics} />
              {constraints && <ConstraintPanel constraints={constraints} />}
              {insight && <InsightPanel insight={insight} />}
              <PolicyImpactPanel attributions={attributions} rules={rules} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
