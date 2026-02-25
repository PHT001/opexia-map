import { supabase } from './supabase';
import { Client, Devis, Invoice, DevisLigne, Interaction, ScrapingSession, Deal, Contract, Activity } from './types';

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

// ---- DEALS (Supabase) ----

interface SupaDealRow {
  id: string; title: string; client_id: string; value: number;
  stage: string; priority: string; expected_close_date: string;
  description: string; created_at: string;
}

function rowToDeal(r: SupaDealRow): Deal {
  return {
    id: r.id, title: r.title, clientId: r.client_id, value: r.value,
    stage: r.stage as Deal['stage'], priority: r.priority as Deal['priority'],
    expectedCloseDate: r.expected_close_date, description: r.description,
    createdAt: r.created_at,
  };
}

export async function getDeals(): Promise<Deal[]> {
  const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getDeals', error); return []; }
  return (data ?? []).map(rowToDeal);
}

export async function getDeal(id: string): Promise<Deal | null> {
  const { data, error } = await supabase.from('deals').select('*').eq('id', id).single();
  if (error) { console.error('getDeal', error); return null; }
  return rowToDeal(data);
}

export async function createDeal(p: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal | null> {
  const { data, error } = await supabase.from('deals').insert([{
    title: p.title, client_id: p.clientId, value: p.value,
    stage: p.stage, priority: p.priority,
    expected_close_date: p.expectedCloseDate, description: p.description,
  }]).select().single();
  if (error) { console.error('createDeal', error); return null; }
  return rowToDeal(data);
}

export async function updateDeal(id: string, p: Partial<Deal>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (p.title !== undefined) mapped.title = p.title;
  if (p.clientId !== undefined) mapped.client_id = p.clientId;
  if (p.value !== undefined) mapped.value = p.value;
  if (p.stage !== undefined) mapped.stage = p.stage;
  if (p.priority !== undefined) mapped.priority = p.priority;
  if (p.expectedCloseDate !== undefined) mapped.expected_close_date = p.expectedCloseDate;
  if (p.description !== undefined) mapped.description = p.description;
  const { error } = await supabase.from('deals').update(mapped).eq('id', id);
  if (error) console.error('updateDeal', error);
}

export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) console.error('deleteDeal', error);
}

// ---- CONTRACTS (Supabase) ----

interface SupaContractRow {
  id: string; title: string; client_id: string; deal_id: string | null;
  type: string; value: number; start_date: string; end_date: string;
  status: string; description: string; created_at: string;
}

function rowToContract(r: SupaContractRow): Contract {
  return {
    id: r.id, title: r.title, clientId: r.client_id, dealId: r.deal_id ?? undefined,
    type: r.type as Contract['type'], value: r.value,
    startDate: r.start_date, endDate: r.end_date,
    status: r.status as Contract['status'], description: r.description,
    createdAt: r.created_at,
  };
}

export async function getContracts(): Promise<Contract[]> {
  const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getContracts', error); return []; }
  return (data ?? []).map(rowToContract);
}

export async function createContract(p: Omit<Contract, 'id' | 'createdAt'>): Promise<Contract | null> {
  const { data, error } = await supabase.from('contracts').insert([{
    title: p.title, client_id: p.clientId, deal_id: p.dealId ?? null,
    type: p.type, value: p.value, start_date: p.startDate, end_date: p.endDate,
    status: p.status, description: p.description,
  }]).select().single();
  if (error) { console.error('createContract', error); return null; }
  return rowToContract(data);
}

export async function updateContract(id: string, p: Partial<Contract>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (p.title !== undefined) mapped.title = p.title;
  if (p.clientId !== undefined) mapped.client_id = p.clientId;
  if (p.dealId !== undefined) mapped.deal_id = p.dealId;
  if (p.type !== undefined) mapped.type = p.type;
  if (p.value !== undefined) mapped.value = p.value;
  if (p.startDate !== undefined) mapped.start_date = p.startDate;
  if (p.endDate !== undefined) mapped.end_date = p.endDate;
  if (p.status !== undefined) mapped.status = p.status;
  if (p.description !== undefined) mapped.description = p.description;
  const { error } = await supabase.from('contracts').update(mapped).eq('id', id);
  if (error) console.error('updateContract', error);
}

export async function deleteContract(id: string): Promise<void> {
  const { error } = await supabase.from('contracts').delete().eq('id', id);
  if (error) console.error('deleteContract', error);
}

// ---- ACTIVITIES (Supabase) ----

interface SupaActivityRow {
  id: string; client_id: string; type: string;
  title: string; description: string; date: string;
}

function rowToActivity(r: SupaActivityRow): Activity {
  return {
    id: r.id, clientId: r.client_id,
    type: r.type as Activity['type'],
    title: r.title, description: r.description, date: r.date,
  };
}

export async function getActivities(): Promise<Activity[]> {
  const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false });
  if (error) { console.error('getActivities', error); return []; }
  return (data ?? []).map(rowToActivity);
}

export async function getClientActivities(clientId: string): Promise<Activity[]> {
  const { data, error } = await supabase.from('activities').select('*').eq('client_id', clientId).order('date', { ascending: false });
  if (error) { console.error('getClientActivities', error); return []; }
  return (data ?? []).map(rowToActivity);
}

export async function createActivity(p: Omit<Activity, 'id'>): Promise<void> {
  const { error } = await supabase.from('activities').insert([{
    client_id: p.clientId, type: p.type,
    title: p.title, description: p.description, date: p.date,
  }]);
  if (error) console.error('createActivity', error);
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
  if ((await getDeals()).length === 0) {
    const dealSeeds = [
      { title: 'Chatbot IA – Cedim', clientId: '0af2e950-c20c-4ebb-bdd3-a4e17978a275', value: 2400, stage: 'proposal' as const, priority: 'high' as const, expectedCloseDate: '2026-03-31', description: 'Chatbot intelligent pour diagnostics immobiliers' },
      { title: 'Fidélité – Horyatiki', clientId: '070c0eb5-7150-44b4-936a-c25c71c993e7', value: 2040, stage: 'closed_won' as const, priority: 'medium' as const, expectedCloseDate: '2026-01-01', description: 'Programme de fidélité + chatbot 170€/mois' },
      { title: 'Automatisation – Bollywood Village', clientId: '9e7f5699-edb5-4f74-afb3-e76b8d7d6a7b', value: 1500, stage: 'negotiation' as const, priority: 'medium' as const, expectedCloseDate: '2026-03-15', description: 'Automatisation commandes restaurant' },
      { title: 'CRM – Maison des Saveurs', clientId: '629d4640-ed6d-4bc9-9c54-e3a66147b4b9', value: 800, stage: 'lead' as const, priority: 'low' as const, expectedCloseDate: '2026-04-30', description: 'Gestion clients restaurant' },
    ];
    for (const d of dealSeeds) await createDeal(d);
  }
  if ((await getContracts()).length === 0) {
    await createContract({ title: 'Horyatiki – Chatbot + Fidélité', clientId: '070c0eb5-7150-44b4-936a-c25c71c993e7', type: 'paid', value: 170, startDate: '2025-01-01', endDate: '2026-12-31', status: 'signed', description: 'Chatbot 90€/mois + autre 80€/mois' });
  }
  if ((await getScrapingSessions()).length === 0) {
    await createScrapingSession({
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
