import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { FinanceApi } from './finance-api';
import {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UserProfile,
} from '../models/finance.models';

const TOKEN_KEY = 'finansight.token';
const USER_KEY = 'finansight.user';

/**
 * Sessão do usuário. O token JWT e o único credencial guardado no navegador;
 * a validação de permissão acontece sempre no back-end.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(FinanceApi);
  private readonly router = inject(Router);

  private readonly userSignal = signal<UserProfile | null>(this.readStoredUser());
  private readonly tokenSignal = signal<string | null>(this.readToken());

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly firstName = computed(() => {
    const name = this.userSignal()?.name?.trim();
    return name ? name.split(' ')[0] : '';
  });

  get token(): string | null {
    return this.tokenSignal();
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.api.login(payload).pipe(tap((response) => this.persist(response)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.api.register(payload).pipe(tap((response) => this.persist(response)));
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.api.updateProfile(payload).pipe(tap((user) => this.userSignal.set(user)));
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.api.changePassword(payload);
  }

  /** Revalida a sessão guardado no navegador ao iniciar a aplicação. */
  restore(): Observable<UserProfile | null> {
    if (!this.tokenSignal()) {
      return of(null);
    }
    return this.api.me().pipe(
      tap((user) => this.userSignal.set(user)),
      catchError(() => {
        this.clear();
        return of(null);
      }),
    );
  }

  logout(): void {
    this.clear();
    void this.router.navigate(['/login']);
  }

  private persist(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
  }

  private clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private readStoredUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }
}
