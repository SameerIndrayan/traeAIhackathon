export type Transaction = {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number; // Positive for income, negative for expense
  description: string;
  category: string;
};

export type DailyBalance = {
  date: string;
  balance: number;
};

export type SimulationRules = {
  expenseApproval: {
    enabled: boolean;
    threshold: number;
    delayDays: number;
  };
  paymentTiming: {
    enabled: boolean;
    shiftDays: number;
  };
};

export type DiffMetrics = {
  runwayDaysDelta: number;
  cashAtEndDelta: number;
  minCashDelta: number;
  transactionsChangedCount: number;
  topContributors: { ruleId: string; count: number }[];
};
