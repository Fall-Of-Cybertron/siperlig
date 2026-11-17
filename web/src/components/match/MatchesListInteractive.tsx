'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Swords, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import type { Match } from '@/types/football';
import { formatDateTr } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

export function MatchesListInteractive({ matches }: { matches: Match[] }) {
  const rounds = useMemo(() => {
    const set = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => b - a);
    return set;
  }, [matches]);

  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');

  const visibleMatches = useMemo(() => {
    const base =
      selectedRound === 'ALL' ? matches : matches.filter((m) => m.round === selectedRound);
    return [...base].sort((a, b) => b.round - a.round || b.date.localeCompare(a.date));
  }, [matches, selectedRound]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            Trendyol Süper Lig Maç Merkezi
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-50 mt-0.5">
            Analiz Edilen Maçlar, xG &amp; Poisson Doğrulamaları
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-[#090D16] p-1 rounded-xl border border-[#1F2937] text-xs">
          <button
            type="button"
            onClick={() => setSelectedRound('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold ${
              selectedRound === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü ({matches.length})
          </button>
          {rounds.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRound(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                selectedRound === r
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}. Hafta
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleMatches.map((m) => {
          const goals = m.events.filter((e) => e.type === 'goal');
          const homeXg = m.stats.find((s) => s.key === 'expected_goals')?.homeValue ?? '-';
          const awayXg = m.stats.find((s) => s.key === 'expected_goals')?.awayValue ?? '-';

          return (
            <div
              key={m.id}
              className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 space-y-3 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="tabular-nums font-semibold text-cyan-400">
                  {m.round}. Hafta · {formatDateTr(m.date)} · {m.kickoffTime}
                </span>
                <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  {m.venue}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 py-1">
                <Link
                  href={`/clubs/${m.homeClubId}`}
                  className="flex items-center gap-2.5 flex-1 min-w-0 hover:text-cyan-300"
                >
                  <ClubBadge clubId={m.homeClubId} size="sm" />
                  <span className="text-sm font-bold text-slate-100 truncate">
                    {m.homeClubName}
                  </span>
                </Link>

                <Link
                  href={`/matches/${m.id}`}
                  className="tabular-nums shrink-0 rounded-xl bg-[#090D16] border border-[#1F2937] hover:border-cyan-400 px-3.5 py-1.5 text-base font-black text-cyan-300 transition-colors"
                >
                  {m.homeScore} - {m.awayScore}
                </Link>

                <Link
                  href={`/clubs/${m.awayClubId}`}
                  className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right hover:text-cyan-300"
                >
                  <span className="text-sm font-bold text-slate-100 truncate">
                    {m.awayClubName}
                  </span>
                  <ClubBadge clubId={m.awayClubId} size="sm" />
                </Link>
              </div>

              {/* Goal Scorers Strip */}
              {goals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-[#1F2937]/70">
                  {goals.map((g) => (
                    <span key={g.id} className="inline-flex items-center gap-1">
                      <span className="tabular-nums text-emerald-400 font-semibold">
                        {g.minute}&apos;
                      </span>
                      <Link
                        href={`/players/${g.playerId}`}
                        className="text-slate-200 hover:text-cyan-300"
                      >
                        {g.playerName}
                      </Link>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1F2937]/70 text-[11px]">
                <span className="tabular-nums text-slate-400">
                  xG: <strong className="text-cyan-300">{homeXg}</strong> –{' '}
                  <strong className="text-emerald-400">{awayXg}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium ${
                      m.prematch.poissonCorrect
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {m.prematch.poissonCorrect ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Poisson
                  </span>

                  <Link
                    href={`/matches/${m.id}`}
                    className="font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Maç Merkezi →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
