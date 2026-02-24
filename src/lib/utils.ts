import { DealStage, ClientStatus, Priority, ContractType, DevisStatus, InvoiceStatus, PipelineStage } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '—';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return formatDate(dateStr);
}

// Client status (Supabase values)
export const getStatusLabel = (s: ClientStatus | string): string =>
  ({ client: 'Client', prospect: 'Prospect', perdu: 'Perdu', inactif: 'Inactif', active: 'Actif', inactive: 'Inactif' } as Record<string, string>)[s] ?? s;
export const getStatusBadge = (s: ClientStatus | string): string =>
  ({ client: 'badge-green', active: 'badge-green', prospect: 'badge-blue', perdu: 'badge-red', inactif: 'badge-ghost', inactive: 'badge-ghost' } as Record<string, string>)[s] ?? 'badge-ghost';

// Pipeline stage
export const getPipelineLabel = (s: PipelineStage | string): string =>
  ({ 'premier-contact': '1er Contact', contact: 'Contact', proposition: 'Proposition', negociation: 'Négociation', signe: 'Signé', refuse: 'Refusé' } as Record<string, string>)[s] ?? s;
export const getPipelineBadge = (s: PipelineStage | string): string =>
  ({ 'premier-contact': 'badge-blue', contact: 'badge-blue', proposition: 'badge-purple', negociation: 'badge-orange', signe: 'badge-green', refuse: 'badge-red' } as Record<string, string>)[s] ?? 'badge-ghost';

// Deal stage
export const getStageLabel = (s: DealStage): string => ({ lead: 'Lead', qualified: 'Qualifié', proposal: 'Proposition', negotiation: 'Négociation', closed_won: 'Gagné', closed_lost: 'Perdu' })[s] ?? s;
export const getStageBadge = (s: DealStage): string => ({ lead: 'badge-blue', qualified: 'badge-teal', proposal: 'badge-purple', negotiation: 'badge-orange', closed_won: 'badge-green', closed_lost: 'badge-red' })[s] ?? 'badge-ghost';

export const getPriorityLabel = (p: Priority): string => ({ low: 'Basse', medium: 'Moyenne', high: 'Haute' })[p] ?? p;
export const getPriorityBadge = (p: Priority): string => ({ low: 'badge-blue', medium: 'badge-orange', high: 'badge-red' })[p] ?? 'badge-ghost';

export const getContractTypeLabel = (t: ContractType): string => ({ collaboration: 'Collaboration', paid: 'Payant', unpaid: 'Non payant' })[t] ?? t;
export const getContractStatusLabel = (s: string): string => ({ draft: 'Brouillon', sent: 'Envoyé', signed: 'Signé', expired: 'Expiré' } as Record<string,string>)[s] ?? s;
export const getContractStatusBadge = (s: string): string => ({ draft: 'badge-blue', sent: 'badge-orange', signed: 'badge-green', expired: 'badge-red' } as Record<string,string>)[s] ?? 'badge-ghost';

// Devis status
export const getDevisStatusLabel = (s: DevisStatus | string): string =>
  ({ brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé', expire: 'Expiré' } as Record<string,string>)[s] ?? s;
export const getDevisStatusBadge = (s: DevisStatus | string): string =>
  ({ brouillon: 'badge-ghost', envoye: 'badge-blue', accepte: 'badge-green', refuse: 'badge-red', expire: 'badge-orange' } as Record<string,string>)[s] ?? 'badge-ghost';

// Invoice status
export const getInvoiceStatusLabel = (s: InvoiceStatus | string): string =>
  ({ 'en-attente': 'En attente', payee: 'Payée', 'en-retard': 'En retard', annulee: 'Annulée' } as Record<string,string>)[s] ?? s;
export const getInvoiceStatusBadge = (s: InvoiceStatus | string): string =>
  ({ 'en-attente': 'badge-orange', payee: 'badge-green', 'en-retard': 'badge-red', annulee: 'badge-ghost' } as Record<string,string>)[s] ?? 'badge-ghost';
