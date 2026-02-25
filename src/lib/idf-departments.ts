import { CityAggregate } from './types';

// ══════════════════════════════════════════
// Île-de-France — 8 Departments Data
// ══════════════════════════════════════════

export interface IdfDepartment {
  code: string;
  name: string;
  shortName: string;
  capital: string;
  labelX: number;
  labelY: number;
  path: string;
}

// SVG viewBox: 0 0 520 460
// Simplified polygon paths for each department
// Shared border coordinates ensure no visual gaps
export const IDF_DEPARTMENTS: IdfDepartment[] = [
  {
    code: '75',
    name: 'Paris',
    shortName: 'Paris',
    capital: 'Paris',
    labelX: 250,
    labelY: 213,
    path: 'M 232,195 L 245,190 L 265,192 L 272,205 L 268,222 L 252,228 L 235,224 L 228,210 Z',
  },
  {
    code: '92',
    name: 'Hauts-de-Seine',
    shortName: 'Hauts-de-Seine',
    capital: 'Nanterre',
    labelX: 190,
    labelY: 215,
    path: 'M 170,190 L 198,178 L 225,182 L 232,195 L 228,210 L 235,224 L 218,238 L 200,238 L 178,232 L 162,218 L 160,200 Z',
  },
  {
    code: '93',
    name: 'Seine-Saint-Denis',
    shortName: 'Seine-St-Denis',
    capital: 'Bobigny',
    labelX: 295,
    labelY: 195,
    path: 'M 245,190 L 265,192 L 272,205 L 268,222 L 280,232 L 300,228 L 315,215 L 318,192 L 308,178 L 285,182 Z',
  },
  {
    code: '94',
    name: 'Val-de-Marne',
    shortName: 'Val-de-Marne',
    capital: 'Cr\u00e9teil',
    labelX: 268,
    labelY: 258,
    path: 'M 235,224 L 252,228 L 268,222 L 280,232 L 295,242 L 298,262 L 285,278 L 262,280 L 242,272 L 235,252 L 218,238 Z',
  },
  {
    code: '95',
    name: "Val-d'Oise",
    shortName: "Val-d'Oise",
    capital: 'Cergy',
    labelX: 220,
    labelY: 125,
    path: 'M 108,80 L 200,65 L 295,72 L 340,90 L 345,120 L 318,140 L 308,178 L 285,182 L 245,190 L 232,195 L 225,182 L 198,178 L 170,190 L 152,168 L 138,140 L 112,120 Z',
  },
  {
    code: '78',
    name: 'Yvelines',
    shortName: 'Yvelines',
    capital: 'Versailles',
    labelX: 105,
    labelY: 225,
    path: 'M 62,148 L 112,120 L 138,140 L 152,168 L 170,190 L 160,200 L 162,218 L 178,232 L 162,250 L 145,268 L 118,278 L 88,275 L 60,258 L 42,220 L 48,178 Z',
  },
  {
    code: '91',
    name: 'Essonne',
    shortName: 'Essonne',
    capital: '\u00c9vry',
    labelX: 210,
    labelY: 320,
    path: 'M 162,250 L 178,232 L 200,238 L 218,238 L 235,252 L 242,272 L 235,305 L 215,340 L 185,350 L 155,338 L 135,310 L 130,282 L 145,268 Z',
  },
  {
    code: '77',
    name: 'Seine-et-Marne',
    shortName: 'Seine-et-Marne',
    capital: 'Melun',
    labelX: 395,
    labelY: 270,
    path: 'M 308,178 L 318,140 L 345,120 L 380,115 L 425,130 L 460,165 L 470,215 L 465,270 L 450,320 L 420,360 L 375,375 L 330,360 L 298,330 L 275,300 L 285,278 L 298,262 L 295,242 L 280,232 L 300,228 L 315,215 L 318,192 Z',
  },
];

// ══════════════════════════════════════════
// City → Department Lookup (case-insensitive)
// ══════════════════════════════════════════

const CITY_TO_DEPT_RAW: Record<string, string> = {
  // 75 - Paris (global + arrondissements)
  'Paris': '75',
  'Paris 1er': '75', 'Paris 2e': '75', 'Paris 3e': '75', 'Paris 4e': '75',
  'Paris 5e': '75', 'Paris 6e': '75', 'Paris 7e': '75', 'Paris 8e': '75',
  'Paris 9e': '75', 'Paris 10e': '75', 'Paris 11e': '75', 'Paris 12e': '75',
  'Paris 13e': '75', 'Paris 14e': '75', 'Paris 15e': '75', 'Paris 16e': '75',
  'Paris 17e': '75', 'Paris 18e': '75', 'Paris 19e': '75', 'Paris 20e': '75',

  // 92 - Hauts-de-Seine
  'Nanterre': '92', 'Boulogne-Billancourt': '92', 'Courbevoie': '92',
  'Levallois-Perret': '92', 'Clichy': '92', 'Issy-les-Moulineaux': '92',
  'Colombes': '92', 'Antony': '92', 'Rueil-Malmaison': '92',
  'Asni\u00e8res-sur-Seine': '92', 'Montrouge': '92', 'Ch\u00e2tenay-Malabry': '92',
  'Clamart': '92', 'Meudon': '92', 'S\u00e8vres': '92', 'Suresnes': '92',
  'Puteaux': '92', 'Bagneux': '92', 'Fontenay-aux-Roses': '92',
  'Ch\u00e2tillon': '92', 'Malakoff': '92', 'Garches': '92', 'Vanves': '92',
  'La Garenne-Colombes': '92', 'Gennevilliers': '92', 'Villeneuve-la-Garenne': '92',
  'Neuilly-sur-Seine': '92', 'La D\u00e9fense': '92', 'Bourg-la-Reine': '92',
  'Chaville': '92', 'Vaucresson': '92', 'Ville-d\'Avray': '92',

  // 93 - Seine-Saint-Denis
  'Saint-Denis': '93', 'Montreuil': '93', 'Aubervilliers': '93',
  'Aulnay-sous-Bois': '93', 'Noisy-le-Grand': '93', 'Pantin': '93',
  '\u00c9pinay-sur-Seine': '93', 'Drancy': '93', 'Bobigny': '93',
  'Saint-Ouen': '93', 'Stains': '93', 'Rosny-sous-Bois': '93',
  'Bagnolet': '93', 'Les Lilas': '93', 'Romainville': '93',
  'Clichy-sous-Bois': '93', 'Neuilly-sur-Marne': '93', 'Bondy': '93',
  'Noisy-le-Sec': '93', 'Le Blanc-Mesnil': '93', 'Tremblay-en-France': '93',
  'Villepinte': '93', 'Sevran': '93', 'Livry-Gargan': '93',
  'Montfermeil': '93', 'Le Pr\u00e9-Saint-Gervais': '93', 'Gagny': '93',
  'Villemomble': '93', 'Le Raincy': '93', 'Dugny': '93',
  'La Courneuve': '93', 'Pierrefitte-sur-Seine': '93',
  'Saint-Ouen-sur-Seine': '93',

  // 94 - Val-de-Marne
  'Fontenay-sous-Bois': '94', 'Cr\u00e9teil': '94', 'Vincennes': '94',
  'Ivry-sur-Seine': '94', 'Vitry-sur-Seine': '94', 'Champigny-sur-Marne': '94',
  'Saint-Maur-des-Foss\u00e9s': '94', 'Nogent-sur-Marne': '94', 'Alfortville': '94',
  'Maisons-Alfort': '94', 'Charenton-le-Pont': '94', 'Fresnes': '94',
  'L\'Ha\u00ff-les-Roses': '94', 'Orly': '94', 'Choisy-le-Roi': '94',
  'Rungis': '94', 'Boissy-Saint-L\u00e9ger': '94', 'Bonneuil-sur-Marne': '94',
  'Le Perreux-sur-Marne': '94', 'Thiais': '94', 'Villeneuve-Saint-Georges': '94',
  'Valenton': '94', 'Sucy-en-Brie': '94', 'Cachan': '94',
  'Villejuif': '94', 'Gentilly': '94', 'Le Kremlin-Bic\u00eatre': '94',
  'Joinville-le-Pont': '94', 'Saint-Mand\u00e9': '94', 'Fontenay-Sous-Bois': '94',

  // 77 - Seine-et-Marne
  'Meaux': '77', 'Melun': '77', 'Chelles': '77', 'Pontault-Combault': '77',
  'Roissy-en-Brie': '77', 'Lognes': '77', 'Noisiel': '77',
  'Torcy': '77', 'Bussy-Saint-Georges': '77', 'Marne-la-Vall\u00e9e': '77',
  'Provins': '77', 'Fontainebleau': '77', 'Montereau-Fault-Yonne': '77',
  'Lagny-sur-Marne': '77', 'Serris': '77', 'Chessy': '77',
  'Coulommiers': '77', 'Nemours': '77', 'Savigny-le-Temple': '77',
  'Combs-la-Ville': '77', 'Mitry-Mory': '77', 'Dammarie-les-Lys': '77',
  'Villeparisis': '77',

  // 78 - Yvelines
  'Versailles': '78', 'Saint-Germain-en-Laye': '78', 'Sartrouville': '78',
  'Mantes-la-Jolie': '78', 'Plaisir': '78', 'Guyancourt': '78',
  'Poissy': '78', 'Trappes': '78', '\u00c9lancourt': '78',
  'Rambouillet': '78', 'Montigny-le-Bretonneux': '78', 'Les Mureaux': '78',
  'Conflans-Sainte-Honorine': '78', 'Chatou': '78', 'Houilles': '78',
  'Maisons-Laffitte': '78', 'Le Ch\u00e9snay-Rocquencourt': '78',
  'V\u00e9lizy-Villacoublay': '78', 'Mantes-la-Ville': '78',
  'Saint-Cyr-l\'\u00c9cole': '78', 'Carrières-sous-Poissy': '78',

  // 91 - Essonne
  '\u00c9vry-Courcouronnes': '91', '\u00c9vry': '91', 'Corbeil-Essonnes': '91', 'Massy': '91',
  'Palaiseau': '91', 'Savigny-sur-Orge': '91', 'Viry-Ch\u00e2tillon': '91',
  'Draveil': '91', 'Ris-Orangis': '91', 'Athis-Mons': '91',
  'Sainte-Genevi\u00e8ve-des-Bois': '91', 'Juvisy-sur-Orge': '91',
  'Les Ulis': '91', 'Gif-sur-Yvette': '91', 'Longjumeau': '91',
  'Br\u00e9tigny-sur-Orge': '91', 'Grigny': '91', 'Arpajon': '91',
  '\u00c9tampes': '91', 'Orsay': '91', 'Montgeron': '91',
  'Yerres': '91', 'Brunoy': '91',

  // 95 - Val-d'Oise
  'Cergy': '95', 'Argenteuil': '95', 'Sarcelles': '95',
  'Saint-Ouen-l\'Aum\u00f4ne': '95', 'Pontoise': '95', 'Gonesse': '95',
  'Garges-l\u00e8s-Gonesse': '95', 'Villiers-le-Bel': '95', 'Ermont': '95',
  'Goussainville': '95', 'Enghien-les-Bains': '95', 'Beaumont-sur-Oise': '95',
  'Franconville': '95', 'Taverny': '95', 'Deuil-la-Barre': '95',
  'Montmorency': '95', 'Soisy-sous-Montmorency': '95', 'Osny': '95',
  'Bezons': '95', 'Cormeilles-en-Parisis': '95', 'Eaubonne': '95',
  'Herblay': '95', 'Saint-Gratien': '95',
};

// Build lowercase lookup for case-insensitive matching
const CITY_LOOKUP: Record<string, string> = {};
for (const [city, code] of Object.entries(CITY_TO_DEPT_RAW)) {
  CITY_LOOKUP[city.toLowerCase()] = code;
}

export function getCityDepartment(cityName: string): string | undefined {
  const normalized = cityName.trim().toLowerCase();
  // Exact match
  if (CITY_LOOKUP[normalized]) return CITY_LOOKUP[normalized];
  // Partial match (city name contains a known key or vice-versa)
  for (const [key, code] of Object.entries(CITY_LOOKUP)) {
    if (normalized.includes(key) || key.includes(normalized)) return code;
  }
  return undefined;
}

// ══════════════════════════════════════════
// Department Aggregation
// ══════════════════════════════════════════

export interface DepartmentAggregate {
  code: string;
  name: string;
  shortName: string;
  capital: string;
  cities: CityAggregate[];
  totalRestaurants: number;
  totalOpportunities: number;
  types: string[];
  avgRating: number;
  hasData: boolean;
}

export function aggregateByDepartments(
  cityAggregates: CityAggregate[]
): Map<string, DepartmentAggregate> {
  const deptMap = new Map<string, DepartmentAggregate>();

  // Initialize all 8 departments
  for (const dept of IDF_DEPARTMENTS) {
    deptMap.set(dept.code, {
      code: dept.code,
      name: dept.name,
      shortName: dept.shortName,
      capital: dept.capital,
      cities: [],
      totalRestaurants: 0,
      totalOpportunities: 0,
      types: [],
      avgRating: 0,
      hasData: false,
    });
  }

  // Map each city to its department
  for (const city of cityAggregates) {
    const deptCode = getCityDepartment(city.city);
    if (!deptCode) continue;

    const dept = deptMap.get(deptCode);
    if (!dept) continue;

    dept.cities.push(city);
    dept.totalRestaurants += city.totalRestaurants;
    dept.totalOpportunities += city.opportunityCount;
    dept.types = [...new Set([...dept.types, ...city.types])];
    dept.hasData = true;
  }

  // Compute avgRating
  for (const [, dept] of deptMap) {
    if (dept.cities.length > 0) {
      const rated = dept.cities.filter(c => c.avgRating > 0);
      if (rated.length > 0) {
        dept.avgRating = rated.reduce((s, c) => s + c.avgRating, 0) / rated.length;
      }
    }
  }

  return deptMap;
}
