import { DiffMetrics, PolicyAttribution, Rule } from "../types";

export type MiniMaxInsight = {
  summary: string;
  drivers: string[];
  tradeoffs: string[];
};

/**
 * This function simulates MiniMax-style reasoning for demo purposes.
 * It uses deterministic templates to generate explanations based on computed metrics.
 * In a production version, this would be replaced by an LLM call to MiniMax
 * which would ingest the same JSON context and produce more nuanced text.
 */
export function generateMiniMaxInsight(
  metrics: DiffMetrics,
  attributions: PolicyAttribution[],
  rules: Rule[]
): MiniMaxInsight {
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(val));

  const activeRules = rules.filter(r => r.enabled);
  const totalImpact = attributions.reduce((acc, curr) => acc + curr.estimatedCashImpact, 0);
  const isPositive = totalImpact >= 0;
  
  // 1. Generate Summary
  let summary = "";
  if (activeRules.length === 0) {
    summary = "No policy rules are currently active. The replayed history is identical to the actual history.";
  } else {
    const actionVerb = isPositive ? "improved" : "reduced";
    const impactText = formatMoney(totalImpact);
    const ruleNames = activeRules.map(r => 
      r.type === 'expenseApprovalThreshold' ? 'expense approval' : 'payment timing'
    ).join(" and ");

    summary = `Applying ${ruleNames} policies would have ${actionVerb} the overall cash position by approximately ${impactText} across the timeline. This counterfactual analysis shows how liquidity would have shifted under these constraints.`;
  }

  // 2. Generate Drivers
  const drivers = attributions.map(attr => {
    const rule = rules.find(r => r.id === attr.ruleId);
    const amount = formatMoney(attr.estimatedCashImpact);
    const direction = attr.estimatedCashImpact >= 0 ? "saved" : "cost";
    
    if (rule?.type === 'expenseApprovalThreshold') {
      return `Stricter expense approval (>${rule.params.threshold}) affected ${attr.txnCount} transactions, effectively preserving ${amount} in liquidity during the delay period.`;
    } else if (rule?.type === 'paymentTiming') {
      const shift = rule.params.shiftDays;
      const timing = shift > 0 ? "earlier" : "later";
      return `Shifting vendor payments ${Math.abs(shift)} days ${timing} ${direction} ${amount} in relative cash flow impact across ${attr.txnCount} transactions.`;
    }
    return `Policy rule ${attr.ruleId} contributed ${amount} to the variance.`;
  });

  // 3. Generate Tradeoffs
  const tradeoffs: string[] = [];
  if (activeRules.length > 0) {
    if (metrics.minCashDelta > 0) {
      tradeoffs.push(`Liquidity safety margin improved by ${formatMoney(metrics.minCashDelta)} at the lowest point, reducing insolvency risk.`);
    } else if (metrics.minCashDelta < 0) {
      tradeoffs.push(`While some periods saw higher cash, the worst dip was ${formatMoney(metrics.minCashDelta)} lower than baseline, indicating potential liquidity stress.`);
    }

    if (metrics.runwayDeltaDays > 0) {
      tradeoffs.push(`Runway extended by ${metrics.runwayDeltaDays} days, providing more time to react to market changes.`);
    } else {
      tradeoffs.push("Operational flexibility was prioritized over runway extension in this scenario.");
    }
    
    // Generic tradeoff about delay vs immediacy
    if (attributions.some(a => a.estimatedCashImpact > 0)) {
      tradeoffs.push("Cash preservation in the short term implies delayed vendor relationships or slower execution.");
    }
  }

  return { summary, drivers, tradeoffs };
}
