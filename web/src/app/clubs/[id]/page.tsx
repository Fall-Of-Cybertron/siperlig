import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Users, Calendar, Activity, Flame, ArrowRight } from 'lucide-react';
import { allClubs, getClubById, getMatchesByClubId, getStandingByClubId } from '@/lib/data';
import { formatDateTr, formatMarketValue, getPlayStyleBadgeClass } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';
import { ClubSquadTable } from '@/components/club/ClubSquadTable';

export function generateStaticParams() {
  return allClubs.map((club) => ({
    id: club.id,
  }));
}

export default function ClubDetailPage({ params }: { params: { id: string } }) {
  const club = getClubById(params.id);
  if (!club) {
    notFound();
  }

  const standing = getStandingByClubId(club.id);
  const clubMatches = getMatchesByClubId(club.id);

  return (
    <div className="space-y-6">
      {/* Club Tactical DNA & Valuation Header Card */}
      <section
        className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at top right, ${club.primaryColor}33, #111827 55%)`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <ClubBadge clubId={club.id} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                  {club.leagueName}
                </span>
                {standing && (
                  <span className="tabular-nums rounded-full bg-[#090D16] border border-[#1F2937] px-2 py-0.5 text-[11px] font-bold text-slate-200">
                    Lig #{standing.rank} · {standing.overall.points} Puan
                  </span>
                )}
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getPlayStyleBadgeClass(
                    club.playStyle
                  )}`}
                >
                  {club.playStyle}
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-50">{club.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {club.city} · {club.stadium}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Teknik Direktör: <strong className="text-slate-200">{club.coach}</strong>
                </span>
                <span className="tabular-nums">Kuruluş: {club.founded}</span>
              </div>
            </div>
          </div>

          {/* Key Club Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Kadro Değeri</div>
              <div className="tabular-nums mt-0.5 text-base sm:text-lg font-bold text-emerald-400">
                {formatMarketValue(club.totalMarketValueEur)}
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Yaş Ortalaması</div>
              <div className="tabular-nums mt-0.5 text-base sm:text-lg font-bold text-slate-100">
                {club.averageAge.toFixed(1)}
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Gol - xG Sapması</div>
              <div
                className={`tabular-nums mt-0.5 text-base sm:text-lg font-bold ${
                  club.goalsMinusXg >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {club.goalsMinusXg >= 0 ? `+${club.goalsMinusXg.toFixed(1)}` : club.goalsMinusXg.toFixed(1)}
              </div>
            </div>
            <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 px-3.5 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">3. Bölge Pas Yoğ.</div>
              <div className="tabular-nums mt-0.5 text-base sm:text-lg font-bold text-cyan-300">
                %{club.finalThirdPassIntensity.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Tactical DNA Strip */}
        <div className="mt-5 pt-4 border-t border-[#1F2937]/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center justify-between rounded-lg bg-[#090D16]/60 px-3 py-2 border border-[#1F2937]/70">
            <span className="text-slate-400">Hücum xG</span>
            <span className="tabular-nums font-bold text-slate-100">{club.xGFor.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#090D16]/60 px-3 py-2 border border-[#1F2937]/70">
            <span className="text-slate-400">Savunma xGA</span>
            <span className="tabular-nums font-bold text-slate-100">{club.xGAgainst.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#090D16]/60 px-3 py-2 border border-[#1F2937]/70">
            <span className="text-slate-400">Ort. Topla Oynama</span>
            <span className="tabular-nums font-bold text-cyan-300">%{club.possessionAvg.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#090D16]/60 px-3 py-2 border border-[#1F2937]/70">
            <span className="text-slate-400">Baskı (PPDA)</span>
            <span className="tabular-nums font-bold text-emerald-400">{club.ppda.toFixed(1)}</span>
          </div>
        </div>
      </section>

      {/* Squad Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Güncel Kadro &amp; Sözleşme / Sakatlık Matrisi
          </h2>
          <span className="text-xs text-slate-400">Oyuncu künyesi için isme tıklayın</span>
        </div>

        {club.squad.length > 0 ? (
          <ClubSquadTable squad={club.squad} />
        ) : (
          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 text-sm text-slate-400">
            Bu Avrupa / partner kulübü için Süper Lig transfer ve söylenti veritabanında bağlantılı kayıtlar mevcuttur.
          </div>
        )}
      </section>

      {/* Club Fixtures & Results */}
      {clubMatches.length > 0 && (
        <section className="rounded-2xl border border-[#1F2937] bg-[#111827] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1F2937]">
            <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Kulüp Fikstürü &amp; Analiz Edilen Maçlar
            </h2>
            <Link
              href="/matches"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              Tüm Maç Merkezi <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#1F2937]/70">
            {clubMatches.map((m) => {
              const isHome = m.homeClubId === club.id;
              const won =
                (isHome && m.homeScore > m.awayScore) || (!isHome && m.awayScore > m.homeScore);
              const drew = m.homeScore === m.awayScore;
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[#1E293B]/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-[11px] font-semibold text-slate-400 bg-[#090D16] border border-[#1F2937] rounded px-2 py-0.5">
                      H{m.round}
                    </span>
                    <span className="tabular-nums text-xs text-slate-400">{formatDateTr(m.date)}</span>
                    <span
                      className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                        won
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : drew
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {won ? 'G' : drew ? 'B' : 'M'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <Link
                      href={`/clubs/${m.homeClubId}`}
                      className={`inline-flex items-center gap-1.5 hover:text-cyan-300 ${
                        m.homeClubId === club.id ? 'font-bold text-slate-50' : 'text-slate-300'
                      }`}
                    >
                      <ClubBadge clubId={m.homeClubId} size="xs" />
                      <span>{m.homeClubName}</span>
                    </Link>

                    <Link
                      href={`/matches/${m.id}`}
                      className="tabular-nums rounded-lg bg-[#090D16] border border-[#1F2937] hover:border-cyan-400 px-3 py-1 font-bold text-cyan-300 transition-colors"
                    >
                      {m.homeScore} - {m.awayScore}
                    </Link>

                    <Link
                      href={`/clubs/${m.awayClubId}`}
                      className={`inline-flex items-center gap-1.5 hover:text-cyan-300 ${
                        m.awayClubId === club.id ? 'font-bold text-slate-50' : 'text-slate-300'
                      }`}
                    >
                      <span>{m.awayClubName}</span>
                      <ClubBadge clubId={m.awayClubId} size="xs" />
                    </Link>
                  </div>

                  <Link
                    href={`/matches/${m.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                  >
                    <Flame className="w-3.5 h-3.5" /> Maç Merkezi
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
