'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, BarChart3, Shield } from 'lucide-react';
import type { Club, StandingRow } from '@/types/football';
import { formatMarketValue, getPlayStyleBadgeClass } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

interface StandingsInteractiveProps {
  standings: StandingRow[];
  clubs: Club[];
  season: string;
  currentRound: number;
}

type TableTab = 'overall' | 'home' | 'away' | 'form5';

export function StandingsInteractive({
  standings,
  clubs,
  season,
  currentRound,
}: StandingsInteractiveProps) {
  const [tab, setTab] = useState<TableTab>('overall');
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([
    'galatasaray',
    'fenerbahce',
    'samsunspor',
    'besiktas',
  ]);

  const clubMap = useMemo(() => new Map(clubs.map((c) => [c.id, c])), [clubs]);

  const sortedRows = useMemo(() => {
    const list = [...standings];
    if (tab === 'home') {
      list.sort(
        (a, b) =>
          b.home.points - a.home.points ||
          b.home.goalDifference - a.home.goalDifference ||
          b.home.goalsFor - a.home.goalsFor
      );
    } else if (tab === 'away') {
      list.sort(
        (a, b) =>
          b.away.points - a.away.points ||
          b.away.goalDifference - a.away.goalDifference ||
          b.away.goalsFor - a.away.goalsFor
      );
    } else if (tab === 'form5') {
      const formPts = (r: StandingRow) =>
        r.recentMatches.reduce((acc, m) => acc + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0);
      list.sort((a, b) => formPts(b) - formPts(a) || b.overall.goalDifference - a.overall.goalDifference);
    } else {
      list.sort((a, b) => a.rank - b.rank);
    }
    return list;
  }, [standings, tab]);

  const toggleClubCompare = (clubId: string) => {
    setSelectedClubIds((prev) => {
      if (prev.includes(clubId)) {
        return prev.length > 1 ? prev.filter((id) => id !== clubId) : prev;
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), clubId];
      }
      return [...prev, clubId];
    });
  };

  // SVG chart metrics for 2023-2026 Multi-Season Trend
  const chartColors = ['#06B6D4', '#10B981', '#F59E0B', '#F472B6', '#A855F7'];
  const seasons = ['2023', '2024', '2025', '2026 (12H)'];

  return (
    <div className="space-y-6">
      {/* Standings Table Card */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-[#1F2937]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              {season} Sezonu · {currentRound}. Hafta
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-50 mt-0.5">
              Süper Lig Puan Durumu &amp; Kulüp Metrikleri
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#090D16] p-1 rounded-xl border border-[#1F2937]">
            {[
              { id: 'overall', label: 'Genel' },
              { id: 'home', label: 'İç Saha' },
              { id: 'away', label: 'Dış Saha' },
              { id: 'form5', label: 'Son 5 Maç' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as TableTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16]/80 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
              <tr>
                <th className="sticky left-0 z-10 bg-[#090D16] px-4 py-3 font-semibold">Takım</th>
                <th className="px-2.5 py-3 text-center">O</th>
                <th className="px-2.5 py-3 text-center">G</th>
                <th className="px-2.5 py-3 text-center">B</th>
                <th className="px-2.5 py-3 text-center">M</th>
                <th className="px-2.5 py-3 text-center">AG</th>
                <th className="px-2.5 py-3 text-center">YG</th>
                <th className="px-2.5 py-3 text-center">AV</th>
                <th className="px-3 py-3 text-center">Son 5 Maç</th>
                <th className="px-3 py-3">Oyun Stili</th>
                <th className="px-3 py-3 text-right">Gol - xG</th>
                <th className="px-3 py-3 text-right">Kadro Değeri</th>
                <th className="px-4 py-3 text-right font-bold text-cyan-300">Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/70">
              {sortedRows.map((row, idx) => {
                const club = clubMap.get(row.clubId);
                const split =
                  tab === 'home' ? row.home : tab === 'away' ? row.away : row.overall;
                const form5Pts = row.recentMatches.reduce(
                  (acc, m) => acc + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0),
                  0
                );
                const displayRank = idx + 1;

                return (
                  <tr key={row.clubId} className="hover:bg-[#1E293B]/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-[#111827] px-4 py-2.5">
                      <Link
                        href={`/clubs/${row.clubId}`}
                        className="flex items-center gap-2.5 group min-w-[165px]"
                      >
                        <span
                          className={`tabular-nums w-5 text-[11px] font-bold ${
                            displayRank <= 2
                              ? 'text-emerald-400'
                              : displayRank <= 4
                                ? 'text-cyan-400'
                                : displayRank >= 16
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                          }`}
                        >
                          {displayRank}
                        </span>
                        <ClubBadge clubId={row.clubId} size="xs" />
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                          {row.clubName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">
                      {tab === 'form5' ? 5 : split.played}
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-emerald-400">
                      {tab === 'form5'
                        ? row.recentMatches.filter((m) => m.result === 'W').length
                        : split.won}
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-400">
                      {tab === 'form5'
                        ? row.recentMatches.filter((m) => m.result === 'D').length
                        : split.drawn}
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-rose-400">
                      {tab === 'form5'
                        ? row.recentMatches.filter((m) => m.result === 'L').length
                        : split.lost}
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">
                      {split.goalsFor}
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-300">
                      {split.goalsAgainst}
                    </td>
                    <td className="px-2.5 py-2.5 text-center tabular-nums text-slate-200 font-medium">
                      {split.goalDifference > 0 ? `+${split.goalDifference}` : split.goalDifference}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {row.recentMatches.map((rm, mIdx) => (
                          <Link
                            key={`${row.clubId}-form-${mIdx}`}
                            href={`/matches/${rm.matchId}`}
                            title={`${rm.opponentName} (${rm.score})`}
                            className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-transform hover:scale-110 ${
                              rm.result === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : rm.result === 'D'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {rm.result === 'W' ? 'G' : rm.result === 'D' ? 'B' : 'M'}
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {club && (
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium ${getPlayStyleBadgeClass(
                            club.playStyle
                          )}`}
                        >
                          {club.playStyle}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums font-semibold ${
                        (club?.goalsMinusXg ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {club
                        ? club.goalsMinusXg >= 0
                          ? `+${club.goalsMinusXg.toFixed(1)}`
                          : club.goalsMinusXg.toFixed(1)
                        : '-'}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-emerald-400 font-semibold">
                      {club ? formatMarketValue(club.totalMarketValueEur) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-slate-50">
                      {tab === 'form5' ? form5Pts : split.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2023-2026 Multi-Season Performance Comparison */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              2023–2026 Çok Sezonlu Gelişim Trendleri
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
              Maç Başı Puan (PPG) &amp; Sıralama Karşılaştırması
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">En fazla 5 kulüp seçebilirsiniz</span>
        </div>

        {/* Club Selector Chips */}
        <div className="flex flex-wrap gap-1.5">
          {standings.map((s) => {
            const activeIdx = selectedClubIds.indexOf(s.clubId);
            const active = activeIdx !== -1;
            return (
              <button
                key={s.clubId}
                type="button"
                onClick={() => toggleClubCompare(s.clubId)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#1E293B] text-white border-cyan-500/50'
                    : 'bg-[#090D16] text-slate-400 border-[#1F2937] hover:text-slate-200'
                }`}
              >
                {active && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: chartColors[activeIdx % chartColors.length] }}
                  />
                )}
                <span>{s.shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* SVG PPG Line Chart */}
          <div className="lg:col-span-6 rounded-xl border border-[#1F2937] bg-[#090D16] p-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              Sezonlara Göre Maç Başı Puan (PPG) Eğrisi
            </div>
            <svg viewBox="0 0 460 220" className="w-full h-auto overflow-visible">
              {/* Grid lines */}
              {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((val) => {
                const y = 185 - ((val - 0.5) / 2.5) * 155;
                return (
                  <g key={`grid-${val}`}>
                    <line x1={42} y1={y} x2={440} y2={y} stroke="#1F2937" strokeDasharray="3 3" />
                    <text
                      x={34}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748B"
                      fontSize="10"
                      className="tabular-nums"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {seasons.map((label, idx) => {
                const x = 65 + idx * 120;
                return (
                  <text key={label} x={x} y={208} textAnchor="middle" fill="#94A3B8" fontSize="10">
                    {label}
                  </text>
                );
              })}

              {/* Lines for each selected club */}
              {selectedClubIds.map((clubId, cIdx) => {
                const row = standings.find((s) => s.clubId === clubId);
                if (!row) return null;
                const color = chartColors[cIdx % chartColors.length];
                const pts = row.seasonTrends.map((pt, idx) => {
                  const x = 65 + idx * 120;
                  const clamped = Math.min(3.0, Math.max(0.5, pt.ppg));
                  const y = 185 - ((clamped - 0.5) / 2.5) * 155;
                  return { x, y, pt };
                });
                const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                return (
                  <g key={clubId}>
                    <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
                    {pts.map((p, i) => (
                      <g key={`${clubId}-pt-${i}`}>
                        <circle cx={p.x} cy={p.y} r={4.5} fill="#090D16" stroke={color} strokeWidth={2} />
                        <text
                          x={p.x}
                          y={p.y - 8}
                          textAnchor="middle"
                          fill={color}
                          fontSize="9"
                          fontWeight="700"
                          className="tabular-nums"
                        >
                          {p.pt.ppg.toFixed(2)}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Season Comparison Table */}
          <div className="lg:col-span-6 overflow-x-auto rounded-xl border border-[#1F2937]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16] text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
                <tr>
                  <th className="px-3 py-2.5">Kulüp</th>
                  <th className="px-2 py-2.5 text-center">2023</th>
                  <th className="px-2 py-2.5 text-center">2024</th>
                  <th className="px-2 py-2.5 text-center">2025</th>
                  <th className="px-3 py-2.5 text-center text-cyan-300">2026 PPG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/70 bg-[#090D16]/40">
                {selectedClubIds.map((clubId, cIdx) => {
                  const row = standings.find((s) => s.clubId === clubId);
                  if (!row) return null;
                  return (
                    <tr key={`trend-row-${clubId}`} className="hover:bg-[#1E293B]/60">
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/clubs/${row.clubId}`}
                          className="inline-flex items-center gap-2 font-semibold text-slate-100 hover:text-cyan-300"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: chartColors[cIdx % chartColors.length] }}
                          />
                          <ClubBadge clubId={row.clubId} size="xs" />
                          <span>{row.clubName}</span>
                        </Link>
                      </td>
                      {row.seasonTrends.map((t) => (
                        <td key={t.season} className="px-2 py-2.5 text-center tabular-nums">
                          <div className="font-semibold text-slate-100">{t.ppg.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-500">#{t.rank} ({t.points}p)</div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* All 18 Super Lig Clubs Grid */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100">
            18 Süper Lig Kulübü — Kadro Değeri &amp; Taktik Profili
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clubs
            .filter((c) => c.isSuperLig)
            .sort((a, b) => b.totalMarketValueEur - a.totalMarketValueEur)
            .map((club) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-[#090D16]/75 p-3 hover:border-cyan-500/40 hover:bg-[#1E293B]/60 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ClubBadge clubId={club.id} size="md" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 truncate">
                      {club.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {club.coach} · Yaş Ort: <span className="tabular-nums">{club.averageAge}</span>
                    </div>
                    <span
                      className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${getPlayStyleBadgeClass(
                        club.playStyle
                      )}`}
                    >
                      {club.playStyle}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="tabular-nums text-sm font-bold text-emerald-400">
                    {formatMarketValue(club.totalMarketValueEur)}
                  </div>
                  <div className="tabular-nums text-[10px] text-slate-400">
                    3. Bölge: %{club.finalThirdPassIntensity}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
