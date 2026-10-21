import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FinanceApi } from '../../core/services/finance-api';
import { Category, Report } from '../../core/models/finance.models';
import { formatCurrency, formatDate, formatPercent } from '../../core/utils/format';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { TrendIndicator } from '../../shared/components/trend-indicator/trend-indicator';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { FinanceChart, FinanceChartDataset } from '../../shared/components/finance-chart/finance-chart';
import {
  PeriodRange,
  PeriodSelector,
} from '../../shared/components/period-selector/period-selector';
import { MoneyPipe } from '../../shared/pipes/format.pipes';

const ACCENT = '#6B8EFF';
const ACCENT_SOFT = '#8FB3D9';

const CATEGORY_COLORS = [
  '#6B8EFF',
  '#B8D3F5',
  '#3F5CB8',
  '#8FB3D9',
  '#5578E6',
  '#D3E4FA',
  '#2E4378',
  '#A9C3E4',
];

@Component({
  selector: 'fs-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    SelectModule,
    TableModule,
    PageHeader,
    StatCard,
    TrendIndicator,
    EmptyState,
    FinanceChart,
    PeriodSelector,
    MoneyPipe,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header
        title="Relatórios"
        subtitle="Análise o período escolhido e exporte os dados para o seu controle."
      >
        <p-button
          label="Exportar CSV"
          icon="pi pi-download"
          [outlined]="true"
          [loading]="exporting()"
          (onClick)="exportCsv()"
        />
      </fs-page-header>

      <section class="fs-card fs-filters">
        <div class="fs-toolbar">
          <div class="fs-toolbar__group">
            <fs-period-selector [range]="range()" (rangeChange)="onRangeChange($event)" />
          </div>
          <div class="fs-toolbar__group">
            <p-select
              [options]="categoryOptions()"
              [ngModel]="categoryFilter()"
              (ngModelChange)="onCategoryFilter($event)"
              optionLabel="label"
              optionValue="value"
              placeholder="Todas as categorias"
              [showClear]="true"
              [style]="{ width: '15rem' }"
              ariaLabel="Filtrar por categoria"
            />
          </div>
        </div>
      </section>

      @if (error()) {
        <p class="fs-error" role="alert">
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          <span>{{ error() }}</span>
          <p-button label="Tentar novamente" [text]="true" (onClick)="load()" />
        </p>
      }

      @if (loading() && !report()) {
        <div class="fs-grid fs-grid--stats">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <div class="fs-skeleton" style="height: 132px"></div>
          }
        </div>
      } @else if (report(); as data) {
        <section class="fs-grid fs-grid--stats">
          <fs-stat-card
            label="Receitas do período"
            [value]="money(data.summary.revenues)"
            icon="pi pi-arrow-down-left"
          >
            <fs-trend-indicator
              [variation]="data.comparison.revenuesVariation"
              [availableOverride]="data.summary.comparisonAvailable"
            />
          </fs-stat-card>

          <fs-stat-card
            label="Despesas do período"
            [value]="money(data.summary.expenses)"
            icon="pi pi-arrow-up-right"
          >
            <fs-trend-indicator
              [variation]="data.comparison.expensesVariation"
              [availableOverride]="data.summary.comparisonAvailable"
              [invert]="true"
            />
          </fs-stat-card>

          <fs-stat-card
            label="Saldo do período"
            [value]="money(data.summary.savings)"
            icon="pi pi-chart-line"
            [emphasis]="true"
          >
            <fs-trend-indicator
              [variation]="data.comparison.balanceVariation"
              [availableOverride]="data.summary.comparisonAvailable"
            />
          </fs-stat-card>

          <fs-stat-card
            label="Média mensal de despesas"
            [value]="money(data.averageMonthlyExpenses)"
            icon="pi pi-clock"
          />
        </section>

        <section class="fs-grid fs-grid--wide">
          <article class="fs-card fs-card--flush">
            <header class="fs-card__header">
              <div>
                <h3 class="fs-card__title">Evolução mensal</h3>
                <p class="fs-card__subtitle">{{ periodLabel() }}</p>
              </div>
            </header>
            <div class="fs-card__body">
              <fs-finance-chart
                type="bar"
                [labels]="evolutionLabels()"
                [datasets]="evolutionDatasets()"
                [height]="300"
                ariaLabel="Gráfico de evolução mensal de receitas e despesas"
              />
            </div>
          </article>

          <article class="fs-card fs-card--flush">
            <header class="fs-card__header">
              <div>
                <h3 class="fs-card__title">Distribuição por categoria</h3>
                <p class="fs-card__subtitle">Percentual das despesas</p>
              </div>
            </header>
            <div class="fs-card__body">
              @if (data.categoryDistribution.length === 0) {
                <fs-empty-state
                  title="Sem despesas no período"
                  message="Não ha despesas registradas para o filtro selecionado."
                  icon="pi pi-chart-pie"
                />
              } @else {
                <fs-finance-chart
                  type="doughnut"
                  [labels]="distributionLabels()"
                  [datasets]="distributionDatasets()"
                  [palette]="categoryColors"
                  [legendItems]="distributionLegend()"
                  [height]="260"
                  ariaLabel="Gráfico de distribuição de despesas por categoria"
                />
              }
            </div>
          </article>
        </section>

        <section class="fs-grid fs-grid--wide">
          <article class="fs-card fs-card--flush">
            <header class="fs-card__header">
              <div>
                <h3 class="fs-card__title">Comparação entre períodos</h3>
                <p class="fs-card__subtitle">Período atual contra o período anterior</p>
              </div>
            </header>
            <p-table [value]="comparisonRows()" styleClass="fs-table">
              <ng-template #header>
                <tr>
                  <th>Indicador</th>
                  <th class="fs-table__right">Período atual</th>
                  <th class="fs-table__right">Período anterior</th>
                  <th class="fs-table__right">Variacao</th>
                </tr>
              </ng-template>
              <ng-template #body let-row>
                <tr>
                  <td class="fs-strong">{{ row.label }}</td>
                  <td class="fs-table__right fs-numeric">{{ row.current | money }}</td>
                  <td class="fs-table__right fs-numeric fs-muted">{{ row.previous | money }}</td>
                  <td
                    class="fs-table__right fs-numeric"
                    [class.fs-positive]="row.variation !== null && row.variation > 0"
                    [class.fs-negative]="row.variation !== null && row.variation < 0"
                  >
                    {{ variationLabel(row.variation) }}
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </article>

          <article class="fs-card fs-card--flush">
            <header class="fs-card__header">
              <div>
                <h3 class="fs-card__title">Maiores gastos por categoria</h3>
                <p class="fs-card__subtitle">Ranking do período</p>
              </div>
            </header>
            @if (data.categoryDistribution.length === 0) {
              <fs-empty-state
                title="Sem dados para exibir"
                message="Nenhuma despesa registrada no período selecionado."
                icon="pi pi-list"
              />
            } @else {
              <p-table [value]="data.categoryDistribution" styleClass="fs-table">
                <ng-template #header>
                  <tr>
                    <th>Categoria</th>
                    <th class="fs-table__right">Total</th>
                    <th class="fs-table__right">%</th>
                  </tr>
                </ng-template>
                <ng-template #body let-slice>
                  <tr>
                    <td class="fs-strong">
                      <span class="fs-cat">
                        <span class="fs-cat__marker" aria-hidden="true"></span>
                        {{ slice.categoryName }}
                      </span>
                    </td>
                    <td class="fs-table__right fs-numeric">{{ slice.amount | money }}</td>
                    <td class="fs-table__right fs-numeric fs-muted">{{ percent(slice.percent) }}</td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </article>
        </section>
      }
    </div>
  `,
  styles: `
    .fs-filters {
      padding: var(--fs-space-4);
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

    .fs-table__right {
      text-align: right;
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
      background: var(--fs-accent);
      flex: 0 0 auto;
    }
  `,
})
export class Reports {
  private readonly api = inject(FinanceApi);
  private readonly messageService = inject(MessageService);

  readonly categoryColors = CATEGORY_COLORS;

  readonly report = signal<Report | null>(null);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly exporting = signal(false);

  readonly range = signal<PeriodRange>({ from: '', to: '' });
  readonly categoryFilter = signal<number | null>(null);

  readonly categoryOptions = computed(() =>
    this.categories().map((category) => ({ label: category.name, value: category.id })),
  );

  readonly evolutionLabels = computed(() =>
    (this.report()?.monthlyEvolution ?? []).map((point) => point.label),
  );

  readonly evolutionDatasets = computed<FinanceChartDataset[]>(() => {
    const evolution = this.report()?.monthlyEvolution ?? [];
    return [
      { label: 'Receitas', data: evolution.map((point) => point.revenues), color: ACCENT },
      { label: 'Despesas', data: evolution.map((point) => point.expenses), color: ACCENT_SOFT },
    ];
  });

  readonly distributionLabels = computed(() =>
    (this.report()?.categoryDistribution ?? []).map((slice) => slice.categoryName),
  );

  readonly distributionDatasets = computed<FinanceChartDataset[]>(() => [
    {
      label: 'Despesas',
      data: (this.report()?.categoryDistribution ?? []).map((slice) => slice.amount),
      color: ACCENT,
    },
  ]);

  readonly distributionLegend = computed(() =>
    (this.report()?.categoryDistribution ?? []).map((slice, index) => ({
      label: slice.categoryName,
      value: formatCurrency(slice.amount),
      percent: Number(slice.percent.toFixed(1)),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })),
  );

  readonly comparisonRows = computed(() => {
    const data = this.report();
    if (!data) return [];
    return [
      {
        label: 'Receitas',
        current: data.comparison.currentRevenues,
        previous: data.comparison.previousRevenues,
        variation: data.comparison.revenuesVariation,
      },
      {
        label: 'Despesas',
        current: data.comparison.currentExpenses,
        previous: data.comparison.previousExpenses,
        variation: data.comparison.expensesVariation,
      },
      {
        label: 'Saldo',
        current: data.comparison.currentBalance,
        previous: data.comparison.previousBalance,
        variation: data.comparison.balanceVariation,
      },
    ];
  });

  readonly periodLabel = computed(() => {
    const current = this.range();
    if (!current.from || !current.to) return 'Período selecionado';
    return `${formatDate(current.from)} até ${formatDate(current.to)}`;
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
    const current = this.range();
    this.api.report(current.from || null, current.to || null, this.categoryFilter()).subscribe({
      next: (report) => {
        this.report.set(report);
        this.range.set({ from: report.from, to: report.to });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(FinanceApi.describeError(error));
        this.loading.set(false);
      },
    });
  }

  onRangeChange(range: PeriodRange): void {
    this.range.set(range);
    this.load();
  }

  onCategoryFilter(value: number | null): void {
    this.categoryFilter.set(value);
    this.load();
  }

  exportCsv(): void {
    const current = this.range();
    if (!current.from || !current.to) return;

    this.exporting.set(true);
    this.api.exportCsv(current.from, current.to, this.categoryFilter()).subscribe({
      next: (blob) => {
        this.exporting.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finansight-transações-${current.from}-a-${current.to}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'success',
          summary: 'Exportacao concluída',
          detail: 'Arquivo CSV gerado com os dados do período.',
        });
      },
      error: (error: unknown) => {
        this.exporting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível exportar',
          detail: FinanceApi.describeError(error),
        });
      },
    });
  }

  money(value: number | null | undefined): string {
    return formatCurrency(value);
  }

  percent(value: number | null | undefined): string {
    return formatPercent(value);
  }

  variationLabel(value: number | null): string {
    if (value === null || value === undefined) return '--';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1).replace('.', ',')}%`;
  }
}
