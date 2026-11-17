import React from 'react';
import { standingsData, superLigClubs } from '@/lib/data';
import { StandingsInteractive } from '@/components/standings/StandingsInteractive';

export default function StandingsPage() {
  return (
    <StandingsInteractive
      standings={standingsData.standings}
      clubs={superLigClubs}
      season={standingsData.season}
      currentRound={standingsData.currentRound}
    />
  );
}
