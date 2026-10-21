import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  output,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

/**
 * Cabecalho da aplicação. Mantem apenas o essencial: contexto da página,
 * acesso rapido ao perfil e ações de conta.
 */
@Component({
  selector: 'fs-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="fs-topbar">
      <div class="fs-topbar__left">
        <button
          type="button"
          class="fs-topbar__menu"
          (click)="menuRequested.emit()"
          aria-label="Abrir menu de navegação"
        >
          <i class="pi pi-bars" aria-hidden="true"></i>
        </button>
        <div class="fs-topbar__context">
          <span class="fs-topbar__eyebrow">{{ eyebrow() }}</span>
          <h2 class="fs-topbar__title">{{ title() }}</h2>
        </div>
      </div>

      <div class="fs-topbar__right">
        <button
          type="button"
          class="fs-topbar__profile"
          (click)="toggleProfile($event)"
          aria-haspopup="true"
          [attr.aria-expanded]="profileOpen()"
        >
          <span class="fs-topbar__avatar" aria-hidden="true">{{ initials() }}</span>
          <span class="fs-topbar__profile-text">
            <span class="fs-topbar__profile-name">{{ session.user()?.name }}</span>
            <span class="fs-topbar__profile-mail">{{ session.user()?.email }}</span>
          </span>
          <i class="pi pi-angle-down fs-topbar__chevron" aria-hidden="true"></i>
        </button>

        <div class="fs-topbar__panel" [class.fs-topbar__panel--open]="profileOpen()">
          <div class="fs-topbar__panel-head">
            <span class="fs-topbar__panel-name">{{ session.user()?.name }}</span>
            <span class="fs-topbar__panel-mail">{{ session.user()?.email }}</span>
          </div>
          <a class="fs-topbar__panel-item" routerLink="/settings" (click)="closeProfile()">
            <i class="pi pi-cog" aria-hidden="true"></i>
            <span>Configurações</span>
          </a>
          <button type="button" class="fs-topbar__panel-item fs-topbar__panel-item--danger" (click)="logout()">
            <i class="pi pi-sign-out" aria-hidden="true"></i>
            <span>Sair da conta</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    .fs-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fs-space-4);
      height: var(--fs-topbar-height);
      padding: 0 var(--fs-space-5);
      border-bottom: 1px solid var(--fs-border);
      background: rgba(7, 17, 31, 0.86);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: var(--fs-z-header);
    }

    .fs-topbar__left {
      display: flex;
      align-items: center;
      gap: var(--fs-space-3);
      min-width: 0;
    }

    .fs-topbar__menu {
      display: none;
      appearance: none;
      border: 1px solid var(--fs-border);
      background: var(--fs-surface);
      color: var(--fs-text-secondary);
      width: 36px;
      height: 36px;
      border-radius: var(--fs-radius-sm);
      cursor: pointer;
    }

    .fs-topbar__context {
      min-width: 0;
    }

    .fs-topbar__eyebrow {
      display: block;
      font-size: var(--fs-text-xs);
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--fs-text-muted);
    }

    .fs-topbar__title {
      font-size: var(--fs-text-md);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fs-topbar__right {
      position: relative;
    }

    .fs-topbar__profile {
      display: flex;
      align-items: center;
      gap: var(--fs-space-3);
      appearance: none;
      border: 1px solid transparent;
      background: transparent;
      color: inherit;
      padding: 0.25rem 0.5rem 0.25rem 0.25rem;
      border-radius: var(--fs-radius-md);
      cursor: pointer;
      transition: background var(--fs-transition-fast), border-color var(--fs-transition-fast);
    }

    .fs-topbar__profile:hover {
      background: var(--fs-surface);
      border-color: var(--fs-border);
    }

    .fs-topbar__avatar {
      width: 32px;
      height: 32px;
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

    .fs-topbar__profile-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
    }

    .fs-topbar__profile-name {
      font-size: var(--fs-text-sm);
      font-weight: 600;
      line-height: 1.2;
    }

    .fs-topbar__profile-mail {
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
      line-height: 1.2;
    }

    .fs-topbar__chevron {
      font-size: 0.75rem;
      color: var(--fs-text-muted);
    }

    .fs-topbar__panel {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 15rem;
      background: var(--fs-surface);
      border: 1px solid var(--fs-border);
      border-radius: var(--fs-radius-md);
      box-shadow: var(--fs-shadow-overlay);
      padding: var(--fs-space-2);
      display: none;
      z-index: var(--fs-z-overlay);
    }

    .fs-topbar__panel--open {
      display: block;
    }

    .fs-topbar__panel-head {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--fs-space-2) var(--fs-space-3) var(--fs-space-3);
      border-bottom: 1px solid var(--fs-border);
      margin-bottom: var(--fs-space-2);
    }

    .fs-topbar__panel-name {
      font-size: var(--fs-text-sm);
      font-weight: 600;
    }

    .fs-topbar__panel-mail {
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fs-topbar__panel-item {
      display: flex;
      align-items: center;
      gap: var(--fs-space-3);
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      color: var(--fs-text-secondary);
      font-size: var(--fs-text-sm);
      font-weight: 500;
      border-radius: var(--fs-radius-sm);
      cursor: pointer;
      text-align: left;
      transition: background var(--fs-transition-fast), color var(--fs-transition-fast);
    }

    .fs-topbar__panel-item:hover {
      background: var(--fs-surface-elevated);
      color: var(--fs-text-primary);
    }

    .fs-topbar__panel-item--danger:hover {
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
    }

    @media (max-width: 1024px) {
      .fs-topbar__menu {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }

    @media (max-width: 720px) {
      .fs-topbar {
        padding: 0 var(--fs-space-4);
      }

      .fs-topbar__profile-text,
      .fs-topbar__chevron {
        display: none;
      }
    }
  `,
})
export class Topbar {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly menuRequested = output<void>();

  readonly profileOpen = signal(false);
  readonly title = signal('FinanSight');
  readonly eyebrow = signal('Visão geral');

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncWithRoute();
      }
    });
    this.syncWithRoute();
  }

  private syncWithRoute(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.data as { title?: string; eyebrow?: string };
    this.title.set(data['title'] ?? 'FinanSight');
    this.eyebrow.set(data['eyebrow'] ?? 'Visão geral');
  }

  readonly initials = computed(() => {
    const name = this.session.user()?.name?.trim() ?? '';
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
  });

  toggleProfile(event: Event): void {
    event.stopPropagation();
    this.profileOpen.update((open) => !open);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  logout(): void {
    this.closeProfile();
    this.session.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeProfile();
  }
}
