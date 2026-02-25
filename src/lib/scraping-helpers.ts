import {
  ScrapingSession,
  ScrapedRestaurant,
  AnalyzedRestaurant,
  CityAggregate,
  TypeAggregate,
  RedFlag,
  StrengthTag,
} from './types';

// ── Analyze a single restaurant ──
export function analyzeRestaurant(r: ScrapedRestaurant): AnalyzedRestaurant {
  const redFlags: RedFlag[] = [];
  const strengths: StrengthTag[] = [];

  // Red flags
  if (!r.website || r.website.trim() === '') redFlags.push('no-website');
  if (!r.phone || r.phone.trim() === '') redFlags.push('no-phone');
  if (r.rating > 0 && r.rating < 3) redFlags.push('low-rating');
  if (r.reviewCount < 10) redFlags.push('few-reviews');

  // Strengths
  if (r.rating >= 4.2) strengths.push('well-rated');
  if (r.reviewCount >= 100) strengths.push('popular');
  if (r.website && r.website.trim() !== '' && r.phone && r.phone.trim() !== '') {
    strengths.push('digital-ready');
  }
  if ((!r.website || r.website.trim() === '') && r.rating >= 3.5) {
    strengths.push('needs-digital');
  }
  if (r.rating > 0 && r.rating < 3 && r.reviewCount < 30) {
    strengths.push('struggling');
  }

  // Opportunity score (0-100): higher = better sales prospect
  let score = 0;
  if (!r.website || r.website.trim() === '') score += 35; // No website = huge opportunity
  if (!r.phone || r.phone.trim() === '') score += 10;
  if (r.rating >= 3.5) score += 20; // Good rating but no digital = high value target
  if (r.rating >= 4.0) score += 10;
  if (r.reviewCount >= 50) score += 15; // Popular but lacks digital presence
  if (r.reviewCount >= 200) score += 10;
  score = Math.min(100, score);

  return { ...r, redFlags, strengths, opportunityScore: score };
}

// ── Deduplicate restaurants across sessions ──
export function deduplicateRestaurants(sessions: ScrapingSession[]): ScrapedRestaurant[] {
  const map = new Map<string, ScrapedRestaurant>();

  for (const session of sessions) {
    for (const r of session.data) {
      // Use name + city as dedup key (normalized)
      const key = `${(r.name || '').toLowerCase().trim()}|${(r.city || '').toLowerCase().trim()}`;
      if (!map.has(key)) {
        map.set(key, r);
      } else {
        // Keep the one with more data
        const existing = map.get(key)!;
        if (
          (r.phone && !existing.phone) ||
          (r.website && !existing.website) ||
          (r.reviewCount || 0) > (existing.reviewCount || 0)
        ) {
          map.set(key, r);
        }
      }
    }
  }

  return Array.from(map.values());
}

// ── Aggregate sessions by city ──
export function aggregateByCities(sessions: ScrapingSession[]): CityAggregate[] {
  const cityMap = new Map<string, ScrapingSession[]>();

  for (const s of sessions) {
    const city = normalizeCityName(s.city);
    if (!city) continue;
    if (!cityMap.has(city)) cityMap.set(city, []);
    cityMap.get(city)!.push(s);
  }

  const result: CityAggregate[] = [];

  for (const [city, citySessions] of cityMap.entries()) {
    const restaurants = deduplicateRestaurants(citySessions);
    const analyzed = restaurants.map(analyzeRestaurant);
    const types = [...new Set(citySessions.map(s => s.type).filter(Boolean))];
    const rated = restaurants.filter(r => r.rating > 0);
    const avgRating = rated.length > 0
      ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
      : 0;
    const withPhone = restaurants.filter(r => r.phone && r.phone.trim() !== '').length;
    const withWebsite = restaurants.filter(r => r.website && r.website.trim() !== '').length;
    const opportunityCount = analyzed.filter(r => r.opportunityScore >= 40).length;

    result.push({
      city,
      totalRestaurants: restaurants.length,
      types,
      avgRating,
      withPhone,
      withWebsite,
      opportunityCount,
      sessions: citySessions,
    });
  }

  return result.sort((a, b) => b.totalRestaurants - a.totalRestaurants);
}

// ── Aggregate by type for a specific city ──
export function aggregateByTypes(sessions: ScrapingSession[], city: string): TypeAggregate[] {
  const normalizedCity = normalizeCityName(city);
  const citySessions = sessions.filter(s => normalizeCityName(s.city) === normalizedCity);

  const typeMap = new Map<string, ScrapingSession[]>();
  for (const s of citySessions) {
    const type = s.type || 'Autre';
    if (!typeMap.has(type)) typeMap.set(type, []);
    typeMap.get(type)!.push(s);
  }

  const result: TypeAggregate[] = [];

  for (const [type, typeSessions] of typeMap.entries()) {
    const restaurants = deduplicateRestaurants(typeSessions);
    const analyzed = restaurants.map(analyzeRestaurant);
    const rated = restaurants.filter(r => r.rating > 0);
    const avgRating = rated.length > 0
      ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
      : 0;
    const avgReviews = restaurants.length > 0
      ? restaurants.reduce((s, r) => s + (r.reviewCount || 0), 0) / restaurants.length
      : 0;
    const withPhone = restaurants.filter(r => r.phone && r.phone.trim() !== '').length;
    const withWebsite = restaurants.filter(r => r.website && r.website.trim() !== '').length;
    const opportunityCount = analyzed.filter(r => r.opportunityScore >= 40).length;

    result.push({
      type,
      city: normalizedCity,
      totalRestaurants: restaurants.length,
      avgRating,
      avgReviews,
      withPhone,
      withWebsite,
      opportunityCount,
      restaurants: analyzed,
    });
  }

  return result.sort((a, b) => b.totalRestaurants - a.totalRestaurants);
}

// ── Get analyzed restaurants for a specific city + type ──
export function getRestaurantsForCityType(
  sessions: ScrapingSession[],
  city: string,
  type: string
): AnalyzedRestaurant[] {
  const normalizedCity = normalizeCityName(city);
  const filtered = sessions.filter(
    s => normalizeCityName(s.city) === normalizedCity && s.type === type
  );
  const restaurants = deduplicateRestaurants(filtered);
  return restaurants.map(analyzeRestaurant);
}

// ── Normalize city name ──
export function normalizeCityName(city: string): string {
  if (!city) return '';
  return city
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ── Red flag labels ──
export function getRedFlagLabel(flag: RedFlag): string {
  const map: Record<RedFlag, string> = {
    'no-website': 'Pas de site web',
    'no-phone': 'Pas de t\u00e9l\u00e9phone',
    'low-rating': 'Note faible',
    'few-reviews': 'Peu d\'avis',
  };
  return map[flag];
}

export function getRedFlagBadge(flag: RedFlag): string {
  const map: Record<RedFlag, string> = {
    'no-website': 'badge-red',
    'no-phone': 'badge-orange',
    'low-rating': 'badge-red',
    'few-reviews': 'badge-ghost',
  };
  return map[flag];
}

// ── Strength labels ──
export function getStrengthLabel(tag: StrengthTag): string {
  const map: Record<StrengthTag, string> = {
    'popular': 'Populaire',
    'well-rated': 'Bien not\u00e9',
    'digital-ready': 'Pr\u00e9sence digitale',
    'needs-digital': 'Besoin digital',
    'struggling': 'En difficult\u00e9',
  };
  return map[tag];
}

export function getStrengthBadge(tag: StrengthTag): string {
  const map: Record<StrengthTag, string> = {
    'popular': 'badge-blue',
    'well-rated': 'badge-green',
    'digital-ready': 'badge-teal',
    'needs-digital': 'badge-purple',
    'struggling': 'badge-red',
  };
  return map[tag];
}

// ── Export CSV enrichi ──
export function exportEnrichedCSV(restaurants: AnalyzedRestaurant[], city: string, type: string) {
  const headers = [
    '#', 'Nom', 'Adresse', 'Ville', 'T\u00e9l\u00e9phone', 'Site Web', 'Note', 'Nb Avis',
    'Score Opportunit\u00e9', 'Alertes', 'Analyse',
    'Avis 1', 'Note Avis 1', 'Avis 2', 'Note Avis 2',
  ];
  const rows = restaurants.map((r, i) => [
    i + 1,
    `"${r.name || ''}"`,
    `"${r.address || ''}"`,
    `"${r.city || ''}"`,
    r.phone || '',
    r.website || '',
    r.rating || '',
    r.reviewCount || '',
    r.opportunityScore,
    `"${r.redFlags.map(f => getRedFlagLabel(f)).join(', ')}"`,
    `"${r.strengths.map(s => getStrengthLabel(s)).join(', ')}"`,
    `"${r.reviews?.[0]?.text || ''}"`,
    r.reviews?.[0]?.rating || '',
    `"${r.reviews?.[1]?.text || ''}"`,
    r.reviews?.[1]?.rating || '',
  ]);
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scraping-${type}-${city}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
