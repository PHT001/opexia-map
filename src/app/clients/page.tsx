'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Filter, Building2, ArrowUpDown, Trash2, Pencil } from 'lucide-react';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/store';
import { Client, ClientStatus, PipelineStage } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusBadge,
  getPipelineLabel,
  getPipelineBadge,
} from '@/lib/utils';
import Link from 'next/link';
import Modal from '@/components/Modal';

const emptyClient = {
  entreprise: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  secteur: '',
  status: 'prospect' as ClientStatus,
  pipeline_stage: 'premier-contact' as PipelineStage,
  montant_mensuel: 0,
  dernier_contact: new Date().toISOString().split('T')[0],
  date_creation: new Date().toISOString().split('T')[0],
  notes: '',
  adresse: null as string | null,
  site_web: null as string | null,
  source: null as string | null,
  avatar: null as string | null,
  services_souscrits: [] as string[],
  service_pricing: [] as import('@/lib/types').ServicePricing[],
};

type FormState = typeof emptyClient;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'entreprise' | 'montant_mensuel' | 'dernier_contact'>('entreprise');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<FormState>(emptyClient);
  const [submitting, setSubmitting] = useState(false);

  const reload = async () => {
    setClients(await getClients());
  };

  useEffect(() => {
    (async () => {
      await reload();
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = clients.filter((c) => {
      const matchSearch =
        search === '' ||
        c.entreprise.toLowerCase().includes(search.toLowerCase()) ||
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.prenom.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'entreprise') cmp = a.entreprise.localeCompare(b.entreprise);
      else if (sortBy === 'montant_mensuel') cmp = a.montant_mensuel - b.montant_mensuel;
      else cmp = new Date(a.dernier_contact).getTime() - new Date(b.dernier_contact).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [clients, search, statusFilter, sortBy, sortDir]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyClient);
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({
      entreprise: client.entreprise,
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      secteur: client.secteur,
      status: client.status,
      pipeline_stage: client.pipeline_stage,
      montant_mensuel: client.montant_mensuel,
      dernier_contact: client.dernier_contact,
      date_creation: client.date_creation,
      notes: client.notes,
      adresse: client.adresse,
      site_web: client.site_web,
      source: client.source,
      avatar: client.avatar,
      services_souscrits: client.services_souscrits,
      service_pricing: client.service_pricing,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.entreprise.trim()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateClient(editing.id, form);
      } else {
        await createClient(form);
      }
      await reload();
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
    await reload();
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <p className="text-text-dim text-sm">Chargement des clients...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Clients</h1>
          <p className="text-sm text-text-muted mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par entreprise, nom, email..."
            className="lg-input w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-dim shrink-0" />
          <select
            className="lg-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="client">Client</option>
            <option value="prospect">Prospect</option>
            <option value="perdu">Perdu</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <table className="w-full lg-table">
          <thead>
            <tr>
              <th
                className="cursor-pointer select-none"
                onClick={() => toggleSort('entreprise')}
              >
                <span className="flex items-center gap-1">
                  Entreprise
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </span>
              </th>
              <th>Contact</th>
              <th>Secteur</th>
              <th>Statut</th>
              <th
                className="cursor-pointer select-none"
                onClick={() => toggleSort('montant_mensuel')}
              >
                <span className="flex items-center gap-1">
                  MRR
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </span>
              </th>
              <th>Pipeline</th>
              <th
                className="cursor-pointer select-none"
                onClick={() => toggleSort('dernier_contact')}
              >
                <span className="flex items-center gap-1">
                  Dernier Contact
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="group glass-interactive">
                <td>
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-3 hover:text-blue transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue/20 to-purple/20 border border-border flex items-center justify-center text-sm font-bold text-blue shrink-0 uppercase">
                      {client.entreprise.charAt(0)}
                    </div>
                    <span className="font-medium text-text">{client.entreprise}</span>
                  </Link>
                </td>
                <td>
                  <div>
                    <p className="text-sm text-text font-medium">
                      {client.prenom} {client.nom}
                    </p>
                    <p className="text-xs text-text-dim">{client.email}</p>
                  </div>
                </td>
                <td>
                  <span className="text-sm text-text-muted">{client.secteur || '—'}</span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadge(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </td>
                <td>
                  <span className="font-semibold text-text">
                    {formatCurrency(client.montant_mensuel)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getPipelineBadge(client.pipeline_stage)}`}>
                    {getPipelineLabel(client.pipeline_stage)}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-text-muted">
                    {formatDate(client.dernier_contact)}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(client)}
                      className="btn-ghost p-2"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="btn-ghost p-2 text-red-400 hover:text-red-300"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-text-dim">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Aucun client trouvé</p>
                  {search || statusFilter !== 'all' ? (
                    <p className="text-xs text-text-muted mt-1">
                      Essayez de modifier vos filtres de recherche
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">
                      Cliquez sur "Nouveau Client" pour commencer
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Modifier le Client' : 'Nouveau Client'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Entreprise */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-text-dim mb-1.5">
              Entreprise <span className="text-red-400">*</span>
            </label>
            <input
              className="lg-input w-full"
              placeholder="Nom de l'entreprise"
              value={form.entreprise}
              onChange={(e) => setForm((f) => ({ ...f, entreprise: e.target.value }))}
            />
          </div>

          {/* Secteur */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-text-dim mb-1.5">Secteur d'activité</label>
            <input
              className="lg-input w-full"
              placeholder="Ex : Restauration, Immobilier..."
              value={form.secteur}
              onChange={(e) => setForm((f) => ({ ...f, secteur: e.target.value }))}
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Prénom</label>
            <input
              className="lg-input w-full"
              placeholder="Prénom du contact"
              value={form.prenom}
              onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Nom</label>
            <input
              className="lg-input w-full"
              placeholder="Nom du contact"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Email</label>
            <input
              className="lg-input w-full"
              type="email"
              placeholder="email@exemple.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Téléphone</label>
            <input
              className="lg-input w-full"
              type="tel"
              placeholder="+33 6 00 00 00 00"
              value={form.telephone}
              onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Statut</label>
            <select
              className="lg-select w-full"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as ClientStatus }))
              }
            >
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
              <option value="inactif">Inactif</option>
              <option value="perdu">Perdu</option>
            </select>
          </div>

          {/* Pipeline Stage */}
          <div>
            <label className="block text-xs text-text-dim mb-1.5">Étape Pipeline</label>
            <select
              className="lg-select w-full"
              value={form.pipeline_stage}
              onChange={(e) =>
                setForm((f) => ({ ...f, pipeline_stage: e.target.value as PipelineStage }))
              }
            >
              <option value="premier-contact">1er Contact</option>
              <option value="contact">Contact</option>
              <option value="proposition">Proposition</option>
              <option value="negociation">Négociation</option>
              <option value="signe">Signé</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>

          {/* Montant mensuel */}
          <div className="col-span-2">
            <label className="block text-xs text-text-dim mb-1.5">
              Montant mensuel (EUR)
            </label>
            <input
              className="lg-input w-full"
              type="number"
              min="0"
              step="10"
              placeholder="0"
              value={form.montant_mensuel}
              onChange={(e) =>
                setForm((f) => ({ ...f, montant_mensuel: Number(e.target.value) }))
              }
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-xs text-text-dim mb-1.5">Notes</label>
            <textarea
              className="lg-input w-full h-24 resize-none"
              placeholder="Informations complémentaires..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="btn-secondary"
            onClick={() => setShowModal(false)}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !form.entreprise.trim()}
          >
            {submitting ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
