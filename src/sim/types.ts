import { z } from "zod";

// --- Domain Models ---

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
  amount: z.number(),
  type: z.enum(["revenue", "expense", "payroll", "marketing", "vendor"]),
  metadata: z.record(z.string(), z.any()).optional(),
  audit: z.object({
    originalDate: z.string().optional(),
    changedBy: z.array(z.string()).optional(),
  }).optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const RuleSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("expenseApprovalThreshold"),
    params: z.object({
      threshold: z.number(),
      delayDays: z.number(),
    }),
    enabled: z.boolean(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("paymentTiming"),
    params: z.object({
      shiftDays: z.number(), // positive = sooner (subtract days), negative = later (add days)
    }),
    enabled: z.boolean(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("butterflyEffect"),
    params: z.object({
      description: z.string(),
      divergenceScore: z.number(),
      sentiment: z.string(),
      revenueMultiplier: z.number(),
      expenseMultiplier: z.number(),
    }),
    enabled: z.boolean(),
  }),
]);

export type Rule = z.infer<typeof RuleSchema>;

export type RuleSet = {
  rules: Rule[];
};

export type CashPoint = {
  date: string;
  balance: number;
};

export type DiffMetrics = {
  cashDeltaAtEnd: number;
  minCashDelta: number;
  runwayDeltaDays: number; // Infinity if never runs out of cash
  numTransactionsChanged: number;
};

export type PolicyAttribution = {
  ruleId: string;
  txnCount: number;
  estimatedCashImpact: number;
};

