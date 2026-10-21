import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indicador de variacao entre períodos. Usa cor semantica apenas quando
 * ha comparação disponivel.
 */
@Component({
  selector: 'fs-trend-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (available()) {
      <span class="fs-trend" [class.fs-trend--up]="direction() === 'up'" [class.fs-trend--down]="direction() === 'down'">
        <i class="pi" [class.pi-arrow-up-right]="direction() === 'up'" [class.pi-arrow-down-right]="direction() === 'down'"></i>
        <span class="fs-trend__value">{{ formatted() }}</span>
        <span class="fs-trend__label">{{ label() }}</span>
      </span>
    } @else {
      <span class="fs-trend fs-trend--empty">{{ emptyLabel() }}</span>
    }
  `,
  styles: `
    .fs-trend {
      display: inline-flex;
      align-items: center;
      gap: 0.3125rem;
      font-size: var(--fs-text-sm);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .fs-trend i {
      font-size: 0.75rem;
    }

    .fs-trend--up {
      color: var(--fs-success);
    }

    .fs-trend--down {
      color: var(--fs-danger);
    }

    .fs-trend--empty {
      color: var(--fs-text-muted);
      font-weight: 500;
    }

    .fs-trend__label {
      color: var(--fs-text-muted);
      font-weight: 500;
    }
  `,
})
export class TrendIndicator {
  /** Variacao percentual. `null` significa que não ha base de comparação. */
  readonly variation = input<number | null>(null);
  readonly label = input('vs. período anterior');
  readonly emptyLabel = input('Sem período anterior');
  /** Quando `true`, a queda e considered positiva (ex.: despesas). */
  readonly invert = input(false);
  /** Sobrescreve a deteccao automatica de comparação disponivel. */
  readonly availableOverride = input<boolean | null>(null);

  available(): boolean {
    const override = this.availableOverride();
    if (override !== null) return override;
    return this.variation() !== null && this.variation() !== undefined;
  }

  direction(): 'up' | 'down' {
    const value = Number(this.variation() ?? 0);
    if (value === 0) return 'up';
    const positive = value > 0;
    return this.invert() ? (positive ? 'down' : 'up') : positive ? 'up' : 'down';
  }

  formatted(): string {
    const value = Number(this.variation() ?? 0);
    const absolute = Math.abs(value);
    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${sign}${absolute.toFixed(1).replace('.', ',')}%`;
  }
}
