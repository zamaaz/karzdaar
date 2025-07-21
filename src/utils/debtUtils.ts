import { Debt, DebtType } from '@/src/types';

/**
 * Creates a new debt object with default values
 */
export const createDebt = (
  name: string,
  amount: number,
  note: string,
  type: DebtType,
  dueDate?: Date
): Omit<Debt, 'id'> => {
  const now = new Date();
  
  return {
    name,
    amount,
    originalAmount: amount,
    note,
    date: now,
    dueDate,
    type,
    status: 'pending',
    payments: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Generates a simple ID for debts (in production, use UUID or database-generated IDs)
 */
export const generateDebtId = (): string => {
  return `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formats currency amount for display in INR
 */
export const formatCurrency = (amount: number): string => {
  // Handle edge cases more strictly
  if (amount === null || amount === undefined || typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  
  try {
    // Convert from paise to rupees and format without decimals
    const rupees = Math.round(Number(amount) / 100);
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rupees);
    
    // Ensure we always return a string
    return String(formattedAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '₹0';
  }
};

/**
 * Checks if a debt is overdue
 */
export const isDebtOverdue = (debt: Debt): boolean => {
  if (!debt.dueDate || debt.status === 'paid') {
    return false;
  }
  
  return new Date() > debt.dueDate;
};

/**
 * Calculates debt summary from an array of debts
 */
export const calculateDebtSummary = (debts: Debt[]) => {
  return debts.reduce(
    (summary, debt) => {
      if (debt.type === 'gave') {
        // For "gave" debts, calculate remaining amount after payments
        const totalPaid = (debt.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = Math.max(0, debt.originalAmount - totalPaid);
        
        summary.totalGave += debt.originalAmount; // Total ever lent
        if (remainingAmount > 0) {
          summary.totalPendingGave += remainingAmount; // Amount still owed to you
        }
      } else if (debt.type === 'got') {
        // For "got" debts, use the full amount
        summary.totalGot += debt.amount;
        if (debt.status === 'paid') {
          // "got" entries are always paid (you received the money)
          // But they count toward what you owe them back
          summary.totalPendingGot += debt.amount;
        }
      }
      
      if (isDebtOverdue(debt)) {
        summary.overdueCount += 1;
      }
      
      return summary;
    },
    {
      totalGave: 0,
      totalGot: 0,
      totalPendingGave: 0,
      totalPendingGot: 0,
      overdueCount: 0,
    }
  );
};

/**
 * Groups debts by customer name and calculates summary for each customer
 * Filters out placeholder customer entries (zero amount, paid status)
 * Now properly calculates balance based on pending debts only
 */
export const groupDebtsByCustomer = (debts: Debt[]) => {
  const customerMap = new Map<string, {
    name: string;
    debts: Debt[];
    totalBalance: number;
    latestTransaction: Debt;
  }>();

  // Filter out placeholder customer entries but keep them for determining if customer exists
  const realDebts = debts.filter(debt => !(debt.amount === 0 && debt.status === 'paid' && debt.note === 'Customer created - no transactions yet'));
  const allCustomerNames = [...new Set(debts.map(debt => debt.name))];

  // Process real transactions
  realDebts.forEach(debt => {
    const existing = customerMap.get(debt.name);
    
    if (existing) {
      existing.debts.push(debt);
      
      // Update latest transaction if this debt is more recent
      if (debt.date > existing.latestTransaction.date) {
        existing.latestTransaction = debt;
      }
    } else {
      customerMap.set(debt.name, {
        name: debt.name,
        debts: [debt],
        totalBalance: 0, // Will be calculated below
        latestTransaction: debt,
      });
    }
  });

  // Calculate proper balance for each customer
  customerMap.forEach((customer, customerName) => {
    let balance = 0;
    
    // Calculate total payments made through "got" entries that were applied to existing debts
    let totalGotPaymentsApplied = 0;
    customer.debts.forEach(debt => {
      if (debt.type === 'gave') {
        const totalPaid = (debt.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        totalGotPaymentsApplied += totalPaid;
      }
    });
    
    // Calculate total "got" entries
    let totalGotEntries = 0;
    customer.debts.forEach(debt => {
      if (debt.type === 'got') {
        totalGotEntries += debt.amount;
      }
    });
    
    // Calculate balance
    customer.debts.forEach(debt => {
      if (debt.type === 'gave') {
        // Calculate remaining amount: original amount minus total payments
        const totalPaid = (debt.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = Math.max(0, debt.originalAmount - totalPaid);
        balance += remainingAmount; // They owe you
      }
    });
    
    // Only count "got" entries that represent actual overpayments (not already accounted for in payments)
    const overpaymentAmount = Math.max(0, totalGotEntries - totalGotPaymentsApplied);
    balance -= overpaymentAmount; // You owe them for overpayments
    
    customer.totalBalance = balance;
  });

  // Add customers who only have placeholder entries (new customers with no transactions)
  allCustomerNames.forEach(customerName => {
    if (!customerMap.has(customerName)) {
      // This customer only has placeholder entries, create an empty customer entry
      const placeholderDebt = debts.find(debt => 
        debt.name === customerName && 
        debt.amount === 0 && 
        debt.status === 'paid' && 
        debt.note === 'Customer created - no transactions yet'
      );
      
      if (placeholderDebt) {
        customerMap.set(customerName, {
          name: customerName,
          debts: [],
          totalBalance: 0,
          latestTransaction: placeholderDebt,
        });
      }
    }
  });

  // Convert to array and sort by latest transaction date (most recent first)
  return Array.from(customerMap.values()).sort(
    (a, b) => b.latestTransaction.date.getTime() - a.latestTransaction.date.getTime()
  );
};

/**
 * Gets the latest debt entry for a customer
 */
export const getLatestDebtForCustomer = (customerName: string, debts: Debt[]): Debt | null => {
  const customerDebts = debts.filter(debt => debt.name === customerName);
  if (customerDebts.length === 0) return null;
  
  return customerDebts.reduce((latest, current) => 
    current.date > latest.date ? current : latest
  );
};
