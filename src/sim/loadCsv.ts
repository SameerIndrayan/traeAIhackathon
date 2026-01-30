import Papa from "papaparse";
import { Transaction, TransactionSchema } from "./types";

/**
 * Parses a CSV string into a list of Transactions.
 * Expects columns: id, date, amount, type, [metadata]
 * Validates each row against the TransactionSchema.
 */
export function loadTransactionsFromCsv(csvText: string): Transaction[] {
  const { data, errors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (errors.length > 0) {
    throw new Error(`CSV parsing error: ${JSON.stringify(errors)}`);
  }

  return data.map((row: any, index: number) => {
    try {
      // Handle metadata JSON parsing if it exists as a string
      let metadata = row.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          // If it's not valid JSON, leave it or handle error. 
          // For now, let's assume it should be an object or undefined.
          // If parsing fails, Zod might catch it if it expects a record.
          // Or we can treat it as a single key record if needed, but requirements say "JSON column".
          throw new Error("Invalid JSON in metadata column");
        }
      }

      const tx = {
        id: String(row.id),
        date: String(row.date),
        amount: Number(row.amount),
        type: row.type,
        metadata: metadata || undefined,
      };

      return TransactionSchema.parse(tx);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Row ${index + 1} validation failed: ${err.message}`);
      }
      throw err;
    }
  });
}
