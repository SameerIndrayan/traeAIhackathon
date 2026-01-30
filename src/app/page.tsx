import React from 'react';
import fs from 'fs';
import path from 'path';
import { loadTransactionsFromCsv } from '../sim/loadCsv';
import Simulator from '../components/Simulator';

// This is a Server Component
export default function Home() {
  const dataPath = path.join(process.cwd(), 'data', 'ledger.csv');
  
  let transactions = [];
  try {
    const csvContent = fs.readFileSync(dataPath, 'utf-8');
    transactions = loadTransactionsFromCsv(csvContent);
  } catch (err) {
    console.error("Failed to load transactions:", err);
    return (
      <div className="p-8 text-red-600">
        Error loading data. Please ensure data/ledger.csv exists.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Financial Time-Travel Simulator</h1>
          <p className="text-gray-600 mt-2">
            Replay history under different policy rules. This is a counterfactual analysis tool, not a forecasting engine.
          </p>
        </header>
        
        <Simulator initialTransactions={transactions} />
      </div>
    </main>
  );
}
