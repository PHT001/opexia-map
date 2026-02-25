import { CityAggregate } from './types';

// ══════════════════════════════════════════
// Paris — 20 Arrondissements SVG Map Data
// ══════════════════════════════════════════
// Géographie précise basée sur les vraies frontières de Paris
// Spirale d'escargot du 1er (centre) vers le 20e (est)
// ViewBox: 0 0 500 450 — proportions réalistes de Paris (plus large que haut)
// La Seine traverse Paris du SE vers le SW

export interface ParisArrondissement {
  number: number;
  name: string;
  shortName: string;
  cityName: string;
  labelX: number;
  labelY: number;
  path: string;
}

export const PARIS_VIEWBOX = '0 0 500 450';

// ────────────────────────────────────────────────────────
// Key shared border points (referenced by multiple arrondissements)
// ────────────────────────────────────────────────────────
// Points on the Seine (rive droite / rive gauche divider):
//   West entry:  ~(52,215)  ──  Pont de Garigliano (16e/15e)
//   Trocadéro:   ~(102,208) ──  Pont d'Iéna (16e/7e)
//   Concorde:    ~(150,195) ──  Pont de la Concorde (8e/7e)
//   Louvre:      ~(195,200) ──  Pont Royal (1er/7e)
//   Châtelet:    ~(228,200) ──  Pont Neuf (1er/6e)
//   Notre-Dame:  ~(255,205) ──  (4e/5e)
//   Austerlitz:  ~(280,215) ──  Pont d'Austerlitz (12e/5e)
//   Bercy:       ~(320,230) ──  Pont de Bercy (12e/13e)
//   East exit:   ~(370,260) ──  Quai d'Ivry (12e/13e)

export const PARIS_ARRONDISSEMENTS: ParisArrondissement[] = [
  // ═══════════════════════════════════
  // CENTRE — 1er à 4e (petite couronne)
  // ═══════════════════════════════════
  {
    number: 1,
    name: '1er arrondissement',
    shortName: '1er',
    cityName: 'Paris 1er',
    labelX: 200,
    labelY: 185,
    // Louvre, Les Halles, Palais-Royal, Tuileries
    // Borné par: Seine au sud, 2e au nord-est, 3e/4e à l'est, 8e/9e au nord-ouest
    path: 'M 170,195 L 175,180 L 185,170 L 200,165 L 215,165 L 228,170 L 232,180 L 230,192 L 228,200 L 195,200 Z',
  },
  {
    number: 2,
    name: '2e arrondissement',
    shortName: '2e',
    cityName: 'Paris 2e',
    labelX: 222,
    labelY: 155,
    // Bourse, Sentier — le plus petit arrondissement
    path: 'M 200,165 L 205,155 L 215,148 L 230,148 L 240,155 L 238,165 L 228,170 L 215,165 Z',
  },
  {
    number: 3,
    name: '3e arrondissement',
    shortName: '3e',
    cityName: 'Paris 3e',
    labelX: 255,
    labelY: 162,
    // Haut Marais, Temple, Arts et Métiers
    path: 'M 228,170 L 238,165 L 240,155 L 252,148 L 268,150 L 275,160 L 270,172 L 258,178 L 245,180 L 232,180 Z',
  },
  {
    number: 4,
    name: '4e arrondissement',
    shortName: '4e',
    cityName: 'Paris 4e',
    labelX: 252,
    labelY: 192,
    // Marais, Île de la Cité, Île Saint-Louis, Notre-Dame, Hôtel de Ville
    path: 'M 232,180 L 245,180 L 258,178 L 270,172 L 278,180 L 280,192 L 275,202 L 255,205 L 238,202 L 228,200 L 230,192 Z',
  },

  // ═══════════════════════════════════
  // RIVE GAUCHE INTÉRIEURE — 5e à 7e
  // ═══════════════════════════════════
  {
    number: 5,
    name: '5e arrondissement',
    shortName: '5e',
    cityName: 'Paris 5e',
    labelX: 258,
    labelY: 232,
    // Quartier Latin, Panthéon, Jardin des Plantes, Jussieu
    path: 'M 228,200 L 238,202 L 255,205 L 275,202 L 280,215 L 285,235 L 278,252 L 260,258 L 240,255 L 225,245 L 218,228 L 218,210 Z',
  },
  {
    number: 6,
    name: '6e arrondissement',
    shortName: '6e',
    cityName: 'Paris 6e',
    labelX: 195,
    labelY: 225,
    // Saint-Germain-des-Prés, Luxembourg, Odéon, Saint-Sulpice
    path: 'M 170,195 L 195,200 L 228,200 L 218,210 L 218,228 L 225,245 L 212,252 L 195,248 L 178,238 L 168,222 L 162,210 Z',
  },
  {
    number: 7,
    name: '7e arrondissement',
    shortName: '7e',
    cityName: 'Paris 7e',
    labelX: 130,
    labelY: 220,
    // Tour Eiffel, Invalides, Champ de Mars, Musée d'Orsay
    path: 'M 102,208 L 120,200 L 150,195 L 170,195 L 162,210 L 168,222 L 178,238 L 165,250 L 148,252 L 125,245 L 105,232 L 92,220 Z',
  },

  // ═══════════════════════════════════
  // RIVE DROITE INTÉRIEURE — 8e, 9e
  // ═══════════════════════════════════
  {
    number: 8,
    name: '8e arrondissement',
    shortName: '8e',
    cityName: 'Paris 8e',
    labelX: 142,
    labelY: 168,
    // Champs-Élysées, Arc de Triomphe, Madeleine, Parc Monceau
    path: 'M 102,165 L 118,148 L 142,138 L 165,135 L 182,140 L 185,155 L 185,170 L 175,180 L 170,195 L 150,195 L 120,200 L 102,208 L 95,190 Z',
  },
  {
    number: 9,
    name: '9e arrondissement',
    shortName: '9e',
    cityName: 'Paris 9e',
    labelX: 205,
    labelY: 142,
    // Opéra, Grands Boulevards, Pigalle, Folies Bergère
    path: 'M 182,140 L 192,132 L 208,128 L 225,130 L 235,138 L 230,148 L 215,148 L 205,155 L 200,165 L 185,170 L 185,155 Z',
  },

  // ═══════════════════════════════════
  // RIVE DROITE — 10e à 12e
  // ═══════════════════════════════════
  {
    number: 10,
    name: '10e arrondissement',
    shortName: '10e',
    cityName: 'Paris 10e',
    labelX: 262,
    labelY: 130,
    // Gare du Nord, Gare de l'Est, Canal Saint-Martin, République
    path: 'M 235,138 L 245,125 L 262,118 L 282,115 L 298,120 L 302,135 L 295,148 L 280,155 L 268,150 L 252,148 L 240,155 L 230,148 Z',
  },
  {
    number: 11,
    name: '11e arrondissement',
    shortName: '11e',
    cityName: 'Paris 11e',
    labelX: 305,
    labelY: 175,
    // Bastille, Oberkampf, République, Nation
    path: 'M 275,160 L 280,155 L 295,148 L 302,135 L 318,138 L 335,148 L 340,165 L 335,185 L 322,195 L 305,200 L 290,198 L 280,192 L 278,180 Z',
  },
  {
    number: 12,
    name: '12e arrondissement',
    shortName: '12e',
    cityName: 'Paris 12e',
    labelX: 355,
    labelY: 238,
    // Bercy, Gare de Lyon, Bois de Vincennes, Nation — le plus grand
    path: 'M 280,215 L 290,198 L 305,200 L 322,195 L 335,185 L 348,192 L 368,208 L 388,230 L 398,260 L 392,290 L 375,312 L 350,318 L 328,308 L 310,290 L 298,268 L 285,245 L 280,232 Z',
  },

  // ═══════════════════════════════════
  // RIVE GAUCHE EXTÉRIEURE — 13e à 15e
  // ═══════════════════════════════════
  {
    number: 13,
    name: '13e arrondissement',
    shortName: '13e',
    cityName: 'Paris 13e',
    labelX: 268,
    labelY: 300,
    // Bibliothèque, Gobelins, Chinatown, Butte-aux-Cailles
    path: 'M 225,245 L 240,255 L 260,258 L 278,252 L 285,245 L 298,268 L 310,290 L 305,312 L 285,328 L 258,332 L 232,322 L 215,305 L 210,280 L 212,260 L 212,252 Z',
  },
  {
    number: 14,
    name: '14e arrondissement',
    shortName: '14e',
    cityName: 'Paris 14e',
    labelX: 188,
    labelY: 298,
    // Montparnasse, Denfert-Rochereau, Alésia, Parc Montsouris
    path: 'M 178,238 L 195,248 L 212,252 L 212,260 L 210,280 L 215,305 L 205,322 L 185,335 L 160,332 L 140,318 L 132,298 L 135,275 L 148,252 L 165,250 Z',
  },
  {
    number: 15,
    name: '15e arrondissement',
    shortName: '15e',
    cityName: 'Paris 15e',
    labelX: 108,
    labelY: 278,
    // Grenelle, Convention, Vaugirard, Porte de Versailles — le plus peuplé
    path: 'M 92,220 L 105,232 L 125,245 L 148,252 L 135,275 L 132,298 L 140,318 L 122,328 L 98,318 L 72,295 L 62,268 L 60,245 L 68,228 Z',
  },

  // ═══════════════════════════════════
  // RIVE DROITE EXTÉRIEURE — 16e à 20e
  // ═══════════════════════════════════
  {
    number: 16,
    name: '16e arrondissement',
    shortName: '16e',
    cityName: 'Paris 16e',
    labelX: 62,
    labelY: 178,
    // Trocadéro, Auteuil, Passy, Bois de Boulogne — le plus chic
    path: 'M 35,118 L 58,102 L 82,98 L 102,105 L 110,120 L 102,165 L 95,190 L 102,208 L 92,220 L 68,228 L 60,245 L 45,232 L 28,210 L 20,185 L 22,155 L 28,135 Z',
  },
  {
    number: 17,
    name: '17e arrondissement',
    shortName: '17e',
    cityName: 'Paris 17e',
    labelX: 148,
    labelY: 100,
    // Batignolles, Ternes, Épinettes, Parc Monceau nord
    path: 'M 82,98 L 105,85 L 135,72 L 168,68 L 198,72 L 218,82 L 220,100 L 225,130 L 208,128 L 192,132 L 182,140 L 165,135 L 142,138 L 118,148 L 102,165 L 110,120 L 102,105 Z',
  },
  {
    number: 18,
    name: '18e arrondissement',
    shortName: '18e',
    cityName: 'Paris 18e',
    labelX: 252,
    labelY: 88,
    // Montmartre, Sacré-Cœur, Goutte d'Or, Clignancourt, Barbès
    path: 'M 218,82 L 235,72 L 258,65 L 285,62 L 308,68 L 322,78 L 325,92 L 318,108 L 302,135 L 298,120 L 282,115 L 262,118 L 245,125 L 235,138 L 225,130 L 220,100 Z',
  },
  {
    number: 19,
    name: '19e arrondissement',
    shortName: '19e',
    cityName: 'Paris 19e',
    labelX: 352,
    labelY: 102,
    // Buttes-Chaumont, La Villette, Stalingrad, Parc de la Villette
    path: 'M 322,78 L 342,72 L 368,70 L 392,78 L 408,92 L 410,115 L 402,138 L 388,158 L 368,168 L 348,172 L 335,148 L 318,138 L 302,135 L 318,108 L 325,92 Z',
  },
  {
    number: 20,
    name: '20e arrondissement',
    shortName: '20e',
    cityName: 'Paris 20e',
    labelX: 372,
    labelY: 185,
    // Belleville, Ménilmontant, Père-Lachaise, Gambetta, Nation
    path: 'M 335,148 L 348,172 L 368,168 L 388,158 L 402,138 L 412,155 L 418,178 L 415,205 L 400,228 L 388,230 L 368,208 L 348,192 L 340,165 Z',
  },
];

// ────────────────────────────────────────────────────────
// La Seine — tracé décoratif traversant Paris du SE au SW
// ────────────────────────────────────────────────────────
export const SEINE_PATH = 'M 20,185 C 35,192 52,210 68,228 C 78,218 88,215 92,220 L 102,208 C 112,202 128,198 150,195 L 170,195 L 195,200 L 228,200 L 238,202 L 255,205 L 275,202 L 280,215 C 295,225 310,235 320,230 C 340,240 365,255 388,230 C 395,245 398,260 398,260';

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
      const numStr = String(arr.number);
      // Match many possible formats: "Paris 3e", "Paris 3", "paris 3ème", etc.
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
