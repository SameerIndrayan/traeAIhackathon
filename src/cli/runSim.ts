import fs from "fs";
import path from "path";
import { loadTransactionsFromCsv } from "../sim/loadCsv";
import { applyRules } from "../sim/applyRules";
import { calcDailyCashSeries } from "../sim/calcCashSeries";
import { diffSeries } from "../sim/diff";
import { Rule } from "../sim/types";

const DATA_FILE = path.join(process.cwd(), "data", "ledger.csv");

function run() {
  console.log("Starting Simulation CLI...");
  
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Error: Data file not found at ${DATA_FILE}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(DATA_FILE, "utf-8");
  
  console.log("Loading transactions...");
  const baselineTransactions = loadTransactionsFromCsv(csvContent);
  console.log(`Loaded ${baselineTransactions.length} transactions.`);

  // Define a rule: Approve expenses > $5000 with a 30-day delay
  const rule: Rule = {
    id: "rule-exp-1",
    type: "expenseApprovalThreshold",
    params: { threshold: 5000, delayDays: 30 },
    enabled: true,
  };

  console.log("Applying rules for alternate scenario...");
  const alternateTransactions = applyRules(baselineTransactions, [rule]);

  console.log("Calculating cash series (Starting Cash: $0)...");
  const startingCash = 0;
  const baselineSeries = calcDailyCashSeries(baselineTransactions, startingCash);
  const alternateSeries = calcDailyCashSeries(alternateTransactions, startingCash);

  console.log("Calculating diff metrics...");
  const metrics = diffSeries(baselineSeries, alternateSeries, alternateTransactions);

  console.log("\n--- Simulation Results ---");
  console.log("Diff Metrics:", JSON.stringify(metrics, null, 2));

  console.log("\n--- First 10 Cash Points (Baseline vs Alternate) ---");
  console.table(
    baselineSeries.slice(0, 10).map((p, i) => ({
      date: p.date,
      baseline: p.balance,
      alternate: alternateSeries[i]?.balance ?? "N/A",
      delta: (alternateSeries[i]?.balance ?? 0) - p.balance
    }))
  );
}

run();
