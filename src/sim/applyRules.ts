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
      default:
        return currentTxns;
    }
  }, transactions);
}
