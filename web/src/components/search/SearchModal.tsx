'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Shield, User, Calendar, ArrowRight } from 'lucide-react';
import { allClubs, allMatches, allPlayers } from '@/lib/data';
import { formatMarketValue, formatRating, normalizeTr } from '@/lib/format';
import { ClubBadge } from '@/components/common/ClubBadge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = normalizeTr(query);
    if (!q) {
      return {
        players: [...allPlayers]
          .sort((a, b) => b.currentMarketValueEur - a.currentMarketValueEur)
          .slice(0, 5),
        clubs: allClubs.filter((c) => c.isSuperLig).slice(0, 5),
        matches: allMatches.slice(0, 4),
      };
    }

    const players = allPlayers
      .filter((p) => {
        const hay = normalizeTr(`${p.name} ${p.fullName} ${p.clubName} ${p.positionMain} ${p.citizenship}`);
        return hay.includes(q);
      })
      .sort((a, b) => b.currentMarketValueEur - a.currentMarketValueEur)
      .slice(0, 7);

    const clubs = allClubs
      .filter((c) => {
        const hay = normalizeTr(`${c.name} ${c.shortName} ${c.city} ${c.coach} ${c.leagueName}`);
        return hay.includes(q);
      })
      .slice(0, 6);

    const matches = allMatches
      .filter((m) => {
        const hay = normalizeTr(`${m.homeClubName} ${m.awayClubName} ${m.venue} hafta ${m.round}`);
        return hay.includes(q);
      })
      .slice(0, 5);

    return { players, clubs, matches };
  }, [query]);

  if (!isOpen) return null;

  const handleQuickEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (results.players[0]) {
        onClose();
        router.push(`/players/${results.players[0].id}`);
      } else if (results.clubs[0]) {
        onClose();
        router.push(`/clubs/${results.clubs[0].id}`);
      } else if (results.matches[0]) {
        onClose();
        router.push(`/matches/${results.matches[0].id}`);
      }
    }
  };

  const hasAny =
    results.players.length > 0 || results.clubs.length > 0 || results.matches.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm px-3 pt-16 sm:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Oyuncu ve Kulüp Arama"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#1F2937] px-4 py-3.5 bg-[#090D16]/70">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleQuickEnter}
            placeholder="Oyuncu, kulüp, teknik direktör veya maç ara (ör. Osimhen, Uğurcan, Şişli...)"
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-[#1E293B]"
            >
              Temizle
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-3 space-y-4">
          {!hasAny && (
            <div className="py-12 text-center text-sm text-slate-400">
              &ldquo;{query}&rdquo; için eşleşen oyuncu, kulüp veya maç bulunamadı.
            </div>
          )}

          {results.players.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {query ? 'Eşleşen Oyuncular' : 'En Değerli Yıldızlar'}
              </div>
              <div className="space-y-1">
                {results.players.map((p) => (
                  <Link
                    key={p.id}
                    href={`/players/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-[#1E293B] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ClubBadge clubId={p.clubId} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 truncate">
                          {p.fullName}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {p.clubName} · {p.positionMain} · {p.age} yaş
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="tabular-nums text-xs font-semibold text-emerald-400">
                        {formatMarketValue(p.currentMarketValueEur)}
                      </span>
                      <span className="tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-[#090D16] border border-[#1F2937] text-cyan-300">
                        {formatRating(p.avgMatchRating)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.clubs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Kulüpler
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {results.clubs.map((c) => (
                  <Link
                    key={c.id}
                    href={`/clubs/${c.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 border border-transparent hover:border-[#1F2937] hover:bg-[#1E293B] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ClubBadge clubId={c.id} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-100 group-hover:text-cyan-300 truncate">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.leagueName} · {c.playStyle}
                        </div>
                      </div>
                    </div>
                    <span className="tabular-nums text-xs font-semibold text-emerald-400 shrink-0">
                      {formatMarketValue(c.totalMarketValueEur)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.matches.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Maçlar
              </div>
              <div className="space-y-1">
                {results.matches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-[#1E293B] transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                      <span className="text-[11px] text-slate-500 tabular-nums">H{m.round}</span>
                      <span className="font-medium group-hover:text-cyan-300">{m.homeClubName}</span>
                      <span className="tabular-nums font-bold px-2 py-0.5 rounded bg-[#090D16] border border-[#1F2937] text-cyan-300">
                        {m.homeScore} - {m.awayScore}
                      </span>
                      <span className="font-medium group-hover:text-cyan-300">{m.awayClubName}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#1F2937] px-4 py-2 bg-[#090D16]/70 text-[11px] text-slate-500">
          <span>Türkçe karakter duyarsız arama aktif (İ→i, Ş→s, Ğ→g, Ç→c)</span>
          <span className="hidden sm:inline">Enter: İlk sonuca git · ESC: Kapat</span>
        </div>
      </div>
    </div>
  );
}
