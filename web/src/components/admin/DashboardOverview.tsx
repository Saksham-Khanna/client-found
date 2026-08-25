import React from 'react';
import { studioStore } from '../../store/studioStore';

interface Props {
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<Props> = ({ onNavigate }) => {
  const state = studioStore.getState();

  const activeProjects = state.projects.filter((p) => p.status !== 'Shipped');
  const openLeads = state.leads.filter((l) => l.status === 'New' || l.status === 'Reviewing');
  const pendingInvoices = state.invoices.filter((i) => i.status === 'Pending');
  const totalPaidRevenue = state.invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 surface-strong rounded-2xl p-6 gold-border">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Studio Operations · Executive Command</div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Welcome back, Principal Admin</h2>
          <p className="text-xs text-stone-400 mt-1">
            System running optimal. {activeProjects.length} active builds in progress, {openLeads.length} unreviewed client inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('leads')}
            className="btn-gold rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            📥 Review Leads ({openLeads.length})
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className="btn-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            + New Build
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface rounded-2xl p-5 border hairline">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Total Collected Revenue</span>
            <span className="text-gold">💵</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-2 tabular-nums">
            ${totalPaidRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-lime-300 mt-1 font-medium">↑ +18.4% vs last month</div>
        </div>

        <div className="surface rounded-2xl p-5 border hairline">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Active Builds in Flight</span>
            <span className="text-gold">🚀</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-2 tabular-nums">
            {activeProjects.length}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 font-medium">Out of {state.projects.length} total projects</div>
        </div>

        <div className="surface rounded-2xl p-5 border hairline">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Open Inquiries</span>
            <span className="text-gold">📩</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-2 tabular-nums">
            {openLeads.length}
          </div>
          <div className="text-[10px] text-[#e3c893] mt-1 font-medium">Needs team response</div>
        </div>

        <div className="surface rounded-2xl p-5 border hairline">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Pending Receivables</span>
            <span className="text-gold">📑</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-2 tabular-nums">
            ${pendingInvoices.reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-300 mt-1 font-medium">{pendingInvoices.length} invoices awaiting payment</div>
        </div>
      </div>

      {/* Grid of Active Builds & Recent Leads */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Builds (2 Cols) */}
        <div className="lg:col-span-2 surface rounded-2xl p-6 border hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b hairline">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Active Builds Pipeline</h3>
              <p className="text-xs text-stone-400">Current client developments in engineering & QA phase</p>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs text-gold hover:underline"
            >
              View All Projects →
            </button>
          </div>

          <div className="space-y-3">
            {state.projects.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border hairline hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] text-stone-500">{p.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'Shipped' ? 'bg-lime-400/10 text-lime-300' : 'bg-gold/10 text-gold'
                    }`}>
                      ● {p.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <div className="text-xs text-stone-400">{p.clientName} · Due {p.dueDate}</div>
                </div>

                <div className="w-full sm:w-48 space-y-1">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Progress</span>
                    <span className="font-bold text-white">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#a5854e] to-[#e3c893]" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Leads Stream (1 Col) */}
        <div className="surface rounded-2xl p-6 border hairline space-y-4">
          <div className="flex items-center justify-between pb-3 border-b hairline">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Inquiries</h3>
              <p className="text-xs text-stone-400">Inbound project requests</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs text-gold hover:underline"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3">
            {state.leads.map((l) => (
              <div key={l.id} className="p-3.5 rounded-xl bg-white/[0.02] border hairline space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{l.company}</span>
                  <span className="mono text-[9px] text-[#e3c893] bg-[#c9a86c]/10 px-2 py-0.5 rounded-md border border-[#c9a86c]/20">
                    {l.status}
                  </span>
                </div>
                <div className="text-xs text-stone-300">{l.service} ({l.budget})</div>
                <div className="text-[10px] text-stone-500 flex justify-between">
                  <span>{l.name}</span>
                  <span>{l.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
