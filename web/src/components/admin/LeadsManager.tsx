import React, { useState, useEffect, useRef } from 'react';
import { studioStore, Lead, Project } from '../../store/studioStore';

interface Props {
  onNotification: (msg: string) => void;
  onOpenProject?: (projectId: string) => void;
}

type LeadFilter = 'All' | Lead['status'];

const FILTERS: LeadFilter[] = ['All', 'New', 'Reviewing', 'Quoted', 'Approved', 'Rejected'];

const STATUS_META: Record<Lead['status'], { dot: string; pill: string; ring: string }> = {
  New: { dot: 'bg-sky-400', pill: 'bg-sky-400/10 text-sky-300 border-sky-400/30', ring: 'hover:border-sky-400/60' },
  Reviewing: { dot: 'bg-amber-400', pill: 'bg-amber-400/10 text-amber-300 border-amber-400/30', ring: 'hover:border-amber-400/60' },
  Quoted: { dot: 'bg-gold', pill: 'bg-gold/10 text-[#e3c893] border-gold/30', ring: 'hover:border-gold/60' },
  Approved: { dot: 'bg-lime-400', pill: 'bg-lime-400/10 text-lime-300 border-lime-400/30', ring: 'hover:border-lime-400/60' },
  Rejected: { dot: 'bg-red-400', pill: 'bg-red-400/10 text-red-400 border-red-400/30', ring: 'hover:border-red-400/60' },
};

const SERVICES = ['Web Development', 'Mobile Apps', 'Product Design', 'Performance & Scale'];

const TEAM_ROSTER = [
  { id: 'ana', name: 'Ana S.', role: 'Lead Engineer', avatarBg: 'bg-[#c9a86c]' },
  { id: 'tom', name: 'Tom W.', role: 'Fullstack Dev', avatarBg: 'bg-[#8fa3b8]' },
  { id: 'mia', name: 'Mia L.', role: 'UI/UX Designer', avatarBg: 'bg-[#7c9a8c]' },
  { id: 'raj', name: 'Raj K.', role: 'Backend Engineer', avatarBg: 'bg-[#a38f8f]' },
  { id: 'zoe', name: 'Zoe P.', role: 'QA Engineer', avatarBg: 'bg-[#8f8fa3]' },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const dueDateInDays = (days: number) => {
  const d = new Date(Date.now() + days * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface WizardMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface WizardForm {
  name: string;
  type: string;
  budget: string;
  dueDate: string;
  stagingUrl: string;
  githubRepo: string;
  progress: number;
  team: string[];
  milestones: WizardMilestone[];
}

function StatusPill({ value, onChange }: { value: Lead['status']; onChange: (s: Lead['status']) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const meta = STATUS_META[value];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${meta.pill} ${meta.ring}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {value}
        <span className="text-[8px] opacity-60">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-40 surface-strong rounded-xl p-1.5 shadow-2xl shadow-black/60 z-30 animate-modal-in">
          {(Object.keys(STATUS_META) as Lead['status'][]).map((s) => (
            <button
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                s === value ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const LeadsManager: React.FC<Props> = ({ onNotification, onOpenProject }) => {
  const [filter, setFilter] = useState<LeadFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const [convertForm, setConvertForm] = useState<WizardForm | null>(null);

  const state = studioStore.getState();

  const q = searchQuery.trim().toLowerCase();
  const leadsList = state.leads.filter((l) => {
    if (filter !== 'All' && l.status !== filter) return false;
    if (!q) return true;
    return [l.id, l.name, l.company, l.email, l.service, l.budget].some((f) => f.toLowerCase().includes(q));
  });

  const projectForLead = (lead: Lead): Project | undefined =>
    state.projects.find((p) => p.clientEmail.toLowerCase() === lead.email.toLowerCase());

  const stats = {
    total: state.leads.length,
    fresh: state.leads.filter((l) => l.status === 'New').length,
    inReview: state.leads.filter((l) => l.status === 'Reviewing' || l.status === 'Quoted').length,
    converted: state.leads.filter((l) => l.status === 'Approved').length,
  };
  const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0;

  const handleStatusChange = (id: string, status: Lead['status']) => {
    studioStore.updateLeadStatus(id, status);
    onNotification(`Lead status updated to ${status}`);
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status });
    }
  };

  const openConvertWizard = (lead: Lead) => {
    const base = slug(lead.company);
    setConvertLead(lead);
    setConvertForm({
      name: `${lead.company} ${lead.service}`.trim(),
      type: lead.service,
      budget: lead.budget,
      dueDate: dueDateInDays(45),
      stagingUrl: `https://${base}-dev.clientfound.app`,
      githubRepo: `github.com/clientfound/${base}`,
      progress: 10,
      team: ['ana', 'tom'],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Project Kickoff & Figma Design Signoff', dueDate: 'Week 1', completed: true },
        { id: `m-${Date.now()}-2`, title: 'Core Architecture & API Integrations', dueDate: 'Week 3', completed: false },
        { id: `m-${Date.now()}-3`, title: 'QA Testing & Final Deployment', dueDate: 'Week 5', completed: false },
      ],
    });
  };

  const closeConvertWizard = () => {
    setConvertLead(null);
    setConvertForm(null);
  };

  const toggleTeam = (id: string) => {
    if (!convertForm) return;
    const team = convertForm.team.includes(id)
      ? convertForm.team.filter((t) => t !== id)
      : [...convertForm.team, id];
    setConvertForm({ ...convertForm, team });
  };

  const updateMilestone = (index: number, patch: Partial<WizardMilestone>) => {
    if (!convertForm) return;
    const milestones = convertForm.milestones.map((m, i) => (i === index ? { ...m, ...patch } : m));
    setConvertForm({ ...convertForm, milestones });
  };

  const addMilestone = () => {
    if (!convertForm) return;
    setConvertForm({
      ...convertForm,
      milestones: [
        ...convertForm.milestones,
        { id: `m-${Date.now()}`, title: '', dueDate: 'Week 6', completed: false },
      ],
    });
  };

  const removeMilestone = (index: number) => {
    if (!convertForm) return;
    setConvertForm({
      ...convertForm,
      milestones: convertForm.milestones.filter((_, i) => i !== index),
    });
  };

  const handleConfirmConvert = () => {
    if (!convertLead || !convertForm) return;
    if (!convertForm.name.trim()) {
      alert('Please enter a project title.');
      return;
    }
    if (convertForm.team.length === 0) {
      alert('Assign at least one team member.');
      return;
    }

    const team = TEAM_ROSTER.filter((m) => convertForm.team.includes(m.id)).map((m) => ({
      name: m.name,
      role: m.role,
      avatarBg: m.avatarBg,
    }));
    const milestones = convertForm.milestones.map((m) => ({
      id: m.id,
      title: m.title.trim() || 'Untitled milestone',
      dueDate: m.dueDate,
      completed: m.completed,
    }));

    const prj = studioStore.convertLeadToProject(convertLead.id, {
      name: convertForm.name,
      type: convertForm.type,
      budget: convertForm.budget,
      dueDate: convertForm.dueDate,
      stagingUrl: convertForm.stagingUrl || `https://${slug(convertForm.name)}-dev.clientfound.app`,
      githubRepo: convertForm.githubRepo || `github.com/clientfound/${slug(convertForm.name)}`,
      progress: Math.max(0, Math.min(100, convertForm.progress || 0)),
      team,
      milestones,
    });

    if (prj) {
      onNotification(`Converted "${prj.name}" into active build (${prj.id})!`);
      setSelectedLead(null);
      closeConvertWizard();
      onOpenProject?.(prj.id);
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard?.writeText(email).then(
      () => onNotification(`Copied ${email}`),
      () => onNotification(`Copied ${email}`)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b hairline">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Inbound Pipeline</div>
          <h2 className="text-xl font-bold text-white tracking-tight">Client Leads & Project Inquiries</h2>
          <p className="text-xs text-stone-400">Review project briefs submitted from the landing page</p>
        </div>

        {/* Search + Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#0a0c10] border border-white/10 rounded-xl px-3 py-1.5 text-xs w-52">
            <span className="text-stone-500 mr-2">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, company, email..."
              className="bg-transparent text-white focus:outline-none w-full"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 bg-white/[0.03] p-1.5 rounded-xl border hairline">
            {FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === st
                    ? 'bg-gold text-[#0a0c10] font-bold shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Total Leads</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">{stats.total}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">All-time inbound</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> New
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">{stats.fresh}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Awaiting first touch</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> In Review
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">{stats.inReview}</div>
          <div className="text-[10px] text-stone-500 mt-0.5">Reviewing / quoted</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" /> Conversion
          </div>
          <div className="text-2xl font-bold text-[#e3c893] mt-1 tabular-nums">{conversionRate}%</div>
          <div className="text-[10px] text-stone-500 mt-0.5">{stats.converted} converted to builds</div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="surface rounded-2xl border hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b hairline bg-white/[0.02] text-[10px] uppercase tracking-wider text-stone-400">
                <th className="p-4">Lead ID</th>
                <th className="p-4">Client / Company</th>
                <th className="p-4">Requested Service</th>
                <th className="p-4">Budget Range</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline text-xs text-stone-300">
              {leadsList.map((lead) => {
                const proj = projectForLead(lead);
                return (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 mono font-semibold text-gold">{lead.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{lead.company}</div>
                      <div className="text-[11px] text-stone-400">{lead.name} · {lead.email}</div>
                    </td>
                    <td className="p-4">{lead.service}</td>
                    <td className="p-4 font-medium text-stone-200">{lead.budget}</td>
                    <td className="p-4 mono text-[10px] text-stone-500">{lead.createdAt}</td>
                    <td className="p-4">
                      <StatusPill value={lead.status} onChange={(s) => handleStatusChange(lead.id, s)} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="btn-ghost rounded-lg px-3 py-1 text-xs"
                        >
                          View Brief
                        </button>
                        {lead.status === 'Approved' ? (
                          proj && (
                            <button
                              onClick={() => onOpenProject?.(proj.id)}
                              className="btn-ghost rounded-lg px-3 py-1 text-xs border-lime-400/30 text-lime-300 hover:bg-lime-400/10"
                            >
                              🔗 View Build
                            </button>
                          )
                        ) : lead.status === 'Rejected' ? null : (
                          <button
                            onClick={() => openConvertWizard(lead)}
                            className="btn-gold rounded-lg px-3 py-1 text-xs font-semibold"
                          >
                            ⚡ Convert to Build
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {leadsList.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    {q
                      ? `No leads match your search "${searchQuery}".`
                      : `No leads found matching filter "${filter}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4">
          <div className="surface-strong rounded-3xl p-6 sm:p-8 gold-border w-full max-w-xl space-y-5 animate-modal-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b hairline">
              <div>
                <span className="mono text-[10px] text-gold">{selectedLead.id}</span>
                <h3 className="text-xl font-bold text-white">{selectedLead.company}</h3>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 surface rounded-xl">
                <span className="text-stone-500 block text-[10px]">Contact Person</span>
                <span className="font-semibold text-white">{selectedLead.name}</span>
              </div>
              <div className="p-3 surface rounded-xl">
                <span className="text-stone-500 block text-[10px]">Email Address</span>
                <span className="font-semibold text-white break-all">{selectedLead.email}</span>
              </div>
              <div className="p-3 surface rounded-xl">
                <span className="text-stone-500 block text-[10px]">Requested Service</span>
                <span className="font-semibold text-white">{selectedLead.service}</span>
              </div>
              <div className="p-3 surface rounded-xl">
                <span className="text-stone-500 block text-[10px]">Budget & Timeline</span>
                <span className="font-semibold text-[#e3c893]">{selectedLead.budget} ({selectedLead.timeline})</span>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`mailto:${selectedLead.email}?subject=Client%20Found%20-%20Project%20Inquiry%20${selectedLead.id}`}
                className="btn-ghost rounded-xl px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                ✉️ Email Client
              </a>
              <button
                onClick={() => copyEmail(selectedLead.email)}
                className="btn-ghost rounded-xl px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                📋 Copy Email
              </button>
              <div className="ml-auto flex items-center">
                <StatusPill value={selectedLead.status} onChange={(s) => handleStatusChange(selectedLead.id, s)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-400">Client Brief & Scope Notes:</label>
              <div className="p-4 surface rounded-xl text-xs text-stone-300 leading-relaxed bg-black/30">
                "{selectedLead.description}"
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="btn-ghost rounded-xl px-4 py-2 text-xs"
              >
                Close
              </button>
              {selectedLead.status === 'Approved' ? (
                (() => {
                  const proj = projectForLead(selectedLead);
                  return proj ? (
                    <button
                      onClick={() => {
                        setSelectedLead(null);
                        onOpenProject?.(proj.id);
                      }}
                      className="btn-ghost rounded-xl px-5 py-2 text-xs font-bold border-lime-400/30 text-lime-300 hover:bg-lime-400/10"
                    >
                      🔗 View Build {proj.id}
                    </button>
                  ) : null;
                })()
              ) : selectedLead.status === 'Rejected' ? null : (
                <button
                  onClick={() => openConvertWizard(selectedLead)}
                  className="btn-gold rounded-xl px-5 py-2 text-xs font-bold"
                >
                  ⚡ Convert Lead into Active Studio Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Convert to Build Wizard */}
      {convertLead && convertForm && (
        <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4">
          <div className="surface-strong rounded-3xl p-6 sm:p-8 gold-border w-full max-w-3xl space-y-5 animate-modal-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b hairline">
              <div>
                <span className="mono text-[10px] text-gold">{convertLead.id} · Lead Conversion</span>
                <h3 className="text-xl font-bold text-white">Convert to Active Build</h3>
                <p className="text-xs text-stone-400 mt-0.5">Configure the project before kickoff — everything is pre-filled from the lead brief.</p>
              </div>
              <button onClick={closeConvertWizard} className="text-stone-400 hover:text-white">✕</button>
            </div>

            {/* Lead brief */}
            <div className="p-4 surface rounded-2xl border hairline text-xs space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-white">{convertLead.company}</span>
                <span className="text-stone-400">{convertLead.name} · {convertLead.email}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-400">
                <span>Service: <span className="text-stone-200 font-medium">{convertLead.service}</span></span>
                <span>Budget: <span className="text-gold font-medium">{convertLead.budget}</span></span>
                <span>Timeline: <span className="text-stone-200 font-medium">{convertLead.timeline}</span></span>
              </div>
              {convertLead.description && (
                <div className="text-stone-500 leading-relaxed mt-1">"{convertLead.description}"</div>
              )}
            </div>

            {/* Core fields */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-stone-400 font-semibold mb-1 block">Project Title *</label>
                <input
                  type="text"
                  value={convertForm.name}
                  onChange={(e) => setConvertForm({ ...convertForm, name: e.target.value })}
                  placeholder="e.g. Slate Analytics Dashboard"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Service / Type</label>
                <select
                  value={convertForm.type}
                  onChange={(e) => setConvertForm({ ...convertForm, type: e.target.value })}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Budget</label>
                <input
                  type="text"
                  value={convertForm.budget}
                  onChange={(e) => setConvertForm({ ...convertForm, budget: e.target.value })}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Target Due Date</label>
                <input
                  type="date"
                  value={convertForm.dueDate}
                  onChange={(e) => setConvertForm({ ...convertForm, dueDate: e.target.value })}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Initial Progress (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={convertForm.progress}
                  onChange={(e) => setConvertForm({ ...convertForm, progress: Number(e.target.value) })}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Staging URL</label>
                <input
                  type="text"
                  value={convertForm.stagingUrl}
                  onChange={(e) => setConvertForm({ ...convertForm, stagingUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">GitHub Repo</label>
                <input
                  type="text"
                  value={convertForm.githubRepo}
                  onChange={(e) => setConvertForm({ ...convertForm, githubRepo: e.target.value })}
                  placeholder="github.com/clientfound/..."
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Team assignment */}
            <div>
              <label className="text-xs text-stone-400 font-semibold block">Assign Team *</label>
              <div className="grid sm:grid-cols-2 gap-2 mt-1.5">
                {TEAM_ROSTER.map((m) => {
                  const on = convertForm.team.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleTeam(m.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left ${
                        on
                          ? 'bg-gold/10 border-gold/40'
                          : 'surface border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0a0c10] ${m.avatarBg}`}>
                        {m.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-xs truncate">{m.name}</div>
                        <div className="text-[10px] text-stone-400 truncate">{m.role}</div>
                      </div>
                      <span
                        className={`ml-auto w-4 h-4 rounded-md border flex items-center justify-center text-[9px] flex-shrink-0 ${
                          on ? 'bg-gold border-gold text-[#0a0c10]' : 'border-white/20'
                        }`}
                      >
                        {on ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-stone-400 font-semibold">Milestone Schedule</label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="btn-ghost rounded-lg px-2.5 py-1 text-[10px] font-medium"
                >
                  + Add Milestone
                </button>
              </div>
              <div className="space-y-2 mt-1.5">
                {convertForm.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-xl surface border hairline">
                    <button
                      type="button"
                      onClick={() => updateMilestone(i, { completed: !m.completed })}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        m.completed ? 'bg-lime-400 border-lime-400 text-black' : 'border-white/20 text-stone-500'
                      }`}
                      title={m.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {m.completed ? '✓' : '○'}
                    </button>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => updateMilestone(i, { title: e.target.value })}
                      placeholder="Milestone title..."
                      className="flex-1 min-w-0 bg-transparent text-xs text-white focus:outline-none placeholder:text-stone-600"
                    />
                    <input
                      type="text"
                      value={m.dueDate}
                      onChange={(e) => updateMilestone(i, { dueDate: e.target.value })}
                      placeholder="Week 4"
                      className="w-20 bg-transparent text-center text-[10px] mono text-stone-400 focus:outline-none focus:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="text-stone-500 hover:text-red-400 flex-shrink-0"
                      title="Remove milestone"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t hairline">
              <button onClick={closeConvertWizard} className="btn-ghost rounded-xl px-4 py-2 text-xs">
                Cancel
              </button>
              <button
                onClick={handleConfirmConvert}
                className="btn-gold rounded-xl px-6 py-2.5 text-xs font-bold flex items-center gap-2"
              >
                ⚡ Create Project & Notify Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
