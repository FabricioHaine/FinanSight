import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';
import { FinanceApi } from '../../core/services/finance-api';
import { SessionService } from '../../core/services/session.service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { formatDateTime } from '../../core/utils/format';

@Component({
  selector: 'fs-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    PasswordModule,
    TextareaModule,
    PageHeader,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header title="Configurações" subtitle="Mantenha seus dados e sua conta atualizados." />

      <div class="fs-grid fs-grid--2">
        <section class="fs-card">
          <header class="fs-card__header" style="padding: 0; border: none">
            <div>
              <h3 class="fs-card__title">Perfil</h3>
              <p class="fs-card__subtitle">Informações exibidas no seu painel</p>
            </div>
          </header>

          @if (profileError()) {
            <p class="fs-alert" role="alert">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              <span>{{ profileError() }}</span>
            </p>
          }

          <form class="fs-form" [formGroup]="profileForm" (ngSubmit)="saveProfile()" novalidate>
            <div class="fs-field">
              <label class="fs-field__label" for="nome">Nome</label>
              <input
                pInputText
                id="nome"
                formControlName="name"
                placeholder="Seu nome"
                [class.fs-field--invalid]="profileInvalid('name')"
              />
              @if (profileInvalid('name')) {
                <span class="fs-field__error">
                  <i class="pi pi-times-circle" aria-hidden="true"></i>
                  Informe ao menos 2 caracteres.
                </span>
              }
            </div>

            <div class="fs-field">
              <label class="fs-field__label" for="email">E-mail</label>
              <input
                pInputText
                id="email"
                type="email"
                [value]="session.user()?.email ?? ''"
                readonly
                disabled
              />
              <span class="fs-caption">O e-mail de acesso não pode ser alterado por aqui.</span>
            </div>

            <div class="fs-field">
              <label class="fs-field__label" for="renda">Renda mensal (opcional)</label>
              <p-inputnumber
                inputId="renda"
                formControlName="monthlyIncome"
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                [min]="0"
                [minFractionDigits]="2"
                [maxFractionDigits]="2"
                placeholder="0,00"
                styleClass="fs-input"
              />
            </div>

            <div class="fs-field">
              <label class="fs-field__label" for="meta">Meta de economia (opcional)</label>
              <textarea
                pTextarea
                id="meta"
                formControlName="savingsGoal"
                rows="3"
                placeholder="Ex.: guardar 20% da renda todo mês"
              ></textarea>
            </div>

            <div class="fs-actions">
              <p-button
                type="submit"
                label="Salvar perfil"
                [loading]="savingProfile()"
                [disabled]="savingProfile()"
              />
            </div>
          </form>
        </section>

        <section class="fs-card">
          <header class="fs-card__header" style="padding: 0; border: none">
            <div>
              <h3 class="fs-card__title">Segurança</h3>
              <p class="fs-card__subtitle">Atualize sua senha de acesso</p>
            </div>
          </header>

          @if (passwordError()) {
            <p class="fs-alert" role="alert">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              <span>{{ passwordError() }}</span>
            </p>
          }

          <form class="fs-form" [formGroup]="passwordForm" (ngSubmit)="savePassword()" novalidate>
            <div class="fs-field">
              <label class="fs-field__label" for="senha-atual">Senha atual</label>
              <p-password
                inputId="senha-atual"
                formControlName="currentPassword"
                [feedback]="false"
                [toggleMask]="true"
                autocomplete="current-password"
                placeholder="Sua senha atual"
                styleClass="fs-input"
                [style]="{ width: '100%' }"
              />
              @if (passwordInvalid('currentPassword')) {
                <span class="fs-field__error">
                  <i class="pi pi-times-circle" aria-hidden="true"></i>
                  Informe a senha atual.
                </span>
              }
            </div>

            <div class="fs-field">
              <label class="fs-field__label" for="senha-nova">Nova senha</label>
              <p-password
                inputId="senha-nova"
                formControlName="newPassword"
                [feedback]="false"
                [toggleMask]="true"
                autocomplete="new-password"
                placeholder="Mínimo de 6 caracteres"
                styleClass="fs-input"
                [style]="{ width: '100%' }"
              />
              @if (passwordInvalid('newPassword')) {
                <span class="fs-field__error">
                  <i class="pi pi-times-circle" aria-hidden="true"></i>
                  A nova senha deve ter ao menos 6 caracteres.
                </span>
              }
            </div>

            <div class="fs-actions">
              <p-button
                type="submit"
                label="Alterar senha"
                [loading]="savingPassword()"
                [disabled]="savingPassword()"
              />
            </div>
          </form>

          <footer class="fs-session">
            <span class="fs-label">Conta criada em</span>
            <span class="fs-body">{{ createdAt() }}</span>
            <span class="fs-label">Moeda padrão</span>
            <span class="fs-body">{{ session.user()?.currency }}</span>
          </footer>
        </section>
      </div>
    </div>
  `,
  styles: `
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

    .fs-session {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--fs-space-1) var(--fs-space-4);
      padding-top: var(--fs-space-4);
      border-top: 1px solid var(--fs-border);
    }
  `,
})
export class Settings {
  private readonly api = inject(FinanceApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  readonly session = inject(SessionService);

  readonly savingProfile = signal(false);
  readonly profileError = signal('');
  readonly savingPassword = signal(false);
  readonly passwordError = signal('');

  readonly profileForm = this.formBuilder.nonNullable.group({
    name: [this.session.user()?.name ?? '', [Validators.required, Validators.minLength(2)]],
    monthlyIncome: [this.session.user()?.monthlyIncome ?? null as number | null],
    savingsGoal: [this.session.user()?.savingsGoal ?? ''],
  });

  readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  createdAt(): string {
    return formatDateTime(this.session.user()?.createdAt);
  }

  profileInvalid(control: 'name'): boolean {
    const field = this.profileForm.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  passwordInvalid(control: 'currentPassword' | 'newPassword'): boolean {
    const field = this.passwordForm.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  saveProfile(): void {
    this.profileError.set('');
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    this.savingProfile.set(true);
    this.session
      .updateProfile({
        name: value.name.trim(),
        monthlyIncome: value.monthlyIncome === null ? null : Number(value.monthlyIncome),
        savingsGoal: value.savingsGoal?.trim() ? value.savingsGoal.trim() : null,
      })
      .subscribe({
        next: () => {
          this.savingProfile.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Perfil atualizado',
            detail: 'Suas informações foram salvas.',
          });
        },
        error: (error: unknown) => {
          this.savingProfile.set(false);
          this.profileError.set(FinanceApi.describeError(error));
        },
      });
  }

  savePassword(): void {
    this.passwordError.set('');
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    this.savingPassword.set(true);
    this.api
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordForm.reset({ currentPassword: '', newPassword: '' });
          this.messageService.add({
            severity: 'success',
            summary: 'Senha alterada',
            detail: 'Use a nova senha no próximo acesso.',
          });
        },
        error: (error: unknown) => {
          this.savingPassword.set(false);
          this.passwordError.set(FinanceApi.describeError(error));
        },
      });
  }
}
