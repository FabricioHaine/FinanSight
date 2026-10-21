import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger';

/**
 * Barra de progresso com a identidade Midnight. O preenchimento e animado
 * e respeita a preferencia de reducao de movimento do sistema.
 */
@Component({
  selector: 'fs-progress-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fs-progress">
      @if (showLabel()) {
        <div class="fs-progress__labels">
          <span class="fs-progress__caption">{{ caption() }}</span>
          <span class="fs-progress__value fs-numeric">{{ valueLabel() }}</span>
        </div>
      }
      <div
        class="fs-progress__track"
        role="progressbar"
        [attr.aria-valuenow]="clamped()"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-label]="caption()"
      >
        <div
          class="fs-progress__fill"
          [class]="'fs-progress__fill fs-progress__fill--' + tone()"
          [style.width.%]="clamped()"
        ></div>
      </div>
    </div>
  `,
  styles: `
    .fs-progress {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      width: 100%;
    }

    .fs-progress__labels {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fs-space-2);
    }

    .fs-progress__caption {
      font-size: var(--fs-text-sm);
      color: var(--fs-text-secondary);
    }

    .fs-progress__value {
      font-size: var(--fs-text-sm);
      font-weight: 600;
      color: var(--fs-text-primary);
    }

    .fs-progress__track {
      width: 100%;
      height: 6px;
      border-radius: var(--fs-radius-pill);
      background: var(--fs-bg-secondary);
      overflow: hidden;
    }

    .fs-progress__fill {
      height: 100%;
      border-radius: var(--fs-radius-pill);
      transition: width var(--fs-transition-slow);
      background: var(--fs-accent);
    }

    .fs-progress__fill--accent {
      background: linear-gradient(90deg, var(--fs-accent), var(--fs-accent-soft));
    }

    .fs-progress__fill--success {
      background: var(--fs-success);
    }

    .fs-progress__fill--warning {
      background: var(--fs-warning);
    }

    .fs-progress__fill--danger {
      background: var(--fs-danger);
    }
  `,
})
export class ProgressMeter {
  readonly value = input.required<number>();
  readonly caption = input('');
  readonly valueLabel = input('');
  readonly tone = input<ProgressTone>('accent');
  readonly showLabel = input(true);

  readonly clamped = computed(() => {
    const value = Number(this.value() ?? 0);
    return Math.min(Math.max(value, 0), 100);
  });
}
