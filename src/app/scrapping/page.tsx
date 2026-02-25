'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, RefreshCw, MapPin, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getScrapingSessions, createScrapingSession } from '@/lib/store';
import { ScrapingSession, ScrapedRestaurant, ScrapingStatus } from '@/lib/types';
import { aggregateByCities } from '@/lib/scraping-helpers';
import { aggregateByDepartments } from '@/lib/idf-departments';
import IleDeFranceMap from '@/components/IleDeFranceMap';
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
  const router = useRouter();

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await getScrapingSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => { reload().then(() => setMounted(true)); }, [reload]);

  // City aggregation → Department aggregation
  const cityAggregates = useMemo(() => aggregateByCities(sessions), [sessions]);
  const departmentData = useMemo(() => aggregateByDepartments(cityAggregates), [cityAggregates]);

  // Global stats
  const globalStats = useMemo(() => {
    const totalCities = cityAggregates.length;
    const totalRestaurants = cityAggregates.reduce((s, c) => s + c.totalRestaurants, 0);
    const totalOpportunities = cityAggregates.reduce((s, c) => s + c.opportunityCount, 0);
    const totalSessions = sessions.length;
    const activeDepts = Array.from(departmentData.values()).filter(d => d.hasData).length;
    return { totalCities, totalRestaurants, totalOpportunities, totalSessions, activeDepts };
  }, [cityAggregates, sessions, departmentData]);

  const handleNavigateToCity = useCallback((city: string) => {
    router.push(`/scrapping/ville/${encodeURIComponent(city)}`);
  }, [router]);

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
            <MapPin className="w-5 h-5 text-red" />
            Scrapping — Île-de-France
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Ciblage commercial par département et type de restaurant</p>
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
      <div className="grid grid-cols-5 gap-3">
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[10px] text-text-dim">Départements</p>
          <p className="text-lg font-bold text-red mt-0.5">{globalStats.activeDepts}<span className="text-[10px] text-text-dim font-normal">/8</span></p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[10px] text-text-dim">Villes</p>
          <p className="text-lg font-bold text-blue mt-0.5">{globalStats.totalCities}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[10px] text-text-dim">Restaurants</p>
          <p className="text-lg font-bold text-text mt-0.5">{globalStats.totalRestaurants}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
          <p className="text-[10px] text-text-dim flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Opportunités</p>
          <p className="text-lg font-bold text-red mt-0.5">{globalStats.totalOpportunities}</p>
        </div>
        <div className="glass-interactive p-3 rounded-xl">
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

      {/* ═══ CARTE IDF — PLEIN ÉCRAN ═══ */}
      <div className="relative -mx-6 -mb-2">
        {/* Légende flottante en haut à droite */}
        <div className="absolute top-4 right-6 z-10 flex items-center gap-4 text-[10px] text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'rgba(248,113,113,0.5)', boxShadow: '0 0 6px rgba(248,113,113,0.4)' }} />
            Exploré
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
            Non exploré
          </span>
        </div>

        {/* Titre flottant en haut à gauche */}
        <div className="absolute top-4 left-6 z-10">
          <p className="text-[10px] text-text-dim uppercase tracking-[0.15em] font-medium">Île-de-France</p>
          <p className="text-[9px] text-text-dim/50 mt-0.5">Cliquez sur un département pour explorer</p>
        </div>

        {/* Map — libre, sans cadre */}
        <IleDeFranceMap
          departmentData={departmentData}
          onNavigateToCity={handleNavigateToCity}
        />
      </div>

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
