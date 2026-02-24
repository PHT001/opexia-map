'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, RefreshCw, MapPin, Star, Globe, Phone, TrendingUp, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getScrapingSessions, createScrapingSession, updateScrapingSession } from '@/lib/store';
import { ScrapingSession, ScrapedRestaurant, ScrapingStatus, CityAggregate } from '@/lib/types';
import { formatPercent, getTypeEmoji } from '@/lib/utils';
import { aggregateByCities } from '@/lib/scraping-helpers';
import Modal from '@/components/Modal';

const RESTAURANT_TYPES = ['Kebab', 'Pizza', 'Burger', 'Sushi', 'Tacos', 'Indien', 'Chinois', 'Thaï', 'Italien', 'Bistro', 'Japonais', 'Mexicain', 'Libanais', 'Autre'];

const emptySession = {
  date: new Date().toISOString().split('T')[0],
  task: '',
  type: 'Kebab',
  city: '',
  totalFound: 0,
  status: 'in-progress' as ScrapingStatus,
  data: [] as ScrapedRestaurant[],
  notes: '',
};

export default function ScrappingPage() {
  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptySession);
  const [jsonInput, setJsonInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getScrapingSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => { reload().then(() => setMounted(true)); }, [reload]);

  // City aggregation
  const cityAggregates = useMemo(() => aggregateByCities(sessions), [sessions]);

  // Search filter
  const filteredCities = useMemo(() => {
    if (!searchTerm) return cityAggregates;
    const q = searchTerm.toLowerCase();
    return cityAggregates.filter(c => c.city.toLowerCase().includes(q));
  }, [cityAggregates, searchTerm]);

  // Global stats
  const globalStats = useMemo(() => {
    const totalCities = cityAggregates.length;
    const totalRestaurants = cityAggregates.reduce((s, c) => s + c.totalRestaurants, 0);
    const totalOpportunities = cityAggregates.reduce((s, c) => s + c.opportunityCount, 0);
    const totalSessions = sessions.length;
    return { totalCities, totalRestaurants, totalOpportunities, totalSessions };
  }, [cityAggregates, sessions]);

  const openCreate = () => {
    setForm(emptySession);
    setJsonInput('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.city || !form.type) return;

    let parsedData: ScrapedRestaurant[] = form.data;
    if (jsonInput.trim()) {
      try { parsedData = JSON.parse(jsonInput); } catch { /* keep existing */ }
    }

    const task = form.task || `${form.type} scraping - ${form.city}`;
    await createScrapingSession({
      ...form,
      task,
      data: parsedData,
      totalFound: parsedData.length > 0 ? parsedData.length : form.totalFound,
    });
    await reload();
    setShowModal(false);
  };

  if (!mounted) return <div className="p-8 text-text-dim text-sm">Chargement...</div>;

  return (
    <div className="p-6 space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Search className="w-5 h-5 text-blue" />
            Scrapping
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Ciblage commercial par ville et type de restaurant</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} className="btn-secondary flex items-center gap-1.5 text-xs" disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Rafraîchir
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Nouvelle Session
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="glass-interactive p-4 rounded-xl">
          <p className="text-[10px] text-text-dim">Villes</p>
          <p className="text-lg font-bold text-blue mt-0.5">{globalStats.totalCities}</p>
        </div>
        <div className="glass-interactive p-4 rounded-xl">
          <p className="text-[10px] text-text-dim">Restaurants</p>
          <p className="text-lg font-bold text-text mt-0.5">{globalStats.totalRestaurants}</p>
        </div>
        <div className="glass-interactive p-4 rounded-xl">
          <p className="text-[10px] text-text-dim flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Opportunités</p>
          <p className="text-lg font-bold text-red mt-0.5">{globalStats.totalOpportunities}</p>
        </div>
        <div className="glass-interactive p-4 rounded-xl">
          <p className="text-[10px] text-text-dim">Sessions</p>
          <p className="text-lg font-bold text-purple mt-0.5">{globalStats.totalSessions}</p>
        </div>
      </div>

      {/* API Info */}
      <div className="glass-inset p-3 rounded-xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
        <p className="text-[11px] text-text-muted">
          API : <code className="text-blue bg-bg-surface px-1.5 py-0.5 rounded text-[10px]">POST https://reelcrm.vercel.app/api/scraping</code>
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
          <input
            className="lg-input w-full pl-9"
            placeholder="Rechercher une ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-[11px] text-text-dim">{filteredCities.length} ville{filteredCities.length > 1 ? 's' : ''}</span>
      </div>

      {/* City Cards Grid */}
      {filteredCities.length === 0 ? (
        <div className="glass-inset p-12 text-center rounded-2xl">
          <MapPin className="w-8 h-8 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-1">Aucune ville trouvée</p>
          <p className="text-xs text-text-dim">Créez une session ou utilisez l&apos;API pour ajouter des données de scraping</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCities.map(city => (
            <CityCard
              key={city.city}
              city={city}
              onClick={() => router.push(`/scrapping/ville/${encodeURIComponent(city.city)}`)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle Session de Scraping" size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-text-dim mb-1">Type de restaurant *</label>
              <select className="lg-select w-full" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                {RESTAURANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-text-dim mb-1">Ville *</label>
              <input className="lg-input w-full" placeholder="Paris, Lyon, Vincennes..." value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-text-dim mb-1">Date</label>
              <input className="lg-input w-full" type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] text-text-dim mb-1">Statut</label>
              <select className="lg-select w-full" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as ScrapingStatus }))}>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="error">Erreur</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Tâche (auto-générée si vide)</label>
            <input className="lg-input w-full" placeholder={`${form.type} scraping - ${form.city || '...'}`} value={form.task} onChange={(e) => setForm(f => ({ ...f, task: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Données JSON (tableau de restaurants)</label>
            <textarea
              className="lg-input w-full h-32 resize-none font-mono text-[11px]"
              placeholder={'[\n  {\n    "id": 1,\n    "name": "Kebab Palace",\n    "address": "12 rue ...",\n    "city": "Paris",\n    "phone": "01 23 45 67 89",\n    "website": "",\n    "rating": 4.5,\n    "reviewCount": 120,\n    "reviews": [],\n    "scrapingDate": "2026-02-24",\n    "status": "verified"\n  }\n]'}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Notes</label>
            <textarea className="lg-input w-full h-16 resize-none" placeholder="Remarques..." value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
          <button className="btn-primary" onClick={handleSubmit}>Créer</button>
        </div>
      </Modal>
    </div>
  );
}

// ── City Card Component ──
function CityCard({ city, onClick }: { city: CityAggregate; onClick: () => void }) {
  const pctSite = city.totalRestaurants > 0 ? (city.withWebsite / city.totalRestaurants) * 100 : 0;
  const pctPhone = city.totalRestaurants > 0 ? (city.withPhone / city.totalRestaurants) * 100 : 0;
  const noSite = city.totalRestaurants - city.withWebsite;

  return (
    <div
      onClick={onClick}
      className="glass-interactive city-card p-5 rounded-2xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(94,158,255,0.1)', border: '1px solid rgba(94,158,255,0.15)' }}>
            <MapPin className="w-5 h-5 text-blue" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-text">{city.city}</h3>
            <p className="text-[10px] text-text-dim">{city.totalRestaurants} restaurant{city.totalRestaurants > 1 ? 's' : ''}</p>
          </div>
        </div>
        {city.opportunityCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg opportunity-high">
            <TrendingUp className="w-3 h-3 text-red" />
            <span className="text-[10px] font-bold text-red">{city.opportunityCount}</span>
          </div>
        )}
      </div>

      {/* Types pills */}
      <div className="flex flex-wrap gap-1">
        {city.types.slice(0, 6).map(type => (
          <span key={type} className="glass-pill px-2 py-0.5 text-[9px] text-text-muted flex items-center gap-1">
            {getTypeEmoji(type)} {type}
          </span>
        ))}
        {city.types.length > 6 && (
          <span className="glass-pill px-2 py-0.5 text-[9px] text-text-dim">+{city.types.length - 6}</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[9px] text-text-dim flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Note</p>
          <p className="text-[14px] font-bold text-orange">{city.avgRating > 0 ? city.avgRating.toFixed(1) : '—'}</p>
        </div>
        <div>
          <p className="text-[9px] text-text-dim flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> Site</p>
          <p className="text-[14px] font-bold text-green">{formatPercent(pctSite)}</p>
        </div>
        <div>
          <p className="text-[9px] text-text-dim flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> Tel</p>
          <p className="text-[14px] font-bold text-purple">{formatPercent(pctPhone)}</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-text-dim">Présence digitale</span>
            <span className="text-[9px] text-text-muted font-semibold">{city.withWebsite}/{city.totalRestaurants}</span>
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
      </div>

      {/* Alert */}
      {noSite > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red/[0.08] border border-red/[0.12]">
          <AlertTriangle className="w-3 h-3 text-red flex-shrink-0" />
          <span className="text-[10px] text-red/80">{noSite} sans site web — cibles potentielles</span>
        </div>
      )}
    </div>
  );
}
