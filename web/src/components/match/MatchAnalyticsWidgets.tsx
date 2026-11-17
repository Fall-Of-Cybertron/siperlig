'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Activity, Table2 } from 'lucide-react';
import type {
  BoxScoreEntry,
  LiveProbabilityPoint,
  MatchStatItem,
  StatCategory,
} from '@/types/football';
import { formatRating, getRatingBadgeClass } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

const STAT_CATEGORIES: ('Tümü' | StatCategory)[] = [
  'Tümü',
  'Genel & Topla Oynama',
  'Hücum & xG',
  'Pas & Kurulum',
  'Savunma & İkili Mücadele',
  'Disiplin & Duran Top',
];

export function MatchStatsBoard({
  stats,
  homeClubName,
  awayClubName,
}: {
  stats: MatchStatItem[];
  homeClubName: string;
  awayClubName: string;
}) {
  const [cat, setCat] = useState<'Tümü' | StatCategory>('Tümü');

  const visibleStats = useMemo(() => {
    if (cat === 'Tümü') return stats;
    return stats.filter((s) => s.category === cat);
  }, [stats, cat]);

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100">
            40 Takım İstatistiği Kıyaslaması
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {STAT_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                cat === c
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#090D16] text-slate-400 border border-[#1F2937] hover:text-slate-200'
              }`}
            >
              {c === 'Tümü' ? `Tümü (${stats.length})` : c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-bold px-2">
        <span className="text-cyan-300">{homeClubName}</span>
        <span className="text-emerald-400">{awayClubName}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {visibleStats.map((st) => {
          const total = st.homeNumeric + st.awayNumeric;
          const homePct = total > 0 ? (st.homeNumeric / total) * 100 : 50;
          const awayPct = 100 - homePct;
          const homeLeads = st.homeNumeric >= st.awayNumeric;

          return (
            <div key={st.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`tabular-nums font-bold ${
                    homeLeads ? 'text-cyan-300' : 'text-slate-300'
                  }`}
                >
                  {st.homeValue}
                </span>
                <span className="text-[11px] text-slate-400 text-center px-2">{st.label}</span>
                <span
                  className={`tabular-nums font-bold ${
                    !homeLeads ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {st.awayValue}
                </span>
              </div>
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#090D16] gap-0.5">
                <div
                  className="bg-cyan-500/80 rounded-l-full transition-all"
                  style={{ width: `${homePct}%` }}
                />
                <div
                  className="bg-emerald-500/80 rounded-r-full transition-all"
                  style={{ width: `${awayPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function LiveProbabilityChart({
  points,
  homeClubName,
  awayClubName,
}: {
  points: LiveProbabilityPoint[];
  homeClubName: string;
  awayClubName: string;
}) {
  const width = 560;
  const height = 210;
  const padL = 38;
  const padR = 16;
  const padT = 20;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const toX = (min: number) => padL + (min / 90) * plotW;
  const toY = (pct: number) => padT + plotH - (pct / 100) * plotH;

  const homePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.minute)} ${toY(p.homeWin)}`)
    .join(' ');
  const drawPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.minute)} ${toY(p.draw)}`)
    .join(' ');
  const awayPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.minute)} ${toY(p.awayWin)}`)
    .join(' ');

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100">
            Dakika Bazlı Canlı Kazanma Olasılığı Eğrisi
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-cyan-300">
            <span className="w-2.5 h-0.5 bg-cyan-400" /> {homeClubName}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300">
            <span className="w-2.5 h-0.5 bg-amber-400" /> Beraberlik
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400" /> {awayClubName}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[#1F2937] bg-[#090D16] p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[360px] h-auto">
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = toY(pct);
            return (
              <g key={`prob-y-${pct}`}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#1F2937" strokeDasharray="3 3" />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="9.5"
                  className="tabular-nums"
                >
                  %{pct}
                </text>
              </g>
            );
          })}
          {[0, 15, 30, 45, 60, 75, 90].map((m) => (
            <text
              key={`prob-x-${m}`}
              x={toX(m)}
              y={height - 10}
              textAnchor="middle"
              fill="#64748B"
              fontSize="9.5"
              className="tabular-nums"
            >
              {m}&apos;
            </text>
          ))}

          <path d={drawPath} fill="none" stroke="#FBBF24" strokeWidth="1.8" strokeDasharray="4 3" />
          <path d={awayPath} fill="none" stroke="#10B981" strokeWidth="2.2" />
          <path d={homePath} fill="none" stroke="#06B6D4" strokeWidth="2.5" />

          {points
            .filter((p) => p.eventLabel)
            .map((p, idx) => (
              <g key={`ev-pt-${idx}`}>
                <line
                  x1={toX(p.minute)}
                  y1={padT}
                  x2={toX(p.minute)}
                  y2={padT + plotH}
                  stroke="#334155"
                  strokeDasharray="2 2"
                />
                <circle cx={toX(p.minute)} cy={toY(p.homeWin)} r={3.5} fill="#06B6D4" />
                <text
                  x={toX(p.minute)}
                  y={padT - 5}
                  textAnchor="middle"
                  fill="#CBD5E1"
                  fontSize="8.5"
                  fontWeight="600"
                >
                  {p.eventLabel}
                </text>
              </g>
            ))}
        </svg>
      </div>
    </section>
  );
}

export function MatchBoxScoreTable({
  boxScore,
  homeClubId,
  homeClubName,
  awayClubId,
  awayClubName,
}: {
  boxScore: BoxScoreEntry[];
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
}) {
  const [teamTab, setTeamTab] = useState<'ALL' | string>('ALL');

  const rows = useMemo(() => {
    const base = teamTab === 'ALL' ? boxScore : boxScore.filter((b) => b.clubId === teamTab);
    return [...base].sort((a, b) => b.matchRating - a.matchRating);
  }, [boxScore, teamTab]);

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100">
            Oyuncu Maç Reytingleri &amp; BoxScore
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-[#1F2937] text-xs">
          {[
            { id: 'ALL', label: 'Her İki Takım' },
            { id: homeClubId, label: homeClubName },
            { id: awayClubId, label: awayClubName },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTeamTab(opt.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                teamTab === opt.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
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
              <th className="px-3 py-2.5">Kulüp</th>
              <th className="px-3 py-2.5">Mevki</th>
              <th className="px-2.5 py-2.5 text-center">Dk</th>
              <th className="px-2.5 py-2.5 text-center">G</th>
              <th className="px-2.5 py-2.5 text-center">A</th>
              <th className="px-2.5 py-2.5 text-center">Şut</th>
              <th className="px-2.5 py-2.5 text-right">xG</th>
              <th className="px-2.5 py-2.5 text-right">xA</th>
              <th className="px-2.5 py-2.5 text-center">K.Pas</th>
              <th className="px-2.5 py-2.5 text-right">Pas %</th>
              <th className="px-4 py-2.5 text-right">Reyting</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]/70">
            {rows.map((r) => (
              <tr key={r.playerId} className="hover:bg-[#1E293B]/60">
                <td className="sticky left-0 z-10 bg-[#111827] px-4 py-2.5">
                  <Link
                    href={`/players/${r.playerId}`}
                    className="font-semibold text-slate-100 hover:text-cyan-300 whitespace-nowrap"
                  >
                    {r.playerName}
                  </Link>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <Link
                    href={`/clubs/${r.clubId}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300"
                  >
                    <ClubBadge clubId={r.clubId} size="xs" />
                    <span>{r.clubName}</span>
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{r.position}</td>
                <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">
                  {r.minutesPlayed}&apos;
                </td>
                <td className="px-2.5 py-2.5 text-center tabular-nums text-emerald-400 font-semibold">
                  {r.goals}
                </td>
                <td className="px-2.5 py-2.5 text-center tabular-nums text-cyan-300 font-semibold">
                  {r.assists}
                </td>
                <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">{r.shots}</td>
                <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-400">
                  {r.xG.toFixed(2)}
                </td>
                <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-400">
                  {r.xA.toFixed(2)}
                </td>
                <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">
                  {r.keyPasses}
                </td>
                <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-300">
                  %{r.passAccuracy.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className={`tabular-nums inline-block rounded border px-1.5 py-0.5 text-[11px] font-bold ${getRatingBadgeClass(
                      r.matchRating
                    )}`}
                  >
                    {formatRating(r.matchRating)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
