import React from 'react';
import { useSimulationStore } from '../store/useSimulationStore';

const RulesPanel: React.FC = () => {
  const { rules, updateRules } = useSimulationStore();

  const handleExpenseToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRules({
      expenseApproval: { ...rules.expenseApproval, enabled: e.target.checked }
    });
  };

  const handleExpenseThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRules({
      expenseApproval: { ...rules.expenseApproval, threshold: Number(e.target.value) }
    });
  };

  const handleExpenseDelay = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRules({
      expenseApproval: { ...rules.expenseApproval, delayDays: Number(e.target.value) }
    });
  };

  const handlePaymentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRules({
      paymentTiming: { ...rules.paymentTiming, enabled: e.target.checked }
    });
  };

  const handlePaymentShift = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateRules({
      paymentTiming: { ...rules.paymentTiming, shiftDays: Number(e.target.value) }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-8 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900">Policy Rules</h2>
      <p className="text-sm text-gray-500 -mt-6">Adjust parameters to replay history.</p>

      {/* Rule A: Expense Approval */}
      <div className={`p-4 rounded-lg border transition-colors ${rules.expenseApproval.enabled ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Expense Approval</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={rules.expenseApproval.enabled} 
              onChange={handleExpenseToggle} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className={`space-y-4 transition-opacity ${rules.expenseApproval.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Threshold: ${rules.expenseApproval.threshold.toLocaleString()}
            </label>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="100" 
              value={rules.expenseApproval.threshold} 
              onChange={handleExpenseThreshold}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$10k</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay: {rules.expenseApproval.delayDays} days
            </label>
            <input 
              type="range" 
              min="1" 
              max="60" 
              step="1" 
              value={rules.expenseApproval.delayDays} 
              onChange={handleExpenseDelay}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1d</span>
              <span>60d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rule B: Payment Timing */}
      <div className={`p-4 rounded-lg border transition-colors ${rules.paymentTiming.enabled ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Payment Timing</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={rules.paymentTiming.enabled} 
              onChange={handlePaymentToggle} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className={`space-y-4 transition-opacity ${rules.paymentTiming.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift: {rules.paymentTiming.shiftDays > 0 ? `+${rules.paymentTiming.shiftDays}` : rules.paymentTiming.shiftDays} days
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {rules.paymentTiming.shiftDays < 0 ? 'Paying LATER (Cash retained longer)' : 'Paying SOONER (Cash leaves earlier)'}
            </p>
            <input 
              type="range" 
              min="-30" 
              max="30" 
              step="1" 
              value={rules.paymentTiming.shiftDays} 
              onChange={handlePaymentShift}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Later (-30d)</span>
              <span>Sooner (+30d)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesPanel;
