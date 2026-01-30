import { addDays, parseISO, format } from "date-fns";
import { Transaction } from "../types";

export function applyPaymentTimingRule(
  txns: Transaction[], 
  params: { shiftDays: number }, 
  ruleId: string
): Transaction[] {
  const { shiftDays } = params;
  if (shiftDays === 0) return txns;

  // shiftDays > 0 => pay sooner => date - shiftDays (add -shiftDays)
  // shiftDays < 0 => pay later => date + abs(shiftDays) (add -shiftDays)
  // So always addDays(date, -shiftDays)

  return txns.map(tx => {
    // Apply to all outflows
    const isOutflow = ["expense", "payroll", "marketing", "vendor"].includes(tx.type);
    
    if (isOutflow) {
      const currentDateStr = tx.date;
      const newDate = addDays(parseISO(currentDateStr), -shiftDays);
      const newDateStr = format(newDate, "yyyy-MM-dd");

      return {
        ...tx,
        date: newDateStr,
        audit: {
          ...tx.audit,
          originalDate: tx.audit?.originalDate ?? currentDateStr,
          changedBy: [...(tx.audit?.changedBy ?? []), ruleId],
        },
      };
    }
    return tx;
  });
}
