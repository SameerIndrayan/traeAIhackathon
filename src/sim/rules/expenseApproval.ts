import { addDays, parseISO, format } from "date-fns";
import { Transaction } from "../types";

export function applyExpenseApprovalRule(
  txns: Transaction[], 
  params: { threshold: number; delayDays: number }, 
  ruleId: string
): Transaction[] {
  const { threshold, delayDays } = params;

  return txns.map(tx => {
    // Condition: type === "expense" AND abs(amount) > threshold
    if (tx.type === "expense" && Math.abs(tx.amount) > threshold) {
      const currentDateStr = tx.date;
      const newDate = addDays(parseISO(currentDateStr), delayDays);
      const newDateStr = format(newDate, "yyyy-MM-dd");

      // Immutable update
      return {
        ...tx,
        date: newDateStr,
        audit: {
          ...tx.audit,
          // If originalDate is already set, keep it (it's the true original). 
          // Otherwise, set it to the current date before modification.
          originalDate: tx.audit?.originalDate ?? currentDateStr,
          changedBy: [...(tx.audit?.changedBy ?? []), ruleId],
        },
      };
    }
    return tx;
  });
}
