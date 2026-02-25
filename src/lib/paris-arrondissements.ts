import { CityAggregate } from './types';

// ══════════════════════════════════════════════════════════════
// Paris — 20 Arrondissements SVG Map Data
// ══════════════════════════════════════════════════════════════
// Tracés géographiques précis des 20 arrondissements de Paris
// Source: Wikimedia Commons — Arrondissements de Paris SVG
// Spirale d'escargot : 1er au centre, 20e à l'est
// ViewBox: 0 0 1080 600

export interface ParisArrondissement {
  number: number;
  name: string;
  shortName: string;
  cityName: string;
  labelX: number;
  labelY: number;
  path: string;
}

export const PARIS_VIEWBOX = '0 0 1080 600';

// ────────────────────────────────────────────────────────────
// Tracés des 20 arrondissements — paths from Wikimedia SVG polygons
// ────────────────────────────────────────────────────────────

export const PARIS_ARRONDISSEMENTS: ParisArrondissement[] = [
  // ═══════════════ CENTRE (1er–4e) ═══════════════
  {
    number: 1,
    name: '1er arrondissement',
    shortName: '1er',
    cityName: 'Paris 1er',
    labelX: 461.09,
    labelY: 261.73,
    // Louvre, Tuileries, Palais-Royal, Les Halles
    path: 'M 505.115,313.364 L 454.536,278.482 L 402.386,253.716 L 423.932,211.272 L 433.044,209.167 L 532.284,251.963 L 529.003,261.104 Z',
  },
  {
    number: 2,
    name: '2e arrondissement',
    shortName: '2e',
    cityName: 'Paris 2e',
    labelX: 511.30,
    labelY: 233.36,
    // Bourse, Sentier — le plus petit
    path: 'M 532.284,251.963 L 433.044,209.167 L 519.229,204.135 L 546.394,213.024 Z',
  },
  {
    number: 3,
    name: '3e arrondissement',
    shortName: '3e',
    cityName: 'Paris 3e',
    labelX: 559.63,
    labelY: 256.27,
    // Temple, Arts et Métiers, Haut Marais
    path: 'M 608.182,301.896 L 529.003,261.104 L 532.284,251.963 L 546.394,213.024 L 588.487,225.119 Z',
  },
  {
    number: 4,
    name: '4e arrondissement',
    shortName: '4e',
    cityName: 'Paris 4e',
    labelX: 553.23,
    labelY: 316.17,
    // Marais, Notre-Dame, Ile de la Cite, Hotel de Ville
    path: 'M 590.491,364.725 L 505.115,313.364 L 529.003,261.104 L 608.182,301.896 L 610.787,318.398 Z',
  },

  // ═══════════════ RIVE GAUCHE INTERIEURE (5e–7e) ═══════════════
  {
    number: 5,
    name: '5e arrondissement',
    shortName: '5e',
    cityName: 'Paris 5e',
    labelX: 518.82,
    labelY: 380.69,
    // Quartier Latin, Pantheon, Jardin des Plantes
    path: 'M 597.564,372.988 L 535.419,426.001 L 494.253,416.36 L 470.689,407.22 L 505.115,313.364 L 590.491,364.725 Z',
  },
  {
    number: 6,
    name: '6e arrondissement',
    shortName: '6e',
    cityName: 'Paris 6e',
    labelX: 450.12,
    labelY: 354.38,
    // Saint-Germain-des-Pres, Luxembourg, Odeon
    path: 'M 470.689,407.22 L 419.146,382.103 L 384.464,360.843 L 439.231,320.953 L 454.536,278.482 L 505.115,313.364 Z',
  },
  {
    number: 7,
    name: '7e arrondissement',
    shortName: '7e',
    cityName: 'Paris 7e',
    labelX: 361.90,
    labelY: 302.80,
    // Tour Eiffel, Invalides, Champ de Mars, Musee d'Orsay
    path: 'M 384.464,360.843 L 344.319,354.658 L 268.465,286.245 L 319.326,251.087 L 402.386,253.716 L 454.536,278.482 L 439.231,320.953 Z',
  },

  // ═══════════════ RIVE DROITE INTERIEURE (8e–9e) ═══════════════
  {
    number: 8,
    name: '8e arrondissement',
    shortName: '8e',
    cityName: 'Paris 8e',
    labelX: 358.20,
    labelY: 202.93,
    // Champs-Elysees, Arc de Triomphe, Madeleine
    path: 'M 402.386,253.716 L 319.326,251.087 L 291.628,182.9 L 320.436,150.07 L 429.75,119.77 L 423.932,211.272 Z',
  },
  {
    number: 9,
    name: '9e arrondissement',
    shortName: '9e',
    cityName: 'Paris 9e',
    labelX: 466.50,
    labelY: 168.19,
    // Opera, Grands Boulevards, Pigalle
    path: 'M 423.932,211.272 L 429.75,119.77 L 526.655,118.843 L 519.229,204.135 L 433.044,209.167 Z',
  },

  // ═══════════════ RIVE DROITE (10e–12e) ═══════════════
  {
    number: 10,
    name: '10e arrondissement',
    shortName: '10e',
    cityName: 'Paris 10e',
    labelX: 561.76,
    labelY: 173.28,
    // Gare du Nord, Gare de l'Est, Canal Saint-Martin
    path: 'M 588.487,225.119 L 546.394,213.024 L 519.229,204.135 L 526.655,118.843 L 592.016,114.462 L 611.979,120.796 L 645.325,195.695 Z',
  },
  {
    number: 11,
    name: '11e arrondissement',
    shortName: '11e',
    cityName: 'Paris 11e',
    labelX: 632.94,
    labelY: 280.90,
    // Bastille, Oberkampf, Republique, Nation
    path: 'M 740.636,352.104 L 610.787,318.398 L 608.182,301.896 L 588.487,225.119 L 645.325,195.695 Z',
  },
  {
    number: 12,
    name: '12e arrondissement',
    shortName: '12e',
    cityName: 'Paris 12e',
    labelX: 694.61,
    labelY: 408.82,
    // Bercy, Gare de Lyon, Bois de Vincennes — le plus grand
    path: 'M 1009.25,547.352 L 903.156,546.549 L 873.741,514.472 L 830.983,509.714 L 758.878,475.833 L 701.734,499.122 L 597.564,372.988 L 590.491,364.725 L 610.787,318.398 L 740.636,352.104 L 813.651,361.695 L 803.63,423.421 L 816.113,440.099 L 844.156,387.337 L 863.52,394.875 L 951.377,373.639 L 1035.225,411.201 L 1028.729,495.265 Z',
  },

  // ═══════════════ RIVE GAUCHE EXTERIEURE (13e–15e) ═══════════════
  {
    number: 13,
    name: '13e arrondissement',
    shortName: '13e',
    cityName: 'Paris 13e',
    labelX: 561.44,
    labelY: 484.41,
    // Bibliotheque, Gobelins, Chinatown
    path: 'M 502.307,564.354 L 494.253,416.36 L 535.419,426.001 L 597.564,372.988 L 701.734,499.122 L 589.707,560.222 L 556.074,563.027 L 541.008,548.227 Z',
  },
  {
    number: 14,
    name: '14e arrondissement',
    shortName: '14e',
    cityName: 'Paris 14e',
    labelX: 419.71,
    labelY: 472.75,
    // Montparnasse, Denfert-Rochereau, Alesia
    path: 'M 502.307,564.354 L 450.46,556.116 L 373.728,521.458 L 318.308,502.827 L 419.146,382.103 L 470.689,407.22 L 494.253,416.36 Z',
  },
  {
    number: 15,
    name: '15e arrondissement',
    shortName: '15e',
    cityName: 'Paris 15e',
    labelX: 275.95,
    labelY: 400.61,
    // Grenelle, Convention, Vaugirard — le plus peuple
    path: 'M 318.308,502.827 L 266.802,481.693 L 229.902,462.11 L 191.322,478.187 L 172.697,443.28 L 151.877,445.082 L 268.465,286.245 L 344.319,354.658 L 384.464,360.843 L 419.146,382.103 Z',
  },

  // ═══════════════ RIVE DROITE EXTERIEURE (16e–20e) ═══════════════
  {
    number: 16,
    name: '16e arrondissement',
    shortName: '16e',
    cityName: 'Paris 16e',
    labelX: 143.33,
    labelY: 271.85,
    // Trocadero, Auteuil, Passy, Bois de Boulogne
    path: 'M 151.877,445.082 L 111.966,425.851 L 88.185,363.723 L -14.775,316.495 L -8.5,277.831 L 17.678,214.402 L 77.999,165.871 L 119.423,179.694 L 139.74,141.38 L 225.964,151.973 L 291.628,182.9 L 319.326,251.087 L 268.465,286.245 Z',
  },
  {
    number: 17,
    name: '17e arrondissement',
    shortName: '17e',
    cityName: 'Paris 17e',
    labelX: 332.34,
    labelY: 102.69,
    // Batignolles, Ternes, Epinettes
    path: 'M 291.628,182.9 L 225.964,151.973 L 245.456,105.622 L 328.921,49.729 L 398.51,8.336 L 442.141,3.703 L 429.75,119.77 L 320.436,150.07 Z',
  },
  {
    number: 18,
    name: '18e arrondissement',
    shortName: '18e',
    cityName: 'Paris 18e',
    labelX: 506.59,
    labelY: 69.72,
    // Montmartre, Sacre-Coeur, Goutte d'Or, Barbes
    path: 'M 429.75,119.77 L 442.141,3.703 L 536.71,1.324 L 597.114,0.774 L 616.266,0.498 L 620.528,40.039 L 592.016,114.462 L 526.655,118.843 Z',
  },
  {
    number: 19,
    name: '19e arrondissement',
    shortName: '19e',
    cityName: 'Paris 19e',
    labelX: 664.95,
    labelY: 112.33,
    // Buttes-Chaumont, La Villette, Parc de la Villette
    path: 'M 645.325,195.695 L 611.979,120.796 L 592.016,114.462 L 620.528,40.039 L 616.266,0.498 L 699.035,3.754 L 729.515,36.332 L 738.811,80.831 L 746.105,118.042 L 790.843,152.649 Z',
  },
  {
    number: 20,
    name: '20e arrondissement',
    shortName: '20e',
    cityName: 'Paris 20e',
    labelX: 736.27,
    labelY: 253.58,
    // Belleville, Menilmontant, Pere-Lachaise, Gambetta
    path: 'M 813.651,361.695 L 740.636,352.104 L 645.325,195.695 L 790.843,152.649 L 802.001,187.807 L 810.823,305.576 L 815.232,344.566 Z',
  },
];

// ────────────────────────────────────────────────────────────
// La Seine — courbe traversant Paris du SE au SW
// ────────────────────────────────────────────────────────────
// The Seine enters Paris from the SE (arr 12/13 border), flows west through
// arr 4/5, then 1/6, curves around arr 7/16, and exits SW (arr 15/16 border).
// This path follows the approximate boundaries between rive droite and rive gauche.
export const SEINE_PATH =
  'M 701.734,499.122' +
  ' C 670,460 630,410 597.564,372.988' +
  ' C 580,360 560,340 505.115,313.364' +
  ' L 454.536,278.482' +
  ' C 440,275 420,268 402.386,253.716' +
  ' L 319.326,251.087' +
  ' C 300,265 285,278 268.465,286.245' +
  ' C 230,320 190,370 151.877,445.082';

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

    // Extract number from city name like "Paris 4", "Paris 17e", "Paris 1er", etc.
    const parisMatch = normalized.match(/^paris\s+(\d{1,2})\s*(?:e|er|ème|eme|è|ème)?$/i);
    if (parisMatch) {
      const arrNum = parseInt(parisMatch[1], 10);
      if (arrNum >= 1 && arrNum <= 20) {
        const agg = arrMap.get(arrNum)!;
        agg.totalRestaurants += city.totalRestaurants;
        agg.totalOpportunities += city.opportunityCount;
        agg.types = [...new Set([...agg.types, ...city.types])];
        agg.hasData = true;
        if (city.avgRating > 0) {
          agg.avgRating = agg.avgRating > 0
            ? (agg.avgRating + city.avgRating) / 2
            : city.avgRating;
        }
        continue;
      }
    }

    // Also try exact match formats
    for (const arr of PARIS_ARRONDISSEMENTS) {
      const arrNorm = arr.cityName.toLowerCase();
      const numStr = String(arr.number);
      if (
        normalized === arrNorm ||
        normalized === `${numStr}e arrondissement` ||
        normalized === `${numStr}ème arrondissement` ||
        (arr.number === 1 && (
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
