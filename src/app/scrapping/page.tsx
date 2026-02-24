'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Trash2, Eye, EyeOff, Download, Copy, CheckCircle2, Clock, AlertTriangle, Star, MapPin, Phone, Globe, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getScrapingSessions, createScrapingSession, updateScrapingSession, deleteScrapingSession } from '@/lib/store';
import { ScrapingSession, ScrapedRestaurant, ScrapingStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';

const RESTAURANT_TYPES = ['Kebab', 'Pizza', 'Burger', 'Sushi', 'Tacos', 'Indien', 'Chinois', 'Thaï', 'Italien', 'Autre'];

const statusConfig: Record<ScrapingStatus, { label: string; badge: string; icon: typeof Clock }> = {
  'in-progress': { label: 'En cours', badge: 'badge-orange', icon: Clock },
  'completed':   { label: 'Terminé', badge: 'badge-green', icon: CheckCircle2 },
  'error':       { label: 'Erreur', badge: 'badge-red', icon: AlertTriangle },
};

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
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ScrapingSession | null>(null);
  const [form, setForm] = useState(emptySession);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const reload = () => setSessions(getScrapingSessions());
  useEffect(() => { reload(); setMounted(true); }, []);

  const stats = useMemo(() => ({
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    inProgress: sessions.filter(s => s.status === 'in-progress').length,
    totalRestaurants: sessions.reduce((s, ses) => s + ses.totalFound, 0),
  }), [sessions]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptySession);
    setJsonInput('');
    setShowModal(true);
  };

  const openEdit = (s: ScrapingSession) => {
    setEditing(s);
    setForm({
      date: s.date,
      task: s.task,
      type: s.type,
      city: s.city,
      totalFound: s.totalFound,
      status: s.status,
      data: s.data,
      notes: s.notes,
    });
    setJsonInput(s.data.length > 0 ? JSON.stringify(s.data, null, 2) : '');
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.city || !form.type) return;

    let parsedData: ScrapedRestaurant[] = form.data;
    if (jsonInput.trim()) {
      try {
        parsedData = JSON.parse(jsonInput);
      } catch {
        // keep existing data if JSON is invalid
      }
    }

    const task = form.task || `${form.type} scraping - ${form.city}`;
    const payload = {
      ...form,
      task,
      data: parsedData,
      totalFound: parsedData.length > 0 ? parsedData.length : form.totalFound,
    };

    if (editing) {
      updateScrapingSession(editing.id, payload);
    } else {
      createScrapingSession(payload);
    }
    reload();
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteScrapingSession(id);
    reload();
    if (expandedId === id) setExpandedId(null);
  };

  const handleStatusChange = (id: string, status: ScrapingStatus) => {
    updateScrapingSession(id, { status });
    reload();
  };

  const exportCSV = (session: ScrapingSession) => {
    if (session.data.length === 0) return;
    const headers = ['#ID', 'Nom', 'Adresse', 'Ville', 'Téléphone', 'Site Web', 'Note Google', 'Nb Avis', 'Statut'];
    const rows = session.data.map((r, i) => [
      i + 1, r.name, r.address, r.city, r.phone, r.website, r.rating, r.reviewCount, r.status,
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraping-${session.type}-${session.city}-${session.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = (session: ScrapingSession) => {
    navigator.clipboard.writeText(JSON.stringify(session.data, null, 2));
    setCopyFeedback(session.id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.round(rating) ? 'text-orange fill-orange' : 'text-text-dim'}`}
      />
    ));
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
          <p className="text-xs text-text-muted mt-0.5">Sessions de scraping restaurants</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nouvelle Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: stats.total, color: 'text-text' },
          { label: 'En Cours', value: stats.inProgress, color: 'text-orange' },
          { label: 'Terminées', value: stats.completed, color: 'text-green' },
          { label: 'Restaurants Trouvés', value: stats.totalRestaurants, color: 'text-blue' },
        ].map((s, i) => (
          <div key={i} className="glass-interactive p-4">
            <p className="text-[10px] text-text-dim">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="glass-inset p-12 text-center">
          <Search className="w-8 h-8 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-1">Aucune session de scraping</p>
          <p className="text-xs text-text-dim">Créez votre première session pour commencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(session => {
            const cfg = statusConfig[session.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === session.id;

            return (
              <div key={session.id} className="glass-interactive rounded-2xl overflow-hidden">
                {/* Session row */}
                <div className="p-4 flex items-center gap-4">
                  {/* Type icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'rgba(94,158,255,0.1)', border: '1px solid rgba(94,158,255,0.15)' }}
                  >
                    {session.type === 'Kebab' ? '🥙' :
                     session.type === 'Pizza' ? '🍕' :
                     session.type === 'Burger' ? '🍔' :
                     session.type === 'Sushi' ? '🍣' :
                     session.type === 'Tacos' ? '🌮' :
                     session.type === 'Indien' ? '🍛' :
                     session.type === 'Chinois' ? '🥡' :
                     session.type === 'Thaï' ? '🍜' :
                     session.type === 'Italien' ? '🍝' : '🔍'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text truncate">{session.task}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {session.city}
                      </span>
                      <span className="text-[11px] text-text-dim">{formatDate(session.date)}</span>
                    </div>
                  </div>

                  {/* Total found */}
                  <div className="text-center flex-shrink-0">
                    <p className="text-base font-bold text-blue">{session.totalFound}</p>
                    <p className="text-[9px] text-text-dim">trouvés</p>
                  </div>

                  {/* Status */}
                  <span className={`badge ${cfg.badge} flex items-center gap-1 flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {session.data.length > 0 && (
                      <>
                        <button onClick={() => exportCSV(session)} className="p-1.5 rounded-lg hover:bg-bg-surface transition-colors" title="Export CSV">
                          <Download className="w-3.5 h-3.5 text-text-dim" />
                        </button>
                        <button onClick={() => copyJSON(session)} className="p-1.5 rounded-lg hover:bg-bg-surface transition-colors" title="Copier JSON">
                          {copyFeedback === session.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5 text-text-dim" />}
                        </button>
                      </>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : session.id)} className="p-1.5 rounded-lg hover:bg-bg-surface transition-colors" title="Voir détails">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-dim" /> : <ChevronDown className="w-3.5 h-3.5 text-text-dim" />}
                    </button>
                    <button onClick={() => openEdit(session)} className="p-1.5 rounded-lg hover:bg-bg-surface transition-colors" title="Modifier">
                      <Search className="w-3.5 h-3.5 text-text-dim" />
                    </button>
                    <button onClick={() => handleDelete(session.id)} className="p-1.5 rounded-lg hover:bg-bg-surface transition-colors" title="Supprimer">
                      <Trash2 className="w-3.5 h-3.5 text-red" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {session.notes && !isExpanded && (
                  <div className="px-4 pb-3">
                    <p className="text-[11px] text-text-dim italic">{session.notes}</p>
                  </div>
                )}

                {/* Expanded: Restaurant data */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    {/* Quick status change */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-dim">Statut :</span>
                      {(['in-progress', 'completed', 'error'] as ScrapingStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(session.id, st)}
                          className={`badge text-[10px] cursor-pointer transition-all ${session.status === st ? statusConfig[st].badge : 'badge-ghost opacity-50 hover:opacity-100'}`}
                        >
                          {statusConfig[st].label}
                        </button>
                      ))}
                    </div>

                    {session.notes && (
                      <div className="glass-inset p-3 rounded-xl">
                        <p className="text-[10px] text-text-dim mb-1">Notes</p>
                        <p className="text-[12px] text-text-muted">{session.notes}</p>
                      </div>
                    )}

                    {session.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full lg-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Nom</th>
                              <th>Adresse</th>
                              <th>Téléphone</th>
                              <th>Note</th>
                              <th>Avis</th>
                              <th>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {session.data.map((r, i) => (
                              <tr key={r.id || i}>
                                <td className="text-text-dim text-[11px]">{i + 1}</td>
                                <td>
                                  <div>
                                    <p className="text-[12px] font-semibold text-text">{r.name}</p>
                                    {r.website && (
                                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue hover:underline flex items-center gap-0.5">
                                        <Globe className="w-2.5 h-2.5" /> Site web
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td className="text-text-muted text-[11px]">{r.address}</td>
                                <td>
                                  {r.phone ? (
                                    <a href={`tel:${r.phone}`} className="text-[11px] text-text-muted hover:text-text flex items-center gap-1">
                                      <Phone className="w-3 h-3" /> {r.phone}
                                    </a>
                                  ) : <span className="text-text-dim text-[11px]">—</span>}
                                </td>
                                <td>
                                  <div className="flex items-center gap-1">
                                    <div className="flex">{renderStars(r.rating)}</div>
                                    <span className="text-[11px] text-text-muted">{r.rating}</span>
                                  </div>
                                </td>
                                <td className="text-text-muted text-[11px]">{r.reviewCount}</td>
                                <td>
                                  <span className={`badge text-[9px] ${r.status === 'verified' ? 'badge-green' : 'badge-ghost'}`}>
                                    {r.status === 'verified' ? 'Vérifié' : 'En attente'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="glass-inset p-6 text-center rounded-xl">
                        <p className="text-[11px] text-text-dim">Aucune donnée scrapée pour cette session</p>
                        <p className="text-[10px] text-text-dim mt-1">Modifiez la session pour ajouter des données JSON</p>
                      </div>
                    )}

                    {/* Reviews preview for first restaurant with reviews */}
                    {session.data.some(r => r.reviews?.length > 0) && (
                      <div className="glass-inset p-3 rounded-xl">
                        <p className="text-[10px] text-text-dim mb-2">Aperçu des avis</p>
                        <div className="grid grid-cols-2 gap-2">
                          {session.data
                            .flatMap(r => (r.reviews || []).map(rev => ({ ...rev, restaurant: r.name })))
                            .slice(0, 4)
                            .map((rev, i) => (
                              <div key={i} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex items-center gap-1 mb-1">
                                  <div className="flex">{renderStars(rev.rating)}</div>
                                  <span className="text-[10px] text-text-dim ml-auto">{rev.restaurant}</span>
                                </div>
                                <p className="text-[10px] text-text-muted line-clamp-2">{rev.text}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier la Session' : 'Nouvelle Session de Scraping'} size="lg">
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
              <input className="lg-input w-full" placeholder="Paris, Lyon, Marseille..." value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
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
            <label className="block text-[10px] text-text-dim mb-1">Total trouvé (manuel)</label>
            <input className="lg-input w-full" type="number" value={form.totalFound} onChange={(e) => setForm(f => ({ ...f, totalFound: Number(e.target.value) }))} />
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
            <textarea className="lg-input w-full h-16 resize-none" placeholder="Remarques, problèmes rencontrés..." value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
          <button className="btn-primary" onClick={handleSubmit}>{editing ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </Modal>
    </div>
  );
}
