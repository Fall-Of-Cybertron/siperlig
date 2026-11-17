'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SearchModal } from '@/components/search/SearchModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-5 pb-24 md:pb-10">
        {children}
      </main>
      <footer className="hidden md:block border-t border-[#1F2937] bg-[#090D16] py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-300">Süper Lig İstihbarat Portalı</span> · 100% Statik Gold JSON Mimarisi (`output: &apos;export&apos;`)
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-cyan-400">Vitrin</Link>
            <Link href="/standings" className="hover:text-cyan-400">Puan Durumu</Link>
            <Link href="/matches" className="hover:text-cyan-400">Maç Merkezi</Link>
            <Link href="/market-and-predictions" className="hover:text-cyan-400">Transfer & Tahmin</Link>
          </div>
        </div>
      </footer>
      <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
