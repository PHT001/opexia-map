'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, RefreshCw, MapPin, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getScrapingSessions, createScrapingSession } from '@/lib/store';
import { ScrapingSession, ScrapedRestaurant, ScrapingStatus } from '@/lib/types';
import { aggregateByCities } from '@/lib/scraping-helpers';
import { aggregateByDepartments } from '@/lib/idf-departments';
import { aggregateByArrondissements } from '@/lib/paris-arrondissements';
import { aggregateByCommunesVDM } from '@/lib/val-de-marne-communes';
import { aggregateByCommunesSSD } from '@/lib/seine-saint-denis-communes';
import { aggregateByCommunesHDS } from '@/lib/hauts-de-seine-communes';
import { aggregateByCommunesESS } from '@/lib/essonne-communes';
import { aggregateByCommunesSEM } from '@/lib/seine-et-marne-communes';
import { aggregateByCommunesYVL } from '@/lib/yvelines-communes';
import { aggregateByCommunesVDO } from '@/lib/val-d-oise-communes';
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
  const [mapZoomed, setMapZoomed] = useState(false);
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

  // City aggregation → Department aggregation → Arrondissement aggregation → Commune aggregations
  const cityAggregates = useMemo(() => aggregateByCities(sessions), [sessions]);
  const departmentData = useMemo(() => aggregateByDepartments(cityAggregates), [cityAggregates]);
  const arrondissementData = useMemo(() => aggregateByArrondissements(cityAggregates), [cityAggregates]);

  // Build the unified communeData Map<deptCode, Map<cityName, CommuneAggregate>>
  const communeData = useMemo(() => {
    const map = new Map<string, Map<string, { name: string; shortName: string; cityName: string; totalRestaurants: number; totalOpportunities: number; types: string[]; avgRating: number; hasData: boolean }>>();
    map.set('94', aggregateByCommunesVDM(cityAggregates));
    map.set('93', aggregateByCommunesSSD(cityAggregates));
    map.set('92', aggregateByCommunesHDS(cityAggregates));
    map.set('91', aggregateByCommunesESS(cityAggregates));
    map.set('77', aggregateByCommunesSEM(cityAggregates));
    map.set('78', aggregateByCommunesYVL(cityAggregates));
    map.set('95', aggregateByCommunesVDO(cityAggregates));
    return map;
  }, [cityAggregates]);

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
    <div className="h-screen flex flex-col fade-in overflow-hidden">
      {/* Header compact — masqué quand zoomé */}
      <div className={`flex-shrink-0 px-6 pt-3 pb-2 flex items-center gap-4 transition-all duration-300 ${mapZoomed ? 'opacity-0 max-h-0 py-0 pt-0 pb-0 overflow-hidden' : 'opacity-100 max-h-20'}`}>
        <h1 className="text-base font-bold text-text flex items-center gap-2 whitespace-nowrap">
          <MapPin className="w-4 h-4 text-red" />
          Scrapping — IDF
        </h1>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="glass-interactive px-2 py-1 rounded-md"><span className="text-text-dim">Dép.</span> <span className="font-bold text-red">{globalStats.activeDepts}/8</span></span>
          <span className="glass-interactive px-2 py-1 rounded-md"><span className="text-text-dim">Villes</span> <span className="font-bold text-blue">{globalStats.totalCities}</span></span>
          <span className="glass-interactive px-2 py-1 rounded-md"><span className="text-text-dim">Restos</span> <span className="font-bold text-text">{globalStats.totalRestaurants}</span></span>
          <span className="glass-interactive px-2 py-1 rounded-md"><span className="text-text-dim flex items-center gap-0.5 inline-flex"><TrendingUp className="w-2.5 h-2.5" /> Opp.</span> <span className="font-bold text-red">{globalStats.totalOpportunities}</span></span>
          <span className="glass-interactive px-2 py-1 rounded-md"><span className="text-text-dim">Sessions</span> <span className="font-bold text-purple">{globalStats.totalSessions}</span></span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={reload} className="btn-secondary flex items-center gap-1.5 text-xs" disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ═══ CARTE IDF — REMPLIT TOUT L'ESPACE RESTANT ═══ */}
      <div className="flex-1 relative min-h-0">
        {/* Légende flottante en haut à droite — masquée quand zoomé */}
        <div className={`absolute top-2 right-6 z-10 flex items-center gap-4 text-[10px] text-text-dim transition-opacity duration-300 ${mapZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'rgba(248,113,113,0.5)', boxShadow: '0 0 6px rgba(248,113,113,0.4)' }} />
            Exploré
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
            Non exploré
          </span>
        </div>

        {/* Titre flottant en haut à gauche — masqué quand zoomé */}
        <div className={`absolute top-2 left-6 z-10 transition-opacity duration-300 ${mapZoomed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <p className="text-[10px] text-text-dim uppercase tracking-[0.15em] font-medium">Île-de-France</p>
          <p className="text-[9px] text-text-dim/50 mt-0.5">Cliquez sur un département pour explorer</p>
        </div>

        {/* Map — remplit tout l'espace */}
        <div className="w-full h-full">
          <IleDeFranceMap
            departmentData={departmentData}
            onNavigateToCity={handleNavigateToCity}
            arrondissementData={arrondissementData}
            communeData={communeData}
            onZoomChange={setMapZoomed}
          />
        </div>
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
