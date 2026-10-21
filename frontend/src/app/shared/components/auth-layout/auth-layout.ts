import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BrandLogo } from '../brand-logo/brand-logo';

/**
 * Composicao das telas de acesso. painsel esquerdo carrega a marca e a
 * assinatura; o painel direito recebe o formulario.
 */
@Component({
  selector: 'fs-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BrandLogo],
  template: `
    <div class="fs-auth">
      <section class="fs-auth__brand" aria-hidden="false">
        <div class="fs-auth__brand-top">
          <fs-brand-logo />
        </div>

        <div class="fs-auth__message">
          <h1 class="fs-auth__headline">{{ headline() }}</h1>
          <p class="fs-auth__description">{{ description() }}</p>
        </div>

        <div class="fs-auth__visual" aria-hidden="true">
          <svg viewBox="0 0 520 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fsAuthArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#6B8EFF" stop-opacity="0.28" />
                <stop offset="1" stop-color="#6B8EFF" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="fsAuthLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#8FB3D9" />
                <stop offset="1" stop-color="#6B8EFF" />
              </linearGradient>
            </defs>
            <g stroke="#20314A" stroke-width="1" opacity="0.7">
              <line x1="0" y1="50" x2="520" y2="50" />
              <line x1="0" y1="100" x2="520" y2="100" />
              <line x1="0" y1="150" x2="520" y2="150" />
            </g>
            <path
              d="M0 150 L70 132 L140 142 L210 104 L280 118 L350 66 L420 82 L520 26 L520 200 L0 200 Z"
              fill="url(#fsAuthArea)"
            />
            <path
              d="M0 150 L70 132 L140 142 L210 104 L280 118 L350 66 L420 82 L520 26"
              fill="none"
              stroke="url(#fsAuthLine)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="520" cy="26" r="4" fill="#6B8EFF" />
          </svg>
        </div>

        <p class="fs-auth__signature">{{ signature() }}</p>
      </section>

      <section class="fs-auth__panel">
        <div class="fs-auth__card">
          <ng-content />
        </div>
        <p class="fs-auth__legal">
          FinanSight organiza seus dados financeiros em um ambiente seguro. Senhas nunca são
          armazenadas em texto puro.
        </p>
      </section>
    </div>
  `,
  styles: `
    .fs-auth {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
      min-height: 100vh;
      background: var(--fs-bg-primary);
    }

    .fs-auth__brand {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--fs-space-6);
      padding: var(--fs-space-7) var(--fs-space-8);
      background:
        radial-gradient(120% 90% at 15% 0%, rgba(107, 142, 255, 0.12), transparent 58%),
        linear-gradient(180deg, var(--fs-bg-secondary), var(--fs-bg-primary));
      border-right: 1px solid var(--fs-border);
      overflow: hidden;
    }

    .fs-auth__brand::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(32, 49, 74, 0.35) 1px, transparent 1px),
        linear-gradient(90deg, rgba(32, 49, 74, 0.35) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(80% 60% at 50% 40%, rgba(0, 0, 0, 0.85), transparent 78%);
      pointer-events: none;
    }

    .fs-auth__brand > * {
      position: relative;
      z-index: 1;
    }

    .fs-auth__headline {
      font-size: clamp(1.75rem, 3.2vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
      max-width: 20ch;
    }

    .fs-auth__description {
      margin-top: var(--fs-space-3);
      font-size: var(--fs-text-md);
      color: var(--fs-text-secondary);
      max-width: 46ch;
    }

    .fs-auth__visual {
      margin-top: auto;
    }

    .fs-auth__visual svg {
      width: 100%;
      height: auto;
      display: block;
    }

    .fs-auth__signature {
      font-size: var(--fs-text-base);
      color: var(--fs-accent-soft);
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .fs-auth__panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--fs-space-4);
      padding: var(--fs-space-7) var(--fs-space-5);
    }

    .fs-auth__card {
      width: 100%;
      max-width: 24rem;
      background: var(--fs-surface);
      border: 1px solid var(--fs-border);
      border-radius: var(--fs-radius-lg);
      box-shadow: var(--fs-shadow-card);
      padding: var(--fs-space-6);
    }

    .fs-auth__legal {
      max-width: 24rem;
      text-align: center;
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
      line-height: 1.6;
    }

    @media (max-width: 900px) {
      .fs-auth {
        grid-template-columns: minmax(0, 1fr);
      }

      .fs-auth__brand {
        border-right: none;
        border-bottom: 1px solid var(--fs-border);
        padding: var(--fs-space-5);
        gap: var(--fs-space-4);
      }

      .fs-auth__visual {
        display: none;
      }

      .fs-auth__headline {
        font-size: 1.5rem;
      }

      .fs-auth__panel {
        padding: var(--fs-space-5) var(--fs-space-4) var(--fs-space-7);
      }

      .fs-auth__card {
        padding: var(--fs-space-5);
      }
    }
  `,
})
export class AuthLayout {
  readonly headline = input.required<string>();
  readonly description = input.required<string>();
  readonly signature = input('Seu futuro financeiro em boas mãos.');
}
