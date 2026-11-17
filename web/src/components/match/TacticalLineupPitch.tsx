'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import type { LineupPlayerNode, MatchInitialLineup } from '@/types/football';
import { formatRating, getRatingBadgeClass } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

interface TacticalLineupPitchProps {
  lineup: MatchInitialLineup;
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
}

function PitchTeamColumn({
  rows,
  clubId,
  clubName,
  formation,
  invertAttackDirection = false,
}: {
  rows: LineupPlayerNode[][];
  clubId: string;
  clubName: string;
  formation: string;
  invertAttackDirection?: boolean;
}) {
  const orderedRows = invertAttackDirection ? [...rows].reverse() : rows;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <Link
          href={`/clubs/${clubId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-100 hover:text-cyan-300"
        >
          <ClubBadge clubId={clubId} size="xs" />
          <span>{clubName}</span>
        </Link>
        <span className="tabular-nums rounded-md bg-[#090D16] border border-[#1F2937] px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
          {formation}
        </span>
      </div>

      <div
        className="relative rounded-2xl border border-emerald-500/25 p-4 flex flex-col justify-between gap-4 min-h-[430px] overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(9,13,22,0.92) 50%, rgba(6,182,212,0.10) 100%)',
        }}
      >
        {/* Turf Markings */}
        <div className="pointer-events-none absolute inset-3 rounded-xl border border-emerald-500/20">
          <div className="absolute top-1/2 left-0 right-0 border-t border-emerald-500/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-emerald-500/15" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-12 border-b border-x border-emerald-500/20" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 border-t border-x border-emerald-500/20" />
        </div>

        {orderedRows.map((row, rIdx) => (
          <div
            key={`line-${clubId}-${rIdx}`}
            className="relative z-10 flex items-center justify-around gap-1.5"
          >
            {row.map((node) => (
              <Link
                key={node.playerId}
                href={`/players/${node.playerId}`}
                className="flex flex-col items-center text-center group max-w-[78px]"
              >
                <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#111827] border-2 border-cyan-500/45 group-hover:border-cyan-300 shadow-md transition-all">
                  <span className="tabular-nums text-xs font-bold text-slate-100">
                    {node.shirtNumber}
                  </span>

                  {/* Match Rating Badge */}
                  <span
                    className={`tabular-nums absolute -top-2 -right-2.5 rounded border px-1 py-0.5 text-[9.5px] font-bold leading-none ${getRatingBadgeClass(
                      node.matchRating
                    )}`}
                  >
                    {formatRating(node.matchRating)}
                  </span>

                  {/* Goal / Assist / Card Indicators */}
                  {(node.goals > 0 || node.assists > 0 || node.yellowCard) && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                      {node.goals > 0 && (
                        <span
                          title={`${node.goals} Gol`}
                          className="rounded-full bg-emerald-500 text-[#090D16] px-1 text-[8.5px] font-black leading-tight"
                        >
                          ⚽{node.goals > 1 ? node.goals : ''}
                        </span>
                      )}
                      {node.assists > 0 && (
                        <span
                          title={`${node.assists} Asist`}
                          className="rounded-full bg-cyan-400 text-[#090D16] px-1 text-[8.5px] font-black leading-tight"
                        >
                          A{node.assists > 1 ? node.assists : ''}
                        </span>
                      )}
                      {node.yellowCard && (
                        <span
                          title="Sarı Kart"
                          className="w-2 h-2.5 rounded-[2px] bg-amber-400 border border-black/40"
                        />
                      )}
                    </div>
                  )}
                </div>

                <span className="mt-1.5 text-[10.5px] font-semibold text-slate-100 group-hover:text-cyan-300 truncate max-w-[76px]">
                  {node.name}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TacticalLineupPitch({
  lineup,
  homeClubId,
  homeClubName,
  awayClubId,
  awayClubName,
}: TacticalLineupPitchProps) {
  const [mobileSide, setMobileSide] = useState<'home' | 'away'>('home');

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100">
            2D Gerçek Diziliş Sahası &amp; Maç Reytingleri
          </h2>
        </div>

        {/* Mobile Switcher */}
        <div className="flex lg:hidden rounded-xl bg-[#090D16] border border-[#1F2937] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMobileSide('home')}
            className={`px-3 py-1 rounded-lg font-semibold ${
              mobileSide === 'home' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            {homeClubName}
          </button>
          <button
            type="button"
            onClick={() => setMobileSide('away')}
            className={`px-3 py-1 rounded-lg font-semibold ${
              mobileSide === 'away' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
            }`}
          >
            {awayClubName}
          </button>
        </div>
      </div>

      {/* Mobile: single active team */}
      <div className="lg:hidden">
        {mobileSide === 'home' ? (
          <PitchTeamColumn
            rows={lineup.home}
            clubId={homeClubId}
            clubName={homeClubName}
            formation={lineup.homeFormation}
            invertAttackDirection
          />
        ) : (
          <PitchTeamColumn
            rows={lineup.away}
            clubId={awayClubId}
            clubName={awayClubName}
            formation={lineup.awayFormation}
            invertAttackDirection
          />
        )}
      </div>

      {/* Desktop: side-by-side comparison */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-5">
        <PitchTeamColumn
          rows={lineup.home}
          clubId={homeClubId}
          clubName={homeClubName}
          formation={lineup.homeFormation}
          invertAttackDirection
        />
        <PitchTeamColumn
          rows={lineup.away}
          clubId={awayClubId}
          clubName={awayClubName}
          formation={lineup.awayFormation}
          invertAttackDirection
        />
      </div>
    </section>
  );
}
