import React from 'react';

export function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
        <p className="text-gray-600 text-lg">
          Understanding the Financial Time-Travel Simulator
        </p>
      </div>

      {/* Section 1: The Engine */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">1. The Deterministic Engine</h3>
        <p className="text-gray-700 leading-relaxed">
          This simulator is built on a <strong>deterministic financial engine</strong>. It does not use AI to "guess" your future cash flow. Instead, it performs a strict mathematical replay of your historical data.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Input:</strong> It takes your actual ledger (revenue, expenses, payroll) from the past year.
          </li>
          <li>
            <strong>Rules:</strong> When you adjust a slider (e.g., &quot;Delay expenses &gt; $5k&quot;), the engine effectively &quot;rewrites&quot; the dates of those specific transactions in the history books.
          </li>
          <li>
            <strong>Replay:</strong> It then recalculates your daily cash balance from Day 1 to Day 365 using these modified dates.
          </li>
        </ul>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-800">
          <strong>Key Takeaway:</strong> The "Replayed History" line is mathematically exact. It shows <em>exactly</em> where your bank balance would have been if you had applied these rules.
        </div>
      </section>

      {/* Section 2: Interpreting the Numbers */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">2. How to Interpret the Numbers</h3>
        <p className="text-gray-700 leading-relaxed">
          The value of this tool lies in the <strong>differences (Deltas)</strong> between what actually happened and what could have happened.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Runway Delta</h4>
            <p className="text-sm text-gray-600">
              "Did this rule keep us alive longer?"<br/>
              <strong>+30 days</strong> means you gained a month of survival time.<br/>
              <strong>Broke</strong> means the new policy caused a failure that didn't happen in reality.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Worst Cash Dip Delta</h4>
            <p className="text-sm text-gray-600">
              "Did this rule make the scary days less scary?"<br/>
              <strong>+$10,000</strong> means your lowest bank balance was $10k higher than it actually was.<br/>
              This measures <strong>resilience</strong>.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Constraint Analysis</h4>
            <p className="text-sm text-gray-600">
              "Did we break any safety rules?"<br/>
              We track specific risks like dipping below <strong>$75k</strong> or seeing sudden <strong>$30k drops</strong>.<br/>
              Green checks ✅ mean you successfully avoided a risk event.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Policy Attribution</h4>
            <p className="text-sm text-gray-600">
              "Which rule did the heavy lifting?"<br/>
              We calculate exactly how much cash each specific rule contributed to the improvement, so you know which policy matters most.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The AI Insight */}
      <section className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">3. The AI Narrator</h3>
        <p className="text-gray-700 leading-relaxed">
          The "AI Policy Insight" panel acts as a financial analyst. It reads the deterministic data produced by the engine and translates it into plain English. It highlights <strong>tradeoffs</strong>—for example, acknowledging that while delaying payments improves cash flow, it might strain vendor relationships (represented as "operational flexibility").
        </p>
      </section>

    </div>
  );
}
