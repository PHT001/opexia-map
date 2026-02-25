'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  Target,
  ArrowUpRight,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
} from 'lucide-react';
import { getClients, getDeals, getActivities, seedData } from '@/lib/store';
import { Client, Deal, Activity } from '@/lib/types';
import { formatCurrency, formatRelativeDate, getStatusLabel, getStatusBadge } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';

const revenueData = [
  { month: 'Sep', revenue: 28000 },
  { month: 'Oct', revenue: 35000 },
  { month: 'Nov', revenue: 42000 },
  { month: 'Déc', revenue: 38000 },
  { month: 'Jan', revenue: 52000 },
  { month: 'Fév', revenue: 70318 },
];

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const load = async () => {
      seedData();
      setClients(await getClients());
      setDeals(await getDeals());
      setActivities(await getActivities());
      setMounted(true);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((sum, c) => sum + (c.montant_mensuel ?? 0), 0);
    const activeClients = clients.filter(c => c.status === 'client').length;
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const wonDeals = deals.filter(d => d.stage === 'closed_won').length;
    return {
      totalRevenue,
      totalClients: clients.length,
      activeClients,
      activeDealsCount: activeDeals.length,
      pipelineValue,
      wonDeals,
      conversionRate: deals.length > 0 ? Math.round((wonDeals / deals.length) * 100) : 0,
    };
  }, [clients, deals]);

  // Build pipeline bar chart data from live deals
  const dealsByStage = useMemo(() => {
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const stageLabels: Record<string, string> = {
      lead: 'Lead',
      qualified: 'Qualifié',
      proposal: 'Proposition',
      negotiation: 'Négociation',
      closed_won: 'Gagné',
      closed_lost: 'Perdu',
    };
    const map: Record<string, { count: number; value: number }> = {};
    for (const d of deals) {
      if (!map[d.stage]) map[d.stage] = { count: 0, value: 0 };
      map[d.stage].count += 1;
      map[d.stage].value += d.value;
    }
    return stageOrder
      .filter(s => map[s])
      .map(s => ({ stage: stageLabels[s] ?? s, count: map[s].count, value: map[s].value }));
  }, [deals]);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="text-text-muted">Chargement...</div>
      </div>
    );
  }

  const activityIcons: Record<string, typeof Phone> = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    note: FileText,
    deal_update: TrendingUp,
  };

  const kpiCards = [
    {
      title: 'Revenu Mensuel',
      value: formatCurrency(stats.totalRevenue),
      subtitle: '+12.5% vs mois dernier',
      icon: DollarSign,
      color: 'text-blue',
      bgColor: 'bg-blue/10',
    },
    {
      title: 'Clients Actifs',
      value: stats.activeClients.toString(),
      subtitle: `${stats.totalClients} clients au total`,
      icon: Users,
      color: 'text-green',
      bgColor: 'bg-green/10',
    },
    {
      title: 'Pipeline',
      value: formatCurrency(stats.pipelineValue),
      subtitle: `${stats.activeDealsCount} deals en cours`,
      icon: TrendingUp,
      color: 'text-purple',
      bgColor: 'bg-purple/10',
    },
    {
      title: 'Taux de Conversion',
      value: `${stats.conversionRate}%`,
      subtitle: '+3.2% ce trimestre',
      icon: Target,
      color: 'text-orange',
      bgColor: 'bg-orange/10',
    },
  ];

  const topClients = [...clients]
    .sort((a, b) => (b.montant_mensuel ?? 0) - (a.montant_mensuel ?? 0))
    .slice(0, 5);

  return (
    <div className="relative min-h-screen p-8 space-y-8">
      {/* Ambient background orbs */}
      <div className="ambient fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-teal/3 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-3xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            Vue d&apos;ensemble de votre activit&eacute; commerciale
          </p>
        </div>
        <div className="glass-pill flex items-center gap-2 px-4 py-2 text-sm text-text-dim">
          <Clock className="w-4 h-4" />
          <span>Mis &agrave; jour &agrave; l&apos;instant</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="glass-interactive p-5 scale-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-2xl ${kpi.bgColor} backdrop-blur-sm border border-border-light flex items-center justify-center`}
              >
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green">
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text tracking-tight">{kpi.value}</p>
            <p className="text-xs text-text-dim mt-1.5">{kpi.title}</p>
            <p className="text-[11px] text-text-muted mt-0.5">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue Area Chart */}
        <div className="xl:col-span-2 glass p-6 fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-text">&Eacute;volution du Revenu</h3>
              <p className="text-xs text-text-dim mt-0.5">6 derniers mois</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-text">{formatCurrency(70318)}</p>
              <p className="text-xs text-green">+7.36% ce mois</p>
            </div>
          </div>
          <div className="glass-inset rounded-2xl p-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(94,158,255,0.25)" />
                      <stop offset="100%" stopColor="rgba(94,158,255,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(12,12,20,0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      color: '#f0f0f5',
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Revenu']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#5e9eff"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pipeline Bar Chart */}
        <div className="glass p-6 fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-base font-semibold text-text mb-1">
            Pipeline par &Eacute;tape
          </h3>
          <p className="text-xs text-text-dim mb-6">R&eacute;partition des deals</p>
          <div className="glass-inset rounded-2xl p-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dealsByStage.length > 0 ? dealsByStage : [
                    { stage: 'Lead', count: 3, value: 58000 },
                    { stage: 'Qualifié', count: 1, value: 62000 },
                    { stage: 'Proposition', count: 1, value: 32000 },
                    { stage: 'Négociation', count: 1, value: 45000 },
                    { stage: 'Gagné', count: 1, value: 95000 },
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={85}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(12,12,20,0.9)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      color: '#f0f0f5',
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Valeur']}
                  />
                  <Bar
                    dataKey="value"
                    fill="rgba(94,158,255,0.6)"
                    radius={[0, 8, 8, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="glass p-6 fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-text">Activit&eacute; R&eacute;cente</h3>
            <span className="badge badge-ghost text-[11px]">
              {activities.length} actions
            </span>
          </div>
          <div className="space-y-2">
            {activities.slice(0, 6).map((activity) => {
              const client = clients.find(c => c.id === activity.clientId);
              const Icon = activityIcons[activity.type] || FileText;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-bg-surface/50 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue/10 backdrop-blur-sm border border-border-light flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-text-dim mt-0.5">
                      {client ? client.entreprise : '—'} &middot; {formatRelativeDate(activity.date)}
                    </p>
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && (
              <p className="text-sm text-text-muted text-center py-6">Aucune activit&eacute; r&eacute;cente</p>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="glass p-6 fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-text">Top Clients</h3>
            <Link
              href="/clients"
              className="text-xs text-blue hover:underline underline-offset-2 transition-colors"
            >
              Voir tout
            </Link>
          </div>
          <div className="space-y-2">
            {topClients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-bg-surface/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple/10 backdrop-blur-sm border border-border-light flex items-center justify-center text-sm font-bold text-purple shrink-0 group-hover:scale-105 transition-transform">
                  {(client.entreprise ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {client.entreprise}
                  </p>
                  <p className="text-xs text-text-dim">
                    {client.nom} {client.prenom}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-text">
                    {formatCurrency(client.montant_mensuel ?? 0)}
                  </p>
                  <span className={`badge text-[10px] ${getStatusBadge(client.status)}`}>
                    {getStatusLabel(client.status)}
                  </span>
                </div>
              </Link>
            ))}
            {topClients.length === 0 && (
              <p className="text-sm text-text-muted text-center py-6">Aucun client</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
