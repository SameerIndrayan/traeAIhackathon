import { Transaction, Rule } from "./types";
import { applyExpenseApprovalRule } from "./rules/expenseApproval";
import { applyPaymentTimingRule } from "./rules/paymentTiming";

export function applyRules(transactions: Transaction[], rules: Rule[]): Transaction[] {
  // Sort rules if order matters, but here we assume the array order is the application order.
  // We process rules sequentially.
  
  return rules.reduce((currentTxns, rule) => {
    if (!rule.enabled) return currentTxns;

    switch (rule.type) {
      case "expenseApprovalThreshold":
        return applyExpenseApprovalRule(currentTxns, rule.params, rule.id);
      case "paymentTiming":
        return applyPaymentTimingRule(currentTxns, rule.params, rule.id);
      case "butterflyEffect":
        return currentTxns.map(t => {
          let multiplier = 1;
          if (t.type === 'revenue') multiplier = rule.params.revenueMultiplier;
          if (['expense', 'payroll', 'marketing', 'vendor'].includes(t.type)) multiplier = rule.params.expenseMultiplier;
          
          if (multiplier === 1) return t;

          return {
            ...t,
            amount: t.amount * multiplier,
            audit: {
              ...t.audit,
              changedBy: [...(t.audit?.changedBy || []), rule.id]
            }
          };
        });
      default:
        return currentTxns;
    }
  }, transactions);
}
