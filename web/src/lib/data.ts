import standingsJson from '@/data/standings.json';
import clubsJson from '@/data/clubs.json';
import playersJson from '@/data/players.json';
import matchesJson from '@/data/matches.json';
import type { Club, Match, Player, StandingsData, StandingRow } from '@/types/football';

export const standingsData = standingsJson as unknown as StandingsData;
export const allClubs = clubsJson as unknown as Club[];
export const allPlayers = playersJson as unknown as Player[];
export const allMatches = matchesJson as unknown as Match[];

export const superLigClubs = allClubs.filter((c) => c.isSuperLig);

const clubMap = new Map<string, Club>(allClubs.map((c) => [c.id, c]));
const playerMap = new Map<string, Player>(allPlayers.map((p) => [p.id, p]));
const matchMap = new Map<string, Match>(allMatches.map((m) => [m.id, m]));
const standingMap = new Map<string, StandingRow>(standingsData.standings.map((s) => [s.clubId, s]));

export function getClubById(id: string): Club | undefined {
  return clubMap.get(id);
}

export function getPlayerById(id: string): Player | undefined {
  return playerMap.get(id);
}

export function getMatchById(id: string): Match | undefined {
  return matchMap.get(id);
}

export function getStandingByClubId(clubId: string): StandingRow | undefined {
  return standingMap.get(clubId);
}

export function getPlayersByClubId(clubId: string): Player[] {
  return allPlayers.filter((p) => p.clubId === clubId);
}

export function getMatchesByClubId(clubId: string): Match[] {
  return allMatches
    .filter((m) => m.homeClubId === clubId || m.awayClubId === clubId)
    .sort((a, b) => b.round - a.round);
}

/**
 * Returns top-rated XI (1 GK, 4 DF, 3 MF, 3 FW) from the latest round / season ratings.
 */
export function getGoldenEleven(): Player[] {
  const gks = [...allPlayers]
    .filter((p) => p.positionGroup === 'GK')
    .sort((a, b) => b.avgMatchRating - a.avgMatchRating)
    .slice(0, 1);
  const dfs = [...allPlayers]
    .filter((p) => p.positionGroup === 'DF')
    .sort((a, b) => b.avgMatchRating - a.avgMatchRating)
    .slice(0, 4);
  const mfs = [...allPlayers]
    .filter((p) => p.positionGroup === 'MF')
    .sort((a, b) => b.avgMatchRating - a.avgMatchRating)
    .slice(0, 3);
  const fws = [...allPlayers]
    .filter((p) => p.positionGroup === 'FW')
    .sort((a, b) => b.avgMatchRating - a.avgMatchRating)
    .slice(0, 3);

  return [...gks, ...dfs, ...mfs, ...fws];
}
