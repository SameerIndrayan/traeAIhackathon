import { applyRules } from "../applyRules";
import { calcDailyCashSeries } from "../calcCashSeries";
import { diffSeries, computeAttribution } from "../diff";
import { generateMiniMaxInsight } from "../insights/minimaxPlaceholder";
import { Transaction, Rule } from "../types";
import { loadTransactionsFromCsv } from "../loadCsv";

const mockTransactions: Transaction[] = [
  { id: "1", date: "2023-01-01", amount: 1000, type: "revenue" },
  { id: "2", date: "2023-01-05", amount: -500, type: "expense" },
  { id: "3", date: "2023-01-10", amount: -200, type: "expense" },
];

const mockRule: Rule = {
  id: "rule1",
  type: "expenseApprovalThreshold",
  params: { threshold: 300, delayDays: 5 },
  enabled: true,
};

describe("Simulation Engine", () => {
  test("Applies expense approval rule correctly", () => {
    const results = applyRules(mockTransactions, [mockRule]);
    
    // Tx 1: Revenue, ignored.
    expect(results[0]).toEqual(mockTransactions[0]);
    
    // Tx 2: Expense -500. abs(500) > 300. Should shift 5 days.
    // Original date 2023-01-05 -> 2023-01-10.
    expect(results[1].date).toBe("2023-01-10");
    expect(results[1].audit?.originalDate).toBe("2023-01-05");
    expect(results[1].audit?.changedBy).toContain("rule1");
    
    // Tx 3: Expense -200. abs(200) < 300. Ignored.
    expect(results[2]).toEqual(mockTransactions[2]);
  });

  test("Calculates cash series correctly with carry forward", () => {
    const series = calcDailyCashSeries(mockTransactions, 0);
    // 2023-01-01: 1000
    // 2023-01-02: 1000 (carried forward)
    // ...
    // 2023-01-05: 1000 - 500 = 500
    // ...
    // 2023-01-10: 500 - 200 = 300
    
    expect(series.find(p => p.date === "2023-01-01")?.balance).toBe(1000);
    expect(series.find(p => p.date === "2023-01-04")?.balance).toBe(1000);
    expect(series.find(p => p.date === "2023-01-05")?.balance).toBe(500);
    expect(series.find(p => p.date === "2023-01-10")?.balance).toBe(300);
  });
  
  test("Calculates cash series with starting cash", () => {
    const series = calcDailyCashSeries(mockTransactions, 100);
    expect(series.find(p => p.date === "2023-01-01")?.balance).toBe(1100);
  });

  test("Diffs baseline vs alternate correctly", () => {
    const baseline = calcDailyCashSeries(mockTransactions, 0);
    const alternateTx = applyRules(mockTransactions, [mockRule]);
    const alternate = calcDailyCashSeries(alternateTx, 0);
    
    const diff = diffSeries(baseline, alternate, alternateTx);
    
    // On 2023-01-05 (original expense date):
    // Baseline: 500 (expense happened)
    // Alternate: 1000 (expense delayed)
    // Delta: +500
    const d1 = baseline.find(p => p.date === "2023-01-05");
    const a1 = alternate.find(p => p.date === "2023-01-05");
    
    // We check via diffSeries result if we could inspect individual points, 
    // but diffSeries returns aggregated metrics now.
    // Let's verify metrics.
    
    // cashDeltaAtEnd
    // Baseline end (2023-01-10): 300
    // Alternate end (2023-01-10): 300 (delayed expense paid now + small expense)
    // So delta at end should be 0.
    expect(diff.cashDeltaAtEnd).toBe(0);
    
    // minCashDelta
    // Lowest delta?
    // 1-4 Jan: 0
    // 5-9 Jan: Alt=1000, Base=500 -> Delta=+500
    // 10 Jan: Alt=300, Base=300 -> Delta=0
    // Min delta is 0.
    expect(diff.minCashDelta).toBe(0);
    
    // numTransactionsChanged
    // 1 transaction changed.
    expect(diff.numTransactionsChanged).toBe(1);
    
    // runwayDeltaDays
    // Neither goes below 0, so should be 0 (as per implementation logic for Infinity - Infinity)
    expect(diff.runwayDeltaDays).toBe(0);
  });

  test("Runway delta calculation", () => {
    // Scenario where baseline goes negative, but alternate delays it.
    const txns: Transaction[] = [
      { id: "1", date: "2023-01-01", amount: 1000, type: "revenue" },
      { id: "2", date: "2023-01-02", amount: -2000, type: "expense" } // Baseline busts here
    ];
    
    // Rule delays expense by 2 days -> 2023-01-04
    const rule: Rule = {
      id: "r1", type: "expenseApprovalThreshold", 
      params: { threshold: 100, delayDays: 2 }, enabled: true 
    };
    
    const baseline = calcDailyCashSeries(txns, 0);
    const altTx = applyRules(txns, [rule]);
    const alternate = calcDailyCashSeries(altTx, 0);
    
    const metrics = diffSeries(baseline, alternate, altTx);
    
    // Baseline < 0 on Jan 2.
    // Alternate < 0 on Jan 4.
    // Delta should be 2 days.
    expect(metrics.runwayDeltaDays).toBe(2);
  });

  test("Rule enabled flag works", () => {
    const disabledRule: Rule = { ...mockRule, enabled: false };
    const results = applyRules(mockTransactions, [disabledRule]);
    expect(results).toEqual(mockTransactions);
  });

  test("Applies payment timing rule correctly", () => {
    // Shift +2 days (sooner) -> date - 2
    const rule: Rule = {
      id: "pay-sooner",
      type: "paymentTiming",
      params: { shiftDays: 2 },
      enabled: true
    };
    
    // Original: Expense on 2023-01-05
    // New: 2023-01-03
    const results = applyRules(mockTransactions, [rule]);
    
    const expense = results.find(t => t.id === "2");
    expect(expense?.date).toBe("2023-01-03");
    expect(expense?.audit?.changedBy).toContain("pay-sooner");
    
    // Revenue should NOT change
    const revenue = results.find(t => t.id === "1");
    expect(revenue?.date).toBe("2023-01-01");
  });

  test("Does NOT mutate baseline transactions", () => {
    // Deep copy not strictly required if we trust loadCsv, but let's be safe for the test
    const original = JSON.parse(JSON.stringify(mockTransactions));
    const rule: Rule = {
      id: "mutate-check",
      type: "expenseApprovalThreshold",
      params: { threshold: 100, delayDays: 10 },
      enabled: true
    };

    const results = applyRules(mockTransactions, [rule]);

    // Check that original objects are untouched
    expect(mockTransactions[1].date).toBe("2023-01-05");
    expect(mockTransactions[1].audit).toBeUndefined(); // Assuming mock data had no audit initially
    
    // Check that result is different
    expect(results[1].date).not.toBe("2023-01-05");
  });

  test("Computes attribution correctly", () => {
    // Scenario: Expense delayed by rule
    const rule: Rule = {
      id: "rule1", type: "expenseApprovalThreshold",
      params: { threshold: 300, delayDays: 5 }, enabled: true
    };
    
    // Tx2 (-500) moves from Jan 5 to Jan 10
    const baseline = calcDailyCashSeries(mockTransactions, 0);
    const altTx = applyRules(mockTransactions, [rule]);
    const alternate = calcDailyCashSeries(altTx, 0);
    
    const attributions = computeAttribution(baseline, alternate, altTx, [rule]);
    
    expect(attributions).toHaveLength(1);
    expect(attributions[0].ruleId).toBe("rule1");
    expect(attributions[0].txnCount).toBe(1); // Only Tx2 changed
    
    // Impact calculation: Sum of daily deltas on affected dates (Original Dates)
    // Tx2 Original Date: Jan 5.
    // On Jan 5: Base=500, Alt=1000 -> Delta +500.
    // So estimated impact should be +500.
    
    expect(attributions[0].estimatedCashImpact).toBe(500);
  });

  test("Generates insights correctly", () => {
    // Basic scenario
    const metrics = {
      cashDeltaAtEnd: 1000,
      minCashDelta: 500,
      runwayDeltaDays: 10,
      numTransactionsChanged: 5
    };
    
    const attributions = [
      { ruleId: "r1", txnCount: 5, estimatedCashImpact: 1000 }
    ];
    
    const rules: Rule[] = [
      { id: "r1", type: "expenseApprovalThreshold", params: { threshold: 100, delayDays: 5 }, enabled: true }
    ];
    
    const insight = generateMiniMaxInsight(metrics, attributions, rules);
    
    expect(insight.summary).toContain("improved");
    expect(insight.summary).toContain("$1,000");
    expect(insight.drivers).toHaveLength(1);
    expect(insight.drivers[0]).toContain("Stricter expense approval");
    expect(insight.tradeoffs).toContain("Runway extended by 10 days, providing more time to react to market changes.");
  });
});




describe("CSV Loader", () => {
  test("Loads valid CSV string correctly", () => {
    const csvContent = `id,date,amount,type
1,2023-01-01,1000,revenue
2,2023-01-02,-500,expense
`;
    
    const txs = loadTransactionsFromCsv(csvContent);
    expect(txs).toHaveLength(2);
    expect(txs[0]).toMatchObject({
      id: "1", date: "2023-01-01", amount: 1000, type: "revenue"
    });
    expect(txs[1]).toMatchObject({
      id: "2", date: "2023-01-02", amount: -500, type: "expense"
    });
  });

  test("Parses metadata JSON", () => {
    const csvContent = `id,date,amount,type,metadata
1,2023-01-01,100,revenue,"{""foo"":""bar""}"
`;
    const txs = loadTransactionsFromCsv(csvContent);
    expect(txs[0].metadata).toEqual({ foo: "bar" });
  });

  test("Throws on invalid CSV structure", () => {
    const csvContent = `id,date,amount
1,2023-01-01,100
`; // Missing type
    expect(() => loadTransactionsFromCsv(csvContent)).toThrow();
  });
});
