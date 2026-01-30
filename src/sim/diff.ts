import { CashPoint, DiffMetrics, Transaction, PolicyAttribution, Rule, ConstraintMetrics, ConstraintComparison } from "./types";
import { differenceInDays, parseISO, addDays, format } from "date-fns";

// ... existing code ...

function computeSeriesConstraints(series: CashPoint[], txns: Transaction[]): ConstraintMetrics {
  // 1. Minimum Cash Buffer (Threshold: $75,000)
  const MIN_BUFFER_THRESHOLD = 75000;
  let daysBelowThreshold = 0;
  let longestStreakBelow = 0;
  let currentStreak = 0;

  series.forEach(p => {
    if (p.balance < MIN_BUFFER_THRESHOLD) {
      daysBelowThreshold++;
      currentStreak++;
    } else {
      if (currentStreak > longestStreakBelow) longestStreakBelow = currentStreak;
      currentStreak = 0;
    }
  });
  // Check final streak
  if (currentStreak > longestStreakBelow) longestStreakBelow = currentStreak;

  // 2. Sharp Cash Drop Events (> $30,000 within 7 days)
  const DROP_THRESHOLD = 30000;
  const DROP_WINDOW = 7;
  let sharpDropCount = 0;
  let worstDrop = 0;

  // We check every window of 7 days
  // Series is dense.
  for (let i = 0; i < series.length; i++) {
    // Look ahead up to 7 days (or end of series)
    // Actually, "drop within 7 days" means look at any two points separated by <= 7 days?
    // Or rolling 7 day window? 
    // Usually: High point - Low point within window > Threshold.
    // Simple implementation: Compare day[i] vs day[i+7] (or any day in between).
    // Let's check max drop from day[i] to day[i+k] where k <= 7.
    
    const startBalance = series[i].balance;
    for (let k = 1; k <= DROP_WINDOW; k++) {
      if (i + k >= series.length) break;
      const endBalance = series[i + k].balance;
      const drop = startBalance - endBalance;
      
      if (drop > worstDrop) worstDrop = drop;
      
      // We only count "events". A single huge crash might trigger multiple windows.
      // Let's count "distinct" events? 
      // Simplest robust metric: Count days where the 7-day forward outlook drops > 30k.
      if (drop > DROP_THRESHOLD) {
        sharpDropCount++;
        // Skip ahead to avoid double counting the same crash?
        // Prompt says "Count of such events". 
        // If I drop 50k in 1 day, that triggers for day[i], day[i-1], etc.
        // Let's count unique "start days" that initiate a sharp drop.
        break; // Count this start day once
      }
    }
  }

  // 3. Delayed Obligations (> 30 days)
  // Check audit trail.
  let countDelayedOver30Days = 0;
  let maxDelayDays = 0;

  txns.forEach(tx => {
    if (tx.audit && tx.audit.originalDate) {
      const original = parseISO(tx.audit.originalDate);
      const current = parseISO(tx.date);
      const diff = differenceInDays(current, original);
      
      if (diff > 30) countDelayedOver30Days++;
      if (diff > maxDelayDays) maxDelayDays = diff;
    }
  });

  return {
    minCashBuffer: { daysBelowThreshold, longestStreakBelow },
    sharpDrops: { eventCount: sharpDropCount, worstDrop },
    delayedObligations: { countDelayedOver30Days, maxDelayDays }
  };
}

export function computeConstraints(
  baselineSeries: CashPoint[],
  alternateSeries: CashPoint[],
  baselineTxns: Transaction[],
  alternateTxns: Transaction[]
): ConstraintComparison {
  return {
    baseline: computeSeriesConstraints(baselineSeries, baselineTxns),
    alternate: computeSeriesConstraints(alternateSeries, alternateTxns)
  };
}

export function computeAttribution(
  baselineSeries: CashPoint[],
  replaySeries: CashPoint[],
  replayedTxns: Transaction[],
  rules: Rule[]
): PolicyAttribution[] {
  // Map dates to balance deltas (Replay - Baseline)
  const deltaMap = new Map<string, number>();
  
  // Align series to build the delta map
  const allDates = new Set([
    ...baselineSeries.map(p => p.date),
    ...replaySeries.map(p => p.date)
  ]);
  const sortedDates = Array.from(allDates).sort();

  const baseMap = new Map(baselineSeries.map(p => [p.date, p.balance]));
  const replayMap = new Map(replaySeries.map(p => [p.date, p.balance]));

  let lastBase = 0;
  let lastReplay = 0;

  // Initialize carry forward
  if (sortedDates.length > 0) {
      if (baseMap.has(sortedDates[0])) lastBase = baseMap.get(sortedDates[0])!;
      if (replayMap.has(sortedDates[0])) lastReplay = replayMap.get(sortedDates[0])!;
  }

  for (const date of sortedDates) {
    if (baseMap.has(date)) lastBase = baseMap.get(date)!;
    if (replayMap.has(date)) lastReplay = replayMap.get(date)!;
    deltaMap.set(date, lastReplay - lastBase);
  }

  // For each rule, find affected transactions and sum the daily cash deltas on their NEW dates.
  // This is "Option A": Sum (replayCash - baselineCash) on affected dates.
  
  return rules
    .filter(r => r.enabled)
    .map(rule => {
      // Find transactions changed by this rule
      const affectedTxns = replayedTxns.filter(tx => 
        tx.audit?.changedBy?.includes(rule.id)
      );

      // Sum the delta for each affected transaction's date
      // We use the ORIGINAL date if available, because that's when the "savings" usually occur (e.g. avoiding an expense).
      // We also include the NEW date to capture the full picture? 
      // Actually, if we just use the Original Date, we capture the delta created by moving the transaction AWAY.
      // If we use the New Date, we capture the delta when it lands (which might be 0 if balances converge).
      // Let's use the Original Date for "Impact".
      
      const affectedDates = new Set(affectedTxns.map(tx => tx.audit?.originalDate || tx.date));
      let totalImpact = 0;
      
      affectedDates.forEach(date => {
        if (deltaMap.has(date)) {
          totalImpact += deltaMap.get(date)!;
        }
      });

      return {
        ruleId: rule.id,
        txnCount: affectedTxns.length,
        estimatedCashImpact: totalImpact
      };
    })
    .sort((a, b) => Math.abs(b.estimatedCashImpact) - Math.abs(a.estimatedCashImpact)); // Rank by magnitude
}

export function diffSeries(
  baseline: CashPoint[], 
  alternate: CashPoint[], 
  alternateTransactions?: Transaction[]
): DiffMetrics {
  
  // Align series
  const allDates = new Set([
    ...baseline.map(p => p.date),
    ...alternate.map(p => p.date)
  ]);
  const sortedDates = Array.from(allDates).sort();

  const baseMap = new Map(baseline.map(p => [p.date, p.balance]));
  const altMap = new Map(alternate.map(p => [p.date, p.balance]));

  // Find the global start date to correctly initialize "last known balance"
  // If baseline starts on Jan 1 and alternate on Jan 5 (due to shifting?), 
  // we need to be careful. But calcCashSeries usually starts from min(tx dates).
  // We should assume 0 if no previous balance exists.
  
  let lastBase = 0;
  let lastAlt = 0;
  
  // Initialize with the very first available value if possible, 
  // but strictly we should iterate and carry forward.
  // Actually, the loop below handles carry forward by checking the map.
  // If map doesn't have the date, we use the `lastBase` value.
  // BUT: we must initialize `lastBase` to the balance BEFORE the first date if we were mid-stream.
  // Since we start from scratch, 0 is fine, OR the first value of the series if it matches the first date.
  
  if (sortedDates.length > 0) {
      if (baseMap.has(sortedDates[0])) lastBase = baseMap.get(sortedDates[0])!;
      if (altMap.has(sortedDates[0])) lastAlt = altMap.get(sortedDates[0])!;
  }

  // Track min delta
  let minCashDelta = Infinity;
  
  // Track runway
  // We need to find the FIRST date where balance < 0 for baseline and alternate.
  // We can just search the series directly since they are dense.
  const findRunwayDate = (series: CashPoint[]) => series.find(p => p.balance < 0)?.date || null;
  
  const baselineRunwayDate = findRunwayDate(baseline);
  const alternateRunwayDate = findRunwayDate(alternate);

  // Compute metrics over the aligned timeline
  for (const date of sortedDates) {
    if (baseMap.has(date)) lastBase = baseMap.get(date)!;
    if (altMap.has(date)) lastAlt = altMap.get(date)!;
    
    const delta = lastAlt - lastBase;
    
    // We want the "worst dip" which means the lowest negative delta (or smallest positive).
    // Actually "worst cash dip delta" usually means: "How much WORSE is my lowest point?"
    // OR "What is the minimum difference between Alt and Base?"
    // User said: "worst cash dip delta (min cash difference)"
    // If Alt is always > Base, this is positive.
    // If Alt dips below Base, this is negative.
    if (delta < minCashDelta) minCashDelta = delta;
  }
  
  // If minCashDelta is still Infinity (empty series), set to 0
  if (minCashDelta === Infinity) minCashDelta = 0;

  // Final Cash Delta
  // We must use the balance at the VERY LAST date common to the timeline (or just the absolute max date).
  // The loop finishes with lastBase/lastAlt holding the values at the last sortedDate.
  const cashDeltaAtEnd = lastAlt - lastBase;

  // Runway Delta
  let runwayDeltaDays = 0;
  if (baselineRunwayDate && alternateRunwayDate) {
    runwayDeltaDays = differenceInDays(parseISO(alternateRunwayDate), parseISO(baselineRunwayDate));
  } else if (baselineRunwayDate && !alternateRunwayDate) {
    runwayDeltaDays = Infinity; // Alternate saved us
  } else if (!baselineRunwayDate && alternateRunwayDate) {
    runwayDeltaDays = -Infinity; // Alternate killed us
  } else {
    runwayDeltaDays = 0; // Both safe or both infinite
  }

  // Count changed transactions
  const numTransactionsChanged = alternateTransactions 
    ? alternateTransactions.filter(tx => tx.audit && tx.audit.changedBy && tx.audit.changedBy.length > 0).length
    : 0;

  return {
    cashDeltaAtEnd,
    minCashDelta,
    runwayDeltaDays,
    numTransactionsChanged
  };
}
