import { CityAggregate } from './types';

// ══════════════════════════════════════════
// Seine-Saint-Denis (93) — 40 communes
// Source: Wikimedia Commons
// ══════════════════════════════════════════

export interface SeineSaintDenisCommune {
  name: string;
  shortName: string;
  cityName: string;
  labelX: number;
  labelY: number;
  path: string;
}

export const SSD_VIEWBOX = '0 0 1000 992';

export const SEINE_SAINT_DENIS_COMMUNES: SeineSaintDenisCommune[] = [
  {
    name: "Aubervilliers",
    shortName: "Aubervilliers",
    cityName: "Aubervilliers",
    labelX: 314,
    labelY: 484,
    path: "M 321.46,538.4 L 260.48,536.01 L 246.37,536.21 L 248.66,442.87 L 274.66,429.39 L 302.14,448.76 L 351.14,438.59 L 379.09,457.31 L 380.65,497.99 L 350.02,501.97 L 321.46,538.4 Z",
  },
  {
    name: "Aulnay-sous-Bois",
    shortName: "Aulnay",
    cityName: "Aulnay-sous-Bois",
    labelX: 647,
    labelY: 326,
    path: "M 647.08,462.31 L 607.81,448.29 L 614.22,365.56 L 574.4,292.4 L 544.44,277.54 L 566.99,236.87 L 645.15,189.52 L 660.69,192.03 L 750.26,299.24 L 712.38,331.37 L 699.41,362.4 L 729.31,419.8 L 696.63,453.69 L 647.08,462.31 Z",
  },
  {
    name: "Bagnolet",
    shortName: "Bagnolet",
    cityName: "Bagnolet",
    labelX: 435,
    labelY: 705,
    path: "M 403.83,760.94 L 397.33,674.11 L 419,652.05 L 449.66,649.08 L 471.71,655.37 L 467.63,667.02 L 429.06,740.21 L 403.83,760.94 Z",
  },
  {
    name: "Le blanc-Mesnil",
    shortName: "Le blanc-Mesnil",
    cityName: "Le blanc-Mesnil",
    labelX: 537,
    labelY: 364,
    path: "M 591.48,454.8 L 560.39,443.91 L 552.93,394.95 L 533.67,367.49 L 520.95,356.52 L 489.54,363.88 L 460.24,356.34 L 466.59,325.79 L 506.34,273.93 L 533.38,274.05 L 544.44,277.54 L 574.4,292.4 L 614.22,365.56 L 607.81,448.29 L 591.48,454.8 Z",
  },
  {
    name: "Bobigny",
    shortName: "Bobigny",
    cityName: "Bobigny",
    labelX: 491,
    labelY: 507,
    path: "M 443.32,563.91 L 401.18,520.3 L 387.08,463.21 L 398.02,450.77 L 535.21,490.87 L 594.5,464.57 L 577.46,520.92 L 486.48,552.32 L 443.32,563.91 Z",
  },
  {
    name: "Bondy",
    shortName: "Bondy",
    cityName: "Bondy",
    labelX: 625,
    labelY: 528,
    path: "M 631.38,606.75 L 599.03,598.86 L 583.31,597.05 L 590.44,566.14 L 577.46,520.92 L 594.5,464.57 L 591.48,454.8 L 607.81,448.29 L 647.08,462.31 L 645.38,494.66 L 672.92,564.61 L 658.86,592.68 L 631.38,606.75 Z",
  },
  {
    name: "Le bourget",
    shortName: "Le bourget",
    cityName: "Le bourget",
    labelX: 449,
    labelY: 363,
    path: "M 425.19,400.6 L 402.25,382.53 L 410.93,352.22 L 466.59,325.79 L 460.24,356.34 L 489.54,363.88 L 496.2,377.5 L 483.7,386.12 L 425.19,400.6 Z",
  },
  {
    name: "Clichy-sous-Bois",
    shortName: "Clichy",
    cityName: "Clichy-sous-Bois",
    labelX: 811,
    labelY: 504,
    path: "M 775.62,567.07 L 769.92,535.67 L 741.86,526.27 L 796.55,492.21 L 811.41,463.53 L 843.48,467.17 L 861.92,440.39 L 880.95,503.52 L 821.67,549.34 L 794.58,549.15 L 775.62,567.07 Z",
  },
  {
    name: "Coubron",
    shortName: "Coubron",
    cityName: "Coubron",
    labelX: 915,
    labelY: 458,
    path: "M 964.41,509.39 L 937.5,496.3 L 910.51,509.54 L 880.95,503.52 L 861.92,440.39 L 878.99,406.96 L 900.07,424.86 L 958.9,409.96 L 967.35,422.89 L 956.87,495.72 L 967.43,506.72 L 964.41,509.39 Z",
  },
  {
    name: "La courneuve",
    shortName: "La courneuve",
    cityName: "La courneuve",
    labelX: 350,
    labelY: 379,
    path: "M 387.08,463.21 L 379.09,457.31 L 351.14,438.59 L 302.14,448.76 L 274.66,429.39 L 315.41,344.81 L 350.31,311.24 L 369.23,295.6 L 410.93,352.22 L 402.25,382.53 L 425.19,400.6 L 398.02,450.77 L 387.08,463.21 Z",
  },
  {
    name: "Drancy",
    shortName: "Drancy",
    cityName: "Drancy",
    labelX: 496,
    labelY: 424,
    path: "M 594.5,464.57 L 535.21,490.87 L 398.02,450.77 L 425.19,400.6 L 483.7,386.12 L 496.2,377.5 L 489.54,363.88 L 520.95,356.52 L 533.67,367.49 L 552.93,394.95 L 560.39,443.91 L 591.48,454.8 L 594.5,464.57 Z",
  },
  {
    name: "Dugny",
    shortName: "Dugny",
    cityName: "Dugny",
    labelX: 438,
    labelY: 308,
    path: "M 410.93,352.22 L 369.23,295.6 L 378.57,272.33 L 415.07,264.49 L 506.34,273.93 L 466.59,325.79 L 410.93,352.22 Z",
  },
  {
    name: "Epinay-sur-Seine",
    shortName: "Epinay",
    cityName: "Epinay-sur-Seine",
    labelX: 91,
    labelY: 280,
    path: "M 158.86,337.76 L 135.53,318.11 L 46.83,294.33 L 12.15,295.29 L 0,258.53 L 32.33,222.86 L 78.68,242.86 L 100.79,261.34 L 126.95,255.24 L 142.78,275.96 L 182.52,318.8 L 170.12,317.38 L 158.86,337.76 Z",
  },
  {
    name: "Gagny",
    shortName: "Gagny",
    cityName: "Gagny",
    labelX: 815,
    labelY: 630,
    path: "M 886.08,709.9 L 830.69,676.69 L 768.41,668.44 L 731.32,586.7 L 770.97,580.02 L 775.62,567.07 L 794.58,549.15 L 821.67,549.34 L 832.14,610.13 L 862.51,614.97 L 897.84,647.33 L 889.76,708.83 L 886.08,709.9 Z",
  },
  {
    name: "Gournay-sur-Marne",
    shortName: "Gournay",
    cityName: "Gournay-sur-Marne",
    labelX: 919,
    labelY: 739,
    path: "M 908.44,769.62 L 886.42,748.63 L 886.08,709.9 L 889.76,708.83 L 951.4,713.37 L 936.09,755.98 L 908.44,769.62 Z",
  },
  {
    name: "L'Ile-Saint-Denis",
    shortName: "L'Ile-St-Denis",
    cityName: "L'Ile-Saint-Denis",
    labelX: 89,
    labelY: 381,
    path: "M 99.82,466.88 L 106.83,453.63 L 127.3,433.82 L 151.27,391.18 L 147.86,342.94 L 73.89,311.93 L 8,297.33 L 12.15,295.29 L 46.83,294.33 L 135.53,318.11 L 158.86,337.76 L 169.17,380.76 L 141.28,433.05 L 99.82,466.88 Z",
  },
  {
    name: "Les lilas",
    shortName: "Les lilas",
    cityName: "Les lilas",
    labelX: 419,
    labelY: 630,
    path: "M 397.33,674.11 L 389.11,648.18 L 391.06,625.14 L 432.8,586.62 L 449.66,649.08 L 419,652.05 L 397.33,674.11 Z",
  },
  {
    name: "Livry-Gargan",
    shortName: "Livry-Gargan",
    cityName: "Livry-Gargan",
    labelX: 788,
    labelY: 456,
    path: "M 708.17,535.31 L 733.2,495.29 L 703.47,484.68 L 696.63,453.69 L 729.31,419.8 L 789.6,411.95 L 822.68,377.28 L 855.62,376.84 L 878.99,406.96 L 861.92,440.39 L 843.48,467.17 L 811.41,463.53 L 796.55,492.21 L 741.86,526.27 L 708.17,535.31 Z",
  },
  {
    name: "Montfermeil",
    shortName: "Montfermeil",
    cityName: "Montfermeil",
    labelX: 893,
    labelY: 556,
    path: "M 862.51,614.97 L 832.14,610.13 L 821.67,549.34 L 880.95,503.52 L 910.51,509.54 L 937.5,496.3 L 964.41,509.39 L 945.44,535.34 L 947.17,567.41 L 885.04,591.21 L 862.51,614.97 Z",
  },
  {
    name: "Montreuil",
    shortName: "Montreuil",
    cityName: "Montreuil",
    labelX: 509,
    labelY: 720,
    path: "M 505.01,780.4 L 473.63,772.49 L 447.91,791.47 L 415.45,789.23 L 407.08,789.68 L 403.83,760.94 L 429.06,740.21 L 467.63,667.02 L 490.81,680.13 L 519.54,648.11 L 561.22,650.13 L 583.1,690.37 L 611.69,701.5 L 614.61,730.78 L 527.9,759.74 L 505.01,780.4 Z",
  },
  {
    name: "Neuilly-Plaisance",
    shortName: "Neuilly",
    cityName: "Neuilly-Plaisance",
    labelX: 705,
    labelY: 718,
    path: "M 716.91,785.18 L 685.94,750.99 L 672.5,758.52 L 661.91,738.04 L 702.46,650.86 L 738.45,667.05 L 748.07,679.09 L 730.57,704.58 L 728.59,764.7 L 739.72,775.42 L 723.21,779.31 L 716.91,785.18 Z",
  },
  {
    name: "Neuilly-sur-Marne",
    shortName: "Neuilly",
    cityName: "Neuilly-sur-Marne",
    labelX: 808,
    labelY: 721,
    path: "M 739.72,775.42 L 728.59,764.7 L 730.57,704.58 L 748.07,679.09 L 738.45,667.05 L 768.41,668.44 L 830.69,676.69 L 886.08,709.9 L 886.42,748.63 L 864.31,767.04 L 739.72,775.42 Z",
  },
  {
    name: "Noisy-le-Grand",
    shortName: "Noisy",
    cityName: "Noisy-le-Grand",
    labelX: 851,
    labelY: 870,
    path: "M 967.15,992 L 896.47,954.85 L 891.45,939.52 L 891.98,909.83 L 790.08,841.59 L 791.67,824.91 L 723.21,779.31 L 739.72,775.42 L 864.31,767.04 L 886.42,748.63 L 908.44,769.62 L 948.06,862.21 L 978.34,958.95 L 967.15,992 Z",
  },
  {
    name: "Noisy-le-Sec",
    shortName: "Noisy",
    cityName: "Noisy-le-Sec",
    labelX: 543,
    labelY: 586,
    path: "M 561.22,650.13 L 519.54,648.11 L 513.51,617.25 L 492.37,598.55 L 486.48,552.32 L 577.46,520.92 L 590.44,566.14 L 583.31,597.05 L 599.03,598.86 L 561.22,650.13 Z",
  },
  {
    name: "Pantin",
    shortName: "Pantin",
    cityName: "Pantin",
    labelX: 382,
    labelY: 541,
    path: "M 391.06,625.14 L 378.72,599.68 L 350.77,595.24 L 343.92,562.43 L 321.46,538.4 L 350.02,501.97 L 380.65,497.99 L 379.09,457.31 L 387.08,463.21 L 401.18,520.3 L 443.32,563.91 L 432.8,586.62 L 391.06,625.14 Z",
  },
  {
    name: "Les pavillons-sous-Bois",
    shortName: "Les pavillons",
    cityName: "Les pavillons-sous-Bois",
    labelX: 689,
    labelY: 509,
    path: "M 672.92,564.61 L 645.38,494.66 L 647.08,462.31 L 696.63,453.69 L 703.47,484.68 L 733.2,495.29 L 708.17,535.31 L 697.72,551.18 L 672.92,564.61 Z",
  },
  {
    name: "Pierrefitte-sur-Seine",
    shortName: "Pierrefitte",
    cityName: "Pierrefitte-sur-Seine",
    labelX: 240,
    labelY: 250,
    path: "M 264.28,314.91 L 202.35,299.66 L 206.92,226.37 L 247.33,184.74 L 278.46,195.42 L 269.89,243.62 L 248.61,268.43 L 264.28,314.91 Z",
  },
  {
    name: "Le pre-Saint-Gervais",
    shortName: "Le pre-St",
    cityName: "Le pre-Saint-Gervais",
    labelX: 371,
    labelY: 622,
    path: "M 389.11,648.18 L 356.15,622.66 L 350.77,595.24 L 378.72,599.68 L 391.06,625.14 L 389.11,648.18 Z",
  },
  {
    name: "Le raincy",
    shortName: "Le raincy",
    cityName: "Le raincy",
    labelX: 737,
    labelY: 564,
    path: "M 731.32,586.7 L 724.94,601.15 L 710.58,594.62 L 697.72,551.18 L 708.17,535.31 L 741.86,526.27 L 769.92,535.67 L 775.62,567.07 L 770.97,580.02 L 731.32,586.7 Z",
  },
  {
    name: "Romainville",
    shortName: "Romainville",
    cityName: "Romainville",
    labelX: 476,
    labelY: 616,
    path: "M 519.54,648.11 L 490.81,680.13 L 467.63,667.02 L 471.71,655.37 L 449.66,649.08 L 432.8,586.62 L 443.32,563.91 L 486.48,552.32 L 492.37,598.55 L 513.51,617.25 L 519.54,648.11 Z",
  },
  {
    name: "Rosny-sous-Bois",
    shortName: "Rosny",
    cityName: "Rosny-sous-Bois",
    labelX: 632,
    labelY: 668,
    path: "M 661.91,738.04 L 614.61,730.78 L 611.69,701.5 L 583.1,690.37 L 561.22,650.13 L 599.03,598.86 L 631.38,606.75 L 658.27,622.63 L 670.77,650.63 L 702.46,650.86 L 661.91,738.04 Z",
  },
  {
    name: "Saint-Denis",
    shortName: "St-Denis",
    cityName: "Saint-Denis",
    labelX: 246,
    labelY: 418,
    path: "M 201.86,536.61 L 192.61,489.47 L 141.28,433.05 L 169.17,380.76 L 158.86,337.76 L 170.12,317.38 L 182.52,318.8 L 202.35,299.66 L 264.28,314.91 L 308.36,327.1 L 350.31,311.24 L 315.41,344.81 L 274.66,429.39 L 248.66,442.87 L 246.37,536.21 L 201.86,536.61 Z",
  },
  {
    name: "Saint-Ouen",
    shortName: "St-Ouen",
    cityName: "Saint-Ouen",
    labelX: 141,
    labelY: 487,
    path: "M 100.03,541.78 L 80.53,476.14 L 99.82,466.88 L 141.28,433.05 L 192.61,489.47 L 201.86,536.61 L 132.18,538.37 L 100.03,541.78 Z",
  },
  {
    name: "Sevran",
    shortName: "Sevran",
    cityName: "Sevran",
    labelX: 778,
    labelY: 360,
    path: "M 729.31,419.8 L 699.41,362.4 L 712.38,331.37 L 750.26,299.24 L 814.49,304.08 L 847.25,340.98 L 854.99,373.14 L 855.62,376.84 L 822.68,377.28 L 789.6,411.95 L 729.31,419.8 Z",
  },
  {
    name: "Stains",
    shortName: "Stains",
    cityName: "Stains",
    labelX: 314,
    labelY: 261,
    path: "M 350.31,311.24 L 308.36,327.1 L 264.28,314.91 L 248.61,268.43 L 269.89,243.62 L 278.46,195.42 L 299.19,198.95 L 378.57,272.33 L 369.23,295.6 L 350.31,311.24 Z",
  },
  {
    name: "Tremblay-en-France",
    shortName: "Tremblay",
    cityName: "Tremblay-en-France",
    labelX: 827,
    labelY: 181,
    path: "M 978.79,357.11 L 911.38,362.69 L 893.1,334.76 L 845.88,214.38 L 831.66,205.71 L 784.4,220.95 L 757.11,179.99 L 675.05,179.62 L 679.39,163.88 L 710.19,151.98 L 777.84,38.59 L 825.23,38.93 L 842.31,12.5 L 882.83,0 L 901.09,52.6 L 914.83,58.62 L 927.96,123.31 L 914.82,153.89 L 882.99,163.12 L 884.56,179.78 L 965.96,305.17 L 978.79,357.11 Z",
  },
  {
    name: "Vaujours",
    shortName: "Vaujours",
    cityName: "Vaujours",
    labelX: 927,
    labelY: 380,
    path: "M 967.35,422.89 L 958.9,409.96 L 900.07,424.86 L 878.99,406.96 L 855.62,376.84 L 854.99,373.14 L 885.58,365.53 L 893.1,334.76 L 911.38,362.69 L 978.79,357.11 L 999.38,373.07 L 1000,401.92 L 967.35,422.89 Z",
  },
  {
    name: "Villemomble",
    shortName: "Villemomble",
    cityName: "Villemomble",
    labelX: 700,
    labelY: 610,
    path: "M 768.41,668.44 L 738.45,667.05 L 702.46,650.86 L 670.77,650.63 L 658.27,622.63 L 631.38,606.75 L 658.86,592.68 L 672.92,564.61 L 697.72,551.18 L 710.58,594.62 L 724.94,601.15 L 731.32,586.7 L 768.41,668.44 Z",
  },
  {
    name: "Villepinte",
    shortName: "Villepinte",
    cityName: "Villepinte",
    labelX: 777,
    labelY: 276,
    path: "M 854.99,373.14 L 847.25,340.98 L 814.49,304.08 L 750.26,299.24 L 660.69,192.03 L 675.05,179.62 L 757.11,179.99 L 784.4,220.95 L 831.66,205.71 L 845.88,214.38 L 893.1,334.76 L 885.58,365.53 L 854.99,373.14 Z",
  },
  {
    name: "Villetaneuse",
    shortName: "Villetaneuse",
    cityName: "Villetaneuse",
    labelX: 175,
    labelY: 269,
    path: "M 182.52,318.8 L 142.78,275.96 L 175.86,218.71 L 206.92,226.37 L 202.35,299.66 L 182.52,318.8 Z",
  },
];

// River path placeholder
export const CANAL_SSD_PATH = '';

// ══════════════════════════════════════════
// Aggregation by Commune
// ══════════════════════════════════════════

export interface CommuneAggregate {
  name: string;
  shortName: string;
  cityName: string;
  totalRestaurants: number;
  totalOpportunities: number;
  types: string[];
  avgRating: number;
  hasData: boolean;
}

function normalizeCommune(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\bsaint\b/g, 'st')
    .replace(/\bl'/g, 'l ')
    .replace(/\ble\b/g, '')
    .replace(/\bla\b/g, '')
    .replace(/\bles\b/g, '')
    .replace(/\bsur\b/g, '')
    .replace(/\ben\b/g, '')
    .replace(/\bdes\b/g, '')
    .replace(/\bsous\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function aggregateByCommunesSSD(
  cityAggregates: CityAggregate[]
): Map<string, CommuneAggregate> {
  const communeMap = new Map<string, CommuneAggregate>();

  for (const commune of SEINE_SAINT_DENIS_COMMUNES) {
    communeMap.set(commune.cityName, {
      name: commune.name,
      shortName: commune.shortName,
      cityName: commune.cityName,
      totalRestaurants: 0,
      totalOpportunities: 0,
      types: [],
      avgRating: 0,
      hasData: false,
    });
  }

  const lookup = new Map<string, string>();
  for (const commune of SEINE_SAINT_DENIS_COMMUNES) {
    lookup.set(commune.cityName.toLowerCase(), commune.cityName);
    lookup.set(commune.name.toLowerCase(), commune.cityName);
    lookup.set(commune.shortName.toLowerCase(), commune.cityName);
    lookup.set(normalizeCommune(commune.cityName), commune.cityName);
    lookup.set(normalizeCommune(commune.name), commune.cityName);
  }

  for (const city of cityAggregates) {
    const normalized = city.city.trim().toLowerCase();
    let key = lookup.get(normalized) || lookup.get(normalizeCommune(city.city));

    if (!key) {
      for (const commune of SEINE_SAINT_DENIS_COMMUNES) {
        const cn = normalizeCommune(commune.cityName);
        const ct = normalizeCommune(city.city);
        if (cn.includes(ct) || ct.includes(cn)) {
          key = commune.cityName;
          break;
        }
      }
    }

    if (key) {
      const agg = communeMap.get(key)!;
      agg.totalRestaurants += city.totalRestaurants;
      agg.totalOpportunities += city.opportunityCount;
      agg.types = [...new Set([...agg.types, ...city.types])];
      agg.hasData = true;
      if (city.avgRating > 0) {
        agg.avgRating = agg.avgRating > 0
          ? (agg.avgRating + city.avgRating) / 2
          : city.avgRating;
      }
    }
  }

  return communeMap;
}
