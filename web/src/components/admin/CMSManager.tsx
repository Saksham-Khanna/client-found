import React, { useState } from 'react';
import { studioStore, CMSConfig } from '../../store/studioStore';

interface Props {
  onNotification: (msg: string) => void;
}

export const CMSManager: React.FC<Props> = ({ onNotification }) => {
  const cmsState = studioStore.getState().cms;
  const [formData, setFormData] = useState<CMSConfig>({ ...cmsState });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    studioStore.updateCMS(formData);
    onNotification('Site CMS configuration saved! Live landing page updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b hairline">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Content Management System</div>
        <h2 className="text-xl font-bold text-white tracking-tight">Live Website Content & Availability Editor</h2>
        <p className="text-xs text-stone-400">Update availability badges, pricing headlines, and video assets in real-time</p>
      </div>

      <form onSubmit={handleSave} className="surface-strong rounded-2xl p-6 sm:p-8 gold-border space-y-6">
        {/* Availability Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-gold">●</span> Hero Availability Pill & Slots
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-400 font-semibold mb-1 block">Hero Availability Badge Text</label>
              <input
                type="text"
                value={formData.openSlotsText}
                onChange={(e) => setFormData({ ...formData, openSlotsText: e.target.value })}
                className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-stone-400 font-semibold mb-1 block">Next Available Start Date</label>
              <input
                type="text"
                value={formData.nextAvailableStart}
                onChange={(e) => setFormData({ ...formData, nextAvailableStart: e.target.value })}
                className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-4 pt-4 border-t hairline">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-gold">✨</span> Hero Messaging & Headline
          </h3>

          <div>
            <label className="text-xs text-stone-400 font-semibold mb-1 block">Hero Main Headline</label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs text-stone-400 font-semibold mb-1 block">Hero Subtitle Paragraph</label>
            <textarea
              rows={3}
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full bg-[#12141a] border border-white/10 rounded-xl p-3 text-xs text-white"
            />
          </div>
        </div>

        {/* Studio Media */}
        <div className="space-y-4 pt-4 border-t hairline">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-gold">🎬</span> Studio Film Media Links
          </h3>

          <div>
            <label className="text-xs text-stone-400 font-semibold mb-1 block">Showcase MP4 Video URL</label>
            <input
              type="text"
              value={formData.filmVideoUrl}
              onChange={(e) => setFormData({ ...formData, filmVideoUrl: e.target.value })}
              className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white mono"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="btn-gold rounded-xl px-8 py-3 text-xs font-bold uppercase tracking-wider">
            Save & Publish Live CMS Changes →
          </button>
        </div>
      </form>
    </div>
  );
};
