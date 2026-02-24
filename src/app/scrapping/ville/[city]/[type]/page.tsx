'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, Copy, CheckCircle2, Star, Phone, Globe, MapPin,
  Search, ExternalLink, AlertTriangle, TrendingUp, Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ScrapingSession, AnalyzedRestaurant, RedFlag, StrengthTag } from '@/lib/types';
import { formatPercent, getTypeEmoji } from '@/lib/utils';
import {
  analyzeRestaurant, deduplicateRestaurants, normalizeCityName,
  getRedFlagLabel, getRedFlagBadge, getStrengthLabel, getStrengthBadge,
  exportEnrichedCSV,
} from '@/lib/scraping-helpers';

export default function RestaurantListPage() {
  const params = useParams();
  const router = useRouter();
  const cityParam = decodeURIComponent(params.city as string);
  const typeParam = decodeURIComponent(params.type as string);

  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('opportunityScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterFlags, setFilterFlags] = useState<RedFlag[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('scraping_sessions')
        .select('*')
        .ilike('city', cityParam)
        .eq('type', typeParam)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setSessions(data.map((r: Record<string, unknown>) => ({
          id: r.id as string, date: r.date as string, task: r.task as string,
          type: r.type as string, city: r.city as string,
          totalFound: r.total_found as number, status: r.status as ScrapingSession['status'],
          data: (r.data as ScrapingSession['data']) ?? [],
          notes: r.notes as string, createdAt: r.created_at as string,
        })));
      }
      setLoading(false);
    }
    load();
  }, [cityParam, typeParam]);

  const allRestaurants = useMemo(() => {
    const deduped = deduplicateRestaurants(sessions);
    return deduped.map(analyzeRestaurant);
  }, [sessions]);

  const filteredData = useMemo(() => {
    let items = [...allRestaurants];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q)
      );
    }

    // Filter by red flags
    if (filterFlags.length > 0) {
      items = items.filter(r => filterFlags.some(f => r.redFlags.includes(f)));
    }

    // Sort
    items.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortField];
      const bv = (b as unknown as Record<string, unknown>)[sortField];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      const as2 = String(av || '');
      const bs2 = String(bv || '');
      return sortAsc ? as2.localeCompare(bs2) : bs2.localeCompare(as2);
    });

    return items;
  }, [allRestaurants, searchTerm, sortField, sortAsc, filterFlags]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(field === 'name'); }
  };

  const toggleFilter = (flag: RedFlag) => {
    setFilterFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    );
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(filteredData, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'text-orange fill-orange' : 'text-text-dim'}`} />
    ));

  const getScoreColor = (score: number) =>
    score >= 60 ? 'text-red' : score >= 35 ? 'text-orange' : 'text-green';

  const getScoreBg = (score: number) =>
    score >= 60 ? 'opportunity-high' : score >= 35 ? 'opportunity-medium' : 'opportunity-low';

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      className="cursor-pointer select-none hover:text-text transition-colors px-4 py-3"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && <span className="text-blue">{sortAsc ? '↑' : '↓'}</span>}
      </div>
    </th>
  );

  // Stats
  const stats = useMemo(() => {
    const total = allRestaurants.length;
    const withSite = allRestaurants.filter(r => r.website && r.website.trim() !== '').length;
    const withPhone = allRestaurants.filter(r => r.phone && r.phone.trim() !== '').length;
    const rated = allRestaurants.filter(r => r.rating > 0);
    const avgRating = rated.length > 0 ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;
    const opportunities = allRestaurants.filter(r => r.opportunityScore >= 40).length;
    return { total, withSite, withPhone, avgRating, opportunities };
  }, [allRestaurants]);

  if (loading) return <div className="p-8 text-text-dim text-sm">Chargement...</div>;

  const normalizedCity = normalizeCityName(cityParam);

  return (
    <div className="p-6 space-y-4 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[11px]">
        <button onClick={() => router.push('/scrapping')} className="breadcrumb-link hover:text-text">
          Villes
        </button>
        <span className="breadcrumb-sep">/</span>
        <button onClick={() => router.push(`/scrapping/ville/${encodeURIComponent(normalizedCity)}`)} className="breadcrumb-link hover:text-text">
          {normalizedCity}
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="text-text text-[12px] font-semibold">{getTypeEmoji(typeParam)} {typeParam}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/scrapping/ville/${encodeURIComponent(normalizedCity)}`)}
          className="p-2 rounded-xl hover:bg-bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getTypeEmoji(typeParam)}</span>
            <h1 className="text-lg font-bold text-text">{typeParam} — {normalizedCity}</h1>
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">
            {stats.total} restaurants &middot; {stats.opportunities} opportunit{stats.opportunities > 1 ? 'és' : 'é'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyJSON} className="btn-secondary flex items-center gap-1.5 text-xs">
            {copyFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
            {copyFeedback ? 'Copié !' : 'JSON'}
          </button>
          <button onClick={() => exportEnrichedCSV(filteredData, normalizedCity, typeParam)} className="btn-primary flex items-center gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Total</p>
          <p className="text-lg font-bold text-blue">{stats.total}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Note Moyenne</p>
          <p className="text-lg font-bold text-orange">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Avec Site Web</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-green">{stats.withSite}</p>
            <p className="text-[10px] text-text-dim mb-0.5">{stats.total > 0 ? formatPercent(stats.withSite / stats.total * 100) : '0%'}</p>
          </div>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Avec Téléphone</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-purple">{stats.withPhone}</p>
            <p className="text-[10px] text-text-dim mb-0.5">{stats.total > 0 ? formatPercent(stats.withPhone / stats.total * 100) : '0%'}</p>
          </div>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Opportunités</p>
          <p className="text-lg font-bold text-red">{stats.opportunities}</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
          <input
            className="lg-input w-full pl-9"
            placeholder="Rechercher un restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-text-dim" />
          {(['no-website', 'no-phone', 'low-rating', 'few-reviews'] as RedFlag[]).map(flag => (
            <button
              key={flag}
              onClick={() => toggleFilter(flag)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-all ${
                filterFlags.includes(flag)
                  ? 'bg-white/10 text-text border border-white/15'
                  : 'bg-white/[0.03] text-text-dim border border-transparent hover:bg-white/[0.06]'
              }`}
            >
              {getRedFlagLabel(flag)}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-text-dim">{filteredData.length} résultats</span>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <th className="px-4 py-3">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">#</span>
                </th>
                <SortHeader field="name">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Restaurant</span>
                </SortHeader>
                <SortHeader field="address">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Adresse</span>
                </SortHeader>
                <SortHeader field="phone">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Téléphone</span>
                </SortHeader>
                <SortHeader field="website">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Site Web</span>
                </SortHeader>
                <SortHeader field="rating">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Note</span>
                </SortHeader>
                <SortHeader field="reviewCount">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Avis</span>
                </SortHeader>
                <th className="px-4 py-3">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Alertes</span>
                </th>
                <th className="px-4 py-3">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Analyse</span>
                </th>
                <SortHeader field="opportunityScore">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Score</span>
                </SortHeader>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((r, i) => (
                <tr
                  key={r.id || i}
                  className="group transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {/* # */}
                  <td className="px-4 py-3 text-[11px] text-text-dim font-mono w-10">{i + 1}</td>

                  {/* Name */}
                  <td className="px-4 py-3 min-w-[180px]">
                    <p className="text-[12px] font-semibold text-text">{r.name}</p>
                    <p className="text-[10px] text-text-dim">{r.city}</p>
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3 min-w-[200px]">
                    <p className="text-[11px] text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {r.address || '—'}
                    </p>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 min-w-[130px]">
                    {r.phone ? (
                      <a href={`tel:${r.phone}`} className="text-[11px] text-text-muted hover:text-blue transition-colors flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {r.phone}
                      </a>
                    ) : (
                      <span className="text-[10px] text-red/60 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Aucun
                      </span>
                    )}
                  </td>

                  {/* Website */}
                  <td className="px-4 py-3 min-w-[100px]">
                    {r.website ? (
                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Voir <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-red/60 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Aucun
                      </span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 min-w-[110px]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex">{renderStars(r.rating)}</div>
                      <span className="text-[12px] font-bold text-orange">{r.rating || '—'}</span>
                    </div>
                  </td>

                  {/* Reviews */}
                  <td className="px-4 py-3 min-w-[70px]">
                    <span className="text-[12px] font-semibold text-text">
                      {(r.reviewCount || 0).toLocaleString('fr-FR')}
                    </span>
                  </td>

                  {/* Red Flags */}
                  <td className="px-4 py-3 min-w-[150px]">
                    <div className="flex flex-wrap gap-1">
                      {r.redFlags.length > 0 ? r.redFlags.map(flag => (
                        <span key={flag} className={`badge text-[8px] ${getRedFlagBadge(flag)}`}>
                          {getRedFlagLabel(flag)}
                        </span>
                      )) : (
                        <span className="text-[10px] text-green">OK</span>
                      )}
                    </div>
                  </td>

                  {/* Strengths */}
                  <td className="px-4 py-3 min-w-[150px]">
                    <div className="flex flex-wrap gap-1">
                      {r.strengths.length > 0 ? r.strengths.map(tag => (
                        <span key={tag} className={`badge text-[8px] ${getStrengthBadge(tag)}`}>
                          {getStrengthLabel(tag)}
                        </span>
                      )) : (
                        <span className="text-[10px] text-text-dim">—</span>
                      )}
                    </div>
                  </td>

                  {/* Opportunity Score */}
                  <td className="px-4 py-3 min-w-[90px]">
                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${getScoreBg(r.opportunityScore)}`}>
                      <div className="flex-1">
                        <div className="lg-progress">
                          <div
                            className="lg-progress-fill"
                            style={{
                              width: `${r.opportunityScore}%`,
                              background: r.opportunityScore >= 60
                                ? 'linear-gradient(90deg, #f87171, #fbbf24)'
                                : r.opportunityScore >= 35
                                ? 'linear-gradient(90deg, #fbbf24, #5e9eff)'
                                : 'linear-gradient(90deg, #34d399, #5e9eff)',
                            }}
                          />
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold ${getScoreColor(r.opportunityScore)}`}>
                        {r.opportunityScore}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-text-dim text-sm">
                    Aucun restaurant trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
