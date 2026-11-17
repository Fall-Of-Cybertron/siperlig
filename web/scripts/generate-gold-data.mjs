import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../src/data');

fs.mkdirSync(outDir, { recursive: true });

// Deterministic PRNG so generated Gold JSON is 100% reproducible
function createRng(seed = 20261117) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rand = createRng(20261117);
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const round2 = (n) => Math.round(n * 100) / 100;
const round1 = (n) => Math.round(n * 10) / 10;

const ANATOMY_REGIONS = [
  'head',
  'shoulder',
  'chest_ribs',
  'arm_wrist',
  'groin',
  'thigh_front',
  'hamstring',
  'knee',
  'calf',
  'ankle_foot',
  'back',
  'other',
];

function createEmptyAnatomyRegions() {
  const obj = {};
  for (const r of ANATOMY_REGIONS) {
    obj[r] = {
      count: 0,
      totalDays: 0,
      missedGames: 0,
      heatLevel: 0,
      records: [],
    };
  }
  return obj;
}

function heatFromCount(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

function addInjuryToRegions(anatomyRegions, regionId, record) {
  const bucket = anatomyRegions[regionId];
  bucket.records.push(record);
  bucket.count += 1;
  bucket.totalDays += record.days;
  bucket.missedGames += record.missedGames;
  bucket.heatLevel = heatFromCount(bucket.count);
}

// 18 Super Lig Clubs
const SUPER_LIG_CLUBS = [
  {
    id: 'galatasaray',
    name: 'Galatasaray',
    shortName: 'GS',
    logo: 'GS',
    primaryColor: '#A90432',
    accentColor: '#FDB912',
    city: 'İstanbul',
    stadium: 'RAMS Park',
    coach: 'Okan Buruk',
    founded: 1905,
    playStyle: 'Dikine Baskı',
    goalsMinusXg: 5.4,
    finalThirdPassIntensity: 78.4,
    xGFor: 27.6,
    xGAgainst: 11.8,
    possessionAvg: 61.8,
    ppda: 7.4,
    pts2026: 32,
    w: 10, d: 2, l: 0, gf: 33, ga: 11,
  },
  {
    id: 'fenerbahce',
    name: 'Fenerbahçe',
    shortName: 'FB',
    logo: 'FB',
    primaryColor: '#002D72',
    accentColor: '#FFED00',
    city: 'İstanbul',
    stadium: 'Ülker Stadyumu',
    coach: 'José Mourinho',
    founded: 1907,
    playStyle: 'Dikine Baskı',
    goalsMinusXg: 3.1,
    finalThirdPassIntensity: 75.9,
    xGFor: 25.9,
    xGAgainst: 10.4,
    possessionAvg: 59.4,
    ppda: 8.1,
    pts2026: 29,
    w: 9, d: 2, l: 1, gf: 29, ga: 10,
  },
  {
    id: 'samsunspor',
    name: 'Samsunspor',
    shortName: 'SAM',
    logo: 'SAM',
    primaryColor: '#DC2626',
    accentColor: '#FFFFFF',
    city: 'Samsun',
    stadium: 'Samsun 19 Mayıs',
    coach: 'Thomas Reis',
    founded: 1965,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: 2.8,
    finalThirdPassIntensity: 61.2,
    xGFor: 19.2,
    xGAgainst: 13.1,
    possessionAvg: 48.2,
    ppda: 9.6,
    pts2026: 25,
    w: 8, d: 1, l: 3, gf: 22, ga: 12,
  },
  {
    id: 'besiktas',
    name: 'Beşiktaş',
    shortName: 'BJK',
    logo: 'BJK',
    primaryColor: '#18181B',
    accentColor: '#E4E4E7',
    city: 'İstanbul',
    stadium: 'Tüpraş Stadyumu',
    coach: 'Giovanni van Bronckhorst',
    founded: 1903,
    playStyle: 'Dikine Baskı',
    goalsMinusXg: 1.9,
    finalThirdPassIntensity: 72.1,
    xGFor: 21.1,
    xGAgainst: 13.8,
    possessionAvg: 57.6,
    ppda: 8.8,
    pts2026: 23,
    w: 7, d: 2, l: 3, gf: 23, ga: 14,
  },
  {
    id: 'eyupspor',
    name: 'Eyüpspor',
    shortName: 'EYP',
    logo: 'EYP',
    primaryColor: '#6D28D9',
    accentColor: '#FACC15',
    city: 'İstanbul',
    stadium: 'Recep Tayyip Erdoğan',
    coach: 'Arda Turan',
    founded: 1919,
    playStyle: 'Kısır Pas',
    goalsMinusXg: 2.3,
    finalThirdPassIntensity: 68.4,
    xGFor: 18.7,
    xGAgainst: 14.5,
    possessionAvg: 54.1,
    ppda: 9.9,
    pts2026: 22,
    w: 6, d: 4, l: 2, gf: 21, ga: 13,
  },
  {
    id: 'goztepe',
    name: 'Göztepe',
    shortName: 'GÖZ',
    logo: 'GÖZ',
    primaryColor: '#CA8A04',
    accentColor: '#DC2626',
    city: 'İzmir',
    stadium: 'Gürsel Aksel',
    coach: 'Stanimir Stoilov',
    founded: 1925,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: 1.4,
    finalThirdPassIntensity: 58.6,
    xGFor: 19.6,
    xGAgainst: 15.2,
    possessionAvg: 44.8,
    ppda: 8.4,
    pts2026: 21,
    w: 6, d: 3, l: 3, gf: 21, ga: 15,
  },
  {
    id: 'trabzonspor',
    name: 'Trabzonspor',
    shortName: 'TS',
    logo: 'TS',
    primaryColor: '#7F1D1D',
    accentColor: '#38BDF8',
    city: 'Trabzon',
    stadium: 'Papara Park',
    coach: 'Şenol Güneş',
    founded: 1967,
    playStyle: 'Kısır Pas',
    goalsMinusXg: -1.6,
    finalThirdPassIntensity: 67.3,
    xGFor: 19.6,
    xGAgainst: 14.9,
    possessionAvg: 55.2,
    ppda: 10.7,
    pts2026: 18,
    w: 4, d: 6, l: 2, gf: 18, ga: 14,
  },
  {
    id: 'basaksehir',
    name: 'Başakşehir',
    shortName: 'BFK',
    logo: 'BFK',
    primaryColor: '#EA580C',
    accentColor: '#1E3A8A',
    city: 'İstanbul',
    stadium: 'Başakşehir Fatih Terim',
    coach: 'Çağdaş Atan',
    founded: 1990,
    playStyle: 'Kısır Pas',
    goalsMinusXg: 0.7,
    finalThirdPassIntensity: 69.8,
    xGFor: 17.3,
    xGAgainst: 15.1,
    possessionAvg: 56.4,
    ppda: 10.2,
    pts2026: 17,
    w: 5, d: 2, l: 5, gf: 18, ga: 16,
  },
  {
    id: 'kasimpasa',
    name: 'Kasımpaşa',
    shortName: 'KAS',
    logo: 'KAS',
    primaryColor: '#1D4ED8',
    accentColor: '#FFFFFF',
    city: 'İstanbul',
    stadium: 'Recep Tayyip Erdoğan',
    coach: 'Hakan Keleş',
    founded: 1921,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: -0.9,
    finalThirdPassIntensity: 56.4,
    xGFor: 17.9,
    xGAgainst: 18.4,
    possessionAvg: 47.1,
    ppda: 11.4,
    pts2026: 16,
    w: 4, d: 4, l: 4, gf: 17, ga: 19,
  },
  {
    id: 'sivasspor',
    name: 'Sivasspor',
    shortName: 'SİV',
    logo: 'SİV',
    primaryColor: '#B91C1C',
    accentColor: '#F8FAFC',
    city: 'Sivas',
    stadium: 'BG Grup 4 Eylül',
    coach: 'Bülent Uygun',
    founded: 1967,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: 0.4,
    finalThirdPassIntensity: 53.9,
    xGFor: 15.6,
    xGAgainst: 17.8,
    possessionAvg: 45.2,
    ppda: 12.1,
    pts2026: 15,
    w: 4, d: 3, l: 5, gf: 16, ga: 18,
  },
  {
    id: 'konyaspor',
    name: 'Konyaspor',
    shortName: 'KON',
    logo: 'KON',
    primaryColor: '#15803D',
    accentColor: '#FFFFFF',
    city: 'Konya',
    stadium: 'MEDAŞ Konya Büyükşehir',
    coach: 'Recep Uçar',
    founded: 1922,
    playStyle: 'Kısır Pas',
    goalsMinusXg: -1.2,
    finalThirdPassIntensity: 59.1,
    xGFor: 15.2,
    xGAgainst: 16.9,
    possessionAvg: 49.5,
    ppda: 11.8,
    pts2026: 14,
    w: 4, d: 2, l: 6, gf: 14, ga: 18,
  },
  {
    id: 'rizespor',
    name: 'Çaykur Rizespor',
    shortName: 'RİZ',
    logo: 'RİZ',
    primaryColor: '#166534',
    accentColor: '#0EA5E9',
    city: 'Rize',
    stadium: 'Çaykur Didi',
    coach: 'İlhan Palut',
    founded: 1953,
    playStyle: 'Dikine Baskı',
    goalsMinusXg: -2.1,
    finalThirdPassIntensity: 62.5,
    xGFor: 16.1,
    xGAgainst: 17.5,
    possessionAvg: 50.8,
    ppda: 9.7,
    pts2026: 14,
    w: 4, d: 2, l: 6, gf: 14, ga: 19,
  },
  {
    id: 'antalyaspor',
    name: 'Antalyaspor',
    shortName: 'ANT',
    logo: 'ANT',
    primaryColor: '#DC2626',
    accentColor: '#FFFFFF',
    city: 'Antalya',
    stadium: 'Corendon Airlines Park',
    coach: 'Alex de Souza',
    founded: 1966,
    playStyle: 'Kısır Pas',
    goalsMinusXg: -1.4,
    finalThirdPassIntensity: 60.2,
    xGFor: 15.4,
    xGAgainst: 19.3,
    possessionAvg: 51.3,
    ppda: 11.6,
    pts2026: 13,
    w: 4, d: 1, l: 7, gf: 14, ga: 21,
  },
  {
    id: 'gaziantep-fk',
    name: 'Gaziantep FK',
    shortName: 'GFK',
    logo: 'GFK',
    primaryColor: '#991B1B',
    accentColor: '#111827',
    city: 'Gaziantep',
    stadium: 'Kalyon Stadyumu',
    coach: 'Selçuk İnan',
    founded: 1988,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: -0.5,
    finalThirdPassIntensity: 54.8,
    xGFor: 14.5,
    xGAgainst: 18.6,
    possessionAvg: 46.1,
    ppda: 12.4,
    pts2026: 12,
    w: 3, d: 3, l: 6, gf: 14, ga: 19,
  },
  {
    id: 'alanyaspor',
    name: 'Alanyaspor',
    shortName: 'ALA',
    logo: 'ALA',
    primaryColor: '#F97316',
    accentColor: '#16A34A',
    city: 'Antalya',
    stadium: 'Gain Park',
    coach: 'Sami Uğurlu',
    founded: 1948,
    playStyle: 'Kısır Pas',
    goalsMinusXg: -2.4,
    finalThirdPassIntensity: 63.4,
    xGFor: 15.4,
    xGAgainst: 17.9,
    possessionAvg: 53.7,
    ppda: 10.9,
    pts2026: 11,
    w: 3, d: 2, l: 7, gf: 13, ga: 19,
  },
  {
    id: 'kayserispor',
    name: 'Kayserispor',
    shortName: 'KAY',
    logo: 'KAY',
    primaryColor: '#EAB308',
    accentColor: '#DC2626',
    city: 'Kayseri',
    stadium: 'RHG Enertürk Enerji',
    coach: 'Sinan Kaloğlu',
    founded: 1966,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: -1.8,
    finalThirdPassIntensity: 51.7,
    xGFor: 13.8,
    xGAgainst: 20.1,
    possessionAvg: 44.4,
    ppda: 12.9,
    pts2026: 10,
    w: 2, d: 4, l: 6, gf: 12, ga: 21,
  },
  {
    id: 'bodrum-fk',
    name: 'Bodrum FK',
    shortName: 'BOD',
    logo: 'BOD',
    primaryColor: '#16A34A',
    accentColor: '#FFFFFF',
    city: 'Muğla',
    stadium: 'Grey Beton Bodrum',
    coach: 'Volkan Demirel',
    founded: 1931,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: -2.9,
    finalThirdPassIntensity: 49.3,
    xGFor: 12.9,
    xGAgainst: 19.7,
    possessionAvg: 42.1,
    ppda: 11.2,
    pts2026: 9,
    w: 2, d: 3, l: 7, gf: 10, ga: 20,
  },
  {
    id: 'hatayspor',
    name: 'Hatayspor',
    shortName: 'HAT',
    logo: 'HAT',
    primaryColor: '#7C2D12',
    accentColor: '#F8FAFC',
    city: 'Hatay',
    stadium: 'Mersin Stadyumu',
    coach: 'Rıza Çalımbay',
    founded: 1967,
    playStyle: 'Uzun Top / Geçiş',
    goalsMinusXg: -3.2,
    finalThirdPassIntensity: 50.1,
    xGFor: 13.2,
    xGAgainst: 22.4,
    possessionAvg: 43.9,
    ppda: 13.1,
    pts2026: 7,
    w: 1, d: 4, l: 7, gf: 10, ga: 23,
  },
];

// External / Partner Clubs referenced in Transfers, Rumours & Careers
const PARTNER_CLUBS = [
  { id: 'napoli', name: 'SSC Napoli', shortName: 'NAP', logo: 'NAP', primaryColor: '#0EA5E9', accentColor: '#FFFFFF', city: 'Napoli', stadium: 'Diego Armando Maradona', coach: 'Antonio Conte', founded: 1926, leagueName: 'Serie A', totalMarketValueEur: 435000000, averageAge: 26.4, playStyle: 'Dikine Baskı' },
  { id: 'inter', name: 'Inter', shortName: 'INT', logo: 'INT', primaryColor: '#1D4ED8', accentColor: '#090D16', city: 'Milano', stadium: 'Giuseppe Meazza', coach: 'Simone Inzaghi', founded: 1908, leagueName: 'Serie A', totalMarketValueEur: 677000000, averageAge: 27.9, playStyle: 'Kısır Pas' },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', logo: 'PSG', primaryColor: '#1E3A8A', accentColor: '#DC2626', city: 'Paris', stadium: 'Parc des Princes', coach: 'Luis Enrique', founded: 1970, leagueName: 'Ligue 1', totalMarketValueEur: 890000000, averageAge: 24.3, playStyle: 'Dikine Baskı' },
  { id: 'benfica', name: 'SL Benfica', shortName: 'SLB', logo: 'SLB', primaryColor: '#DC2626', accentColor: '#FFFFFF', city: 'Lizbon', stadium: 'Estádio da Luz', coach: 'Bruno Lage', founded: 1904, leagueName: 'Liga Portugal', totalMarketValueEur: 335000000, averageAge: 25.1, playStyle: 'Dikine Baskı' },
  { id: 'sevilla', name: 'Sevilla FC', shortName: 'SEV', logo: 'SEV', primaryColor: '#DC2626', accentColor: '#F8FAFC', city: 'Sevilla', stadium: 'Ramón Sánchez-Pizjuán', coach: 'García Pimienta', founded: 1890, leagueName: 'LaLiga', totalMarketValueEur: 182000000, averageAge: 26.2, playStyle: 'Kısır Pas' },
  { id: 'lazio', name: 'SS Lazio', shortName: 'LAZ', logo: 'LAZ', primaryColor: '#38BDF8', accentColor: '#FFFFFF', city: 'Roma', stadium: 'Stadio Olimpico', coach: 'Marco Baroni', founded: 1900, leagueName: 'Serie A', totalMarketValueEur: 245000000, averageAge: 26.5, playStyle: 'Dikine Baskı' },
  { id: 'roma', name: 'AS Roma', shortName: 'ROM', logo: 'ROM', primaryColor: '#991B1B', accentColor: '#F59E0B', city: 'Roma', stadium: 'Stadio Olimpico', coach: 'Claudio Ranieri', founded: 1927, leagueName: 'Serie A', totalMarketValueEur: 315000000, averageAge: 26.8, playStyle: 'Uzun Top / Geçiş' },
  { id: 'man-united', name: 'Manchester United', shortName: 'MUN', logo: 'MUN', primaryColor: '#B91C1C', accentColor: '#FACC15', city: 'Manchester', stadium: 'Old Trafford', coach: 'Ruben Amorim', founded: 1878, leagueName: 'Premier League', totalMarketValueEur: 790000000, averageAge: 25.7, playStyle: 'Dikine Baskı' },
  { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', logo: 'TOT', primaryColor: '#0F172A', accentColor: '#F8FAFC', city: 'Londra', stadium: 'Tottenham Hotspur Stadium', coach: 'Ange Postecoglou', founded: 1882, leagueName: 'Premier League', totalMarketValueEur: 775000000, averageAge: 25.1, playStyle: 'Dikine Baskı' },
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', logo: 'ARS', primaryColor: '#DC2626', accentColor: '#FFFFFF', city: 'Londra', stadium: 'Emirates Stadium', coach: 'Mikel Arteta', founded: 1886, leagueName: 'Premier League', totalMarketValueEur: 1120000000, averageAge: 25.6, playStyle: 'Dikine Baskı' },
  { id: 'bayern', name: 'Bayern Münih', shortName: 'FCB', logo: 'FCB', primaryColor: '#DC2626', accentColor: '#1E3A8A', city: 'Münih', stadium: 'Allianz Arena', coach: 'Vincent Kompany', founded: 1900, leagueName: 'Bundesliga', totalMarketValueEur: 940000000, averageAge: 26.4, playStyle: 'Dikine Baskı' },
  { id: 'al-nassr', name: 'Al-Nassr', shortName: 'ALN', logo: 'ALN', primaryColor: '#FACC15', accentColor: '#1E3A8A', city: 'Riyad', stadium: 'Al-Awwal Park', coach: 'Stefano Pioli', founded: 1955, leagueName: 'Saudi Pro League', totalMarketValueEur: 175000000, averageAge: 27.6, playStyle: 'Uzun Top / Geçiş' },
  { id: 'porto', name: 'FC Porto', shortName: 'POR', logo: 'POR', primaryColor: '#1D4ED8', accentColor: '#FFFFFF', city: 'Porto', stadium: 'Estádio do Dragão', coach: 'Vítor Bruno', founded: 1893, leagueName: 'Liga Portugal', totalMarketValueEur: 310000000, averageAge: 24.8, playStyle: 'Dikine Baskı' },
  { id: 'dinamo-zagreb', name: 'Dinamo Zagreb', shortName: 'DZG', logo: 'DZG', primaryColor: '#2563EB', accentColor: '#FFFFFF', city: 'Zagreb', stadium: 'Stadion Maksimir', coach: 'Nenad Bjelica', founded: 1945, leagueName: 'HNL', totalMarketValueEur: 74000000, averageAge: 25.5, playStyle: 'Kısır Pas' },
  { id: 'atletico', name: 'Atlético Madrid', shortName: 'ATM', logo: 'ATM', primaryColor: '#DC2626', accentColor: '#1E3A8A', city: 'Madrid', stadium: 'Metropolitano', coach: 'Diego Simeone', founded: 1903, leagueName: 'LaLiga', totalMarketValueEur: 495000000, averageAge: 27.3, playStyle: 'Uzun Top / Geçiş' },
  { id: 'ajax', name: 'Ajax', shortName: 'AJX', logo: 'AJX', primaryColor: '#DC2626', accentColor: '#FFFFFF', city: 'Amsterdam', stadium: 'Johan Cruijff ArenA', coach: 'Francesco Farioli', founded: 1900, leagueName: 'Eredivisie', totalMarketValueEur: 240000000, averageAge: 24.1, playStyle: 'Kısır Pas' },
];

// Squad definitions (11 real starters per club = 198 players total)
// Format per player: [id, name, fullName, shirtNumber, posMain, posGroup, age, height, foot, citizenship, contractExpiry, marketValM, peakValM, goals, assists, rating, psxgPM]
const CLUB_ROSTERS = {
  galatasaray: [
    ['muslera', 'F. Muslera', 'Fernando Muslera', 1, 'Kaleci', 'GK', 38, 190, 'Sağ', 'Uruguay', '2027-06-30', 1.8, 18.0, 0, 0, 7.38, 6.4],
    ['ka-ayhan', 'K. Ayhan', 'Kaan Ayhan', 23, 'Sağ Bek', 'DF', 30, 185, 'Sağ', 'Türkiye', '2027-06-30', 4.5, 7.5, 1, 2, 7.12],
    ['sanchez', 'D. Sánchez', 'Davinson Sánchez', 6, 'Stoper', 'DF', 28, 187, 'Sağ', 'Kolombiya', '2028-06-30', 19.0, 60.0, 2, 1, 7.64],
    ['bardakci', 'A. Bardakcı', 'Abdülkerim Bardakcı', 42, 'Stoper', 'DF', 30, 185, 'Sol', 'Türkiye', '2027-06-30', 9.0, 10.0, 2, 1, 7.35],
    ['jakobs', 'I. Jakobs', 'Ismail Jakobs', 4, 'Sol Bek', 'DF', 25, 184, 'Sol', 'Senegal', '2028-06-30', 8.0, 10.0, 0, 3, 7.18],
    ['torreira', 'L. Torreira', 'Lucas Torreira', 34, 'Ön Libero', 'MF', 28, 166, 'Sağ', 'Uruguay', '2028-06-30', 15.0, 55.0, 1, 4, 7.58],
    ['gabriel-sara', 'G. Sara', 'Gabriel Sara', 20, 'Merkez Orta Saha', 'MF', 25, 177, 'Sol', 'Brezilya', '2029-06-30', 22.0, 22.0, 3, 7, 7.86],
    ['akgun', 'Y. Akgün', 'Yunus Akgün', 11, 'Sağ Kanat', 'MF', 24, 173, 'Sol', 'Türkiye', '2027-06-30', 11.0, 11.0, 5, 4, 7.61],
    ['mertens', 'D. Mertens', 'Dries Mertens', 10, 'On Numara', 'MF', 37, 169, 'Sağ', 'Belçika', '2027-05-31', 1.5, 32.0, 4, 6, 7.49],
    ['baris-alper', 'B. Alper Yılmaz', 'Barış Alper Yılmaz', 53, 'Sol Kanat', 'FW', 24, 186, 'Sağ', 'Türkiye', '2028-06-30', 21.0, 21.0, 6, 3, 7.55],
    ['osimhen', 'V. Osimhen', 'Victor Osimhen', 45, 'Santrafor', 'FW', 26, 186, 'Sağ', 'Nijerya', '2027-06-30', 75.0, 120.0, 11, 4, 8.24],
    ['icardi', 'M. Icardi', 'Mauro Icardi', 9, 'Santrafor', 'FW', 31, 181, 'Sağ', 'Arjantin', '2027-06-30', 15.0, 100.0, 6, 2, 7.72],
  ],
  fenerbahce: [
    ['livakovic', 'D. Livaković', 'Dominik Livaković', 40, 'Kaleci', 'GK', 29, 188, 'Sağ', 'Hırvatistan', '2028-06-30', 11.0, 14.5, 0, 0, 7.44, 5.8],
    ['osayi-samuel', 'B. Osayi-Samuel', 'Bright Osayi-Samuel', 21, 'Sağ Bek', 'DF', 26, 175, 'Sağ', 'Nijerya', '2027-05-31', 8.5, 9.0, 0, 2, 7.16],
    ['djiku', 'A. Djiku', 'Alexander Djiku', 6, 'Stoper', 'DF', 30, 182, 'Sağ', 'Gana', '2027-06-30', 9.0, 10.0, 1, 0, 7.39],
    ['soyuncu', 'Ç. Söyüncü', 'Çağlar Söyüncü', 4, 'Stoper', 'DF', 28, 185, 'Sağ', 'Türkiye', '2027-06-30', 10.0, 45.0, 1, 0, 7.21],
    ['oosterwolde', 'J. Oosterwolde', 'Jayden Oosterwolde', 24, 'Sol Bek', 'DF', 23, 189, 'Sol', 'Hollanda', '2028-06-30', 15.0, 15.0, 0, 1, 7.28],
    ['amrabat', 'S. Amrabat', 'Sofyan Amrabat', 34, 'Ön Libero', 'MF', 28, 183, 'Sağ', 'Fas', '2028-06-30', 22.0, 30.0, 2, 2, 7.52],
    ['fred', 'Fred', 'Frederico Rodrigues', 35, 'Merkez Orta Saha', 'MF', 31, 169, 'Sol', 'Brezilya', '2027-06-30', 15.0, 32.0, 4, 4, 7.66],
    ['tadic', 'D. Tadić', 'Dušan Tadić', 10, 'Sağ Kanat', 'MF', 35, 181, 'Sol', 'Sırbistan', '2027-05-31', 3.5, 25.0, 6, 8, 7.82],
    ['szymanski', 'S. Szymański', 'Sebastian Szymański', 53, 'On Numara', 'MF', 25, 174, 'Sol', 'Polonya', '2028-06-30', 19.0, 20.0, 3, 5, 7.41],
    ['saint-maximin', 'A. Saint-Maximin', 'Allan Saint-Maximin', 97, 'Sol Kanat', 'FW', 27, 173, 'Sağ', 'Fransa', '2027-06-30', 18.0, 40.0, 4, 5, 7.59],
    ['en-nesyri', 'Y. En-Nesyri', 'Youssef En-Nesyri', 19, 'Santrafor', 'FW', 27, 189, 'Sol', 'Fas', '2029-06-30', 22.0, 40.0, 8, 2, 7.61],
    ['dzeko', 'E. Džeko', 'Edin Džeko', 9, 'Santrafor', 'FW', 38, 193, 'Çift', 'Bosna-Hersek', '2027-05-31', 2.5, 29.0, 9, 3, 7.74],
  ],
  besiktas: [
    ['mert-gunok', 'M. Günok', 'Mert Günok', 34, 'Kaleci', 'GK', 35, 196, 'Sağ', 'Türkiye', '2027-06-30', 1.2, 4.0, 0, 0, 7.29, 4.9],
    ['svensson', 'J. Svensson', 'Jonas Svensson', 2, 'Sağ Bek', 'DF', 31, 170, 'Sağ', 'Norveç', '2027-06-30', 2.2, 4.5, 0, 3, 7.08],
    ['paulista', 'G. Paulista', 'Gabriel Paulista', 3, 'Stoper', 'DF', 33, 187, 'Sağ', 'Brezilya', '2027-06-30', 2.5, 20.0, 1, 1, 7.19],
    ['udokhai', 'F. Uduokhai', 'Felix Uduokhai', 14, 'Stoper', 'DF', 27, 193, 'Sol', 'Almanya', '2028-06-30', 7.5, 12.0, 0, 0, 7.24],
    ['masuaku', 'A. Masuaku', 'Arthur Masuaku', 26, 'Sol Bek', 'DF', 31, 179, 'Sol', 'DR Kongo', '2027-05-31', 3.5, 10.0, 1, 4, 7.05],
    ['al-musrati', 'Al-Musrati', 'Almoatasembellah Al-Musrati', 28, 'Ön Libero', 'MF', 28, 189, 'Sağ', 'Libya', '2027-06-30', 11.0, 16.0, 1, 1, 7.15],
    ['gedson', 'G. Fernandes', 'Gedson Fernandes', 83, 'Merkez Orta Saha', 'MF', 25, 184, 'Sağ', 'Portekiz', '2027-06-30', 17.0, 22.0, 4, 3, 7.56],
    ['rashica', 'M. Rashica', 'Milot Rashica', 7, 'Sağ Kanat', 'MF', 28, 178, 'Sağ', 'Kosova', '2027-06-30', 7.5, 35.0, 2, 5, 7.22],
    ['rafa-silva', 'Rafa Silva', 'Rafael Alexandre Fernandes Ferreira Silva', 27, 'On Numara', 'MF', 31, 172, 'Sağ', 'Portekiz', '2027-06-30', 14.0, 32.0, 7, 5, 7.89],
    ['kilicsoy', 'S. Kılıçsoy', 'Semih Kılıçsoy', 9, 'Sol Kanat', 'FW', 19, 178, 'Sağ', 'Türkiye', '2028-06-30', 15.0, 15.0, 3, 4, 7.27],
    ['immobile', 'C. Immobile', 'Ciro Immobile', 17, 'Santrafor', 'FW', 34, 185, 'Sağ', 'İtalya', '2027-06-30', 4.0, 50.0, 9, 1, 7.46],
  ],
  trabzonspor: [
    ['ugurcan', 'U. Çakır', 'Uğurcan Çakır', 1, 'Kaleci', 'GK', 28, 191, 'Sağ', 'Türkiye', '2027-06-30', 8.5, 19.0, 0, 0, 7.62, 7.8],
    ['malheiro', 'P. Malheiro', 'Pedro Malheiro', 79, 'Sağ Bek', 'DF', 23, 179, 'Sağ', 'Portekiz', '2028-06-30', 5.0, 5.0, 2, 2, 7.19],
    ['savic', 'S. Savić', 'Stefan Savić', 15, 'Stoper', 'DF', 33, 187, 'Sağ', 'Karadağ', '2027-06-30', 2.5, 40.0, 0, 0, 7.04],
    ['batagov', 'A. Batagov', 'Arseniy Batagov', 44, 'Stoper', 'DF', 22, 185, 'Sol', 'Ukrayna', '2028-06-30', 3.0, 3.0, 0, 1, 7.11],
    ['eren-elmali', 'E. Elmalı', 'Eren Elmalı', 18, 'Sol Bek', 'DF', 24, 180, 'Sol', 'Türkiye', '2027-06-30', 4.5, 5.0, 0, 2, 7.03],
    ['mendy', 'B. Mendy', 'Batista Mendy', 3, 'Ön Libero', 'MF', 24, 191, 'Sağ', 'Fransa', '2027-06-30', 9.5, 9.5, 1, 1, 7.34],
    ['yokuslu', 'O. Yokuşlu', 'Okay Yokuşlu', 35, 'Merkez Orta Saha', 'MF', 30, 190, 'Sağ', 'Türkiye', '2027-06-30', 3.2, 10.0, 1, 1, 7.09],
    ['visca', 'E. Višća', 'Edin Višća', 7, 'Sağ Kanat', 'MF', 34, 172, 'Sağ', 'Bosna-Hersek', '2027-05-31', 1.8, 12.0, 2, 5, 7.21],
    ['cham', 'M. Cham', 'Muhammed Cham', 10, 'On Numara', 'MF', 24, 176, 'Sol', 'Avusturya', '2028-06-30', 6.5, 7.0, 3, 4, 7.26],
    ['nwakaeme', 'A. Nwakaeme', 'Anthony Nwakaeme', 9, 'Sol Kanat', 'FW', 35, 185, 'Sağ', 'Nijerya', '2027-05-31', 1.1, 6.0, 2, 3, 7.14],
    ['banza', 'S. Banza', 'Simon Banza', 17, 'Santrafor', 'FW', 28, 189, 'Sağ', 'DR Kongo', '2027-06-30', 16.0, 18.0, 8, 2, 7.55],
  ],
  samsunspor: [
    ['kocuk', 'O. Kocuk', 'Okan Kocuk', 1, 'Kaleci', 'GK', 29, 187, 'Sağ', 'Türkiye', '2027-06-30', 2.4, 3.0, 0, 0, 7.24, 3.6],
    ['yavru', 'Z. Yavru', 'Zeki Yavru', 18, 'Sağ Bek', 'DF', 33, 177, 'Sağ', 'Türkiye', '2027-05-31', 0.4, 1.5, 0, 3, 6.98],
    ['satka', 'L. Šatka', 'Ľubomír Šatka', 37, 'Stoper', 'DF', 28, 188, 'Sağ', 'Slovakya', '2027-06-30', 2.6, 3.2, 1, 0, 7.15],
    ['van-drongelen', 'R. van Drongelen', 'Rick van Drongelen', 4, 'Stoper', 'DF', 25, 188, 'Sol', 'Hollanda', '2027-06-30', 2.8, 4.0, 1, 0, 7.18],
    ['bola', 'M. Bola', 'Marc Bola', 28, 'Sol Bek', 'DF', 26, 182, 'Sol', 'İngiltere', '2027-06-30', 1.8, 2.0, 0, 2, 7.06],
    ['bennasser', 'Y. Aït Bennasser', 'Youssef Aït Bennasser', 6, 'Ön Libero', 'MF', 28, 184, 'Sağ', 'Fas', '2027-06-30', 2.1, 6.5, 1, 2, 7.14],
    ['ntcham', 'O. Ntcham', 'Olivier Ntcham', 10, 'Merkez Orta Saha', 'MF', 28, 180, 'Sağ', 'Kamerun', '2027-06-30', 4.5, 7.0, 4, 2, 7.42],
    ['holse', 'C. Holse', 'Carlo Holse', 21, 'Sağ Kanat', 'MF', 25, 178, 'Sol', 'Danimarka', '2027-06-30', 4.8, 4.8, 5, 3, 7.49],
    ['emre-kilinc', 'E. Kılınç', 'Emre Kılınç', 11, 'On Numara', 'MF', 30, 174, 'Sol', 'Türkiye', '2027-06-30', 2.4, 5.5, 2, 4, 7.19],
    ['dimata', 'L. Dimata', 'Landry Dimata', 99, 'Sol Kanat', 'FW', 27, 185, 'Sağ', 'Belçika', '2027-06-30', 2.2, 10.0, 3, 1, 7.08],
    ['mouandilmadji', 'M. Mouandilmadji', 'Marius Mouandilmadji', 9, 'Santrafor', 'FW', 26, 190, 'Sağ', 'Çad', '2027-06-30', 4.2, 4.2, 6, 2, 7.36],
  ],
  eyupspor: [
    ['berke-ozer', 'B. Özer', 'Berke Özer', 1, 'Kaleci', 'GK', 24, 191, 'Sağ', 'Türkiye', '2027-05-31', 5.0, 5.0, 0, 0, 7.51, 6.9],
    ['vezo', 'R. Vezo', 'Rúben Vezo', 14, 'Sağ Bek', 'DF', 30, 182, 'Sağ', 'Portekiz', '2027-06-30', 2.5, 6.0, 0, 1, 7.09],
    ['robin-yalcin', 'R. Yalçın', 'Robin Yalçın', 5, 'Stoper', 'DF', 30, 183, 'Sağ', 'Türkiye', '2027-06-30', 1.3, 2.0, 1, 0, 7.12],
    ['claro', 'L. Claro', 'Luccas Claro', 4, 'Stoper', 'DF', 33, 186, 'Sağ', 'Brezilya', '2027-06-30', 1.1, 2.8, 0, 0, 7.05],
    ['caner-erkin', 'C. Erkin', 'Caner Erkin', 88, 'Sol Bek', 'DF', 36, 181, 'Sol', 'Türkiye', '2027-05-31', 0.3, 12.0, 0, 5, 7.21],
    ['melih-kabasakal', 'M. Kabasakal', 'Melih Kabasakal', 6, 'Ön Libero', 'MF', 28, 178, 'Sağ', 'Türkiye', '2027-06-30', 1.7, 1.7, 1, 2, 7.14],
    ['midtsjo', 'F. Midtsjø', 'Fredrik Midtsjø', 8, 'Merkez Orta Saha', 'MF', 31, 176, 'Sağ', 'Norveç', '2027-06-30', 2.3, 6.0, 1, 3, 7.18],
    ['akbaba', 'E. Akbaba', 'Emre Akbaba', 20, 'On Numara', 'MF', 32, 180, 'Sol', 'Türkiye', '2027-06-30', 1.8, 7.0, 3, 3, 7.25],
    ['halil-akbunar', 'H. Akbunar', 'Halil Akbunar', 7, 'Sağ Kanat', 'MF', 31, 169, 'Sol', 'Türkiye', '2027-06-30', 1.9, 4.0, 2, 3, 7.16],
    ['kutucu', 'A. Kutucu', 'Ahmed Kutucu', 23, 'Sol Kanat', 'FW', 24, 181, 'Sağ', 'Türkiye', '2027-06-30', 5.5, 5.5, 7, 5, 7.64],
    ['thiam', 'M. Thiam', 'Mame Thiam', 9, 'Santrafor', 'FW', 32, 185, 'Sağ', 'Senegal', '2027-06-30', 2.8, 4.0, 6, 2, 7.39],
  ],
  goztepe: [
    ['lis', 'M. Lis', 'Mateusz Lis', 97, 'Kaleci', 'GK', 27, 192, 'Sağ', 'Polonya', '2028-06-30', 2.2, 2.2, 0, 0, 7.22, 3.1],
    ['heliton', 'Héliton', 'Héliton Tito dos Santos', 5, 'Stoper', 'DF', 29, 194, 'Sağ', 'Brezilya', '2027-06-30', 1.9, 1.9, 1, 0, 7.19],
    ['bokele', 'M. Bokele', 'Malcom Bokele', 26, 'Stoper', 'DF', 24, 187, 'Sağ', 'Kamerun', '2028-06-30', 2.5, 2.5, 1, 0, 7.15],
    ['koray-gunter', 'K. Günter', 'Koray Günter', 4, 'Stoper', 'DF', 30, 185, 'Sağ', 'Almanya', '2027-06-30', 1.5, 4.5, 0, 1, 7.08],
    ['djalma', 'D. Silva', 'Djalma Silva', 19, 'Sol Bek', 'DF', 30, 179, 'Sol', 'Brezilya', '2027-06-30', 1.2, 1.4, 0, 3, 7.04],
    ['dennis', 'A. Dennis', 'Anthony Dennis', 30, 'Ön Libero', 'MF', 20, 181, 'Sağ', 'Nijerya', '2028-06-30', 3.5, 3.5, 1, 1, 7.24],
    ['solet', 'I. Solet', 'Isaac Solet', 8, 'Merkez Orta Saha', 'MF', 23, 183, 'Sağ', 'Orta Afrika', '2028-06-30', 3.0, 3.0, 2, 2, 7.27],
    ['tijanic', 'D. Tijanić', 'David Tijanić', 10, 'On Numara', 'MF', 27, 175, 'Sağ', 'Slovenya', '2027-06-30', 2.4, 2.5, 3, 4, 7.31],
    ['matsuki', 'K. Matsuki', 'Kuryu Matsuki', 7, 'Sağ Kanat', 'MF', 21, 177, 'Sol', 'Japonya', '2027-06-30', 3.2, 3.2, 2, 3, 7.18],
    ['juan', 'Juan', 'Juan Santos da Silva', 11, 'Sol Kanat', 'FW', 22, 177, 'Sağ', 'Brezilya', '2028-06-30', 4.5, 4.5, 4, 3, 7.33],
    ['romulo', 'Rômulo', 'Rômulo Cardoso', 79, 'Santrafor', 'FW', 22, 193, 'Sağ', 'Brezilya', '2028-06-30', 9.0, 9.0, 7, 4, 7.62],
  ],
  basaksehir: [
    ['sengezer', 'M. Şengezer', 'Muhammed Şengezer', 16, 'Kaleci', 'GK', 27, 192, 'Sağ', 'Türkiye', '2027-06-30', 2.5, 2.8, 0, 0, 7.16, 2.2],
    ['duarte', 'L. Duarte', 'Léo Duarte', 5, 'Stoper', 'DF', 28, 183, 'Sağ', 'Brezilya', '2027-06-30', 3.0, 8.0, 0, 0, 7.05],
    ['opoku', 'J. Opoku', 'Jerome Opoku', 3, 'Stoper', 'DF', 26, 197, 'Sol', 'Gana', '2028-06-30', 4.5, 4.5, 1, 0, 7.19],
    ['lima', 'L. Lima', 'Lucas Lima', 12, 'Sol Bek', 'DF', 33, 178, 'Sol', 'Brezilya', '2027-05-31', 1.2, 5.0, 0, 2, 6.95],
    ['sahiner', 'Ö. Ali Şahiner', 'Ömer Ali Şahiner', 42, 'Sağ Bek', 'DF', 32, 176, 'Sağ', 'Türkiye', '2027-06-30', 1.1, 3.5, 0, 2, 6.99],
    ['ozdemir', 'B. Özdemir', 'Berat Özdemir', 2, 'Ön Libero', 'MF', 26, 187, 'Sağ', 'Türkiye', '2027-06-30', 3.4, 5.5, 1, 1, 7.08],
    ['kemen', 'O. Kemen', 'Olivier Kemen', 8, 'Merkez Orta Saha', 'MF', 28, 179, 'Sağ', 'Kamerun', '2027-06-30', 3.0, 3.8, 2, 2, 7.12],
    ['crespo', 'M. Crespo', 'Miguel Crespo', 13, 'Merkez Orta Saha', 'MF', 28, 186, 'Sağ', 'Portekiz', '2027-06-30', 4.0, 10.0, 1, 3, 7.17],
    ['turuc', 'D. Türüç', 'Deniz Türüç', 23, 'Sağ Kanat', 'MF', 31, 177, 'Sol', 'Türkiye', '2027-06-30', 2.4, 4.5, 3, 4, 7.21],
    ['davidson', 'Davidson', 'Davidson da Luz Pereira', 91, 'Sol Kanat', 'FW', 33, 177, 'Sağ', 'Brezilya', '2027-06-30', 1.7, 3.0, 3, 2, 7.14],
    ['piatek', 'K. Piątek', 'Krzysztof Piątek', 9, 'Santrafor', 'FW', 29, 183, 'Sağ', 'Polonya', '2027-06-30', 6.5, 40.0, 8, 1, 7.45],
  ],
  kasimpasa: [
    ['gianniotis', 'A. Gianniotis', 'Andreas Gianniotis', 1, 'Kaleci', 'GK', 31, 190, 'Sağ', 'Yunanistan', '2027-06-30', 1.4, 2.0, 0, 0, 7.02, 1.4],
    ['winck', 'C. Winck', 'Cláudio Winck', 13, 'Sağ Bek', 'DF', 30, 182, 'Sağ', 'Brezilya', '2027-06-30', 2.0, 2.2, 2, 3, 7.16],
    ['opoku-kas', 'N. Opoku', 'Nicholas Opoku', 20, 'Stoper', 'DF', 27, 190, 'Sağ', 'Gana', '2027-06-30', 1.8, 3.5, 0, 0, 6.94],
    ['ozcan-y', 'Y. Özcan', 'Yasin Özcan', 58, 'Stoper', 'DF', 18, 185, 'Sol', 'Türkiye', '2028-06-30', 5.0, 5.0, 1, 1, 7.21],
    ['ben-ouanes', 'M. Ben Ouanes', 'Mortadha Ben Ouanes', 12, 'Sol Bek', 'DF', 30, 182, 'Sol', 'Tunus', '2027-06-30', 1.8, 2.2, 1, 2, 7.01],
    ['gul', 'G. Gül', 'Gökhan Gül', 35, 'Ön Libero', 'MF', 26, 185, 'Sağ', 'Türkiye', '2027-06-30', 1.5, 1.5, 1, 1, 6.98],
    ['hajradinovic', 'H. Hajradinović', 'Haris Hajradinović', 10, 'On Numara', 'MF', 30, 179, 'Sol', 'Bosna-Hersek', '2027-06-30', 3.4, 3.8, 2, 5, 7.28],
    ['kara', 'A. Kara', 'Aytaç Kara', 8, 'Merkez Orta Saha', 'MF', 31, 186, 'Sağ', 'Türkiye', '2027-06-30', 1.6, 2.5, 3, 2, 7.09],
    ['fall', 'M. Fall', 'Mamadou Fall', 7, 'Sağ Kanat', 'MF', 32, 176, 'Sağ', 'Senegal', '2027-06-30', 1.5, 2.2, 2, 2, 7.04],
    ['brekalo', 'J. Brekalo', 'Josip Brekalo', 77, 'Sol Kanat', 'FW', 26, 175, 'Sağ', 'Hırvatistan', '2027-06-30', 3.2, 15.0, 2, 3, 7.12],
    ['da-costa', 'N. Da Costa', 'Nuno Da Costa', 18, 'Santrafor', 'FW', 33, 184, 'Sağ', 'Yeşil Burun', '2027-06-30', 1.6, 2.8, 4, 2, 7.18],
  ],
  sivasspor: [
    ['vural', 'A. Şaşal Vural', 'Ali Şaşal Vural', 35, 'Kaleci', 'GK', 34, 187, 'Sağ', 'Türkiye', '2027-05-31', 0.4, 1.2, 0, 0, 7.04, 1.9],
    ['paluli', 'M. Paluli', 'Murat Paluli', 7, 'Sağ Bek', 'DF', 30, 179, 'Sağ', 'Türkiye', '2027-06-30', 0.9, 1.1, 0, 2, 6.91],
    ['radakovic', 'U. Radaković', 'Uroš Radaković', 44, 'Stoper', 'DF', 30, 194, 'Sağ', 'Sırbistan', '2027-06-30', 1.4, 1.8, 2, 0, 7.11],
    ['sundberg', 'N. Sundberg', 'Noah Sonko Sundberg', 23, 'Stoper', 'DF', 28, 187, 'Sağ', 'Gambiya', '2027-06-30', 1.8, 2.0, 0, 0, 6.96],
    ['ciftci', 'U. Çiftçi', 'Uğur Çiftçi', 58, 'Sol Bek', 'DF', 32, 179, 'Sol', 'Türkiye', '2027-06-30', 1.1, 2.0, 0, 3, 7.05],
    ['charisis', 'C. Charisis', 'Charis Charisis', 8, 'Ön Libero', 'MF', 29, 182, 'Sağ', 'Yunanistan', '2027-06-30', 1.7, 2.0, 1, 2, 7.09],
    ['moutoussamy', 'S. Moutoussamy', 'Samuel Moutoussamy', 12, 'Merkez Orta Saha', 'MF', 28, 176, 'Sol', 'DR Kongo', '2027-06-30', 2.4, 3.0, 1, 1, 7.02],
    ['pritchard', 'A. Pritchard', 'Alex Pritchard', 21, 'On Numara', 'MF', 31, 171, 'Sağ', 'İngiltere', '2027-06-30', 1.8, 7.0, 2, 3, 7.14],
    ['koita', 'F. Koita', 'Bengali-Fodé Koita', 9, 'Sağ Kanat', 'MF', 34, 186, 'Sağ', 'Gine', '2027-06-30', 0.8, 3.2, 3, 1, 7.03],
    ['rodrigues-siv', 'G. Rodrigues', 'Garry Rodrigues', 24, 'Sol Kanat', 'FW', 33, 173, 'Sağ', 'Yeşil Burun', '2027-06-30', 0.9, 8.0, 2, 2, 6.99],
    ['manaj', 'R. Manaj', 'Rey Manaj', 10, 'Santrafor', 'FW', 27, 182, 'Sağ', 'Arnavutluk', '2027-06-30', 4.5, 5.0, 5, 1, 7.31],
  ],
  konyaspor: [
    ['slowik', 'J. Słowik', 'Jakub Słowik', 1, 'Kaleci', 'GK', 33, 190, 'Sağ', 'Polonya', '2027-06-30', 0.7, 1.2, 0, 0, 7.01, 1.1],
    ['boranijasevic', 'N. Boranijašević', 'Nikola Boranijašević', 22, 'Sağ Bek', 'DF', 32, 175, 'Sağ', 'Sırbistan', '2027-06-30', 0.9, 1.5, 0, 2, 6.92],
    ['demirbag', 'A. Demirbağ', 'Adil Demirbağ', 4, 'Stoper', 'DF', 26, 186, 'Sağ', 'Türkiye', '2027-06-30', 1.9, 2.2, 1, 0, 7.08],
    ['bazoer', 'R. Bazoer', 'Riechedly Bazoer', 20, 'Stoper', 'DF', 28, 184, 'Sağ', 'Hollanda', '2027-06-30', 3.2, 15.0, 0, 1, 7.06],
    ['guilherme-kon', 'Guilherme', 'Guilherme Haubert Sityá', 12, 'Sol Bek', 'DF', 34, 179, 'Sol', 'Brezilya', '2027-06-30', 1.1, 2.4, 1, 4, 7.22],
    ['jevto', 'M. Jevtović', 'Marko Jevtović', 16, 'Ön Libero', 'MF', 31, 194, 'Sağ', 'Sırbistan', '2027-06-30', 1.3, 2.2, 1, 1, 7.04],
    ['pedrinho', 'Pedrinho', 'Pedro Filipe Barbosa Moreira', 8, 'Merkez Orta Saha', 'MF', 31, 175, 'Sağ', 'Portekiz', '2027-06-30', 1.5, 2.0, 2, 2, 7.11],
    ['aleksic', 'D. Aleksić', 'Danijel Aleksić', 11, 'On Numara', 'MF', 33, 182, 'Sol', 'Sırbistan', '2027-06-30', 1.0, 4.5, 2, 2, 7.07],
    ['ndao', 'A. Ndao', 'Alassane Ndao', 18, 'Sağ Kanat', 'MF', 27, 178, 'Sağ', 'Senegal', '2027-06-30', 2.0, 2.5, 2, 2, 7.05],
    ['yusuf-erdogan', 'Y. Erdoğan', 'Yusuf Erdoğan', 10, 'Sol Kanat', 'FW', 32, 173, 'Sol', 'Türkiye', '2027-06-30', 1.2, 3.5, 2, 2, 7.03],
    ['kramer', 'B. Kramer', 'Blaž Kramer', 99, 'Santrafor', 'FW', 28, 191, 'Sağ', 'Slovenya', '2027-06-30', 1.8, 1.8, 4, 1, 7.16],
  ],
  rizespor: [
    ['grbic', 'I. Grbić', 'Ivo Grbić', 30, 'Kaleci', 'GK', 28, 195, 'Sağ', 'Hırvatistan', '2027-06-30', 3.0, 7.0, 0, 0, 7.06, 1.5],
    ['taha-sahin', 'M. Taha Şahin', 'Muhammet Taha Şahin', 37, 'Sağ Bek', 'DF', 24, 178, 'Sağ', 'Türkiye', '2027-06-30', 1.8, 1.8, 0, 2, 7.02],
    ['mocsi', 'A. Mocsi', 'Attila Mocsi', 2, 'Stoper', 'DF', 24, 189, 'Sağ', 'Macaristan', '2027-06-30', 2.5, 2.5, 1, 0, 7.09],
    ['aliqulov', 'K. Alikulov', 'Khusniddin Alikulov', 3, 'Stoper', 'DF', 25, 187, 'Sağ', 'Özbekistan', '2027-06-30', 1.7, 1.7, 1, 0, 7.05],
    ['hojer', 'C. Højer', 'Casper Højer', 5, 'Sol Bek', 'DF', 30, 180, 'Sol', 'Danimarka', '2027-06-30', 1.8, 3.0, 0, 3, 7.01],
    ['hadziahmetovic', 'A. Hadžiahmetović', 'Amir Hadžiahmetović', 19, 'Ön Libero', 'MF', 27, 180, 'Sağ', 'Bosna-Hersek', '2027-06-30', 5.0, 7.5, 1, 2, 7.18],
    ['olawoyin', 'I. Olawoyin', 'Ibrahim Olawoyin', 10, 'Merkez Orta Saha', 'MF', 26, 175, 'Sol', 'Nijerya', '2027-06-30', 3.0, 3.0, 2, 3, 7.21],
    ['varesanovic', 'D. Varešanović', 'Dal Varešanović', 77, 'On Numara', 'MF', 23, 182, 'Sağ', 'Bosna-Hersek', '2027-06-30', 3.2, 3.5, 3, 2, 7.16],
    ['ghezzal', 'R. Ghezzal', 'Rachid Ghezzal', 18, 'Sağ Kanat', 'MF', 32, 182, 'Sol', 'Cezayir', '2027-05-31', 1.4, 12.0, 2, 3, 7.14],
    ['akintola', 'B. Akintola', 'Babajide David Akintola', 28, 'Sol Kanat', 'FW', 28, 177, 'Sağ', 'Nijerya', '2027-06-30', 1.8, 2.4, 2, 1, 6.97],
    ['sowe', 'A. Sowe', 'Ali Sowe', 9, 'Santrafor', 'FW', 30, 191, 'Sağ', 'Gambiya', '2027-06-30', 2.8, 4.0, 5, 1, 7.23],
  ],
  antalyaspor: [
    ['piric', 'K. Pirić', 'Kenan Pirić', 1, 'Kaleci', 'GK', 30, 192, 'Sağ', 'Bosna-Hersek', '2027-06-30', 1.1, 1.5, 0, 0, 6.94, 0.4],
    ['balci', 'B. Balcı', 'Bünyamin Balcı', 7, 'Sağ Bek', 'DF', 24, 178, 'Sağ', 'Türkiye', '2027-06-30', 2.3, 3.5, 0, 2, 6.98],
    ['vey-sari', 'V. Sarı', 'Veysel Sarı', 89, 'Stoper', 'DF', 36, 186, 'Sağ', 'Türkiye', '2027-05-31', 0.3, 3.0, 1, 0, 6.92],
    ['thalisson', 'Thalisson', 'Thalisson Kelven', 4, 'Stoper', 'DF', 26, 186, 'Sağ', 'Brezilya', '2027-06-30', 1.5, 1.5, 0, 0, 6.95],
    ['guray', 'G. Vural', 'Güray Vural', 11, 'Sol Bek', 'DF', 36, 177, 'Sol', 'Türkiye', '2027-05-31', 0.3, 3.5, 1, 2, 6.96],
    ['kaluzinski', 'J. Kałuziński', 'Jakub Kałuziński', 18, 'Ön Libero', 'MF', 22, 185, 'Sağ', 'Polonya', '2027-06-30', 3.4, 3.4, 0, 3, 7.12],
    ['petrusenko', 'O. Petrusenko', 'Oleksandr Petrusenko', 6, 'Merkez Orta Saha', 'MF', 26, 186, 'Sağ', 'Ukrayna', '2027-06-30', 1.6, 1.6, 0, 1, 6.97],
    ['larsson-ant', 'S. Larsson', 'Sam Larsson', 10, 'On Numara', 'MF', 31, 180, 'Sağ', 'İsveç', '2027-06-30', 1.5, 6.0, 3, 2, 7.14],
    ['townsend', 'A. Townsend', 'Andros Townsend', 22, 'Sağ Kanat', 'MF', 33, 181, 'Sol', 'İngiltere', '2027-05-31', 0.9, 15.0, 1, 2, 6.99],
    ['djenepo', 'M. Djenepo', 'Moussa Djenepo', 77, 'Sol Kanat', 'FW', 26, 177, 'Sağ', 'Mali', '2027-06-30', 2.4, 15.0, 2, 1, 7.01],
    ['gaich', 'A. Gaich', 'Adolfo Gaich', 9, 'Santrafor', 'FW', 25, 190, 'Sağ', 'Arjantin', '2027-06-30', 1.8, 11.0, 3, 1, 7.04],
  ],
  'gaziantep-fk': [
    ['dioudis', 'S. Dioudis', 'Sokratis Dioudis', 1, 'Kaleci', 'GK', 31, 187, 'Sağ', 'Yunanistan', '2027-06-30', 1.0, 2.2, 0, 0, 6.95, 0.8],
    ['sorescu', 'D. Sorescu', 'Deian Sorescu', 18, 'Sağ Bek', 'DF', 27, 175, 'Sağ', 'Romanya', '2027-06-30', 1.9, 2.0, 3, 2, 7.18],
    ['kizildag', 'A. Kızıldağ', 'Arda Kızıldağ', 4, 'Stoper', 'DF', 26, 187, 'Sağ', 'Türkiye', '2027-06-30', 1.5, 1.5, 1, 0, 6.99],
    ['viana', 'B. Viana', 'Bruno Viana', 3, 'Stoper', 'DF', 29, 187, 'Sağ', 'Brezilya', '2027-06-30', 1.6, 7.0, 0, 0, 6.94],
    ['mustafa-eskihellac', 'M. Eskihellaç', 'Mustafa Eskihellaç', 17, 'Sol Bek', 'DF', 27, 175, 'Sağ', 'Türkiye', '2027-06-30', 1.7, 1.7, 1, 2, 7.03],
    ['ndou', 'B. Ndiaye', 'Badou Ndiaye', 15, 'Ön Libero', 'MF', 34, 180, 'Sağ', 'Senegal', '2027-05-31', 0.9, 14.0, 1, 1, 7.01],
    ['maxim', 'A. Maxim', 'Alexandru Maxim', 44, 'On Numara', 'MF', 34, 177, 'Sağ', 'Romanya', '2027-06-30', 0.9, 7.0, 2, 4, 7.16],
    ['kozlowski', 'K. Kozłowski', 'Kacper Kozłowski', 10, 'Merkez Orta Saha', 'MF', 21, 181, 'Sağ', 'Polonya', '2028-06-30', 4.5, 10.0, 1, 3, 7.12],
    ['lungoyi', 'C. Lungoyi', 'Christopher Lungoyi', 11, 'Sağ Kanat', 'MF', 24, 180, 'Sol', 'İsviçre', '2027-06-30', 1.4, 1.6, 2, 1, 6.98],
    ['okereke', 'D. Okereke', 'David Okereke', 77, 'Sol Kanat', 'FW', 27, 182, 'Sağ', 'Nijerya', '2027-06-30', 2.8, 7.0, 3, 1, 7.09],
    ['kodro', 'K. Kodro', 'Kenan Kodro', 9, 'Santrafor', 'FW', 31, 190, 'Sağ', 'Bosna-Hersek', '2027-06-30', 1.5, 2.5, 2, 1, 6.96],
  ],
  alanyaspor: [
    ['taskiran', 'E. Taşkıran', 'Ertuğrul Taşkıran', 1, 'Kaleci', 'GK', 35, 191, 'Sağ', 'Türkiye', '2027-06-30', 0.6, 1.2, 0, 0, 6.97, 0.9],
    ['hadergjonaj', 'F. Hadergjonaj', 'Florent Hadergjonaj', 94, 'Sağ Bek', 'DF', 30, 182, 'Sağ', 'Kosova', '2027-06-30', 2.3, 7.0, 1, 2, 7.04],
    ['lima-ala', 'N. Lima', 'Nuno Lima', 5, 'Stoper', 'DF', 23, 188, 'Sağ', 'Portekiz', '2028-06-30', 2.5, 2.5, 0, 0, 7.02],
    ['aliti', 'F. Aliti', 'Fidan Aliti', 3, 'Stoper', 'DF', 31, 182, 'Sol', 'Kosova', '2027-06-30', 1.4, 2.0, 0, 0, 6.95],
    ['balkovec', 'J. Balkovec', 'Jure Balkovec', 29, 'Sol Bek', 'DF', 30, 185, 'Sol', 'Slovenya', '2027-06-30', 1.7, 2.0, 1, 2, 7.01],
    ['richard', 'Richard', 'Richard Candido Coelho', 6, 'Ön Libero', 'MF', 30, 189, 'Sağ', 'Brezilya', '2027-06-30', 2.4, 2.6, 0, 1, 7.03],
    ['makouta', 'G. Makouta', 'Gaïus Makouta', 21, 'Merkez Orta Saha', 'MF', 27, 179, 'Sağ', 'Kongo', '2027-06-30', 2.5, 2.5, 1, 2, 7.08],
    ['karaca', 'E. Karaca', 'Efecan Karaca', 7, 'Sağ Kanat', 'MF', 35, 166, 'Sağ', 'Türkiye', '2027-05-31', 0.4, 3.0, 1, 3, 7.06],
    ['hwang', 'Hwang Ui-jo', 'Hwang Ui-jo', 16, 'On Numara', 'MF', 32, 185, 'Sağ', 'Güney Kore', '2027-06-30', 1.9, 7.0, 3, 1, 7.05],
    ['augusto', 'L. Augusto', 'Loide Augusto', 70, 'Sol Kanat', 'FW', 24, 181, 'Sağ', 'Angola', '2027-06-30', 2.2, 2.2, 2, 2, 7.09],
    ['cordova', 'S. Córdova', 'Sergio Córdova', 9, 'Santrafor', 'FW', 27, 188, 'Sağ', 'Venezuela', '2027-06-30', 2.0, 3.2, 4, 0, 7.12],
  ],
  kayserispor: [
    ['bayazit', 'B. Bayazit', 'Bilal Bayazit', 25, 'Kaleci', 'GK', 25, 189, 'Sağ', 'Türkiye', '2027-06-30', 2.4, 3.0, 0, 0, 6.96, 0.6],
    ['sazdagi', 'G. Sazdağı', 'Gökhan Sazdağı', 11, 'Sağ Bek', 'DF', 30, 182, 'Sağ', 'Türkiye', '2027-06-30', 1.4, 1.5, 1, 2, 7.03],
    ['jeanvier', 'J. Jeanvier', 'Julian Jeanvier', 33, 'Stoper', 'DF', 32, 185, 'Sağ', 'Gine', '2027-06-30', 1.1, 3.0, 0, 0, 6.91],
    ['attamah', 'J. Attamah', 'Joseph Attamah', 3, 'Stoper', 'DF', 30, 184, 'Sağ', 'Gana', '2027-06-30', 0.9, 1.5, 0, 0, 6.89],
    ['carole', 'L. Carole', 'Lionel Carole', 23, 'Sol Bek', 'DF', 33, 182, 'Sol', 'Fransa', '2027-05-31', 0.6, 5.0, 0, 1, 6.87],
    ['yilmaz-k', 'K. Yılmaz', 'Kartal Yılmaz', 8, 'Ön Libero', 'MF', 24, 176, 'Sağ', 'Türkiye', '2027-06-30', 2.5, 2.5, 1, 2, 7.07],
    ['bourabia', 'M. Bourabia', 'Mehdi Bourabia', 6, 'Merkez Orta Saha', 'MF', 33, 183, 'Sağ', 'Fas', '2027-06-30', 0.8, 3.2, 1, 2, 6.98],
    ['cardoso-m', 'M. Cardoso', 'Miguel Cardoso', 7, 'On Numara', 'MF', 30, 176, 'Sağ', 'Portekiz', '2027-06-30', 2.2, 3.0, 3, 2, 7.15],
    ['mane-kay', 'C. Mané', 'Carlos Mané', 20, 'Sağ Kanat', 'MF', 30, 173, 'Sağ', 'Gine-Bissau', '2027-06-30', 1.5, 6.0, 1, 2, 6.95],
    ['boa-morte', 'A. Boa Morte', 'Aylton Boa Morte', 70, 'Sol Kanat', 'FW', 31, 176, 'Sağ', 'Portekiz', '2027-06-30', 1.4, 2.0, 2, 1, 6.99],
    ['nazon', 'D. Nazon', 'Duckens Nazon', 9, 'Santrafor', 'FW', 30, 180, 'Sağ', 'Haiti', '2027-06-30', 1.8, 2.0, 3, 1, 7.04],
  ],
  'bodrum-fk': [
    ['sousa-b', 'D. Sousa', 'Diogo Sousa', 1, 'Kaleci', 'GK', 26, 195, 'Sağ', 'Portekiz', '2027-06-30', 1.6, 1.6, 0, 0, 6.93, 0.5],
    ['celustka', 'O. Čelůstka', 'Ondřej Čelůstka', 3, 'Sağ Bek', 'DF', 35, 182, 'Sağ', 'Çekya', '2027-05-31', 0.3, 2.5, 0, 1, 6.84],
    ['ayeti', 'A. Ajeti', 'Arlind Ajeti', 15, 'Stoper', 'DF', 31, 185, 'Sağ', 'Arnavutluk', '2027-06-30', 1.1, 2.5, 0, 0, 6.91],
    ['ergun-ali', 'A. Aytemur', 'Ali Aytemur', 34, 'Stoper', 'DF', 28, 186, 'Sağ', 'Türkiye', '2027-06-30', 0.8, 0.8, 0, 0, 6.86],
    ['sen-cenk', 'C. Şen', 'Cenk Şen', 77, 'Sol Bek', 'DF', 24, 179, 'Sol', 'Türkiye', '2027-06-30', 1.2, 1.2, 0, 2, 6.92],
    ['taylan-a', 'T. Antalyalı', 'Taylan Antalyalı', 14, 'Ön Libero', 'MF', 29, 180, 'Sağ', 'Türkiye', '2027-06-30', 1.4, 6.0, 1, 1, 6.97],
    ['mohammed-m', 'M. Mohammed', 'Musah Mohammed', 6, 'Merkez Orta Saha', 'MF', 22, 182, 'Sağ', 'Gana', '2027-06-30', 1.3, 1.3, 0, 1, 6.94],
    ['fredy', 'Fredy', 'Alfredo Kulembe Ribeiro', 16, 'On Numara', 'MF', 34, 171, 'Sağ', 'Angola', '2027-06-30', 0.9, 2.5, 2, 2, 7.05],
    ['seferi', 'T. Seferi', 'Taulant Seferi', 70, 'Sağ Kanat', 'MF', 28, 183, 'Sağ', 'Arnavutluk', '2027-06-30', 2.4, 2.5, 2, 1, 7.01],
    ['dimitrov-b', 'Z. Dimitrov', 'Zdravko Dimitrov', 7, 'Sol Kanat', 'FW', 26, 179, 'Sol', 'Bulgaristan', '2027-06-30', 1.2, 1.2, 1, 2, 6.92],
    ['puscas', 'G. Puşcaş', 'George Puşcaş', 9, 'Santrafor', 'FW', 28, 188, 'Sağ', 'Romanya', '2027-06-30', 1.8, 6.0, 4, 0, 7.06],
  ],
  hatayspor: [
    ['kardesler', 'E. Kardeşler', 'Erce Kardeşler', 1, 'Kaleci', 'GK', 30, 187, 'Sağ', 'Türkiye', '2027-06-30', 1.3, 1.8, 0, 0, 6.89, -0.4],
    ['corekci', 'K. Çörekçi', 'Kamil Ahmet Çörekçi', 2, 'Sağ Bek', 'DF', 32, 177, 'Sağ', 'Türkiye', '2027-05-31', 0.5, 1.8, 0, 1, 6.81],
    ['calvo', 'F. Calvo', 'Francisco Calvo', 15, 'Stoper', 'DF', 32, 181, 'Sol', 'Kosta Rika', '2027-06-30', 1.1, 2.5, 1, 0, 6.88],
    ['kilama', 'G. Kilama', 'Guy-Marcelin Kilama', 4, 'Stoper', 'DF', 25, 188, 'Sağ', 'Kamerun', '2027-06-30', 1.6, 1.6, 0, 0, 6.85],
    ['sertel', 'C. Sertel', 'Cemali Sertel', 3, 'Sol Bek', 'DF', 24, 182, 'Sol', 'Türkiye', '2027-06-30', 1.0, 1.2, 0, 1, 6.83],
    ['diack', 'L. Diack', 'Lamine Diack', 8, 'Ön Libero', 'MF', 24, 186, 'Sağ', 'Senegal', '2027-06-30', 2.0, 2.2, 0, 1, 6.91],
    ['massanga', 'C. Massanga', 'Chandrel Massanga', 6, 'Merkez Orta Saha', 'MF', 25, 182, 'Sağ', 'Kongo', '2027-06-30', 1.2, 1.2, 1, 0, 6.87],
    ['pedro-rui', 'R. Pedro', 'Rui Pedro', 10, 'On Numara', 'MF', 26, 178, 'Sağ', 'Portekiz', '2027-06-30', 1.4, 2.0, 1, 3, 6.95],
    ['fernandes-j', 'J. Fernandes', 'Joelson Fernandes', 77, 'Sağ Kanat', 'MF', 21, 174, 'Sağ', 'Portekiz', '2027-06-30', 1.6, 2.2, 1, 2, 6.94],
    ['bamgboye', 'F. Bamgboye', 'Funsho Bamgboye', 7, 'Sol Kanat', 'FW', 25, 175, 'Sağ', 'Nijerya', '2027-06-30', 1.2, 1.5, 2, 1, 6.92],
    ['aboubakar', 'V. Aboubakar', 'Vincent Aboubakar', 9, 'Santrafor', 'FW', 32, 184, 'Sağ', 'Kamerun', '2027-05-31', 2.8, 18.0, 4, 1, 7.12],
  ],
};

// Detailed injury / transfer / rumour overrides for key Süper Lig stars
const SPECIAL_PLAYER_DETAILS = {
  osimhen: {
    birthDate: '1998-12-29',
    marketHistory: [
      { recordedDate: '2020-09-01', value: 40000000, clubId: 'napoli', club: 'SSC Napoli', age: 21 },
      { recordedDate: '2022-06-01', value: 65000000, clubId: 'napoli', club: 'SSC Napoli', age: 23 },
      { recordedDate: '2023-06-15', value: 120000000, clubId: 'napoli', club: 'SSC Napoli', age: 24 },
      { recordedDate: '2024-06-01', value: 100000000, clubId: 'napoli', club: 'SSC Napoli', age: 25 },
      { recordedDate: '2025-09-04', value: 75000000, clubId: 'galatasaray', club: 'Galatasaray', age: 26 },
      { recordedDate: '2026-10-15', value: 75000000, clubId: 'galatasaray', club: 'Galatasaray', age: 27 },
    ],
    transfers: [
      { season: '2020/21', transferDate: '2020-09-01', fromClubId: 'psg', from: 'Paris Saint-Germain', toClubId: 'napoli', to: 'SSC Napoli', fee: '€77.5M', feeEur: 77500000, marketValue: 40000000, type: 'Bonservis' },
      { season: '2024/25', transferDate: '2024-09-04', fromClubId: 'napoli', from: 'SSC Napoli', toClubId: 'galatasaray', to: 'Galatasaray', fee: 'Kiralık', feeEur: 0, marketValue: 100000000, type: 'Kiralık' },
      { season: '2025/26', transferDate: '2025-07-18', fromClubId: 'napoli', from: 'SSC Napoli', toClubId: 'galatasaray', to: 'Galatasaray', fee: '€68.0M', feeEur: 68000000, marketValue: 75000000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'arsenal', club: 'Arsenal', rumourDate: '2026-11-12', transferProbability: 64, source: 'Sky Sports' },
      { clubId: 'man-united', club: 'Manchester United', rumourDate: '2026-11-08', transferProbability: 52, source: 'The Athletic' },
      { clubId: 'psg', club: 'Paris Saint-Germain', rumourDate: '2026-10-29', transferProbability: 41, source: "L'Équipe" },
    ],
    injuries: [
      ['head', { reason: 'Elmacık kemiği ve göz çukuru kırığı', fromDate: '2021-11-21', toDate: '2022-01-16', days: 56, missedGames: 10, clubId: 'napoli', clubName: 'SSC Napoli' }],
      ['shoulder', { reason: 'Sağ omuz çıkığı', fromDate: '2020-11-13', toDate: '2021-01-23', days: 71, missedGames: 14, clubId: 'napoli', clubName: 'SSC Napoli' }],
      ['shoulder', { reason: 'Omuz eklemi travması', fromDate: '2022-04-12', toDate: '2022-04-21', days: 9, missedGames: 2, clubId: 'napoli', clubName: 'SSC Napoli' }],
      ['shoulder', { reason: 'Sol omuz kapsül zedelenmesi', fromDate: '2023-01-08', toDate: '2023-01-19', days: 11, missedGames: 2, clubId: 'napoli', clubName: 'SSC Napoli' }],
      ['hamstring', { reason: 'Biceps femoris kas yırtığı', fromDate: '2022-09-08', toDate: '2022-10-11', days: 33, missedGames: 6, clubId: 'napoli', clubName: 'SSC Napoli' }],
      ['hamstring', { reason: 'Arka adale gerilmesi', fromDate: '2023-10-14', toDate: '2023-11-24', days: 41, missedGames: 6, clubId: 'napoli', clubName: 'SSC Napoli' }],
      ['thigh_front', { reason: 'Ön üst adale zorlanması', fromDate: '2025-10-02', toDate: '2025-10-20', days: 18, missedGames: 3, clubId: 'galatasaray', clubName: 'Galatasaray' }],
    ],
    systemic: [
      { reason: 'Corona virus', category: 'Hastalık', fromDate: '2021-01-01', toDate: '2021-01-22', days: 21, missedGames: 4, clubId: 'napoli', clubName: 'SSC Napoli' },
      { reason: 'Fitness', category: 'Kondisyon', fromDate: '2024-09-05', toDate: '2024-09-12', days: 7, missedGames: 1, clubId: 'galatasaray', clubName: 'Galatasaray' },
    ],
  },
  icardi: {
    birthDate: '1993-02-19',
    marketHistory: [
      { recordedDate: '2018-12-20', value: 100000000, clubId: 'inter', club: 'Inter', age: 25 },
      { recordedDate: '2020-07-01', value: 60000000, clubId: 'psg', club: 'Paris Saint-Germain', age: 27 },
      { recordedDate: '2022-09-08', value: 17500000, clubId: 'galatasaray', club: 'Galatasaray', age: 29 },
      { recordedDate: '2023-07-28', value: 20000000, clubId: 'galatasaray', club: 'Galatasaray', age: 30 },
      { recordedDate: '2025-06-01', value: 16000000, clubId: 'galatasaray', club: 'Galatasaray', age: 32 },
      { recordedDate: '2026-10-15', value: 15000000, clubId: 'galatasaray', club: 'Galatasaray', age: 33 },
    ],
    transfers: [
      { season: '2020/21', transferDate: '2020-07-01', fromClubId: 'inter', from: 'Inter', toClubId: 'psg', to: 'Paris Saint-Germain', fee: '€50.0M', feeEur: 50000000, marketValue: 60000000, type: 'Bonservis' },
      { season: '2022/23', transferDate: '2022-09-08', fromClubId: 'psg', from: 'Paris Saint-Germain', toClubId: 'galatasaray', to: 'Galatasaray', fee: 'Kiralık', feeEur: 0, marketValue: 17500000, type: 'Kiralık' },
      { season: '2023/24', transferDate: '2023-07-30', fromClubId: 'psg', from: 'Paris Saint-Germain', toClubId: 'galatasaray', to: 'Galatasaray', fee: '€10.0M', feeEur: 10000000, marketValue: 20000000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'roma', club: 'AS Roma', rumourDate: '2026-11-10', transferProbability: 46, source: 'Corriere dello Sport' },
      { clubId: 'al-nassr', club: 'Al-Nassr', rumourDate: '2026-11-04', transferProbability: 38, source: 'Arriyadiyah' },
    ],
    injuries: [
      ['knee', { reason: 'Ön çapraz bağ (ACL) yırtığı', fromDate: '2024-11-07', toDate: '2025-05-05', days: 179, missedGames: 28, clubId: 'galatasaray', clubName: 'Galatasaray' }],
      ['knee', { reason: 'İç yan bağ gerilmesi', fromDate: '2020-10-08', toDate: '2020-11-09', days: 32, missedGames: 7, clubId: 'psg', clubName: 'Paris Saint-Germain' }],
      ['knee', { reason: 'Diz eklemi sıvı birikimi', fromDate: '2019-02-14', toDate: '2019-03-29', days: 43, missedGames: 8, clubId: 'inter', clubName: 'Inter' }],
      ['ankle_foot', { reason: 'Sağ ayak bileği burkulması', fromDate: '2023-10-21', toDate: '2023-11-02', days: 12, missedGames: 2, clubId: 'galatasaray', clubName: 'Galatasaray' }],
      ['head', { reason: 'Yüz kemiği darbesi', fromDate: '2023-12-24', toDate: '2024-01-12', days: 19, missedGames: 3, clubId: 'galatasaray', clubName: 'Galatasaray' }],
      ['hamstring', { reason: 'Arka adale çekmesi', fromDate: '2022-11-28', toDate: '2022-12-22', days: 24, missedGames: 3, clubId: 'galatasaray', clubName: 'Galatasaray' }],
    ],
    systemic: [
      { reason: 'Rest', category: 'Dinlenme', fromDate: '2024-01-13', toDate: '2024-01-20', days: 7, missedGames: 1, clubId: 'galatasaray', clubName: 'Galatasaray' },
      { reason: 'Fever', category: 'Hastalık', fromDate: '2021-11-02', toDate: '2021-11-07', days: 5, missedGames: 1, clubId: 'psg', clubName: 'Paris Saint-Germain' },
    ],
  },
  immobile: {
    birthDate: '1990-02-20',
    marketHistory: [
      { recordedDate: '2018-06-01', value: 50000000, clubId: 'lazio', club: 'SS Lazio', age: 28 },
      { recordedDate: '2020-08-01', value: 45000000, clubId: 'lazio', club: 'SS Lazio', age: 30 },
      { recordedDate: '2022-06-01', value: 27000000, clubId: 'lazio', club: 'SS Lazio', age: 32 },
      { recordedDate: '2024-07-12', value: 4000000, clubId: 'besiktas', club: 'Beşiktaş', age: 34 },
      { recordedDate: '2026-10-15', value: 4000000, clubId: 'besiktas', club: 'Beşiktaş', age: 36 },
    ],
    transfers: [
      { season: '2016/17', transferDate: '2016-07-27', fromClubId: 'sevilla', from: 'Sevilla FC', toClubId: 'lazio', to: 'SS Lazio', fee: '€9.45M', feeEur: 9450000, marketValue: 12000000, type: 'Bonservis' },
      { season: '2024/25', transferDate: '2024-07-13', fromClubId: 'lazio', from: 'SS Lazio', toClubId: 'besiktas', to: 'Beşiktaş', fee: '€2.0M', feeEur: 2000000, marketValue: 4000000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'lazio', club: 'SS Lazio', rumourDate: '2026-10-25', transferProbability: 22, source: 'Sky Italia' },
    ],
    injuries: [
      ['hamstring', { reason: 'Hamstring kas yırtığı', fromDate: '2022-10-16', toDate: '2022-11-18', days: 33, missedGames: 7, clubId: 'lazio', clubName: 'SS Lazio' }],
      ['hamstring', { reason: 'Sol arka adale zorlanması', fromDate: '2023-01-15', toDate: '2023-02-05', days: 21, missedGames: 5, clubId: 'lazio', clubName: 'SS Lazio' }],
      ['hamstring', { reason: 'Sağ hamstring ödemi', fromDate: '2024-11-04', toDate: '2024-11-21', days: 17, missedGames: 3, clubId: 'besiktas', clubName: 'Beşiktaş' }],
      ['calf', { reason: 'Baldır adale gerilmesi', fromDate: '2021-11-07', toDate: '2021-11-26', days: 19, missedGames: 4, clubId: 'lazio', clubName: 'SS Lazio' }],
      ['chest_ribs', { reason: 'Kaburga ezilmesi (trafik kazası)', fromDate: '2023-04-16', toDate: '2023-04-28', days: 12, missedGames: 2, clubId: 'lazio', clubName: 'SS Lazio' }],
    ],
    systemic: [
      { reason: 'Corona virus', category: 'Hastalık', fromDate: '2021-12-18', toDate: '2021-12-28', days: 10, missedGames: 2, clubId: 'lazio', clubName: 'SS Lazio' },
    ],
  },
  'rafa-silva': {
    birthDate: '1993-05-17',
    marketHistory: [
      { recordedDate: '2019-12-10', value: 30000000, clubId: 'benfica', club: 'SL Benfica', age: 26 },
      { recordedDate: '2021-06-01', value: 23000000, clubId: 'benfica', club: 'SL Benfica', age: 28 },
      { recordedDate: '2023-06-01', value: 20000000, clubId: 'benfica', club: 'SL Benfica', age: 30 },
      { recordedDate: '2024-06-27', value: 14000000, clubId: 'besiktas', club: 'Beşiktaş', age: 31 },
      { recordedDate: '2026-10-15', value: 14000000, clubId: 'besiktas', club: 'Beşiktaş', age: 33 },
    ],
    transfers: [
      { season: '2024/25', transferDate: '2024-06-27', fromClubId: 'benfica', from: 'SL Benfica', toClubId: 'besiktas', to: 'Beşiktaş', fee: 'Bedelsiz', feeEur: 0, marketValue: 14000000, type: 'Bedelsiz' },
    ],
    rumours: [
      { clubId: 'al-nassr', club: 'Al-Nassr', rumourDate: '2026-11-11', transferProbability: 58, source: 'Record Portugal' },
    ],
    injuries: [
      ['groin', { reason: 'Kasık adale zorlanması', fromDate: '2020-07-02', toDate: '2020-07-22', days: 20, missedGames: 4, clubId: 'benfica', clubName: 'SL Benfica' }],
      ['thigh_front', { reason: 'Kuadriseps gerilmesi', fromDate: '2023-02-11', toDate: '2023-02-26', days: 15, missedGames: 3, clubId: 'benfica', clubName: 'SL Benfica' }],
    ],
    systemic: [
      { reason: 'Rest', category: 'Dinlenme', fromDate: '2025-02-01', toDate: '2025-02-06', days: 5, missedGames: 1, clubId: 'besiktas', clubName: 'Beşiktaş' },
    ],
  },
  'en-nesyri': {
    birthDate: '1997-06-01',
    marketHistory: [
      { recordedDate: '2021-06-01', value: 40000000, clubId: 'sevilla', club: 'Sevilla FC', age: 24 },
      { recordedDate: '2023-06-01', value: 20000000, clubId: 'sevilla', club: 'Sevilla FC', age: 26 },
      { recordedDate: '2024-07-25', value: 20000000, clubId: 'fenerbahce', club: 'Fenerbahçe', age: 27 },
      { recordedDate: '2026-10-15', value: 22000000, clubId: 'fenerbahce', club: 'Fenerbahçe', age: 29 },
    ],
    transfers: [
      { season: '2024/25', transferDate: '2024-07-25', fromClubId: 'sevilla', from: 'Sevilla FC', toClubId: 'fenerbahce', to: 'Fenerbahçe', fee: '€19.5M', feeEur: 19500000, marketValue: 20000000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'al-nassr', club: 'Al-Nassr', rumourDate: '2026-11-14', transferProbability: 67, source: 'Marca' },
      { clubId: 'roma', club: 'AS Roma', rumourDate: '2026-11-01', transferProbability: 34, source: 'Gazzetta' },
    ],
    injuries: [
      ['hamstring', { reason: 'Hamstring yırtığı', fromDate: '2021-09-25', toDate: '2021-10-28', days: 33, missedGames: 6, clubId: 'sevilla', clubName: 'Sevilla FC' }],
      ['ankle_foot', { reason: 'Ayak bileği bağ esnemesi', fromDate: '2021-11-03', toDate: '2022-01-05', days: 63, missedGames: 12, clubId: 'sevilla', clubName: 'Sevilla FC' }],
    ],
    systemic: [],
  },
  fred: {
    birthDate: '1993-03-05',
    marketHistory: [
      { recordedDate: '2018-06-21', value: 32000000, clubId: 'man-united', club: 'Manchester United', age: 25 },
      { recordedDate: '2022-06-01', value: 20000000, clubId: 'man-united', club: 'Manchester United', age: 29 },
      { recordedDate: '2023-08-13', value: 20000000, clubId: 'fenerbahce', club: 'Fenerbahçe', age: 30 },
      { recordedDate: '2026-10-15', value: 15000000, clubId: 'fenerbahce', club: 'Fenerbahçe', age: 33 },
    ],
    transfers: [
      { season: '2023/24', transferDate: '2023-08-13', fromClubId: 'man-united', from: 'Manchester United', toClubId: 'fenerbahce', to: 'Fenerbahçe', fee: '€9.74M', feeEur: 9740000, marketValue: 20000000, type: 'Bonservis' },
    ],
    rumours: [],
    injuries: [
      ['groin', { reason: 'Kasık adalesi yırtığı', fromDate: '2023-10-29', toDate: '2023-11-29', days: 31, missedGames: 6, clubId: 'fenerbahce', clubName: 'Fenerbahçe' }],
      ['thigh_front', { reason: 'Ön üst adale zorlanması', fromDate: '2024-01-21', toDate: '2024-02-22', days: 32, missedGames: 7, clubId: 'fenerbahce', clubName: 'Fenerbahçe' }],
      ['knee', { reason: 'Sağ diz iç yan bağ darbesi', fromDate: '2024-07-30', toDate: '2024-08-19', days: 20, missedGames: 4, clubId: 'fenerbahce', clubName: 'Fenerbahçe' }],
    ],
    systemic: [
      { reason: 'Corona virus', category: 'Hastalık', fromDate: '2022-04-01', toDate: '2022-04-09', days: 8, missedGames: 2, clubId: 'man-united', clubName: 'Manchester United' },
    ],
  },
  soyuncu: {
    birthDate: '1996-05-23',
    marketHistory: [
      { recordedDate: '2021-06-01', value: 45000000, clubId: 'atletico', club: 'Atlético Madrid', age: 25 },
      { recordedDate: '2023-07-05', value: 15000000, clubId: 'atletico', club: 'Atlético Madrid', age: 27 },
      { recordedDate: '2024-07-01', value: 10000000, clubId: 'fenerbahce', club: 'Fenerbahçe', age: 28 },
      { recordedDate: '2026-10-15', value: 10000000, clubId: 'fenerbahce', club: 'Fenerbahçe', age: 30 },
    ],
    transfers: [
      { season: '2024/25', transferDate: '2024-07-01', fromClubId: 'atletico', from: 'Atlético Madrid', toClubId: 'fenerbahce', to: 'Fenerbahçe', fee: '€8.5M', feeEur: 8500000, marketValue: 10000000, type: 'Bonservis' },
    ],
    rumours: [],
    injuries: [
      ['groin', { reason: 'Kasık fıtığı başlangıcı', fromDate: '2020-10-14', toDate: '2020-11-29', days: 46, missedGames: 10, clubId: 'atletico', clubName: 'Atlético Madrid' }],
      ['groin', { reason: 'Adduktor adale zorlanması', fromDate: '2023-09-12', toDate: '2023-10-03', days: 21, missedGames: 5, clubId: 'atletico', clubName: 'Atlético Madrid' }],
      ['hamstring', { reason: 'Hamstring kas yırtığı', fromDate: '2024-03-17', toDate: '2024-04-08', days: 22, missedGames: 4, clubId: 'fenerbahce', clubName: 'Fenerbahçe' }],
      ['knee', { reason: 'Sol diz burkulması', fromDate: '2024-11-09', toDate: '2024-12-03', days: 24, missedGames: 4, clubId: 'fenerbahce', clubName: 'Fenerbahçe' }],
    ],
    systemic: [],
  },
  sanchez: {
    birthDate: '1996-06-12',
    marketHistory: [
      { recordedDate: '2019-12-10', value: 60000000, clubId: 'tottenham', club: 'Tottenham Hotspur', age: 23 },
      { recordedDate: '2022-06-01', value: 28000000, clubId: 'tottenham', club: 'Tottenham Hotspur', age: 26 },
      { recordedDate: '2023-09-04', value: 14000000, clubId: 'galatasaray', club: 'Galatasaray', age: 27 },
      { recordedDate: '2026-10-15', value: 19000000, clubId: 'galatasaray', club: 'Galatasaray', age: 30 },
    ],
    transfers: [
      { season: '2023/24', transferDate: '2023-09-04', fromClubId: 'tottenham', from: 'Tottenham Hotspur', toClubId: 'galatasaray', to: 'Galatasaray', fee: '€9.5M', feeEur: 9500000, marketValue: 14000000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'napoli', club: 'SSC Napoli', rumourDate: '2026-11-09', transferProbability: 48, source: 'Di Marzio' },
    ],
    injuries: [
      ['hamstring', { reason: 'Sol arka adale yırtığı', fromDate: '2023-11-26', toDate: '2024-01-05', days: 40, missedGames: 7, clubId: 'galatasaray', clubName: 'Galatasaray' }],
      ['back', { reason: 'Bel fıtığı spazmı', fromDate: '2021-02-15', toDate: '2021-02-26', days: 11, missedGames: 2, clubId: 'tottenham', clubName: 'Tottenham Hotspur' }],
    ],
    systemic: [],
  },
  'baris-alper': {
    birthDate: '2000-05-23',
    marketHistory: [
      { recordedDate: '2021-07-09', value: 1500000, clubId: 'galatasaray', club: 'Galatasaray', age: 21 },
      { recordedDate: '2023-06-15', value: 3500000, clubId: 'galatasaray', club: 'Galatasaray', age: 23 },
      { recordedDate: '2024-07-20', value: 17000000, clubId: 'galatasaray', club: 'Galatasaray', age: 24 },
      { recordedDate: '2026-10-15', value: 21000000, clubId: 'galatasaray', club: 'Galatasaray', age: 26 },
    ],
    transfers: [
      { season: '2021/22', transferDate: '2021-07-09', fromClubId: 'ankara-kecioren', from: 'Başakşehir', toClubId: 'galatasaray', to: 'Galatasaray', fee: '€2.1M', feeEur: 2100000, marketValue: 1500000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'arsenal', club: 'Arsenal', rumourDate: '2026-11-15', transferProbability: 71, source: 'Evening Standard' },
      { clubId: 'tottenham', club: 'Tottenham Hotspur', rumourDate: '2026-11-05', transferProbability: 54, source: 'BBC Sport' },
    ],
    injuries: [
      ['ankle_foot', { reason: 'Ayak bileği ezilmesi', fromDate: '2024-12-08', toDate: '2024-12-20', days: 12, missedGames: 2, clubId: 'galatasaray', clubName: 'Galatasaray' }],
    ],
    systemic: [
      { reason: 'Fitness', category: 'Kondisyon', fromDate: '2023-08-05', toDate: '2023-08-09', days: 4, missedGames: 0, clubId: 'galatasaray', clubName: 'Galatasaray' },
    ],
  },
  'gabriel-sara': {
    birthDate: '1999-06-26',
    marketHistory: [
      { recordedDate: '2022-07-15', value: 9000000, clubId: 'arsenal', club: 'Arsenal', age: 23 },
      { recordedDate: '2024-08-04', value: 18000000, clubId: 'galatasaray', club: 'Galatasaray', age: 25 },
      { recordedDate: '2026-10-15', value: 22000000, clubId: 'galatasaray', club: 'Galatasaray', age: 27 },
    ],
    transfers: [
      { season: '2024/25', transferDate: '2024-08-04', fromClubId: 'arsenal', from: 'Arsenal', toClubId: 'galatasaray', to: 'Galatasaray', fee: '€18.0M', feeEur: 18000000, marketValue: 18000000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'man-united', club: 'Manchester United', rumourDate: '2026-11-13', transferProbability: 62, source: 'Sky Sports' },
    ],
    injuries: [
      ['ankle_foot', { reason: 'Ayak bileği bağ yaralanması', fromDate: '2022-04-20', toDate: '2022-06-25', days: 66, missedGames: 8, clubId: 'arsenal', clubName: 'Arsenal' }],
    ],
    systemic: [],
  },
  'berke-ozer': {
    birthDate: '2000-05-25',
    marketHistory: [
      { recordedDate: '2022-09-01', value: 800000, clubId: 'porto', club: 'FC Porto', age: 22 },
      { recordedDate: '2024-06-01', value: 2500000, clubId: 'eyupspor', club: 'Eyüpspor', age: 24 },
      { recordedDate: '2026-10-15', value: 5000000, clubId: 'eyupspor', club: 'Eyüpspor', age: 26 },
    ],
    transfers: [
      { season: '2022/23', transferDate: '2022-09-01', fromClubId: 'fenerbahce', from: 'Fenerbahçe', toClubId: 'porto', to: 'FC Porto', fee: 'Bedelsiz', feeEur: 0, marketValue: 800000, type: 'Bedelsiz' },
      { season: '2023/24', transferDate: '2023-07-01', fromClubId: 'porto', from: 'FC Porto', toClubId: 'eyupspor', to: 'Eyüpspor', fee: '€400K', feeEur: 400000, marketValue: 1200000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'galatasaray', club: 'Galatasaray', rumourDate: '2026-11-14', transferProbability: 74, source: 'NTV Spor' },
      { clubId: 'fenerbahce', club: 'Fenerbahçe', rumourDate: '2026-11-06', transferProbability: 45, source: 'TRT Spor' },
    ],
    injuries: [
      ['arm_wrist', { reason: 'Sağ el bileği çatlağı', fromDate: '2023-11-10', toDate: '2023-12-08', days: 28, missedGames: 4, clubId: 'eyupspor', clubName: 'Eyüpspor' }],
    ],
    systemic: [],
  },
  ugurcan: {
    birthDate: '1996-04-05',
    marketHistory: [
      { recordedDate: '2021-06-01', value: 19000000, clubId: 'trabzonspor', club: 'Trabzonspor', age: 25 },
      { recordedDate: '2023-06-01', value: 12000000, clubId: 'trabzonspor', club: 'Trabzonspor', age: 27 },
      { recordedDate: '2026-10-15', value: 8500000, clubId: 'trabzonspor', club: 'Trabzonspor', age: 30 },
    ],
    transfers: [],
    rumours: [
      { clubId: 'galatasaray', club: 'Galatasaray', rumourDate: '2026-11-10', transferProbability: 51, source: 'Fanatik' },
    ],
    injuries: [
      ['shoulder', { reason: 'Omuz rotator manşet zorlanması', fromDate: '2022-08-24', toDate: '2022-09-09', days: 16, missedGames: 3, clubId: 'trabzonspor', clubName: 'Trabzonspor' }],
      ['groin', { reason: 'Kasık adale çekmesi', fromDate: '2024-02-18', toDate: '2024-03-04', days: 15, missedGames: 2, clubId: 'trabzonspor', clubName: 'Trabzonspor' }],
    ],
    systemic: [
      { reason: 'Fever', category: 'Hastalık', fromDate: '2023-03-11', toDate: '2023-03-15', days: 4, missedGames: 1, clubId: 'trabzonspor', clubName: 'Trabzonspor' },
    ],
  },
  romulo: {
    birthDate: '2002-02-08',
    marketHistory: [
      { recordedDate: '2024-02-07', value: 1200000, clubId: 'goztepe', club: 'Göztepe', age: 22 },
      { recordedDate: '2025-06-01', value: 5500000, clubId: 'goztepe', club: 'Göztepe', age: 23 },
      { recordedDate: '2026-10-15', value: 9000000, clubId: 'goztepe', club: 'Göztepe', age: 24 },
    ],
    transfers: [],
    rumours: [
      { clubId: 'fenerbahce', club: 'Fenerbahçe', rumourDate: '2026-11-15', transferProbability: 68, source: 'beIN Sports TR' },
      { clubId: 'ajax', club: 'Ajax', rumourDate: '2026-11-02', transferProbability: 59, source: 'Voetbal International' },
    ],
    injuries: [
      ['calf', { reason: 'Sağ baldır kası gerilmesi', fromDate: '2025-09-14', toDate: '2025-09-28', days: 14, missedGames: 2, clubId: 'goztepe', clubName: 'Göztepe' }],
    ],
    systemic: [],
  },
  kutucu: {
    birthDate: '2000-03-01',
    marketHistory: [
      { recordedDate: '2020-06-01', value: 4500000, clubId: 'bayern', club: 'Bayern Münih', age: 20 },
      { recordedDate: '2023-07-12', value: 1500000, clubId: 'eyupspor', club: 'Eyüpspor', age: 23 },
      { recordedDate: '2026-10-15', value: 5500000, clubId: 'eyupspor', club: 'Eyüpspor', age: 26 },
    ],
    transfers: [
      { season: '2023/24', transferDate: '2023-07-12', fromClubId: 'basaksehir', from: 'Başakşehir', toClubId: 'eyupspor', to: 'Eyüpspor', fee: '€750K', feeEur: 750000, marketValue: 1500000, type: 'Bonservis' },
    ],
    rumours: [
      { clubId: 'galatasaray', club: 'Galatasaray', rumourDate: '2026-11-16', transferProbability: 78, source: 'HT Spor' },
      { clubId: 'besiktas', club: 'Beşiktaş', rumourDate: '2026-11-09', transferProbability: 49, source: 'beIN Sports TR' },
    ],
    injuries: [
      ['thigh_front', { reason: 'Ön adale gerilmesi', fromDate: '2024-03-01', toDate: '2024-03-19', days: 18, missedGames: 2, clubId: 'eyupspor', clubName: 'Eyüpspor' }],
    ],
    systemic: [],
  },
};

// Fix the temporary clubId in baris-alper transfer so every clubId exists in clubs.json
SPECIAL_PLAYER_DETAILS['baris-alper'].transfers[0].fromClubId = 'basaksehir';

const REGION_REASON_TEMPLATES = {
  head: ['Elmacık kemiği darbesi', 'Kafa travması / sarsıntı'],
  shoulder: ['Omuz eklemi çıkığı', 'Rotator manşet zedelenmesi'],
  chest_ribs: ['Kaburga ezilmesi', 'Göğüs kafesi darbesi'],
  arm_wrist: ['El bileği burkulması', 'Ön kol çatlağı'],
  groin: ['Kasık adale zorlanması', 'Adduktor yırtığı'],
  thigh_front: ['Kuadriseps kas gerilmesi', 'Ön üst adale ödemi'],
  hamstring: ['Hamstring kas yırtığı', 'Biceps femoris çekmesi'],
  knee: ['Diz iç yan bağ burkulması', 'Menisküs tahrişi', 'Diz eklemi ödemi'],
  calf: ['Baldır kası zorlanması', 'Soleus kas yırtığı'],
  ankle_foot: ['Ayak bileği burkulması', 'Aşil tendonu hassasiyeti'],
  back: ['Bel fıtığı spazmı', 'Alt sırt kas tutulması'],
  other: ['Genel kas yorgunluğu', 'Kalça fleksör gerilmesi'],
};

const SYSTEMIC_TEMPLATES = [
  { reason: 'Corona virus', category: 'Hastalık' },
  { reason: 'Fever', category: 'Hastalık' },
  { reason: 'Fitness', category: 'Kondisyon' },
  { reason: 'Rest', category: 'Dinlenme' },
];

const clubMap = new Map(SUPER_LIG_CLUBS.map((c) => [c.id, c]));
const allClubsList = [];
const allPlayersList = [];
const playerById = new Map();

// Build 198+ players
for (const club of SUPER_LIG_CLUBS) {
  const rawRoster = CLUB_ROSTERS[club.id];
  const squadMembers = [];

  for (const row of rawRoster) {
    const [
      id,
      name,
      fullName,
      shirtNumber,
      positionMain,
      positionGroup,
      age,
      height,
      foot,
      citizenship,
      contractExpiry,
      marketValM,
      peakValM,
      goals,
      assists,
      avgMatchRating,
      psxgPM,
    ] = row;

    const gamesPlayed = randInt(9, 12);
    const minutesPlayed = gamesPlayed * randInt(72, 90);
    const per90Base = minutesPlayed > 0 ? 90 / minutesPlayed : 0;
    const xG = positionGroup === 'GK' ? 0 : round2(Math.max(0.1, goals * (0.85 + rand() * 0.35)));
    const xA = positionGroup === 'GK' ? 0 : round2(Math.max(0.1, assists * (0.8 + rand() * 0.4)));
    const currentMarketValueEur = Math.round(marketValM * 1_000_000);
    const peakMarketValueEur = Math.round(Math.max(marketValM, peakValM) * 1_000_000);

    const special = SPECIAL_PLAYER_DETAILS[id];
    const anatomyRegions = createEmptyAnatomyRegions();
    let systemicRecords = [];

    if (special) {
      for (const [regionId, rec] of special.injuries) {
        addInjuryToRegions(anatomyRegions, regionId, rec);
      }
      systemicRecords = special.systemic;
    } else {
      // Deterministically generate realistic injury profile for regular players
      const numInjuries = rand() < 0.25 ? 0 : rand() < 0.65 ? 2 : 4;
      for (let i = 0; i < numInjuries; i++) {
        const reg = pick(ANATOMY_REGIONS);
        const days = randInt(7, 38);
        const yr = randInt(2022, 2025);
        const mo = randInt(1, 10);
        const fromDate = `${yr}-${String(mo).padStart(2, '0')}-${String(randInt(1, 20)).padStart(2, '0')}`;
        const toDate = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(randInt(1, 25)).padStart(2, '0')}`;
        addInjuryToRegions(anatomyRegions, reg, {
          reason: pick(REGION_REASON_TEMPLATES[reg]),
          fromDate,
          toDate,
          days,
          missedGames: Math.max(1, Math.round(days / 6)),
          clubId: club.id,
          clubName: club.name,
        });
      }
      if (rand() < 0.35) {
        const sys = pick(SYSTEMIC_TEMPLATES);
        const d = randInt(4, 12);
        systemicRecords.push({
          reason: sys.reason,
          category: sys.category,
          fromDate: '2024-02-05',
          toDate: `2024-02-${String(5 + d).padStart(2, '0')}`,
          days: d,
          missedGames: d >= 7 ? 2 : 1,
          clubId: club.id,
          clubName: club.name,
        });
      }
    }

    const totalInjCount = Object.values(anatomyRegions).reduce((acc, r) => acc + r.count, 0);
    const maxHeat = Math.max(...Object.values(anatomyRegions).map((r) => r.heatLevel));
    const missedGamesTotal =
      Object.values(anatomyRegions).reduce((acc, r) => acc + r.missedGames, 0) +
      systemicRecords.reduce((acc, r) => acc + r.missedGames, 0);

    let injuryRisk = 'Düşük';
    if (maxHeat >= 3 || totalInjCount >= 6) injuryRisk = 'Kritik';
    else if (maxHeat === 2 || totalInjCount >= 4) injuryRisk = 'Yüksek';
    else if (totalInjCount >= 2) injuryRisk = 'Orta';

    const marketValueHistory = special?.marketHistory ?? [
      { recordedDate: '2022-06-01', value: Math.round(peakMarketValueEur * 0.72), clubId: club.id, club: club.name, age: Math.max(17, age - 4) },
      { recordedDate: '2023-06-01', value: Math.round(peakMarketValueEur * 0.9), clubId: club.id, club: club.name, age: Math.max(18, age - 3) },
      { recordedDate: '2024-06-01', value: peakMarketValueEur, clubId: club.id, club: club.name, age: Math.max(18, age - 2) },
      { recordedDate: '2025-06-01', value: Math.round((peakMarketValueEur + currentMarketValueEur) / 2), clubId: club.id, club: club.name, age: Math.max(18, age - 1) },
      { recordedDate: '2026-10-15', value: currentMarketValueEur, clubId: club.id, club: club.name, age },
    ];

    const partnerClub = PARTNER_CLUBS[randInt(0, PARTNER_CLUBS.length - 1)];
    const transfers = special?.transfers ?? [
      {
        season: '2024/25',
        transferDate: '2024-07-15',
        fromClubId: partnerClub.id,
        from: partnerClub.name,
        toClubId: club.id,
        to: club.name,
        fee: currentMarketValueEur > 4_000_000 ? `€${round1(marketValM * 0.65)}M` : 'Bedelsiz',
        feeEur: currentMarketValueEur > 4_000_000 ? Math.round(currentMarketValueEur * 0.65) : 0,
        marketValue: currentMarketValueEur,
        type: currentMarketValueEur > 4_000_000 ? 'Bonservis' : 'Bedelsiz',
      },
    ];

    const rumours = special?.rumours ?? (marketValM >= 6 && rand() < 0.45
      ? [
          {
            clubId: partnerClub.id,
            club: partnerClub.name,
            rumourDate: '2026-11-10',
            transferProbability: randInt(28, 65),
            source: 'beIN Sports TR',
          },
        ]
      : []);

    const birthYear = 2026 - age;
    const birthDate = special?.birthDate ?? `${birthYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(10, 28)).padStart(2, '0')}`;

    const secondaryMap = {
      GK: [],
      DF: positionMain === 'Stoper' ? ['Ön Libero'] : ['Kanat Bek'],
      MF: positionMain === 'On Numara' ? ['Sağ Kanat', 'Sol Kanat'] : ['On Numara', 'Ön Libero'],
      FW: positionMain === 'Santrafor' ? ['İkinci Forvet'] : ['Santrafor', 'On Numara'],
    };

    const playerObj = {
      id,
      name,
      fullName,
      shirtNumber,
      clubId: club.id,
      clubName: club.name,
      positionMain,
      positionGroup,
      positionSecondary: secondaryMap[positionGroup],
      foot,
      height,
      birthDate,
      age,
      citizenship,
      contractExpiry,
      currentMarketValueEur,
      peakMarketValueEur,
      injuryRisk,
      gamesPlayed,
      minutesPlayed,
      goals,
      assists,
      yellowCards: randInt(0, 4),
      redCards: rand() < 0.08 ? 1 : 0,
      xG,
      xA,
      avgMatchRating,
      per90Goals: round2(goals * per90Base),
      per90Assists: round2(assists * per90Base),
      passAccuracy: positionGroup === 'GK' ? round1(71 + rand() * 14) : round1(76 + rand() * 16),
      keyPassesPer90: positionGroup === 'GK' ? 0 : round2(0.5 + rand() * 2.4),
      progressiveActionsPer90: positionGroup === 'GK' ? round2(1.2 + rand() * 1.4) : round2(3.1 + rand() * 5.8),
      ...(positionGroup === 'GK'
        ? {
            cleanSheets: randInt(2, 7),
            savePercentage: round1(68 + rand() * 15),
            PSxG_plus_minus: psxgPM ?? round1(-0.5 + rand() * 4),
          }
        : {}),
      marketValueHistory,
      transfers,
      rumours,
      perClub: [
        {
          clubId: club.id,
          clubName: club.name,
          competition: 'Süper Lig',
          seasonRange: '2024–2026',
          games: gamesPlayed + randInt(15, 45),
          minutes: minutesPlayed + randInt(1200, 3600),
          goals: goals + randInt(0, Math.max(1, goals * 2)),
          assists: assists + randInt(0, Math.max(1, assists * 2)),
          avgRating: avgMatchRating,
        },
        ...(transfers.length > 0
          ? [
              {
                clubId: transfers[0].fromClubId,
                clubName: transfers[0].from,
                competition: partnerClub.leagueName || 'Avrupa Ligi',
                seasonRange: '2021–2024',
                games: randInt(28, 86),
                minutes: randInt(2100, 7200),
                goals: positionGroup === 'GK' ? 0 : randInt(2, 34),
                assists: positionGroup === 'GK' ? 0 : randInt(1, 18),
                avgRating: round2(avgMatchRating - 0.12),
              },
            ]
          : []),
      ],
      injuries: {
        anatomyRegions,
        systemicRecords,
      },
    };

    allPlayersList.push(playerObj);
    playerById.set(id, playerObj);

    squadMembers.push({
      playerId: id,
      name,
      shirtNumber,
      positionMain,
      positionGroup,
      age,
      citizenship,
      foot,
      contractExpiry,
      currentMarketValueEur,
      avgMatchRating,
      gamesPlayed,
      goals,
      assists,
      xG,
      injuryRisk,
      missedGamesTotal,
    });
  }

  const totalMarketValueEur = squadMembers.reduce((sum, p) => sum + p.currentMarketValueEur, 0);
  const averageAge = round1(squadMembers.reduce((sum, p) => sum + p.age, 0) / squadMembers.length);

  allClubsList.push({
    id: club.id,
    name: club.name,
    shortName: club.shortName,
    logo: club.logo,
    primaryColor: club.primaryColor,
    accentColor: club.accentColor,
    city: club.city,
    stadium: club.stadium,
    coach: club.coach,
    founded: club.founded,
    isSuperLig: true,
    leagueName: 'Trendyol Süper Lig',
    totalMarketValueEur,
    averageAge,
    playStyle: club.playStyle,
    goalsMinusXg: club.goalsMinusXg,
    finalThirdPassIntensity: club.finalThirdPassIntensity,
    xGFor: club.xGFor,
    xGAgainst: club.xGAgainst,
    possessionAvg: club.possessionAvg,
    ppda: club.ppda,
    squad: squadMembers.sort((a, b) => b.currentMarketValueEur - a.currentMarketValueEur),
    fixtures: [],
  });
}

// Add Partner Clubs so every transfer / rumour / career link resolves cleanly
for (const pc of PARTNER_CLUBS) {
  allClubsList.push({
    ...pc,
    isSuperLig: false,
    goalsMinusXg: round1(-1.5 + rand() * 5),
    finalThirdPassIntensity: round1(64 + rand() * 16),
    xGFor: round1(22 + rand() * 14),
    xGAgainst: round1(11 + rand() * 10),
    possessionAvg: round1(51 + rand() * 14),
    ppda: round1(7.5 + rand() * 4),
    squad: allPlayersList
      .filter((p) => p.perClub.some((c) => c.clubId === pc.id) || p.rumours.some((r) => r.clubId === pc.id))
      .slice(0, 8)
      .map((p) => ({
        playerId: p.id,
        name: p.name,
        shirtNumber: p.shirtNumber,
        positionMain: p.positionMain,
        positionGroup: p.positionGroup,
        age: p.age,
        citizenship: p.citizenship,
        foot: p.foot,
        contractExpiry: p.contractExpiry,
        currentMarketValueEur: p.currentMarketValueEur,
        avgMatchRating: p.avgMatchRating,
        gamesPlayed: p.gamesPlayed,
        goals: p.goals,
        assists: p.assists,
        xG: p.xG,
        injuryRisk: p.injuryRisk,
        missedGamesTotal: 0,
      })),
    fixtures: [],
  });
}

// Build 18 rich Matches covering all 18 Super Lig clubs (Round 11 + Round 12)
const MATCH_SCHEDULE = [
  // Round 12 (all 18 teams)
  { id: 'gs-fb-r12', round: 12, date: '2026-11-15', time: '20:00', home: 'galatasaray', away: 'fenerbahce', hs: 3, as: 1, ht: '2-0', forecast: '13°C · Parçalı Bulutlu', referee: 'Halil Umut Meler', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'bjk-ts-r12', round: 12, date: '2026-11-15', time: '17:00', home: 'besiktas', away: 'trabzonspor', hs: 2, as: 2, ht: '1-1', forecast: '12°C · Açık', referee: 'Atilla Karaoğlan', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'sam-eyp-r12', round: 12, date: '2026-11-14', time: '20:00', home: 'samsunspor', away: 'eyupspor', hs: 2, as: 1, ht: '1-0', forecast: '14°C · Rüzgarlı', referee: 'Cihan Aydın', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'goz-bfk-r12', round: 12, date: '2026-11-14', time: '16:00', home: 'goztepe', away: 'basaksehir', hs: 3, as: 2, ht: '2-1', forecast: '18°C · Güneşli', referee: 'Arda Kardeşler', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'kas-siv-r12', round: 12, date: '2026-11-14', time: '13:30', home: 'kasimpasa', away: 'sivasspor', hs: 1, as: 1, ht: '0-1', forecast: '13°C · Bulutlu', referee: 'Zorbay Küçük', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'kon-riz-r12', round: 12, date: '2026-11-13', time: '20:00', home: 'konyaspor', away: 'rizespor', hs: 2, as: 0, ht: '1-0', forecast: '9°C · Serin', referee: 'Kadir Sağlam', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'ant-gfk-r12', round: 12, date: '2026-11-13', time: '17:00', home: 'antalyaspor', away: 'gaziantep-fk', hs: 1, as: 2, ht: '1-1', forecast: '20°C · Açık', referee: 'Oğuzhan Çakır', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'ala-kay-r12', round: 12, date: '2026-11-13', time: '14:00', home: 'alanyaspor', away: 'kayserispor', hs: 2, as: 1, ht: '1-1', forecast: '21°C · Güneşli', referee: 'Turgut Doman', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'bod-hat-r12', round: 12, date: '2026-11-12', time: '20:00', home: 'bodrum-fk', away: 'hatayspor', hs: 1, as: 0, ht: '0-0', forecast: '17°C · Hafif Yağmurlu', referee: 'Mehmet Türkmen', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  // Round 11 (all 18 teams)
  { id: 'fb-bjk-r11', round: 11, date: '2026-11-08', time: '20:00', home: 'fenerbahce', away: 'besiktas', hs: 2, as: 0, ht: '1-0', forecast: '14°C · Açık', referee: 'Atilla Karaoğlan', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'ts-gs-r11', round: 11, date: '2026-11-08', time: '17:00', home: 'trabzonspor', away: 'galatasaray', hs: 1, as: 3, ht: '1-1', forecast: '12°C · Yağmurlu', referee: 'Halil Umut Meler', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'eyp-goz-r11', round: 11, date: '2026-11-07', time: '20:00', home: 'eyupspor', away: 'goztepe', hs: 2, as: 2, ht: '1-1', forecast: '15°C · Parçalı Bulutlu', referee: 'Cihan Aydın', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'bfk-sam-r11', round: 11, date: '2026-11-07', time: '17:00', home: 'basaksehir', away: 'samsunspor', hs: 1, as: 2, ht: '0-1', forecast: '15°C · Açık', referee: 'Zorbay Küçük', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'siv-kon-r11', round: 11, date: '2026-11-07', time: '13:30', home: 'sivasspor', away: 'konyaspor', hs: 2, as: 1, ht: '1-0', forecast: '8°C · Soğuk', referee: 'Kadir Sağlam', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'riz-kas-r11', round: 11, date: '2026-11-06', time: '20:00', home: 'rizespor', away: 'kasimpasa', hs: 3, as: 1, ht: '2-0', forecast: '13°C · Sağanak', referee: 'Arda Kardeşler', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'gfk-ala-r11', round: 11, date: '2026-11-06', time: '17:00', home: 'gaziantep-fk', away: 'alanyaspor', hs: 1, as: 0, ht: '0-0', forecast: '16°C · Açık', referee: 'Oğuzhan Çakır', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'kay-bod-r11', round: 11, date: '2026-11-06', time: '14:00', home: 'kayserispor', away: 'bodrum-fk', hs: 1, as: 1, ht: '1-0', forecast: '10°C · Parçalı Bulutlu', referee: 'Turgut Doman', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
  { id: 'hat-ant-r11', round: 11, date: '2026-11-05', time: '20:00', home: 'hatayspor', away: 'antalyaspor', hs: 1, as: 2, ht: '0-1', forecast: '21°C · Ilık', referee: 'Mehmet Türkmen', yt: 'https://www.youtube.com/embed/jfKfPfyJRdk' },
];

const STAT_BLUEPRINTS = [
  ['possession', 'Topla Oynama (%)', 'Genel & Topla Oynama', '%'],
  ['expected_goals', 'Gol Beklentisi (xG)', 'Hücum & xG', ''],
  ['xg_open_play', 'Akan Oyun xG', 'Hücum & xG', ''],
  ['xg_set_piece', 'Duran Top xG', 'Hücum & xG', ''],
  ['total_shots', 'Toplam Şut', 'Hücum & xG', ''],
  ['shots_on_target', 'İsabetli Şut', 'Hücum & xG', ''],
  ['shots_off_target', 'İsabetsiz Şut', 'Hücum & xG', ''],
  ['blocked_shots', 'Engellenen Şut', 'Hücum & xG', ''],
  ['big_chances', 'Net Gol Pozisyonu', 'Hücum & xG', ''],
  ['big_chances_missed', 'Kaçan Net Pozisyon', 'Hücum & xG', ''],
  ['shots_inside_box', 'Ceza Sahası İçi Şut', 'Hücum & xG', ''],
  ['shots_outside_box', 'Ceza Sahası Dışı Şut', 'Hücum & xG', ''],
  ['touches_in_box', 'Rakip Ceza Sahasında Topla Buluşma', 'Hücum & xG', ''],
  ['hit_woodwork', 'Direkten Dönen Top', 'Hücum & xG', ''],
  ['total_passes', 'Toplam Pas', 'Pas & Kurulum', ''],
  ['accurate_passes', 'İsabetli Pas', 'Pas & Kurulum', ''],
  ['pass_accuracy', 'Pas İsabeti (%)', 'Pas & Kurulum', '%'],
  ['final_third_passes', '3. Bölgeye İsabetli Pas', 'Pas & Kurulum', ''],
  ['final_third_entries', '3. Bölgeye Giriş', 'Pas & Kurulum', ''],
  ['progressive_passes', 'İleriye Doğru (Progressive) Pas', 'Pas & Kurulum', ''],
  ['key_passes', 'Kilit Pas', 'Pas & Kurulum', ''],
  ['long_balls', 'İsabetli Uzun Top', 'Pas & Kurulum', ''],
  ['crosses_accurate', 'İsabetli Orta', 'Pas & Kurulum', ''],
  ['through_balls', 'Ara Pas Denemesi', 'Pas & Kurulum', ''],
  ['dribbles_completed', 'Başarılı Çalım', 'Genel & Topla Oynama', ''],
  ['progressive_carries', 'İleri Top Taşıma', 'Genel & Topla Oynama', ''],
  ['duels_won', 'Kazanılan İkili Mücadele', 'Savunma & İkili Mücadele', ''],
  ['duels_won_pct', 'İkili Mücadele Başarısı (%)', 'Savunma & İkili Mücadele', '%'],
  ['aerial_duels_won', 'Kazanılan Hava Topu', 'Savunma & İkili Mücadele', ''],
  ['tackles', 'Top Çalma (Tackle)', 'Savunma & İkili Mücadele', ''],
  ['tackles_won', 'Başarılı Top Çalma', 'Savunma & İkili Mücadele', ''],
  ['interceptions', 'Pas Arası (Interception)', 'Savunma & İkili Mücadele', ''],
  ['clearances', 'Uzaklaştırma', 'Savunma & İkili Mücadele', ''],
  ['recoveries', 'Top Kazanma (Recovery)', 'Savunma & İkili Mücadele', ''],
  ['ppda', 'Baskı Şiddeti (PPDA)', 'Genel & Topla Oynama', ''],
  ['goalkeeper_saves', 'Kaleci Kurtarışı', 'Savunma & İkili Mücadele', ''],
  ['corners', 'Köşe Vuruşu', 'Disiplin & Duran Top', ''],
  ['offsides', 'Ofsayt', 'Disiplin & Duran Top', ''],
  ['fouls', 'Yapılan Faul', 'Disiplin & Duran Top', ''],
  ['yellow_cards', 'Sarı Kart', 'Disiplin & Duran Top', ''],
];

const GOAL_ZONES = ['High Left', 'High Center', 'High Right', 'Low Left', 'Low Center', 'Low Right', 'Close Left', 'Close Right', 'Close High'];

function buildLineupMatrix(clubId, scorerMap, assistMap, yellowSet) {
  const clubPlayers = allPlayersList.filter((p) => p.clubId === clubId).slice(0, 11);
  const gk = clubPlayers.filter((p) => p.positionGroup === 'GK').slice(0, 1);
  const df = clubPlayers.filter((p) => p.positionGroup === 'DF').slice(0, 4);
  const mf = clubPlayers.filter((p) => p.positionGroup === 'MF').slice(0, 4);
  const fw = clubPlayers.filter((p) => p.positionGroup === 'FW').slice(0, 2);

  // Fill to 4-2-3-1 or 4-3-3 layout cleanly
  const toNode = (p, ratingBoost = 0) => ({
    playerId: p.id,
    name: p.name,
    shirtNumber: p.shirtNumber,
    position: p.positionMain,
    matchRating: round2(Math.min(9.9, Math.max(5.8, p.avgMatchRating + ratingBoost + (rand() * 0.7 - 0.35)))),
    goals: scorerMap.get(p.id) || 0,
    assists: assistMap.get(p.id) || 0,
    yellowCard: yellowSet.has(p.id),
    redCard: false,
  });

  const rows = [];
  if (gk.length) rows.push(gk.map((p) => toNode(p)));
  if (df.length) rows.push(df.map((p) => toNode(p)));
  if (mf.length >= 4) {
    rows.push(mf.slice(0, 2).map((p) => toNode(p)));
    rows.push(mf.slice(2, 4).map((p) => toNode(p)));
  } else if (mf.length) {
    rows.push(mf.map((p) => toNode(p)));
  }
  if (fw.length) rows.push(fw.map((p) => toNode(p)));
  return rows;
}

const matchesList = [];

for (const m of MATCH_SCHEDULE) {
  const homeClub = clubMap.get(m.home);
  const awayClub = clubMap.get(m.away);
  const homePlayers = allPlayersList.filter((p) => p.clubId === m.home).slice(0, 11);
  const awayPlayers = allPlayersList.filter((p) => p.clubId === m.away).slice(0, 11);

  const scorerMap = new Map();
  const assistMap = new Map();
  const yellowSet = new Set();
  const events = [];
  const shots = [];

  const homeAttackers = homePlayers.filter((p) => p.positionGroup === 'FW' || p.positionGroup === 'MF');
  const awayAttackers = awayPlayers.filter((p) => p.positionGroup === 'FW' || p.positionGroup === 'MF');

  // Assign goals
  const goalMinutes = [];
  for (let i = 0; i < m.hs; i++) {
    const min = randInt(8, 89);
    goalMinutes.push({ min, side: 'home' });
  }
  for (let i = 0; i < m.as; i++) {
    const min = randInt(12, 90);
    goalMinutes.push({ min, side: 'away' });
  }
  goalMinutes.sort((a, b) => a.min - b.min);

  goalMinutes.forEach((gm, idx) => {
    const pool = gm.side === 'home' ? homeAttackers : awayAttackers;
    const club = gm.side === 'home' ? homeClub : awayClub;
    const scorer = pool[idx % pool.length];
    const assister = pool[(idx + 1) % pool.length];
    scorerMap.set(scorer.id, (scorerMap.get(scorer.id) || 0) + 1);
    assistMap.set(assister.id, (assistMap.get(assister.id) || 0) + 1);

    events.push({
      id: `${m.id}-ev-g-${idx}`,
      minute: gm.min,
      type: 'goal',
      clubId: club.id,
      playerId: scorer.id,
      playerName: scorer.name,
      assistPlayerId: assister.id,
      assistPlayerName: assister.name,
      detail: 'Akan Oyun Golü',
    });

    shots.push({
      id: `${m.id}-sh-g-${idx}`,
      minute: gm.min,
      clubId: club.id,
      playerId: scorer.id,
      playerName: scorer.name,
      xG: round2(0.18 + rand() * 0.45),
      psxG: round2(0.45 + rand() * 0.48),
      goalTarget: GOAL_ZONES[idx % 6],
      outcome: 'Goal',
      bodyPart: idx % 3 === 0 ? 'Kafa' : scorer.foot === 'Sol' ? 'Sol Ayak' : 'Sağ Ayak',
      distanceMeters: randInt(7, 19),
    });
  });

  // Add non-goal shots across all zones for rich GoalTargetMatrix visualization
  for (let s = 0; s < 14; s++) {
    const isHome = s % 2 === 0;
    const club = isHome ? homeClub : awayClub;
    const pool = isHome ? homeAttackers : awayAttackers;
    const shooter = pool[s % pool.length];
    const zone = GOAL_ZONES[s % GOAL_ZONES.length];
    const outcome = zone.startsWith('Close') ? 'Missed' : s % 4 === 0 ? 'Blocked' : 'Saved';
    shots.push({
      id: `${m.id}-sh-ng-${s}`,
      minute: randInt(4, 92),
      clubId: club.id,
      playerId: shooter.id,
      playerName: shooter.name,
      xG: round2(0.04 + rand() * 0.28),
      psxG: outcome === 'Saved' ? round2(0.14 + rand() * 0.38) : 0,
      goalTarget: zone,
      outcome,
      bodyPart: s % 4 === 0 ? 'Kafa' : 'Sağ Ayak',
      distanceMeters: randInt(9, 27),
    });
  }
  shots.sort((a, b) => a.minute - b.minute);

  // Add yellow cards
  for (let y = 0; y < 4; y++) {
    const isHome = y % 2 === 0;
    const pool = isHome ? homePlayers.slice(1, 8) : awayPlayers.slice(1, 8);
    const offender = pool[y % pool.length];
    yellowSet.add(offender.id);
    events.push({
      id: `${m.id}-ev-yc-${y}`,
      minute: randInt(19, 86),
      type: 'yellow_card',
      clubId: isHome ? homeClub.id : awayClub.id,
      playerId: offender.id,
      playerName: offender.name,
      detail: 'Sportmenliğe aykırı müdahale',
    });
  }
  events.sort((a, b) => a.minute - b.minute);

  const homeLineup = buildLineupMatrix(m.home, scorerMap, assistMap, yellowSet);
  const awayLineup = buildLineupMatrix(m.away, scorerMap, assistMap, yellowSet);

  // Special highlight rating 9.67 for Osimhen in gs-fb-r12
  if (m.id === 'gs-fb-r12') {
    for (const row of homeLineup) {
      for (const node of row) {
        if (node.playerId === 'osimhen') {
          node.matchRating = 9.67;
          node.goals = Math.max(2, node.goals);
        }
      }
    }
  }

  const boxScore = [];
  for (const [club, lineup] of [
    [homeClub, homeLineup],
    [awayClub, awayLineup],
  ]) {
    for (const row of lineup) {
      for (const node of row) {
        boxScore.push({
          playerId: node.playerId,
          playerName: node.name,
          clubId: club.id,
          clubName: club.name,
          position: node.position,
          minutesPlayed: randInt(72, 90),
          goals: node.goals,
          assists: node.assists,
          shots: node.goals + (node.position === 'Kaleci' ? 0 : randInt(0, 4)),
          xG: node.position === 'Kaleci' ? 0 : round2(node.goals * 0.45 + rand() * 0.35),
          xA: node.position === 'Kaleci' ? 0 : round2(node.assists * 0.38 + rand() * 0.25),
          keyPasses: node.position === 'Kaleci' ? 0 : randInt(0, 5),
          passAccuracy: round1(74 + rand() * 19),
          tacklesWon: randInt(0, 5),
          matchRating: node.matchRating,
        });
      }
    }
  }

  // Generate exactly 40 team stats
  const homePoss = Math.round(
    Math.min(68, Math.max(32, 50 + (homeClub.possessionAvg - awayClub.possessionAvg) * 0.6))
  );
  const awayPoss = 100 - homePoss;
  const homeXg = round2(Math.max(0.45, m.hs * 0.72 + 0.35 + rand() * 0.5));
  const awayXg = round2(Math.max(0.38, m.as * 0.68 + 0.32 + rand() * 0.45));

  const stats = STAT_BLUEPRINTS.map(([key, label, category, unit]) => {
    let hVal = 0;
    let aVal = 0;
    if (key === 'possession') {
      hVal = homePoss;
      aVal = awayPoss;
    } else if (key === 'expected_goals') {
      hVal = homeXg;
      aVal = awayXg;
    } else if (key === 'xg_open_play') {
      hVal = round2(homeXg * 0.76);
      aVal = round2(awayXg * 0.74);
    } else if (key === 'xg_set_piece') {
      hVal = round2(homeXg * 0.24);
      aVal = round2(awayXg * 0.26);
    } else if (key === 'total_passes') {
      hVal = Math.round(homePoss * 8.6);
      aVal = Math.round(awayPoss * 8.4);
    } else if (key === 'accurate_passes') {
      hVal = Math.round(homePoss * 7.2);
      aVal = Math.round(awayPoss * 6.9);
    } else if (key === 'pass_accuracy') {
      hVal = round1(78 + (homePoss - 50) * 0.35);
      aVal = round1(77 + (awayPoss - 50) * 0.35);
    } else if (key === 'duels_won_pct') {
      hVal = randInt(46, 56);
      aVal = 100 - hVal;
    } else if (key === 'ppda') {
      hVal = round1(homeClub.ppda);
      aVal = round1(awayClub.ppda);
    } else if (key === 'yellow_cards') {
      hVal = events.filter((e) => e.type === 'yellow_card' && e.clubId === homeClub.id).length;
      aVal = events.filter((e) => e.type === 'yellow_card' && e.clubId === awayClub.id).length;
    } else if (key === 'shots_on_target') {
      hVal = Math.max(m.hs + 1, randInt(3, 8));
      aVal = Math.max(m.as + 1, randInt(2, 7));
    } else if (key === 'total_shots') {
      hVal = Math.max(m.hs + 6, randInt(10, 19));
      aVal = Math.max(m.as + 5, randInt(8, 16));
    } else {
      const bias = homePoss >= 50 ? 1.15 : 0.88;
      hVal = randInt(1, 22);
      aVal = Math.max(0, Math.round(randInt(1, 20) / bias));
    }

    return {
      key,
      label,
      category,
      homeValue: unit === '%' ? `%${hVal}` : hVal,
      awayValue: unit === '%' ? `%${aVal}` : aVal,
      homeNumeric: Number(hVal),
      awayNumeric: Number(aVal),
      unit: unit || undefined,
    };
  });

  // Prematch Poisson vs API
  const strengthDiff = (homeClub.pts2026 - awayClub.pts2026) / 25;
  const pHome = Math.min(72, Math.max(18, Math.round(44 + strengthDiff * 28)));
  const pDraw = Math.round(27 - Math.abs(strengthDiff) * 5);
  const pAway = 100 - pHome - pDraw;

  const apiHome = Math.min(75, Math.max(16, pHome + randInt(-5, 4)));
  const apiDraw = Math.max(18, pDraw + randInt(-3, 3));
  const apiAway = 100 - apiHome - apiDraw;

  const actualOutcome = m.hs > m.as ? '1' : m.hs === m.as ? 'X' : '2';
  const poissonPick = pHome >= pAway && pHome >= pDraw ? '1' : pAway >= pHome && pAway >= pDraw ? '2' : 'X';
  const apiPick = apiHome >= apiAway && apiHome >= apiDraw ? '1' : apiAway >= apiHome && apiAway >= apiDraw ? '2' : 'X';

  const oVec = actualOutcome === '1' ? [1, 0, 0] : actualOutcome === 'X' ? [0, 1, 0] : [0, 0, 1];
  const pVec = [pHome / 100, pDraw / 100, pAway / 100];
  const aVec = [apiHome / 100, apiDraw / 100, apiAway / 100];
  const brier = (v) => round2(((v[0] - oVec[0]) ** 2 + (v[1] - oVec[1]) ** 2 + (v[2] - oVec[2]) ** 2) / 3);

  // Live win probability curve (0..90 min)
  const liveProbabilities = [];
  let curH = pHome;
  let curD = pDraw;
  let curA = pAway;
  for (let min = 0; min <= 90; min += 5) {
    const goalsAtStep = goalMinutes.filter((g) => g.min <= min && g.min > min - 5);
    let label;
    for (const g of goalsAtStep) {
      if (g.side === 'home') {
        curH = Math.min(95, curH + 22);
        curA = Math.max(2, curA - 14);
        curD = 100 - curH - curA;
        label = `${g.min}' ${homeClub.shortName} Gol`;
      } else {
        curA = Math.min(94, curA + 22);
        curH = Math.max(3, curH - 14);
        curD = 100 - curH - curA;
        label = `${g.min}' ${awayClub.shortName} Gol`;
      }
    }
    if (min === 90) {
      if (actualOutcome === '1') { curH = 100; curD = 0; curA = 0; }
      else if (actualOutcome === 'X') { curH = 0; curD = 100; curA = 0; }
      else { curH = 0; curD = 0; curA = 100; }
    }
    liveProbabilities.push({
      minute: min,
      homeWin: Math.max(0, Math.round(curH)),
      draw: Math.max(0, Math.round(curD)),
      awayWin: Math.max(0, Math.round(curA)),
      ...(label ? { eventLabel: label } : {}),
    });
  }

  matchesList.push({
    id: m.id,
    round: m.round,
    season: '2026/27',
    date: m.date,
    kickoffTime: m.time,
    venue: homeClub.stadium,
    attendance: randInt(14500, 49800),
    referee: m.referee,
    forecast: m.forecast,
    homeClubId: homeClub.id,
    homeClubName: homeClub.name,
    awayClubId: awayClub.id,
    awayClubName: awayClub.name,
    homeScore: m.hs,
    awayScore: m.as,
    halfTimeScore: m.ht,
    stats,
    initialLineup: {
      homeFormation: '4-2-3-1',
      awayFormation: '4-2-3-1',
      home: homeLineup,
      away: awayLineup,
    },
    boxScore,
    events,
    shots,
    prematch: {
      poisson: {
        homeWinProb: pHome,
        drawProb: pDraw,
        awayWinProb: pAway,
        expectedHomeGoals: round2(homeXg * 0.92),
        expectedAwayGoals: round2(awayXg * 0.92),
        mostLikelyScore: `${Math.max(1, Math.round(homeXg * 0.8))}-${Math.round(awayXg * 0.7)}`,
        over25Prob: Math.min(84, Math.max(38, Math.round((homeXg + awayXg) * 24))),
      },
      api: {
        homeWinProb: apiHome,
        drawProb: apiDraw,
        awayWinProb: apiAway,
        provider: 'Piyasa Konsensüsü (Odds API)',
      },
      actualOutcome,
      poissonCorrect: poissonPick === actualOutcome,
      apiCorrect: apiPick === actualOutcome,
      poissonBrierScore: brier(pVec),
      apiBrierScore: brier(aVec),
    },
    liveProbabilities,
    highlightEmbedUrl: m.yt,
    highlightImgUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
  });

  // Link fixtures into clubs.json
  const homeClubEntry = allClubsList.find((c) => c.id === homeClub.id);
  const awayClubEntry = allClubsList.find((c) => c.id === awayClub.id);
  homeClubEntry.fixtures.push({
    matchId: m.id,
    round: m.round,
    date: m.date,
    isHome: true,
    opponentClubId: awayClub.id,
    opponentName: awayClub.name,
    opponentShortName: awayClub.shortName,
    homeScore: m.hs,
    awayScore: m.as,
    result: m.hs > m.as ? 'W' : m.hs === m.as ? 'D' : 'L',
  });
  awayClubEntry.fixtures.push({
    matchId: m.id,
    round: m.round,
    date: m.date,
    isHome: false,
    opponentClubId: homeClub.id,
    opponentName: homeClub.name,
    opponentShortName: homeClub.shortName,
    homeScore: m.hs,
    awayScore: m.as,
    result: m.as > m.hs ? 'W' : m.as === m.hs ? 'D' : 'L',
  });
}

// Build Standings (18 Super Lig teams)
const standingsRows = SUPER_LIG_CLUBS.map((club, index) => {
  const rank = index + 1;
  const played = club.w + club.d + club.l;
  const homePlayed = Math.ceil(played / 2);
  const awayPlayed = played - homePlayed;

  const homeWon = Math.min(homePlayed, Math.ceil(club.w * 0.6));
  const homeDrawn = Math.min(homePlayed - homeWon, Math.ceil(club.d * 0.5));
  const homeLost = Math.max(0, homePlayed - homeWon - homeDrawn);
  const homeGF = Math.ceil(club.gf * 0.58);
  const homeGA = Math.floor(club.ga * 0.42);

  const awayWon = club.w - homeWon;
  const awayDrawn = club.d - homeDrawn;
  const awayLost = club.l - homeLost;
  const awayGF = club.gf - homeGF;
  const awayGA = club.ga - homeGA;

  // Build 5 recent matches using real matches in matchesList
  const clubFixtures = allClubsList
    .find((c) => c.id === club.id)
    .fixtures.sort((a, b) => b.round - a.round);

  const recentMatches = [];
  const form = [];
  for (let i = 0; i < 5; i++) {
    const fx = clubFixtures[i % clubFixtures.length];
    recentMatches.push({
      matchId: fx.matchId,
      result: fx.result,
      opponentClubId: fx.opponentClubId,
      opponentName: fx.opponentName,
      score: `${fx.homeScore}-${fx.awayScore}`,
      isHome: fx.isHome,
    });
    form.push(fx.result);
  }

  // 2023-2026 Season Trends
  const seasonTrends = ['2023', '2024', '2025', '2026'].map((season, sIdx) => {
    if (season === '2026') {
      return {
        season: '2026 (12H)',
        rank,
        points: club.pts2026,
        goalsFor: club.gf,
        goalsAgainst: club.ga,
        ppg: round2(club.pts2026 / played),
        xgDiff: club.goalsMinusXg,
      };
    }
    const basePts = Math.max(36, Math.min(99, Math.round(club.pts2026 * 2.85 + randInt(-8, 9) - sIdx * 1)));
    const seasonRank = Math.min(18, Math.max(1, rank + randInt(-3, 3)));
    const gfSeason = Math.max(32, Math.round(club.gf * 2.6 + randInt(-6, 8)));
    const gaSeason = Math.max(24, Math.round(club.ga * 2.7 + randInt(-5, 8)));
    return {
      season,
      rank: seasonRank,
      points: basePts,
      goalsFor: gfSeason,
      goalsAgainst: gaSeason,
      ppg: round2(basePts / 38),
      xgDiff: round1(club.goalsMinusXg * 1.6 + rand() * 3 - 1.5),
    };
  });

  return {
    rank,
    clubId: club.id,
    clubName: club.name,
    shortName: club.shortName,
    logo: club.logo,
    overall: {
      played,
      won: club.w,
      drawn: club.d,
      lost: club.l,
      goalsFor: club.gf,
      goalsAgainst: club.ga,
      goalDifference: club.gf - club.ga,
      points: club.pts2026,
    },
    home: {
      played: homePlayed,
      won: homeWon,
      drawn: homeDrawn,
      lost: homeLost,
      goalsFor: homeGF,
      goalsAgainst: homeGA,
      goalDifference: homeGF - homeGA,
      points: homeWon * 3 + homeDrawn,
    },
    away: {
      played: awayPlayed,
      won: awayWon,
      drawn: awayDrawn,
      lost: awayLost,
      goalsFor: awayGF,
      goalsAgainst: awayGA,
      goalDifference: awayGF - awayGA,
      points: awayWon * 3 + awayDrawn,
    },
    form,
    recentMatches,
    seasonTrends,
  };
});

const standingsPayload = {
  season: '2026/27',
  currentRound: 12,
  updatedAt: '2026-11-17T18:00:00Z',
  standings: standingsRows,
};

fs.writeFileSync(path.join(outDir, 'standings.json'), JSON.stringify(standingsPayload, null, 2));
fs.writeFileSync(path.join(outDir, 'clubs.json'), JSON.stringify(allClubsList, null, 2));
fs.writeFileSync(path.join(outDir, 'players.json'), JSON.stringify(allPlayersList, null, 2));
fs.writeFileSync(path.join(outDir, 'matches.json'), JSON.stringify(matchesList, null, 2));

console.log(
  `Generated Gold JSON: ${standingsRows.length} standings, ${allClubsList.length} clubs, ${allPlayersList.length} players, ${matchesList.length} matches.`
);
