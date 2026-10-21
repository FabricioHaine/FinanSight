import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import type { TableLazyLoadEvent } from 'primeng/types/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { FinanceApi } from '../../core/services/finance-api';
import {
  Category,
  Transaction,
  TransactionType,
} from '../../core/models/finance.models';
import { formatCurrency, formatDate, todayIso } from '../../core/utils/format';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { MoneyPipe } from '../../shared/pipes/format.pipes';

interface TransactionForm {
  id: number | null;
  description: string;
  amount: number | null;
  type: TransactionType;
  categoryId: number | null;
  date: Date | null;
  notes: string;
}

@Component({
  selector: 'fs-transactions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    PaginatorModule,
    ProgressSpinnerModule,
    SelectModule,
    SelectButtonModule,
    TableModule,
    TextareaModule,
    TooltipModule,
    PageHeader,
    EmptyState,
    ConfirmDialog,
    MoneyPipe,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header
        title="Transações"
        subtitle="Registre e acompanhe todas as receitas e despesas."
      >
        <p-button
          label="Nova transação"
          icon="pi pi-plus"
          (onClick)="openCreate()"
        />
      </fs-page-header>

      <section class="fs-card fs-filters" aria-label="Filtros">
        <div class="fs-filters__row">
          <div class="fs-filters__search">
            <label class="fs-visually-hidden" for="busca">Buscar transações</label>
            <input
              pInputText
              id="busca"
              type="search"
              [ngModel]="search()"
              (ngModelChange)="onSearch($event)"
              placeholder="Buscar por descrição ou observação"
            />
          </div>

          <p-select
            [options]="typeOptions"
            [ngModel]="typeFilter()"
            (ngModelChange)="onTypeFilter($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos os tipos"
            [style]="{ width: '13rem' }"
            ariaLabel="Filtrar por tipo"
          />

          <p-select
            [options]="categoryOptions()"
            [ngModel]="categoryFilter()"
            (ngModelChange)="onCategoryFilter($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas as categorias"
            [style]="{ width: '14rem' }"
            ariaLabel="Filtrar por categoria"
          />

          <p-select
            [options]="sortOptions"
            [ngModel]="sortBy()"
            (ngModelChange)="onSort($event)"
            optionLabel="label"
            optionValue="value"
            [style]="{ width: '13rem' }"
            ariaLabel="Ordenar por"
          />
        </div>

        <div class="fs-filters__row fs-filters__row--dates">
          <div class="fs-filters__dates">
            <div class="fs-filters__date">
              <label class="fs-visually-hidden" for="de">Data inicial</label>
              <p-datepicker
                inputId="de"
                [ngModel]="fromDate()"
                (ngModelChange)="onFromDate($event)"
                [showIcon]="true"
                iconDisplay="input"
                appendTo="body"
                dateFormat="dd/mm/yy"
                placeholder="De"
                [style]="{ width: '10rem' }"
              />
            </div>
            <div class="fs-filters__date">
              <label class="fs-visually-hidden" for="ate">Data final</label>
              <p-datepicker
                inputId="ate"
                [ngModel]="toDate()"
                (ngModelChange)="onToDate($event)"
                [showIcon]="true"
                iconDisplay="input"
                appendTo="body"
                dateFormat="dd/mm/yy"
                placeholder="Até"
                [style]="{ width: '10rem' }"
              />
            </div>
          </div>

          @if (hasFilters()) {
            <p-button
              label="Limpar filtros"
              icon="pi pi-filter-slash"
              [text]="true"
              severity="secondary"
              (onClick)="clearFilters()"
            />
          }
        </div>
      </section>

      <section class="fs-card fs-card--flush">
        @if (loading()) {
          <div class="fs-loading">
            <p-progress-spinner strokeWidth="3" [style]="{ width: '2.25rem', height: '2.25rem' }" />
            <span>Carregando transações...</span>
          </div>
        } @else if (error()) {
          <p class="fs-error" role="alert">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            <span>{{ error() }}</span>
            <p-button label="Tentar novamente" [text]="true" (onClick)="load()" />
          </p>
        } @else if (transactions().length === 0) {
          <fs-empty-state
            [title]="hasFilters() ? 'Nenhuma transação encontrada' : 'Nenhuma transação registrada'"
            [message]="
              hasFilters()
                ? 'Ajuste os filtros ou limpe a busca para ver outros resultados.'
                : 'Crie sua primeira receita ou despesa para começar a acompanhar seu saldo.'
            "
            icon="pi pi-wallet"
          >
            @if (!hasFilters()) {
              <p-button label="Nova transação" icon="pi pi-plus" (onClick)="openCreate()" />
            }
          </fs-empty-state>
        } @else {
          <p-table
            #tableRef
            [value]="transactions()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="total()"
            [rowsPerPageOptions]="[10, 20, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            styleClass="fs-table"
          >
            <ng-template #header>
              <tr>
                <th pSortableColumn="date">Data <p-sort-icon field="date" /></th>
                <th pSortableColumn="description">Descrição <p-sort-icon field="description" /></th>
                <th pSortableColumn="category">Categoria <p-sort-icon field="category" /></th>
                <th>Tipo</th>
                <th class="fs-table__right" pSortableColumn="amount">
                  Valor <p-sort-icon field="amount" />
                </th>
                <th class="fs-table__actions" aria-label="Ações"></th>
              </tr>
            </ng-template>

            <ng-template #body let-transaction>
              <tr>
                <td class="fs-numeric fs-muted">{{ date(transaction.date) }}</td>
                <td class="fs-strong">
                  {{ transaction.description }}
                  @if (transaction.notes) {
                    <span class="fs-note" [title]="transaction.notes">{{ transaction.notes }}</span>
                  }
                </td>
                <td>{{ transaction.categoryName }}</td>
                <td>
                  <span
                    class="fs-type"
                    [class.fs-type--revenue]="transaction.type === 'RECEITA'"
                    [class.fs-type--expense]="transaction.type === 'DESPESA'"
                  >
                    {{ transaction.type === 'RECEITA' ? 'Receita' : 'Despesa' }}
                  </span>
                </td>
                <td
                  class="fs-table__right fs-numeric fs-strong"
                  [class.fs-positive]="transaction.type === 'RECEITA'"
                  [class.fs-negative]="transaction.type === 'DESPESA'"
                >
                  {{ transaction.amount | money: transaction.type === 'RECEITA' }}
                </td>
                <td class="fs-table__actions">
                  <button
                    type="button"
                    class="fs-icon-btn"
                    (click)="openEdit(transaction)"
                    [attr.aria-label]="'Editar ' + transaction.description"
                    pTooltip="Editar"
                    tooltipPosition="top"
                  >
                    <i class="pi pi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fs-icon-btn fs-icon-btn--danger"
                    (click)="askDelete(transaction)"
                    [attr.aria-label]="'Excluir ' + transaction.description"
                    pTooltip="Excluir"
                    tooltipPosition="top"
                  >
                    <i class="pi pi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
            </ng-template>
          </p-table>
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
      [style]="{ width: '32rem', 'max-width': 'calc(100vw - 2rem)' }"
      [header]="editingId() === null ? 'Nova transação' : 'Editar transação'"
      styleClass="fs-dialog"
    >
      <form class="fs-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="fs-field">
          <span class="fs-field__label">Tipo</span>
          <p-selectbutton
            formControlName="type"
            [options]="typeOptions"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            styleClass="fs-type-toggle"
            (onChange)="onTypeChange($event.value)"
          />
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="descricao">Descrição</label>
          <input
            pInputText
            id="descricao"
            formControlName="description"
            placeholder="Ex.: Salário de setembro"
            [class.fs-field--invalid]="isInvalid('description')"
          />
          @if (isInvalid('description')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              {{ errorFor('description') }}
            </span>
          }
        </div>

        <div class="fs-grid fs-grid--form">
          <div class="fs-field">
            <label class="fs-field__label" for="valor">Valor</label>
            <p-inputnumber
              inputId="valor"
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
            @if (isInvalid('amount')) {
              <span class="fs-field__error">
                <i class="pi pi-times-circle" aria-hidden="true"></i>
                {{ errorFor('amount') }}
              </span>
            }
          </div>

          <div class="fs-field">
            <label class="fs-field__label" for="data">Data</label>
            <p-datepicker
              inputId="data"
              formControlName="date"
              [showIcon]="true"
              iconDisplay="input"
              appendTo="body"
              dateFormat="dd/mm/yy"
              [maxDate]="maxDate()"
              styleClass="fs-input"
            />
            @if (isInvalid('date')) {
              <span class="fs-field__error">
                <i class="pi pi-times-circle" aria-hidden="true"></i>
                {{ errorFor('date') }}
              </span>
            }
          </div>
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="categoria">Categoria</label>
          <p-select
            inputId="categoria"
            formControlName="categoryId"
            [options]="categoryOptions()"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione uma categoria"
            [filter]="true"
            filterPlaceholder="Buscar categoria"
            appendTo="body"
            styleClass="fs-input"
          />
          @if (isInvalid('categoryId')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              {{ errorFor('categoryId') }}
            </span>
          }
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="observacoes">Observações (opcional)</label>
          <textarea
            pTextarea
            id="observacoes"
            formControlName="notes"
            rows="3"
            placeholder="Algum detalhe relevante sobre este lançamento"
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
            [label]="editingId() === null ? 'Registrar' : 'Salvar alterações'"
            [loading]="saving()"
            [disabled]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <fs-confirm-dialog
      [visible]="confirmOpen()"
      title="Excluir transação"
      [message]="deleteMessage()"
      confirmLabel="Excluir"
      [busy]="deleting()"
      (confirm)="deleteTransaction()"
      (cancel)="closeConfirm()"
    />
  `,
  styles: `
    .fs-filters {
      gap: var(--fs-space-3);
      padding: var(--fs-space-4);
    }

    .fs-filters__row {
      display: flex;
      align-items: center;
      gap: var(--fs-space-3);
      flex-wrap: wrap;
    }

    .fs-filters__row--dates {
      justify-content: space-between;
    }

    .fs-filters__search {
      flex: 1 1 16rem;
      min-width: 12rem;
    }

    .fs-filters__search input {
      width: 100%;
    }

    .fs-filters__dates {
      display: flex;
      align-items: center;
      gap: var(--fs-space-2);
      flex-wrap: wrap;
    }

    .fs-grid--form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
      gap: var(--fs-space-4);
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

    .fs-type {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--fs-radius-xs);
      font-size: var(--fs-text-xs);
      font-weight: 600;
    }

    .fs-type--revenue {
      background: var(--fs-success-muted);
      color: var(--fs-success);
    }

    .fs-type--expense {
      background: var(--fs-danger-muted);
      color: var(--fs-danger);
    }

    .fs-note {
      display: block;
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
      max-width: 22rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fs-table__right {
      text-align: right;
    }

    .fs-table__actions {
      width: 6.5rem;
      text-align: right;
      white-space: nowrap;
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

    @media (max-width: 640px) {
      .fs-filters__row--dates {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
})
export class Transactions {
  private readonly api = inject(FinanceApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly tableRef = viewChild<Table>('tableRef');
  readonly transactions = signal<Transaction[]>([]);
  private lastSignature = '';
  readonly categories = signal<Category[]>([]);
  readonly total = signal(0);
  readonly first = signal(0);
  readonly pageSize = signal(10);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly search = signal('');
  readonly selectedType = signal<TransactionType>('RECEITA');
  readonly typeFilter = signal<TransactionType | null>(null);
  readonly categoryFilter = signal<number | null>(null);
  readonly sortBy = signal('date');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');
  readonly fromDate = signal<Date | null>(null);
  readonly toDate = signal<Date | null>(null);

  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  readonly confirmOpen = signal(false);
  readonly pendingDelete = signal<Transaction | null>(null);
  readonly deleting = signal(false);

  readonly typeOptions = [
    { label: 'Receita', value: 'RECEITA' as TransactionType },
    { label: 'Despesa', value: 'DESPESA' as TransactionType },
  ];

  readonly sortOptions = [
    { label: 'Mais recentes', value: 'date' },
    { label: 'Mais antigos', value: 'date-asc' },
    { label: 'Maior valor', value: 'amount' },
    { label: 'Menor valor', value: 'amount-asc' },
    { label: 'Descrição (A-Z)', value: 'description' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(160)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    type: ['RECEITA' as TransactionType, Validators.required],
    categoryId: [null as number | null, Validators.required],
    date: [new Date() as Date | null, Validators.required],
    notes: ['', [Validators.maxLength(500)]],
  });

  readonly categoryOptions = computed(() => {
    const type = this.selectedType();
    return this.categories()
      .filter((category) => category.type === type)
      .map((category) => ({
        label: category.name,
        value: category.id,
      }));
  });

  /** Altera o tipo e limpa a categoria (as categorias aceitam apenas um tipo). */
  onTypeChange(type: TransactionType): void {
    this.selectedType.set(type);
    this.form.controls.categoryId.reset(null);
  }

  readonly hasFilters = computed(
    () =>
      !!this.search() ||
      !!this.typeFilter() ||
      !!this.categoryFilter() ||
      !!this.fromDate() ||
      !!this.toDate(),
  );

  constructor() {
    this.loadCategories();
    this.load();
  }

  // --------------------------------------------------------------- Carregamento
  loadCategories(): void {
    this.api.listCategories(true).subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.lastSignature = this.requestSignature(this.first(), this.pageSize());

    const sortBy = this.sortBy();
    const isAsc = sortBy.endsWith('-asc');
    const field = isAsc ? sortBy.replace('-asc', '') : sortBy;

    this.api
      .listTransactions({
        search: this.search() || null,
        type: this.typeFilter(),
        categoryId: this.categoryFilter(),
        from: this.fromDate() ? this.toIso(this.fromDate()!) : null,
        to: this.toDate() ? this.toIso(this.toDate()!) : null,
        sortBy: field,
        direction: isAsc ? 'asc' : 'desc',
        page: Math.floor(this.first() / this.pageSize()),
        size: this.pageSize(),
      })
      .subscribe({
        next: (page) => {
          this.transactions.set(page.content);
          this.total.set(page.totalElements);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(FinanceApi.describeError(error));
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    // A tabela reemite onLazyLoad sempre que o valor muda. A assinatura evita
    // repetir a mesma requisicao (e entrar em laco).
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    const signature = this.requestSignature(first, rows);
    if (signature === this.lastSignature) {
      return;
    }
    this.first.set(first);
    this.pageSize.set(rows);
    this.load();
  }

  private requestSignature(first: number, rows: number): string {
    return [
      first,
      rows,
      this.search(),
      this.typeFilter() ?? '',
      this.categoryFilter() ?? '',
      this.fromDate()?.toISOString() ?? '',
      this.toDate()?.toISOString() ?? '',
      this.sortBy(),
    ].join('|');
  }

  /** Volta para a primeira página (usado ao mudar os filtros). */
  private resetPagination(): void {
    this.first.set(0);
    const table = this.tableRef();
    if (table) {
      table.first = 0;
    }
  }

  // ----------------------------------------------------------------- Filtros
  onSearch(value: string): void {
    this.search.set(value);
    this.resetPagination();
    this.load();
  }

  onTypeFilter(value: TransactionType | null): void {
    this.typeFilter.set(value);
    this.resetPagination();
    this.load();
  }

  onCategoryFilter(value: number | null): void {
    this.categoryFilter.set(value);
    this.resetPagination();
    this.load();
  }

  onSort(value: string): void {
    this.sortBy.set(value);
    this.resetPagination();
    this.load();
  }

  onFromDate(value: Date | null): void {
    this.fromDate.set(value);
    this.resetPagination();
    this.load();
  }

  onToDate(value: Date | null): void {
    this.toDate.set(value);
    this.resetPagination();
    this.load();
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set(null);
    this.categoryFilter.set(null);
    this.fromDate.set(null);
    this.toDate.set(null);
    this.resetPagination();
    this.load();
  }

  // ------------------------------------------------------------------ Dialog
  openCreate(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.selectedType.set('RECEITA');
    this.form.reset({
      description: '',
      amount: null,
      type: 'RECEITA',
      categoryId: null,
      date: this.toDateObj(todayIso()),
      notes: '',
    });
    this.dialogOpen.set(true);
  }

  openEdit(transaction: Transaction): void {
    this.editingId.set(transaction.id);
    this.formError.set('');
    this.selectedType.set(transaction.type);
    this.form.reset({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: this.toDateObj(transaction.date),
      notes: transaction.notes ?? '',
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.formError.set('');
  }

  onDialogVisibleChange(value: boolean): void {
    if (!value) {
      this.closeDialog();
    }
  }

  save(): void {
    this.formError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      description: value.description.trim(),
      amount: Number(value.amount ?? 0),
      type: value.type,
      categoryId: Number(value.categoryId),
      date: this.toIso(value.date ?? new Date()),
      notes: value.notes?.trim() ? value.notes.trim() : null,
    };

    const editingId = this.editingId();
    this.saving.set(true);

    const request = editingId
      ? this.api.updateTransaction(editingId, payload)
      : this.api.createTransaction(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.messageService.add({
          severity: 'success',
          summary: editingId ? 'Transação atualizada' : 'Transação registrada',
          detail: payload.description,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(FinanceApi.describeError(error));
      },
    });
  }

  // ------------------------------------------------------------------ Excluir
  askDelete(transaction: Transaction): void {
    this.pendingDelete.set(transaction);
    this.confirmOpen.set(true);
  }

  deleteMessage(): string {
    const transaction = this.pendingDelete();
    return transaction
      ? `A transação "${transaction.description}" será removida permanentemente.`
      : '';
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.pendingDelete.set(null);
  }

  deleteTransaction(): void {
    const transaction = this.pendingDelete();
    if (!transaction) return;

    this.deleting.set(true);
    this.api.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeConfirm();
        this.messageService.add({
          severity: 'success',
          summary: 'Transação excluída',
          detail: transaction.description,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível excluir',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  // ------------------------------------------------------------- Auxiliares
  isInvalid(control: 'description' | 'amount' | 'date' | 'categoryId'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  errorFor(control: 'description' | 'amount' | 'date' | 'categoryId'): string {
    const field = this.form.controls[control];
    if (field.hasError('required')) {
      return control === 'description'
        ? 'Informe a descrição.'
        : control === 'amount'
          ? 'Informe o valor.'
          : control === 'date'
            ? 'Informe a data.'
            : 'Selecione a categoria.';
    }
    if (field.hasError('min')) return 'O valor deve ser maior que zero.';
    if (field.hasError('maxlength')) return 'Texto muito longo.';
    return 'Verifique este campo.';
  }

  money(value: number | null | undefined): string {
    return formatCurrency(value);
  }

  date(value: string): string {
    return formatDate(value);
  }

  signed(transaction: Transaction): string {
    const value = formatCurrency(transaction.amount);
    return transaction.type === 'RECEITA' ? `+ ${value}` : `- ${value}`;
  }

  maxDate(): Date {
    return new Date();
  }

  todayIso(): string {
    return todayIso();
  }

  private toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private toDateObj(iso: string): Date {
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
