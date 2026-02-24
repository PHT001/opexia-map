'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, Globe, Phone, TrendingUp, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ScrapingSession, TypeAggregate } from '@/lib/types';
import { formatPercent, getTypeEmoji } from '@/lib/utils';
import { aggregateByTypes, normalizeCityName } from '@/lib/scraping-helpers';

export default function CityTypesPage() {
  const params = useParams();
  const router = useRouter();
  const cityParam = decodeURIComponent(params.city as string);

  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('scraping_sessions')
        .select('*')
        .ilike('city', cityParam)
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
  }, [cityParam]);

  const normalizedCity = normalizeCityName(cityParam);

  const typeAggregates = useMemo(() => aggregateByTypes(sessions, cityParam), [sessions, cityParam]);

  const filteredTypes = useMemo(() => {
    if (!searchTerm) return typeAggregates;
    const q = searchTerm.toLowerCase();
    return typeAggregates.filter(t => t.type.toLowerCase().includes(q));
  }, [typeAggregates, searchTerm]);

  // Global city stats
  const cityStats = useMemo(() => {
    const total = typeAggregates.reduce((s, t) => s + t.totalRestaurants, 0);
    const withSite = typeAggregates.reduce((s, t) => s + t.withWebsite, 0);
    const withPhone = typeAggregates.reduce((s, t) => s + t.withPhone, 0);
    const opportunities = typeAggregates.reduce((s, t) => s + t.opportunityCount, 0);
    const rated = typeAggregates.filter(t => t.avgRating > 0);
    const avgRating = rated.length > 0 ? rated.reduce((s, t) => s + t.avgRating, 0) / rated.length : 0;
    return { total, withSite, withPhone, opportunities, avgRating, types: typeAggregates.length };
  }, [typeAggregates]);

  if (loading) return <div className="p-8 text-text-dim text-sm">Chargement...</div>;

  return (
    <div className="p-6 space-y-5 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[11px]">
        <button onClick={() => router.push('/scrapping')} className="breadcrumb-link hover:text-text">
          Villes
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="text-text text-[12px] font-semibold">{normalizedCity}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/scrapping')}
          className="p-2 rounded-xl hover:bg-bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue" /> {normalizedCity}
          </h1>
          <p className="text-[11px] text-text-muted mt-0.5">
            {cityStats.types} type{cityStats.types > 1 ? 's' : ''} de restaurants &middot; {cityStats.total} restaurants au total
          </p>
        </div>
      </div>

      {/* City Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Total Restaurants</p>
          <p className="text-lg font-bold text-blue">{cityStats.total}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Note Moyenne</p>
          <p className="text-lg font-bold text-orange">{cityStats.avgRating > 0 ? cityStats.avgRating.toFixed(1) : '—'}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Avec Site Web</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-green">{cityStats.withSite}</p>
            <p className="text-[10px] text-text-dim mb-0.5">
              {cityStats.total > 0 ? formatPercent(cityStats.withSite / cityStats.total * 100) : '0%'}
            </p>
          </div>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim">Avec Téléphone</p>
          <div className="flex items-end gap-2">
            <p className="text-lg font-bold text-purple">{cityStats.withPhone}</p>
            <p className="text-[10px] text-text-dim mb-0.5">
              {cityStats.total > 0 ? formatPercent(cityStats.withPhone / cityStats.total * 100) : '0%'}
            </p>
          </div>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[9px] text-text-dim flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Opportunités</p>
          <p className="text-lg font-bold text-red">{cityStats.opportunities}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
          <input
            className="lg-input w-full pl-9"
            placeholder="Rechercher un type de restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-[11px] text-text-dim">{filteredTypes.length} type{filteredTypes.length > 1 ? 's' : ''}</span>
      </div>

      {/* Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map(t => (
          <TypeCard
            key={t.type}
            aggregate={t}
            city={normalizedCity}
            onClick={() => router.push(`/scrapping/ville/${encodeURIComponent(normalizedCity)}/${encodeURIComponent(t.type)}`)}
          />
        ))}
        {filteredTypes.length === 0 && (
          <div className="col-span-3 text-center py-16 text-text-dim text-sm">
            Aucun type de restaurant trouvé
          </div>
        )}
      </div>
    </div>
  );
}

function TypeCard({ aggregate: t, city, onClick }: { aggregate: TypeAggregate; city: string; onClick: () => void }) {
  const pctSite = t.totalRestaurants > 0 ? (t.withWebsite / t.totalRestaurants) * 100 : 0;
  const pctPhone = t.totalRestaurants > 0 ? (t.withPhone / t.totalRestaurants) * 100 : 0;
  const noSite = t.totalRestaurants - t.withWebsite;

  return (
    <div
      onClick={onClick}
      className="glass-interactive city-card p-5 rounded-2xl space-y-4"
    >
      {/* Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{getTypeEmoji(t.type)}</span>
          <div>
            <h3 className="text-[14px] font-bold text-text">{t.type}</h3>
            <p className="text-[10px] text-text-dim">{t.totalRestaurants} restaurant{t.totalRestaurants > 1 ? 's' : ''}</p>
          </div>
        </div>
        {t.opportunityCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg opportunity-high">
            <TrendingUp className="w-3 h-3 text-red" />
            <span className="text-[10px] font-bold text-red">{t.opportunityCount}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[9px] text-text-dim flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Note Moy.</p>
          <p className="text-[14px] font-bold text-orange">{t.avgRating > 0 ? t.avgRating.toFixed(1) : '—'}</p>
        </div>
        <div>
          <p className="text-[9px] text-text-dim flex items-center gap-1">Avis Moy.</p>
          <p className="text-[14px] font-bold text-text">{Math.round(t.avgReviews)}</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-text-dim flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Site web
            </span>
            <span className="text-[9px] text-text-muted font-semibold">{formatPercent(pctSite)}</span>
          </div>
          <div className="lg-progress">
            <div
              className="lg-progress-fill"
              style={{
                width: `${pctSite}%`,
                background: pctSite > 60
                  ? 'linear-gradient(90deg, #34d399, #5e9eff)'
                  : 'linear-gradient(90deg, #f87171, #fbbf24)',
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-text-dim flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> Téléphone
            </span>
            <span className="text-[9px] text-text-muted font-semibold">{formatPercent(pctPhone)}</span>
          </div>
          <div className="lg-progress">
            <div
              className="lg-progress-fill"
              style={{
                width: `${pctPhone}%`,
                background: pctPhone > 60
                  ? 'linear-gradient(90deg, #34d399, #a78bfa)'
                  : 'linear-gradient(90deg, #fbbf24, #f87171)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Alert if many without site */}
      {noSite > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red/[0.08] border border-red/[0.12]">
          <AlertTriangle className="w-3 h-3 text-red flex-shrink-0" />
          <span className="text-[10px] text-red/80">
            {noSite} sans site web
          </span>
        </div>
      )}
    </div>
  );
}
