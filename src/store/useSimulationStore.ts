import { create } from 'zustand';
import { Transaction, DailyBalance, SimulationRules, DiffMetrics } from '../engine/types';
import { applyRules, calcDailyCashSeries, diffSeries } from '../engine/logic';
import { MOCK_TRANSACTIONS } from '../engine/mockData';

interface SimulationState {
  baselineTxns: Transaction[];
  alternateTxns: Transaction[];
  baselineSeries: DailyBalance[];
  alternateSeries: DailyBalance[];
  metrics: DiffMetrics | null;
  rules: SimulationRules;
  
  // Actions
  loadData: () => void;
  updateRules: (newRules: Partial<SimulationRules>) => void;
}

const INITIAL_RULES: SimulationRules = {
  expenseApproval: {
    enabled: false,
    threshold: 1000,
    delayDays: 14,
  },
  paymentTiming: {
    enabled: false,
    shiftDays: -7, // Default "pay later" by 7 days (negative shift)
  },
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  baselineTxns: [],
  alternateTxns: [],
  baselineSeries: [],
  alternateSeries: [],
  metrics: null,
  rules: INITIAL_RULES,

  loadData: () => {
    // In real app, fetch from API. Here use mock.
    const baselineTxns = MOCK_TRANSACTIONS;
    const baselineSeries = calcDailyCashSeries(baselineTxns);
    
    // Initial run with default rules
    const { rules } = get();
    const { txns: alternateTxns, ruleImpact } = applyRules(baselineTxns, rules);
    const alternateSeries = calcDailyCashSeries(alternateTxns);
    const metrics = diffSeries(baselineSeries, alternateSeries, baselineTxns, alternateTxns, ruleImpact);

    set({
      baselineTxns,
      baselineSeries,
      alternateTxns,
      alternateSeries,
      metrics
    });
  },

  updateRules: (newRulesPartial) => {
    const { baselineTxns, baselineSeries, rules: currentRules } = get();
    
    // Merge rules deeply
    const newRules = {
      ...currentRules,
      ...newRulesPartial,
      expenseApproval: { ...currentRules.expenseApproval, ...(newRulesPartial.expenseApproval || {}) },
      paymentTiming: { ...currentRules.paymentTiming, ...(newRulesPartial.paymentTiming || {}) },
    };

    // Recompute
    const { txns: alternateTxns, ruleImpact } = applyRules(baselineTxns, newRules);
    const alternateSeries = calcDailyCashSeries(alternateTxns);
    const metrics = diffSeries(baselineSeries, alternateSeries, baselineTxns, alternateTxns, ruleImpact);

    set({
      rules: newRules,
      alternateTxns,
      alternateSeries,
      metrics
    });
  },
}));
