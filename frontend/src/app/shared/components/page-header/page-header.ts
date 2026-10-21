import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabecalho padrão das páginas: título, descrição e ações.
 */
@Component({
  selector: 'fs-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fs-page-header">
      <div class="fs-page-header__text">
        <h1 class="fs-page-title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="fs-page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="fs-page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .fs-page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--fs-space-4);
      flex-wrap: wrap;
    }

    .fs-page-header__text {
      min-width: 0;
    }

    .fs-page-header__subtitle {
      margin-top: 0.25rem;
      font-size: var(--fs-text-base);
      color: var(--fs-text-secondary);
    }

    .fs-page-header__actions {
      display: flex;
      align-items: center;
      gap: var(--fs-space-2);
      flex-wrap: wrap;
    }

    @media (max-width: 640px) {
      .fs-page-header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
