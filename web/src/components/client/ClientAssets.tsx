import React, { useState } from 'react';
import { Project, ProjectAsset, studioStore } from '../../store/studioStore';
import { showToast } from '../../store/toast';

interface Props {
  projects: Project[];
  assets: ProjectAsset[];
}

const CATEGORY_META = {
  design: { label: 'Design & Figma', icon: '🎨', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  build: { label: 'Live Builds & APKs', icon: '🚀', color: 'text-lime-400 bg-lime-400/10 border-lime-400/20' },
  code: { label: 'Code & Repos', icon: '⌨️', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  document: { label: 'Specs & Contracts', icon: '📄', color: 'text-gold bg-gold/10 border-gold/20' },
  brand: { label: 'Brand Assets', icon: '💎', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
};

export const ClientAssets: React.FC<Props> = ({ projects, assets }) => {
  const [filterCategory, setFilterCategory] = useState<'All' | ProjectAsset['category']>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectAsset['category']>('brand');
  const [newUrl, setNewUrl] = useState('');
  const [newVersion, setNewVersion] = useState('v1.0');
  const [targetProject, setTargetProject] = useState(projects[0]?.id || 'GENERAL');

  const filteredAssets = assets.filter((a) => {
    if (filterCategory !== 'All' && a.category !== filterCategory) return false;
    if (selectedProjectId !== 'All' && a.projectId !== selectedProjectId) return false;
    return true;
  });

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) {
      alert('Please fill in title and URL.');
      return;
    }

    try {
      await studioStore.addProjectAsset({
        projectId: targetProject,
        title: newTitle,
        category: newCategory,
        url: newUrl,
        version: newVersion,
      });
      showToast(`Asset "${newTitle}" uploaded successfully!`);
      setShowUploadModal(false);
      setNewTitle('');
      setNewUrl('');
    } catch {
      showToast('Failed to add asset.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Assets & Deliverables Hub</h1>
          <p className="text-xs text-stone-400 mt-0.5">Production builds, Figma prototypes, APK downloads, and brand media repository.</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-gold rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md"
        >
          + Upload Brand Asset / Link
        </button>
      </div>

      {/* Filter Tabs & Project Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 surface p-3 rounded-2xl border hairline">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'design', 'build', 'code', 'document', 'brand'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-gold text-black shadow'
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'All' ? 'All Deliverables' : CATEGORY_META[cat].label}
            </button>
          ))}
        </div>

        {projects.length > 1 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#12141a] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-gold"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="py-16 text-center surface rounded-2xl border hairline space-y-3">
          <div className="text-3xl">📦</div>
          <h3 className="text-sm font-bold text-white">No Assets Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Design tokens, APK packages, or documents uploaded by your engineering team will appear here.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAssets.map((asset) => {
            const meta = CATEGORY_META[asset.category] || CATEGORY_META.build;
            const project = projects.find((p) => p.id === asset.projectId);

            return (
              <div
                key={asset.id}
                className="surface-strong rounded-2xl p-5 border hairline hover:border-gold/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border hairline flex items-center justify-center text-xl">
                      {meta.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${meta.color}`}>
                          {meta.label}
                        </span>
                        {asset.version && (
                          <span className="mono text-[9px] text-stone-500">{asset.version}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1 leading-snug">{asset.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t hairline flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-2">
                    <span>{project ? project.name : asset.projectId}</span>
                    {asset.fileSize && <span>· {asset.fileSize}</span>}
                  </div>

                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                  >
                    Open / Download ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md surface-strong rounded-3xl p-6 border border-gold/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upload Asset or Share Link</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3 text-left">
              <div>
                <label className="text-[11px] text-stone-400 font-semibold mb-1 block">Asset Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Brand Vector Logo Pack / App Icons"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 font-semibold mb-1 block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                >
                  <option value="brand">💎 Brand Assets / Logos</option>
                  <option value="design">🎨 Design & UI (Figma)</option>
                  <option value="build">🚀 Live Build / APK Download</option>
                  <option value="code">⌨️ Code / Repository</option>
                  <option value="document">📄 Specs & Legal SOW</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-400 font-semibold mb-1 block">Resource URL or Cloud Storage Link *</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://figma.com/..."
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 font-semibold mb-1 block">Version Tag</label>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="e.g. v1.0 / 2026-Brand-Assets"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="text-[11px] text-stone-400 font-semibold mb-1 block">Link to Project</label>
                  <select
                    value={targetProject}
                    onChange={(e) => setTargetProject(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-5 py-2 text-xs font-bold"
                >
                  Upload Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
