import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Entrar - FinanSight',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Criar conta - FinanSight',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Início - FinanSight',
        data: { title: 'Visão geral', eyebrow: 'Início' },
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transactions',
        title: 'Transações - FinanSight',
        data: { title: 'Transações', eyebrow: 'Gestao' },
        loadComponent: () =>
          import('./features/transactions/transactions').then((m) => m.Transactions),
      },
      {
        path: 'categories',
        title: 'Categorias - FinanSight',
        data: { title: 'Categorias', eyebrow: 'Gestao' },
        loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'budgets',
        title: 'Orçamentos - FinanSight',
        data: { title: 'Orçamentos', eyebrow: 'Planejamento' },
        loadComponent: () => import('./features/budgets/budgets').then((m) => m.Budgets),
      },
      {
        path: 'goals',
        title: 'Metas financeiras - FinanSight',
        data: { title: 'Metas financeiras', eyebrow: 'Planejamento' },
        loadComponent: () => import('./features/goals/goals').then((m) => m.Goals),
      },
      {
        path: 'reports',
        title: 'Relatórios - FinanSight',
        data: { title: 'Relatórios', eyebrow: 'Análise' },
        loadComponent: () => import('./features/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'settings',
        title: 'Configurações - FinanSight',
        data: { title: 'Configurações', eyebrow: 'Conta' },
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
