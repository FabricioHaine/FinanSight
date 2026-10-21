import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import {
  AuthResponse,
  Budget,
  BudgetPayload,
  Category,
  CategoryPayload,
  ChangePasswordPayload,
  Contribution,
  ContributionPayload,
  DashboardData,
  Goal,
  GoalPayload,
  LoginPayload,
  PageResponse,
  RegisterPayload,
  Report,
  Transaction,
  TransactionPayload,
  TransactionQuery,
  UpdateProfilePayload,
  UserProfile,
} from '../models/finance.models';
import { API_BASE } from '../config/api.config';

/**
 * Camada de acesso a API. O back-end e a fonte de verdade: nenhuma regra
 * financeira e recalculada no front-end.
 */
@Injectable({ providedIn: 'root' })
export class FinanceApi {
  private readonly http = inject(HttpClient);

  // ------------------------------------------------------------------ Auth
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, payload);
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API_BASE}/auth/me`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${API_BASE}/auth/profile`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.put<void>(`${API_BASE}/auth/password`, payload);
  }

  // ----------------------------------------------------------- Categorias
  listCategories(onlyActive = false): Observable<Category[]> {
    const params = new HttpParams().set('onlyActive', String(onlyActive));
    return this.http.get<Category[]>(`${API_BASE}/categories`, { params });
  }

  createCategory(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(`${API_BASE}/categories`, payload);
  }

  updateCategory(id: number, payload: CategoryPayload): Observable<Category> {
    return this.http.put<Category>(`${API_BASE}/categories/${id}`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/categories/${id}`);
  }

  // ---------------------------------------------------------- Transações
  listTransactions(query: TransactionQuery): Observable<PageResponse<Transaction>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 0))
      .set('size', String(query.size ?? 10))
      .set('sortBy', query.sortBy ?? 'date')
      .set('direction', query.direction ?? 'desc');

    if (query.search) params = params.set('search', query.search);
    if (query.type) params = params.set('type', query.type);
    if (query.categoryId) params = params.set('categoryId', String(query.categoryId));
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);

    return this.http.get<PageResponse<Transaction>>(`${API_BASE}/transactions`, { params });
  }

  createTransaction(payload: TransactionPayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${API_BASE}/transactions`, payload);
  }

  updateTransaction(id: number, payload: TransactionPayload): Observable<Transaction> {
    return this.http.put<Transaction>(`${API_BASE}/transactions/${id}`, payload);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/transactions/${id}`);
  }

  // ------------------------------------------------------------ Orçamentos
  listBudgets(from?: string | null, to?: string | null): Observable<Budget[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<Budget[]>(`${API_BASE}/budgets`, { params });
  }

  createBudget(payload: BudgetPayload): Observable<Budget> {
    return this.http.post<Budget>(`${API_BASE}/budgets`, payload);
  }

  updateBudget(id: number, payload: BudgetPayload): Observable<Budget> {
    return this.http.put<Budget>(`${API_BASE}/budgets/${id}`, payload);
  }

  deleteBudget(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/budgets/${id}`);
  }

  // ----------------------------------------------------------------- Metas
  listGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${API_BASE}/goals`);
  }

  createGoal(payload: GoalPayload): Observable<Goal> {
    return this.http.post<Goal>(`${API_BASE}/goals`, payload);
  }

  updateGoal(id: number, payload: GoalPayload): Observable<Goal> {
    return this.http.put<Goal>(`${API_BASE}/goals/${id}`, payload);
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/goals/${id}`);
  }

  listContributions(goalId: number): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`${API_BASE}/goals/${goalId}/contributions`);
  }

  addContribution(goalId: number, payload: ContributionPayload): Observable<Contribution> {
    return this.http.post<Contribution>(`${API_BASE}/goals/${goalId}/contributions`, payload);
  }

  removeContribution(goalId: number, contributionId: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/goals/${goalId}/contributions/${contributionId}`);
  }

  // --------------------------------------------------- Dashboard e relatórios
  dashboard(from?: string | null, to?: string | null): Observable<DashboardData> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<DashboardData>(`${API_BASE}/dashboard`, { params });
  }

  report(from?: string | null, to?: string | null, categoryId?: number | null): Observable<Report> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (categoryId) params = params.set('categoryId', String(categoryId));
    return this.http.get<Report>(`${API_BASE}/reports`, { params });
  }

  exportCsvUrl(from: string, to: string, categoryId?: number | null): string {
    let params = new HttpParams().set('from', from).set('to', to);
    if (categoryId) params = params.set('categoryId', String(categoryId));
    return `${API_BASE}/reports/export?${params.toString()}`;
  }

  /** Exporta as transações do período. O download e feito com o token JWT. */
  exportCsv(from: string, to: string, categoryId?: number | null): Observable<Blob> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (categoryId) params = params.set('categoryId', String(categoryId));
    return this.http.get(`${API_BASE}/reports/export`, {
      params,
      responseType: 'blob',
    });
  }

  /** Converte erros HTTP em mensagens legiveis para a interface. */
  static describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { message?: string; fields?: Record<string, string> } | null;
      if (body?.message) return body.message;
      if (error.status === 0) return 'Não foi possível conectar a API. Verifique se o back-end esta em execução.';
      if (error.status === 401) return 'Sua sessão expirou. Entre novamente.';
      if (error.status === 403) return 'Você não tem permissão para esta operação.';
      if (error.status === 404) return 'Registro não encontrado.';
      if (error.status >= 500) return 'Erro interno do servidor. Tente novamente em instantes.';
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
