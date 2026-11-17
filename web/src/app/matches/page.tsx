import React from 'react';
import { allMatches } from '@/lib/data';
import { MatchesListInteractive } from '@/components/match/MatchesListInteractive';

export default function MatchesPage() {
  return <MatchesListInteractive matches={allMatches} />;
}
