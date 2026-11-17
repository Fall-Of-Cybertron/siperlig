'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Crosshair } from 'lucide-react';
import type { GoalTargetZone, ShotEvent } from '@/types/football';

interface GoalTargetMatrixProps {
  shots: ShotEvent[];
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
}

const INSIDE_ZONES: { id: GoalTargetZone; label: string }[] = [
  { id: 'High Left', label: 'Üst Sol' },
  { id: 'High Center', label: 'Üst Orta' },
  { id: 'High Right', label: 'Üst Sağ' },
  { id: 'Low Left', label: 'Alt Sol' },
  { id: 'Low Center', label: 'Alt Orta' },
  { id: 'Low Right', label: 'Alt Sağ' },
];

const OUTSIDE_ZONES: { id: GoalTargetZone; label: string }[] = [
  { id: 'Close Left', label: 'Sol Direk Yanı' },
  { id: 'Close High', label: 'Üst Direk Üstü' },
  { id: 'Close Right', label: 'Sağ Direk Yanı' },
];

const ALL_ZONE_LABELS = new Map<GoalTargetZone, string>(
  [...INSIDE_ZONES, ...OUTSIDE_ZONES].map((z) => [z.id, z.label])
);

export function GoalTargetMatrix({
  shots,
  homeClubId,
  homeClubName,
  awayClubId,
  awayClubName,
}: GoalTargetMatrixProps) {
  const [teamFilter, setTeamFilter] = useState<'ALL' | string>('ALL');
  const [selectedZone, setSelectedZone] = useState<GoalTargetZone | 'ALL'>('ALL');

  const teamShots = useMemo(() => {
    if (teamFilter === 'ALL') return shots;
    return shots.filter((s) => s.clubId === teamFilter);
  }, [shots, teamFilter]);

  const zoneMap = useMemo(() => {
    const map = new Map<GoalTargetZone, ShotEvent[]>();
    for (const z of [...INSIDE_ZONES, ...OUTSIDE_ZONES]) {
      map.set(z.id, []);
    }
    for (const s of teamShots) {
      const list = map.get(s.goalTarget) ?? [];
      list.push(s);
      map.set(s.goalTarget, list);
    }
    return map;
  }, [teamShots]);

  const displayedShots = useMemo(() => {
    if (selectedZone === 'ALL') return teamShots;
    return teamShots.filter((s) => s.goalTarget === selectedZone);
  }, [teamShots, selectedZone]);

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Crosshair className="w-3.5 h-3.5" />
            Kale Şut Köşe Haritası (6 Kale Bölgesi + Direk Dışı)
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
            Gol, Kurtarış &amp; Hedef Yoğunluğu
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#090D16] p-1 rounded-xl border border-[#1F2937] text-xs">
          {[
            { id: 'ALL', label: `Tümü (${shots.length})` },
            { id: homeClubId, label: homeClubName },
            { id: awayClubId, label: awayClubName },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTeamFilter(opt.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                teamFilter === opt.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Goalframe 6-Zone Grid */}
        <div className="lg:col-span-6 space-y-3">
          {/* Close High bar */}
          {(() => {
            const highList = zoneMap.get('Close High') ?? [];
            const isSel = selectedZone === 'Close High';
            return (
              <button
                type="button"
                onClick={() => setSelectedZone(isSel ? 'ALL' : 'Close High')}
                className={`w-full rounded-lg border px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                  isSel
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                    : 'border-[#1F2937] bg-[#090D16] text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Üst Direk Üstü (Close High)</span>
                <span className="tabular-nums font-bold">{highList.length} Şut</span>
              </button>
            );
          })()}

          {/* Goalframe + Side Post Zones */}
          <div className="grid grid-cols-12 gap-2 items-stretch">
            {/* Close Left */}
            {(() => {
              const leftList = zoneMap.get('Close Left') ?? [];
              const isSel = selectedZone === 'Close Left';
              return (
                <button
                  type="button"
                  onClick={() => setSelectedZone(isSel ? 'ALL' : 'Close Left')}
                  className={`col-span-2 rounded-xl border p-2 flex flex-col items-center justify-center text-center text-[10px] transition-colors ${
                    isSel
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                      : 'border-[#1F2937] bg-[#090D16]/70 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Sol Dış</span>
                  <strong className="tabular-nums text-xs text-slate-200 mt-1">
                    {leftList.length}
                  </strong>
                </button>
              );
            })()}

            {/* Inside Goalpost 3x2 Matrix */}
            <div className="col-span-8 rounded-t-xl border-t-4 border-x-4 border-slate-300/80 bg-[#090D16] p-2 grid grid-cols-3 gap-2 relative shadow-[0_0_24px_rgba(6,182,212,0.08)]">
              {INSIDE_ZONES.map((zone) => {
                const list = zoneMap.get(zone.id) ?? [];
                const goals = list.filter((s) => s.outcome === 'Goal').length;
                const saved = list.filter((s) => s.outcome === 'Saved').length;
                const isSel = selectedZone === zone.id;
                const intensity = Math.min(0.45, list.length * 0.09);

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(isSel ? 'ALL' : zone.id)}
                    className={`rounded-lg border p-2.5 text-left transition-all min-h-[82px] flex flex-col justify-between ${
                      isSel
                        ? 'border-cyan-400 ring-1 ring-cyan-400'
                        : 'border-[#1F2937] hover:border-slate-500'
                    }`}
                    style={{
                      backgroundColor:
                        goals > 0
                          ? `rgba(16, 185, 129, ${0.14 + goals * 0.14})`
                          : `rgba(6, 182, 212, ${intensity})`,
                    }}
                  >
                    <div className="text-[10px] font-semibold text-slate-300">{zone.label}</div>
                    <div className="mt-1">
                      <div className="tabular-nums text-sm font-black text-slate-50">
                        {list.length} Şut
                      </div>
                      <div className="tabular-nums text-[10px] text-slate-300 flex items-center gap-1.5">
                        {goals > 0 && <span className="text-emerald-300 font-bold">{goals} Gol</span>}
                        {saved > 0 && <span className="text-cyan-300">{saved} Kurt.</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Close Right */}
            {(() => {
              const rightList = zoneMap.get('Close Right') ?? [];
              const isSel = selectedZone === 'Close Right';
              return (
                <button
                  type="button"
                  onClick={() => setSelectedZone(isSel ? 'ALL' : 'Close Right')}
                  className={`col-span-2 rounded-xl border p-2 flex flex-col items-center justify-center text-center text-[10px] transition-colors ${
                    isSel
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                      : 'border-[#1F2937] bg-[#090D16]/70 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Sağ Dış</span>
                  <strong className="tabular-nums text-xs text-slate-200 mt-1">
                    {rightList.length}
                  </strong>
                </button>
              );
            })()}
          </div>

          {selectedZone !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedZone('ALL')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Bölge filtresini temizle ({ALL_ZONE_LABELS.get(selectedZone)})
            </button>
          )}
        </div>

        {/* Shot List for Selected Zone */}
        <div className="lg:col-span-6 rounded-xl border border-[#1F2937] bg-[#090D16]/80 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1F2937] text-xs">
            <span className="font-bold text-slate-200">
              {selectedZone === 'ALL'
                ? 'Tüm Şut Olayları'
                : `${ALL_ZONE_LABELS.get(selectedZone)} Bölgesi Şutları`}
            </span>
            <span className="tabular-nums text-slate-400">{displayedShots.length} şut</span>
          </div>
          <div className="max-h-[250px] overflow-y-auto divide-y divide-[#1F2937]/60">
            {displayedShots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 px-4 py-2 text-xs hover:bg-[#1E293B]/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="tabular-nums text-[11px] font-bold text-slate-400 w-7">
                    {s.minute}&apos;
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      s.outcome === 'Goal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : s.outcome === 'Saved'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : s.outcome === 'Blocked'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                    }`}
                  >
                    {s.outcome === 'Goal'
                      ? 'GOL'
                      : s.outcome === 'Saved'
                        ? 'KURTARIŞ'
                        : s.outcome === 'Blocked'
                          ? 'BLOK'
                          : 'AUT'}
                  </span>
                  <Link
                    href={`/players/${s.playerId}`}
                    className="font-semibold text-slate-100 hover:text-cyan-300 truncate"
                  >
                    {s.playerName}
                  </Link>
                </div>
                <div className="flex items-center gap-3 shrink-0 tabular-nums text-[11px] text-slate-400">
                  <span>{ALL_ZONE_LABELS.get(s.goalTarget)}</span>
                  <span className="text-cyan-300 font-semibold">xG: {s.xG.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
