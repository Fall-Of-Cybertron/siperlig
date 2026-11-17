import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  ArrowRight,
  Award,
  Flame,
} from 'lucide-react';
import {
  allMatches,
  allPlayers,
  getGoldenEleven,
  standingsData,
  superLigClubs,
} from '@/lib/data';
import {
  formatMarketValue,
  formatRating,
  getInjuryRiskBadgeClass,
  getPlayStyleBadgeClass,
  getRatingBadgeClass,
} from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

export default function HomePage() {
  const latestRoundMatches = allMatches.filter((m) => m.round === standingsData.currentRound);
  const topStandings = standingsData.standings.slice(0, 10);
  const goldenEleven = getGoldenEleven();
  const topScorers = [...allPlayers]
    .filter((p) => p.positionGroup !== 'GK')
    .sort((a, b) => b.goals - a.goals || b.avgMatchRating - a.avgMatchRating)
    .slice(0, 5);
  const topAssisters = [...allPlayers]
    .filter((p) => p.positionGroup !== 'GK')
    .sort((a, b) => b.assists - a.assists || b.avgMatchRating - a.avgMatchRating)
    .slice(0, 5);
  const topKeepers = [...allPlayers]
    .filter((p) => p.positionGroup === 'GK' && typeof p.PSxG_plus_minus === 'number')
    .sort((a, b) => (b.PSxG_plus_minus ?? 0) - (a.PSxG_plus_minus ?? 0))
    .slice(0, 5);
  const topValuedPlayers = [...allPlayers]
    .sort((a, b) => b.currentMarketValueEur - a.currentMarketValueEur)
    .slice(0, 10);

  const totalLeagueValue = superLigClubs.reduce((s, c) => s + c.totalMarketValueEur, 0);

  // Arrange Golden 11 into tactical rows for the showcase pitch
  const gkRow = goldenEleven.filter((p) => p.positionGroup === 'GK');
  const dfRow = goldenEleven.filter((p) => p.positionGroup === 'DF');
  const mfRow = goldenEleven.filter((p) => p.positionGroup === 'MF');
  const fwRow = goldenEleven.filter((p) => p.positionGroup === 'FW');

  return (
    <div className="space-y-6">
      {/* Top KPI & Latest Round Match Ticker */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Trendyol Süper Lig · {standingsData.season} · {standingsData.currentRound}. Hafta İstihbaratı
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-50">
              Lig, Kadro Değerleri &amp; Taktik Analiz Vitrini
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Toplam Lig Değeri</div>
              <div className="tabular-nums text-sm sm:text-base font-bold text-emerald-400">
                {formatMarketValue(totalLeagueValue)}
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">İzlenen Oyuncu</div>
              <div className="tabular-nums text-sm sm:text-base font-bold text-cyan-300">
                {allPlayers.length} Profil
              </div>
            </div>
          </div>
        </div>

        {/* Latest Round Score Strip */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">
              {standingsData.currentRound}. Hafta Maç Skorları (Detay için skora tıklayın)
            </span>
            <Link
              href="/matches"
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              Tüm Maçlar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {latestRoundMatches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#1F2937] bg-[#090D16]/70 px-3 py-2 hover:border-cyan-500/40 transition-colors"
              >
                <Link
                  href={`/clubs/${m.homeClubId}`}
                  className="flex items-center gap-2 min-w-0 flex-1 hover:text-cyan-300 transition-colors"
                >
                  <ClubBadge clubId={m.homeClubId} size="xs" />
                  <span className="text-xs font-medium truncate">{m.homeClubName}</span>
                </Link>
                <Link
                  href={`/matches/${m.id}`}
                  className="tabular-nums shrink-0 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-cyan-400/60 px-2.5 py-1 text-xs font-bold text-cyan-300 transition-colors"
                >
                  {m.homeScore} - {m.awayScore}
                </Link>
                <Link
                  href={`/clubs/${m.awayClubId}`}
                  className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right hover:text-cyan-300 transition-colors"
                >
                  <span className="text-xs font-medium truncate">{m.awayClubName}</span>
                  <ClubBadge clubId={m.awayClubId} size="xs" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main 2-Column Section: Standings Snapshot + Golden XI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Standings Snapshot */}
        <section className="lg:col-span-6 rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1F2937]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-100">Süper Lig Puan Durumu Özeti</h2>
            </div>
            <Link
              href="/standings"
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              Tam Tablo &amp; Trendler <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16]/80 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
                <tr>
                  <th className="sticky left-0 z-10 bg-[#090D16] px-3 py-2.5 font-semibold">Takım</th>
                  <th className="px-2 py-2.5 text-center">O</th>
                  <th className="px-2 py-2.5 text-center">G</th>
                  <th className="px-2 py-2.5 text-center">B</th>
                  <th className="px-2 py-2.5 text-center">M</th>
                  <th className="px-2 py-2.5 text-center">AV</th>
                  <th className="px-2 py-2.5 text-center">Form</th>
                  <th className="px-3 py-2.5 text-right font-bold text-cyan-300">P</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/70">
                {topStandings.map((row) => (
                  <tr key={row.clubId} className="hover:bg-[#1E293B]/60 transition-colors">
                    <td className="sticky left-0 z-10 bg-[#111827] px-3 py-2.5">
                      <Link
                        href={`/clubs/${row.clubId}`}
                        className="flex items-center gap-2 group min-w-[130px]"
                      >
                        <span
                          className={`tabular-nums w-5 text-[11px] font-bold ${
                            row.rank <= 2
                              ? 'text-emerald-400'
                              : row.rank <= 4
                                ? 'text-cyan-400'
                                : 'text-slate-400'
                          }`}
                        >
                          {row.rank}
                        </span>
                        <ClubBadge clubId={row.clubId} size="xs" />
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                          {row.clubName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-slate-300">{row.overall.played}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-emerald-400">{row.overall.won}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-slate-400">{row.overall.drawn}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-rose-400">{row.overall.lost}</td>
                    <td className="px-2 py-2.5 text-center tabular-nums text-slate-300">
                      {row.overall.goalDifference > 0 ? `+${row.overall.goalDifference}` : row.overall.goalDifference}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {row.recentMatches.slice(0, 5).map((rm, idx) => (
                          <Link
                            key={`${row.clubId}-rm-${idx}`}
                            href={`/matches/${rm.matchId}`}
                            title={`${rm.opponentName} (${rm.score})`}
                            className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-transform hover:scale-110 ${
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
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-50">
                      {row.overall.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Golden XI of the Week */}
        <section className="lg:col-span-6 rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1F2937]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Haftanın Altın 11&apos;i (4-3-3)</h2>
            </div>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5">
              Reyting Liderleri
            </span>
          </div>

          <div
            className="relative flex-1 p-4 flex flex-col justify-between gap-3 min-h-[380px]"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(16,185,129,0.14), rgba(9,13,22,0.96) 75%)',
            }}
          >
            {/* Subtle Pitch Lines */}
            <div className="pointer-events-none absolute inset-3 rounded-xl border border-emerald-500/20">
              <div className="absolute top-1/2 left-0 right-0 border-t border-emerald-500/15" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-emerald-500/15" />
            </div>

            {[fwRow, mfRow, dfRow, gkRow].map((line, lineIdx) => (
              <div
                key={`gold-line-${lineIdx}`}
                className="relative z-10 flex items-center justify-around gap-1.5 sm:gap-2"
              >
                {line.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col items-center text-center max-w-[92px] group"
                  >
                    <Link
                      href={`/players/${player.id}`}
                      className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#111827] border-2 border-cyan-500/50 group-hover:border-cyan-300 shadow-lg transition-all"
                    >
                      <span className="tabular-nums text-xs font-bold text-slate-100">
                        {player.shirtNumber}
                      </span>
                      <span
                        className={`tabular-nums absolute -top-2 -right-2 rounded-md border px-1 py-0.5 text-[10px] font-bold leading-none ${getRatingBadgeClass(
                          player.avgMatchRating
                        )}`}
                      >
                        {formatRating(player.avgMatchRating)}
                      </span>
                    </Link>
                    <Link
                      href={`/players/${player.id}`}
                      className="mt-1 text-[11px] font-semibold text-slate-100 hover:text-cyan-300 truncate max-w-[88px]"
                    >
                      {player.name}
                    </Link>
                    <Link
                      href={`/clubs/${player.clubId}`}
                      className="text-[10px] text-slate-400 hover:text-emerald-300 truncate max-w-[88px]"
                    >
                      {player.clubName}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Statistical Leaders: Goals, Assists, Goalkeeper PSxG +/- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Gol Krallığı',
            icon: Flame,
            accent: 'text-rose-400',
            metricLabel: 'Gol',
            players: topScorers,
            getValue: (p: (typeof allPlayers)[number]) => p.goals,
            getSub: (p: (typeof allPlayers)[number]) => `xG: ${p.xG.toFixed(1)}`,
          },
          {
            title: 'Asist Liderleri',
            icon: Target,
            accent: 'text-cyan-400',
            metricLabel: 'Asist',
            players: topAssisters,
            getValue: (p: (typeof allPlayers)[number]) => p.assists,
            getSub: (p: (typeof allPlayers)[number]) => `xA: ${p.xA.toFixed(1)}`,
          },
          {
            title: 'Kaleci PSxG +/- Liderleri',
            icon: ShieldCheck,
            accent: 'text-emerald-400',
            metricLabel: 'PSxG +/-',
            players: topKeepers,
            getValue: (p: (typeof allPlayers)[number]) =>
              `+${(p.PSxG_plus_minus ?? 0).toFixed(1)}`,
            getSub: (p: (typeof allPlayers)[number]) => `Kurtarış: %${p.savePercentage?.toFixed(1)}`,
          },
        ].map((board) => {
          const Icon = board.icon;
          return (
            <div
              key={board.title}
              className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${board.accent}`} />
                  <h2 className="text-sm font-bold text-slate-100">{board.title}</h2>
                </div>
                <span className="text-[11px] text-slate-400">{board.metricLabel}</span>
              </div>
              <div className="divide-y divide-[#1F2937]/60">
                {board.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-[#1E293B]/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="tabular-nums text-xs font-bold text-slate-500 w-4">
                        {idx + 1}.
                      </span>
                      <ClubBadge clubId={p.clubId} size="xs" />
                      <div className="min-w-0">
                        <Link
                          href={`/players/${p.id}`}
                          className="block text-xs font-semibold text-slate-100 hover:text-cyan-300 truncate"
                        >
                          {p.fullName}
                        </Link>
                        <Link
                          href={`/clubs/${p.clubId}`}
                          className="block text-[11px] text-slate-400 hover:text-emerald-300 truncate"
                        >
                          {p.clubName} · <span className="tabular-nums">{board.getSub(p)}</span>
                        </Link>
                      </div>
                    </div>
                    <span className="tabular-nums text-sm font-bold text-cyan-300 shrink-0">
                      {board.getValue(p)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Top 10 Most Valuable Players Showcase */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Süper Lig&apos;in En Değerli 10 Futbolcusu (Transfermarkt Radarı)
            </h2>
          </div>
          <Link
            href="/market-and-predictions"
            className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            Sözleşme &amp; Transfer Radarı <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16]/80 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
              <tr>
                <th className="sticky left-0 z-10 bg-[#090D16] px-4 py-2.5 font-semibold">Oyuncu</th>
                <th className="px-3 py-2.5">Kulüp</th>
                <th className="px-3 py-2.5">Pozisyon</th>
                <th className="px-3 py-2.5 text-center">Yaş</th>
                <th className="px-3 py-2.5 text-center">Sakatlık Riski</th>
                <th className="px-3 py-2.5 text-center">Reyting</th>
                <th className="px-3 py-2.5 text-right">Zirve Değer</th>
                <th className="px-4 py-2.5 text-right text-emerald-400">Güncel Değer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/70">
              {topValuedPlayers.map((p, idx) => (
                <tr key={p.id} className="hover:bg-[#1E293B]/60 transition-colors">
                  <td className="sticky left-0 z-10 bg-[#111827] px-4 py-2.5">
                    <Link
                      href={`/players/${p.id}`}
                      className="flex items-center gap-2.5 group min-w-[160px]"
                    >
                      <span className="tabular-nums text-[11px] font-bold text-slate-500 w-4">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                        {p.fullName}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/clubs/${p.clubId}`}
                      className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300"
                    >
                      <ClubBadge clubId={p.clubId} size="xs" />
                      <span>{p.clubName}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{p.positionMain}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-300">{p.age}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getInjuryRiskBadgeClass(
                        p.injuryRisk
                      )}`}
                    >
                      {p.injuryRisk}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`tabular-nums inline-block rounded border px-1.5 py-0.5 text-[11px] font-bold ${getRatingBadgeClass(
                        p.avgMatchRating
                      )}`}
                    >
                      {formatRating(p.avgMatchRating)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">
                    {formatMarketValue(p.peakMarketValueEur)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-400">
                    {formatMarketValue(p.currentMarketValueEur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Tactical Club Strip */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-100">Kulüp Taktik DNA &amp; Kadro Değerleri</h2>
          <Link href="/standings" className="text-xs text-cyan-400 hover:text-cyan-300">
            Tümünü İncele →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {superLigClubs.slice(0, 6).map((c) => (
            <Link
              key={c.id}
              href={`/clubs/${c.id}`}
              className="rounded-xl border border-[#1F2937] bg-[#090D16]/70 p-3 hover:border-cyan-500/40 hover:bg-[#1E293B]/60 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <ClubBadge clubId={c.id} size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 truncate">
                    {c.name}
                  </div>
                  <div className="tabular-nums text-[11px] font-semibold text-emerald-400">
                    {formatMarketValue(c.totalMarketValueEur)}
                  </div>
                </div>
              </div>
              <span
                className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getPlayStyleBadgeClass(
                  c.playStyle
                )}`}
              >
                {c.playStyle}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
