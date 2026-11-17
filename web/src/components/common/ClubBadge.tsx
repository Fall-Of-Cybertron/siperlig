import React from 'react';
import { getClubById } from '@/lib/data';

interface ClubBadgeProps {
  clubId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-14 h-14 text-base',
};

export function ClubBadge({ clubId, size = 'sm' }: ClubBadgeProps) {
  const club = getClubById(clubId);
  const bg = club?.primaryColor ?? '#1E293B';
  const accent = club?.accentColor ?? '#06B6D4';
  const label = club?.shortName ?? clubId.slice(0, 3).toUpperCase();

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold tracking-tight border select-none ${SIZE_CLASSES[size]}`}
      style={{
        background: `linear-gradient(145deg, ${bg}ee, #090D16)`,
        borderColor: `${accent}66`,
        color: accent === '#090D16' || accent === '#111827' ? '#F8FAFC' : accent,
      }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
