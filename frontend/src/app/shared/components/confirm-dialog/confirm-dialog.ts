import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

/**
 * Modal de confirmacao reutilizavel. Usado antes de ações destrutivas
 * (exclusao de transações, categorias, orçamentos e metas).
 */
@Component({
  selector: 'fs-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="!busy()"
      [style]="{ width: '26rem', 'max-width': 'calc(100vw - 2rem)' }"
      [dismissableMask]="!busy()"
      styleClass="fs-confirm"
    >
      <ng-template #header>
        <div class="fs-confirm__header">
          <span class="fs-confirm__icon" aria-hidden="true">
            <i class="pi" [class.pi-exclamation-triangle]="tone() === 'danger'" [class.pi-info-circle]="tone() !== 'danger'"></i>
          </span>
          <span class="fs-confirm__title">{{ title() }}</span>
        </div>
      </ng-template>

      <p class="fs-confirm__message">{{ message() }}</p>

      <ng-template #footer>
        <div class="fs-confirm__footer">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            [disabled]="busy()"
            (onClick)="cancel.emit()"
          />
          <p-button
            [label]="confirmLabel()"
            [severity]="tone() === 'danger' ? 'danger' : 'primary'"
            [loading]="busy()"
            (onClick)="confirm.emit()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: `
    .fs-confirm__header {
      display: flex;
      align-items: center;
      gap: var(--fs-space-3);
    }

    .fs-confirm__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: var(--fs-radius-sm);
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
      font-size: 0.9375rem;
      flex: 0 0 auto;
    }

    .fs-confirm__title {
      font-size: var(--fs-text-md);
      font-weight: 600;
    }

    .fs-confirm__message {
      font-size: var(--fs-text-base);
      color: var(--fs-text-secondary);
      line-height: var(--fs-leading-normal);
    }

    .fs-confirm__footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--fs-space-2);
    }
  `,
})
export class ConfirmDialog {
  readonly visible = model(false);
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly busy = input(false);
  readonly tone = input<'danger' | 'info'>('danger');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onVisibleChange(value: boolean): void {
    if (!value) {
      this.cancel.emit();
    }
  }
}
