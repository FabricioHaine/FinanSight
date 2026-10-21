import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { SessionService } from '../../../core/services/session.service';
import { FinanceApi } from '../../../core/services/finance-api';

@Component({
  selector: 'fs-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    AuthLayout,
  ],
  template: `
    <fs-auth-layout
      headline="Comece a organizar sua vida financeira."
      description="Crie sua conta gratuita e comece a registrar receitas, despesas e metas em poucos minutos."
    >
      <div class="fs-auth__head">
        <h2 class="fs-auth__title">Criar conta</h2>
        <p class="fs-auth__subtitle">Leva menos de um minuto.</p>
      </div>

      @if (errorMessage()) {
        <p class="fs-alert" role="alert">
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          <span>{{ errorMessage() }}</span>
        </p>
      }

      <form class="fs-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="fs-field">
          <label class="fs-field__label" for="name">Nome</label>
          <input
            pInputText
            id="name"
            type="text"
            formControlName="name"
            autocomplete="name"
            placeholder="Como podemos te chamar?"
          />
          @if (isInvalid('name')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              {{ controlError('name') }}
            </span>
          }
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="email">E-mail</label>
          <input
            pInputText
            id="email"
            type="email"
            formControlName="email"
            autocomplete="email"
            placeholder="você@exemplo.com"
          />
          @if (isInvalid('email')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              {{ controlError('email') }}
            </span>
          }
        </div>

        <div class="fs-field">
          <label class="fs-field__label" for="password">Senha</label>
          <p-password
            inputId="password"
            formControlName="password"
            [feedback]="false"
            [toggleMask]="true"
            autocomplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            styleClass="fs-password"
            [style]="{ width: '100%' }"
          />
          @if (isInvalid('password')) {
            <span class="fs-field__error">
              <i class="pi pi-times-circle" aria-hidden="true"></i>
              {{ controlError('password') }}
            </span>
          }
        </div>

        <p-button
          type="submit"
          label="Criar conta"
          [loading]="loading()"
          [disabled]="loading()"
          styleClass="fs-submit"
        />
      </form>

      <p class="fs-auth__switch">
        Já tem conta?
        <a routerLink="/login">Entrar</a>
      </p>
    </fs-auth-layout>
  `,
  styles: `
    .fs-auth__head {
      margin-bottom: var(--fs-space-5);
    }

    .fs-auth__title {
      font-size: var(--fs-text-xl);
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .fs-auth__subtitle {
      margin-top: 0.25rem;
      font-size: var(--fs-text-sm);
      color: var(--fs-text-muted);
    }

    .fs-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--fs-space-2);
      padding: var(--fs-space-3);
      margin-bottom: var(--fs-space-4);
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

    .fs-form ::ng-deep .p-password,
    .fs-form ::ng-deep .p-password-input {
      width: 100%;
    }

    .fs-auth__switch {
      margin-top: var(--fs-space-5);
      text-align: center;
      font-size: var(--fs-text-sm);
      color: var(--fs-text-muted);
    }

    .fs-auth__switch a {
      font-weight: 600;
    }
  `,
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly api = inject(FinanceApi);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(control: 'name' | 'email' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  controlError(control: 'name' | 'email' | 'password'): string {
    const field = this.form.controls[control];
    if (field.hasError('required')) {
      return control === 'name'
        ? 'Informe seu nome.'
        : control === 'email'
          ? 'Informe seu e-mail.'
          : 'Informe uma senha.';
    }
    if (field.hasError('email')) return 'Informe um e-mail válido.';
    if (field.hasError('minlength')) {
      return control === 'password'
        ? 'A senha deve ter ao menos 6 caracteres.'
        : 'Informe ao menos 2 caracteres.';
    }
    return 'Verifique este campo.';
  }

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.session.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(FinanceApi.describeError(error));
      },
    });
  }
}
