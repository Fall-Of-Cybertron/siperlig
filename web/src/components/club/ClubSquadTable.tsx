'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown } from 'lucide-react';
import type { ClubSquadMember, PositionGroup } from '@/types/football';
import {
  formatDateTr,
  formatMarketValue,
  formatRating,
  getInjuryRiskBadgeClass,
  getRatingBadgeClass,
  isContractExpiringWithinOneYear,
} from '@/lib/format';

interface ClubSquadTableProps {
  squad: ClubSquadMember[];
}

type FilterPos = 'ALL' | PositionGroup;
type SortKey = 'value' | 'rating' | 'age' | 'goals';

export function ClubSquadTable({ squad }: ClubSquadTableProps) {
  const [posFilter, setPosFilter] = useState<FilterPos>('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('value');

  const filtered = useMemo(() => {
    const base = posFilter === 'ALL' ? squad : squad.filter((m) => m.positionGroup === posFilter);
    return [...base].sort((a, b) => {
      if (sortBy === 'rating') return b.avgMatchRating - a.avgMatchRating;
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'goals') return b.goals - a.goals || b.assists - a.assists;
      return b.currentMarketValueEur - a.currentMarketValueEur;
    });
  }, [squad, posFilter, sortBy]);

  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-[#1F2937]">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `Tümü (${squad.length})` },
            { id: 'GK', label: 'Kaleci' },
            { id: 'DF', label: 'Defans' },
            { id: 'MF', label: 'Orta Saha' },
            { id: 'FW', label: 'Forvet' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setPosFilter(btn.id as FilterPos)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                posFilter === btn.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#090D16] text-slate-400 border border-[#1F2937] hover:text-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Sırala:</span>
          {[
            { id: 'value', label: 'Değer' },
            { id: 'rating', label: 'Reyting' },
            { id: 'goals', label: 'Gol' },
            { id: 'age', label: 'Yaş' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSortBy(opt.id as SortKey)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                sortBy === opt.id
                  ? 'bg-[#1E293B] text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#090D16]/85 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
            <tr>
              <th className="sticky left-0 z-10 bg-[#090D16] px-4 py-2.5 font-semibold">Oyuncu</th>
              <th className="px-3 py-2.5">Mevki</th>
              <th className="px-2.5 py-2.5 text-center">Yaş</th>
              <th className="px-3 py-2.5">Uyruk</th>
              <th className="px-2.5 py-2.5 text-center">Ayak</th>
              <th className="px-3 py-2.5">Sözleşme Bitiş</th>
              <th className="px-3 py-2.5 text-center">Sakatlık Riski</th>
              <th className="px-2.5 py-2.5 text-center">Maç</th>
              <th className="px-2.5 py-2.5 text-center">G / A</th>
              <th className="px-2.5 py-2.5 text-right">xG</th>
              <th className="px-3 py-2.5 text-center">Reyting</th>
              <th className="px-4 py-2.5 text-right text-emerald-400">Piyasa Değeri</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]/70">
            {filtered.map((m) => {
              const expiring = isContractExpiringWithinOneYear(m.contractExpiry);
              return (
                <tr key={m.playerId} className="hover:bg-[#1E293B]/60 transition-colors">
                  <td className="sticky left-0 z-10 bg-[#111827] px-4 py-2.5">
                    <Link
                      href={`/players/${m.playerId}`}
                      className="flex items-center gap-2.5 group min-w-[165px]"
                    >
                      <span className="tabular-nums w-6 h-6 rounded-md bg-[#090D16] border border-[#1F2937] flex items-center justify-center text-[11px] font-bold text-slate-300">
                        {m.shirtNumber}
                      </span>
                      <span className="font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                        {m.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">{m.positionMain}</td>
                  <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">{m.age}</td>
                  <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">{m.citizenship}</td>
                  <td className="px-2.5 py-2.5 text-center text-slate-400">{m.foot}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`tabular-nums text-[11px] ${
                        expiring ? 'text-amber-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {formatDateTr(m.contractExpiry)}
                    </span>
                    {expiring && (
                      <span className="ml-1.5 rounded bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 text-[9px] text-amber-300">
                        &lt;1 Yıl
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getInjuryRiskBadgeClass(
                        m.injuryRisk
                      )}`}
                    >
                      {m.injuryRisk}
                    </span>
                    {m.missedGamesTotal > 0 && (
                      <span className="ml-1 tabular-nums text-[10px] text-slate-500">
                        ({m.missedGamesTotal}m)
                      </span>
                    )}
                  </td>
                  <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">
                    {m.gamesPlayed}
                  </td>
                  <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-200 font-medium">
                    {m.goals} / {m.assists}
                  </td>
                  <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-400">
                    {m.xG.toFixed(1)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`tabular-nums inline-block rounded border px-1.5 py-0.5 text-[11px] font-bold ${getRatingBadgeClass(
                        m.avgMatchRating
                      )}`}
                    >
                      {formatRating(m.avgMatchRating)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-400">
                    {formatMarketValue(m.currentMarketValueEur)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
