'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Award } from 'lucide-react';
import type { MarketValuePoint } from '@/types/football';
import { formatDateTr, formatMarketValue } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

interface MarketValueTimelineProps {
  history: MarketValuePoint[];
  peakValueEur: number;
}

export function MarketValueTimeline({ history, peakValueEur }: MarketValueTimelineProps) {
  const sorted = useMemo(
    () => [...history].sort((a, b) => a.recordedDate.localeCompare(b.recordedDate)),
    [history]
  );

  const [activeIdx, setActiveIdx] = useState<number>(Math.max(0, sorted.length - 1));

  if (sorted.length === 0) {
    return null;
  }

  const maxVal = Math.max(peakValueEur, ...sorted.map((p) => p.value), 1_000_000);
  const width = 580;
  const height = 220;
  const padL = 56;
  const padR = 24;
  const padT = 24;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const coords = sorted.map((pt, i) => {
    const x = sorted.length === 1 ? padL + plotW / 2 : padL + (i / (sorted.length - 1)) * plotW;
    const y = padT + plotH - (pt.value / maxVal) * plotH;
    return { x, y, pt };
  });

  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padT + plotH} L ${coords[0].x} ${
    padT + plotH
  } Z`;

  const activePoint = coords[Math.min(activeIdx, coords.length - 1)];

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            Transfermarkt Piyasa Değeri Eğrisi
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-50 mt-0.5">
            Kariyer Değer Gelişimi
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 tabular-nums">
          <Award className="w-4 h-4" />
          Zirve: {formatMarketValue(peakValueEur)}
        </div>
      </div>

      {/* Interactive Tooltip / Active Point Banner */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1F2937] bg-[#090D16] px-4 py-2.5 text-xs">
          <div className="flex items-center gap-3">
            <ClubBadge clubId={activePoint.pt.clubId} size="sm" />
            <div>
              <Link
                href={`/clubs/${activePoint.pt.clubId}`}
                className="font-bold text-slate-100 hover:text-cyan-300"
              >
                {activePoint.pt.club}
              </Link>
              <div className="text-[11px] text-slate-400 tabular-nums">
                {formatDateTr(activePoint.pt.recordedDate)} · {activePoint.pt.age} yaş
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-slate-500">Seçili Tarih Değeri</div>
            <div className="tabular-nums text-base font-bold text-emerald-400">
              {formatMarketValue(activePoint.pt.value)}
            </div>
          </div>
        </div>
      )}

      {/* SVG Area Chart */}
      <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/70 p-2 sm:p-3 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[360px] h-auto">
          <defs>
            <linearGradient id="mvAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padT + plotH * (1 - ratio);
            const val = maxVal * ratio;
            return (
              <g key={`mv-grid-${ratio}`}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#1F2937" strokeDasharray="3 3" />
                <text
                  x={padL - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  className="tabular-nums"
                >
                  {formatMarketValue(val)}
                </text>
              </g>
            );
          })}

          {/* Area & Line */}
          <path d={areaPath} fill="url(#mvAreaGrad)" />
          <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {coords.map((c, idx) => {
            const isPeak = c.pt.value === peakValueEur;
            const isActive = idx === activeIdx;
            return (
              <g
                key={`mv-pt-${idx}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setActiveIdx(idx)}
                className="cursor-pointer"
              >
                <text
                  x={c.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isActive ? '#06B6D4' : '#64748B'}
                  fontSize="10"
                  className="tabular-nums"
                >
                  {c.pt.recordedDate.slice(0, 4)}
                </text>
                {isPeak && (
                  <text
                    x={c.x}
                    y={c.y - 10}
                    textAnchor="middle"
                    fill="#FBBF24"
                    fontSize="9.5"
                    fontWeight="700"
                    className="tabular-nums"
                  >
                    Zirve {formatMarketValue(c.pt.value)}
                  </text>
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isActive ? 6.5 : isPeak ? 5.5 : 4.5}
                  fill={isPeak ? '#FBBF24' : '#090D16'}
                  stroke={isActive ? '#06B6D4' : '#10B981'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
