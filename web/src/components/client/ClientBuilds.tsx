import React from 'react';
import { UserProfile, Project, Milestone } from '../../store/studioStore';

interface Props {
  user: UserProfile;
  projects: Project[];
}

const STATUS_STYLES: Record<Project['status'], string> = {
  'In Progress': 'bg-gold/20 text-gold border-gold/30',
  'QA Review': 'bg-sky-400/20 text-sky-300 border-sky-400/30',
  'Shipped': 'bg-lime-400/20 text-lime-300 border-lime-400/30',
  'On Hold': 'bg-stone-500/20 text-stone-300 border-stone-400/30',
};

function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const firstIncomplete = milestones.findIndex((m) => !m.completed);

  return (
    <div className="relative pl-8">
      {/* Connecting line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

      {milestones.map((m, i) => {
        const isUpNext = i === firstIncomplete;
        return (
          <div key={m.id} className="relative pb-5 last:pb-0">
            {/* Dot */}
            <div
              className={`absolute -left-8 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                m.completed
                  ? 'bg-lime-400 text-black border-lime-300'
                  : isUpNext
                  ? 'bg-[#12141a] text-gold border-gold ring-2 ring-gold/30'
                  : 'bg-[#12141a] text-stone-600 border-stone-600'
              }`}
            >
              {m.completed ? '✓' : '•'}
            </div>

            <div
              className={`rounded-xl p-3 border text-xs ${
                isUpNext
                  ? 'bg-[#c9a86c]/10 border-[#c9a86c]/40'
                  : 'bg-white/[0.02] border hairline'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={m.completed ? 'text-stone-400 line-through' : 'text-white font-semibold'}>
                  {m.title}
                </span>
                <span className="mono text-[9px] text-stone-500 flex-shrink-0">{m.dueDate}</span>
              </div>
              {isUpNext && (
                <div className="mono text-[9px] uppercase tracking-wider text-gold mt-1.5">▲ Up next in your build</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const ClientBuilds: React.FC<Props> = ({ user, projects }) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">My Builds</h1>
          <p className="text-xs text-stone-400 mt-0.5">Live milestones, staging previews and deliverables for your projects.</p>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="py-16 text-center surface rounded-2xl border hairline space-y-3">
          <div className="text-4xl">🚀</div>
          <h3 className="text-base font-bold text-white">No Builds Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            No active projects are linked to <span className="text-white font-semibold">{user.email}</span>. New builds will
            appear here as soon as they're scoped.
          </p>
        </div>
      )}

      {projects.map((p) => {
        const done = p.milestones.filter((m) => m.completed).length;
        return (
          <div key={p.id} className="surface rounded-2xl p-5 sm:p-6 border hairline space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="mono text-[10px] text-gold">{p.id}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${STATUS_STYLES[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{p.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500 mt-1.5">
                  <span>📦 {p.type}</span>
                  <span>💰 {p.budget}</span>
                  <span>📅 Launch {p.dueDate}</span>
                  <span>🔄 Updated {p.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={p.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost rounded-xl px-3.5 py-2 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <span className="text-sm leading-none">⌨️</span> Repo
                </a>
                <a
                  href={p.stagingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary rounded-xl px-3.5 py-2 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  🌐 Open Staging ↗
                </a>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5 bg-black/30 p-4 rounded-xl border hairline">
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Completion Progress</span>
                <span className="font-bold text-gold tabular-nums">{p.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a5854e] to-[#e3c893]" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="text-[10px] text-stone-500">{done} / {p.milestones.length} milestones delivered</div>
            </div>

            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs uppercase tracking-wider text-stone-300 font-semibold">Sprint Milestones & Deliverables</h4>
              </div>
              <MilestoneTimeline milestones={p.milestones} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
