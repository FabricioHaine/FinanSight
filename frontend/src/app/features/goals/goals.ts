import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { FinanceApi } from '../../core/services/finance-api';
import { Contribution, Goal } from '../../core/models/finance.models';
import { formatCurrency, formatDate, formatPercent, todayIso } from '../../core/utils/format';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProgressMeter, ProgressTone } from '../../shared/components/progress-meter/progress-meter';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'fs-goals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TextareaModule,
    TooltipModule,
    PageHeader,
    EmptyState,
    ProgressMeter,
    ConfirmDialog,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header
        title="Metas financeiras"
        subtitle="Defina objetivos, acompanhe o progresso e registre contribuições."
      >
        <p-button label="Nova meta" icon="pi pi-plus" (onClick)="openCreate()" />
      </fs-page-header>

      @if (error()) {
        <p class="fs-error" role="alert">
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          <span>{{ error() }}</span>
          <p-button label="Tentar novamente" [text]="true" (onClick)="load()" />
        </p>
      }

      @if (loading()) {
        <div class="fs-grid fs-grid--goals">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <div class="fs-skeleton" style="height: 190px"></div>
          }
        </div>
      } @else if (goals().length === 0) {
        <section class="fs-card">
          <fs-empty-state
            title="Nenhuma meta cadastrada"
            message="Crie sua primeira meta e comece a acompanhar o quanto falta para alcança-la."
            icon="pi pi-flag"
          >
            <p-button label="Criar meta" icon="pi pi-plus" (onClick)="openCreate()" />
          </fs-empty-state>
        </section>
      } @else {
        <section class="fs-grid fs-grid--goals">
          @for (goal of goals(); track goal.id) {
            <article class="fs-goal-card">
              <header class="fs-goal-card__head">
                <div>
                  <h3 class="fs-goal-card__name">{{ goal.name }}</h3>
                  @if (goal.description) {
                    <p class="fs-goal-card__description">{{ goal.description }}</p>
                  }
                </div>
                <span class="fs-goal-card__status" [class]="'fs-goal-card__status fs-goal-card__status--' + goal.status.toLowerCase()">
                  {{ statusLabel(goal) }}
                </span>
              </header>

              <div class="fs-goal-card__amount">
                <span class="fs-money fs-money--md fs-numeric">{{ money(goal.accumulatedAmount) }}</span>
                <span class="fs-goal-card__target fs-numeric">de {{ money(goal.targetAmount) }}</span>
              </div>

              <fs-progress-meter
                [value]="goal.percentComplete"
                [tone]="tone(goal)"
                [valueLabel]="percent(goal.percentComplete)"
                [caption]="goal.overdue ? 'Prazo vencido' : 'Concluído'"
                [showLabel]="false"
              />

              <div class="fs-goal-card__meta">
                <span class="fs-numeric">{{ percent(goal.percentComplete) }} concluído</span>
                <span class="fs-numeric">faltam {{ money(goal.remainingAmount) }}</span>
              </div>

              <footer class="fs-goal-card__foot">
                <span class="fs-caption">
                  @if (goal.deadline) {
                    Prazo: {{ date(goal.deadline) }}
                  } @else {
                    Sem prazo definido
                  }
                </span>
                <div class="fs-goal-card__actions">
                  <button
                    type="button"
                    class="fs-icon-btn"
                    (click)="openHistory(goal)"
                    [attr.aria-label]="'Ver contribuições de ' + goal.name"
                    pTooltip="Contribuições"
                    tooltipPosition="top"
                  >
                    <i class="pi pi-history" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fs-icon-btn"
                    (click)="openEdit(goal)"
                    [attr.aria-label]="'Editar meta ' + goal.name"
                    pTooltip="Editar"
                    tooltipPosition="top"
                  >
                    <i class="pi pi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fs-icon-btn fs-icon-btn--danger"
                    (click)="askDelete(goal)"
                    [attr.aria-label]="'Excluir meta ' + goal.name"
                    pTooltip="Excluir"
                    tooltipPosition="top"
                  >
                    <i class="pi pi-trash" aria-hidden="true"></i>
                  </button>
                  <p-button
                    label="Contribuir"
                    icon="pi pi-plus"
                    size="small"
                    [outlined]="true"
                    (onClick)="openContribution(goal)"
                  />
                </div>
              </footer>
            </article>
          }
        </section>
      }
    </div>

    <p-dialog
      [visible]="dialogOpen()"
      (visibleChange)="onDialogVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="!saving()"
      [style]="{ width: '32rem', 'max-width': 'calc(100vw - 2rem)' }"
      [header]="editingId() === null ? 'Nova meta' : 'Editar meta'"
    >
      <form class="fs-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="fs-field">
          <label class="fs-field__label" for="nome">Nome da meta</label>
          <input
            pInputText
            id="nome"
            formControlName="name"
            placeholder="Ex.: Reserva de emergência"
            [class.fs-field--invalid]="isInvalid('name')"
          />
          @if (isInvalid('name')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              Informe o nome da meta.
            </span>
          }
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="valor">Valor desejado</label>
          <p-inputnumber
            inputId="valor"
            formControlName="targetAmount"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            [min]="0.01"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
            placeholder="0,00"
            styleClass="fs-input"
          />
          @if (isInvalid('targetAmount')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              Informe um valor maior que zero.
            </span>
          }
        </div>

        <div class="fs-grid fs-grid--form">
          <div class="fs-field">
            <label class="fs-field__label" for="inicio">Data de início</label>
            <p-datepicker
              inputId="inicio"
              formControlName="startDate"
              [showIcon]="true"
              iconDisplay="input"
              appendTo="body"
              dateFormat="dd/mm/yy"
              styleClass="fs-input"
            />
          </div>

          <div class="fs-field">
            <label class="fs-field__label" for="prazo">Prazo desejado</label>
            <p-datepicker
              inputId="prazo"
              formControlName="deadline"
              [showIcon]="true"
              iconDisplay="input"
              appendTo="body"
              dateFormat="dd/mm/yy"
              styleClass="fs-input"
            />
          </div>
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="descricao">Descrição (opcional)</label>
          <textarea
            pTextarea
            id="descricao"
            formControlName="description"
            rows="3"
            placeholder="Por que esta meta é importante para você"
          ></textarea>
        </div>

        @if (formError()) {
          <p class="fs-alert" role="alert">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            <span>{{ formError() }}</span>
          </p>
        }

        <div class="fs-dialog__footer">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            [disabled]="saving()"
            (onClick)="closeDialog()"
          />
          <p-button
            type="submit"
            [label]="editingId() === null ? 'Criar meta' : 'Salvar alterações'"
            [loading]="saving()"
            [disabled]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <p-dialog
      [visible]="contributionOpen()"
      (visibleChange)="onContributionVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="!saving()"
      [style]="{ width: '30rem', 'max-width': 'calc(100vw - 2rem)' }"
      [header]="'Contribuir para ' + (contributionGoal()?.name ?? '')"
    >
      <form class="fs-form" [formGroup]="contributionForm" (ngSubmit)="saveContribution()" novalidate>
        <div class="fs-field">
          <label class="fs-field__label" for="valor-contribuicao">Valor da contribuição</label>
          <p-inputnumber
            inputId="valor-contribuicao"
            formControlName="amount"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            [min]="0.01"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
            placeholder="0,00"
            styleClass="fs-input"
          />
          @if (contributionInvalid('amount')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              Informe um valor maior que zero.
            </span>
          }
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="data-contribuicao">Data</label>
          <p-datepicker
            inputId="data-contribuicao"
            formControlName="date"
            [showIcon]="true"
            iconDisplay="input"
            appendTo="body"
            dateFormat="dd/mm/yy"
            [maxDate]="maxDate()"
            styleClass="fs-input"
          />
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="nota">Observação (opcional)</label>
          <input
            pInputText
            id="nota"
            formControlName="note"
            placeholder="Ex.: aporte mensal"
          />
        </div>

        @if (formError()) {
          <p class="fs-alert" role="alert">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            <span>{{ formError() }}</span>
          </p>
        }

        <div class="fs-dialog__footer">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            [disabled]="saving()"
            (onClick)="closeContribution()"
          />
          <p-button
            type="submit"
            label="Registrar contribuição"
            [loading]="saving()"
            [disabled]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <p-dialog
      [visible]="historyOpen()"
      (visibleChange)="onHistoryVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '34rem', 'max-width': 'calc(100vw - 2rem)' }"
      [header]="'Contribuições - ' + (historyGoal()?.name ?? '')"
    >
      @if (contributions().length === 0) {
        <fs-empty-state
          title="Nenhuma contribuição registrada"
          message="As contribuições somam ao valor acumulado da meta."
          icon="pi pi-wallet"
        />
      } @else {
        <p-table [value]="contributions()" styleClass="fs-table">
          <ng-template #header>
            <tr>
              <th>Data</th>
              <th>Observação</th>
              <th class="fs-table__right">Valor</th>
              <th class="fs-table__actions"></th>
            </tr>
          </ng-template>
          <ng-template #body let-contribution>
            <tr>
              <td class="fs-numeric fs-muted">{{ date(contribution.date) }}</td>
              <td>{{ contribution.note || '--' }}</td>
              <td class="fs-table__right fs-numeric fs-strong fs-positive">
                + {{ money(contribution.amount) }}
              </td>
              <td class="fs-table__actions">
                <button
                  type="button"
                  class="fs-icon-btn fs-icon-btn--danger"
                  (click)="removeContribution(contribution)"
                  [attr.aria-label]="'Remover contribuição de ' + money(contribution.amount)"
                  pTooltip="Remover"
                  tooltipPosition="top"
                >
                  <i class="pi pi-trash" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </p-dialog>

    <fs-confirm-dialog
      [visible]="confirmOpen()"
      title="Excluir meta"
      [message]="deleteMessage()"
      confirmLabel="Excluir"
      [busy]="deleting()"
      (confirm)="deleteGoal()"
      (cancel)="closeConfirm()"
    />
  `,
  styles: `
    .fs-grid--goals {
      grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    }

    .fs-goal-card {
      display: flex;
      flex-direction: column;
      gap: var(--fs-space-3);
      background: var(--fs-surface);
      border: 1px solid var(--fs-border);
      border-radius: var(--fs-radius-lg);
      box-shadow: var(--fs-shadow-card);
      padding: var(--fs-space-5);
    }

    .fs-goal-card__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fs-space-3);
    }

    .fs-goal-card__name {
      font-size: var(--fs-text-md);
      font-weight: 600;
    }

    .fs-goal-card__description {
      margin-top: 0.25rem;
      font-size: var(--fs-text-sm);
      color: var(--fs-text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .fs-goal-card__status {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--fs-radius-pill);
      font-size: var(--fs-text-xs);
      font-weight: 600;
      white-space: nowrap;
    }

    .fs-goal-card__status--ativa {
      background: var(--fs-info-muted);
      color: var(--fs-info);
    }

    .fs-goal-card__status--concluída {
      background: var(--fs-success-muted);
      color: var(--fs-success);
    }

    .fs-goal-card__status--cancelada {
      background: var(--fs-surface-elevated);
      color: var(--fs-text-muted);
    }

    .fs-goal-card__amount {
      display: flex;
      align-items: baseline;
      gap: var(--fs-space-2);
      flex-wrap: wrap;
    }

    .fs-goal-card__target {
      font-size: var(--fs-text-sm);
      color: var(--fs-text-muted);
    }

    .fs-goal-card__meta {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fs-space-2);
      font-size: var(--fs-text-sm);
      color: var(--fs-text-secondary);
    }

    .fs-goal-card__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fs-space-2);
      flex-wrap: wrap;
      padding-top: var(--fs-space-3);
      border-top: 1px solid var(--fs-border);
    }

    .fs-goal-card__actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .fs-icon-btn {
      appearance: none;
      border: 1px solid transparent;
      background: transparent;
      color: var(--fs-text-muted);
      width: 30px;
      height: 30px;
      border-radius: var(--fs-radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background var(--fs-transition-fast), color var(--fs-transition-fast);
    }

    .fs-icon-btn:hover {
      background: var(--fs-surface-elevated);
      color: var(--fs-text-primary);
    }

    .fs-icon-btn--danger:hover {
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
    }

    .fs-table__right {
      text-align: right;
    }

    .fs-table__actions {
      width: 4rem;
      text-align: right;
    }

    .fs-error {
      display: flex;
      align-items: center;
      gap: var(--fs-space-2);
      padding: var(--fs-space-3) var(--fs-space-4);
      border-radius: var(--fs-radius-md);
      border: 1px solid rgba(229, 139, 147, 0.35);
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
      font-size: var(--fs-text-sm);
    }

    .fs-form {
      display: flex;
      flex-direction: column;
      gap: var(--fs-space-4);
    }

    .fs-grid--form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: var(--fs-space-4);
    }

    .fs-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--fs-space-2);
      padding: var(--fs-space-3);
      border-radius: var(--fs-radius-md);
      border: 1px solid rgba(229, 139, 147, 0.35);
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
      font-size: var(--fs-text-sm);
    }

    .fs-dialog__footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--fs-space-2);
      padding-top: var(--fs-space-2);
    }
  `,
})
export class Goals {
  private readonly api = inject(FinanceApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly goals = signal<Goal[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  readonly contributionOpen = signal(false);
  readonly contributionGoal = signal<Goal | null>(null);

  readonly historyOpen = signal(false);
  readonly historyGoal = signal<Goal | null>(null);
  readonly contributions = signal<Contribution[]>([]);

  readonly confirmOpen = signal(false);
  readonly pendingDelete = signal<Goal | null>(null);
  readonly deleting = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    targetAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    startDate: [null as Date | null],
    deadline: [null as Date | null],
    description: ['', [Validators.maxLength(500)]],
  });

  readonly contributionForm = this.formBuilder.nonNullable.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date() as Date | null, Validators.required],
    note: ['', [Validators.maxLength(240)]],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.listGoals().subscribe({
      next: (goals) => {
        this.goals.set(goals);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(FinanceApi.describeError(error));
        this.loading.set(false);
      },
    });
  }

  // ------------------------------------------------------------------ Meta
  openCreate(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.form.reset({
      name: '',
      targetAmount: null,
      startDate: new Date(),
      deadline: null,
      description: '',
    });
    this.dialogOpen.set(true);
  }

  openEdit(goal: Goal): void {
    this.editingId.set(goal.id);
    this.formError.set('');
    this.form.reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      startDate: goal.startDate ? this.toDate(goal.startDate) : null,
      deadline: goal.deadline ? this.toDate(goal.deadline) : null,
      description: goal.description ?? '',
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.formError.set('');
  }

  onDialogVisibleChange(value: boolean): void {
    if (!value) this.closeDialog();
  }

  save(): void {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      name: value.name.trim(),
      targetAmount: Number(value.targetAmount ?? 0),
      startDate: value.startDate ? this.toIso(value.startDate) : null,
      deadline: value.deadline ? this.toIso(value.deadline) : null,
      description: value.description?.trim() ? value.description.trim() : null,
    };

    const editingId = this.editingId();
    this.saving.set(true);

    const request = editingId
      ? this.api.updateGoal(editingId, payload)
      : this.api.createGoal(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.messageService.add({
          severity: 'success',
          summary: editingId ? 'Meta atualizada' : 'Meta criada',
          detail: payload.name,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(FinanceApi.describeError(error));
      },
    });
  }

  // --------------------------------------------------------- Contribuição
  openContribution(goal: Goal): void {
    this.contributionGoal.set(goal);
    this.formError.set('');
    this.contributionForm.reset({ amount: null, date: this.toDate(todayIso()), note: '' });
    this.contributionOpen.set(true);
  }

  closeContribution(): void {
    this.contributionOpen.set(false);
    this.contributionGoal.set(null);
    this.formError.set('');
  }

  onContributionVisibleChange(value: boolean): void {
    if (!value) this.closeContribution();
  }

  saveContribution(): void {
    this.formError.set('');
    const goal = this.contributionGoal();
    if (!goal) return;
    if (this.contributionForm.invalid) {
      this.contributionForm.markAllAsTouched();
      return;
    }

    const value = this.contributionForm.getRawValue();
    const payload = {
      amount: Number(value.amount ?? 0),
      date: value.date ? this.toIso(value.date) : null,
      note: value.note?.trim() ? value.note.trim() : null,
    };

    this.saving.set(true);
    this.api.addContribution(goal.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeContribution();
        this.messageService.add({
          severity: 'success',
          summary: 'Contribuição registrada',
          detail: `${this.money(payload.amount)} em ${goal.name}`,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(FinanceApi.describeError(error));
      },
    });
  }

  // ------------------------------------------------------------ Histórico
  openHistory(goal: Goal): void {
    this.historyGoal.set(goal);
    this.historyOpen.set(true);
    this.api.listContributions(goal.id).subscribe({
      next: (contributions) => this.contributions.set(contributions),
      error: () => this.contributions.set([]),
    });
  }

  onHistoryVisibleChange(value: boolean): void {
    if (!value) {
      this.historyOpen.set(false);
      this.historyGoal.set(null);
    }
  }

  removeContribution(contribution: Contribution): void {
    const goal = this.historyGoal();
    if (!goal) return;

    this.api.removeContribution(goal.id, contribution.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contribuição removida',
          detail: this.money(contribution.amount),
        });
        this.contributions.update((items) => items.filter((item) => item.id !== contribution.id));
        this.load();
      },
      error: (error: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível remover a contribuição',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  // ---------------------------------------------------------------- Excluir
  askDelete(goal: Goal): void {
    this.pendingDelete.set(goal);
    this.confirmOpen.set(true);
  }

  deleteMessage(): string {
    const goal = this.pendingDelete();
    return goal
      ? `A meta "${goal.name}" e todas as suas contribuições serão removidas.`
      : '';
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.pendingDelete.set(null);
  }

  deleteGoal(): void {
    const goal = this.pendingDelete();
    if (!goal) return;

    this.deleting.set(true);
    this.api.deleteGoal(goal.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeConfirm();
        this.messageService.add({
          severity: 'success',
          summary: 'Meta excluída',
          detail: goal.name,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível excluir a meta',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  // ------------------------------------------------------------- Auxiliares
  isInvalid(control: 'name' | 'targetAmount'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  contributionInvalid(control: 'amount'): boolean {
    const field = this.contributionForm.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  tone(goal: Goal): ProgressTone {
    if (goal.status === 'CONCLUÍDA') return 'success';
    if (goal.overdue) return 'warning';
    return 'accent';
  }

  statusLabel(goal: Goal): string {
    if (goal.status === 'CONCLUÍDA') return 'Concluída';
    if (goal.status === 'CANCELADA') return 'Cancelada';
    return goal.overdue ? 'Atrasada' : 'Ativa';
  }

  money(value: number | null | undefined): string {
    return formatCurrency(value);
  }

  percent(value: number | null | undefined): string {
    return formatPercent(value);
  }

  date(value: string): string {
    return formatDate(value);
  }

  maxDate(): Date {
    return new Date();
  }

  private toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private toDate(iso: string): Date {
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
