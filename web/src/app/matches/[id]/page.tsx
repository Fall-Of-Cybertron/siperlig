import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Calendar,
  CloudSun,
  UserCheck,
  Users,
  Cpu,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { allMatches, getMatchById } from '@/lib/data';
import { formatDateTr } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';
import { TacticalLineupPitch } from '@/components/match/TacticalLineupPitch';
import { GoalTargetMatrix } from '@/components/match/GoalTargetMatrix';
import {
  LiveProbabilityChart,
  MatchBoxScoreTable,
  MatchStatsBoard,
} from '@/components/match/MatchAnalyticsWidgets';

export function generateStaticParams() {
  return allMatches.map((match) => ({
    id: match.id,
  }));
}

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = getMatchById(params.id);
  if (!match) {
    notFound();
  }

  const homeGoals = match.events.filter((e) => e.type === 'goal' && e.clubId === match.homeClubId);
  const awayGoals = match.events.filter((e) => e.type === 'goal' && e.clubId === match.awayClubId);

  return (
    <div className="space-y-6">
      {/* Match Scoreboard */}
      <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#1F2937] text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-cyan-500/15 border border-cyan-500/35 px-2.5 py-0.5 font-bold text-cyan-300 tabular-nums">
              {match.season} · {match.round}. Hafta
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              {formatDateTr(match.date)} · {match.kickoffTime}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {match.venue} (<span className="tabular-nums">{match.attendance.toLocaleString('tr-TR')}</span> seyirci)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Hakem: {match.referee}
            </span>
            <span className="inline-flex items-center gap-1">
              <CloudSun className="w-3.5 h-3.5 text-sky-400" />
              {match.forecast}
            </span>
          </div>
        </div>

        {/* Main Score Row */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-11 items-center gap-4">
          <div className="sm:col-span-4 flex flex-col items-center sm:items-end text-center sm:text-right gap-2">
            <Link
              href={`/clubs/${match.homeClubId}`}
              className="flex flex-col sm:flex-row items-center gap-3 group"
            >
              <span className="text-lg sm:text-2xl font-black text-slate-50 group-hover:text-cyan-300 transition-colors order-2 sm:order-1">
                {match.homeClubName}
              </span>
              <span className="order-1 sm:order-2">
                <ClubBadge clubId={match.homeClubId} size="lg" />
              </span>
            </Link>
            <div className="space-y-0.5 text-xs text-slate-300">
              {homeGoals.map((g) => (
                <div key={g.id} className="flex items-center justify-center sm:justify-end gap-1.5">
                  <Link href={`/players/${g.playerId}`} className="hover:text-cyan-300 font-medium">
                    {g.playerName}
                  </Link>
                  <span className="tabular-nums text-emerald-400 font-bold">{g.minute}&apos;</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-3 flex flex-col items-center justify-center">
            <div className="tabular-nums rounded-2xl border border-cyan-500/40 bg-[#090D16] px-6 py-3 text-3xl sm:text-4xl font-black text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.18)]">
              {match.homeScore} - {match.awayScore}
            </div>
            <div className="mt-2 tabular-nums text-xs text-slate-400">
              İlk Yarı: <strong className="text-slate-200">{match.halfTimeScore}</strong> · Maç Sonu
            </div>
          </div>

          <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <Link
              href={`/clubs/${match.awayClubId}`}
              className="flex flex-col sm:flex-row items-center gap-3 group"
            >
              <ClubBadge clubId={match.awayClubId} size="lg" />
              <span className="text-lg sm:text-2xl font-black text-slate-50 group-hover:text-cyan-300 transition-colors">
                {match.awayClubName}
              </span>
            </Link>
            <div className="space-y-0.5 text-xs text-slate-300">
              {awayGoals.map((g) => (
                <div key={g.id} className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="tabular-nums text-emerald-400 font-bold">{g.minute}&apos;</span>
                  <Link href={`/players/${g.playerId}`} className="hover:text-cyan-300 font-medium">
                    {g.playerName}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Component 3: 2D Tactical Lineup Pitch */}
      <TacticalLineupPitch
        lineup={match.initialLineup}
        homeClubId={match.homeClubId}
        homeClubName={match.homeClubName}
        awayClubId={match.awayClubId}
        awayClubName={match.awayClubName}
      />

      {/* 40 Team Stats Comparison */}
      <MatchStatsBoard
        stats={match.stats}
        homeClubName={match.homeClubName}
        awayClubName={match.awayClubName}
      />

      {/* Component 4: Goal Target Matrix */}
      <GoalTargetMatrix
        shots={match.shots}
        homeClubId={match.homeClubId}
        homeClubName={match.homeClubName}
        awayClubId={match.awayClubId}
        awayClubName={match.awayClubName}
      />

      {/* Live Win Probability & Poisson vs API Prematch Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <LiveProbabilityChart
            points={match.liveProbabilities}
            homeClubName={match.homeClubName}
            awayClubName={match.awayClubName}
          />
        </div>

        <section className="lg:col-span-5 rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Poisson vs. API Maç Önü Tahmini
              </h2>
            </div>
            <span className="tabular-nums text-xs font-bold px-2 py-0.5 rounded bg-[#090D16] border border-[#1F2937] text-slate-200">
              Sonuç: {match.prematch.actualOutcome}
            </span>
          </div>

          {/* Poisson Model */}
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300">SiperLig Poisson Modeli</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  match.prematch.poissonCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {match.prematch.poissonCorrect ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> İsabetli
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Sapma
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center tabular-nums text-xs">
              <div className="rounded-lg bg-[#111827] p-2 border border-[#1F2937]">
                <div className="text-[10px] text-slate-400">1 ({match.homeClubName})</div>
                <div className="font-bold text-cyan-300">%{match.prematch.poisson.homeWinProb}</div>
              </div>
              <div className="rounded-lg bg-[#111827] p-2 border border-[#1F2937]">
                <div className="text-[10px] text-slate-400">X (Beraberlik)</div>
                <div className="font-bold text-amber-300">%{match.prematch.poisson.drawProb}</div>
              </div>
              <div className="rounded-lg bg-[#111827] p-2 border border-[#1F2937]">
                <div className="text-[10px] text-slate-400">2 ({match.awayClubName})</div>
                <div className="font-bold text-emerald-400">%{match.prematch.poisson.awayWinProb}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 tabular-nums pt-1">
              <span>
                Beklenen Gol: {match.prematch.poisson.expectedHomeGoals.toFixed(2)} –{' '}
                {match.prematch.poisson.expectedAwayGoals.toFixed(2)}
              </span>
              <span>En Olası Skor: {match.prematch.poisson.mostLikelyScore}</span>
              <span>2.5 Üst: %{match.prematch.poisson.over25Prob}</span>
            </div>
          </div>

          {/* API Market Consensus */}
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{match.prematch.api.provider}</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  match.prematch.apiCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {match.prematch.apiCorrect ? 'İsabetli' : 'Sapma'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center tabular-nums text-xs">
              <div className="rounded-lg bg-[#111827] p-2 border border-[#1F2937]">
                <div className="text-[10px] text-slate-400">1</div>
                <div className="font-bold text-slate-200">%{match.prematch.api.homeWinProb}</div>
              </div>
              <div className="rounded-lg bg-[#111827] p-2 border border-[#1F2937]">
                <div className="text-[10px] text-slate-400">X</div>
                <div className="font-bold text-slate-200">%{match.prematch.api.drawProb}</div>
              </div>
              <div className="rounded-lg bg-[#111827] p-2 border border-[#1F2937]">
                <div className="text-[10px] text-slate-400">2</div>
                <div className="font-bold text-slate-200">%{match.prematch.api.awayWinProb}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums pt-1">
              <span>Poisson Brier: {match.prematch.poissonBrierScore.toFixed(2)}</span>
              <span>API Brier: {match.prematch.apiBrierScore.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* BoxScore Table */}
      <MatchBoxScoreTable
        boxScore={match.boxScore}
        homeClubId={match.homeClubId}
        homeClubName={match.homeClubName}
        awayClubId={match.awayClubId}
        awayClubName={match.awayClubName}
      />

      {/* Minute-by-Minute Events & YouTube Highlight Embed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1F2937] pb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Dakika Bazlı Maç Olayları
            </h2>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {match.events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-[#090D16]/75 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="tabular-nums font-bold text-cyan-300 w-8 shrink-0">
                    {ev.minute}&apos;
                  </span>
                  <ClubBadge clubId={ev.clubId} size="xs" />
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      ev.type === 'goal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {ev.type === 'goal' ? 'GOL' : 'SARI KART'}
                  </span>
                  <div className="min-w-0 truncate">
                    <Link
                      href={`/players/${ev.playerId}`}
                      className="font-semibold text-slate-100 hover:text-cyan-300"
                    >
                      {ev.playerName}
                    </Link>
                    {ev.assistPlayerId && ev.assistPlayerName && (
                      <span className="text-slate-400">
                        {' '}
                        (Asist:{' '}
                        <Link
                          href={`/players/${ev.assistPlayerId}`}
                          className="text-slate-300 hover:text-cyan-300"
                        >
                          {ev.assistPlayerName}
                        </Link>
                        )
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 hidden sm:inline">
                  {ev.detail}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Embedded YouTube Highlight */}
        <section className="lg:col-span-6 rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Maçın Golleri &amp; Video Özeti
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">YouTube Gömülü Oynatıcı</span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#1F2937] bg-[#090D16]">
            <iframe
              src={match.highlightEmbedUrl}
              title={`${match.homeClubName} - ${match.awayClubName} Maç Özeti`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              <Link href={`/clubs/${match.homeClubId}`} className="hover:text-cyan-300">
                {match.homeClubName}
              </Link>{' '}
              vs{' '}
              <Link href={`/clubs/${match.awayClubId}`} className="hover:text-cyan-300">
                {match.awayClubName}
              </Link>
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" /> {match.round}. Hafta Özeti
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
