import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FinanceApi } from '../../core/services/finance-api';
import { SessionService } from '../../core/services/session.service';
import { DashboardData, Goal, Budget, Transaction } from '../../core/models/finance.models';
import { formatCurrency, formatDate, formatPercent } from '../../core/utils/format';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { TrendIndicator } from '../../shared/components/trend-indicator/trend-indicator';
import { ProgressMeter, ProgressTone } from '../../shared/components/progress-meter/progress-meter';
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
  selector: 'fs-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    TableModule,
    TooltipModule,
    PageHeader,
    StatCard,
    TrendIndicator,
    ProgressMeter,
    EmptyState,
    FinanceChart,
    PeriodSelector,
    MoneyPipe,
  ],
  template: `
    <div class="fs-page">
      <fs-page-header [title]="greeting()" subtitle="Aqui esta um resumo da sua vida financeira.">
        <fs-period-selector [range]="range()" (rangeChange)="onRangeChange($event)" />
      </fs-page-header>

      @if (error()) {
        <p class="fs-error" role="alert">
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          <span>{{ error() }}</span>
          <p-button label="Tentar novamente" [text]="true" (onClick)="load()" />
        </p>
      }

      @if (loading() && !data()) {
        <div class="fs-grid fs-grid--stats">
          @for (placeholder of [1, 2, 3, 4]; track placeholder) {
            <div class="fs-skeleton" style="height: 132px"></div>
          }
        </div>
      } @else if (data(); as board) {
        <section class="fs-grid fs-grid--stats" aria-label="Indicadores do período">
          <fs-stat-card
            label="Saldo atual"
            [value]="money(board.summary.balance)"
            icon="pi pi-wallet"
            [emphasis]="true"
          >
            <fs-trend-indicator
              [variation]="board.summary.balanceVariation"
              [availableOverride]="board.summary.comparisonAvailable"
            />
          </fs-stat-card>

          <fs-stat-card
            label="Receitas do período"
            [value]="money(board.summary.revenues)"
            icon="pi pi-arrow-down-left"
          >
            <fs-trend-indicator
              [variation]="board.summary.revenuesVariation"
              [availableOverride]="board.summary.comparisonAvailable"
            />
          </fs-stat-card>

          <fs-stat-card
            label="Despesas do período"
            [value]="money(board.summary.expenses)"
            icon="pi pi-arrow-up-right"
          >
            <fs-trend-indicator
              [variation]="board.summary.expensesVariation"
              [availableOverride]="board.summary.comparisonAvailable"
              [invert]="true"
            />
          </fs-stat-card>

          <fs-stat-card
            label="Economia do período"
            [value]="money(board.summary.savings)"
            icon="pi pi-chart-line"
          >
            <fs-trend-indicator
              [variation]="board.summary.savingsVariation"
              [availableOverride]="board.summary.comparisonAvailable"
            />
          </fs-stat-card>
        </section>

        <section class="fs-grid fs-grid--wide">
          <article class="fs-card fs-card--flush">
            <header class="fs-card__header">
              <div>
                <h3 class="fs-card__title">Evolução de receitas e despesas</h3>
                <p class="fs-card__subtitle">{{ periodLabel() }}</p>
              </div>
            </header>
            <div class="fs-card__body">
              <fs-finance-chart
                type="line"
                [labels]="cashflowLabels()"
                [datasets]="cashflowDatasets()"
                [height]="280"
                ariaLabel="Gráfico de evolução de receitas e despesas"
              />
            </div>
          </article>

          <article class="fs-card fs-card--flush">
            <header class="fs-card__header">
              <div>
                <h3 class="fs-card__title">Despesas por categoria</h3>
                <p class="fs-card__subtitle">Distribuição do período</p>
              </div>
            </header>
            <div class="fs-card__body">
              @if (distribution().length === 0) {
                <fs-empty-state
                  title="Nenhuma despesa no período"
                  message="Registre despesas para visualizar a distribuição por categoria."
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
                <h3 class="fs-card__title">Transações recentes</h3>
                <p class="fs-card__subtitle">Últimos lançamentos registrados</p>
              </div>
              <a
                pButton
                routerLink="/transactions"
                [text]="true"
                icon="pi pi-arrow-right"
                iconPos="right"
                label="Ver todas"
              ></a>
            </header>

            @if (recentTransactions().length === 0) {
              <fs-empty-state
                title="Nenhuma transação registrada"
                message="Adicione sua primeira receita ou despesa para começar a acompanhar seu saldo."
                icon="pi pi-wallet"
              >
                <a pButton routerLink="/transactions" icon="pi pi-plus" label="Nova transação"></a>
              </fs-empty-state>
            } @else {
              <p-table [value]="recentTransactions()" [rows]="recentTransactions().length" styleClass="fs-table">
                <ng-template #header>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th class="fs-table__right">Valor</th>
                  </tr>
                </ng-template>
                <ng-template #body let-transaction>
                  <tr>
                    <td class="fs-numeric fs-muted">{{ date(transaction.date) }}</td>
                    <td class="fs-strong">{{ transaction.description }}</td>
                    <td>
                      <span class="fs-chip">{{ transaction.categoryName }}</span>
                    </td>
                    <td
                      class="fs-table__right fs-numeric fs-strong"
                      [class.fs-positive]="transaction.type === 'RECEITA'"
                      [class.fs-negative]="transaction.type === 'DESPESA'"
                    >
                      {{ transaction.amount | money: transaction.type === 'RECEITA' }}
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </article>

          <div class="fs-column">
            <article class="fs-card">
              <header class="fs-card__header" style="padding: 0; border: none">
                <div>
                  <h3 class="fs-card__title">Metas financeiras</h3>
                  <p class="fs-card__subtitle">Progresso de cada objetivo</p>
                </div>
              </header>

              @if (goals().length === 0) {
                <fs-empty-state
                  title="Nenhuma meta cadastrada"
                  message="Crie metas para acompanhar seus objetivos de economia."
                  icon="pi pi-flag"
                >
                  <a pButton routerLink="/goals" [text]="true" label="Criar meta"></a>
                </fs-empty-state>
              } @else {
                <div class="fs-goals">
                  @for (goal of goals(); track goal.id) {
                    <div class="fs-goal">
                      <div class="fs-goal__head">
                        <span class="fs-goal__name">{{ goal.name }}</span>
                        <span class="fs-goal__percent fs-numeric">{{ percent(goal.percentComplete) }}</span>
                      </div>
                      <fs-progress-meter
                        [value]="goal.percentComplete"
                        [tone]="goalTone(goal)"
                        [showLabel]="false"
                      />
                      <div class="fs-goal__foot">
                        <span class="fs-numeric">{{ money(goal.accumulatedAmount) }} de {{ money(goal.targetAmount) }}</span>
                        @if (goal.overdue) {
                          <span class="fs-badge fs-badge--warning">
                            <i class="pi pi-clock" aria-hidden="true"></i> Atrasada
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </article>

            <article class="fs-card">
              <header class="fs-card__header" style="padding: 0; border: none">
                <div>
                  <h3 class="fs-card__title">Orçamentos do mês</h3>
                  <p class="fs-card__subtitle">Consumo dos limites definidos</p>
                </div>
              </header>

              @if (budgets().length === 0) {
                <fs-empty-state
                  title="Nenhum orçamento definido"
                  message="Defina limites por categoria para acompanhar seus gastos."
                  icon="pi pi-chart-pie"
                >
                  <a pButton routerLink="/budgets" [text]="true" label="Criar orçamento"></a>
                </fs-empty-state>
              } @else {
                <div class="fs-goals">
                  @for (budget of budgets(); track budget.id) {
                    <div class="fs-goal">
                      <div class="fs-goal__head">
                        <span class="fs-goal__name">{{ budget.categoryName }}</span>
                        <span class="fs-goal__percent fs-numeric" [class.fs-negative]="budget.status === 'EXCEDIDO'">
                          {{ percent(budget.percentUsed) }}
                        </span>
                      </div>
                      <fs-progress-meter
                        [value]="budget.percentUsed"
                        [tone]="budgetTone(budget)"
                        [showLabel]="false"
                      />
                      <div class="fs-goal__foot">
                        <span class="fs-numeric">
                          {{ money(budget.spentAmount) }} de {{ money(budget.limitAmount) }}
                        </span>
                        <span class="fs-muted">restam {{ money(budget.remainingAmount) }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </article>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
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

    .fs-column {
      display: flex;
      flex-direction: column;
      gap: var(--fs-space-4);
      min-width: 0;
    }

    .fs-goals {
      display: flex;
      flex-direction: column;
      gap: var(--fs-space-4);
    }

    .fs-goal {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .fs-goal__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--fs-space-2);
    }

    .fs-goal__name {
      font-size: var(--fs-text-sm);
      font-weight: 600;
      color: var(--fs-text-primary);
    }

    .fs-goal__percent {
      font-size: var(--fs-text-sm);
      color: var(--fs-text-secondary);
      font-weight: 600;
    }

    .fs-goal__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--fs-space-2);
      font-size: var(--fs-text-xs);
      color: var(--fs-text-muted);
    }

    .fs-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: var(--fs-radius-pill);
      font-size: var(--fs-text-xs);
      font-weight: 600;
    }

    .fs-badge--warning {
      background: var(--fs-warning-muted);
      color: var(--fs-warning);
    }

    .fs-chip {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--fs-radius-xs);
      background: var(--fs-surface-elevated);
      border: 1px solid var(--fs-border);
      font-size: var(--fs-text-xs);
      color: var(--fs-text-secondary);
      white-space: nowrap;
    }

    .fs-table__right {
      text-align: right;
    }
  `,
})
export class Dashboard {
  private readonly api = inject(FinanceApi);
  private readonly session = inject(SessionService);

  readonly categoryColors = CATEGORY_COLORS;

  readonly data = signal<DashboardData | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly range = signal<PeriodRange>({ from: '', to: '' });

  readonly summary = computed(() => this.data()?.summary ?? null);
  readonly cashflow = computed(() => this.data()?.cashflow ?? []);
  readonly distribution = computed(() => this.data()?.categoryDistribution ?? []);
  readonly recentTransactions = computed(() => this.data()?.recentTransactions ?? []);
  readonly goals = computed(() => (this.data()?.goals ?? []).slice(0, 4));
  readonly budgets = computed(() => this.data()?.budgets ?? []);

  readonly greeting = computed(() => {
    const name = this.session.firstName();
    return name ? `Ola, ${name}.` : 'Ola.';
  });

  readonly periodLabel = computed(() => {
    const current = this.range();
    if (!current.from || !current.to) return 'Período selecionado';
    return `${formatDate(current.from)} até ${formatDate(current.to)}`;
  });

  readonly cashflowLabels = computed(() => this.cashflow().map((point) => point.label));

  readonly cashflowDatasets = computed<FinanceChartDataset[]>(() => [
    {
      label: 'Receitas',
      data: this.cashflow().map((point) => point.revenues),
      color: ACCENT,
      fill: true,
    },
    {
      label: 'Despesas',
      data: this.cashflow().map((point) => point.expenses),
      color: ACCENT_SOFT,
    },
  ]);

  readonly distributionLabels = computed(() =>
    this.distribution().map((slice) => slice.categoryName),
  );

  readonly distributionDatasets = computed<FinanceChartDataset[]>(() => [
    {
      label: 'Despesas',
      data: this.distribution().map((slice) => slice.amount),
      color: ACCENT,
    },
  ]);

  readonly distributionLegend = computed(() =>
    this.distribution().map((slice, index) => ({
      label: slice.categoryName,
      value: formatCurrency(slice.amount),
      percent: Number(slice.percent.toFixed(1)),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })),
  );

  constructor() {
    this.load();
  }

  onRangeChange(range: PeriodRange): void {
    this.range.set(range);
    this.load();
  }

  load(): void {
    const current = this.range();
    this.loading.set(true);
    this.error.set('');
    this.api.dashboard(current.from || null, current.to || null).subscribe({
      next: (board) => {
        this.data.set(board);
        this.range.set({ from: board.from, to: board.to });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(FinanceApi.describeError(error));
        this.loading.set(false);
      },
    });
  }

  money(value: number | null | undefined): string {
    return formatCurrency(value);
  }

  percent(value: number | null | undefined): string {
    return formatPercent(value);
  }

  date(value: string): string {
    return formatDate(value);
  }

  signed(transaction: Transaction): string {
    const value = formatCurrency(transaction.amount);
    return transaction.type === 'RECEITA' ? `+ ${value}` : `- ${value}`;
  }

  goalTone(goal: Goal): ProgressTone {
    if (goal.status === 'CONCLUÍDA') return 'success';
    if (goal.overdue) return 'warning';
    return 'accent';
  }

  budgetTone(budget: Budget): ProgressTone {
    if (budget.status === 'EXCEDIDO') return 'danger';
    if (budget.status === 'ATENCAO') return 'warning';
    return 'success';
  }
}
