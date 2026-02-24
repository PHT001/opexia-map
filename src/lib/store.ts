import { supabase } from './supabase';
import { Client, Devis, Invoice, DevisLigne, Interaction, ScrapingSession } from './types';

// ---- CLIENTS ----

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getClients', error); return []; }
  return data ?? [];
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
  if (error) { console.error('getClient', error); return null; }
  return data;
}

export async function createClient(payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> {
  const { data, error } = await supabase.from('clients').insert([payload]).select().single();
  if (error) { console.error('createClient', error); return null; }
  return data;
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<void> {
  const { error } = await supabase.from('clients').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('updateClient', error);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) console.error('deleteClient', error);
}

// ---- DEVIS ----

export async function getDevisList(): Promise<Devis[]> {
  const { data, error } = await supabase.from('devis').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getDevis', error); return []; }
  return data ?? [];
}

export async function getDevisForClient(clientId: string): Promise<Devis[]> {
  const { data, error } = await supabase.from('devis').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
  if (error) { console.error('getDevisForClient', error); return []; }
  return data ?? [];
}

export async function createDevis(payload: {
  client_id: string;
  lignes: DevisLigne[];
  notes: string;
  date_validite: string;
}): Promise<Devis | null> {
  const { count } = await supabase.from('devis').select('*', { count: 'exact', head: true });
  const year = new Date().getFullYear();
  const num = String((count ?? 0) + 1).padStart(3, '0');
  const numero = `DEV-${year}-${num}`;

  const montant_ht = payload.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const montant_ttc = payload.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * (1 + l.tva / 100), 0);

  const { data, error } = await supabase.from('devis').insert([{
    ...payload,
    numero,
    status: 'brouillon',
    date_creation: new Date().toISOString().split('T')[0],
    montant_ht,
    montant_ttc,
  }]).select().single();
  if (error) { console.error('createDevis', error); return null; }
  return data;
}

export async function updateDevis(id: string, payload: Partial<Devis>): Promise<void> {
  const lignes = payload.lignes ?? [];
  const extra = lignes.length > 0 ? {
    montant_ht: lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0),
    montant_ttc: lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * (1 + l.tva / 100), 0),
  } : {};
  const { error } = await supabase.from('devis').update({ ...payload, ...extra, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) console.error('updateDevis', error);
}

export async function deleteDevis(id: string): Promise<void> {
  const { error } = await supabase.from('devis').delete().eq('id', id);
  if (error) console.error('deleteDevis', error);
}

// ---- INVOICES ----

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getInvoices', error); return []; }
  return data ?? [];
}

export async function getInvoicesForClient(clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
  if (error) { console.error('getInvoicesForClient', error); return []; }
  return data ?? [];
}

export async function createInvoice(payload: {
  client_id: string;
  lignes: DevisLigne[];
  description: string;
  date_echeance: string;
  devis_id?: string;
}): Promise<Invoice | null> {
  const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
  const year = new Date().getFullYear();
  const num = String((count ?? 0) + 1).padStart(3, '0');
  const numero = `FAC-${year}-${num}`;

  const montant_ht = payload.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const montant_ttc = payload.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire * (1 + l.tva / 100), 0);

  const { data, error } = await supabase.from('invoices').insert([{
    ...payload,
    numero,
    montant: montant_ttc,
    montant_ht,
    montant_ttc,
    status: 'en-attente',
    date_emission: new Date().toISOString().split('T')[0],
    mois: new Date().toISOString().slice(0, 7),
  }]).select().single();
  if (error) { console.error('createInvoice', error); return null; }
  return data;
}

export async function updateInvoiceStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
  if (error) console.error('updateInvoiceStatus', error);
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) console.error('deleteInvoice', error);
}

export async function convertDevisToInvoice(devis: Devis, dateEcheance: string): Promise<Invoice | null> {
  const inv = await createInvoice({
    client_id: devis.client_id,
    lignes: devis.lignes,
    description: `Facture issue du devis ${devis.numero}`,
    date_echeance: dateEcheance,
    devis_id: devis.id,
  });
  if (inv) await updateDevis(devis.id, { status: 'accepte' });
  return inv;
}

// ---- INTERACTIONS ----

export async function getInteractions(clientId: string): Promise<Interaction[]> {
  const { data, error } = await supabase.from('interactions').select('*').eq('client_id', clientId).order('date', { ascending: false });
  if (error) { console.error('getInteractions', error); return []; }
  return data ?? [];
}

export async function createInteraction(payload: Omit<Interaction, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('interactions').insert([payload]);
  if (error) console.error('createInteraction', error);
}

// ---- LEGACY localStorage helpers (deals/contracts pages) ----

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ls<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function lsSave<T>(key: string, d: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(d));
}

type Deal = import('./types').Deal;
type Contract = import('./types').Contract;
type Activity = import('./types').Activity;

export function getDeals(): Deal[] { return ls<Deal>('reelcrm_deals'); }
export function getDeal(id: string): Deal | null { return getDeals().find(d => d.id === id) ?? null; }
export function createDeal(p: Omit<Deal, 'id' | 'createdAt'>): Deal {
  const deal = { ...p, id: uid(), createdAt: new Date().toISOString() } as Deal;
  lsSave('reelcrm_deals', [...getDeals(), deal]);
  return deal;
}
export function updateDeal(id: string, p: Partial<Deal>) {
  lsSave('reelcrm_deals', getDeals().map(d => d.id === id ? { ...d, ...p } : d));
}
export function deleteDeal(id: string) {
  lsSave('reelcrm_deals', getDeals().filter(d => d.id !== id));
}

export function getContracts(): Contract[] { return ls<Contract>('reelcrm_contracts'); }
export function createContract(p: Omit<Contract, 'id' | 'createdAt'>): Contract {
  const c = { ...p, id: uid(), createdAt: new Date().toISOString() } as Contract;
  lsSave('reelcrm_contracts', [...getContracts(), c]);
  return c;
}
export function updateContract(id: string, p: Partial<Contract>) {
  lsSave('reelcrm_contracts', getContracts().map(c => c.id === id ? { ...c, ...p } : c));
}
export function deleteContract(id: string) {
  lsSave('reelcrm_contracts', getContracts().filter(c => c.id !== id));
}

export function getActivities(): Activity[] { return ls<Activity>('reelcrm_activities'); }
export function getClientActivities(clientId: string): Activity[] {
  return getActivities().filter(a => a.clientId === clientId);
}
export function createActivity(p: Omit<Activity, 'id'>) {
  lsSave('reelcrm_activities', [...getActivities(), { ...p, id: uid() }]);
}

// ---- SCRAPING SESSIONS (localStorage) ----

export function getScrapingSessions(): ScrapingSession[] { return ls<ScrapingSession>('reelcrm_scraping'); }
export function getScrapingSession(id: string): ScrapingSession | null { return getScrapingSessions().find(s => s.id === id) ?? null; }
export function createScrapingSession(p: Omit<ScrapingSession, 'id' | 'createdAt'>): ScrapingSession {
  const session = { ...p, id: uid(), createdAt: new Date().toISOString() } as ScrapingSession;
  lsSave('reelcrm_scraping', [...getScrapingSessions(), session]);
  return session;
}
export function updateScrapingSession(id: string, p: Partial<ScrapingSession>) {
  lsSave('reelcrm_scraping', getScrapingSessions().map(s => s.id === id ? { ...s, ...p } : s));
}
export function deleteScrapingSession(id: string) {
  lsSave('reelcrm_scraping', getScrapingSessions().filter(s => s.id !== id));
}

export function seedData() {
  if (getDeals().length === 0) {
    [
      { title: 'Chatbot IA – Cedim', clientId: '0af2e950-c20c-4ebb-bdd3-a4e17978a275', value: 2400, stage: 'proposal' as const, priority: 'high' as const, expectedCloseDate: '2026-03-31', description: 'Chatbot intelligent pour diagnostics immobiliers' },
      { title: 'Fidélité – Horyatiki', clientId: '070c0eb5-7150-44b4-936a-c25c71c993e7', value: 2040, stage: 'closed_won' as const, priority: 'medium' as const, expectedCloseDate: '2026-01-01', description: 'Programme de fidélité + chatbot 170€/mois' },
      { title: 'Automatisation – Bollywood Village', clientId: '9e7f5699-edb5-4f74-afb3-e76b8d7d6a7b', value: 1500, stage: 'negotiation' as const, priority: 'medium' as const, expectedCloseDate: '2026-03-15', description: 'Automatisation commandes restaurant' },
      { title: 'CRM – Maison des Saveurs', clientId: '629d4640-ed6d-4bc9-9c54-e3a66147b4b9', value: 800, stage: 'lead' as const, priority: 'low' as const, expectedCloseDate: '2026-04-30', description: 'Gestion clients restaurant' },
    ].forEach(d => createDeal(d));
  }
  if (getContracts().length === 0) {
    createContract({ title: 'Horyatiki – Chatbot + Fidélité', clientId: '070c0eb5-7150-44b4-936a-c25c71c993e7', type: 'paid', value: 170, startDate: '2025-01-01', endDate: '2026-12-31', status: 'signed', description: 'Chatbot 90€/mois + autre 80€/mois' });
  }
}
