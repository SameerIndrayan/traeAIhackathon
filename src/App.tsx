import React, { useEffect } from 'react';
import RulesPanel from './components/RulesPanel';
import TimelinePanel from './components/TimelinePanel';
import DiffPanel from './components/DiffPanel';
import { useSimulationStore } from './store/useSimulationStore';

function App() {
  const { loadData } = useSimulationStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Financial Time-Travel Simulator</h1>
          <p className="text-sm text-gray-500">Replay history under different rules</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Simulation Mode</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Panel: Rules */}
          <div className="col-span-3 h-full min-w-[300px]">
            <RulesPanel />
          </div>

          {/* Center Panel: Timeline */}
          <div className="col-span-6 h-full min-w-[400px]">
            <TimelinePanel />
          </div>

          {/* Right Panel: Diff */}
          <div className="col-span-3 h-full min-w-[300px]">
            <DiffPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
