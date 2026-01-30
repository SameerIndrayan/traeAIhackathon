import { Transaction, CashPoint } from "./types";
import { parseISO, format, addDays, differenceInDays } from "date-fns";

export function calcDailyCashSeries(transactions: Transaction[], startingCash: number): CashPoint[] {
  if (transactions.length === 0) return [];

  // Sort transactions by date
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  const startDate = parseISO(sorted[0].date);
  const endDate = parseISO(sorted[sorted.length - 1].date);
  
  const series: CashPoint[] = [];
  let currentBalance = startingCash;
  let txIndex = 0;
  
  const totalDays = differenceInDays(endDate, startDate) + 1;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, "yyyy-MM-dd");

    // Process all transactions for this day
    while (txIndex < sorted.length && sorted[txIndex].date === dateStr) {
      currentBalance += sorted[txIndex].amount;
      txIndex++;
    }

    series.push({ date: dateStr, balance: currentBalance });
  }

  return series;
}
