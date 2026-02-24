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

// ---- SCRAPING SESSIONS (Supabase) ----

interface SupaScrapingRow {
  id: string;
  date: string;
  task: string;
  type: string;
  city: string;
  total_found: number;
  status: string;
  data: ScrapingSession['data'];
  notes: string;
  created_at: string;
}

function rowToSession(r: SupaScrapingRow): ScrapingSession {
  return {
    id: r.id, date: r.date, task: r.task, type: r.type, city: r.city,
    totalFound: r.total_found, status: r.status as ScrapingSession['status'],
    data: r.data ?? [], notes: r.notes, createdAt: r.created_at,
  };
}

export async function getScrapingSessions(): Promise<ScrapingSession[]> {
  const { data, error } = await supabase.from('scraping_sessions').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getScrapingSessions', error); return []; }
  return (data ?? []).map(rowToSession);
}

export async function createScrapingSession(p: Omit<ScrapingSession, 'id' | 'createdAt'>): Promise<ScrapingSession | null> {
  const { data, error } = await supabase.from('scraping_sessions').insert([{
    date: p.date, task: p.task, type: p.type, city: p.city,
    total_found: p.totalFound, status: p.status, data: p.data, notes: p.notes,
  }]).select().single();
  if (error) { console.error('createScrapingSession', error); return null; }
  return rowToSession(data);
}

export async function updateScrapingSession(id: string, p: Partial<ScrapingSession>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (p.date !== undefined) mapped.date = p.date;
  if (p.task !== undefined) mapped.task = p.task;
  if (p.type !== undefined) mapped.type = p.type;
  if (p.city !== undefined) mapped.city = p.city;
  if (p.totalFound !== undefined) mapped.total_found = p.totalFound;
  if (p.status !== undefined) mapped.status = p.status;
  if (p.data !== undefined) mapped.data = p.data;
  if (p.notes !== undefined) mapped.notes = p.notes;
  const { error } = await supabase.from('scraping_sessions').update(mapped).eq('id', id);
  if (error) console.error('updateScrapingSession', error);
}

export async function deleteScrapingSession(id: string): Promise<void> {
  const { error } = await supabase.from('scraping_sessions').delete().eq('id', id);
  if (error) console.error('deleteScrapingSession', error);
}

export async function getScrapingSessionsByCity(city: string): Promise<ScrapingSession[]> {
  const { data, error } = await supabase.from('scraping_sessions').select('*').ilike('city', city).order('created_at', { ascending: false });
  if (error) { console.error('getScrapingSessionsByCity', error); return []; }
  return (data ?? []).map(rowToSession);
}

export async function seedData() {
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
  if ((await getScrapingSessions()).length === 0) {
    createScrapingSession({
      date: '2026-02-24',
      task: 'Pizza scraping - Fontenay-sous-Bois',
      type: 'Pizza',
      city: 'Fontenay-sous-Bois',
      totalFound: 5,
      status: 'completed',
      notes: '5 pizzerias principales à Fontenay scrappées depuis Google Maps',
      data: [
        { id: 1, name: 'Pizzeria Dalayrac', address: '51 Rue Dalayrac, 94120 Fontenay-sous-Bois', city: 'Fontenay-sous-Bois', phone: '01 48 75 XX XX', website: '', rating: 4.9, reviewCount: 63, reviews: [{ text: 'Très bonne pizzeria, pâte délicieuse', rating: 5 }, { text: 'Excellent rapport qualité-prix', rating: 5 }], scrapingDate: '2026-02-24', status: 'verified' },
        { id: 2, name: 'Pizzeria Au Bois', address: '54 bis Rue Gay Lussac, 94120 Fontenay-sous-Bois', city: 'Fontenay-sous-Bois', phone: '01 48 75 XX XX', website: '', rating: 4.9, reviewCount: 293, reviews: [{ text: 'Pizza authentique, équipe sympa', rating: 5 }, { text: 'Meilleure pizza du quartier', rating: 5 }], scrapingDate: '2026-02-24', status: 'verified' },
        { id: 3, name: "L'atelier Pizza Fontenay-sous-Bois", address: '46 Rue Dalayrac, 94120 Fontenay-sous-Bois', city: 'Fontenay-sous-Bois', phone: '01 48 75 XX XX', website: '', rating: 5.0, reviewCount: 51, reviews: [{ text: 'Qualité impressionnante', rating: 5 }, { text: 'Pâte parfaitement cuite', rating: 5 }], scrapingDate: '2026-02-24', status: 'verified' },
        { id: 4, name: 'Restaurant Italienne et Pizzeria Le Venise', address: '5 Rue Notre Dame, 94120 Fontenay-sous-Bois', city: 'Fontenay-sous-Bois', phone: '01 48 75 XX XX', website: '', rating: 4.3, reviewCount: 389, reviews: [{ text: 'Bonne ambiance, pizzas correctes', rating: 4 }, { text: 'Personnel accueillant', rating: 4 }], scrapingDate: '2026-02-24', status: 'verified' },
        { id: 5, name: 'Forno del Villaggio', address: '13 Rue du Commandant Jean Duhail, 94120 Fontenay-sous-Bois', city: 'Fontenay-sous-Bois', phone: '01 48 75 XX XX', website: '', rating: 5.0, reviewCount: 33, reviews: [{ text: 'Pizzeria de qualité', rating: 5 }, { text: 'Ingrédients frais', rating: 5 }], scrapingDate: '2026-02-24', status: 'verified' },
      ],
    });
  }
}
