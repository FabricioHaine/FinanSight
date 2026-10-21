import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Estado vazio reutilizavel. Mantem a hierarquia visual das telas mesmo
 * quando não ha dados para exibir.
 */
@Component({
  selector: 'fs-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fs-empty">
      <span class="fs-empty__icon" aria-hidden="true">
        <i class="pi" [class]="icon()"></i>
      </span>
      <h3 class="fs-empty__title">{{ title() }}</h3>
      @if (message()) {
        <p class="fs-empty__message">{{ message() }}</p>
      }
      <div class="fs-empty__action">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .fs-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: var(--fs-space-2);
      padding: var(--fs-space-7) var(--fs-space-4);
    }

    .fs-empty__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: var(--fs-radius-md);
      background: var(--fs-surface-elevated);
      border: 1px solid var(--fs-border);
      color: var(--fs-text-muted);
      font-size: 1.125rem;
      margin-bottom: var(--fs-space-1);
    }

    .fs-empty__title {
      font-size: var(--fs-text-md);
      font-weight: 600;
    }

    .fs-empty__message {
      font-size: var(--fs-text-sm);
      color: var(--fs-text-muted);
      max-width: 42ch;
    }

    .fs-empty__action:empty {
      display: none;
    }

    .fs-empty__action {
      margin-top: var(--fs-space-2);
    }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input('');
  readonly icon = input('pi pi-inbox');
}
