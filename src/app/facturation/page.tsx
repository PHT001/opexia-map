'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Plus, Trash2, Printer, ArrowRight, FileText,
  Receipt, TrendingUp, Clock, CheckCircle2, ChevronDown,
  X, AlertCircle,
} from 'lucide-react';
import {
  getDevisList, createDevis, updateDevis, deleteDevis,
  getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice,
  convertDevisToInvoice, getClients,
} from '@/lib/store';
import { Devis, Invoice, DevisLigne, DevisStatus, Client } from '@/lib/types';
import {
  formatCurrency, formatDate,
  getDevisStatusLabel, getDevisStatusBadge,
  getInvoiceStatusLabel, getInvoiceStatusBadge,
} from '@/lib/utils';
import Modal from '@/components/Modal';

// ─── Empty line factory ───────────────────────────────────────────────────────
const emptyLigne = (): DevisLigne => ({
  description: '',
  quantite: 1,
  prixUnitaire: 0,
  tva: 20,
});

// ─── Totals helper ────────────────────────────────────────────────────────────
function calcTotals(lignes: DevisLigne[]) {
  const ht = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
  const ttc = lignes.reduce(
    (s, l) => s + l.quantite * l.prixUnitaire * (1 + l.tva / 100),
    0,
  );
  return { ht, tva: ttc - ht, ttc };
}

// ─── Devis status options ─────────────────────────────────────────────────────
const DEVIS_STATUSES: DevisStatus[] = ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'];

// ─── Print preview component ─────────────────────────────────────────────────
interface PrintData {
  numero: string;
  type: 'devis' | 'facture';
  clientName: string;
  dateLabel: string;
  dateValue: string;
  lignes: DevisLigne[];
  notes?: string;
  description?: string;
}

function PrintPreviewModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: PrintData | null;
}) {
  if (!isOpen || !data) return null;
  const { ht, tva, ttc } = calcTotals(data.lignes);

  const handlePrint = () => {
    const printContent = document.getElementById('print-preview-content');
    if (!printContent) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${data.type === 'devis' ? 'Devis' : 'Facture'} ${data.numero}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; background: #fff; padding: 40px; font-size: 13px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #111; }
          .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .brand span { color: #5e9eff; }
          .doc-title { font-size: 28px; font-weight: 700; text-align: right; }
          .doc-num { font-size: 13px; color: #666; margin-top: 4px; text-align: right; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .meta-block h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 6px; }
          .meta-block p { font-size: 13px; font-weight: 600; }
          .meta-block span { font-size: 12px; color: #555; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; font-weight: 600; }
          tbody td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          tbody tr:last-child td { border-bottom: none; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .totals-row.total { border-top: 2px solid #111; margin-top: 6px; padding-top: 10px; font-size: 15px; font-weight: 700; }
          .notes { margin-top: 28px; padding: 14px; background: #f9f9f9; border-radius: 6px; font-size: 12px; color: #444; }
          .notes h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 6px; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">REEL<span>CRM</span></div>
            <div style="font-size:11px;color:#666;margin-top:4px;">Gestion commerciale</div>
          </div>
          <div>
            <div class="doc-title">${data.type === 'devis' ? 'DEVIS' : 'FACTURE'}</div>
            <div class="doc-num">${data.numero}</div>
          </div>
        </div>
        <div class="meta">
          <div class="meta-block">
            <h4>Client</h4>
            <p>${data.clientName}</p>
          </div>
          <div class="meta-block" style="text-align:right;">
            <h4>${data.dateLabel}</h4>
            <p>${data.dateValue}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qté</th>
              <th class="text-right">Prix HT</th>
              <th class="text-right">TVA</th>
              <th class="text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${data.lignes.map(l => `
              <tr>
                <td>${l.description || '—'}</td>
                <td class="text-right">${l.quantite}</td>
                <td class="text-right">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(l.prixUnitaire)}</td>
                <td class="text-right">${l.tva}%</td>
                <td class="text-right">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(l.quantite * l.prixUnitaire)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-row"><span>Total HT</span><span>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(ht)}</span></div>
          <div class="totals-row"><span>TVA</span><span>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(tva)}</span></div>
          <div class="totals-row total"><span>Total TTC</span><span>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(ttc)}</span></div>
        </div>
        ${(data.notes || data.description) ? `
          <div class="notes">
            <h4>Notes</h4>
            <p>${data.notes || data.description}</p>
          </div>
        ` : ''}
      </body>
      </html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass max-w-2xl w-full mx-4 p-0 scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-[15px] font-semibold text-text flex items-center gap-2">
            <Printer className="w-4 h-4 text-text-dim" />
            Aperçu — {data.numero}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview body */}
        <div className="overflow-y-auto flex-1 px-6 py-5" id="print-preview-content">
          <div className="glass-inset p-5 rounded-[16px] space-y-4">
            {/* Preview header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base font-bold text-text">REELCRM</p>
                <p className="text-[11px] text-text-dim">Gestion commerciale</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-text">
                  {data.type === 'devis' ? 'DEVIS' : 'FACTURE'}
                </p>
                <p className="text-xs text-text-muted">{data.numero}</p>
              </div>
            </div>

            {/* Client & date */}
            <div
              className="flex justify-between pt-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Client</p>
                <p className="text-sm font-semibold text-text">{data.clientName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">{data.dateLabel}</p>
                <p className="text-sm font-semibold text-text">{data.dateValue}</p>
              </div>
            </div>

            {/* Lines table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Description', 'Qté', 'Prix HT', 'TVA', 'Total HT'].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-2 text-text-dim font-semibold text-[10px] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.lignes.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="py-2 px-2 text-text">{l.description || '—'}</td>
                      <td className="py-2 px-2 text-text-muted">{l.quantite}</td>
                      <td className="py-2 px-2 text-text-muted">
                        {formatCurrency(l.prixUnitaire)}
                      </td>
                      <td className="py-2 px-2 text-text-muted">{l.tva}%</td>
                      <td className="py-2 px-2 font-semibold text-text">
                        {formatCurrency(l.quantite * l.prixUnitaire)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div
              className="flex flex-col items-end gap-1 pt-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex gap-8 text-[12px] text-text-muted">
                <span>Total HT</span>
                <span className="font-semibold text-text w-24 text-right">
                  {formatCurrency(ht)}
                </span>
              </div>
              <div className="flex gap-8 text-[12px] text-text-muted">
                <span>TVA</span>
                <span className="font-semibold text-text w-24 text-right">
                  {formatCurrency(tva)}
                </span>
              </div>
              <div className="flex gap-8 text-[13px] font-bold text-text mt-1">
                <span>Total TTC</span>
                <span className="text-blue w-24 text-right">{formatCurrency(ttc)}</span>
              </div>
            </div>

            {/* Notes */}
            {(data.notes || data.description) && (
              <div
                className="pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Notes</p>
                <p className="text-[12px] text-text-muted">{data.notes || data.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="flex justify-end gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
          <button className="btn-primary flex items-center gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Imprimer / PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status dropdown for devis ────────────────────────────────────────────────
function DevisStatusDropdown({
  current,
  onChange,
}: {
  current: DevisStatus;
  onChange: (s: DevisStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 btn-ghost p-1.5 rounded-lg"
        title="Changer le statut"
      >
        <span className={`badge ${getDevisStatusBadge(current)}`}>
          {getDevisStatusLabel(current)}
        </span>
        <ChevronDown className="w-3 h-3 text-text-dim" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 glass rounded-[14px] overflow-hidden z-20 min-w-[140px]"
          style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}
        >
          {DEVIS_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[12px] transition-colors hover:bg-white/5 flex items-center gap-2 ${s === current ? 'text-text' : 'text-text-muted'}`}
            >
              <span className={`badge ${getDevisStatusBadge(s)}`}>{getDevisStatusLabel(s)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Line items editor ────────────────────────────────────────────────────────
function LignesEditor({
  lignes,
  onChange,
}: {
  lignes: DevisLigne[];
  onChange: (l: DevisLigne[]) => void;
}) {
  const updateLigne = (i: number, patch: Partial<DevisLigne>) => {
    const next = lignes.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange(next);
  };
  const removeLigne = (i: number) => onChange(lignes.filter((_, idx) => idx !== i));
  const addLigne = () => onChange([...lignes, emptyLigne()]);

  const { ht, tva, ttc } = calcTotals(lignes);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
          Lignes de prestation
        </p>
        <button
          type="button"
          onClick={addLigne}
          className="btn-ghost text-[11px] flex items-center gap-1 py-1 px-2"
        >
          <Plus className="w-3 h-3" />
          Ajouter une ligne
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 px-1">
        {['Description', 'Qté', 'Prix HT (€)', 'TVA', 'Total HT', ''].map((h, i) => (
          <p
            key={i}
            className={`text-[9px] font-semibold text-text-dim uppercase tracking-wider ${
              i === 0 ? 'col-span-4' : i === 4 ? 'col-span-2 text-right' : i === 5 ? 'col-span-1' : 'col-span-2'
            }`}
          >
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {lignes.map((l, i) => {
          const totalHT = l.quantite * l.prixUnitaire;
          return (
            <div key={i} className="glass-inset rounded-[12px] p-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Description */}
                <div className="col-span-4">
                  <input
                    className="lg-input w-full text-[12px]"
                    placeholder="Description..."
                    value={l.description}
                    onChange={(e) => updateLigne(i, { description: e.target.value })}
                  />
                </div>
                {/* Quantité */}
                <div className="col-span-2">
                  <input
                    className="lg-input w-full text-[12px]"
                    type="number"
                    min="0"
                    step="1"
                    value={l.quantite}
                    onChange={(e) => updateLigne(i, { quantite: Number(e.target.value) })}
                  />
                </div>
                {/* Prix unitaire */}
                <div className="col-span-2">
                  <input
                    className="lg-input w-full text-[12px]"
                    type="number"
                    min="0"
                    step="0.01"
                    value={l.prixUnitaire}
                    onChange={(e) => updateLigne(i, { prixUnitaire: Number(e.target.value) })}
                  />
                </div>
                {/* TVA */}
                <div className="col-span-1">
                  <select
                    className="lg-select w-full text-[12px]"
                    value={l.tva}
                    onChange={(e) => updateLigne(i, { tva: Number(e.target.value) })}
                  >
                    <option value={0}>0%</option>
                    <option value={20}>20%</option>
                  </select>
                </div>
                {/* Total HT */}
                <div className="col-span-2 text-right">
                  <p className="text-[13px] font-semibold text-text">{formatCurrency(totalHT)}</p>
                </div>
                {/* Remove */}
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeLigne(i)}
                    className="btn-ghost p-1 text-red/60 hover:text-red"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lignes.length === 0 && (
        <div className="glass-inset rounded-[12px] p-6 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-text-dim opacity-40" />
          <p className="text-[12px] text-text-dim">
            Aucune ligne — cliquez sur &quot;Ajouter une ligne&quot;
          </p>
        </div>
      )}

      {/* Totals summary */}
      {lignes.length > 0 && (
        <div className="glass-inset rounded-[12px] p-4 flex flex-col items-end gap-1.5">
          <div className="flex gap-10 text-[12px]">
            <span className="text-text-dim">Total HT</span>
            <span className="font-semibold text-text w-28 text-right">{formatCurrency(ht)}</span>
          </div>
          <div className="flex gap-10 text-[12px]">
            <span className="text-text-dim">TVA</span>
            <span className="font-semibold text-text w-28 text-right">{formatCurrency(tva)}</span>
          </div>
          <div
            className="flex gap-10 text-[14px] font-bold pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}
          >
            <span className="text-text">Total TTC</span>
            <span className="text-blue w-28 text-right">{formatCurrency(ttc)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Convert to Invoice Modal ─────────────────────────────────────────────────
function ConvertModal({
  isOpen,
  devis,
  onClose,
  onConverted,
}: {
  isOpen: boolean;
  devis: Devis | null;
  onClose: () => void;
  onConverted: () => void;
}) {
  const [dateEcheance, setDateEcheance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDateEcheance(d.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleConvert = async () => {
    if (!devis || !dateEcheance) return;
    setLoading(true);
    await convertDevisToInvoice(devis, dateEcheance);
    setLoading(false);
    onConverted();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convertir en Facture" size="sm">
      <div className="space-y-4">
        <p className="text-[13px] text-text-muted">
          Le devis <span className="font-semibold text-text">{devis?.numero}</span> sera converti
          en facture. Son statut passera à &quot;Accepté&quot;.
        </p>
        <div>
          <label className="block text-[11px] text-text-dim mb-1.5">Date d&apos;échéance *</label>
          <input
            className="lg-input w-full"
            type="date"
            value={dateEcheance}
            onChange={(e) => setDateEcheance(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button className="btn-secondary" onClick={onClose}>
          Annuler
        </button>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleConvert}
          disabled={!dateEcheance || loading}
        >
          <ArrowRight className="w-4 h-4" />
          {loading ? 'Conversion...' : 'Convertir'}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function FacturationPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<'devis' | 'factures'>('devis');
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mounted, setMounted] = useState(false);

  // Modals
  const [showCreateDevis, setShowCreateDevis] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [convertDevis, setConvertDevis] = useState<Devis | null>(null);
  const [showConvert, setShowConvert] = useState(false);

  // Devis form
  const [devisForm, setDevisForm] = useState({
    client_id: '',
    date_validite: '',
    notes: '',
    lignes: [emptyLigne()],
  });

  // Invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    date_echeance: '',
    description: '',
    lignes: [emptyLigne()],
  });

  const [saving, setSaving] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getClientName = (id: string) =>
    clients.find((c) => c.id === id)?.entreprise ?? id;

  const reload = async () => {
    const [d, inv, cl] = await Promise.all([getDevisList(), getInvoices(), getClients()]);
    setDevisList(d);
    setInvoices(inv);
    setClients(cl);
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setDevisList(await getDevisList());
      setInvoices(await getInvoices());
      setClients(await getClients());
      setMounted(true);
    };
    load();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalDevis = devisList.reduce((s, d) => s + d.montant_ttc, 0);
    const totalFactures = invoices.reduce((s, i) => s + i.montant_ttc, 0);
    const enAttente = invoices
      .filter((i) => i.status === 'en-attente' || i.status === 'en-retard')
      .reduce((s, i) => s + i.montant_ttc, 0);
    const payee = invoices
      .filter((i) => i.status === 'payee')
      .reduce((s, i) => s + i.montant_ttc, 0);
    return { totalDevis, totalFactures, enAttente, payee };
  }, [devisList, invoices]);

  // ── Devis actions ──────────────────────────────────────────────────────────
  const handleCreateDevis = async () => {
    if (!devisForm.client_id || !devisForm.date_validite || devisForm.lignes.length === 0) return;
    setSaving(true);
    await createDevis(devisForm);
    setSaving(false);
    setShowCreateDevis(false);
    resetDevisForm();
    reload();
  };

  const handleUpdateDevisStatus = async (id: string, status: DevisStatus) => {
    await updateDevis(id, { status });
    reload();
  };

  const handleDeleteDevis = async (id: string) => {
    await deleteDevis(id);
    reload();
  };

  const resetDevisForm = () =>
    setDevisForm({ client_id: '', date_validite: '', notes: '', lignes: [emptyLigne()] });

  // ── Invoice actions ────────────────────────────────────────────────────────
  const handleCreateInvoice = async () => {
    if (!invoiceForm.client_id || !invoiceForm.date_echeance || invoiceForm.lignes.length === 0)
      return;
    setSaving(true);
    await createInvoice(invoiceForm);
    setSaving(false);
    setShowCreateInvoice(false);
    resetInvoiceForm();
    reload();
  };

  const handleMarkPaid = async (id: string) => {
    await updateInvoiceStatus(id, 'payee');
    reload();
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoice(id);
    reload();
  };

  const resetInvoiceForm = () =>
    setInvoiceForm({ client_id: '', date_echeance: '', description: '', lignes: [emptyLigne()] });

  // ── Print helpers ──────────────────────────────────────────────────────────
  const openPrintDevis = (d: Devis) => {
    setPrintData({
      numero: d.numero,
      type: 'devis',
      clientName: getClientName(d.client_id),
      dateLabel: 'Date de validité',
      dateValue: formatDate(d.date_validite),
      lignes: d.lignes,
      notes: d.notes,
    });
    setShowPrint(true);
  };

  const openPrintInvoice = (inv: Invoice) => {
    setPrintData({
      numero: inv.numero,
      type: 'facture',
      clientName: getClientName(inv.client_id),
      dateLabel: "Date d'échéance",
      dateValue: formatDate(inv.date_echeance),
      lignes: inv.lignes,
      description: inv.description,
    });
    setShowPrint(true);
  };

  // ── Render guard ───────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue/30 border-t-blue rounded-full animate-spin mx-auto" />
          <p className="text-text-dim text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6 fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Facturation</h1>
          <p className="text-sm text-text-muted mt-1">
            Gérez vos devis et factures clients
          </p>
        </div>
        {/* Tab toggle */}
        <div className="glass-pill flex p-0.5">
          <button
            onClick={() => setTab('devis')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
              tab === 'devis'
                ? 'bg-bg-surface-hover text-text shadow-sm'
                : 'text-text-dim hover:text-text-muted'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Devis
            <span className="text-[10px] opacity-60 ml-0.5">({devisList.length})</span>
          </button>
          <button
            onClick={() => setTab('factures')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
              tab === 'factures'
                ? 'bg-bg-surface-hover text-text shadow-sm'
                : 'text-text-dim hover:text-text-muted'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Factures
            <span className="text-[10px] opacity-60 ml-0.5">({invoices.length})</span>
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Devis',
            value: formatCurrency(stats.totalDevis),
            icon: FileText,
            color: 'text-purple',
            iconBg: 'from-purple/20 to-purple/5',
            sub: `${devisList.length} devis`,
          },
          {
            label: 'Total Factures',
            value: formatCurrency(stats.totalFactures),
            icon: Receipt,
            color: 'text-blue',
            iconBg: 'from-blue/20 to-blue/5',
            sub: `${invoices.length} factures`,
          },
          {
            label: 'En attente',
            value: formatCurrency(stats.enAttente),
            icon: Clock,
            color: 'text-orange',
            iconBg: 'from-orange/20 to-orange/5',
            sub: `${invoices.filter((i) => i.status === 'en-attente' || i.status === 'en-retard').length} factures`,
          },
          {
            label: 'Encaissé',
            value: formatCurrency(stats.payee),
            icon: CheckCircle2,
            color: 'text-green',
            iconBg: 'from-green/20 to-green/5',
            sub: `${invoices.filter((i) => i.status === 'payee').length} payées`,
          },
        ].map((s, i) => (
          <div key={i} className="glass-interactive p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.iconBg} border border-white/5 flex items-center justify-center`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-text-dim opacity-40" />
            </div>
            <p className="text-[11px] text-text-dim mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-text-dim mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: DEVIS
          ═══════════════════════════════════════════════════════ */}
      {tab === 'devis' && (
        <div className="space-y-4 fade-in">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-text-muted">
              {devisList.length === 0
                ? 'Aucun devis pour le moment'
                : `${devisList.length} devis au total`}
            </p>
            <button
              onClick={() => { resetDevisForm(); setShowCreateDevis(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Devis
            </button>
          </div>

          {/* Table */}
          <div className="glass overflow-hidden">
            <table className="w-full lg-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Montant HT</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th>Création</th>
                  <th>Validité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devisList.map((d) => (
                  <tr key={d.id} className="group">
                    {/* Numéro */}
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple/20 to-purple/5 border border-purple/10 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-purple" />
                        </div>
                        <span className="font-semibold text-text text-[12px]">{d.numero}</span>
                      </div>
                    </td>

                    {/* Client */}
                    <td>
                      <span className="text-text-muted text-[12px]">
                        {getClientName(d.client_id)}
                      </span>
                    </td>

                    {/* Montant HT */}
                    <td>
                      <span className="font-semibold text-text text-[12px]">
                        {formatCurrency(d.montant_ht)}
                      </span>
                    </td>

                    {/* Montant TTC */}
                    <td>
                      <span className="font-bold text-blue text-[13px]">
                        {formatCurrency(d.montant_ttc)}
                      </span>
                    </td>

                    {/* Statut — interactive dropdown */}
                    <td>
                      <DevisStatusDropdown
                        current={d.status}
                        onChange={(s) => handleUpdateDevisStatus(d.id, s)}
                      />
                    </td>

                    {/* Date création */}
                    <td>
                      <span className="text-text-dim text-[12px]">
                        {formatDate(d.date_creation)}
                      </span>
                    </td>

                    {/* Date validité */}
                    <td>
                      <span className="text-text-dim text-[12px]">
                        {formatDate(d.date_validite)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Print */}
                        <button
                          onClick={() => openPrintDevis(d)}
                          className="btn-ghost p-1.5 rounded-lg"
                          title="Imprimer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {/* Convert */}
                        <button
                          onClick={() => { setConvertDevis(d); setShowConvert(true); }}
                          className="btn-ghost p-1.5 rounded-lg text-green"
                          title="Convertir en facture"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteDevis(d.id)}
                          className="btn-ghost p-1.5 rounded-lg text-red/70 hover:text-red"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {devisList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-text-dim opacity-30" />
                      <p className="text-text-dim text-sm">Aucun devis</p>
                      <p className="text-text-dim text-xs mt-1 opacity-60">
                        Créez votre premier devis pour commencer
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: FACTURES
          ═══════════════════════════════════════════════════════ */}
      {tab === 'factures' && (
        <div className="space-y-4 fade-in">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-text-muted">
              {invoices.length === 0
                ? 'Aucune facture pour le moment'
                : `${invoices.length} factures au total`}
            </p>
            <button
              onClick={() => { resetInvoiceForm(); setShowCreateInvoice(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Facture
            </button>
          </div>

          {/* Table */}
          <div className="glass overflow-hidden">
            <table className="w-full lg-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th>Date émission</th>
                  <th>Échéance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const isOverdue =
                    inv.status === 'en-attente' &&
                    new Date(inv.date_echeance) < new Date();
                  return (
                    <tr key={inv.id} className="group">
                      {/* Numéro */}
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue/20 to-blue/5 border border-blue/10 flex items-center justify-center">
                            <Receipt className="w-3.5 h-3.5 text-blue" />
                          </div>
                          <span className="font-semibold text-text text-[12px]">{inv.numero}</span>
                        </div>
                      </td>

                      {/* Client */}
                      <td>
                        <span className="text-text-muted text-[12px]">
                          {getClientName(inv.client_id)}
                        </span>
                      </td>

                      {/* Montant TTC */}
                      <td>
                        <span className="font-bold text-blue text-[13px]">
                          {formatCurrency(inv.montant_ttc)}
                        </span>
                      </td>

                      {/* Statut */}
                      <td>
                        <span
                          className={`badge ${getInvoiceStatusBadge(
                            isOverdue ? 'en-retard' : inv.status,
                          )}`}
                        >
                          {getInvoiceStatusLabel(isOverdue ? 'en-retard' : inv.status)}
                        </span>
                      </td>

                      {/* Date émission */}
                      <td>
                        <span className="text-text-dim text-[12px]">
                          {formatDate(inv.date_emission)}
                        </span>
                      </td>

                      {/* Échéance */}
                      <td>
                        <span
                          className={`text-[12px] ${
                            isOverdue ? 'text-red font-semibold' : 'text-text-dim'
                          }`}
                        >
                          {formatDate(inv.date_echeance)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Print */}
                          <button
                            onClick={() => openPrintInvoice(inv)}
                            className="btn-ghost p-1.5 rounded-lg"
                            title="Imprimer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {/* Mark as paid */}
                          {inv.status !== 'payee' && inv.status !== 'annulee' && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="btn-ghost p-1.5 rounded-lg text-green"
                              title="Marquer comme payée"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="btn-ghost p-1.5 rounded-lg text-red/70 hover:text-red"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <Receipt className="w-10 h-10 mx-auto mb-3 text-text-dim opacity-30" />
                      <p className="text-text-dim text-sm">Aucune facture</p>
                      <p className="text-text-dim text-xs mt-1 opacity-60">
                        Créez votre première facture ou convertissez un devis
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL — Nouveau Devis
          ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showCreateDevis}
        onClose={() => setShowCreateDevis(false)}
        title="Nouveau Devis"
        size="lg"
      >
        <div className="space-y-5">
          {/* Client + validité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-text-dim mb-1.5">Client *</label>
              <select
                className="lg-select w-full"
                value={devisForm.client_id}
                onChange={(e) => setDevisForm((f) => ({ ...f, client_id: e.target.value }))}
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.entreprise || `${c.prenom} ${c.nom}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-text-dim mb-1.5">
                Date de validité *
              </label>
              <input
                className="lg-input w-full"
                type="date"
                value={devisForm.date_validite}
                onChange={(e) =>
                  setDevisForm((f) => ({ ...f, date_validite: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] text-text-dim mb-1.5">Notes</label>
            <textarea
              className="lg-input w-full resize-none h-16"
              placeholder="Notes ou conditions particulières..."
              value={devisForm.notes}
              onChange={(e) => setDevisForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Separator */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Lines editor */}
          <LignesEditor
            lignes={devisForm.lignes}
            onChange={(lignes) => setDevisForm((f) => ({ ...f, lignes }))}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn-secondary" onClick={() => setShowCreateDevis(false)}>
            Annuler
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleCreateDevis}
            disabled={
              !devisForm.client_id ||
              !devisForm.date_validite ||
              devisForm.lignes.length === 0 ||
              saving
            }
          >
            <FileText className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Créer le devis'}
          </button>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MODAL — Nouvelle Facture
          ═══════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showCreateInvoice}
        onClose={() => setShowCreateInvoice(false)}
        title="Nouvelle Facture"
        size="lg"
      >
        <div className="space-y-5">
          {/* Client + échéance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-text-dim mb-1.5">Client *</label>
              <select
                className="lg-select w-full"
                value={invoiceForm.client_id}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, client_id: e.target.value }))}
              >
                <option value="">Sélectionner un client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.entreprise || `${c.prenom} ${c.nom}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-text-dim mb-1.5">
                Date d&apos;échéance *
              </label>
              <input
                className="lg-input w-full"
                type="date"
                value={invoiceForm.date_echeance}
                onChange={(e) =>
                  setInvoiceForm((f) => ({ ...f, date_echeance: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] text-text-dim mb-1.5">Description</label>
            <textarea
              className="lg-input w-full resize-none h-16"
              placeholder="Description de la prestation..."
              value={invoiceForm.description}
              onChange={(e) => setInvoiceForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Separator */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          {/* Lines editor */}
          <LignesEditor
            lignes={invoiceForm.lignes}
            onChange={(lignes) => setInvoiceForm((f) => ({ ...f, lignes }))}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn-secondary" onClick={() => setShowCreateInvoice(false)}>
            Annuler
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleCreateInvoice}
            disabled={
              !invoiceForm.client_id ||
              !invoiceForm.date_echeance ||
              invoiceForm.lignes.length === 0 ||
              saving
            }
          >
            <Receipt className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Créer la facture'}
          </button>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════
          MODAL — Convert Devis → Invoice
          ═══════════════════════════════════════════════════════ */}
      <ConvertModal
        isOpen={showConvert}
        devis={convertDevis}
        onClose={() => { setShowConvert(false); setConvertDevis(null); }}
        onConverted={() => { reload(); setTab('factures'); }}
      />

      {/* ═══════════════════════════════════════════════════════
          MODAL — Print preview
          ═══════════════════════════════════════════════════════ */}
      <PrintPreviewModal
        isOpen={showPrint}
        onClose={() => { setShowPrint(false); setPrintData(null); }}
        data={printData}
      />
    </div>
  );
}
