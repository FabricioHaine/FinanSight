import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthLayout } from '../../../shared/components/auth-layout/auth-layout';
import { SessionService } from '../../../core/services/session.service';
import { FinanceApi } from '../../../core/services/finance-api';

@Component({
  selector: 'fs-login',
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
      headline="Transforme seus dados em decisões."
      description="Acompanhe receitas, despesas, orçamentos e metas em um único painel construído para clareza."
    >
      <div class="fs-auth__head">
        <h2 class="fs-auth__title">Entrar na sua conta</h2>
        <p class="fs-auth__subtitle">Use o e-mail cadastrado para continuar.</p>
      </div>

      @if (errorMessage()) {
        <p class="fs-alert" role="alert">
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          <span>{{ errorMessage() }}</span>
        </p>
      }

      <form class="fs-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="fs-field">
          <label class="fs-field__label" for="email">E-mail</label>
          <input
            pInputText
            id="email"
            type="email"
            formControlName="email"
            autocomplete="email"
            placeholder="você@exemplo.com"
            [class.fs-field--invalid]="isInvalid('email')"
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
            autocomplete="current-password"
            placeholder="Sua senha"
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
          label="Entrar"
          [loading]="loading()"
          [disabled]="loading()"
          styleClass="fs-submit"
        />
      </form>

      <p class="fs-auth__switch">
        Ainda não tem conta?
        <a routerLink="/register">Criar conta</a>
      </p>

      <div class="fs-auth__demo">
        <span class="fs-auth__demo-label">Conta de demonstração</span>
        <code>demo&#64;finansight.app</code>
        <span class="fs-muted">/</span>
        <code>demo1234</code>
      </div>
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

    .fs-auth__demo {
      margin-top: var(--fs-space-4);
      padding: var(--fs-space-3);
      border-radius: var(--fs-radius-md);
      border: 1px dashed var(--fs-border-strong);
      background: var(--fs-bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: var(--fs-space-2);
      font-size: var(--fs-text-xs);
    }

    .fs-auth__demo-label {
      color: var(--fs-text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .fs-auth__demo code {
      color: var(--fs-accent-light);
      font-family: var(--fs-font-mono);
      font-size: var(--fs-text-xs);
    }
  `,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(FinanceApi);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(control: 'email' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  controlError(control: 'email' | 'password'): string {
    const field = this.form.controls[control];
    if (field.hasError('required')) {
      return control === 'email' ? 'Informe seu e-mail.' : 'Informe sua senha.';
    }
    if (field.hasError('email')) return 'Informe um e-mail válido.';
    if (field.hasError('minlength')) return 'A senha deve ter ao menos 6 caracteres.';
    return 'Verifique este campo.';
  }

  submit(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.session.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        void this.router.navigateByUrl(redirect && redirect.startsWith('/') ? redirect : '/dashboard');
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(FinanceApi.describeError(error));
      },
    });
  }
}
