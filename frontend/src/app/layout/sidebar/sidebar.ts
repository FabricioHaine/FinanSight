import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { BrandLogo } from '../../shared/components/brand-logo/brand-logo';
import { SessionService } from '../../core/services/session.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

const COLLAPSED_KEY = 'finansight.sidebar.collapsed';

/**
 * Menu lateral do FinanSight. Fixo no desktop, recolhivel e vira drawer
 * no mobile.
 */
@Component({
  selector: 'fs-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, BrandLogo, TooltipModule],
  template: `
    <div class="fs-sidebar" [class.fs-sidebar--collapsed]="collapsed()">
      <div class="fs-sidebar__brand">
        <a routerLink="/dashboard" class="fs-sidebar__brand-link" aria-label="Ir para o início">
          <fs-brand-logo [compact]="collapsed()" />
        </a>
        @if (!collapsed()) {
          <button
            type="button"
            class="fs-sidebar__toggle"
            (click)="toggle()"
            [attr.aria-label]="'Recolher menu'"
            [attr.aria-expanded]="!collapsed()"
          >
            <i class="pi pi-angle-left" aria-hidden="true"></i>
          </button>
        }
      </div>

      <nav class="fs-sidebar__nav" aria-label="Navegação principal">
        <ul class="fs-sidebar__list">
          @for (item of items; track item.route) {
            <li>
              <a
                class="fs-sidebar__link"
                [routerLink]="item.route"
                routerLinkActive="fs-sidebar__link--active"
                [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                [attr.title]="collapsed() ? item.label : null"
              >
                <i class="pi {{ item.icon }}" aria-hidden="true"></i>
                @if (!collapsed()) {
                  <span class="fs-sidebar__label">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="fs-sidebar__footer">
        @if (collapsed()) {
          <button
            type="button"
            class="fs-sidebar__expand"
            (click)="toggle()"
            aria-label="Expandir menu"
          >
            <i class="pi pi-angle-right" aria-hidden="true"></i>
          </button>
        }

        <div class="fs-sidebar__user">
          <span class="fs-sidebar__avatar" aria-hidden="true">{{ initials() }}</span>
          @if (!collapsed()) {
            <span class="fs-sidebar__user-text">
              <span class="fs-sidebar__user-name">{{ session.user()?.name }}</span>
              <span class="fs-sidebar__user-mail">{{ session.user()?.email }}</span>
            </span>
            <button
              type="button"
              class="fs-sidebar__logout"
              (click)="logout()"
              aria-label="Sair da conta"
              pTooltip="Sair"
              tooltipPosition="right"
            >
              <i class="pi pi-sign-out" aria-hidden="true"></i>
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .fs-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--fs-bg-secondary);
      border-right: 1px solid var(--fs-border);
      width: var(--fs-sidebar-width);
      transition: width var(--fs-transition-base);
      overflow: hidden;
    }

    .fs-sidebar--collapsed {
      width: var(--fs-sidebar-width-collapsed);
    }

    .fs-sidebar__brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fs-space-2);
      height: var(--fs-topbar-height);
      padding: 0 var(--fs-space-4);
      border-bottom: 1px solid var(--fs-border);
      flex: 0 0 auto;
    }

    .fs-sidebar__brand-link {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      color: inherit;
    }

    .fs-sidebar__toggle,
    .fs-sidebar__expand {
      appearance: none;
      border: 1px solid transparent;
      background: transparent;
      color: var(--fs-text-muted);
      width: 28px;
      height: 28px;
      border-radius: var(--fs-radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background var(--fs-transition-fast), color var(--fs-transition-fast);
      flex: 0 0 auto;
    }

    .fs-sidebar__toggle:hover,
    .fs-sidebar__expand:hover {
      background: var(--fs-surface-elevated);
      color: var(--fs-text-primary);
    }

    .fs-sidebar__nav {
      flex: 1 1 auto;
      overflow-y: auto;
      padding: var(--fs-space-4) var(--fs-space-3);
    }

    .fs-sidebar__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .fs-sidebar__link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5625rem 0.75rem;
      border-radius: var(--fs-radius-sm);
      color: var(--fs-text-secondary);
      font-size: var(--fs-text-base);
      font-weight: 500;
      white-space: nowrap;
      position: relative;
      transition: background var(--fs-transition-fast), color var(--fs-transition-fast);
    }

    .fs-sidebar__link i {
      font-size: 0.9375rem;
      width: 1.125rem;
      text-align: center;
      flex: 0 0 auto;
      color: var(--fs-text-muted);
      transition: color var(--fs-transition-fast);
    }

    .fs-sidebar__link:hover {
      background: var(--fs-surface-elevated);
      color: var(--fs-text-primary);
    }

    .fs-sidebar__link:hover i {
      color: var(--fs-accent-soft);
    }

    .fs-sidebar__link--active {
      background: var(--fs-surface-selected);
      color: var(--fs-text-primary);
    }

    .fs-sidebar__link--active i {
      color: var(--fs-accent);
    }

    .fs-sidebar__link--active::before {
      content: '';
      position: absolute;
      left: -0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 18px;
      border-radius: 0 3px 3px 0;
      background: var(--fs-accent);
    }

    .fs-sidebar__footer {
      flex: 0 0 auto;
      border-top: 1px solid var(--fs-border);
      padding: var(--fs-space-3);
    }

    .fs-sidebar__expand {
      margin: 0 auto var(--fs-space-2);
    }

    .fs-sidebar__user {
      display: flex;
      align-items: center;
      gap: var(--fs-space-3);
      padding: var(--fs-space-2);
      border-radius: var(--fs-radius-md);
      min-width: 0;
    }

    .fs-sidebar__avatar {
      width: 34px;
      height: 34px;
      border-radius: var(--fs-radius-sm);
      background: var(--fs-surface-selected);
      border: 1px solid var(--fs-border);
      color: var(--fs-accent-light);
      font-size: var(--fs-text-sm);
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }

    .fs-sidebar__user-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1 1 auto;
    }

    .fs-sidebar__user-name {
      font-size: var(--fs-text-sm);
      font-weight: 600;
      color: var(--fs-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fs-sidebar__user-mail {
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fs-sidebar__logout {
      appearance: none;
      border: none;
      background: transparent;
      color: var(--fs-text-muted);
      width: 30px;
      height: 30px;
      border-radius: var(--fs-radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      transition: background var(--fs-transition-fast), color var(--fs-transition-fast);
    }

    .fs-sidebar__logout:hover {
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
    }

    .fs-sidebar--collapsed .fs-sidebar__brand {
      justify-content: center;
      padding: 0;
    }

    .fs-sidebar--collapsed .fs-sidebar__nav {
      padding-left: var(--fs-space-2);
      padding-right: var(--fs-space-2);
    }

    .fs-sidebar--collapsed .fs-sidebar__link {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
    }

    .fs-sidebar--collapsed .fs-sidebar__link--active::before {
      left: -0.5rem;
    }

    .fs-sidebar--collapsed .fs-sidebar__user {
      justify-content: center;
    }
  `,
})
export class Sidebar {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly collapsed = signal(this.readCollapsed());

  readonly items: NavItem[] = [
    { label: 'Início', icon: 'pi-home', route: '/dashboard', exact: true },
    { label: 'Transações', icon: 'pi-wallet', route: '/transactions' },
    { label: 'Categorias', icon: 'pi-tags', route: '/categories' },
    { label: 'Orçamentos', icon: 'pi-chart-pie', route: '/budgets' },
    { label: 'Metas financeiras', icon: 'pi-flag', route: '/goals' },
    { label: 'Relatórios', icon: 'pi-chart-line', route: '/reports' },
    { label: 'Configurações', icon: 'pi-cog', route: '/settings' },
  ];

  readonly initials = computed(() => {
    const name = this.session.user()?.name?.trim() ?? '';
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
  });

  toggle(): void {
    this.collapsed.update((value) => !value);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(this.collapsed()));
    } catch {
      /* armazenamento indisponivel: mantem apenas em memoria */
    }
  }

  logout(): void {
    this.session.logout();
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
