import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  Filler,
  Legend,
  Tooltip,
);

export interface FinanceChartDataset {
  label: string;
  data: number[];
  color: string;
  fill?: boolean;
}

export interface FinanceChartLegendItem {
  label: string;
  value: string;
  color: string;
  percent?: number;
}

export type FinanceChartType = 'line' | 'bar' | 'doughnut';

const TEXT_SECONDARY = '#91a1b8';
const TEXT_MUTED = '#71839b';
const GRID_COLOR = 'rgba(32, 49, 74, 0.7)';

/**
 * Gráfico financeiro do FinanSight. Usa Chart.js diretamente para manter
 * total controle sobre a estetica: linhas finas, grades discretas, fundo
 * transparente e tooltips na paleta do produto.
 */
@Component({
  selector: 'fs-finance-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fs-chart" [class.fs-chart--legend]="type() === 'doughnut' && legendItems().length > 0">
      <div class="fs-chart__canvas" [style.height.px]="height()">
        <canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>
        @if (empty()) {
          <div class="fs-chart__empty">
            <i class="pi pi-chart-line" aria-hidden="true"></i>
            <span>{{ emptyLabel() }}</span>
          </div>
        }
      </div>

      @if (type() === 'doughnut' && legendItems().length > 0) {
        <ul class="fs-chart__legend">
          @for (item of legendItems(); track item.label) {
            <li class="fs-chart__legend-item">
              <span class="fs-chart__legend-dot" [style.background]="item.color" aria-hidden="true"></span>
              <span class="fs-chart__legend-label">{{ item.label }}</span>
              @if (item.percent !== undefined) {
                <span class="fs-chart__legend-percent fs-numeric">{{ item.percent }}%</span>
              }
              <span class="fs-chart__legend-value fs-numeric">{{ item.value }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .fs-chart {
      position: relative;
      width: 100%;
      min-height: 120px;
    }

    .fs-chart--legend {
      display: flex;
      align-items: center;
      gap: var(--fs-space-4);
      flex-wrap: wrap;
    }

    .fs-chart__canvas {
      position: relative;
      flex: 1 1 240px;
      min-width: 200px;
      min-height: 120px;
    }

    .fs-chart canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .fs-chart__legend {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1 1 12rem;
      min-width: 11rem;
    }

    .fs-chart__legend-item {
      display: grid;
      grid-template-columns: 10px minmax(0, 1fr) auto auto;
      align-items: baseline;
      gap: 0.5rem;
      font-size: var(--fs-text-sm);
      color: var(--fs-text-secondary);
    }

    .fs-chart__legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 2px;
      align-self: center;
    }

    .fs-chart__legend-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fs-chart__legend-percent {
      color: var(--fs-text-muted);
      font-size: var(--fs-text-xs);
    }

    .fs-chart__legend-value {
      color: var(--fs-text-primary);
      font-weight: 600;
      text-align: right;
    }

    .fs-chart__empty {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--fs-space-2);
      color: var(--fs-text-muted);
      font-size: var(--fs-text-sm);
      background: var(--fs-surface);
    }

    .fs-chart__empty i {
      font-size: 1.25rem;
      opacity: 0.6;
    }
  `,
})
export class FinanceChart implements AfterViewInit, OnDestroy {
  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly type = input<FinanceChartType>('line');
  readonly labels = input<string[]>([]);
  readonly datasets = input<FinanceChartDataset[]>([]);
  /** Paleta usada nas fatias do gráfico de rosca. */
  readonly palette = input<string[]>([]);
  /** Legenda em HTML (usada no gráfico de rosca). */
  readonly legendItems = input<FinanceChartLegendItem[]>([]);
  readonly height = input(260);
  readonly showLegend = input(true);
  readonly emptyLabel = input('Sem dados no período');
  readonly ariaLabel = input('Gráfico financeiro');

  private chart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      // Recria o gráfico quando os dados de entrada mudam.
      this.type();
      this.labels();
      this.datasets();
      this.showLegend();
      if (this.viewReady) {
        this.render();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  empty(): boolean {
    const datasets = this.datasets();
    return datasets.length === 0 || datasets.every((dataset) => dataset.data.length === 0);
  }

  private render(): void {
    const canvas = this.canvas().nativeElement;
    this.chart?.destroy();

    const config = this.buildConfig();
    this.chart = new Chart(canvas, config);
  }

  private buildConfig(): ChartConfiguration {
    const type = this.type();
    const datasets = this.datasets();
    const labels = this.labels();

    const common = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 420, easing: 'easeOutQuart' as const },
      interaction: { mode: 'index' as const, intersect: false },
    };

    if (type === 'doughnut') {
      const palette = this.palette();
      const sliceColors =
        palette.length > 0
          ? labels.map((_, index) => palette[index % palette.length])
          : datasets.map((dataset) => dataset.color);

      return {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: datasets[0]?.data ?? [],
              backgroundColor: sliceColors,
              borderColor: '#0d192a',
              borderWidth: 2,
              hoverBorderColor: '#101e32',
              hoverOffset: 4,
            },
          ],
        },
        options: {
          ...common,
          cutout: '64%',
          radius: '92%',
          plugins: {
            legend: {
              display: this.legendItems().length === 0 && this.showLegend(),
              position: 'right',
              labels: {
                color: TEXT_SECONDARY,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 8,
                boxHeight: 8,
                padding: 14,
                font: { family: 'Inter', size: 12 },
              },
            },
            tooltip: {
              backgroundColor: '#101e32',
              borderColor: '#20314a',
              borderWidth: 1,
              titleColor: '#e8eef7',
              bodyColor: '#91a1b8',
              padding: 10,
              cornerRadius: 6,
              displayColors: true,
              boxPadding: 4,
              callbacks: {
                label: (context) => {
                  const total = (context.dataset.data as number[]).reduce(
                    (sum, value) => sum + (Number(value) || 0),
                    0,
                  );
                  const value = Number(context.raw) || 0;
                  const percent = total > 0 ? (value / total) * 100 : 0;
                  return ` ${context.label}: ${value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })} (${percent.toFixed(1)}%)`;
                },
              },
            },
          },
        },
      } as ChartConfiguration<'doughnut'>;
    }

    const isLine = type === 'line';
    return {
      type: isLine ? 'line' : 'bar',
      data: {
        labels,
        datasets: datasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.color,
          backgroundColor: isLine
            ? this.toRgba(dataset.color, dataset.fill ? 0.14 : 0)
            : this.toRgba(dataset.color, 0.55),
          borderWidth: isLine ? 2 : 0,
          borderRadius: isLine ? 0 : 4,
          fill: isLine ? (dataset.fill ?? false) : false,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: dataset.color,
          pointHoverBorderColor: '#0d192a',
          pointHoverBorderWidth: 2,
          cubicInterpolationMode: 'default',
        })),
      },
      options: {
        ...common,
        scales: {
          x: {
            grid: { display: false },
            border: { color: GRID_COLOR },
            ticks: {
              color: TEXT_MUTED,
              font: { family: 'Inter', size: 11 },
              maxRotation: 0,
              autoSkipPadding: 18,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: GRID_COLOR, drawTicks: false },
            border: { display: false },
            ticks: {
              color: TEXT_MUTED,
              font: { family: 'Inter', size: 11 },
              padding: 8,
              callback: (value) => this.compactCurrency(Number(value)),
            },
          },
        },
        plugins: {
          legend: {
            display: this.showLegend(),
            align: 'start',
            labels: {
              color: TEXT_SECONDARY,
              usePointStyle: true,
              pointStyle: 'line',
              boxWidth: 18,
              padding: 16,
              font: { family: 'Inter', size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#101e32',
            borderColor: '#20314a',
            borderWidth: 1,
            titleColor: '#e8eef7',
            bodyColor: '#91a1b8',
            padding: 10,
            cornerRadius: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) =>
                ` ${context.dataset.label}: ${(Number(context.raw) || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}`,
            },
          },
        },
      },
    };
  }

  private compactCurrency(value: number): string {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
    }
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }

  private toRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
