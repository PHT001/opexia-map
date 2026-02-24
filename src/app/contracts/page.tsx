'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, FileText, Search, Filter, Pencil, Trash2, Calendar, DollarSign } from 'lucide-react';
import { getContracts, getClients, createContract, updateContract, deleteContract } from '@/lib/store';
import { Contract, ContractType, Client } from '@/lib/types';
import { formatCurrency, formatDate, getContractTypeLabel, getContractStatusLabel, getContractStatusBadge } from '@/lib/utils';
import Modal from '@/components/Modal';

const emptyContract = { title: '', clientId: '', dealId: undefined as string | undefined, type: 'paid' as ContractType, value: 0, startDate: '', endDate: '', status: 'draft' as Contract['status'], description: '' };

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState(emptyContract);
  const [mounted, setMounted] = useState(false);

  const reload = async () => { setContracts(getContracts()); setClients(await getClients()); };
  useEffect(() => { reload().then(() => setMounted(true)); }, []);

  const filtered = useMemo(() => {
    return contracts.filter(ct => {
      const cl = clients.find(c => c.id === ct.clientId);
      const ms = search === '' || ct.title.toLowerCase().includes(search.toLowerCase()) || (cl?.entreprise || '').toLowerCase().includes(search.toLowerCase());
      const mf = statusFilter === 'all' || ct.status === statusFilter;
      return ms && mf;
    });
  }, [contracts, clients, search, statusFilter]);

  const stats = useMemo(() => ({
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'signed').length,
    totalValue: contracts.filter(c => c.status === 'signed').reduce((s, c) => s + c.value, 0),
    drafts: contracts.filter(c => c.status === 'draft').length,
  }), [contracts]);

  const openCreate = () => { setEditing(null); setForm(emptyContract); setShowModal(true); };
  const openEdit = (ct: Contract) => { setEditing(ct); setForm({ title: ct.title, clientId: ct.clientId, dealId: ct.dealId, type: ct.type, value: ct.value, startDate: ct.startDate, endDate: ct.endDate, status: ct.status, description: ct.description }); setShowModal(true); };
  const handleSubmit = () => { if (!form.title || !form.clientId) return; editing ? updateContract(editing.id, form) : createContract(form); reload(); setShowModal(false); };
  const handleDelete = (id: string) => { deleteContract(id); reload(); };

  if (!mounted) return <div className="p-8 text-text-dim">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Contrats</h1>
          <p className="text-xs text-text-muted mt-1">Gestion des contrats et accords</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nouveau Contrat
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Contrats', value: stats.total.toString() },
          { label: 'Signés', value: stats.signed.toString(), color: 'text-green' },
          { label: 'Valeur Signée', value: formatCurrency(stats.totalValue), color: 'text-blue' },
          { label: 'Brouillons', value: stats.drafts.toString(), color: 'text-orange' },
        ].map((s, i) => (
          <div key={i} className="glass-interactive p-4">
            <p className="text-[10px] text-text-dim">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color || 'text-text'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
          <input type="text" placeholder="Rechercher un contrat..." className="lg-input w-full pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-text-dim" />
          <select className="lg-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous</option><option value="draft">Brouillon</option><option value="sent">Envoyé</option><option value="signed">Signé</option><option value="expired">Expiré</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(ct => {
          const cl = clients.find(c => c.id === ct.clientId);
          return (
            <div key={ct.id} className="glass-interactive p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.12)' }}>
                  <FileText className="w-4 h-4 text-purple" />
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(ct)} className="btn-ghost p-1.5"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(ct.id)} className="btn-ghost p-1.5 text-red"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <h4 className="text-[12px] font-semibold text-text mb-0.5">{ct.title}</h4>
              {cl && <p className="text-[10px] text-text-dim mb-2.5">{cl.entreprise}</p>}
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className={`badge text-[10px] ${getContractStatusBadge(ct.status)}`}>{getContractStatusLabel(ct.status)}</span>
                <span className="badge badge-ghost text-[10px]">{getContractTypeLabel(ct.type)}</span>
              </div>
              {ct.value > 0 && (
                <div className="flex items-center gap-1 text-xs mb-1.5">
                  <DollarSign className="w-3 h-3 text-blue" />
                  <span className="font-semibold text-text">{formatCurrency(ct.value)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-text-dim">
                <Calendar className="w-2.5 h-2.5" />
                <span>{formatDate(ct.startDate)} → {formatDate(ct.endDate)}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FileText className="w-10 h-10 mx-auto mb-3 text-text-dim opacity-30" />
            <p className="text-text-dim text-xs">Aucun contrat trouvé</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier le Contrat' : 'Nouveau Contrat'} size="lg">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] text-text-dim mb-1">Titre *</label>
            <input className="lg-input w-full" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Client *</label>
            <select className="lg-select w-full" value={form.clientId} onChange={(e) => setForm(f => ({ ...f, clientId: e.target.value }))}>
              <option value="">Sélectionner...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.entreprise}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Type</label>
            <select className="lg-select w-full" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as ContractType }))}>
              <option value="paid">Payant</option><option value="collaboration">Collaboration</option><option value="unpaid">Non payant</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Valeur (EUR)</label>
            <input className="lg-input w-full" type="number" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Statut</label>
            <select className="lg-select w-full" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Contract['status'] }))}>
              <option value="draft">Brouillon</option><option value="sent">Envoyé</option><option value="signed">Signé</option><option value="expired">Expiré</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Date de début</label>
            <input className="lg-input w-full" type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Date de fin</label>
            <input className="lg-input w-full" type="date" value={form.endDate} onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] text-text-dim mb-1">Description</label>
            <textarea className="lg-input w-full h-16 resize-none" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
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
