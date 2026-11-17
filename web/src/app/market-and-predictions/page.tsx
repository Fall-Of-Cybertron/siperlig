import React from 'react';
import Link from 'next/link';
import { CalendarClock, Radio, Cpu, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { allMatches, allPlayers } from '@/lib/data';
import {
  formatDateTr,
  formatMarketValue,
  formatRating,
  getMonthsUntilExpiry,
  getRatingBadgeClass,
  isContractExpiringWithinOneYear,
} from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

export default function MarketAndPredictionsPage() {
  const expiringPlayers = [...allPlayers]
    .filter((p) => isContractExpiringWithinOneYear(p.contractExpiry))
    .sort((a, b) => b.currentMarketValueEur - a.currentMarketValueEur)
    .slice(0, 16);

  const activeRumours = allPlayers
    .flatMap((p) =>
      p.rumours.map((r) => ({
        player: p,
        rumour: r,
      }))
    )
    .sort((a, b) => b.rumour.transferProbability - a.rumour.transferProbability);

  // Poisson Model Scorecard metrics
  const totalMatches = allMatches.length;
  const poissonHits = allMatches.filter((m) => m.prematch.poissonCorrect).length;
  const apiHits = allMatches.filter((m) => m.prematch.apiCorrect).length;
  const poissonAcc = totalMatches > 0 ? (poissonHits / totalMatches) * 100 : 0;
  const apiAcc = totalMatches > 0 ? (apiHits / totalMatches) * 100 : 0;
  const avgPoissonBrier =
    totalMatches > 0
      ? allMatches.reduce((s, m) => s + m.prematch.poissonBrierScore, 0) / totalMatches
      : 0;
  const avgApiBrier =
    totalMatches > 0
      ? allMatches.reduce((s, m) => s + m.prematch.apiBrierScore, 0) / totalMatches
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Transfer İstihbaratı &amp; Poisson Tahmin Karnesi
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-50">
              Sözleşmesi Biten Yıldızlar, Söylenti Radarı &amp; Model Doğruluğu
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3.5 py-2">
              <div className="text-[10px] uppercase text-slate-400">Sözleşmesi &lt;1 Yıl</div>
              <div className="tabular-nums text-base font-bold text-amber-300">
                {allPlayers.filter((p) => isContractExpiringWithinOneYear(p.contractExpiry)).length}{' '}
                Oyuncu
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3.5 py-2">
              <div className="text-[10px] uppercase text-slate-400">Poisson İsabeti</div>
              <div className="tabular-nums text-base font-bold text-cyan-300">
                %{poissonAcc.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2 Columns: Expiring Contracts + High Probability Rumours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expiring Contracts (< 1 Year) */}
        <section className="lg:col-span-7 rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1F2937]">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Sözleşmesi 1 Yıldan Az Kalan Oyuncular
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Bosman / Serbest Kalma Radarı</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16]/85 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
                <tr>
                  <th className="sticky left-0 z-10 bg-[#090D16] px-4 py-2.5 font-semibold">
                    Oyuncu
                  </th>
                  <th className="px-3 py-2.5">Kulüp</th>
                  <th className="px-3 py-2.5">Mevki</th>
                  <th className="px-3 py-2.5">Bitiş Tarihi</th>
                  <th className="px-2.5 py-2.5 text-center">Reyting</th>
                  <th className="px-4 py-2.5 text-right text-emerald-400">Piyasa Değeri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/70">
                {expiringPlayers.map((p) => {
                  const months = getMonthsUntilExpiry(p.contractExpiry);
                  return (
                    <tr key={p.id} className="hover:bg-[#1E293B]/60">
                      <td className="sticky left-0 z-10 bg-[#111827] px-4 py-2.5">
                        <Link
                          href={`/players/${p.id}`}
                          className="font-semibold text-slate-100 hover:text-cyan-300 whitespace-nowrap"
                        >
                          {p.fullName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Link
                          href={`/clubs/${p.clubId}`}
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300"
                        >
                          <ClubBadge clubId={p.clubId} size="xs" />
                          <span>{p.clubName}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">
                        {p.positionMain}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="tabular-nums text-amber-300 font-semibold">
                          {formatDateTr(p.contractExpiry)}
                        </span>
                        <span className="ml-1.5 tabular-nums text-[10px] text-slate-400">
                          ({months} ay)
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 text-center">
                        <span
                          className={`tabular-nums inline-block rounded border px-1.5 py-0.5 text-[11px] font-bold ${getRatingBadgeClass(
                            p.avgMatchRating
                          )}`}
                        >
                          {formatRating(p.avgMatchRating)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-400">
                        {formatMarketValue(p.currentMarketValueEur)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* High-Probability Transfer Rumours */}
        <section className="lg:col-span-5 rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Transfer İhtimali Yüksek Yıldızlar
              </h2>
            </div>
            <span className="tabular-nums text-xs text-slate-400">
              {activeRumours.length} Söylenti
            </span>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {activeRumours.map(({ player, rumour }, idx) => (
              <div
                key={`${player.id}-${rumour.clubId}-${idx}`}
                className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/players/${player.id}`}
                      className="text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-300 truncate block"
                    >
                      {player.fullName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Link
                        href={`/clubs/${player.clubId}`}
                        className="hover:text-cyan-300 inline-flex items-center gap-1"
                      >
                        <ClubBadge clubId={player.clubId} size="xs" />
                        {player.clubName}
                      </Link>
                      <span>→</span>
                      <Link
                        href={`/clubs/${rumour.clubId}`}
                        className="font-semibold text-emerald-300 hover:text-cyan-300 inline-flex items-center gap-1"
                      >
                        <ClubBadge clubId={rumour.clubId} size="xs" />
                        {rumour.club}
                      </Link>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="tabular-nums text-sm font-black text-cyan-300">
                      %{rumour.transferProbability}
                    </div>
                    <div className="tabular-nums text-[10px] text-emerald-400">
                      {formatMarketValue(player.currentMarketValueEur)}
                    </div>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-[#1F2937] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                    style={{ width: `${rumour.transferProbability}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Kaynak: {rumour.source}</span>
                  <span className="tabular-nums">{formatDateTr(rumour.rumourDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Poisson Model Accuracy Scorecard */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#1F2937] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              Model Performans Denetimi
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
              Poisson Modeli Süper Lig Doğruluk Karnesi
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-2">
              <div className="text-[10px] text-slate-400">Poisson Doğruluk</div>
              <div className="tabular-nums font-bold text-cyan-300 text-sm">
                %{poissonAcc.toFixed(1)} ({poissonHits}/{totalMatches})
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-2">
              <div className="text-[10px] text-slate-400">API Konsensüs</div>
              <div className="tabular-nums font-bold text-slate-200 text-sm">
                %{apiAcc.toFixed(1)} ({apiHits}/{totalMatches})
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-2">
              <div className="text-[10px] text-slate-400">Poisson Brier Skoru</div>
              <div className="tabular-nums font-bold text-emerald-400 text-sm">
                {avgPoissonBrier.toFixed(3)}
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-2">
              <div className="text-[10px] text-slate-400">API Brier Skoru</div>
              <div className="tabular-nums font-bold text-slate-300 text-sm">
                {avgApiBrier.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16]/85 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
              <tr>
                <th className="sticky left-0 z-10 bg-[#090D16] px-4 py-2.5 font-semibold">Maç</th>
                <th className="px-3 py-2.5 text-center">Hafta</th>
                <th className="px-3 py-2.5 text-center">Skor</th>
                <th className="px-3 py-2.5 text-center">Poisson (1 / X / 2)</th>
                <th className="px-3 py-2.5 text-center">En Olası Skor</th>
                <th className="px-3 py-2.5 text-center">API (1 / X / 2)</th>
                <th className="px-4 py-2.5 text-center">Poisson Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/70">
              {allMatches.map((m) => (
                <tr key={`pred-${m.id}`} className="hover:bg-[#1E293B]/60">
                  <td className="sticky left-0 z-10 bg-[#111827] px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/clubs/${m.homeClubId}`}
                        className="font-semibold text-slate-100 hover:text-cyan-300"
                      >
                        {m.homeClubName}
                      </Link>
                      <span className="text-slate-500">–</span>
                      <Link
                        href={`/clubs/${m.awayClubId}`}
                        className="font-semibold text-slate-100 hover:text-cyan-300"
                      >
                        {m.awayClubName}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-400">
                    H{m.round}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Link
                      href={`/matches/${m.id}`}
                      className="tabular-nums rounded bg-[#090D16] border border-[#1F2937] hover:border-cyan-400 px-2 py-0.5 font-bold text-cyan-300"
                    >
                      {m.homeScore} - {m.awayScore}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-200">
                    %{m.prematch.poisson.homeWinProb} / %{m.prematch.poisson.drawProb} / %
                    {m.prematch.poisson.awayWinProb}
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-amber-300 font-semibold">
                    {m.prematch.poisson.mostLikelyScore}
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-400">
                    %{m.prematch.api.homeWinProb} / %{m.prematch.api.drawProb} / %
                    {m.prematch.api.awayWinProb}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {m.prematch.poissonCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Doğru
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/35 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                        <XCircle className="w-3 h-3" /> Sürpriz
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
