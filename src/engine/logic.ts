import { Transaction, DailyBalance, SimulationRules, DiffMetrics } from './types';

// Helper to manipulate dates
const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const applyRules = (
  transactions: Transaction[],
  rules: SimulationRules
): { txns: Transaction[]; ruleImpact: Record<string, number> } => {
  const ruleImpact: Record<string, number> = {
    expenseApproval: 0,
    paymentTiming: 0,
  };

  const newTxns = transactions.map((txn) => {
    let newTxn = { ...txn };
    let modified = false;

    // Rule A: Expense Approval
    // Only applies to expenses (amount < 0)
    if (rules.expenseApproval.enabled && txn.amount < 0) {
      // Check threshold (assuming threshold is positive number for comparison)
      // e.g. if expense is -5000, and threshold is 1000.
      // Usually "Expense Approval Threshold" means "If expense > X, it needs approval".
      // Expense magnitude comparison: Math.abs(txn.amount) > rules.expenseApproval.threshold
      if (Math.abs(txn.amount) > rules.expenseApproval.threshold) {
        newTxn.date = addDays(newTxn.date, rules.expenseApproval.delayDays);
        ruleImpact.expenseApproval++;
        modified = true;
      }
    }

    // Rule B: Payment Timing
    // Usually applies to AP (Expenses) or AR (Income)?
    // Prompt says "Payment Timing". "shiftDays (negative to pay later, positive to pay sooner)"
    // "pay later" usually implies we are paying (Expenses).
    // "pay sooner" (positive) might mean we pay earlier?
    // Wait, "shiftDays (negative to pay later)" -> usually standard is +days = later.
    // But prompt says "negative to pay later, positive to pay sooner".
    // That's inverted logic from standard "add days".
    // Let's stick to prompt: shiftDays = -5 => date + 5? Or date - (-5)?
    // "pay later" = date is further in future. Date increases.
    // So if shiftDays is -5 (pay later), we should ADD 5 days?
    // Or maybe the prompt means "shiftDays" is the delta to add.
    // "negative to pay later" -> -5 means date - 5? That would be earlier.
    // Let's assume standard intuitive naming: "Delay" = +days. "Sooner" = -days.
    // Prompt: "negative to pay later".
    // If I add -5 days, date becomes earlier. That's "sooner".
    // So "negative to pay later" implies I should SUBTRACT the shiftDays?
    // Or maybe the prompt means "shiftDays" is a parameter like "days offset".
    // Let's implement: NewDate = Date - shiftDays.
    // If shiftDays is -5 (negative): Date - (-5) = Date + 5 (Later). Correct.
    // If shiftDays is +5 (positive): Date - 5 = Date - 5 (Sooner). Correct.
    // Applies to "Payment" -> usually expenses.
    if (rules.paymentTiming.enabled && txn.amount < 0) {
      if (rules.paymentTiming.shiftDays !== 0) {
        newTxn.date = addDays(newTxn.date, -rules.paymentTiming.shiftDays);
        ruleImpact.paymentTiming++;
        modified = true;
      }
    }

    return newTxn;
  });

  return { txns: newTxns, ruleImpact };
};

export const calcDailyCashSeries = (
  transactions: Transaction[],
  initialCash: number = 100000 // Default starting cash
): DailyBalance[] => {
  // 1. Sort transactions by date
  const sortedTxns = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  if (sortedTxns.length === 0) return [];

  const startDate = sortedTxns[0].date;
  const endDate = sortedTxns[sortedTxns.length - 1].date;
  
  // Create map of daily changes
  const dailyChanges = new Map<string, number>();
  sortedTxns.forEach(txn => {
    const current = dailyChanges.get(txn.date) || 0;
    dailyChanges.set(txn.date, current + txn.amount);
  });

  // Fill in all days
  const series: DailyBalance[] = [];
  let currentBalance = initialCash;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Pad a bit at the end for visualization
  end.setDate(end.getDate() + 30); 

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const change = dailyChanges.get(dateStr) || 0;
    currentBalance += change;
    series.push({ date: dateStr, balance: currentBalance });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return series;
};

export const diffSeries = (
  baseline: DailyBalance[],
  alternate: DailyBalance[],
  baselineTxns: Transaction[],
  alternateTxns: Transaction[],
  ruleImpact: Record<string, number>
): DiffMetrics => {
  if (baseline.length === 0 || alternate.length === 0) {
    return {
      runwayDaysDelta: 0,
      cashAtEndDelta: 0,
      minCashDelta: 0,
      transactionsChangedCount: 0,
      topContributors: []
    };
  }

  // Cash at end delta
  const baselineEnd = baseline[baseline.length - 1].balance;
  const alternateEnd = alternate[alternate.length - 1].balance;
  const cashAtEndDelta = alternateEnd - baselineEnd;

  // Min cash delta (worst dip comparison)
  const baselineMin = Math.min(...baseline.map(d => d.balance));
  const alternateMin = Math.min(...alternate.map(d => d.balance));
  const minCashDelta = alternateMin - baselineMin;

  // Runway delta (days until cash <= 0)
  // Find first day where balance <= 0
  const findRunwayDate = (series: DailyBalance[]) => series.find(d => d.balance <= 0)?.date;
  
  const baselineRunway = findRunwayDate(baseline);
  const alternateRunway = findRunwayDate(alternate);
  
  let runwayDaysDelta = 0;
  if (baselineRunway && alternateRunway) {
     const bDate = new Date(baselineRunway);
     const aDate = new Date(alternateRunway);
     const diffTime = aDate.getTime() - bDate.getTime();
     runwayDaysDelta = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  } else if (baselineRunway && !alternateRunway) {
      // Saved from death!
      runwayDaysDelta = 999; // symbolic "infinity" gain
  } else if (!baselineRunway && alternateRunway) {
      // Caused death!
      runwayDaysDelta = -999;
  }

  // Transactions changed count
  // We can assume length is same, just check differences.
  // Actually applyRules returns ruleImpact, so we can use that for "Top contributors"
  // But total unique changed transactions?
  // We can just iterate and compare.
  let changedCount = 0;
  // Use a map for O(1) lookup if needed, but since we map 1:1, we can just zip if sorted?
  // applyRules preserves order? Yes, map preserves order.
  for (let i = 0; i < baselineTxns.length; i++) {
      if (baselineTxns[i].date !== alternateTxns[i].date || baselineTxns[i].amount !== alternateTxns[i].amount) {
          changedCount++;
      }
  }

  const topContributors = Object.entries(ruleImpact)
    .map(([ruleId, count]) => ({ ruleId, count }))
    .sort((a, b) => b.count - a.count)
    .filter(x => x.count > 0);

  return {
    runwayDaysDelta,
    cashAtEndDelta,
    minCashDelta,
    transactionsChangedCount: changedCount,
    topContributors
  };
};
