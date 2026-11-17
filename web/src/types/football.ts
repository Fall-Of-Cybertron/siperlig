export type AnatomyRegionId =
  | 'head'
  | 'shoulder'
  | 'chest_ribs'
  | 'arm_wrist'
  | 'groin'
  | 'thigh_front'
  | 'hamstring'
  | 'knee'
  | 'calf'
  | 'ankle_foot'
  | 'back'
  | 'other';

export type HeatLevel = 0 | 1 | 2 | 3;

export type PlayStyleTag = 'Dikine Baskı' | 'Uzun Top / Geçiş' | 'Kısır Pas';

export type FormResult = 'W' | 'D' | 'L';

export type PositionGroup = 'GK' | 'DF' | 'MF' | 'FW';

export type InjuryRiskLevel = 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';

export interface StandingSplit {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface RecentMatchBadge {
  matchId: string;
  result: FormResult;
  opponentClubId: string;
  opponentName: string;
  score: string;
  isHome: boolean;
}

export interface SeasonTrendPoint {
  season: string;
  rank: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  ppg: number;
  xgDiff: number;
}

export interface StandingRow {
  rank: number;
  clubId: string;
  clubName: string;
  shortName: string;
  logo: string;
  overall: StandingSplit;
  home: StandingSplit;
  away: StandingSplit;
  form: FormResult[];
  recentMatches: RecentMatchBadge[];
  seasonTrends: SeasonTrendPoint[];
}

export interface StandingsData {
  season: string;
  currentRound: number;
  updatedAt: string;
  standings: StandingRow[];
}

export interface ClubSquadMember {
  playerId: string;
  name: string;
  shirtNumber: number;
  positionMain: string;
  positionGroup: PositionGroup;
  age: number;
  citizenship: string;
  foot: 'Sağ' | 'Sol' | 'Çift';
  contractExpiry: string;
  currentMarketValueEur: number;
  avgMatchRating: number;
  gamesPlayed: number;
  goals: number;
  assists: number;
  xG: number;
  injuryRisk: InjuryRiskLevel;
  missedGamesTotal: number;
}

export interface ClubFixture {
  matchId: string;
  round: number;
  date: string;
  isHome: boolean;
  opponentClubId: string;
  opponentName: string;
  opponentShortName: string;
  homeScore: number;
  awayScore: number;
  result: FormResult;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  accentColor: string;
  city: string;
  stadium: string;
  coach: string;
  founded: number;
  isSuperLig: boolean;
  leagueName: string;
  totalMarketValueEur: number;
  averageAge: number;
  playStyle: PlayStyleTag;
  goalsMinusXg: number;
  finalThirdPassIntensity: number;
  xGFor: number;
  xGAgainst: number;
  possessionAvg: number;
  ppda: number;
  squad: ClubSquadMember[];
  fixtures: ClubFixture[];
}

export interface InjuryRecord {
  reason: string;
  fromDate: string;
  toDate: string;
  days: number;
  missedGames: number;
  clubId: string;
  clubName: string;
}

export interface AnatomyRegionData {
  count: number;
  totalDays: number;
  missedGames: number;
  heatLevel: HeatLevel;
  records: InjuryRecord[];
}

export interface SystemicInjuryRecord {
  reason: string;
  category: 'Hastalık' | 'Kondisyon' | 'Dinlenme';
  fromDate: string;
  toDate: string;
  days: number;
  missedGames: number;
  clubId: string;
  clubName: string;
}

export interface PlayerInjuries {
  anatomyRegions: Record<AnatomyRegionId, AnatomyRegionData>;
  systemicRecords: SystemicInjuryRecord[];
}

export interface MarketValuePoint {
  recordedDate: string;
  value: number;
  clubId: string;
  club: string;
  age: number;
}

export interface TransferRecord {
  season: string;
  transferDate: string;
  fromClubId: string;
  from: string;
  toClubId: string;
  to: string;
  fee: string;
  feeEur: number;
  marketValue: number;
  type: 'Bonservis' | 'Kiralık' | 'Bedelsiz' | 'Altyapı';
}

export interface TransferRumour {
  clubId: string;
  club: string;
  rumourDate: string;
  transferProbability: number;
  source: string;
}

export interface PlayerClubCareer {
  clubId: string;
  clubName: string;
  competition: string;
  seasonRange: string;
  games: number;
  minutes: number;
  goals: number;
  assists: number;
  avgRating: number;
}

export interface Player {
  id: string;
  name: string;
  fullName: string;
  shirtNumber: number;
  clubId: string;
  clubName: string;
  positionMain: string;
  positionGroup: PositionGroup;
  positionSecondary: string[];
  foot: 'Sağ' | 'Sol' | 'Çift';
  height: number;
  birthDate: string;
  age: number;
  citizenship: string;
  contractExpiry: string;
  currentMarketValueEur: number;
  peakMarketValueEur: number;
  injuryRisk: InjuryRiskLevel;
  gamesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  xG: number;
  xA: number;
  avgMatchRating: number;
  per90Goals: number;
  per90Assists: number;
  passAccuracy: number;
  keyPassesPer90: number;
  progressiveActionsPer90: number;
  cleanSheets?: number;
  savePercentage?: number;
  PSxG_plus_minus?: number;
  marketValueHistory: MarketValuePoint[];
  transfers: TransferRecord[];
  rumours: TransferRumour[];
  perClub: PlayerClubCareer[];
  injuries: PlayerInjuries;
}

export type StatCategory =
  | 'Genel & Topla Oynama'
  | 'Hücum & xG'
  | 'Pas & Kurulum'
  | 'Savunma & İkili Mücadele'
  | 'Disiplin & Duran Top';

export interface MatchStatItem {
  key: string;
  label: string;
  category: StatCategory;
  homeValue: string | number;
  awayValue: string | number;
  homeNumeric: number;
  awayNumeric: number;
  unit?: string;
}

export interface LineupPlayerNode {
  playerId: string;
  name: string;
  shirtNumber: number;
  position: string;
  matchRating: number;
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  substitutedMinute?: number;
}

export interface MatchInitialLineup {
  homeFormation: string;
  awayFormation: string;
  home: LineupPlayerNode[][];
  away: LineupPlayerNode[][];
}

export interface BoxScoreEntry {
  playerId: string;
  playerName: string;
  clubId: string;
  clubName: string;
  position: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  xG: number;
  xA: number;
  keyPasses: number;
  passAccuracy: number;
  tacklesWon: number;
  matchRating: number;
}

export interface MatchEvent {
  id: string;
  minute: number;
  addedTime?: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var';
  clubId: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  detail: string;
}

export type GoalTargetZone =
  | 'High Left'
  | 'High Center'
  | 'High Right'
  | 'Low Left'
  | 'Low Center'
  | 'Low Right'
  | 'Close Left'
  | 'Close Right'
  | 'Close High';

export type ShotOutcome = 'Goal' | 'Saved' | 'Blocked' | 'Missed';

export interface ShotEvent {
  id: string;
  minute: number;
  clubId: string;
  playerId: string;
  playerName: string;
  xG: number;
  psxG: number;
  goalTarget: GoalTargetZone;
  outcome: ShotOutcome;
  bodyPart: 'Sağ Ayak' | 'Sol Ayak' | 'Kafa';
  distanceMeters: number;
}

export interface PrematchPrediction {
  poisson: {
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    expectedHomeGoals: number;
    expectedAwayGoals: number;
    mostLikelyScore: string;
    over25Prob: number;
  };
  api: {
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    provider: string;
  };
  actualOutcome: '1' | 'X' | '2';
  poissonCorrect: boolean;
  apiCorrect: boolean;
  poissonBrierScore: number;
  apiBrierScore: number;
}

export interface LiveProbabilityPoint {
  minute: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  eventLabel?: string;
}

export interface Match {
  id: string;
  round: number;
  season: string;
  date: string;
  kickoffTime: string;
  venue: string;
  attendance: number;
  referee: string;
  forecast: string;
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
  homeScore: number;
  awayScore: number;
  halfTimeScore: string;
  stats: MatchStatItem[];
  initialLineup: MatchInitialLineup;
  boxScore: BoxScoreEntry[];
  events: MatchEvent[];
  shots: ShotEvent[];
  prematch: PrematchPrediction;
  liveProbabilities: LiveProbabilityPoint[];
  highlightEmbedUrl: string;
  highlightImgUrl: string;
}
