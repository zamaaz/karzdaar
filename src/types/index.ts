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

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  Modal: { title: string };
  NotFound: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Profile: undefined;
};
