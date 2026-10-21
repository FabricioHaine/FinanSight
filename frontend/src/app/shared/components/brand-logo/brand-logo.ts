import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Marca do FinanSight: simbolo vetorial (lente + tendencia) e wordmark.
 * Funciona isolado (menu, favicon, carregamento) ou ao lado do nome.
 */
@Component({
  selector: 'fs-brand-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="fs-brand" [class.fs-brand--compact]="compact()">
      <svg
        class="fs-brand__mark"
        viewBox="0 0 48 48"
        role="img"
        [attr.aria-label]="label()"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fsMarkStroke" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8FB3D9" />
            <stop offset="1" stop-color="#6B8EFF" />
          </linearGradient>
        </defs>
        <path
          d="M39.41 16.82A17 17 0 1 1 26.95 7.26"
          fill="none"
          stroke="url(#fsMarkStroke)"
          stroke-width="2.4"
          stroke-linecap="round"
          opacity="0.55"
        />
        <path
          d="M11.5 31.5 18.2 24.6 23.6 28.6 34.8 15.2"
          fill="none"
          stroke="url(#fsMarkStroke)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="34.8" cy="15.2" r="3.4" fill="#6B8EFF" />
        <circle cx="34.8" cy="15.2" r="6.4" fill="#6B8EFF" opacity="0.18" />
      </svg>
      @if (!compact()) {
        <span class="fs-brand__name">Finan<em>Sight</em></span>
      }
    </span>
  `,
  styles: `
    .fs-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      min-width: 0;
    }

    .fs-brand__mark {
      width: 30px;
      height: 30px;
      flex: 0 0 auto;
      filter: drop-shadow(0 2px 6px rgba(107, 142, 255, 0.25));
    }

    .fs-brand--compact .fs-brand__mark {
      width: 26px;
      height: 26px;
    }

    .fs-brand__name {
      font-size: 1.0625rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--fs-text-primary);
      white-space: nowrap;
    }

    .fs-brand__name em {
      font-style: normal;
      color: var(--fs-accent-soft);
    }
  `,
})
export class BrandLogo {
  readonly compact = input(false);
  readonly label = input('FinanSight');
}
