// Common types used throughout the app

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Debt Management Types
export type DebtType = 'gave' | 'got'; // gave = money you gave (credit), got = money you got (debt from others)
export type DebtStatus = 'pending' | 'paid' | 'overdue' | 'partial';

export interface Payment {
  id: string;
  debtId: string;
  amount: number;        // Amount in paise (smallest INR unit)
  paymentDate: Date;
  description?: string;
  type: 'full' | 'partial';
  createdAt: Date;
}

export interface DebtEntry {
  id: string;
  type: DebtType;          // 'gave' (money you gave/lent) or 'got' (money you got/borrowed)
  amount: number;          // Amount in paise (smallest INR unit)
  originalAmount: number;  // Original amount before any payments
  note: string;            // Description/note about the debt
  date: Date;              // Date when the debt was created
  dueDate?: Date;          // Optional due date
  status?: DebtStatus;     // Optional status field for tracking payment state
  payments: Payment[];     // Array of payment history
  createdAt?: Date;        // Optional audit fields
  updatedAt?: Date;
}

export interface PersonDebt {
  name: string;            // Name of the person/entity
  entries: DebtEntry[];    // Array of debt entries for this person
}

// Legacy interface for backward compatibility
export interface Debt {
  id: string;
  name: string;          // Name of the person/entity
  amount: number;        // Amount in paise (smallest INR unit)
  originalAmount: number; // Original amount before any payments
  note: string;          // Description/note about the debt
  date: Date;            // Date when the debt was created
  dueDate?: Date;        // Optional due date
  type: DebtType;        // 'gave' (money you gave/lent) or 'got' (money you got/borrowed)
  status?: DebtStatus;   // Optional status field for tracking payment state
  payments: Payment[];   // Array of payment history
  createdAt?: Date;      // Optional audit fields
  updatedAt?: Date;
}

// Legacy interfaces (keeping for backward compatibility)
export interface DebtSummary {
  totalGave: number;     // Total money you gave (credits)
  totalGot: number;      // Total money you got (borrowed)
  totalPendingGave: number;
  totalPendingGot: number;
  overdueCount: number;
}

// Customer Management Types
export interface Customer {
  id: string;
  name: string;          // Customer name (case-insensitive unique)
  createdAt: Date;
  updatedAt: Date;
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  Modal: { title: string };
  NotFound: undefined;
  'add-debt': { type?: 'gave' | 'got'; editId?: string };
  'add-customer': undefined;
  'customer/[name]': { name: string };
  'debt/[id]': { id: string };
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Profile: undefined;
};
