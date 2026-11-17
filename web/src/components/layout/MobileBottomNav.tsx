'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Swords, TrendingUp, Search } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

export function MobileBottomNav({ onOpenSearch }: MobileBottomNavProps) {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/standings', label: 'Puan & Kulüp', icon: Trophy },
    { href: '/matches', label: 'Maçlar', icon: Swords },
    { href: '/market-and-predictions', label: 'Piyasa', icon: TrendingUp },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#1F2937] bg-[#090D16]/95 backdrop-blur-md pb-safe"
      aria-label="Mobil Alt Navigasyon"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Ara</span>
        </button>
      </div>
    </nav>
  );
}
