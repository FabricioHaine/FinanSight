import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FinanceApi } from '../../core/services/finance-api';
import { Budget, Category } from '../../core/models/finance.models';
import { formatCurrency, formatPercent, monthEndIso, monthStartIso } from '../../core/utils/format';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ProgressMeter, ProgressTone } from '../../shared/components/progress-meter/progress-meter';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'fs-budgets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TooltipModule,
    ProgressSpinnerModule,
    PageHeader,
    EmptyState,
    ProgressMeter,
    ConfirmDialog,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header
        title="Orçamentos"
        subtitle="Defina limites por categoria e acompanhe o consumo do mês."
      >
        <p-button label="Novo orçamento" icon="pi pi-plus" (onClick)="openCreate()" />
      </fs-page-header>

      <section class="fs-card fs-card--flush">
        <header class="fs-card__header">
          <div>
            <h3 class="fs-card__title">Limites por categoria</h3>
            <p class="fs-card__subtitle">{{ periodLabel() }}</p>
          </div>
          <div class="fs-toolbar__group">
            <p-datepicker
              [ngModel]="periodDate()"
              (ngModelChange)="onPeriodChange($event)"
              [showIcon]="true"
              iconDisplay="input"
              appendTo="body"
              dateFormat="mm/yy"
              view="month"
              [style]="{ width: '10rem' }"
              ariaLabel="Período do orçamento"
            />
          </div>
        </header>

        @if (loading()) {
          <div class="fs-loading">
            <p-progress-spinner strokeWidth="3" [style]="{ width: '2.25rem', height: '2.25rem' }" />
            <span>Carregando orçamentos...</span>
          </div>
        } @else if (error()) {
          <p class="fs-error" role="alert">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            <span>{{ error() }}</span>
            <p-button label="Tentar novamente" [text]="true" (onClick)="load()" />
          </p>
        } @else if (budgets().length === 0) {
          <fs-empty-state
            title="Nenhum orçamento no período"
            message="Crie um limite por categoria para acompanhar seus gastos mensais."
            icon="pi pi-chart-pie"
          >
            <p-button label="Novo orçamento" icon="pi pi-plus" (onClick)="openCreate()" />
          </fs-empty-state>
        } @else {
          <div class="fs-budgets">
            @for (budget of budgets(); track budget.id) {
              <article class="fs-budget">
                <header class="fs-budget__head">
                  <div>
                    <h4 class="fs-budget__name">{{ budget.categoryName }}</h4>
                    <p class="fs-budget__limit">
                      Limite de <span class="fs-numeric">{{ money(budget.limitAmount) }}</span>
                    </p>
                  </div>
                  <div class="fs-budget__actions">
                    <span class="fs-budget__status" [class]="'fs-budget__status fs-budget__status--' + budget.status.toLowerCase()">
                      {{ statusLabel(budget) }}
                    </span>
                    <button
                      type="button"
                      class="fs-icon-btn"
                      (click)="openEdit(budget)"
                      [attr.aria-label]="'Editar orçamento de ' + budget.categoryName"
                      pTooltip="Editar"
                      tooltipPosition="top"
                    >
                      <i class="pi pi-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                      type="button"
                      class="fs-icon-btn fs-icon-btn--danger"
                      (click)="askDelete(budget)"
                      [attr.aria-label]="'Excluir orçamento de ' + budget.categoryName"
                      pTooltip="Excluir"
                      tooltipPosition="top"
                    >
                      <i class="pi pi-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </header>

                <fs-progress-meter
                  [value]="budget.percentUsed"
                  [tone]="tone(budget)"
                  [showLabel]="false"
                />

                <footer class="fs-budget__foot">
                  <span class="fs-numeric">
                    {{ money(budget.spentAmount) }} gastos ({{ percent(budget.percentUsed) }})
                  </span>
                  <span class="fs-numeric" [class.fs-negative]="budget.status === 'EXCEDIDO'">
                    restam {{ money(budget.remainingAmount) }}
                  </span>
                </footer>
              </article>
            }
          </div>
        }
      </section>
    </div>

    <p-dialog
      [visible]="dialogOpen()"
      (visibleChange)="onDialogVisibleChange($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="!saving()"
      [style]="{ width: '30rem', 'max-width': 'calc(100vw - 2rem)' }"
      [header]="editingId() === null ? 'Novo orçamento' : 'Editar orçamento'"
    >
      <form class="fs-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="fs-field">
          <label class="fs-field__label" for="categoria">Categoria de despesa</label>
          <p-select
            inputId="categoria"
            formControlName="categoryId"
            [options]="expenseCategoryOptions()"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione a categoria"
            [filter]="true"
            filterPlaceholder="Buscar categoria"
            appendTo="body"
            styleClass="fs-input"
          />
          @if (isInvalid('categoryId')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              Selecione uma categoria de despesa.
            </span>
          }
        </div>

        <div class="fs-grid fs-grid--form">
          <div class="fs-field">
            <label class="fs-field__label" for="limite">Limite mensal</label>
            <p-inputnumber
              inputId="limite"
              formControlName="limitAmount"
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              [min]="0.01"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              placeholder="0,00"
              styleClass="fs-input"
            />
            @if (isInvalid('limitAmount')) {
              <span class="fs-field__error">
                <i class="pi pi-times-circle" aria-hidden="true"></i>
                Informe um limite maior que zero.
              </span>
            }
          </div>

          <div class="fs-field">
            <label class="fs-field__label" for="periodo">Período</label>
            <p-datepicker
              inputId="periodo"
              formControlName="period"
              [showIcon]="true"
              iconDisplay="input"
              appendTo="body"
              dateFormat="mm/yy"
              view="month"
              styleClass="fs-input"
            />
            @if (isInvalid('period')) {
              <span class="fs-field__error">
                <i class="pi pi-times-circle" aria-hidden="true"></i>
                Selecione o período do orçamento.
              </span>
            }
          </div>
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
            [label]="editingId() === null ? 'Criar orçamento' : 'Salvar alterações'"
            [loading]="saving()"
            [disabled]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <fs-confirm-dialog
      [visible]="confirmOpen()"
      title="Excluir orçamento"
      [message]="deleteMessage()"
      confirmLabel="Excluir"
      [busy]="deleting()"
      (confirm)="deleteBudget()"
      (cancel)="closeConfirm()"
    />
  `,
  styles: `
    .fs-budgets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
      gap: var(--fs-space-4);
      padding: var(--fs-space-5);
    }

    .fs-budget {
      display: flex;
      flex-direction: column;
      gap: var(--fs-space-3);
      background: var(--fs-bg-secondary);
      border: 1px solid var(--fs-border);
      border-radius: var(--fs-radius-md);
      padding: var(--fs-space-4);
    }

    .fs-budget__head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--fs-space-2);
    }

    .fs-budget__name {
      font-size: var(--fs-text-base);
      font-weight: 600;
    }

    .fs-budget__limit {
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
      margin-top: 2px;
    }

    .fs-budget__actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .fs-budget__status {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--fs-radius-pill);
      font-size: var(--fs-text-xs);
      font-weight: 600;
    }

    .fs-budget__status--em_dia {
      background: var(--fs-success-muted);
      color: var(--fs-success);
    }

    .fs-budget__status--atencao {
      background: var(--fs-warning-muted);
      color: var(--fs-warning);
    }

    .fs-budget__status--excedido {
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
    }

    .fs-budget__foot {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fs-space-2);
      font-size: var(--fs-text-xs);
      color: var(--fs-text-secondary);
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

    .fs-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--fs-space-3);
      padding: var(--fs-space-7);
      color: var(--fs-text-muted);
      font-size: var(--fs-text-sm);
    }

    .fs-error {
      display: flex;
      align-items: center;
      gap: var(--fs-space-2);
      padding: var(--fs-space-4);
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
export class Budgets {
  private readonly api = inject(FinanceApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly budgets = signal<Budget[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly periodDate = signal<Date>(new Date());
  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  readonly confirmOpen = signal(false);
  readonly pendingDelete = signal<Budget | null>(null);
  readonly deleting = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    categoryId: [null as number | null, Validators.required],
    limitAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    period: [new Date() as Date | null, Validators.required],
  });

  readonly expenseCategoryOptions = computed(() =>
    this.categories()
      .filter((category) => category.type === 'DESPESA')
      .map((category) => ({ label: category.name, value: category.id })),
  );

  readonly periodLabel = computed(() => {
    const date = this.periodDate();
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  constructor() {
    this.api.listCategories(true).subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const reference = this.periodDate();
    this.api
      .listBudgets(monthStartIso(reference), monthEndIso(reference))
      .subscribe({
        next: (budgets) => {
          this.budgets.set(budgets);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(FinanceApi.describeError(error));
          this.loading.set(false);
        },
      });
  }

  onPeriodChange(value: Date | null): void {
    if (!value) return;
    this.periodDate.set(value);
    this.load();
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.form.reset({
      categoryId: null,
      limitAmount: null,
      period: this.toDate(this.toIso(this.periodDate())),
    });
    this.dialogOpen.set(true);
  }

  openEdit(budget: Budget): void {
    this.editingId.set(budget.id);
    this.formError.set('');
    this.form.reset({
      categoryId: budget.categoryId,
      limitAmount: budget.limitAmount,
      period: this.toDate(budget.period),
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
      categoryId: Number(value.categoryId),
      limitAmount: Number(value.limitAmount ?? 0),
      period: this.toIso(value.period ?? new Date()),
    };

    const editingId = this.editingId();
    this.saving.set(true);

    const request = editingId
      ? this.api.updateBudget(editingId, payload)
      : this.api.createBudget(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.messageService.add({
          severity: 'success',
          summary: editingId ? 'Orçamento atualizado' : 'Orçamento criado',
          detail: 'Limite registrado com sucesso',
        });
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(FinanceApi.describeError(error));
      },
    });
  }

  askDelete(budget: Budget): void {
    this.pendingDelete.set(budget);
    this.confirmOpen.set(true);
  }

  deleteMessage(): string {
    const budget = this.pendingDelete();
    return budget ? `O orçamento de "${budget.categoryName}" será removido.` : '';
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.pendingDelete.set(null);
  }

  deleteBudget(): void {
    const budget = this.pendingDelete();
    if (!budget) return;

    this.deleting.set(true);
    this.api.deleteBudget(budget.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeConfirm();
        this.messageService.add({
          severity: 'success',
          summary: 'Orçamento excluído',
          detail: budget.categoryName,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível excluir o orçamento',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  isInvalid(control: 'categoryId' | 'limitAmount' | 'period'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  tone(budget: Budget): ProgressTone {
    if (budget.status === 'EXCEDIDO') return 'danger';
    if (budget.status === 'ATENCAO') return 'warning';
    return 'success';
  }

  statusLabel(budget: Budget): string {
    if (budget.status === 'EXCEDIDO') return 'Excedido';
    if (budget.status === 'ATENCAO') return 'Atenção';
    return 'Em dia';
  }

  money(value: number | null | undefined): string {
    return formatCurrency(value);
  }

  percent(value: number | null | undefined): string {
    return formatPercent(value);
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
