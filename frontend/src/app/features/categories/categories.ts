import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { FinanceApi } from '../../core/services/finance-api';
import { Category, CategoryType } from '../../core/models/finance.models';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'fs-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectButtonModule,
    TableModule,
    TextareaModule,
    TooltipModule,
    ProgressSpinnerModule,
    PageHeader,
    EmptyState,
    ConfirmDialog,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header
        title="Categorias"
        subtitle="Organize receitas e despesas em categorias propias."
      >
        <p-button label="Nova categoria" icon="pi pi-plus" (onClick)="openCreate()" />
      </fs-page-header>

      <section class="fs-toolbar">
        <div class="fs-toolbar__group">
          <p-selectbutton
            [options]="filterOptions"
            [ngModel]="typeFilter()"
            (ngModelChange)="typeFilter.set($event)"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            styleClass="fs-type-toggle"
          />
        </div>
        <span class="fs-caption">{{ filtered().length }} categoria(s)</span>
      </section>

      <section class="fs-card fs-card--flush">
        @if (loading()) {
          <div class="fs-loading">
            <p-progress-spinner strokeWidth="3" [style]="{ width: '2.25rem', height: '2.25rem' }" />
            <span>Carregando categorias...</span>
          </div>
        } @else if (filtered().length === 0) {
          <fs-empty-state
            title="Nenhuma categoria cadastrada"
            message="Crie categorias para organizar seus lançamentos e orçamentos."
            icon="pi pi-tags"
          >
            <p-button label="Nova categoria" icon="pi pi-plus" (onClick)="openCreate()" />
          </fs-empty-state>
        } @else {
          <p-table [value]="filtered()" styleClass="fs-table">
            <ng-template #header>
              <tr>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th class="fs-table__right">Lançamentos</th>
                <th>Status</th>
                <th class="fs-table__actions" aria-label="Ações"></th>
              </tr>
            </ng-template>

            <ng-template #body let-category>
              <tr>
                <td class="fs-strong">
                  <span class="fs-cat">
                    <span
                      class="fs-cat__marker"
                      [class.fs-cat__marker--revenue]="category.type === 'RECEITA'"
                      aria-hidden="true"
                    ></span>
                    {{ category.name }}
                  </span>
                </td>
                <td>
                  <span
                    class="fs-type"
                    [class.fs-type--revenue]="category.type === 'RECEITA'"
                    [class.fs-type--expense]="category.type === 'DESPESA'"
                  >
                    {{ category.type === 'RECEITA' ? 'Receita' : 'Despesa' }}
                  </span>
                </td>
                <td class="fs-muted">{{ category.description || '--' }}</td>
                <td class="fs-table__right fs-numeric">{{ category.transactionCount }}</td>
                <td>
                  <span class="fs-status" [class.fs-status--inactive]="!category.active">
                    {{ category.active ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
                <td class="fs-table__actions">
                  <button
                    type="button"
                    class="fs-icon-btn"
                    (click)="toggleActive(category)"
                    [attr.aria-label]="(category.active ? 'Desativar ' : 'Ativar ') + category.name"
                    [pTooltip]="category.active ? 'Desativar' : 'Ativar'"
                    tooltipPosition="top"
                  >
                    <i
                      class="pi"
                      [class.pi-eye]="category.active"
                      [class.pi-eye-slash]="!category.active"
                      aria-hidden="true"
                    ></i>
                  </button>
                  <button
                    type="button"
                    class="fs-icon-btn"
                    (click)="openEdit(category)"
                    [attr.aria-label]="'Editar ' + category.name"
                    pTooltip="Editar"
                    tooltipPosition="top"
                  >
                    <i class="pi pi-pencil" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    class="fs-icon-btn fs-icon-btn--danger"
                    (click)="askDelete(category)"
                    [attr.aria-label]="'Excluir ' + category.name"
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
      [style]="{ width: '30rem', 'max-width': 'calc(100vw - 2rem)' }"
      [header]="editingId() === null ? 'Nova categoria' : 'Editar categoria'"
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
          />
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="nome">Nome</label>
          <input
            pInputText
            id="nome"
            formControlName="name"
            placeholder="Ex.: Alimentação"
            [class.fs-field--invalid]="isInvalid('name')"
          />
          @if (isInvalid('name')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              {{ errorFor('name') }}
            </span>
          }
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="descricao">Descrição (opcional)</label>
          <textarea
            pTextarea
            id="descricao"
            formControlName="description"
            rows="3"
            placeholder="Para que serve esta categoria"
          ></textarea>
        </div>

        <div class="fs-field">
          <span class="fs-field__label">Estado</span>
          <p-selectbutton
            formControlName="active"
            [options]="activeOptions"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            styleClass="fs-type-toggle"
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
            (onClick)="closeDialog()"
          />
          <p-button
            type="submit"
            [label]="editingId() === null ? 'Criar categoria' : 'Salvar alterações'"
            [loading]="saving()"
            [disabled]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <fs-confirm-dialog
      [visible]="confirmOpen()"
      title="Excluir categoria"
      [message]="deleteMessage()"
      confirmLabel="Excluir"
      [busy]="deleting()"
      (confirm)="deleteCategory()"
      (cancel)="closeConfirm()"
    />
  `,
  styles: `
    .fs-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--fs-space-3);
      padding: var(--fs-space-7);
      color: var(--fs-text-muted);
      font-size: var(--fs-text-sm);
    }

    .fs-cat {
      display: inline-flex;
      align-items: center;
      gap: var(--fs-space-2);
    }

    .fs-cat__marker {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: var(--fs-danger);
      flex: 0 0 auto;
    }

    .fs-cat__marker--revenue {
      background: var(--fs-success);
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

    .fs-status {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--fs-radius-pill);
      background: var(--fs-success-muted);
      color: var(--fs-success);
      font-size: var(--fs-text-xs);
      font-weight: 600;
    }

    .fs-status--inactive {
      background: var(--fs-surface-elevated);
      color: var(--fs-text-muted);
    }

    .fs-table__right {
      text-align: right;
    }

    .fs-table__actions {
      width: 8rem;
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

    .fs-form {
      display: flex;
      flex-direction: column;
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
export class Categories {
  private readonly api = inject(FinanceApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly typeFilter = signal<CategoryType | 'TODAS'>('TODAS');

  readonly dialogOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal('');

  readonly confirmOpen = signal(false);
  readonly pendingDelete = signal<Category | null>(null);
  readonly deleting = signal(false);

  readonly typeOptions = [
    { label: 'Receita', value: 'RECEITA' as CategoryType },
    { label: 'Despesa', value: 'DESPESA' as CategoryType },
  ];

  readonly activeOptions = [
    { label: 'Ativa', value: true },
    { label: 'Inativa', value: false },
  ];

  readonly filterOptions = [
    { label: 'Todas', value: 'TODAS' as const },
    { label: 'Receitas', value: 'RECEITA' as CategoryType },
    { label: 'Despesas', value: 'DESPESA' as CategoryType },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    type: ['DESPESA' as CategoryType, Validators.required],
    description: ['', [Validators.maxLength(240)]],
    active: [true, Validators.required],
  });

  readonly filtered = computed(() => {
    const filter = this.typeFilter();
    const categories = this.categories();
    return filter === 'TODAS' ? categories : categories.filter((category) => category.type === filter);
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listCategories(false).subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível carregar as categorias',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.form.reset({ name: '', type: 'DESPESA', description: '', active: true });
    this.dialogOpen.set(true);
  }

  openEdit(category: Category): void {
    this.editingId.set(category.id);
    this.formError.set('');
    this.form.reset({
      name: category.name,
      type: category.type,
      description: category.description ?? '',
      active: category.active,
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
      type: value.type,
      description: value.description?.trim() ? value.description.trim() : null,
      active: value.active,
    };

    const editingId = this.editingId();
    this.saving.set(true);

    const request = editingId
      ? this.api.updateCategory(editingId, payload)
      : this.api.createCategory(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.messageService.add({
          severity: 'success',
          summary: editingId ? 'Categoria atualizada' : 'Categoria criada',
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

  toggleActive(category: Category): void {
    this.api
      .updateCategory(category.id, {
        name: category.name,
        type: category.type,
        description: category.description,
        active: !category.active,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: category.active ? 'Categoria desativada' : 'Categoria ativada',
            detail: category.name,
          });
          this.load();
        },
        error: (error: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Não foi possível atualizar a categoria',
            detail: FinanceApi.describeError(error),
          });
        },
      });
  }

  askDelete(category: Category): void {
    this.pendingDelete.set(category);
    this.confirmOpen.set(true);
  }

  deleteMessage(): string {
    const category = this.pendingDelete();
    return category ? `A categoria "${category.name}" será removida permanentemente.` : '';
  }

  closeConfirm(): void {
    this.confirmOpen.set(false);
    this.pendingDelete.set(null);
  }

  deleteCategory(): void {
    const category = this.pendingDelete();
    if (!category) return;

    this.deleting.set(true);
    this.api.deleteCategory(category.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeConfirm();
        this.messageService.add({
          severity: 'success',
          summary: 'Categoria excluída',
          detail: category.name,
        });
        this.load();
      },
      error: (error: unknown) => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível excluir a categoria',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  isInvalid(control: 'name'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  errorFor(control: 'name'): string {
    const field = this.form.controls[control];
    if (field.hasError('required')) return 'Informe o nome da categoria.';
    if (field.hasError('maxlength')) return 'O nome deve ter no maximo 80 caracteres.';
    return 'Verifique este campo.';
  }
}
