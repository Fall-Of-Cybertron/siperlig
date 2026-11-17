import type { InjuryRiskLevel } from '@/types/football';

const TR_CHAR_MAP: Record<string, string> = {
  İ: 'i',
  I: 'i',
  ı: 'i',
  Ş: 's',
  ş: 's',
  Ğ: 'g',
  ğ: 'g',
  Ü: 'u',
  ü: 'u',
  Ö: 'o',
  ö: 'o',
  Ç: 'c',
  ç: 'c',
  ć: 'c',
  Ć: 'c',
  č: 'c',
  Č: 'c',
  ž: 'z',
  Ž: 'z',
  š: 's',
  Š: 's',
  ń: 'n',
  Ń: 'n',
  ł: 'l',
  Ł: 'l',
  ø: 'o',
  Ø: 'o',
  ă: 'a',
  Ă: 'a',
  ô: 'o',
  Ô: 'o',
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
};

/**
 * Normalizes Turkish & accented Latin characters to lowercase ASCII for instant client search.
 */
export function normalizeTr(input: string): string {
  if (!input) return '';
  let out = '';
  for (const ch of input) {
    out += TR_CHAR_MAP[ch] ?? ch;
  }
  return out
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function formatMarketValue(eur: number): string {
  if (!eur || eur <= 0) return '€0';
  if (eur >= 1_000_000_000) {
    return `€${(eur / 1_000_000_000).toFixed(2)}B`;
  }
  if (eur >= 1_000_000) {
    const millions = eur / 1_000_000;
    return `€${millions >= 100 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (eur >= 1_000) {
    return `€${Math.round(eur / 1_000)}K`;
  }
  return `€${eur}`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(2);
}

export function getRatingBadgeClass(rating: number): string {
  if (rating >= 8.5) {
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]';
  }
  if (rating >= 7.6) {
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }
  if (rating >= 7.1) {
    return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  }
  if (rating >= 6.7) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
}

export function getInjuryRiskBadgeClass(risk: InjuryRiskLevel): string {
  switch (risk) {
    case 'Kritik':
      return 'bg-red-500/15 text-red-400 border-red-500/40';
    case 'Yüksek':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    case 'Orta':
      return 'bg-pink-500/15 text-pink-300 border-pink-500/35';
    default:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  }
}

export function getPlayStyleBadgeClass(style: string): string {
  if (style === 'Dikine Baskı') {
    return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35';
  }
  if (style === 'Uzun Top / Geçiş') {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/35';
  }
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
}

const REFERENCE_DATE = new Date('2026-11-17T00:00:00Z');

export function getMonthsUntilExpiry(contractExpiry: string): number {
  const exp = new Date(`${contractExpiry}T00:00:00Z`);
  const diffDays = (exp.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(diffDays / 30.44));
}

export function isContractExpiringWithinOneYear(contractExpiry: string): boolean {
  const exp = new Date(`${contractExpiry}T00:00:00Z`);
  const diffDays = (exp.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 365;
}

export function formatDateTr(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}
