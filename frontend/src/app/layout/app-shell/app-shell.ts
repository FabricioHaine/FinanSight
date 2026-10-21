import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { SessionService } from '../../core/services/session.service';

/**
 * Estrutura principal da aplicação: menu lateral fixo no desktop,
 * drawer no mobile, cabecalho e área de conteúdo.
 */
@Component({
  selector: 'fs-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, Topbar, DrawerModule, ToastModule],
  template: `
    <div class="fs-shell">
      <aside class="fs-shell__sidebar">
        <fs-sidebar />
      </aside>

      <div class="fs-shell__main">
        <fs-topbar (menuRequested)="mobileMenuOpen.set(true)" />
        <main class="fs-shell__content" id="conteudo">
          <router-outlet />
        </main>
      </div>
    </div>

    <p-drawer
      [visible]="mobileMenuOpen()"
      (visibleChange)="mobileMenuOpen.set($event)"
      position="left"
      styleClass="fs-shell__drawer"
      [showCloseIcon]="false"
    >
      <ng-template #headless>
        <div class="fs-shell__drawer-inner">
          <fs-sidebar />
        </div>
      </ng-template>
    </p-drawer>

    <p-toast position="bottom-right" />
  `,
  styles: `
    .fs-shell {
      display: flex;
      min-height: 100vh;
      background: var(--fs-bg-primary);
    }

    .fs-shell__sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      flex: 0 0 auto;
      z-index: var(--fs-z-sidebar);
    }

    .fs-shell__main {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .fs-shell__content {
      flex: 1 1 auto;
      padding: var(--fs-space-5);
      min-width: 0;
    }

    .fs-shell__drawer-inner {
      height: 100%;
    }

    .fs-shell__drawer ::ng-deep .p-drawer-content {
      padding: 0;
      background: var(--fs-bg-secondary);
    }

    @media (max-width: 1024px) {
      .fs-shell__sidebar {
        display: none;
      }

      .fs-shell__content {
        padding: var(--fs-space-4);
      }
    }
  `,
})
export class AppShell {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly mobileMenuOpen = signal(false);

  constructor() {
    this.router.events.subscribe(() => this.mobileMenuOpen.set(false));
    this.session.restore().subscribe();
  }
}
