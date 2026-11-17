import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  User,
  ArrowRightLeft,
  Radio,
  BarChart2,
  CalendarClock,
  ShieldAlert,
} from 'lucide-react';
import { allPlayers, getClubById, getPlayerById } from '@/lib/data';
import {
  formatDateTr,
  formatMarketValue,
  formatRating,
  getInjuryRiskBadgeClass,
  getMonthsUntilExpiry,
  getRatingBadgeClass,
  isContractExpiringWithinOneYear,
} from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';
import { InjurySkeletonMap } from '@/components/player/InjurySkeletonMap';
import { MarketValueTimeline } from '@/components/player/MarketValueTimeline';

export function generateStaticParams() {
  return allPlayers.map((player) => ({
    id: player.id,
  }));
}

function RadialMetricRing({
  label,
  valueLabel,
  percent,
  color,
  subLabel,
}: {
  label: string;
  valueLabel: string;
  percent: number;
  color: string;
  subLabel?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center rounded-xl border border-[#1F2937] bg-[#090D16]/75 p-3 text-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke="#1F2937" strokeWidth="6" />
          <circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="tabular-nums absolute text-sm font-bold text-slate-100">{valueLabel}</span>
      </div>
      <div className="mt-1.5 text-xs font-semibold text-slate-200">{label}</div>
      {subLabel && <div className="text-[10px] text-slate-400 tabular-nums">{subLabel}</div>}
    </div>
  );
}

export default function PlayerDetailPage({ params }: { params: { id: string } }) {
  const player = getPlayerById(params.id);
  if (!player) {
    notFound();
  }

  const club = getClubById(player.clubId);
  const expiringSoon = isContractExpiringWithinOneYear(player.contractExpiry);
  const monthsLeft = getMonthsUntilExpiry(player.contractExpiry);
  const isGoalkeeper = player.positionGroup === 'GK';

  return (
    <div className="space-y-6">
      {/* Player Bio & Contract Header */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-[#090D16] shadow-lg">
              <span className="tabular-nums text-2xl sm:text-3xl font-black text-cyan-300">
                #{player.shirtNumber}
              </span>
              <span
                className={`tabular-nums absolute -bottom-2 -right-2 rounded-lg border px-1.5 py-0.5 text-xs font-bold ${getRatingBadgeClass(
                  player.avgMatchRating
                )}`}
              >
                {formatRating(player.avgMatchRating)}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/clubs/${player.clubId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F2937] bg-[#090D16] hover:border-cyan-500/50 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                >
                  <ClubBadge clubId={player.clubId} size="xs" />
                  <span>{player.clubName}</span>
                </Link>
                <span className="rounded-lg bg-cyan-500/15 border border-cyan-500/35 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                  {player.positionMain}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${getInjuryRiskBadgeClass(
                    player.injuryRisk
                  )}`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Sakatlık Riski: {player.injuryRisk}
                </span>
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-50">
                {player.fullName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  {player.citizenship} · <span className="tabular-nums">{player.age} yaş</span> (
                  {formatDateTr(player.birthDate)})
                </span>
                <span className="tabular-nums">Boy: {player.height} cm</span>
                <span>Ayak: {player.foot}</span>
                {player.positionSecondary.length > 0 && (
                  <span>Yan Mevki: {player.positionSecondary.join(', ')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Market Value & Contract KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Güncel Değer</div>
              <div className="tabular-nums mt-0.5 text-lg sm:text-xl font-black text-emerald-400">
                {formatMarketValue(player.currentMarketValueEur)}
              </div>
              <div className="tabular-nums text-[11px] text-slate-400">
                Zirve: {formatMarketValue(player.peakMarketValueEur)}
              </div>
            </div>

            <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CalendarClock className="w-3 h-3 text-amber-400" />
                Sözleşme Bitişi
              </div>
              <div
                className={`tabular-nums mt-0.5 text-sm sm:text-base font-bold ${
                  expiringSoon ? 'text-amber-300' : 'text-slate-100'
                }`}
              >
                {formatDateTr(player.contractExpiry)}
              </div>
              <div className="tabular-nums text-[11px] text-slate-400">
                {monthsLeft} ay kaldı {expiringSoon ? '· Kritik' : ''}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#1F2937] bg-[#090D16] px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">2026 Süper Lig</div>
              <div className="tabular-nums mt-0.5 text-sm sm:text-base font-bold text-cyan-300">
                {player.gamesPlayed} Maç · {player.minutesPlayed}&apos;
              </div>
              <div className="tabular-nums text-[11px] text-slate-400">
                {isGoalkeeper
                  ? `PSxG +/-: ${(player.PSxG_plus_minus ?? 0) >= 0 ? '+' : ''}${(
                      player.PSxG_plus_minus ?? 0
                    ).toFixed(1)}`
                  : `${player.goals} Gol · ${player.assists} Asist`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Rings */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              {isGoalkeeper
                ? 'Kaleci Performans Halkaları & PSxG +/- Analizi'
                : '2026 Süper Lig Per-90 Performans Halkaları'}
            </h2>
          </div>
          {club && (
            <Link href={`/clubs/${club.id}`} className="text-xs text-cyan-400 hover:text-cyan-300">
              {club.name} Kadrosuna Dön →
            </Link>
          )}
        </div>

        {isGoalkeeper ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <RadialMetricRing
              label="PSxG +/-"
              valueLabel={`${(player.PSxG_plus_minus ?? 0) >= 0 ? '+' : ''}${(
                player.PSxG_plus_minus ?? 0
              ).toFixed(1)}`}
              percent={Math.min(100, Math.max(15, 50 + (player.PSxG_plus_minus ?? 0) * 6))}
              color="#10B981"
              subLabel="Önlenen Gol"
            />
            <RadialMetricRing
              label="Kurtarış Yüzdesi"
              valueLabel={`%${(player.savePercentage ?? 72).toFixed(1)}`}
              percent={player.savePercentage ?? 72}
              color="#06B6D4"
              subLabel="İsabetli Şut"
            />
            <RadialMetricRing
              label="Gol Yemeden Maç"
              valueLabel={`${player.cleanSheets ?? 0}`}
              percent={((player.cleanSheets ?? 0) / Math.max(1, player.gamesPlayed)) * 100}
              color="#A855F7"
              subLabel={`${player.gamesPlayed} maçta`}
            />
            <RadialMetricRing
              label="Pas İsabeti"
              valueLabel={`%${player.passAccuracy.toFixed(1)}`}
              percent={player.passAccuracy}
              color="#38BDF8"
              subLabel="Oyun Kurulumu"
            />
            <RadialMetricRing
              label="Sezon Reytingi"
              valueLabel={formatRating(player.avgMatchRating)}
              percent={player.avgMatchRating * 10}
              color="#F59E0B"
              subLabel="10 üzerinden"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <RadialMetricRing
              label="90 Dk Başına Gol"
              valueLabel={player.per90Goals.toFixed(2)}
              percent={Math.min(100, player.per90Goals * 95)}
              color="#10B981"
              subLabel={`${player.goals} Gol (xG: ${player.xG.toFixed(1)})`}
            />
            <RadialMetricRing
              label="90 Dk Başına Asist"
              valueLabel={player.per90Assists.toFixed(2)}
              percent={Math.min(100, player.per90Assists * 120)}
              color="#06B6D4"
              subLabel={`${player.assists} Asist (xA: ${player.xA.toFixed(1)})`}
            />
            <RadialMetricRing
              label="Kilit Pas / 90"
              valueLabel={player.keyPassesPer90.toFixed(2)}
              percent={Math.min(100, player.keyPassesPer90 * 28)}
              color="#A855F7"
              subLabel="Şans Yaratma"
            />
            <RadialMetricRing
              label="Pas İsabeti"
              valueLabel={`%${player.passAccuracy.toFixed(1)}`}
              percent={player.passAccuracy}
              color="#38BDF8"
              subLabel={`Prog/90: ${player.progressiveActionsPer90.toFixed(1)}`}
            />
            <RadialMetricRing
              label="Ortalama Reyting"
              valueLabel={formatRating(player.avgMatchRating)}
              percent={player.avgMatchRating * 10}
              color="#F59E0B"
              subLabel={`${player.yellowCards} Sarı · ${player.redCards} Kırmızı`}
            />
          </div>
        )}
      </section>

      {/* Component 1: Interactive Injury Skeleton Map */}
      <InjurySkeletonMap injuries={player.injuries} playerName={player.fullName} />

      {/* Component 2: Market Value Timeline */}
      <MarketValueTimeline
        history={player.marketValueHistory}
        peakValueEur={player.peakMarketValueEur}
      />

      {/* Transfers & Active Rumours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transfer History */}
        <section className="lg:col-span-7 rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[#1F2937]">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Bonservis &amp; Transfer Geçmişi
            </h2>
          </div>

          {player.transfers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090D16]/80 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
                  <tr>
                    <th className="px-4 py-2.5">Sezon</th>
                    <th className="px-3 py-2.5">Tarih</th>
                    <th className="px-3 py-2.5">Ayrıldığı</th>
                    <th className="px-3 py-2.5">Katıldığı</th>
                    <th className="px-3 py-2.5 text-right">Piyasa Değeri</th>
                    <th className="px-4 py-2.5 text-right text-emerald-400">Bedel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]/70">
                  {player.transfers.map((tr, idx) => (
                    <tr key={`tr-${idx}`} className="hover:bg-[#1E293B]/60">
                      <td className="px-4 py-2.5 tabular-nums font-medium text-slate-200">
                        {tr.season}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-slate-400">
                        {formatDateTr(tr.transferDate)}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/clubs/${tr.fromClubId}`}
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300"
                        >
                          <ClubBadge clubId={tr.fromClubId} size="xs" />
                          <span>{tr.from}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/clubs/${tr.toClubId}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-slate-100 hover:text-cyan-300"
                        >
                          <ClubBadge clubId={tr.toClubId} size="xs" />
                          <span>{tr.to}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">
                        {formatMarketValue(tr.marketValue)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-400">
                        {tr.fee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-xs text-slate-400">
              Kulüp altyapısı / istikrarlı kadro oyuncusu; yakın dönem bonservis hareketi yok.
            </div>
          )}
        </section>

        {/* Active Transfer Rumours */}
        <section className="lg:col-span-5 rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Aktif Transfer Söylentileri
              </h2>
            </div>
            <Link
              href="/market-and-predictions"
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Radara Git →
            </Link>
          </div>

          {player.rumours.length > 0 ? (
            <div className="space-y-3">
              {player.rumours.map((r, idx) => (
                <div
                  key={`rum-${idx}`}
                  className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/clubs/${r.clubId}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-100 hover:text-cyan-300"
                    >
                      <ClubBadge clubId={r.clubId} size="xs" />
                      <span>{r.club}</span>
                    </Link>
                    <span className="tabular-nums text-xs font-bold text-cyan-300">
                      %{r.transferProbability}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#1F2937] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                      style={{ width: `${r.transferProbability}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Kaynak: {r.source}</span>
                    <span className="tabular-nums">{formatDateTr(r.rumourDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              Şu anda aktif transfer söylentisi bulunmamaktadır.
            </div>
          )}
        </section>
      </div>

      {/* Career Summary per Club */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        <div className="px-4 py-3.5 border-b border-[#1F2937]">
          <h2 className="text-sm sm:text-base font-bold text-slate-100">
            Kulüp &amp; Turnuva Kariyer Özeti
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D16]/80 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
              <tr>
                <th className="px-4 py-2.5">Kulüp</th>
                <th className="px-3 py-2.5">Turnuva</th>
                <th className="px-3 py-2.5">Dönem</th>
                <th className="px-3 py-2.5 text-center">Maç</th>
                <th className="px-3 py-2.5 text-right">Dakika</th>
                <th className="px-3 py-2.5 text-center">Gol</th>
                <th className="px-3 py-2.5 text-center">Asist</th>
                <th className="px-4 py-2.5 text-right">Ort. Reyting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/70">
              {player.perClub.map((c, idx) => (
                <tr key={`pc-${idx}`} className="hover:bg-[#1E293B]/60">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/clubs/${c.clubId}`}
                      className="inline-flex items-center gap-2 font-semibold text-slate-100 hover:text-cyan-300"
                    >
                      <ClubBadge clubId={c.clubId} size="xs" />
                      <span>{c.clubName}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{c.competition}</td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-400">{c.seasonRange}</td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-slate-200">{c.games}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">
                    {c.minutes}&apos;
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-emerald-400 font-semibold">
                    {c.goals}
                  </td>
                  <td className="px-3 py-2.5 text-center tabular-nums text-cyan-300 font-semibold">
                    {c.assists}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={`tabular-nums inline-block rounded border px-1.5 py-0.5 text-[11px] font-bold ${getRatingBadgeClass(
                        c.avgRating
                      )}`}
                    >
                      {formatRating(c.avgRating)}
                    </span>
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
