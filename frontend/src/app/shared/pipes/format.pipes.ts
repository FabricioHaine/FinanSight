import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency, formatDecimal, formatPercent } from '../../core/utils/format';

/** Formata valores monetarios no padrão brasileiro: R$ 8.450,32 */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  /**
   * @param signed quando `true`, prefixa o valor com `+` ou `-` (usado nas
   * listas de transações, onde o sinal comunica a natureza do lançamento).
   */
  transform(value: number | null | undefined, signed = false): string {
    const amount = Number(value ?? 0);
    if (!signed) {
      return formatCurrency(amount);
    }
    if (amount > 0) return `+ ${formatCurrency(amount)}`;
    if (amount < 0) return `- ${formatCurrency(Math.abs(amount))}`;
    return formatCurrency(0);
  }
}

/** Formata números decimais no padrão brasileiro. */
@Pipe({ name: 'decimal' })
export class DecimalPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatDecimal(value);
  }
}

/** Formata percentuais com uma casa decimal. */
@Pipe({ name: 'percent' })
export class PercentPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatPercent(value);
  }
}
