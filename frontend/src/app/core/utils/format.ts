const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatCurrency = (value: number | null | undefined): string =>
  currencyFormatter.format(Number(value ?? 0));

export const formatDecimal = (value: number | null | undefined): string =>
  decimalFormatter.format(Number(value ?? 0));

export const formatPercent = (value: number | null | undefined): string =>
  `${percentFormatter.format(Number(value ?? 0))}%`;

/** Converte '2026-03-08' em '08/03/2026' sem deslocar o fuso horario. */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '--';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** Data de hoje no formato ISO (yyyy-MM-dd), usada como valor inicial. */
export const todayIso = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Primeiro dia do mês no formato ISO. */
export const monthStartIso = (reference: Date = new Date()): string => {
  const month = String(reference.getMonth() + 1).padStart(2, '0');
  return `${reference.getFullYear()}-${month}-01`;
};

/** Último dia do mês no formato ISO. */
export const monthEndIso = (reference: Date = new Date()): string => {
  const last = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  const month = String(last.getMonth() + 1).padStart(2, '0');
  const day = String(last.getDate()).padStart(2, '0');
  return `${last.getFullYear()}-${month}-${day}`;
};

export const addDaysIso = (iso: string, days: number): string => {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day + days);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
};
