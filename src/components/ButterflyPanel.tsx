
import React, { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';

interface ButterflyResult {
  sentiment: string;
  divergenceScore: number;
  revenueMultiplier: number;
  expenseMultiplier: number;
}

interface ButterflyPanelProps {
  onApply: (description: string, result: ButterflyResult) => void;
}

export function ButterflyPanel({ onApply }: ButterflyPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ButterflyResult | null>(null);

  const handleSimulate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!res.ok) throw new Error('Simulation failed');
      
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to simulate scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">Butterfly Effect Engine</h2>
      </div>
      
      <p className="text-sm text-gray-500">
        Enter a "What If" scenario to bend the timeline using Generative AI.
      </p>

      <textarea
        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
        placeholder='e.g. What if we hire 2 fewer engineers in Q2 and delay all server upgrades by 45 days?'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      {!result && (
        <button
          onClick={handleSimulate}
          disabled={loading || !prompt}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Simulate Divergence
        </button>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 bg-purple-50 rounded-md border border-purple-100">
            <h3 className="font-medium text-purple-900 mb-1">Synthetic Sentiment</h3>
            <p className="text-sm text-purple-800">{result.sentiment}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-xs text-gray-500 uppercase">Divergence</span>
              <div className="text-xl font-bold text-gray-900">{result.divergenceScore}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-xs text-gray-500 uppercase">Rev Impact</span>
              <div className="text-xl font-bold text-gray-900">
                {result.revenueMultiplier > 1 ? '+' : ''}{Math.round((result.revenueMultiplier - 1) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onApply(prompt, result);
                setResult(null);
                setPrompt('');
              }}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Apply to Timeline
            </button>
            <button
              onClick={() => setResult(null)}
              className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
