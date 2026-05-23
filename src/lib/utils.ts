import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDZD(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-DZ')} DA`
}

export function calcMargin(dealPrice: number, totalCost: number) {
  const margin = dealPrice - totalCost
  const marginPct = dealPrice > 0 ? (margin / dealPrice) * 100 : 0
  return { margin, marginPct }
}

export function marginColor(marginPct: number): string {
  if (marginPct > 30) return 'text-emerald-600'
  if (marginPct >= 15) return 'text-amber-600'
  return 'text-red-500'
}

export function marginBg(marginPct: number): string {
  if (marginPct > 30) return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  if (marginPct >= 15) return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-red-100 text-red-600 border border-red-200'
}

export function marginDot(marginPct: number): string {
  if (marginPct > 30) return '#10b981'
  if (marginPct >= 15) return '#f59e0b'
  return '#ef4444'
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function projectTypeStyle(color: string): { border: string; bg: string; text: string } {
  return {
    border: `border`,
    bg: `${color}20`,
    text: color,
  }
}
