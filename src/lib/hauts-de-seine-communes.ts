import { CityAggregate } from './types';

// ══════════════════════════════════════════
// Hauts-de-Seine (92) — 36 communes
// Source: Wikimedia Commons
// ══════════════════════════════════════════

export interface HautsDeSeineCommune {
  name: string;
  shortName: string;
  cityName: string;
  labelX: number;
  labelY: number;
  path: string;
}

export const HDS_VIEWBOX = '0 0 1000 1770';

export const HAUTS_DE_SEINE_COMMUNES: HautsDeSeineCommune[] = [
  {
    name: "Antony",
    shortName: "Antony",
    cityName: "Antony",
    labelX: 798,
    labelY: 1599,
    path: "M 830.93,1770 L 821.79,1690.79 L 723.67,1732.94 L 697.18,1729.66 L 676.7,1680.25 L 724.95,1621.44 L 685.26,1552.86 L 750.16,1520.07 L 759.47,1473.41 L 876.18,1428.95 L 915.57,1440.54 L 894.3,1472.07 L 862.37,1569.39 L 919.72,1616.04 L 881.63,1761.79 L 830.93,1770 Z",
  },
  {
    name: "Asnieres-sur-Seine",
    shortName: "Asnieres",
    cityName: "Asnieres-sur-Seine",
    labelX: 778,
    labelY: 263,
    path: "M 728,389.07 L 686.57,355.02 L 633.99,357.01 L 629.02,331.62 L 702.16,262.45 L 670.37,192.74 L 668.92,136.91 L 720.2,154.41 L 743.75,233.47 L 804.47,289.63 L 903.69,242.62 L 926.58,258.09 L 914.99,279.96 L 883.11,295.26 L 744.41,378.21 L 728,389.07 Z",
  },
  {
    name: "Bagneux",
    shortName: "Bagneux",
    cityName: "Bagneux",
    labelX: 853,
    labelY: 1222,
    path: "M 861.76,1327.15 L 828.15,1323.21 L 794.98,1248.75 L 769.83,1238.7 L 829.25,1163.41 L 824.84,1117.66 L 911.02,1126.83 L 936.66,1194.1 L 909.02,1302.52 L 888.67,1293.06 L 861.76,1327.15 Z",
  },
  {
    name: "Bois-Colombes",
    shortName: "Bois-Colombes",
    cityName: "Bois-Colombes",
    labelX: 644,
    labelY: 284,
    path: "M 633.99,357.01 L 625.69,375.06 L 590.95,358.71 L 586.73,298.95 L 670.37,192.74 L 702.16,262.45 L 629.02,331.62 L 633.99,357.01 Z",
  },
  {
    name: "Boulogne-Billancourt",
    shortName: "Boulogne",
    cityName: "Boulogne-Billancourt",
    labelX: 513,
    labelY: 907,
    path: "M 474.69,1034.3 L 456.4,1024.78 L 411.22,925.6 L 412.15,778.81 L 537.51,836.32 L 566.46,911.95 L 615.05,935.35 L 545.52,1008.46 L 474.69,1034.3 Z",
  },
  {
    name: "Bourg-la-Reine",
    shortName: "Bourg",
    cityName: "Bourg-la-Reine",
    labelX: 899,
    labelY: 1367,
    path: "M 915.57,1440.54 L 876.18,1428.95 L 851.27,1372.31 L 861.76,1327.15 L 888.67,1293.06 L 909.02,1302.52 L 946.52,1351.07 L 915.57,1440.54 Z",
  },
  {
    name: "Chatenay-Malabry",
    shortName: "Chatenay",
    cityName: "Chatenay-Malabry",
    labelX: 598,
    labelY: 1450,
    path: "M 685.26,1552.86 L 649.19,1521.07 L 547.96,1516.49 L 457.57,1478.33 L 436.44,1410.53 L 481.75,1395.93 L 494.5,1418.88 L 598.87,1419.75 L 703.35,1346.47 L 699.44,1395.96 L 759.47,1473.41 L 750.16,1520.07 L 685.26,1552.86 Z",
  },
  {
    name: "Chatillon",
    shortName: "Chatillon",
    cityName: "Chatillon",
    labelX: 747,
    labelY: 1185,
    path: "M 664.49,1253.46 L 705.08,1119.24 L 811.57,1115.77 L 824.84,1117.66 L 829.25,1163.41 L 769.83,1238.7 L 664.49,1253.46 Z",
  },
  {
    name: "Chaville",
    shortName: "Chaville",
    cityName: "Chaville",
    labelX: 238,
    labelY: 1147,
    path: "M 194.98,1228.67 L 210.74,1207.88 L 162.37,1094.52 L 171.75,1087.74 L 272.45,1064.35 L 313.69,1132.93 L 298.58,1219.27 L 194.98,1228.67 Z",
  },
  {
    name: "Clamart",
    shortName: "Clamart",
    cityName: "Clamart",
    labelX: 565,
    labelY: 1243,
    path: "M 436.44,1410.53 L 424.43,1397.5 L 424.79,1353.65 L 468.63,1319.36 L 479.5,1236.59 L 565,1129.1 L 557.54,1075.55 L 666.44,1091.42 L 695.96,1092.59 L 705.08,1119.24 L 664.49,1253.46 L 662.03,1282.23 L 481.75,1395.93 L 436.44,1410.53 Z",
  },
  {
    name: "Clichy",
    shortName: "Clichy",
    cityName: "Clichy",
    labelX: 830,
    labelY: 375,
    path: "M 830.61,454.06 L 744.41,378.21 L 883.11,295.26 L 915.34,403.65 L 830.61,454.06 Z",
  },
  {
    name: "Colombes",
    shortName: "Colombes",
    cityName: "Colombes",
    labelX: 531,
    labelY: 236,
    path: "M 437.81,359.1 L 392.03,242.54 L 448.54,185.64 L 535.08,113.73 L 668.92,136.91 L 670.37,192.74 L 586.73,298.95 L 437.81,359.1 Z",
  },
  {
    name: "Courbevoie",
    shortName: "Courbevoie",
    cityName: "Courbevoie",
    labelX: 590,
    labelY: 434,
    path: "M 567.49,512.09 L 462.44,441.88 L 451.07,402.1 L 590.95,358.71 L 625.69,375.06 L 633.99,357.01 L 686.57,355.02 L 728,389.07 L 658.54,420.11 L 567.49,512.09 Z",
  },
  {
    name: "Fontenay-aux-Roses",
    shortName: "Fontenay",
    cityName: "Fontenay-aux-Roses",
    labelX: 745,
    labelY: 1290,
    path: "M 715.98,1341.04 L 662.03,1282.23 L 664.49,1253.46 L 769.83,1238.7 L 794.98,1248.75 L 828.15,1323.21 L 715.98,1341.04 Z",
  },
  {
    name: "Garches",
    shortName: "Garches",
    cityName: "Garches",
    labelX: 203,
    labelY: 837,
    path: "M 217.44,904.98 L 109.15,904.89 L 112.97,879.69 L 178.53,842.71 L 193.3,794.4 L 273.47,768.85 L 297.19,810.29 L 261.46,877.57 L 217.44,904.98 Z",
  },
  {
    name: "La garenne-Colombes",
    shortName: "La garenne-Colombes",
    cityName: "La garenne-Colombes",
    labelX: 514,
    labelY: 351,
    path: "M 451.07,402.1 L 437.81,359.1 L 586.73,298.95 L 590.95,358.71 L 451.07,402.1 Z",
  },
  {
    name: "Gennevilliers",
    shortName: "Gennevilliers",
    cityName: "Gennevilliers",
    labelX: 748,
    labelY: 145,
    path: "M 926.58,258.09 L 903.69,242.62 L 804.47,289.63 L 743.75,233.47 L 720.2,154.41 L 668.92,136.91 L 535.08,113.73 L 640.23,39 L 763.26,0 L 872.14,24.12 L 863.42,78.17 L 920.51,136.61 L 917.6,191.4 L 960.39,225.38 L 926.58,258.09 Z",
  },
  {
    name: "Issy-les-Moulineaux",
    shortName: "Issy",
    cityName: "Issy-les-Moulineaux",
    labelX: 615,
    labelY: 1012,
    path: "M 666.44,1091.42 L 557.54,1075.55 L 474.69,1034.3 L 545.52,1008.46 L 615.05,935.35 L 640.4,933.18 L 663.08,975.66 L 710.05,956.11 L 754.98,979.92 L 712.23,1006.62 L 702.36,1055.51 L 666.44,1091.42 Z",
  },
  {
    name: "Levallois-Perret",
    shortName: "Levallois",
    cityName: "Levallois-Perret",
    labelX: 745,
    labelY: 450,
    path: "M 728.99,522.1 L 658.54,420.11 L 728,389.07 L 744.41,378.21 L 830.61,454.06 L 728.99,522.1 Z",
  },
  {
    name: "Malakoff",
    shortName: "Malakoff",
    cityName: "Malakoff",
    labelX: 791,
    labelY: 1062,
    path: "M 705.08,1119.24 L 695.96,1092.59 L 766.33,1062.84 L 817.69,1005.67 L 885.17,1028.36 L 811.57,1115.77 L 705.08,1119.24 Z",
  },
  {
    name: "Marnes-la-Coquette",
    shortName: "Marnes",
    cityName: "Marnes-la-Coquette",
    labelX: 122,
    labelY: 980,
    path: "M 25.63,1055.87 L 29.42,1035.41 L 55.48,905.53 L 109.15,904.89 L 217.44,904.98 L 183.7,961.75 L 132.31,1015.41 L 25.63,1055.87 Z",
  },
  {
    name: "Meudon",
    shortName: "Meudon",
    cityName: "Meudon",
    labelX: 432,
    labelY: 1189,
    path: "M 424.79,1353.65 L 412.04,1330.7 L 337.51,1310.09 L 332.84,1258.1 L 298.58,1219.27 L 313.69,1132.93 L 382.14,1087.11 L 404.08,1037.36 L 456.4,1024.78 L 474.69,1034.3 L 557.54,1075.55 L 565,1129.1 L 479.5,1236.59 L 468.63,1319.36 L 424.79,1353.65 Z",
  },
  {
    name: "Montrouge",
    shortName: "Montrouge",
    cityName: "Montrouge",
    labelX: 895,
    labelY: 1078,
    path: "M 911.02,1126.83 L 824.84,1117.66 L 811.57,1115.77 L 885.17,1028.36 L 978.59,1070.54 L 963.62,1096.33 L 911.02,1126.83 Z",
  },
  {
    name: "Nanterre",
    shortName: "Nanterre",
    cityName: "Nanterre",
    labelX: 293,
    labelY: 428,
    path: "M 325.54,613.28 L 123.49,440.78 L 149.48,414.78 L 287.83,337.96 L 392.03,242.54 L 437.81,359.1 L 451.07,402.1 L 462.44,441.88 L 408.92,545.04 L 325.54,613.28 Z",
  },
  {
    name: "Neuilly-sur-Seine",
    shortName: "Neuilly",
    cityName: "Neuilly-sur-Seine",
    labelX: 627,
    labelY: 516,
    path: "M 705.26,578.52 L 600.28,565.62 L 575.54,612.28 L 525.1,595.44 L 567.49,512.09 L 658.54,420.11 L 728.99,522.1 L 705.26,578.52 Z",
  },
  {
    name: "Le plessis-Robinson",
    shortName: "Le plessis",
    cityName: "Le plessis-Robinson",
    labelX: 599,
    labelY: 1351,
    path: "M 703.35,1346.47 L 598.87,1419.75 L 494.5,1418.88 L 481.75,1395.93 L 662.03,1282.23 L 715.98,1341.04 L 703.35,1346.47 Z",
  },
  {
    name: "Puteaux",
    shortName: "Puteaux",
    cityName: "Puteaux",
    labelX: 488,
    labelY: 548,
    path: "M 451.66,654.51 L 464.35,586.97 L 408.92,545.04 L 462.44,441.88 L 567.49,512.09 L 525.1,595.44 L 451.66,654.51 Z",
  },
  {
    name: "Rueil-Malmaison",
    shortName: "Rueil-Malmaison",
    cityName: "Rueil-Malmaison",
    labelX: 184,
    labelY: 633,
    path: "M 73.62,825.13 L 23.88,738.98 L 41.51,691.78 L 23.75,640.15 L 65.45,562.29 L 123.49,440.78 L 325.54,613.28 L 344.06,658.74 L 288.28,702.43 L 303.47,721.97 L 273.47,768.85 L 193.3,794.4 L 73.62,825.13 Z",
  },
  {
    name: "Saint-Cloud",
    shortName: "St-Cloud",
    cityName: "Saint-Cloud",
    labelX: 302,
    labelY: 856,
    path: "M 411.22,925.6 L 380.62,990.88 L 281.73,968.44 L 183.7,961.75 L 217.44,904.98 L 261.46,877.57 L 297.19,810.29 L 273.47,768.85 L 303.47,721.97 L 419.79,731.73 L 412.15,778.81 L 411.22,925.6 Z",
  },
  {
    name: "Sceaux",
    shortName: "Sceaux",
    cityName: "Sceaux",
    labelX: 788,
    labelY: 1398,
    path: "M 759.47,1473.41 L 699.44,1395.96 L 703.35,1346.47 L 715.98,1341.04 L 828.15,1323.21 L 861.76,1327.15 L 851.27,1372.31 L 876.18,1428.95 L 759.47,1473.41 Z",
  },
  {
    name: "Sevres",
    shortName: "Sevres",
    cityName: "Sevres",
    labelX: 314,
    labelY: 1029,
    path: "M 313.69,1132.93 L 272.45,1064.35 L 171.75,1087.74 L 277.95,1019.87 L 281.73,968.44 L 380.62,990.88 L 411.22,925.6 L 456.4,1024.78 L 404.08,1037.36 L 382.14,1087.11 L 313.69,1132.93 Z",
  },
  {
    name: "Suresnes",
    shortName: "Suresnes",
    cityName: "Suresnes",
    labelX: 376,
    labelY: 638,
    path: "M 419.79,731.73 L 303.47,721.97 L 288.28,702.43 L 344.06,658.74 L 325.54,613.28 L 408.92,545.04 L 464.35,586.97 L 451.66,654.51 L 419.79,731.73 Z",
  },
  {
    name: "Vanves",
    shortName: "Vanves",
    cityName: "Vanves",
    labelX: 742,
    labelY: 1036,
    path: "M 695.96,1092.59 L 666.44,1091.42 L 702.36,1055.51 L 712.23,1006.62 L 754.98,979.92 L 817.69,1005.67 L 766.33,1062.84 L 695.96,1092.59 Z",
  },
  {
    name: "Vaucresson",
    shortName: "Vaucresson",
    cityName: "Vaucresson",
    labelX: 97,
    labelY: 915,
    path: "M 29.42,1035.41 L 13.69,978.8 L 0,911.6 L 21.88,833.59 L 73.62,825.13 L 193.3,794.4 L 178.53,842.71 L 112.97,879.69 L 109.15,904.89 L 55.48,905.53 L 29.42,1035.41 Z",
  },
  {
    name: "Ville-d'Avray",
    shortName: "Ville",
    cityName: "Ville-d'Avray",
    labelX: 154,
    labelY: 1033,
    path: "M 81.02,1104.37 L 25.63,1055.87 L 132.31,1015.41 L 183.7,961.75 L 281.73,968.44 L 277.95,1019.87 L 171.75,1087.74 L 162.37,1094.52 L 81.02,1104.37 Z",
  },
  {
    name: "Villeneuve-la-Garenne",
    shortName: "Villeneuve",
    cityName: "Villeneuve-la-Garenne",
    labelX: 932,
    labelY: 125,
    path: "M 960.39,225.38 L 917.6,191.4 L 920.51,136.61 L 863.42,78.17 L 872.14,24.12 L 994.38,75.32 L 1000,154.98 L 960.39,225.38 Z",
  },
];

// River path placeholder
export const SEINE_HDS_PATH = '';

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

export function aggregateByCommunesHDS(
  cityAggregates: CityAggregate[]
): Map<string, CommuneAggregate> {
  const communeMap = new Map<string, CommuneAggregate>();

  for (const commune of HAUTS_DE_SEINE_COMMUNES) {
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
  for (const commune of HAUTS_DE_SEINE_COMMUNES) {
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
      for (const commune of HAUTS_DE_SEINE_COMMUNES) {
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
