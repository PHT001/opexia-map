'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  Plus,
  Save,
  Phone as PhoneIcon,
  Users,
} from 'lucide-react';
import {
  getClient,
  updateClient,
  getDevisForClient,
  getInvoicesForClient,
  getInteractions,
  createInteraction,
} from '@/lib/store';
import { Client, Devis, Invoice, Interaction } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getStatusLabel,
  getStatusBadge,
  getPipelineLabel,
  getPipelineBadge,
  getDevisStatusLabel,
  getDevisStatusBadge,
  getInvoiceStatusLabel,
  getInvoiceStatusBadge,
} from '@/lib/utils';
import Modal from '@/components/Modal';

type InteractionType = 'appel' | 'email' | 'reunion' | 'note' | 'autre';

const interactionTypeLabels: Record<InteractionType, string> = {
  appel: 'Appel',
  email: 'Email',
  reunion: 'Réunion',
  note: 'Note',
  autre: 'Autre',
};

const interactionIcons: Record<InteractionType, React.ElementType> = {
  appel: PhoneIcon,
  email: Mail,
  reunion: Users,
  note: MessageSquare,
  autre: MessageSquare,
};

const interactionIconColors: Record<InteractionType, string> = {
  appel: 'text-green',
  email: 'text-blue',
  reunion: 'text-purple',
  note: 'text-orange',
  autre: 'text-text-dim',
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [mounted, setMounted] = useState(false);

  // Notes editing
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  // Interaction modal
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionForm, setInteractionForm] = useState<{
    type: InteractionType;
    sujet: string;
    contenu: string;
    date: string;
  }>({
    type: 'note',
    sujet: '',
    contenu: '',
    date: new Date().toISOString().slice(0, 16),
  });
  const [interactionSaving, setInteractionSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [c, d, inv, inter] = await Promise.all([
        getClient(id),
        getDevisForClient(id),
        getInvoicesForClient(id),
        getInteractions(id),
      ]);
      setClient(c);
      setDevisList(d);
      setInvoices(inv);
      setInteractions(inter);
      if (c) setNotes(c.notes ?? '');
      setMounted(true);
    };
    load();
  }, [id]);

  const handleSaveNotes = async () => {
    if (!client) return;
    setNotesSaving(true);
    await updateClient(client.id, { notes });
    setNotesSaving(false);
  };

  const handleAddInteraction = async () => {
    if (!interactionForm.sujet.trim() || !client) return;
    setInteractionSaving(true);
    await createInteraction({
      client_id: client.id,
      type: interactionForm.type,
      sujet: interactionForm.sujet,
      contenu: interactionForm.contenu,
      date: new Date(interactionForm.date).toISOString(),
    });
    const updated = await getInteractions(id);
    setInteractions(updated);
    setInteractionForm({
      type: 'note',
      sujet: '',
      contenu: '',
      date: new Date().toISOString().slice(0, 16),
    });
    setInteractionSaving(false);
    setShowInteractionModal(false);
  };

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <p className="text-text-dim text-sm">Chargement...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-14 h-14 mx-auto mb-4 text-text-dim opacity-30" />
        <p className="text-text-muted text-sm mb-4">Client introuvable</p>
        <Link href="/clients" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour aux clients
        </Link>
      </div>
    );
  }

  const initials = (client.entreprise || `${client.prenom} ${client.nom}`)
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="p-8 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clients" className="btn-ghost p-2 flex items-center gap-1.5 text-xs text-text-dim hover:text-text">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Clients</span>
        </Link>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold text-blue shrink-0"
            style={{ background: 'rgba(94,158,255,0.1)', border: '1px solid rgba(94,158,255,0.12)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-text truncate">{client.entreprise}</h1>
            <p className="text-xs text-text-muted truncate">
              {client.prenom} {client.nom}
              {client.secteur ? ` · ${client.secteur}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`badge ${getStatusBadge(client.status)}`}>
              {getStatusLabel(client.status)}
            </span>
            <span className={`badge ${getPipelineBadge(client.pipeline_stage)}`}>
              {getPipelineLabel(client.pipeline_stage)}
            </span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column — 2/3 */}
        <div className="xl:col-span-2 space-y-5">
          {/* Info card */}
          <div className="glass p-5">
            <h3 className="text-[13px] font-semibold text-text mb-4">Informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Building2, label: 'Entreprise', value: client.entreprise },
                { icon: Briefcase, label: 'Contact', value: `${client.prenom} ${client.nom}`.trim() || null },
                { icon: Mail, label: 'Email', value: client.email },
                { icon: Phone, label: 'Téléphone', value: client.telephone },
                { icon: Briefcase, label: 'Secteur', value: client.secteur },
                { icon: MapPin, label: 'Adresse', value: client.adresse },
                { icon: Globe, label: 'Site web', value: client.site_web },
                { icon: Calendar, label: 'Client depuis', value: client.date_creation ? formatDate(client.date_creation) : null },
                { icon: Calendar, label: 'Dernier contact', value: client.dernier_contact ? formatRelativeDate(client.dernier_contact) : null },
              ]
                .filter((item) => item.value)
                .map((item, i) => (
                  <div key={i} className="glass-inset flex items-center gap-3 p-3 rounded-[12px]">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(94,158,255,0.08)' }}
                    >
                      <item.icon className="w-3.5 h-3.5 text-blue" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-text-dim">{item.label}</p>
                      {item.label === 'Email' ? (
                        <a
                          href={`mailto:${item.value}`}
                          className="text-[12px] text-blue hover:underline truncate block"
                        >
                          {item.value}
                        </a>
                      ) : item.label === 'Site web' ? (
                        <a
                          href={item.value!.startsWith('http') ? item.value! : `https://${item.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-blue hover:underline truncate block"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[12px] text-text truncate">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Services card */}
          <div className="glass p-5">
            <h3 className="text-[13px] font-semibold text-text mb-4 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-purple" />
              Services souscrits
            </h3>
            {client.services_souscrits.length === 0 ? (
              <p className="text-xs text-text-dim text-center py-4">Aucun service</p>
            ) : (
              <div className="space-y-2">
                {client.services_souscrits.map((service) => {
                  const pricing = client.service_pricing?.find((p) => p.service === service);
                  return (
                    <div key={service} className="glass-inset flex items-center justify-between p-3 rounded-[12px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: 'rgba(167,139,250,0.7)' }}
                        />
                        <p className="text-[12px] text-text truncate">{service}</p>
                      </div>
                      {pricing && (
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-[12px] font-semibold text-purple">
                            {formatCurrency(pricing.recurrent)}
                            <span className="text-[10px] text-text-dim font-normal">/mois</span>
                          </p>
                          {pricing.miseEnPlace > 0 && (
                            <p className="text-[10px] text-text-dim">
                              + {formatCurrency(pricing.miseEnPlace)} setup
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[12px] text-text-dim">Total mensuel</p>
                  <p className="text-base font-bold text-text">{formatCurrency(client.montant_mensuel)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes card */}
          <div className="glass p-5">
            <h3 className="text-[13px] font-semibold text-text mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-orange" />
              Notes
            </h3>
            <textarea
              className="lg-input w-full h-32 resize-none text-[12px]"
              placeholder="Ajouter des notes sur ce client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                onClick={handleSaveNotes}
                disabled={notesSaving}
              >
                <Save className="w-3 h-3" />
                {notesSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">
          {/* Stats pills */}
          <div className="space-y-3">
            <div className="glass-interactive p-4 rounded-2xl">
              <p className="text-[10px] text-text-dim mb-1">Montant mensuel</p>
              <p className="text-2xl font-bold text-text">{formatCurrency(client.montant_mensuel)}</p>
            </div>
            <div className="flex gap-2">
              <div className="glass-pill flex-1 px-3 py-2 rounded-xl">
                <p className="text-[10px] text-text-dim">Statut</p>
                <span className={`badge mt-1 ${getStatusBadge(client.status)}`}>
                  {getStatusLabel(client.status)}
                </span>
              </div>
              <div className="glass-pill flex-1 px-3 py-2 rounded-xl">
                <p className="text-[10px] text-text-dim">Pipeline</p>
                <span className={`badge mt-1 ${getPipelineBadge(client.pipeline_stage)}`}>
                  {getPipelineLabel(client.pipeline_stage)}
                </span>
              </div>
            </div>
          </div>

          {/* Devis card */}
          <div className="glass p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue" />
              Devis ({devisList.length})
            </h3>
            {devisList.length === 0 ? (
              <p className="text-xs text-text-dim text-center py-4">Aucun devis</p>
            ) : (
              <div className="space-y-2">
                {devisList.map((d) => (
                  <div key={d.id} className="glass-inset p-3 rounded-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-medium text-text">{d.numero}</p>
                      <span className={`badge text-[10px] ${getDevisStatusBadge(d.status)}`}>
                        {getDevisStatusLabel(d.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-blue">{formatCurrency(d.montant_ht)}</p>
                      <p className="text-[10px] text-text-dim">{formatDate(d.date_creation)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Factures card */}
          <div className="glass p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-green" />
              Factures ({invoices.length})
            </h3>
            {invoices.length === 0 ? (
              <p className="text-xs text-text-dim text-center py-4">Aucune facture</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="glass-inset p-3 rounded-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-medium text-text">{inv.numero}</p>
                      <span className={`badge text-[10px] ${getInvoiceStatusBadge(inv.status)}`}>
                        {getInvoiceStatusLabel(inv.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-green">{formatCurrency(inv.montant_ttc)}</p>
                      <p className="text-[10px] text-text-dim">{formatDate(inv.date_emission)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactions card */}
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-text flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-orange" />
                Interactions ({interactions.length})
              </h3>
              <button
                className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                onClick={() => setShowInteractionModal(true)}
              >
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>

            {interactions.length === 0 ? (
              <p className="text-xs text-text-dim text-center py-4">Aucune interaction</p>
            ) : (
              <div className="space-y-1">
                {interactions.map((inter) => {
                  const type = inter.type as InteractionType;
                  const Icon = interactionIcons[type] ?? MessageSquare;
                  const iconColor = interactionIconColors[type] ?? 'text-text-dim';
                  return (
                    <div
                      key={inter.id}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-bg-surface transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(94,158,255,0.08)' }}
                      >
                        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-between">
                          <p className="text-[12px] font-medium text-text truncate">{inter.sujet}</p>
                          <span className="text-[10px] text-text-dim shrink-0">
                            {formatRelativeDate(inter.date)}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-dim mb-0.5">
                          {interactionTypeLabels[type] ?? type}
                        </p>
                        {inter.contenu && (
                          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{inter.contenu}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Interaction Modal */}
      <Modal
        isOpen={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        title="Ajouter une interaction"
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Type</label>
            <select
              className="lg-input w-full"
              value={interactionForm.type}
              onChange={(e) =>
                setInteractionForm((f) => ({ ...f, type: e.target.value as InteractionType }))
              }
            >
              {(Object.keys(interactionTypeLabels) as InteractionType[]).map((t) => (
                <option key={t} value={t}>
                  {interactionTypeLabels[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-text-dim mb-1">Sujet *</label>
            <input
              className="lg-input w-full"
              placeholder="Ex: Appel de suivi"
              value={interactionForm.sujet}
              onChange={(e) => setInteractionForm((f) => ({ ...f, sujet: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] text-text-dim mb-1">Contenu</label>
            <textarea
              className="lg-input w-full h-24 resize-none"
              placeholder="Détails de l'interaction..."
              value={interactionForm.contenu}
              onChange={(e) => setInteractionForm((f) => ({ ...f, contenu: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] text-text-dim mb-1">Date</label>
            <input
              type="datetime-local"
              className="lg-input w-full"
              value={interactionForm.date}
              onChange={(e) => setInteractionForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="btn-secondary"
            onClick={() => setShowInteractionModal(false)}
            disabled={interactionSaving}
          >
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleAddInteraction}
            disabled={interactionSaving || !interactionForm.sujet.trim()}
          >
            {interactionSaving ? 'Enregistrement...' : 'Ajouter'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
