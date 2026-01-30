import React from 'react';
import { Rule } from '../sim/types';

interface RulePanelProps {
  rules: Rule[];
  onToggleRule: (id: string, enabled: boolean) => void;
  onUpdateParams: (id: string, params: any) => void;
}

export function RulePanel({ rules, onToggleRule, onUpdateParams }: RulePanelProps) {
  const expenseRule = rules.find(r => r.type === 'expenseApprovalThreshold');
  const paymentRule = rules.find(r => r.type === 'paymentTiming');

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Policy Controls</h2>
      
      {/* Expense Approval Rule */}
      {expenseRule && expenseRule.type === 'expenseApprovalThreshold' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-700">Expense Approval</label>
            <input 
              type="checkbox" 
              checked={expenseRule.enabled}
              onChange={(e) => onToggleRule(expenseRule.id, e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          
          <div className={`space-y-3 pl-2 border-l-2 ${expenseRule.enabled ? 'border-blue-500 opacity-100' : 'border-gray-200 opacity-50 pointer-events-none'}`}>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Expenses above</span>
                <span className="font-medium">${expenseRule.params.threshold}</span>
              </div>
              <input 
                type="range" 
                min="0" max="20000" step="500"
                value={expenseRule.params.threshold}
                onChange={(e) => onUpdateParams(expenseRule.id, { ...expenseRule.params, threshold: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Paid later by</span>
                <span className="font-medium">{expenseRule.params.delayDays} days</span>
              </div>
              <input 
                type="range" 
                min="1" max="60" step="1"
                value={expenseRule.params.delayDays}
                onChange={(e) => onUpdateParams(expenseRule.id, { ...expenseRule.params, delayDays: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Timing Rule */}
      {paymentRule && paymentRule.type === 'paymentTiming' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-700">Payment Timing</label>
            <input 
              type="checkbox" 
              checked={paymentRule.enabled}
              onChange={(e) => onToggleRule(paymentRule.id, e.target.checked)}
              className="h-5 w-5"
            />
          </div>

          <div className={`space-y-3 pl-2 border-l-2 ${paymentRule.enabled ? 'border-blue-500 opacity-100' : 'border-gray-200 opacity-50 pointer-events-none'}`}>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pay vendors</span>
                <span className="font-medium">
                  {paymentRule.params.shiftDays > 0 ? `${paymentRule.params.shiftDays} days sooner` : 
                   paymentRule.params.shiftDays < 0 ? `${Math.abs(paymentRule.params.shiftDays)} days later` : 'on time'}
                </span>
              </div>
              <input 
                type="range" 
                min="-30" max="30" step="1"
                value={paymentRule.params.shiftDays}
                onChange={(e) => onUpdateParams(paymentRule.id, { ...paymentRule.params, shiftDays: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
