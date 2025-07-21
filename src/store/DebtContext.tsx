import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Debt, DebtType, Payment } from '@/src/types';

// AsyncStorage key for debts
const DEBTS_STORAGE_KEY = '@karzdaar_debts';

// Action types for the debt reducer
type DebtAction =
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: { id: string; updates: Partial<Debt> } }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'SET_DEBTS'; payload: Debt[] }
  | { type: 'MARK_AS_PAID'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: { debtId: string; payment: Omit<Payment, 'id' | 'debtId'> } }
  | { type: 'CLEAR_ALL_DEBTS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RENAME_CUSTOMER'; payload: { oldName: string; newName: string } }
  | { type: 'DELETE_CUSTOMER'; payload: string };

// State interface
interface DebtState {
  debts: Debt[];
  loading: boolean;
  error: string | null;
}

// Context interface
interface DebtContextType {
  state: DebtState;
  // Actions
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  addCustomer: (customerName: string) => Promise<void>;
  addPayment: (customerName: string, amount: number, note?: string) => Promise<void>;
  processPaymentAgainstDebts: (customerName: string, amount: number) => Promise<void>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  addPartialPayment: (debtId: string, amount: number, note?: string) => Promise<void>;
  clearAllDebts: () => Promise<void>;
  loadDebts: () => Promise<void>;
  // Getters
  getDebtById: (id: string) => Debt | undefined;
  getDebtsByType: (type: DebtType) => Debt[];
  getDebtsByPerson: (name: string) => Debt[];
  getDebtsGroupedByPerson: () => { [personName: string]: Debt[] };
  getUniquePersonNames: () => string[];
  getTotalAmount: (type: DebtType) => number;
  getPendingDebts: () => Debt[];
  getOverdueDebts: () => Debt[];
  customerExists: (customerName: string) => boolean;
  cleanupEntryNumbers: () => Promise<void>;
  getCustomerBalance: (customerName: string) => number;
  // Customer management
  renameCustomer: (oldName: string, newName: string) => Promise<void>;
  deleteCustomer: (customerName: string) => Promise<void>;
}

// Initial state
const initialState: DebtState = {
  debts: [],
  loading: false,
  error: null,
};

// Reducer function
const debtReducer = (state: DebtState, action: DebtAction): DebtState => {
  switch (action.type) {
    case 'ADD_DEBT':
      // Check if a person with the same name already exists (case-insensitive)
      const existingPersonIndex = state.debts.findIndex(
        debt => debt.name.toLowerCase().trim() === action.payload.name.toLowerCase().trim()
      );
      
      if (existingPersonIndex !== -1) {
        // Person exists - create a new debt entry
        const newEntry = {
          ...action.payload,
          note: action.payload.note
        };
        
        return {
          ...state,
          debts: [...state.debts, newEntry],
          error: null,
        };
      } else {
        // Person doesn't exist, create new debt entry
        const newEntry = {
          ...action.payload,
          note: action.payload.note
        };
        
        return {
          ...state,
          debts: [...state.debts, newEntry],
          error: null,
        };
      }
    
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map(debt =>
          debt.id === action.payload.id
            ? { ...debt, ...action.payload.updates, updatedAt: new Date() }
            : debt
        ),
        error: null,
      };
    
    case 'DELETE_DEBT':
      return {
        ...state,
        debts: state.debts.filter(debt => debt.id !== action.payload),
        error: null,
      };
    
    case 'SET_DEBTS':
      return {
        ...state,
        debts: action.payload,
        loading: false,
        error: null,
      };
    
    case 'MARK_AS_PAID':
      return {
        ...state,
        debts: state.debts.map(debt => {
          if (debt.id === action.payload) {
            const fullPayment: Payment = {
              id: Date.now().toString(),
              debtId: debt.id,
              amount: debt.amount,
              paymentDate: new Date(),
              description: 'Marked as fully paid',
              type: 'full',
              createdAt: new Date(),
            };
            return { 
              ...debt, 
              amount: 0,
              status: 'paid',
              payments: [...(debt.payments || []), fullPayment],
              updatedAt: new Date() 
            };
          }
          return debt;
        }),
        error: null,
      };

    case 'ADD_PAYMENT':
      return {
        ...state,
        debts: state.debts.map(debt => {
          if (debt.id === action.payload.debtId) {
            const payment: Payment = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              debtId: debt.id,
              ...action.payload.payment,
            };
            
            const newAmount = Math.max(0, debt.amount - payment.amount);
            const newStatus = newAmount === 0 ? 'paid' : 'partial';
            
            return {
              ...debt,
              amount: newAmount,
              status: newStatus,
              payments: [...(debt.payments || []), payment],
              updatedAt: new Date(),
            };
          }
          return debt;
        }),
        error: null,
      };
    
    case 'CLEAR_ALL_DEBTS':
      return {
        ...state,
        debts: [],
        error: null,
      };
    
    case 'RENAME_CUSTOMER':
      return {
        ...state,
        debts: state.debts.map(debt => 
          debt.name === action.payload.oldName 
            ? { ...debt, name: action.payload.newName }
            : debt
        ),
        error: null,
      };
    
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        debts: state.debts.filter(debt => debt.name !== action.payload),
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
};

// Create the context
const DebtContext = createContext<DebtContextType | undefined>(undefined);

// Provider component
interface DebtProviderProps {
  children: ReactNode;
}

export const DebtProvider: React.FC<DebtProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(debtReducer, initialState);

  // Helper function to generate IDs
  const generateId = (): string => {
    return `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to save debts to AsyncStorage
  const saveDebtsToStorage = async (debts: Debt[]) => {
    try {
      const jsonValue = JSON.stringify(debts);
      await AsyncStorage.setItem(DEBTS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving debts to storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save debts' });
    }
  };

  // Helper function to load debts from AsyncStorage
  const loadDebtsFromStorage = async (): Promise<Debt[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(DEBTS_STORAGE_KEY);
      if (jsonValue != null) {
        const debts = JSON.parse(jsonValue);
        // Convert date strings back to Date objects and ensure new structure
        return debts.map((debt: any) => ({
          ...debt,
          date: debt.date ? new Date(debt.date) : new Date(),
          createdAt: debt.createdAt ? new Date(debt.createdAt) : new Date(),
          updatedAt: debt.updatedAt ? new Date(debt.updatedAt) : new Date(),
          originalAmount: debt.originalAmount || debt.amount || 0, // Migrate old debts
          amount: debt.amount || 0, // Ensure amount is always a number
          name: debt.name || 'Unknown Customer', // Ensure name is always a string
          note: debt.note || 'No description', // Ensure note is always a string
          type: debt.type || 'gave', // Ensure type is always valid
          payments: debt.payments?.map((payment: any) => ({
            ...payment,
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
            createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
          })) || [], // Ensure payments array exists
          ...(debt.dueDate && { dueDate: new Date(debt.dueDate) })
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading debts from storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load debts' });
      return [];
    }
  };

  // Load debts function
  const loadDebts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const debts = await loadDebtsFromStorage();
      dispatch({ type: 'SET_DEBTS', payload: debts });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load debts' });
    }
  }, []);

  // Load debts on component mount
  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  // Save debts to storage whenever debts change (except during initial load)
  useEffect(() => {
    if (!state.loading && state.debts.length >= 0) {
      saveDebtsToStorage(state.debts);
    }
  }, [state.debts, state.loading]);

  // Action creators
  const addDebt = async (debtData: Omit<Debt, 'id'>) => {
    try {
      const debt: Debt = {
        ...debtData,
        id: generateId(),
        name: debtData.name || 'Unknown Customer',
        amount: debtData.amount || 0,
        originalAmount: debtData.originalAmount || debtData.amount || 0,
        note: debtData.note || 'No description',
        date: debtData.date || new Date(),
        type: debtData.type || 'gave',
        status: debtData.status || 'pending',
        payments: debtData.payments || [],
        createdAt: debtData.createdAt || new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_DEBT', payload: debt });
    } catch (error) {
      console.error('Error adding debt:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add debt' });
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    try {
      dispatch({ type: 'UPDATE_DEBT', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating debt:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update debt' });
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      dispatch({ type: 'DELETE_DEBT', payload: id });
    } catch (error) {
      console.error('Error deleting debt:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete debt' });
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      dispatch({ type: 'MARK_AS_PAID', payload: id });
    } catch (error) {
      console.error('Error marking debt as paid:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark debt as paid' });
    }
  };

  const addPartialPayment = async (debtId: string, amount: number, note?: string) => {
    try {
      const payment = {
        amount,
        paymentDate: new Date(),
        description: note || `Partial payment - ₹${Math.round(amount / 100)}`,
        type: 'partial' as const,
        createdAt: new Date(),
      };
      
      dispatch({ type: 'ADD_PAYMENT', payload: { debtId, payment } });
    } catch (error) {
      console.error('Error adding partial payment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add partial payment' });
    }
  };

  const clearAllDebts = async () => {
    try {
      dispatch({ type: 'CLEAR_ALL_DEBTS' });
    } catch (error) {
      console.error('Error clearing debts:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear debts' });
    }
  };

  // Customer management methods
  const addCustomer = async (customerName: string): Promise<void> => {
    const trimmedName = customerName.trim();
    
    // Check if customer already exists
    if (customerExists(trimmedName)) {
      throw new Error('A customer with this name already exists');
    }
    
    // For now, we'll create a placeholder debt entry to establish the customer
    // This will be visible in the customer list but won't affect financial calculations
    const placeholderDebt: Omit<Debt, 'id'> = {
      name: trimmedName,
      amount: 0, // Zero amount placeholder
      originalAmount: 0,
      note: 'Customer created - no transactions yet',
      date: new Date(),
      type: 'got', // Default type, won't matter since amount is 0
      status: 'paid', // Mark as paid so it doesn't affect calculations
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Use the existing addDebt method to create the customer entry
    await addDebt(placeholderDebt);
  };

  const customerExists = (customerName: string): boolean => {
    const normalizedName = customerName.toLowerCase().trim();
    return state.debts.some(debt => 
      debt.name.toLowerCase().trim() === normalizedName
    );
  };

  const cleanupEntryNumbers = useCallback(async (): Promise<void> => {
    try {
      const updatedDebts = state.debts.map(debt => {
        // Remove [Entry #X] pattern from notes
        const cleanedNote = debt.note.replace(/\s*\[Entry #\d+\]\s*/g, '').trim();
        return {
          ...debt,
          note: cleanedNote || 'No description'
        };
      });
      
      dispatch({ type: 'SET_DEBTS', payload: updatedDebts });
      await AsyncStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(updatedDebts));
    } catch (error) {
      console.error('Error cleaning up entry numbers:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clean up entry numbers' });
    }
  }, [state.debts]);

  // Getter functions
  const getDebtById = (id: string): Debt | undefined => {
    return state.debts.find(debt => debt.id === id);
  };

  const getDebtsByType = (type: DebtType): Debt[] => {
    return state.debts.filter(debt => debt.type === type);
  };

  const getDebtsByPerson = (name: string): Debt[] => {
    return state.debts.filter(debt => 
      debt.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  // New function to get all debts grouped by person
  const getDebtsGroupedByPerson = (): { [personName: string]: Debt[] } => {
    const grouped: { [personName: string]: Debt[] } = {};
    
    state.debts.forEach(debt => {
      const normalizedName = debt.name.toLowerCase().trim();
      if (!grouped[normalizedName]) {
        grouped[normalizedName] = [];
      }
      grouped[normalizedName].push(debt);
    });
    
    return grouped;
  };

  // Get unique person names
  const getUniquePersonNames = (): string[] => {
    const names = new Set<string>();
    state.debts.forEach(debt => {
      names.add(debt.name);
    });
    return Array.from(names).sort();
  };

  const getTotalAmount = (type: DebtType): number => {
    return state.debts
      .filter(debt => debt.type === type)
      .reduce((total, debt) => {
        if (debt.type === 'gave') {
          // For "gave" debts, calculate remaining amount after payments
          const totalPaid = (debt.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
          const remainingAmount = Math.max(0, debt.originalAmount - totalPaid);
          return total + remainingAmount;
        } else {
          // For "got" debts, only count if still pending (but we changed "got" to be always paid)
          // Actually, "got" debts represent money you owe them back
          return total + debt.amount;
        }
      }, 0);
  };

  const getPendingDebts = (): Debt[] => {
    return state.debts.filter(debt => debt.status === 'pending');
  };

  const getOverdueDebts = (): Debt[] => {
    const now = new Date();
    return state.debts.filter(debt => 
      debt.dueDate && 
      debt.status === 'pending' && 
      debt.dueDate < now
    );
  };

  // New function to add payment against existing debts
  const addPayment = async (customerName: string, amount: number, note?: string): Promise<void> => {
    try {
      const customerDebts = getDebtsByPerson(customerName)
        .filter(debt => debt.type === 'gave' && debt.status === 'pending')
        .sort((a, b) => a.date.getTime() - b.date.getTime()); // Oldest first
    
      let remainingPayment = amount;
      
      for (const debt of customerDebts) {
        if (remainingPayment <= 0) break;
        
        const paymentAmount = Math.min(remainingPayment, debt.amount);
        remainingPayment -= paymentAmount;
        
        const payment: Payment = {
          id: generateId(),
          debtId: debt.id,
          amount: paymentAmount,
          paymentDate: new Date(),
          description: note || 'Payment received',
          type: paymentAmount >= debt.amount ? 'full' : 'partial',
          createdAt: new Date(),
        };
        
        const newAmount = debt.amount - paymentAmount;
        const newStatus = newAmount === 0 ? 'paid' : 'pending';
        
        await updateDebt(debt.id, {
          amount: newAmount,
          status: newStatus,
          payments: [...debt.payments, payment],
          updatedAt: new Date(),
        });
      }
      
      // If there's remaining payment after paying all debts, it means they overpaid
      if (remainingPayment > 0) {
        // Create a "You Owe" debt for the overpayment
        const overpaymentDebt: Omit<Debt, 'id'> = {
          name: customerName,
          amount: remainingPayment,
          originalAmount: remainingPayment,
          note: note || 'Overpayment - You owe them',
          date: new Date(),
          type: 'got', // This represents money you need to return
          status: 'pending',
          payments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await addDebt(overpaymentDebt);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add payment' });
    }
  };

  // Internal function to process payment against existing debts without creating visible entries
  const processPaymentAgainstDebts = async (customerName: string, amount: number): Promise<void> => {
    try {
      const customerDebts = getDebtsByPerson(customerName)
        .filter(debt => debt.type === 'gave' && debt.status === 'pending')
        .sort((a, b) => a.date.getTime() - b.date.getTime()); // Oldest first
    
      let remainingPayment = amount;
      
      for (const debt of customerDebts) {
        if (remainingPayment <= 0) break;
        
        // Calculate how much of this debt can be paid
        const currentPaidAmount = (debt.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        const remainingDebtAmount = debt.originalAmount - currentPaidAmount;
        
        if (remainingDebtAmount <= 0) continue; // This debt is already fully paid
        
        const paymentAmount = Math.min(remainingPayment, remainingDebtAmount);
        remainingPayment -= paymentAmount;
        
        // Add payment record to the debt
        const payment: Payment = {
          id: generateId(),
          debtId: debt.id,
          amount: paymentAmount,
          paymentDate: new Date(),
          description: 'Payment received',
          type: paymentAmount >= remainingDebtAmount ? 'full' : 'partial',
          createdAt: new Date(),
        };
        
        const newTotalPaid = currentPaidAmount + paymentAmount;
        const newStatus = newTotalPaid >= debt.originalAmount ? 'paid' : 'pending';
        
        // IMPORTANT: Do NOT update the amount field - preserve original debt amount for display
        // Only update status and add payment record
        await updateDebt(debt.id, {
          status: newStatus,
          payments: [...(debt.payments || []), payment],
          updatedAt: new Date(),
        });
      }
      
      // Note: We don't create overpayment entries here anymore
      // The calling code should handle the overpayment scenario
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  // New function to get customer's current balance
  const getCustomerBalance = (customerName: string): number => {
    const customerDebts = getDebtsByPerson(customerName);
    
    let balance = 0;
    
    // Calculate total payments made through "got" entries that were applied to existing debts
    let totalGotPaymentsApplied = 0;
    customerDebts.forEach(debt => {
      if (debt.type === 'gave') {
        const totalPaid = (debt.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        totalGotPaymentsApplied += totalPaid;
      }
    });
    
    // Calculate total "got" entries
    let totalGotEntries = 0;
    customerDebts.forEach(debt => {
      if (debt.type === 'got') {
        totalGotEntries += debt.amount;
      }
    });
    
    // Calculate balance from "gave" debts
    customerDebts.forEach(debt => {
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
    
    return balance;
  };

  // Customer management methods
  const renameCustomer = async (oldName: string, newName: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if new name already exists
      if (customerExists(newName)) {
        throw new Error('A customer with this name already exists');
      }
      
      // Rename customer in all debts
      dispatch({ type: 'RENAME_CUSTOMER', payload: { oldName, newName } });
      
      // We'll need to save after dispatch updates the state
      // The useEffect hook will handle saving to storage
    } catch (error) {
      console.error('Error renaming customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename customer';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteCustomer = async (customerName: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Delete all debts for this customer
      dispatch({ type: 'DELETE_CUSTOMER', payload: customerName });
      
      // We'll need to save after dispatch updates the state
      // The useEffect hook will handle saving to storage
    } catch (error) {
      console.error('Error deleting customer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete customer' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const contextValue: DebtContextType = {
    state,
    addDebt,
    addCustomer,
    addPayment,
    processPaymentAgainstDebts,
    updateDebt,
    deleteDebt,
    markAsPaid,
    addPartialPayment,
    clearAllDebts,
    loadDebts,
    getDebtById,
    getDebtsByType,
    getDebtsByPerson,
    getDebtsGroupedByPerson,
    getUniquePersonNames,
    getTotalAmount,
    getPendingDebts,
    getOverdueDebts,
    customerExists,
    cleanupEntryNumbers,
    getCustomerBalance,
    renameCustomer,
    deleteCustomer,
  };

  return (
    <DebtContext.Provider value={contextValue}>
      {children}
    </DebtContext.Provider>
  );
};

// Custom hook to use the context
export const useDebtContext = (): DebtContextType => {
  const context = useContext(DebtContext);
  if (context === undefined) {
    throw new Error('useDebtContext must be used within a DebtProvider');
  }
  return context;
};
