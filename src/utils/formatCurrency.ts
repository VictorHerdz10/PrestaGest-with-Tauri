// src/utils/formatters.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CU', {
    style: 'currency',
    currency: 'CUP',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}