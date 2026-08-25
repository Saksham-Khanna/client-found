import React, { useState } from 'react';
import { studioStore, Project } from '../../store/studioStore';

interface Props {
  onNotification: (msg: string) => void;
}

export const ProjectsManager: React.FC<Props> = ({ onNotification }) => {
  const state = studioStore.getState();
  const [selectedPrj, setSelectedPrj] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form for New Project
  const [newForm, setNewForm] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    type: 'Web Development',
    budget: '$35,000',
    dueDate: '2026-09-30',
    stagingUrl: '',
    githubRepo: '',
  });

  // Milestone input for active project view
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.clientName || !newForm.clientEmail) {
      alert('Please fill in required fields.');
      return;
    }

    const prj = studioStore.addProject({
      name: newForm.name,
      clientName: newForm.clientName,
      clientEmail: newForm.clientEmail,
      type: newForm.type,
      progress: 0,
      status: 'In Progress',
      budget: newForm.budget,
      dueDate: newForm.dueDate,
      stagingUrl: newForm.stagingUrl || `https://${newForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-dev.clientfound.app`,
      githubRepo: newForm.githubRepo || `github.com/clientfound/${newForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      team: [
        { name: 'Ana S.', role: 'Lead Architect', avatarBg: 'bg-[#c9a86c]' },
        { name: 'Tom W.', role: 'Senior Frontend', avatarBg: 'bg-[#8fa3b8]' },
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Kickoff & UI/UX Figma Design', completed: true, dueDate: 'Week 1' },
        { id: `m-${Date.now()}-2`, title: 'Frontend Component Architecture', completed: false, dueDate: 'Week 2' },
        { id: `m-${Date.now()}-3`, title: 'Backend API & DB Integration', completed: false, dueDate: 'Week 4' },
      ],
    });

    onNotification(`Created active project "${prj.name}" (${prj.id})`);
    setIsCreating(false);
    setNewForm({
      name: '',
      clientName: '',
      clientEmail: '',
      type: 'Web Development',
      budget: '$35,000',
      dueDate: '2026-09-30',
      stagingUrl: '',
      githubRepo: '',
    });
  };

  const handleToggleMilestone = (prjId: string, milestoneId: string) => {
    studioStore.toggleMilestone(prjId, milestoneId);
    onNotification('Milestone updated!');
    // refresh selectedPrj view
    const updated = studioStore.getState().projects.find((p) => p.id === prjId);
    if (updated) setSelectedPrj({ ...updated });
  };

  const handleAddMilestone = (prjId: string) => {
    if (!newMilestoneTitle.trim()) return;
    const prj = state.projects.find((p) => p.id === prjId);
    if (prj) {
      const updatedMilestones = [
        ...prj.milestones,
        { id: `m-${Date.now()}`, title: newMilestoneTitle, completed: false, dueDate: 'Next Sprint' },
      ];
      studioStore.updateProject(prjId, { milestones: updatedMilestones });
      setNewMilestoneTitle('');
      onNotification('Added new milestone');
      const updated = studioStore.getState().projects.find((p) => p.id === prjId);
      if (updated) setSelectedPrj({ ...updated });
    }
  };

  const handleStatusChange = (prjId: string, status: Project['status']) => {
    studioStore.updateProject(prjId, { status });
    onNotification(`Project status updated to ${status}`);
    if (selectedPrj?.id === prjId) {
      setSelectedPrj({ ...selectedPrj, status });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b hairline">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Studio Portfolio & Deliverables</div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Projects & Build Tracker</h2>
          <p className="text-xs text-stone-400">Manage client software deployments, milestones, and staging links</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn-gold rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2"
        >
          + Add New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.projects.map((p) => (
          <div key={p.id} className="surface rounded-2xl p-6 border hairline flex flex-col justify-between card-lift space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] text-gold">{p.id}</span>
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as Project['status'])}
                  className="bg-[#12141a] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-gold font-medium"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="QA Review">QA Review</option>
                  <option value="Shipped">Shipped</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <h3 className="text-base font-bold text-white">{p.name}</h3>
              <div className="text-xs text-stone-400">{p.clientName} ({p.clientEmail})</div>
            </div>

            {/* Progress */}
            <div className="space-y-1 bg-white/[0.02] p-3 rounded-xl border hairline">
              <div className="flex justify-between text-xs">
                <span className="text-stone-400">Completion</span>
                <span className="font-bold text-gold">{p.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a5854e] to-[#e3c893]" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="text-[10px] text-stone-500 pt-1 flex justify-between">
                <span>Budget: {p.budget}</span>
                <span>Due: {p.dueDate}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href={p.stagingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-stone-400 hover:text-white flex items-center gap-1"
              >
                🔗 Staging ↗
              </a>
              <button
                onClick={() => setSelectedPrj(p)}
                className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                Manage Milestones ({p.milestones.filter(m => m.completed).length}/{p.milestones.length}) →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4">
          <div className="surface-strong rounded-3xl p-6 sm:p-8 gold-border w-full max-w-lg space-y-4 animate-modal-in">
            <div className="flex justify-between items-center pb-3 border-b hairline">
              <h3 className="text-lg font-bold text-white">Create New Active Project</h3>
              <button onClick={() => setIsCreating(false)} className="text-stone-400">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="e.g. Apex Health Mobile App"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-semibold mb-1 block">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={newForm.clientName}
                    onChange={(e) => setNewForm({ ...newForm, clientName: e.target.value })}
                    placeholder="e.g. David Ross"
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-semibold mb-1 block">Client Email *</label>
                  <input
                    type="email"
                    required
                    value={newForm.clientEmail}
                    onChange={(e) => setNewForm({ ...newForm, clientEmail: e.target.value })}
                    placeholder="david@apex.com"
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-semibold mb-1 block">Budget</label>
                  <input
                    type="text"
                    value={newForm.budget}
                    onChange={(e) => setNewForm({ ...newForm, budget: e.target.value })}
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-semibold mb-1 block">Target Due Date</label>
                  <input
                    type="date"
                    value={newForm.dueDate}
                    onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsCreating(false)} className="btn-ghost rounded-xl px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="btn-gold rounded-xl px-6 py-2 font-bold">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MILESTONE MANAGEMENT MODAL */}
      {selectedPrj && (
        <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4">
          <div className="surface-strong rounded-3xl p-6 sm:p-8 gold-border w-full max-w-xl space-y-5 animate-modal-in">
            <div className="flex items-center justify-between pb-3 border-b hairline">
              <div>
                <span className="mono text-[10px] text-gold">{selectedPrj.id}</span>
                <h3 className="text-xl font-bold text-white">{selectedPrj.name}</h3>
              </div>
              <button onClick={() => setSelectedPrj(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            {/* MILESTONE SECTION */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Sprint Milestones Checklist</h4>
              <div className="space-y-2">
                {selectedPrj.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(selectedPrj.id, m.id)}
                    className="flex items-center justify-between p-3 rounded-xl surface cursor-pointer hover:border-gold/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${m.completed ? 'bg-lime-400 text-black' : 'bg-stone-800 text-stone-500'}`}>
                        {m.completed ? '✓' : '○'}
                      </div>
                      <span className={`text-xs ${m.completed ? 'text-stone-400 line-through' : 'text-white font-medium'}`}>{m.title}</span>
                    </div>
                    <span className="mono text-[10px] text-stone-500">{m.dueDate}</span>
                  </div>
                ))}
              </div>

              {/* Add New Milestone */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="Add new milestone feature title..."
                  className="flex-1 bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddMilestone(selectedPrj.id)}
                  className="btn-gold rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* PROJECT DELIVERABLES / ASSETS SECTION */}
            <div className="space-y-3 pt-3 border-t hairline">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Deliverables & Assets (Figma, APK, Code)</h4>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {state.assets.filter((a) => a.projectId === selectedPrj.id).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-2.5 rounded-xl surface text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm">📦</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{asset.title}</div>
                        <div className="text-[10px] text-stone-400">{asset.category} · {asset.version || 'v1.0'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a href={asset.url} target="_blank" rel="noreferrer" className="text-gold hover:underline text-[11px]">
                        Open ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          studioStore.deleteProjectAsset(asset.id);
                          onNotification('Asset removed');
                        }}
                        className="text-stone-500 hover:text-red-400 text-xs px-1"
                        title="Delete asset"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {state.assets.filter((a) => a.projectId === selectedPrj.id).length === 0 && (
                  <div className="text-[11px] text-stone-500 py-2">No deliverables added yet.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedPrj(null)} className="btn-primary rounded-xl px-6 py-2 text-xs font-semibold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
