import React from 'react';
import { UserProfile, Project, Invoice, CMSConfig } from '../../store/studioStore';

interface Props {
  user: UserProfile;
  projects: Project[];
  invoices: Invoice[];
  cms: CMSConfig;
  onNavigate: (tab: string) => void;
  onOpenInquiry: () => void;
}

export const ClientOverview: React.FC<Props> = ({ user, projects, invoices, cms, onNavigate, onOpenInquiry }) => {
  const activeBuilds = projects.filter((p) => p.status !== 'Shipped');
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === 'Pending');
  const pendingSum = pending.reduce((s, i) => s + i.amount, 0);

  const allMilestones = activeBuilds.flatMap((p) =>
    p.milestones.filter((m) => !m.completed).map((m) => ({ ...m, project: p }))
  );
  const nextMilestone = allMilestones.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="surface-strong rounded-2xl p-5 gold-border relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#c9a86c]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Welcome back</div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">{firstName} 👋</h1>
          <p className="text-xs text-stone-400 mt-1 max-w-lg leading-relaxed">
            {cms.openSlotsText ? `${cms.openSlotsText}. ` : ''}
            Your builds are progressing on schedule — here's a snapshot of your workspace.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Active Builds</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">{activeBuilds.length}</div>
          <div className="text-[10px] text-gold mt-0.5">Live engineering phase</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Total Spent</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">${totalPaid.toLocaleString()}</div>
          <div className="text-[10px] text-lime-300 mt-0.5">Paid invoices</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Pending</div>
          <div className="text-2xl font-bold text-amber-300 mt-1 tabular-nums">${pendingSum.toLocaleString()}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">{pending.length} invoice{pending.length === 1 ? '' : 's'} due</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Next Milestone</div>
          <div className="text-sm font-bold text-white mt-1.5 leading-snug">{nextMilestone ? nextMilestone.title.slice(0, 34) : '—'}</div>
          <div className="text-[10px] text-gold mt-0.5">{nextMilestone ? nextMilestone.dueDate : 'All caught up'}</div>
        </div>
      </div>

      {/* Next Action Card */}
      <div className="surface rounded-2xl p-5 border border-[#c9a86c]/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs">⚡</span>
            <h3 className="text-sm font-bold text-white">What's Next</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('builds')} className="btn-ghost rounded-xl px-3 py-1.5 text-[11px] font-semibold">
              View Builds
            </button>
            {pending.length > 0 && (
              <button onClick={() => onNavigate('invoices')} className="btn-gold rounded-xl px-3 py-1.5 text-[11px] font-semibold">
                Pay Invoices
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-stone-400 leading-relaxed">
          {nextMilestone ? (
            <>
              Next up in <span className="text-white font-bold">{nextMilestone.project.name}</span> —{' '}
              <span className="text-white font-semibold">{nextMilestone.title}</span> due by{' '}
              <span className="text-gold font-semibold">{nextMilestone.dueDate}</span>. Our engineers will share staging updates
              as each phase completes.
            </>
          ) : (
            <>
              All current milestones are complete. Ready to scope your next build?{' '}
              <button onClick={onOpenInquiry} className="text-gold underline font-semibold">Submit a new project brief</button>.
            </>
          )}
        </div>
      </div>

      {/* Recent Builds Snapshot */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold px-1">Build Snapshot</h3>
        {projects.slice(0, 2).map((p) => (
          <div key={p.id} className="surface rounded-2xl p-4 border hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="mono text-[10px] text-gold">{p.id}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                  p.status === 'Shipped' ? 'bg-lime-400/20 text-lime-300 border-lime-400/30'
                  : p.status === 'On Hold' ? 'bg-stone-500/20 text-stone-300 border-stone-400/30'
                  : 'bg-gold/20 text-gold border-gold/30'
                }`}>{p.status}</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 truncate">{p.name}</h4>
              <div className="text-[10px] text-stone-500 mt-0.5">{p.type} · {p.budget} · due {p.dueDate}</div>
            </div>
            <div className="sm:w-40 space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-stone-500">Progress</span>
                <span className="font-bold text-gold">{p.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a5854e] to-[#e3c893]" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="py-10 text-center surface rounded-2xl border hairline space-y-3">
            <div className="text-3xl">📁</div>
            <h3 className="text-base font-bold text-white">No Active Builds Yet</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">Submit a project brief to kick off your custom build with Client Found Studios.</p>
            <button onClick={onOpenInquiry} className="btn-gold rounded-xl px-5 py-2.5 text-xs font-bold">
              Submit Project Brief →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
