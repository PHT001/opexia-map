// ---- Supabase-mapped types ----

export type ClientStatus = 'client' | 'prospect' | 'perdu' | 'inactif';
export type PipelineStage = 'premier-contact' | 'proposition' | 'negociation' | 'signe' | 'refuse' | 'contact';
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type ContractType = 'collaboration' | 'paid' | 'unpaid';
export type Priority = 'low' | 'medium' | 'high';
export type DevisStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
export type InvoiceStatus = 'en-attente' | 'payee' | 'en-retard' | 'annulee';

export interface ServicePricing {
  service: string;
  recurrent: number;
  miseEnPlace: number;
}

export interface DevisLigne {
  description: string;
  quantite: number;
  prixUnitaire: number;
  tva: number;
}

// Supabase `clients` table
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise: string;
  email: string;
  telephone: string;
  status: ClientStatus;
  pipeline_stage: PipelineStage;
  services_souscrits: string[];
  service_pricing: ServicePricing[];
  montant_mensuel: number;
  date_creation: string;
  dernier_contact: string;
  notes: string;
  adresse: string | null;
  site_web: string | null;
  secteur: string;
  source: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

// Supabase `devis` table
export interface Devis {
  id: string;
  client_id: string;
  numero: string;
  lignes: DevisLigne[];
  status: DevisStatus;
  date_creation: string;
  date_validite: string;
  notes: string;
  montant_ht: number;
  montant_ttc: number;
  created_at: string;
  updated_at: string;
}

// Supabase `invoices` table
export interface Invoice {
  id: string;
  client_id: string;
  numero: string;
  montant: number;
  montant_ht: number;
  montant_ttc: number;
  status: InvoiceStatus;
  date_emission: string;
  date_echeance: string;
  description: string;
  mois: string;
  lignes: DevisLigne[];
  devis_id: string | null;
  created_at: string;
}

// Supabase `charges` table
export interface Charge {
  id: string;
  nom: string;
  categorie: string;
  montant: number;
  frequence: string;
  date_debut: string;
  date_fin: string | null;
  actif: boolean;
  notes: string;
  fournisseur: string;
  created_at: string;
  updated_at: string;
}

// Supabase `interactions` table
export interface Interaction {
  id: string;
  client_id: string;
  type: 'appel' | 'email' | 'reunion' | 'note' | 'autre';
  date: string;
  sujet: string;
  contenu: string;
  created_at: string;
}

// Supabase `events` table
export interface CalendarEvent {
  id: string;
  client_id: string | null;
  titre: string;
  date: string;
  heure: string;
  duree: number;
  type: string;
  description: string;
  couleur: string;
  created_at: string;
}

// Legacy types kept for compatibility with deals/contracts pages
export interface Deal {
  id: string;
  title: string;
  clientId: string;
  value: number;
  stage: DealStage;
  priority: Priority;
  expectedCloseDate: string;
  description: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  title: string;
  clientId: string;
  dealId?: string;
  type: ContractType;
  value: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  description: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  clientId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal_update';
  title: string;
  description: string;
  date: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalClients: number;
  clientGrowth: number;
  activeDeals: number;
  dealGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
}

// ---- Scraping ----

export type ScrapingStatus = 'in-progress' | 'completed' | 'error';

export interface ScrapedRestaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  reviews: { text: string; rating: number }[];
  scrapingDate: string;
  status: 'verified' | 'pending';
}

export interface ScrapingSession {
  id: string;
  date: string;
  task: string;
  type: string;
  city: string;
  totalFound: number;
  status: ScrapingStatus;
  data: ScrapedRestaurant[];
  notes: string;
  createdAt: string;
}

// ---- Scraping Aggregation ----

export type RedFlag = 'no-website' | 'no-phone' | 'low-rating' | 'few-reviews';
export type StrengthTag = 'popular' | 'well-rated' | 'digital-ready' | 'needs-digital' | 'struggling';

export interface AnalyzedRestaurant extends ScrapedRestaurant {
  redFlags: RedFlag[];
  strengths: StrengthTag[];
  opportunityScore: number; // 0-100
}

export interface CityAggregate {
  city: string;
  totalRestaurants: number;
  types: string[];
  avgRating: number;
  withPhone: number;
  withWebsite: number;
  opportunityCount: number;
  sessions: ScrapingSession[];
}

export interface TypeAggregate {
  type: string;
  city: string;
  totalRestaurants: number;
  avgRating: number;
  avgReviews: number;
  withPhone: number;
  withWebsite: number;
  opportunityCount: number;
  restaurants: AnalyzedRestaurant[];
}
