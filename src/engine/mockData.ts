import { Transaction } from './types';

const generateData = (): Transaction[] => {
  const txns: Transaction[] = [];
  const today = new Date();
  // Start from 3 months ago
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 1);

  // Generate 100 transactions
  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate);
    // Random date within next 6 months
    date.setDate(date.getDate() + Math.floor(Math.random() * 180));
    
    const isExpense = Math.random() > 0.3; // 70% expenses
    const amount = isExpense 
      ? -Math.floor(Math.random() * 5000 + 100) // -100 to -5100
      : Math.floor(Math.random() * 20000 + 1000); // +1000 to +21000

    txns.push({
      id: `txn-${i}`,
      date: date.toISOString().split('T')[0],
      amount,
      description: isExpense ? `Vendor Payment ${i}` : `Client Invoice ${i}`,
      category: isExpense ? 'OpEx' : 'Revenue'
    });
  }
  return txns;
};

export const MOCK_TRANSACTIONS: Transaction[] = generateData();
