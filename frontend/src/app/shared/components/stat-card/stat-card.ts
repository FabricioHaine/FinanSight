import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cartao de indicador financeiro. Todos os indicadores compartilham a mesma
 * estrutura visual: rotulo, valor em destaque, variacao e ícone discreto.
 */
@Component({
  selector: 'fs-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="fs-stat" [class.fs-stat--emphasis]="emphasis()">
      <header class="fs-stat__header">
        <span class="fs-stat__label">{{ label() }}</span>
        @if (icon()) {
          <span class="fs-stat__icon" aria-hidden="true">
            <i class="pi" [class]="icon()"></i>
          </span>
        }
      </header>

      <p class="fs-stat__value fs-money" [class.fs-money--lg]="emphasis()" [class.fs-money--md]="!emphasis()">
        {{ value() }}
      </p>

      @if (hint()) {
        <p class="fs-stat__hint">{{ hint() }}</p>
      }

      <div class="fs-stat__footer">
        <ng-content />
      </div>
    </article>
  `,
  styles: `
    .fs-stat {
      display: flex;
      flex-direction: column;
      gap: var(--fs-space-2);
      background: var(--fs-surface);
      border: 1px solid var(--fs-border);
      border-radius: var(--fs-radius-lg);
      padding: var(--fs-space-4) var(--fs-space-4) var(--fs-space-4);
      box-shadow: var(--fs-shadow-card);
      min-width: 0;
      transition: border-color var(--fs-transition-base), transform var(--fs-transition-base);
    }

    .fs-stat:hover {
      border-color: var(--fs-border-strong);
    }

    .fs-stat--emphasis {
      background: linear-gradient(160deg, rgba(107, 142, 255, 0.07), transparent 62%), var(--fs-surface);
    }

    .fs-stat__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fs-space-2);
    }

    .fs-stat__label {
      font-size: var(--fs-text-xs);
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--fs-text-muted);
    }

    .fs-stat__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--fs-radius-sm);
      background: var(--fs-surface-elevated);
      border: 1px solid var(--fs-border);
      color: var(--fs-accent-soft);
      font-size: 0.8125rem;
    }

    .fs-stat__value {
      margin: 0;
      color: var(--fs-text-primary);
    }

    .fs-stat__hint {
      font-size: var(--fs-text-sm);
      color: var(--fs-text-muted);
    }

    .fs-stat__footer:empty {
      display: none;
    }
  `,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input('');
  readonly icon = input('');
  readonly emphasis = input(false);
}
