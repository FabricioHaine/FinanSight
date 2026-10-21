import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { addDaysIso, monthStartIso, todayIso } from '../../../core/utils/format';

export type PeriodPreset = 'month' | 'quarter' | 'semester' | 'year' | 'custom';

export interface PeriodRange {
  from: string;
  to: string;
}

interface PresetOption {
  id: PeriodPreset;
  label: string;
  range: () => PeriodRange;
}

/**
 * Seletor de período compartilhado entre dashboard, relatórios e transações.
 * O período selecionado e a base de todos os calculos financeiros exibidos.
 */
@Component({
  selector: 'fs-period-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePickerModule, FormsModule],
  template: `
    <div class="fs-period">
      <div class="fs-period__presets" role="group" aria-label="Selecionar período">
        @for (option of options; track option.id) {
          <button
            type="button"
            class="fs-period__preset"
            [class.fs-period__preset--active]="active() === option.id"
            [attr.aria-pressed]="active() === option.id"
            (click)="select(option)"
          >
            {{ option.label }}
          </button>
        }
      </div>

      @if (active() === 'custom') {
        <p-datepicker
          selectionMode="range"
          [ngModel]="rangeDates()"
          (ngModelChange)="onRangeChange($event)"
          [readonlyInput]="true"
          [showIcon]="true"
          iconDisplay="input"
          appendTo="body"
          dateFormat="dd/mm/yy"
          placeholder="Intervalo"
          [style]="{ width: '15rem' }"
        />
      }
    </div>
  `,
  styles: `
    .fs-period {
      display: flex;
      align-items: center;
      gap: var(--fs-space-2);
      flex-wrap: wrap;
    }

    .fs-period__presets {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 3px;
      background: var(--fs-bg-secondary);
      border: 1px solid var(--fs-border);
      border-radius: var(--fs-radius-md);
      max-width: 100%;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .fs-period__presets::-webkit-scrollbar {
      display: none;
    }

    .fs-period__preset {
      appearance: none;
      border: none;
      background: transparent;
      color: var(--fs-text-muted);
      font-size: var(--fs-text-sm);
      font-weight: 500;
      padding: 0.375rem 0.75rem;
      border-radius: var(--fs-radius-sm);
      cursor: pointer;
      transition: background var(--fs-transition-fast), color var(--fs-transition-fast);
      white-space: nowrap;
    }

    .fs-period__preset:hover {
      color: var(--fs-text-primary);
      background: var(--fs-surface-elevated);
    }

    .fs-period__preset--active {
      background: var(--fs-surface-selected);
      color: var(--fs-text-primary);
    }

    .fs-period__preset--active:hover {
      background: var(--fs-surface-selected);
    }
  `,
})
export class PeriodSelector {
  readonly range = model<PeriodRange>({ from: monthStartIso(), to: todayIso() });
  readonly active = signal<PeriodPreset>('month');
  readonly rangeDates = signal<Date[] | null>(null);

  readonly options: PresetOption[] = [
    { id: 'month', label: 'Este mês', range: () => ({ from: monthStartIso(), to: todayIso() }) },
    {
      id: 'quarter',
      label: '3 meses',
      range: () => ({ from: addDaysIso(monthStartIso(), -60), to: todayIso() }),
    },
    {
      id: 'semester',
      label: '6 meses',
      range: () => ({ from: addDaysIso(monthStartIso(), -152), to: todayIso() }),
    },
    {
      id: 'year',
      label: '12 meses',
      range: () => ({ from: addDaysIso(monthStartIso(), -334), to: todayIso() }),
    },
    { id: 'custom', label: 'Personalizado', range: () => ({ from: monthStartIso(), to: todayIso() }) },
  ];

  select(option: PresetOption): void {
    this.active.set(option.id);
    if (option.id === 'custom') {
      this.rangeDates.set([this.fromIso(this.range().from), this.fromIso(this.range().to)]);
      return;
    }
    this.range.set(option.range());
  }

  onRangeChange(value: Date[] | null): void {
    if (!value || value.length !== 2 || !value[0] || !value[1]) {
      return;
    }
    this.rangeDates.set(value);
    this.range.set({ from: this.toIso(value[0]), to: this.toIso(value[1]) });
  }

  private toIso(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private fromIso(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
