'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Plus, GripVertical, User, Building2, Phone, Mail, ArrowRight, ChevronRight } from 'lucide-react';
import { getClients, updateClient } from '@/lib/store';
import { Client, PipelineStage } from '@/lib/types';
import { formatCurrency, getPipelineLabel, getStatusLabel, getStatusBadge, formatRelativeDate } from '@/lib/utils';

const PIPELINE_STAGES: PipelineStage[] = ['contact', 'premier-contact', 'proposition', 'negociation', 'signe', 'refuse'];

const stageConfig: Record<PipelineStage, { color: string; bg: string; border: string; glow: string; icon: string }> = {
  'contact':          { color: '#5e9eff', bg: 'rgba(94,158,255,0.08)',  border: 'rgba(94,158,255,0.2)',  glow: 'rgba(94,158,255,0.15)',  icon: '📞' },
  'premier-contact':  { color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)',  border: 'rgba(45,212,191,0.2)',  glow: 'rgba(45,212,191,0.15)',  icon: '🤝' },
  'proposition':      { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.15)', icon: '📄' },
  'negociation':      { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  glow: 'rgba(251,191,36,0.15)',  icon: '⚡' },
  'signe':            { color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  glow: 'rgba(52,211,153,0.15)',  icon: '✅' },
  'refuse':           { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', glow: 'rgba(248,113,113,0.15)', icon: '❌' },
};

export default function PipelinePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [mounted, setMounted] = useState(false);
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await getClients();
    setClients(data);
  }, []);

  useEffect(() => { reload().then(() => setMounted(true)); }, [reload]);

  const clientsByStage = useMemo(() => {
    const m: Record<PipelineStage, Client[]> = {
      'contact': [], 'premier-contact': [], 'proposition': [],
      'negociation': [], 'signe': [], 'refuse': [],
    };
    clients.forEach(c => {
      if (m[c.pipeline_stage]) m[c.pipeline_stage].push(c);
      else m['contact'].push(c);
    });
    return m;
  }, [clients]);

  const stats = useMemo(() => {
    const active = clients.filter(c => !['refuse'].includes(c.pipeline_stage));
    const signed = clients.filter(c => c.pipeline_stage === 'signe');
    return {
      total: clients.length,
      active: active.length,
      signed: signed.length,
      revenue: signed.reduce((s, c) => s + (c.montant_mensuel || 0), 0),
      pipeline: active.reduce((s, c) => s + (c.montant_mensuel || 0), 0),
    };
  }, [clients]);

  // ---- Drag & Drop ----
  const handleDragStart = (e: React.DragEvent, client: Client) => {
    setDraggedClient(client);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', client.id);
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedClient(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) setDragOverStage(stage);
  };

  const handleDragLeave = (e: React.DragEvent, stage: PipelineStage) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      if (dragOverStage === stage) setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedClient || draggedClient.pipeline_stage === stage) return;

    setMovingId(draggedClient.id);

    // Optimistic update
    setClients(prev => prev.map(c =>
      c.id === draggedClient.id ? { ...c, pipeline_stage: stage } : c
    ));

    await updateClient(draggedClient.id, { pipeline_stage: stage });
    setDraggedClient(null);

    setTimeout(() => setMovingId(null), 500);
  };

  // Quick move via button
  const quickMove = async (client: Client, stage: PipelineStage) => {
    setMovingId(client.id);
    setClients(prev => prev.map(c =>
      c.id === client.id ? { ...c, pipeline_stage: stage } : c
    ));
    await updateClient(client.id, { pipeline_stage: stage });
    setTimeout(() => setMovingId(null), 500);
  };

  if (!mounted) return (
    <div className="p-8 flex items-center justify-center h-[60vh]">
      <div className="text-text-dim text-sm">Chargement du pipeline...</div>
    </div>
  );

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text">Pipeline</h1>
          <p className="text-xs text-text-muted mt-0.5">Glissez les clients entre les étapes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-xs">
            <div className="text-center">
              <p className="text-text-dim">Clients</p>
              <p className="text-base font-bold text-text">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-text-dim">Signés</p>
              <p className="text-base font-bold text-green">{stats.signed}</p>
            </div>
            <div className="text-center">
              <p className="text-text-dim">MRR</p>
              <p className="text-base font-bold text-blue">{formatCurrency(stats.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline progress bar */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {PIPELINE_STAGES.filter(s => s !== 'refuse').map((stage, i, arr) => {
          const count = clientsByStage[stage].length;
          const cfg = stageConfig[stage];
          return (
            <div key={stage} className="flex items-center flex-1">
              <div
                className="flex-1 h-1.5 rounded-full transition-all duration-500"
                style={{
                  background: count > 0 ? cfg.color : 'rgba(255,255,255,0.06)',
                  opacity: count > 0 ? 1 : 0.5,
                  boxShadow: count > 0 ? `0 0 8px ${cfg.glow}` : 'none',
                }}
              />
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-text-dim mx-0.5 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto flex-1 pb-2 min-h-0">
        {PIPELINE_STAGES.map((stage) => {
          const stageClients = clientsByStage[stage];
          const cfg = stageConfig[stage];
          const isOver = dragOverStage === stage;
          const totalMRR = stageClients.reduce((s, c) => s + (c.montant_mensuel || 0), 0);

          return (
            <div
              key={stage}
              className="flex flex-col min-w-[240px] flex-1 rounded-2xl transition-all duration-300"
              style={{
                background: isOver ? cfg.bg : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isOver ? cfg.border : 'rgba(255,255,255,0.04)'}`,
                boxShadow: isOver ? `0 0 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
              }}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={(e) => handleDragLeave(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column header */}
              <div className="p-3 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{cfg.icon}</span>
                  <span className="text-xs font-semibold text-text">{getPipelineLabel(stage)}</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    {stageClients.length}
                  </span>
                </div>
                {totalMRR > 0 && (
                  <p className="text-[10px] text-text-dim">{formatCurrency(totalMRR)}/mois</p>
                )}
              </div>

              {/* Cards container */}
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[100px]">
                {stageClients.map(client => {
                  const si = PIPELINE_STAGES.indexOf(stage);
                  const nextStage = si < PIPELINE_STAGES.length - 2 ? PIPELINE_STAGES[si + 1] : null;
                  const isMoving = movingId === client.id;

                  return (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client)}
                      onDragEnd={handleDragEnd}
                      className="group rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isMoving
                          ? `0 4px 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                        transform: isMoving ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {/* Drag handle + name */}
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-text-dim mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-text truncate">
                            {client.entreprise}
                          </p>
                          <p className="text-[10px] text-text-muted truncate">
                            {client.prenom} {client.nom}
                          </p>
                        </div>
                        <span className={`badge text-[9px] flex-shrink-0 ${getStatusBadge(client.status)}`}>
                          {getStatusLabel(client.status)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-text-dim">
                        {client.montant_mensuel > 0 && (
                          <span className="font-semibold text-blue text-[11px]">
                            {formatCurrency(client.montant_mensuel)}/m
                          </span>
                        )}
                        {client.secteur && (
                          <span className="truncate">{client.secteur}</span>
                        )}
                      </div>

                      {/* Contact info + quick move */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {client.telephone && (
                            <a href={`tel:${client.telephone}`} className="p-1 rounded-lg hover:bg-bg-surface transition-colors" title={client.telephone}>
                              <Phone className="w-3 h-3 text-text-dim" />
                            </a>
                          )}
                          {client.email && (
                            <a href={`mailto:${client.email}`} className="p-1 rounded-lg hover:bg-bg-surface transition-colors" title={client.email}>
                              <Mail className="w-3 h-3 text-text-dim" />
                            </a>
                          )}
                        </div>

                        {nextStage && stage !== 'signe' && (
                          <button
                            onClick={() => quickMove(client, nextStage)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                            style={{
                              background: stageConfig[nextStage].bg,
                              color: stageConfig[nextStage].color,
                              border: `1px solid ${stageConfig[nextStage].border}`,
                            }}
                            title={`Passer en ${getPipelineLabel(nextStage)}`}
                          >
                            {getPipelineLabel(nextStage)}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Last contact */}
                      {client.dernier_contact && (
                        <p className="mt-1.5 text-[9px] text-text-dim">
                          Dernier contact : {formatRelativeDate(client.dernier_contact)}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Empty state */}
                {stageClients.length === 0 && (
                  <div
                    className="flex flex-col items-center justify-center py-8 px-4 rounded-xl transition-all duration-300"
                    style={{
                      border: `1px dashed ${isOver ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                      background: isOver ? cfg.bg : 'transparent',
                    }}
                  >
                    <span className="text-lg mb-1">{cfg.icon}</span>
                    <p className="text-[10px] text-text-dim text-center">
                      {isOver ? 'Déposez ici' : 'Glissez un client ici'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
