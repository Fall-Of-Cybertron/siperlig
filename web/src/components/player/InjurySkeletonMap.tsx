'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { RotateCw, Activity, AlertTriangle, HeartPulse, CheckCircle2 } from 'lucide-react';
import type { AnatomyRegionData, AnatomyRegionId, PlayerInjuries } from '@/types/football';
import { formatDateTr } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

interface InjurySkeletonMapProps {
  injuries: PlayerInjuries;
  playerName: string;
}

interface RegionMeta {
  id: AnatomyRegionId;
  label: string;
  primaryFace: 'front' | 'back' | 'both';
}

const REGION_METAS: RegionMeta[] = [
  { id: 'head', label: 'Baş / Yüz', primaryFace: 'both' },
  { id: 'shoulder', label: 'Omuz', primaryFace: 'both' },
  { id: 'chest_ribs', label: 'Göğüs / Kaburga', primaryFace: 'front' },
  { id: 'back', label: 'Sırt / Bel', primaryFace: 'back' },
  { id: 'arm_wrist', label: 'Kol / El Bileği', primaryFace: 'both' },
  { id: 'groin', label: 'Kasık', primaryFace: 'front' },
  { id: 'thigh_front', label: 'Ön Üst Adale', primaryFace: 'front' },
  { id: 'hamstring', label: 'Arka Adale (Hamstring)', primaryFace: 'back' },
  { id: 'knee', label: 'Diz', primaryFace: 'both' },
  { id: 'calf', label: 'Baldır', primaryFace: 'back' },
  { id: 'ankle_foot', label: 'Ayak Bileği / Ayak', primaryFace: 'both' },
  { id: 'other', label: 'Diğer / Genel Kas', primaryFace: 'both' },
];

const REGION_LABEL_MAP = new Map<AnatomyRegionId, string>(
  REGION_METAS.map((r) => [r.id, r.label])
);

function getRegionVisualStyle(count: number, isSelected: boolean) {
  if (count >= 3) {
    return {
      fill: '#EF4444',
      fillOpacity: isSelected ? 0.85 : 0.65,
      stroke: '#FCA5A5',
      filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.65))',
      badgeClass: 'bg-red-500/20 text-red-300 border-red-500/60',
      dotColor: '#EF4444',
    };
  }
  if (count === 2) {
    return {
      fill: '#9333EA',
      fillOpacity: isSelected ? 0.8 : 0.6,
      stroke: '#D8B4FE',
      filter: isSelected ? 'drop-shadow(0 0 6px rgba(147,51,234,0.6))' : undefined,
      badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-500/50',
      dotColor: '#9333EA',
    };
  }
  if (count === 1) {
    return {
      fill: '#F472B6',
      fillOpacity: isSelected ? 0.75 : 0.52,
      stroke: '#FBCFE8',
      filter: isSelected ? 'drop-shadow(0 0 6px rgba(244,114,182,0.5))' : undefined,
      badgeClass: 'bg-pink-500/20 text-pink-200 border-pink-500/45',
      dotColor: '#F472B6',
    };
  }
  return {
    fill: '#F8FAFC',
    fillOpacity: isSelected ? 0.35 : 0.12,
    stroke: isSelected ? '#06B6D4' : '#94A3B8',
    filter: undefined,
    badgeClass: 'bg-slate-800/70 text-slate-300 border-slate-700',
    dotColor: '#F8FAFC',
  };
}

export function InjurySkeletonMap({ injuries, playerName }: InjurySkeletonMapProps) {
  const injuredRegions = useMemo(() => {
    return REGION_METAS.filter((meta) => (injuries.anatomyRegions[meta.id]?.count ?? 0) > 0).sort(
      (a, b) =>
        (injuries.anatomyRegions[b.id]?.count ?? 0) -
          (injuries.anatomyRegions[a.id]?.count ?? 0) ||
        (injuries.anatomyRegions[b.id]?.totalDays ?? 0) -
          (injuries.anatomyRegions[a.id]?.totalDays ?? 0)
    );
  }, [injuries]);

  const initialRegion = injuredRegions[0]?.id ?? 'knee';
  const initialFace =
    REGION_METAS.find((m) => m.id === initialRegion)?.primaryFace === 'back' ? 'back' : 'front';

  const [viewFace, setViewFace] = useState<'front' | 'back'>(initialFace);
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegionId>(initialRegion);

  const handleSelectRegion = (regionId: AnatomyRegionId) => {
    setSelectedRegion(regionId);
    const meta = REGION_METAS.find((m) => m.id === regionId);
    if (meta && meta.primaryFace !== 'both') {
      setViewFace(meta.primaryFace);
    }
  };

  const activeData: AnatomyRegionData = injuries.anatomyRegions[selectedRegion] ?? {
    count: 0,
    totalDays: 0,
    missedGames: 0,
    heatLevel: 0,
    records: [],
  };

  const totalAnatomicalInjuries = Object.values(injuries.anatomyRegions).reduce(
    (s, r) => s + r.count,
    0
  );
  const totalAnatomicalDays = Object.values(injuries.anatomyRegions).reduce(
    (s, r) => s + r.totalDays,
    0
  );
  const totalMissedGames =
    Object.values(injuries.anatomyRegions).reduce((s, r) => s + r.missedGames, 0) +
    injuries.systemicRecords.reduce((s, r) => s + r.missedGames, 0);

  const renderZoneProps = (regionId: AnatomyRegionId) => {
    const data = injuries.anatomyRegions[regionId];
    const count = data?.count ?? 0;
    const isSel = selectedRegion === regionId;
    const style = getRegionVisualStyle(count, isSel);
    return {
      onClick: () => handleSelectRegion(regionId),
      fill: style.fill,
      fillOpacity: style.fillOpacity,
      stroke: isSel ? '#06B6D4' : style.stroke,
      strokeWidth: isSel ? 2.2 : 1.1,
      style: {
        cursor: 'pointer',
        filter: style.filter,
        transition: 'all 180ms ease',
      },
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `${REGION_LABEL_MAP.get(regionId)}: ${count} sakatlık`,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelectRegion(regionId);
        }
      },
    };
  };

  return (
    <section className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4 sm:p-6 space-y-5">
      {/* Header & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            Etkileşimli İskelet Sakatlık Haritası
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-50 mt-0.5">
            {playerName} · Anatomik Sakatlık Yoğunluğu
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-1.5 text-xs">
            <span className="text-slate-400">Toplam Kayıt: </span>
            <strong className="tabular-nums text-slate-100">{totalAnatomicalInjuries}</strong>
          </div>
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-1.5 text-xs">
            <span className="text-slate-400">Uzak Kalınan: </span>
            <strong className="tabular-nums text-amber-300">{totalAnatomicalDays} gün</strong>
          </div>
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16] px-3 py-1.5 text-xs">
            <span className="text-slate-400">Kaçırılan Maç: </span>
            <strong className="tabular-nums text-rose-400">{totalMissedGames}</strong>
          </div>
        </div>
      </div>

      {/* Main Split: Dual-Layer SVG Skeleton + Region Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SVG Skeleton & View Toggle */}
        <div className="lg:col-span-5 flex flex-col items-center rounded-2xl border border-[#1F2937] bg-[#090D16] p-4">
          <div className="w-full flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex rounded-xl bg-[#111827] border border-[#1F2937] p-0.5">
              <button
                type="button"
                onClick={() => setViewFace('front')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewFace === 'front'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ön Görünüm
              </button>
              <button
                type="button"
                onClick={() => setViewFace('back')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewFace === 'back'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Arka Görünüm
              </button>
            </div>

            <button
              type="button"
              onClick={() => setViewFace((prev) => (prev === 'front' ? 'back' : 'front'))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F2937] bg-[#111827] hover:border-cyan-500/40 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              Döndür
            </button>
          </div>

          <svg
            viewBox="0 0 260 440"
            className="w-full max-w-[270px] h-auto select-none"
            aria-label={`Anatomik İskelet Haritası (${viewFace === 'front' ? 'Ön' : 'Arka'} Görünüm)`}
          >
            {/* LAYER 1: Low-opacity Anatomical Silhouette & Skeleton (opacity: 0.22) */}
            <g opacity={0.22}>
              {/* Human Body Silhouette */}
              <path
                d="M130 18 C143 18 152 28 152 42 C152 54 145 63 138 66 L142 76 L176 88 C186 92 192 102 194 116 L204 198 C205 206 198 212 191 210 L177 142 L171 212 L175 304 L170 402 C170 412 154 414 152 403 L148 310 L134 236 L126 236 L112 310 L108 403 C106 414 90 412 90 402 L85 304 L89 212 L83 142 L69 210 C62 212 55 206 56 198 L66 116 C68 102 74 92 84 88 L118 76 L122 66 C115 63 108 54 108 42 C108 28 117 18 130 18 Z"
                fill="#CBD5E1"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />
              {/* Skull & Spine */}
              <circle cx="130" cy="40" r="14" fill="none" stroke="#E2E8F0" strokeWidth="1.4" />
              <line x1="130" y1="54" x2="130" y2="210" stroke="#E2E8F0" strokeWidth="2.4" strokeDasharray="4 3" />
              {/* Clavicles & Ribcage */}
              <path d="M95 88 Q130 78 165 88" fill="none" stroke="#E2E8F0" strokeWidth="2" />
              <ellipse cx="130" cy="122" rx="26" ry="30" fill="none" stroke="#E2E8F0" strokeWidth="1.4" />
              <line x1="108" y1="112" x2="152" y2="112" stroke="#E2E8F0" strokeWidth="1" />
              <line x1="106" y1="124" x2="154" y2="124" stroke="#E2E8F0" strokeWidth="1" />
              <line x1="110" y1="136" x2="150" y2="136" stroke="#E2E8F0" strokeWidth="1" />
              {/* Pelvis */}
              <path d="M100 198 Q130 222 160 198 Q155 224 130 226 Q105 224 100 198 Z" fill="none" stroke="#E2E8F0" strokeWidth="1.6" />
              {/* Arm Bones */}
              <line x1="90" y1="94" x2="74" y2="150" stroke="#E2E8F0" strokeWidth="2" />
              <line x1="74" y1="150" x2="63" y2="202" stroke="#E2E8F0" strokeWidth="1.7" />
              <line x1="170" y1="94" x2="186" y2="150" stroke="#E2E8F0" strokeWidth="2" />
              <line x1="186" y1="150" x2="197" y2="202" stroke="#E2E8F0" strokeWidth="1.7" />
              {/* Leg Bones & Knees */}
              <line x1="110" y1="220" x2="104" y2="306" stroke="#E2E8F0" strokeWidth="2.4" />
              <circle cx="104" cy="310" r="6" fill="none" stroke="#E2E8F0" strokeWidth="1.6" />
              <line x1="104" y1="316" x2="100" y2="395" stroke="#E2E8F0" strokeWidth="2" />
              <line x1="150" y1="220" x2="156" y2="306" stroke="#E2E8F0" strokeWidth="2.4" />
              <circle cx="156" cy="310" r="6" fill="none" stroke="#E2E8F0" strokeWidth="1.6" />
              <line x1="156" y1="316" x2="160" y2="395" stroke="#E2E8F0" strokeWidth="2" />
            </g>

            {/* LAYER 2: 12 Interactive Clickable Heat Zones */}
            {/* Head (Both views) */}
            <ellipse cx="130" cy="40" rx="18" ry="20" {...renderZoneProps('head')} />

            {/* Shoulders (Both views) */}
            <g>
              <ellipse cx="89" cy="92" rx="14" ry="11" {...renderZoneProps('shoulder')} />
              <ellipse cx="171" cy="92" rx="14" ry="11" {...renderZoneProps('shoulder')} />
            </g>

            {/* Arm / Wrist (Both views) */}
            <g>
              <rect x="57" y="138" width="16" height="62" rx="8" transform="rotate(11 65 169)" {...renderZoneProps('arm_wrist')} />
              <rect x="187" y="138" width="16" height="62" rx="8" transform="rotate(-11 195 169)" {...renderZoneProps('arm_wrist')} />
            </g>

            {viewFace === 'front' ? (
              <>
                {/* Chest & Ribs */}
                <rect x="103" y="96" width="54" height="58" rx="12" {...renderZoneProps('chest_ribs')} />
                {/* Groin */}
                <path d="M106 196 L154 196 L142 228 L118 228 Z" {...renderZoneProps('groin')} />
                {/* Thigh Front (Quadriceps) */}
                <rect x="92" y="232" width="26" height="62" rx="10" {...renderZoneProps('thigh_front')} />
                <rect x="142" y="232" width="26" height="62" rx="10" {...renderZoneProps('thigh_front')} />
              </>
            ) : (
              <>
                {/* Back / Lower Back */}
                <rect x="102" y="98" width="56" height="86" rx="12" {...renderZoneProps('back')} />
                {/* Hamstring (Rear Thigh) */}
                <rect x="92" y="226" width="26" height="68" rx="10" {...renderZoneProps('hamstring')} />
                <rect x="142" y="226" width="26" height="68" rx="10" {...renderZoneProps('hamstring')} />
                {/* Calf */}
                <rect x="91" y="328" width="21" height="52" rx="9" {...renderZoneProps('calf')} />
                <rect x="148" y="328" width="21" height="52" rx="9" {...renderZoneProps('calf')} />
              </>
            )}

            {/* Knees (Both views) */}
            <g>
              <circle cx="104" cy="310" r="13" {...renderZoneProps('knee')} />
              <circle cx="156" cy="310" r="13" {...renderZoneProps('knee')} />
            </g>

            {/* Ankle & Foot (Both views) */}
            <g>
              <ellipse cx="99" cy="400" rx="14" ry="12" {...renderZoneProps('ankle_foot')} />
              <ellipse cx="161" cy="400" rx="14" ry="12" {...renderZoneProps('ankle_foot')} />
            </g>

            {/* Other / General Muscular Badge Hotspot */}
            <g>
              <rect x="202" y="246" width="50" height="24" rx="8" {...renderZoneProps('other')} />
              <text
                x="227"
                y="262"
                textAnchor="middle"
                fill="#E2E8F0"
                fontSize="9"
                fontWeight="600"
                className="pointer-events-none"
              >
                Diğer
              </text>
            </g>
          </svg>

          {/* Color Heat Legend */}
          <div className="mt-3 w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-400 pt-3 border-t border-[#1F2937]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F8FAFC]/30 border border-slate-500" />
              <span>0 Sakatlık</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F472B6]" />
              <span>1 Sakatlık</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" />
              <span>2 Sakatlık</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <span>3+ (Kronik)</span>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Chips + Selected Region Chronological Records */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mobile & Desktop Bidirectional Horizontal Chip Strip */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Anatomik Bölgeler (Dokunarak Eşleştirin)
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {REGION_METAS.map((meta) => {
                const reg = injuries.anatomyRegions[meta.id];
                const count = reg?.count ?? 0;
                const days = reg?.totalDays ?? 0;
                const isSelected = selectedRegion === meta.id;
                const style = getRegionVisualStyle(count, isSelected);

                return (
                  <button
                    key={meta.id}
                    type="button"
                    onClick={() => handleSelectRegion(meta.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                      style.badgeClass
                    } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#111827]' : ''}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: style.dotColor }}
                    />
                    <span>{meta.label}</span>
                    {count > 0 ? (
                      <span className="tabular-nums opacity-90">
                        · {count} Sakatlık ({days} gün)
                      </span>
                    ) : (
                      <span className="opacity-50">· 0</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Region Detail Table */}
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/80 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#1F2937] bg-[#090D16]">
              <div className="flex items-center gap-2">
                {activeData.count >= 3 ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : activeData.count > 0 ? (
                  <HeartPulse className="w-4 h-4 text-pink-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <h3 className="text-sm font-bold text-slate-100">
                  {REGION_LABEL_MAP.get(selectedRegion)} Bölgesi Kayıtları
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs tabular-nums">
                <span className="text-slate-400">
                  Tekrar: <strong className="text-slate-100">{activeData.count}</strong>
                </span>
                <span className="text-slate-400">
                  Süre: <strong className="text-amber-300">{activeData.totalDays} gün</strong>
                </span>
                <span className="text-slate-400">
                  Kaçırılan Maç: <strong className="text-rose-400">{activeData.missedGames}</strong>
                </span>
              </div>
            </div>

            {activeData.records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827]/80 text-[11px] uppercase text-slate-400 border-b border-[#1F2937]">
                    <tr>
                      <th className="px-4 py-2">Tarih Aralığı</th>
                      <th className="px-3 py-2">Sakatlık Nedeni</th>
                      <th className="px-3 py-2">Kulüp</th>
                      <th className="px-3 py-2 text-right">Gün</th>
                      <th className="px-4 py-2 text-right">Maç</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]/70">
                    {activeData.records.map((rec, idx) => (
                      <tr key={`${selectedRegion}-rec-${idx}`} className="hover:bg-[#1E293B]/60">
                        <td className="px-4 py-2.5 tabular-nums text-slate-300 whitespace-nowrap">
                          {formatDateTr(rec.fromDate)} → {formatDateTr(rec.toDate)}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-100">{rec.reason}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Link
                            href={`/clubs/${rec.clubId}`}
                            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-300"
                          >
                            <ClubBadge clubId={rec.clubId} size="xs" />
                            <span>{rec.clubName}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-amber-300 font-semibold">
                          {rec.days}g
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-rose-400 font-semibold">
                          {rec.missedGames}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Bu anatomik bölgede kaydedilmiş resmi bir sakatlık bulunmamaktadır.
              </div>
            )}
          </div>

          {/* Systemic Records: Corona virus, Fever, Fitness, Rest */}
          <div className="rounded-xl border border-[#1F2937] bg-[#090D16]/70 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Hastalık &amp; Kondisyon Geçmişi (Sistemik Kayıtlar)
              </h3>
              <span className="text-[11px] text-slate-500">İskelet haritasından bağımsızdır</span>
            </div>
            {injuries.systemicRecords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {injuries.systemicRecords.map((sys, idx) => (
                  <div
                    key={`sys-${idx}`}
                    className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-[#111827] px-3 py-2 text-xs"
                  >
                    <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                      {sys.category}
                    </span>
                    <span className="font-semibold text-slate-100">{sys.reason}</span>
                    <span className="tabular-nums text-slate-400">
                      ({formatDateTr(sys.fromDate)} · {sys.days}g · {sys.missedGames} maç)
                    </span>
                    <Link
                      href={`/clubs/${sys.clubId}`}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] underline-offset-2 hover:underline"
                    >
                      {sys.clubName}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Kayıtlı hastalık, ateş veya kondisyon/dinlenme eksikliği bulunmamaktadır.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
