import { CityAggregate } from './types';

// ══════════════════════════════════════════
// Paris — 20 Arrondissements SVG Map Data
// ══════════════════════════════════════════

export interface ParisArrondissement {
  number: number;
  name: string;
  shortName: string;
  cityName: string;        // Used for navigation & data matching
  labelX: number;
  labelY: number;
  path: string;            // SVG path data
}

// ViewBox for the Paris arrondissements map
export const PARIS_VIEWBOX = '0 0 500 420';

// Accurate SVG paths for all 20 arrondissements of Paris
// Based on real geographic boundaries — spirale d'escargot from center outward
// Coordinate system: viewBox 0 0 500 420
// Shared border points ensure no visual gaps between arrondissements

export const PARIS_ARRONDISSEMENTS: ParisArrondissement[] = [
  // ── Centre (1er - 4e) ──
  {
    number: 1,
    name: '1er arrondissement',
    shortName: '1er',
    cityName: 'Paris 1er',
    labelX: 220,
    labelY: 200,
    // Louvre / Les Halles / Palais-Royal — center-west
    path: 'M 205,175 L 220,170 L 240,172 L 252,180 L 255,195 L 250,210 L 238,218 L 220,215 L 205,210 L 198,195 Z',
  },
  {
    number: 2,
    name: '2e arrondissement',
    shortName: '2e',
    cityName: 'Paris 2e',
    labelX: 248,
    labelY: 168,
    // Bourse / Sentier — small, north of 1er
    path: 'M 240,172 L 232,158 L 242,150 L 258,150 L 268,158 L 260,170 L 252,180 Z',
  },
  {
    number: 3,
    name: '3e arrondissement',
    shortName: '3e',
    cityName: 'Paris 3e',
    labelX: 275,
    labelY: 172,
    // Haut Marais / Temple — northeast of center
    path: 'M 260,170 L 268,158 L 280,152 L 295,158 L 295,172 L 288,182 L 275,185 L 265,182 L 252,180 Z',
  },
  {
    number: 4,
    name: '4e arrondissement',
    shortName: '4e',
    cityName: 'Paris 4e',
    labelX: 272,
    labelY: 202,
    // Marais / Île de la Cité / Notre-Dame — east of 1er
    path: 'M 252,180 L 265,182 L 275,185 L 288,182 L 295,195 L 290,210 L 278,218 L 260,222 L 250,218 L 250,210 L 255,195 Z',
  },

  // ── Rive Gauche intérieure (5e - 7e) ──
  {
    number: 5,
    name: '5e arrondissement',
    shortName: '5e',
    cityName: 'Paris 5e',
    labelX: 268,
    labelY: 248,
    // Quartier Latin / Panthéon — south of 4e
    path: 'M 250,218 L 260,222 L 278,218 L 290,225 L 298,245 L 292,265 L 275,272 L 255,268 L 240,258 L 238,240 L 238,218 Z',
  },
  {
    number: 6,
    name: '6e arrondissement',
    shortName: '6e',
    cityName: 'Paris 6e',
    labelX: 218,
    labelY: 240,
    // Saint-Germain-des-Prés / Luxembourg
    path: 'M 205,210 L 220,215 L 238,218 L 238,240 L 240,258 L 225,265 L 205,260 L 190,248 L 188,230 L 192,218 Z',
  },
  {
    number: 7,
    name: '7e arrondissement',
    shortName: '7e',
    cityName: 'Paris 7e',
    labelX: 172,
    labelY: 222,
    // Tour Eiffel / Invalides — west, rive gauche
    path: 'M 130,195 L 152,182 L 175,178 L 192,182 L 198,195 L 205,210 L 192,218 L 188,230 L 190,248 L 175,255 L 155,248 L 138,232 L 128,215 Z',
  },

  // ── Rive Droite intérieure (8e - 9e) ──
  {
    number: 8,
    name: '8e arrondissement',
    shortName: '8e',
    cityName: 'Paris 8e',
    labelX: 170,
    labelY: 168,
    // Champs-Élysées / Madeleine — northwest
    path: 'M 130,155 L 158,142 L 182,140 L 200,148 L 205,162 L 205,175 L 198,195 L 192,182 L 175,178 L 152,182 L 130,195 L 122,175 Z',
  },
  {
    number: 9,
    name: '9e arrondissement',
    shortName: '9e',
    cityName: 'Paris 9e',
    labelX: 228,
    labelY: 148,
    // Opéra / Grands Boulevards
    path: 'M 205,162 L 200,148 L 210,138 L 232,132 L 248,138 L 242,150 L 232,158 L 240,172 L 220,170 L 205,175 Z',
  },

  // ── Rive Droite (10e - 12e) ──
  {
    number: 10,
    name: '10e arrondissement',
    shortName: '10e',
    cityName: 'Paris 10e',
    labelX: 278,
    labelY: 138,
    // Gare du Nord / Canal Saint-Martin
    path: 'M 248,138 L 258,128 L 278,118 L 300,120 L 312,132 L 308,148 L 295,158 L 280,152 L 268,158 L 258,150 L 242,150 Z',
  },
  {
    number: 11,
    name: '11e arrondissement',
    shortName: '11e',
    cityName: 'Paris 11e',
    labelX: 318,
    labelY: 188,
    // Bastille / Oberkampf / République
    path: 'M 295,158 L 308,148 L 325,152 L 342,162 L 348,180 L 342,200 L 328,210 L 310,215 L 295,210 L 295,195 L 288,182 L 295,172 Z',
  },
  {
    number: 12,
    name: '12e arrondissement',
    shortName: '12e',
    cityName: 'Paris 12e',
    labelX: 350,
    labelY: 255,
    // Bercy / Bois de Vincennes — large, southeast
    path: 'M 295,210 L 310,215 L 328,210 L 342,200 L 358,210 L 378,225 L 395,255 L 388,290 L 368,315 L 340,322 L 315,310 L 298,290 L 292,265 L 298,245 L 290,225 L 290,210 Z',
  },

  // ── Rive Gauche extérieure (13e - 15e) ──
  {
    number: 13,
    name: '13e arrondissement',
    shortName: '13e',
    cityName: 'Paris 13e',
    labelX: 275,
    labelY: 310,
    // Bibliothèque / Gobelins / Chinatown
    path: 'M 240,258 L 255,268 L 275,272 L 292,265 L 298,290 L 315,310 L 310,330 L 288,342 L 260,340 L 235,325 L 222,305 L 225,280 L 225,265 Z',
  },
  {
    number: 14,
    name: '14e arrondissement',
    shortName: '14e',
    cityName: 'Paris 14e',
    labelX: 205,
    labelY: 308,
    // Montparnasse / Denfert — south-center
    path: 'M 205,260 L 225,265 L 225,280 L 222,305 L 235,325 L 225,342 L 202,348 L 175,340 L 155,322 L 152,300 L 158,278 L 175,255 L 190,248 Z',
  },
  {
    number: 15,
    name: '15e arrondissement',
    shortName: '15e',
    cityName: 'Paris 15e',
    labelX: 140,
    labelY: 282,
    // Grenelle / Convention — large, southwest
    path: 'M 130,195 L 128,215 L 138,232 L 155,248 L 175,255 L 158,278 L 152,300 L 155,322 L 140,330 L 115,320 L 92,295 L 85,265 L 88,235 L 98,215 L 112,200 Z',
  },

  // ── Rive Droite extérieure (16e - 20e) ──
  {
    number: 16,
    name: '16e arrondissement',
    shortName: '16e',
    cityName: 'Paris 16e',
    labelX: 88,
    labelY: 185,
    // Trocadéro / Auteuil / Passy — large, west
    path: 'M 60,125 L 90,108 L 115,110 L 130,125 L 130,155 L 122,175 L 130,195 L 112,200 L 98,215 L 88,235 L 85,265 L 68,252 L 48,225 L 38,195 L 40,160 L 48,138 Z',
  },
  {
    number: 17,
    name: '17e arrondissement',
    shortName: '17e',
    cityName: 'Paris 17e',
    labelX: 168,
    labelY: 105,
    // Batignolles / Ternes / Épinettes — north-northwest
    path: 'M 115,110 L 130,98 L 155,82 L 185,75 L 215,78 L 232,88 L 232,108 L 232,132 L 210,138 L 200,148 L 182,140 L 158,142 L 130,155 L 130,125 Z',
  },
  {
    number: 18,
    name: '18e arrondissement',
    shortName: '18e',
    cityName: 'Paris 18e',
    labelX: 265,
    labelY: 95,
    // Montmartre / Goutte d'Or / Clignancourt — north
    path: 'M 232,108 L 232,88 L 248,78 L 272,72 L 300,75 L 320,85 L 330,100 L 322,115 L 312,132 L 300,120 L 278,118 L 258,128 L 248,138 L 232,132 Z',
  },
  {
    number: 19,
    name: '19e arrondissement',
    shortName: '19e',
    cityName: 'Paris 19e',
    labelX: 355,
    labelY: 115,
    // Buttes-Chaumont / Villette / Stalingrad — northeast
    path: 'M 330,100 L 345,92 L 368,90 L 390,100 L 400,118 L 395,140 L 380,158 L 360,168 L 342,162 L 325,152 L 308,148 L 312,132 L 322,115 Z',
  },
  {
    number: 20,
    name: '20e arrondissement',
    shortName: '20e',
    cityName: 'Paris 20e',
    labelX: 378,
    labelY: 195,
    // Belleville / Ménilmontant / Père-Lachaise — east
    path: 'M 342,162 L 360,168 L 380,158 L 395,140 L 408,155 L 415,178 L 412,205 L 398,228 L 378,225 L 358,210 L 342,200 L 348,180 Z',
  },
];

// Seine river path (decorative overlay)
export const SEINE_PATH = 'M 38,195 C 65,195 88,200 112,200 C 128,198 130,195 152,182 C 168,175 175,178 192,182 L 198,195 L 205,210 L 220,215 L 238,218 L 250,218 L 250,210 L 255,195 L 260,222 L 278,218 L 290,225 L 298,245 L 310,215 L 328,210 L 342,200 L 358,210 L 378,225 L 395,255';

// ══════════════════════════════════════════
// Arrondissement name helper
// ══════════════════════════════════════════

export function getArrondissementLabel(n: number): string {
  return n === 1 ? '1er' : `${n}e`;
}

// ══════════════════════════════════════════
// Aggregation by Arrondissement
// ══════════════════════════════════════════

export interface ArrondissementAggregate {
  number: number;
  name: string;
  shortName: string;
  cityName: string;
  totalRestaurants: number;
  totalOpportunities: number;
  types: string[];
  avgRating: number;
  hasData: boolean;
}

export function aggregateByArrondissements(
  cityAggregates: CityAggregate[]
): Map<number, ArrondissementAggregate> {
  const arrMap = new Map<number, ArrondissementAggregate>();

  // Initialize all 20 arrondissements
  for (const arr of PARIS_ARRONDISSEMENTS) {
    arrMap.set(arr.number, {
      number: arr.number,
      name: arr.name,
      shortName: arr.shortName,
      cityName: arr.cityName,
      totalRestaurants: 0,
      totalOpportunities: 0,
      types: [],
      avgRating: 0,
      hasData: false,
    });
  }

  // Match city aggregates to arrondissements
  for (const city of cityAggregates) {
    const normalized = city.city.trim().toLowerCase();

    for (const arr of PARIS_ARRONDISSEMENTS) {
      const arrNorm = arr.cityName.toLowerCase();
      // Exact match or common variants
      if (
        normalized === arrNorm ||
        normalized === `paris ${arr.number}` ||
        normalized === `paris ${arr.shortName.toLowerCase()}` ||
        normalized === `${arr.number}e arrondissement` ||
        normalized === `${arr.number}ème arrondissement` ||
        (arr.number === 1 && (normalized === 'paris 1' || normalized === 'paris 1er' || normalized === '1er arrondissement'))
      ) {
        const agg = arrMap.get(arr.number)!;
        agg.totalRestaurants += city.totalRestaurants;
        agg.totalOpportunities += city.opportunityCount;
        agg.types = [...new Set([...agg.types, ...city.types])];
        agg.hasData = true;
        if (city.avgRating > 0) {
          agg.avgRating = agg.avgRating > 0
            ? (agg.avgRating + city.avgRating) / 2
            : city.avgRating;
        }
        break;
      }
    }
  }

  return arrMap;
}
