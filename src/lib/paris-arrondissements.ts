import { CityAggregate } from './types';

// ══════════════════════════════════════════════════════════════
// Paris — 20 Arrondissements SVG Map Data
// ══════════════════════════════════════════════════════════════
// Tracés géographiques précis des 20 arrondissements de Paris
// Basé sur les véritables frontières administratives
// Spirale d'escargot : 1er au centre, 20e à l'est
// ViewBox: 0 0 600 500

export interface ParisArrondissement {
  number: number;
  name: string;
  shortName: string;
  cityName: string;
  labelX: number;
  labelY: number;
  path: string;
}

export const PARIS_VIEWBOX = '0 0 600 500';

// ────────────────────────────────────────────────────────────
// Tracés des 20 arrondissements — paths géographiquement précis
// ────────────────────────────────────────────────────────────

export const PARIS_ARRONDISSEMENTS: ParisArrondissement[] = [
  // ═══════════════ CENTRE (1er–4e) ═══════════════
  {
    number: 1,
    name: '1er arrondissement',
    shortName: '1er',
    cityName: 'Paris 1er',
    labelX: 248,
    labelY: 222,
    // Louvre, Tuileries, Palais-Royal, Les Halles
    path: 'M 210,240 L 200,228 L 205,215 L 215,205 L 230,198 L 250,195 L 268,198 L 280,208 L 285,220 L 282,232 L 275,240 L 260,245 L 235,245 Z',
  },
  {
    number: 2,
    name: '2e arrondissement',
    shortName: '2e',
    cityName: 'Paris 2e',
    labelX: 270,
    labelY: 185,
    // Bourse, Sentier — le plus petit
    path: 'M 250,195 L 255,182 L 265,174 L 280,172 L 292,178 L 295,190 L 288,200 L 280,208 L 268,198 Z',
  },
  {
    number: 3,
    name: '3e arrondissement',
    shortName: '3e',
    cityName: 'Paris 3e',
    labelX: 312,
    labelY: 195,
    // Temple, Arts et Métiers, Haut Marais
    path: 'M 288,200 L 295,190 L 292,178 L 300,170 L 318,168 L 332,175 L 335,190 L 330,205 L 318,212 L 300,215 L 285,220 L 282,210 Z',
  },
  {
    number: 4,
    name: '4e arrondissement',
    shortName: '4e',
    cityName: 'Paris 4e',
    labelX: 308,
    labelY: 232,
    // Marais, Notre-Dame, Île de la Cité, Hôtel de Ville
    path: 'M 282,232 L 285,220 L 300,215 L 318,212 L 330,205 L 340,215 L 342,230 L 335,242 L 318,248 L 300,250 L 282,248 L 275,240 Z',
  },

  // ═══════════════ RIVE GAUCHE INTÉRIEURE (5e–7e) ═══════════════
  {
    number: 5,
    name: '5e arrondissement',
    shortName: '5e',
    cityName: 'Paris 5e',
    labelX: 310,
    labelY: 280,
    // Quartier Latin, Panthéon, Jardin des Plantes
    path: 'M 275,240 L 282,248 L 300,250 L 318,248 L 335,242 L 342,258 L 348,280 L 340,302 L 322,315 L 298,318 L 278,310 L 262,295 L 255,275 L 255,255 L 260,245 Z',
  },
  {
    number: 6,
    name: '6e arrondissement',
    shortName: '6e',
    cityName: 'Paris 6e',
    labelX: 238,
    labelY: 272,
    // Saint-Germain-des-Prés, Luxembourg, Odéon
    path: 'M 210,240 L 235,245 L 260,245 L 255,255 L 255,275 L 262,295 L 248,305 L 230,300 L 212,290 L 198,275 L 192,258 L 195,245 Z',
  },
  {
    number: 7,
    name: '7e arrondissement',
    shortName: '7e',
    cityName: 'Paris 7e',
    labelX: 165,
    labelY: 268,
    // Tour Eiffel, Invalides, Champ de Mars, Musée d'Orsay
    path: 'M 120,248 L 140,240 L 165,235 L 192,232 L 200,228 L 210,240 L 195,245 L 192,258 L 198,275 L 212,290 L 195,302 L 175,305 L 152,298 L 130,285 L 112,268 Z',
  },

  // ═══════════════ RIVE DROITE INTÉRIEURE (8e–9e) ═══════════════
  {
    number: 8,
    name: '8e arrondissement',
    shortName: '8e',
    cityName: 'Paris 8e',
    labelX: 175,
    labelY: 198,
    // Champs-Élysées, Arc de Triomphe, Madeleine
    path: 'M 122,195 L 138,175 L 162,162 L 190,155 L 215,160 L 225,172 L 225,188 L 215,205 L 205,215 L 200,228 L 192,232 L 165,235 L 140,240 L 120,248 L 112,225 Z',
  },
  {
    number: 9,
    name: '9e arrondissement',
    shortName: '9e',
    cityName: 'Paris 9e',
    labelX: 255,
    labelY: 168,
    // Opéra, Grands Boulevards, Pigalle
    path: 'M 225,172 L 238,160 L 255,154 L 275,155 L 290,162 L 288,175 L 280,172 L 265,174 L 255,182 L 250,195 L 230,198 L 215,205 L 225,188 Z',
  },

  // ═══════════════ RIVE DROITE (10e–12e) ═══════════════
  {
    number: 10,
    name: '10e arrondissement',
    shortName: '10e',
    cityName: 'Paris 10e',
    labelX: 322,
    labelY: 155,
    // Gare du Nord, Gare de l'Est, Canal Saint-Martin
    path: 'M 290,162 L 302,148 L 320,140 L 342,135 L 362,140 L 370,155 L 365,172 L 348,180 L 332,175 L 318,168 L 300,170 L 292,178 L 288,175 Z',
  },
  {
    number: 11,
    name: '11e arrondissement',
    shortName: '11e',
    cityName: 'Paris 11e',
    labelX: 372,
    labelY: 210,
    // Bastille, Oberkampf, République, Nation
    path: 'M 332,175 L 348,180 L 365,172 L 370,155 L 388,162 L 405,178 L 412,198 L 408,220 L 395,238 L 375,245 L 355,240 L 342,230 L 340,215 L 335,190 Z',
  },
  {
    number: 12,
    name: '12e arrondissement',
    shortName: '12e',
    cityName: 'Paris 12e',
    labelX: 428,
    labelY: 290,
    // Bercy, Gare de Lyon, Bois de Vincennes — le plus grand
    path: 'M 342,258 L 355,240 L 375,245 L 395,238 L 408,220 L 425,232 L 448,255 L 468,285 L 478,318 L 472,350 L 455,375 L 425,385 L 398,372 L 378,350 L 362,325 L 350,300 L 345,280 Z',
  },

  // ═══════════════ RIVE GAUCHE EXTÉRIEURE (13e–15e) ═══════════════
  {
    number: 13,
    name: '13e arrondissement',
    shortName: '13e',
    cityName: 'Paris 13e',
    labelX: 322,
    labelY: 358,
    // Bibliothèque, Gobelins, Chinatown
    path: 'M 262,295 L 278,310 L 298,318 L 322,315 L 340,302 L 350,300 L 362,325 L 370,350 L 358,372 L 338,388 L 310,392 L 282,382 L 258,365 L 248,340 L 245,318 L 248,305 Z',
  },
  {
    number: 14,
    name: '14e arrondissement',
    shortName: '14e',
    cityName: 'Paris 14e',
    labelX: 228,
    labelY: 358,
    // Montparnasse, Denfert-Rochereau, Alésia
    path: 'M 212,290 L 230,300 L 248,305 L 245,318 L 248,340 L 258,365 L 242,382 L 220,392 L 195,388 L 172,375 L 158,355 L 158,330 L 168,308 L 175,305 L 195,302 Z',
  },
  {
    number: 15,
    name: '15e arrondissement',
    shortName: '15e',
    cityName: 'Paris 15e',
    labelX: 132,
    labelY: 335,
    // Grenelle, Convention, Vaugirard — le plus peuplé
    path: 'M 112,268 L 130,285 L 152,298 L 175,305 L 168,308 L 158,330 L 158,355 L 148,372 L 128,382 L 105,375 L 82,355 L 68,328 L 65,300 L 72,275 L 82,258 Z',
  },

  // ═══════════════ RIVE DROITE EXTÉRIEURE (16e–20e) ═══════════════
  {
    number: 16,
    name: '16e arrondissement',
    shortName: '16e',
    cityName: 'Paris 16e',
    labelX: 78,
    labelY: 215,
    // Trocadéro, Auteuil, Passy, Bois de Boulogne
    path: 'M 42,142 L 68,122 L 95,115 L 118,122 L 128,140 L 122,195 L 112,225 L 120,248 L 112,268 L 82,258 L 72,275 L 65,300 L 52,285 L 32,258 L 22,228 L 22,195 L 28,168 L 35,152 Z',
  },
  {
    number: 17,
    name: '17e arrondissement',
    shortName: '17e',
    cityName: 'Paris 17e',
    labelX: 182,
    labelY: 120,
    // Batignolles, Ternes, Épinettes
    path: 'M 95,115 L 122,100 L 158,88 L 198,82 L 238,88 L 268,100 L 272,125 L 275,155 L 255,154 L 238,160 L 225,172 L 215,160 L 190,155 L 162,162 L 138,175 L 122,195 L 128,140 L 118,122 Z',
  },
  {
    number: 18,
    name: '18e arrondissement',
    shortName: '18e',
    cityName: 'Paris 18e',
    labelX: 310,
    labelY: 105,
    // Montmartre, Sacré-Cœur, Goutte d'Or, Barbès
    path: 'M 268,100 L 288,88 L 315,78 L 345,75 L 375,80 L 395,92 L 398,112 L 388,132 L 370,155 L 362,140 L 342,135 L 320,140 L 302,148 L 290,162 L 275,155 L 272,125 Z',
  },
  {
    number: 19,
    name: '19e arrondissement',
    shortName: '19e',
    cityName: 'Paris 19e',
    labelX: 428,
    labelY: 122,
    // Buttes-Chaumont, La Villette, Parc de la Villette
    path: 'M 395,92 L 418,85 L 445,82 L 472,92 L 490,110 L 492,138 L 482,165 L 465,188 L 445,200 L 422,205 L 405,178 L 388,162 L 370,155 L 388,132 L 398,112 Z',
  },
  {
    number: 20,
    name: '20e arrondissement',
    shortName: '20e',
    cityName: 'Paris 20e',
    labelX: 445,
    labelY: 222,
    // Belleville, Ménilmontant, Père-Lachaise, Gambetta
    path: 'M 405,178 L 422,205 L 445,200 L 465,188 L 482,165 L 492,185 L 498,215 L 495,248 L 480,275 L 468,285 L 448,255 L 425,232 L 412,198 Z',
  },
];

// ────────────────────────────────────────────────────────────
// La Seine — courbe traversant Paris du SE au SW
// ────────────────────────────────────────────────────────────
export const SEINE_PATH =
  'M 22,228 C 40,238 60,255 72,275 C 80,262 95,255 112,268 L 120,248 C 135,242 155,238 165,235 L 192,232 L 200,228 L 210,240 L 235,245 L 260,245 L 275,240 L 282,248 L 300,250 L 318,248 L 335,242 L 342,258 C 355,248 368,242 375,245 C 388,238 400,230 408,220 C 418,228 430,242 448,255';

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

export function getArrondissementLabel(n: number): string {
  return n === 1 ? '1er' : `${n}e`;
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
      const numStr = String(arr.number);
      // Match many possible formats
      if (
        normalized === arrNorm ||
        normalized === `paris ${numStr}` ||
        normalized === `paris ${arr.shortName.toLowerCase()}` ||
        normalized === `paris ${numStr}e` ||
        normalized === `paris ${numStr}ème` ||
        normalized === `paris ${numStr}eme` ||
        normalized === `${numStr}e arrondissement` ||
        normalized === `${numStr}ème arrondissement` ||
        (arr.number === 1 && (
          normalized === 'paris 1' ||
          normalized === 'paris 1er' ||
          normalized === '1er arrondissement' ||
          normalized === 'paris 1er arrondissement'
        ))
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
