'use client';

import { useState } from 'react';
import { User, Bell, Palette, Database, Download, Trash2, Save } from 'lucide-react';
import { getClients, getDeals, getContracts, getActivities } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, push: true, deals: true, clients: false });
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const [clients, deals, contracts, activities] = await Promise.all([
        getClients(), getDeals(), getContracts(), getActivities(),
      ]);
      const data = { clients, deals, contracts, activities };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opexia-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) return;
    await Promise.all([
      supabase.from('activities').delete().neq('id', ''),
      supabase.from('contracts').delete().neq('id', ''),
      supabase.from('deals').delete().neq('id', ''),
    ]);
    window.location.reload();
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl fade-in">
      <div>
        <h1 className="text-xl font-bold text-text">Paramètres</h1>
        <p className="text-xs text-text-muted mt-1">Configuration de votre espace OpexIA</p>
      </div>

      {/* Profile */}
      <div className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(94,158,255,0.1)', border: '1px solid rgba(94,158,255,0.12)' }}>
            <User className="w-4 h-4 text-blue" />
          </div>
          <h3 className="text-[13px] font-semibold text-text">Profil</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Nom</label>
            <input className="lg-input w-full" defaultValue="Utilisateur" />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Email</label>
            <input className="lg-input w-full" defaultValue="user@reelcrm.com" />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Entreprise</label>
            <input className="lg-input w-full" defaultValue="Mon Entreprise" />
          </div>
          <div>
            <label className="block text-[10px] text-text-dim mb-1">Rôle</label>
            <input className="lg-input w-full" defaultValue="Administrateur" disabled />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.12)' }}>
            <Bell className="w-4 h-4 text-purple" />
          </div>
          <h3 className="text-[13px] font-semibold text-text">Notifications</h3>
        </div>
        <div className="space-y-1">
          {[
            { key: 'email' as const, label: 'Notifications Email', desc: 'Recevoir des alertes par email' },
            { key: 'push' as const, label: 'Notifications Push', desc: 'Alertes dans le navigateur' },
            { key: 'deals' as const, label: 'Mises à jour Deals', desc: 'Changements dans le pipeline' },
            { key: 'clients' as const, label: 'Activité Clients', desc: 'Nouvelle activité client' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-surface transition-colors">
              <div>
                <p className="text-[12px] font-medium text-text">{item.label}</p>
                <p className="text-[10px] text-text-dim">{item.desc}</p>
              </div>
              <div
                className={`toggle ${notifications[item.key] ? 'active' : ''}`}
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.12)' }}>
            <Palette className="w-4 h-4 text-orange" />
          </div>
          <h3 className="text-[13px] font-semibold text-text">Apparence</h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[12px] text-text-muted">Thème</label>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: 'rgba(12,12,20,0.8)', border: '2px solid rgba(94,158,255,0.5)' }}>
              <div className="w-3 h-3 rounded-full bg-blue" />
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center cursor-not-allowed opacity-30" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-3 h-3 rounded-full bg-text-dim" />
            </div>
          </div>
          <span className="text-[10px] text-text-dim ml-1">Mode clair bientôt disponible</span>
        </div>
      </div>

      {/* Data */}
      <div className="glass p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.12)' }}>
            <Database className="w-4 h-4 text-green" />
          </div>
          <h3 className="text-[13px] font-semibold text-text">Données</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> {exporting ? 'Export en cours...' : 'Exporter les données'}
          </button>
          <button onClick={handleReset} className="btn-ghost flex items-center gap-2 text-xs text-red">
            <Trash2 className="w-3.5 h-3.5" /> Réinitialiser les données
          </button>
        </div>
        <p className="text-[10px] text-text-dim mt-3">Les données sont stockées localement dans votre navigateur.</p>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-xs">
          <Save className="w-3.5 h-3.5" />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
