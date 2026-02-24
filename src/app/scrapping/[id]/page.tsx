'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Copy, CheckCircle2, Star, Phone, Globe, MapPin, Clock, ExternalLink, Search, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ScrapingSession, ScrapedRestaurant } from '@/lib/types';
import { formatDate, getTypeEmoji } from '@/lib/utils';
import { normalizeCityName } from '@/lib/scraping-helpers';

export default function ScrapingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<ScrapingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('scraping_sessions')
        .select('*')
        .eq('id', id)
        .single();
      if (data && !error) {
        setSession({
          id: data.id, date: data.date, task: data.task, type: data.type, city: data.city,
          totalFound: data.total_found, status: data.status, data: data.data ?? [],
          notes: data.notes, createdAt: data.created_at,
        });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const filteredData = useMemo(() => {
    if (!session) return [];
    let items = [...session.data];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q)
      );
    }

    // Sort
    items.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortField];
      const bv = (b as unknown as Record<string, unknown>)[sortField];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      const as = String(av || '');
      const bs = String(bv || '');
      return sortAsc ? as.localeCompare(bs) : bs.localeCompare(as);
    });

    return items;
  }, [session, searchTerm, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const exportCSV = () => {
    if (!session || session.data.length === 0) return;
    const headers = ['#', 'Nom', 'Adresse', 'Ville', 'Téléphone', 'Site Web', 'Note', 'Nb Avis', 'Avis 1', 'Note Avis 1', 'Avis 2', 'Note Avis 2', 'Date Scraping', 'Statut'];
    const rows = session.data.map((r, i) => [
      i + 1,
      `"${r.name || ''}"`,
      `"${r.address || ''}"`,
      `"${r.city || ''}"`,
      r.phone || '',
      r.website || '',
      r.rating || '',
      r.reviewCount || '',
      `"${r.reviews?.[0]?.text || ''}"`,
      r.reviews?.[0]?.rating || '',
      `"${r.reviews?.[1]?.text || ''}"`,
      r.reviews?.[1]?.rating || '',
      r.scrapingDate || '',
      r.status || '',
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraping-${session.type}-${session.city}-${session.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    if (!session) return;
    navigator.clipboard.writeText(JSON.stringify(session.data, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? 'text-orange fill-orange' : 'text-text-dim'}`} />
    ));

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      className="cursor-pointer select-none hover:text-text transition-colors"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && <span className="text-blue">{sortAsc ? '↑' : '↓'}</span>}
      </div>
    </th>
  );

  if (loading) return <div className="p-8 text-text-dim text-sm">Chargement...</div>;
  if (!session) return (
    <div className="p-8 text-center">
      <p className="text-text-muted">Session introuvable</p>
      <button onClick={() => router.push('/scrapping')} className="btn-secondary mt-4">Retour</button>
    </div>
  );

  const typeEmoji = getTypeEmoji(session.type);
  const normalizedCity = normalizeCityName(session.city);

  return (
    <div className="p-6 space-y-4 fade-in">
      {/* Breadcrumb + Link to city view */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px]">
          <button onClick={() => router.push('/scrapping')} className="breadcrumb-link hover:text-text">Villes</button>
          <span className="breadcrumb-sep">/</span>
          <button onClick={() => router.push(`/scrapping/ville/${encodeURIComponent(normalizedCity)}`)} className="breadcrumb-link hover:text-text">{normalizedCity}</button>
          <span className="breadcrumb-sep">/</span>
          <span className="text-text text-[12px] font-semibold">Session</span>
        </div>
        <button
          onClick={() => router.push(`/scrapping/ville/${encodeURIComponent(normalizedCity)}/${encodeURIComponent(session.type)}`)}
          className="btn-secondary flex items-center gap-1.5 text-[11px]"
        >
          <Eye className="w-3 h-3" /> Vue {session.type} — {normalizedCity}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/scrapping')} className="p-2 rounded-xl hover:bg-bg-surface transition-colors">
          <ArrowLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeEmoji}</span>
            <h1 className="text-lg font-bold text-text">{session.task}</h1>
          </div>
          <div className="flex items-center gap-4 mt-1 text-[11px] text-text-muted">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.city}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(session.date)}</span>
            <span className={`badge text-[10px] ${session.status === 'completed' ? 'badge-green' : session.status === 'error' ? 'badge-red' : 'badge-orange'}`}>
              {session.status === 'completed' ? 'Terminé' : session.status === 'error' ? 'Erreur' : 'En cours'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyJSON} className="btn-secondary flex items-center gap-1.5 text-xs">
            {copyFeedback ? <CheckCircle2 className="w-3.5 h-3.5 text-green" /> : <Copy className="w-3.5 h-3.5" />}
            {copyFeedback ? 'Copié !' : 'JSON'}
          </button>
          <button onClick={exportCSV} className="btn-primary flex items-center gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        <div className="glass-interactive p-3">
          <p className="text-[9px] text-text-dim">Total</p>
          <p className="text-lg font-bold text-blue">{session.totalFound}</p>
        </div>
        <div className="glass-interactive p-3">
          <p className="text-[9px] text-text-dim">Note Moyenne</p>
          <p className="text-lg font-bold text-orange">
            {session.data.length > 0 ? (session.data.reduce((s, r) => s + (r.rating || 0), 0) / session.data.length).toFixed(1) : '—'}
          </p>
        </div>
        <div className="glass-interactive p-3">
          <p className="text-[9px] text-text-dim">Total Avis</p>
          <p className="text-lg font-bold text-text">
            {session.data.reduce((s, r) => s + (r.reviewCount || 0), 0).toLocaleString('fr-FR')}
          </p>
        </div>
        <div className="glass-interactive p-3">
          <p className="text-[9px] text-text-dim">Avec Téléphone</p>
          <p className="text-lg font-bold text-green">
            {session.data.filter(r => r.phone && r.phone !== '').length}
          </p>
        </div>
        <div className="glass-interactive p-3">
          <p className="text-[9px] text-text-dim">Avec Site Web</p>
          <p className="text-lg font-bold text-purple">
            {session.data.filter(r => r.website && r.website !== '').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
          <input
            className="lg-input w-full pl-9"
            placeholder="Rechercher un restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-[11px] text-text-dim">{filteredData.length} résultats</span>
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="glass-inset p-3 rounded-xl">
          <p className="text-[11px] text-text-muted">{session.notes}</p>
        </div>
      )}

      {/* Excel-like Table */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <SortHeader field="id">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">#</span>
                </SortHeader>
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
                <th><span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Extraits Avis</span></th>
                <SortHeader field="status">
                  <span className="text-[10px] text-text-dim font-semibold uppercase tracking-wider">Statut</span>
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
                  <td className="px-4 py-3 text-[11px] text-text-dim font-mono w-10">
                    {i + 1}
                  </td>

                  {/* Restaurant name */}
                  <td className="px-4 py-3 min-w-[180px]">
                    <p className="text-[12px] font-semibold text-text">{r.name}</p>
                    <p className="text-[10px] text-text-dim">{r.city}</p>
                  </td>

                  {/* Address */}
                  <td className="px-4 py-3 min-w-[220px]">
                    <p className="text-[11px] text-text-muted">{r.address}</p>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 min-w-[130px]">
                    {r.phone ? (
                      <a href={`tel:${r.phone}`} className="text-[11px] text-text-muted hover:text-blue transition-colors flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {r.phone}
                      </a>
                    ) : <span className="text-[11px] text-text-dim">—</span>}
                  </td>

                  {/* Website */}
                  <td className="px-4 py-3 min-w-[100px]">
                    {r.website ? (
                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Voir
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : <span className="text-[11px] text-text-dim">—</span>}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex">{renderStars(r.rating)}</div>
                      <span className="text-[12px] font-bold text-orange">{r.rating}</span>
                    </div>
                  </td>

                  {/* Review Count */}
                  <td className="px-4 py-3 min-w-[80px]">
                    <span className="text-[12px] font-semibold text-text">
                      {(r.reviewCount || 0).toLocaleString('fr-FR')}
                    </span>
                  </td>

                  {/* Reviews excerpt */}
                  <td className="px-4 py-3 min-w-[250px] max-w-[350px]">
                    {r.reviews && r.reviews.length > 0 ? (
                      <div className="space-y-1">
                        {r.reviews.slice(0, 2).map((rev, ri) => (
                          <div key={ri} className="flex items-start gap-1.5">
                            <div className="flex mt-0.5 flex-shrink-0">{renderStars(rev.rating)}</div>
                            <p className="text-[10px] text-text-muted line-clamp-1">{rev.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-[10px] text-text-dim">Aucun avis</span>}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`badge text-[9px] ${r.status === 'verified' ? 'badge-green' : 'badge-ghost'}`}>
                      {r.status === 'verified' ? 'Vérifié' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
