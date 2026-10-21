export type TransactionType = 'RECEITA' | 'DESPESA';
export type CategoryType = 'RECEITA' | 'DESPESA';
export type GoalStatus = 'ATIVA' | 'CONCLUÍDA' | 'CANCELADA';
export type BudgetStatus = 'EM_DIA' | 'ATENCAO' | 'EXCEDIDO';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  currency: string;
  monthlyIncome: number | null;
  savingsGoal: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name: string;
  monthlyIncome: number | null;
  savingsGoal: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  description: string | null;
  active: boolean;
  transactionCount: number;
}

export interface CategoryPayload {
  name: string;
  type: CategoryType;
  description?: string | null;
  active?: boolean;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface TransactionPayload {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: number;
  date: string;
  notes?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TransactionQuery {
  search?: string | null;
  type?: TransactionType | null;
  categoryId?: number | null;
  from?: string | null;
  to?: string | null;
  sortBy?: string | null;
  direction?: 'asc' | 'desc' | null;
  page?: number;
  size?: number;
}

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  status: BudgetStatus;
  period: string;
}

export interface BudgetPayload {
  categoryId: number;
  limitAmount: number;
  period: string;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  accumulatedAmount: number;
  remainingAmount: number;
  percentComplete: number;
  status: GoalStatus;
  overdue: boolean;
  startDate: string | null;
  deadline: string | null;
  description: string | null;
  createdAt: string;
}

export interface GoalPayload {
  name: string;
  targetAmount: number;
  startDate?: string | null;
  deadline?: string | null;
  description?: string | null;
}

export interface Contribution {
  id: number;
  goalId: number;
  goalName: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface ContributionPayload {
  amount: number;
  date?: string | null;
  note?: string | null;
}

export interface Summary {
  balance: number;
  revenues: number;
  expenses: number;
  savings: number;
  balanceVariation: number | null;
  revenuesVariation: number | null;
  expensesVariation: number | null;
  savingsVariation: number | null;
  comparisonAvailable: boolean;
}

export interface CashflowPoint {
  label: string;
  reference: string;
  revenues: number;
  expenses: number;
  balance: number;
}

export interface CategorySlice {
  categoryId: number;
  categoryName: string;
  amount: number;
  percent: number;
}

export interface PeriodComparison {
  currentRevenues: number;
  currentExpenses: number;
  currentBalance: number;
  previousRevenues: number;
  previousExpenses: number;
  previousBalance: number;
  revenuesVariation: number | null;
  expensesVariation: number | null;
  balanceVariation: number | null;
}

export interface DashboardData {
  summary: Summary;
  cashflow: CashflowPoint[];
  categoryDistribution: CategorySlice[];
  recentTransactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  from: string;
  to: string;
}

export interface Report {
  summary: Summary;
  comparison: PeriodComparison;
  monthlyEvolution: CashflowPoint[];
  categoryDistribution: CategorySlice[];
  averageMonthlyExpenses: number;
  averageMonthlyRevenues: number;
  from: string;
  to: string;
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  fields?: Record<string, string>;
}
