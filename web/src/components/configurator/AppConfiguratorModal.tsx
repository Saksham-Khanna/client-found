import React, { useState, useEffect } from 'react';
import { studioStore, AppConfig } from '../../store/studioStore';
import { showToast } from '../../store/toast';
import { useBodyLock } from '../../hooks';
import { MobileAppSimulator } from './MobileAppSimulator';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (config: AppConfig) => void;
}

const PRESET_PALETTES = [
  { name: 'Cyber Gold', primary: '#c9a86c', accent: '#e3c893' },
  { name: 'Emerald Slate', primary: '#10b981', accent: '#6ee7b7' },
  { name: 'Royal Cobalt', primary: '#3b82f6', accent: '#93c5fd' },
  { name: 'Crimson Velvet', primary: '#f43f5e', accent: '#fda4af' },
  { name: 'Titanium Sleek', primary: '#94a3b8', accent: '#cbd5e1' },
  { name: 'Neon Amber', primary: '#f59e0b', accent: '#fde68a' },
];

const APP_CATEGORIES = [
  {
    id: 'Creator Community',
    title: 'Creator Community & Membership',
    icon: '👑',
    desc: 'Exclusive member feeds, tiered paywalls, live events and private discussion rooms.',
    baseCost: 20000,
    baseWeeks: 4,
  },
  {
    id: 'Fitness & Coaching',
    title: 'Fitness & Health Coaching',
    icon: '⚡',
    desc: 'Workout plans, meal logging, streak tracking, video guides, and 1-on-1 coach booking.',
    baseCost: 24000,
    baseWeeks: 5,
  },
  {
    id: 'E-Commerce Store',
    title: 'Luxury Retail & E-Commerce',
    icon: '🛍️',
    desc: 'Product catalog, Apple Pay checkout, inventory sync, order tracking, and push drops.',
    baseCost: 22000,
    baseWeeks: 4,
  },
  {
    id: 'Booking & Appointments',
    title: 'Booking & Service Scheduling',
    icon: '📅',
    desc: 'Calendar scheduling, practitioner availability, automated reminders, and client intake.',
    baseCost: 18000,
    baseWeeks: 3,
  },
  {
    id: 'On-Demand Delivery',
    title: 'On-Demand Services & Marketplace',
    icon: '📍',
    desc: 'Live map tracking, dual client/provider portals, rating systems, and instant dispatch.',
    baseCost: 32000,
    baseWeeks: 6,
  },
  {
    id: 'Custom SaaS Portal',
    title: 'Custom SaaS & Enterprise Platform',
    icon: '📊',
    desc: 'Role-based access control, analytics pipelines, webhook integrations, and high-volume APIs.',
    baseCost: 35000,
    baseWeeks: 6,
  },
];

const AVAILABLE_FEATURES = [
  { id: 'User Auth & SSO', name: 'User Auth & Social SSO', icon: '🔐', cost: 2500, weeks: 0.5 },
  { id: 'Push Alerts', name: 'Push Notifications & Badges', icon: '🔔', cost: 2000, weeks: 0.5 },
  { id: 'In-App Chat', name: 'In-App Community Feed & Chat', icon: '💬', cost: 4000, weeks: 1 },
  { id: 'Paywalls & Subscriptions', name: 'Stripe Paywalls & Subscriptions', icon: '💳', cost: 3500, weeks: 0.5 },
  { id: 'Real-time Analytics', name: 'Real-Time Analytics Dashboard', icon: '📈', cost: 3000, weeks: 0.5 },
  { id: 'AI Smart Assistant', name: 'AI Copilot & Smart Assistant', icon: '🤖', cost: 5000, weeks: 1 },
  { id: 'Custom Domain', name: 'Custom Domain & Staging Pipeline', icon: '🌐', cost: 1500, weeks: 0.5 },
  { id: 'Offline Sync & PWA', name: 'Offline Mode & Local Cache', icon: '⚡', cost: 2500, weeks: 0.5 },
];

const PLATFORMS = [
  { id: 'iOS App Store', name: 'iOS App Store', icon: '🍎' },
  { id: 'Android Play Store', name: 'Android Play Store', icon: '🤖' },
  { id: 'PWA Web App', name: 'Progressive Web App (PWA)', icon: '🌐' },
  { id: 'Desktop App', name: 'Desktop App (macOS & Windows)', icon: '💻' },
];

const ICONS = [
  { id: 'sparkles', label: 'Sparkles', icon: '✨' },
  { id: 'crown', label: 'Crown', icon: '👑' },
  { id: 'shield', label: 'Shield', icon: '🛡️' },
  { id: 'fitness', label: 'Lightning', icon: '⚡' },
  { id: 'cart', label: 'Shopping', icon: '🛍️' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'camera', label: 'Camera', icon: '📸' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
];

export const AppConfiguratorModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  useBodyLock(open);

  const currentUser = studioStore.getState().currentUser;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Configuration State
  const [appName, setAppName] = useState('Wildpath Elite');
  const [appType, setAppType] = useState('Creator Community');
  const [tagline, setTagline] = useState('Private network for adventurous minds');
  const [primaryColor, setPrimaryColor] = useState('#c9a86c');
  const [accentColor, setAccentColor] = useState('#e3c893');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [icon, setIcon] = useState('sparkles');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'User Auth & SSO',
    'Push Alerts',
    'In-App Chat',
    'Paywalls & Subscriptions',
  ]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'iOS App Store',
    'Android Play Store',
    'PWA Web App',
  ]);

  // Contact Info
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentUser) {
      setClientName(currentUser.name || '');
      setClientEmail(currentUser.email || '');
      setCompany(currentUser.company || '');
    }
  }, [currentUser]);

  if (!open) return null;

  // Compute live estimate
  const selectedCategoryObj = APP_CATEGORIES.find((c) => c.id === appType) || APP_CATEGORIES[0];
  const featureCost = selectedFeatures.reduce((sum, fId) => {
    const f = AVAILABLE_FEATURES.find((item) => item.id === fId);
    return sum + (f ? f.cost : 0);
  }, 0);
  const featureWeeks = selectedFeatures.reduce((sum, fId) => {
    const f = AVAILABLE_FEATURES.find((item) => item.id === fId);
    return sum + (f ? f.weeks : 0);
  }, 0);

  const totalCost = selectedCategoryObj.baseCost + featureCost;
  const totalWeeks = Math.ceil(selectedCategoryObj.baseWeeks + featureWeeks);
  const costFormatted = `$${(totalCost - 4000).toLocaleString()} - $${(totalCost + 4000).toLocaleString()}`;
  const weeksFormatted = `${totalWeeks}-${totalWeeks + 2} Weeks`;

  const toggleFeature = (fId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(fId) ? prev.filter((id) => id !== fId) : [...prev, fId]
    );
  };

  const togglePlatform = (pId: string) => {
    if (selectedPlatforms.includes(pId) && selectedPlatforms.length === 1) return; // Keep at least one
    setSelectedPlatforms((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const handleSaveAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) {
      alert('Please provide your name and contact email.');
      return;
    }

    setSubmitting(true);
    try {
      const saved = await studioStore.saveAppConfig({
        clientName,
        clientEmail,
        companyName: companyName || appName,
        appName,
        appType,
        tagline,
        primaryColor,
        accentColor,
        theme,
        icon,
        features: selectedFeatures,
        platforms: selectedPlatforms,
        estimatedCost: costFormatted,
        estimatedWeeks: weeksFormatted,
        status: 'Submitted',
        notes,
      });

      showToast(`App Blueprint for "${appName}" created successfully!`);
      if (onSuccess) onSuccess(saved);
      onClose();
    } catch {
      showToast('Failed to save app configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto antialiased animate-fade-in">
      <div className="relative w-full max-w-6xl surface-strong rounded-3xl border border-gold/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b hairline bg-[#12141a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold">
              🛠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Personal App Configurator</span>
                <span className="mono text-[9px] bg-gold/20 text-[#e3c893] px-2 py-0.5 rounded font-semibold border border-gold/30">
                  STUDIO ARCHITECT
                </span>
              </div>
              <p className="text-[10px] text-stone-400">Design, customize, and simulate your custom application in real time</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle mobile preview on smaller screens */}
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="lg:hidden btn-ghost px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 text-gold"
            >
              📱 {showMobilePreview ? 'Show Form' : 'Show Simulator'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full surface flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x hairline">
          {/* Left Column: Form Steps (7 cols) */}
          <div className={`lg:col-span-7 p-6 space-y-6 ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>
            {/* Step Wizard Navigation Bar */}
            <div className="flex items-center justify-between border-b hairline pb-3">
              {[
                { s: 1, label: 'Type' },
                { s: 2, label: 'Brand & UI' },
                { s: 3, label: 'Features' },
                { s: 4, label: 'Platforms' },
                { s: 5, label: 'Review & Submit' },
              ].map((st) => (
                <button
                  key={st.s}
                  onClick={() => setStep(st.s as any)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors pb-1 ${
                    step === st.s
                      ? 'text-gold border-b-2 border-gold'
                      : step > st.s
                      ? 'text-stone-300'
                      : 'text-stone-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step === st.s
                        ? 'bg-gold text-black font-extrabold'
                        : step > st.s
                        ? 'bg-lime-400/20 text-lime-300'
                        : 'bg-white/5 text-stone-600'
                    }`}
                  >
                    {step > st.s ? '✓' : st.s}
                  </span>
                  <span className="hidden sm:inline">{st.label}</span>
                </button>
              ))}
            </div>

            {/* Step 1: App Category */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">Select App Purpose & Category</h3>
                  <p className="text-xs text-stone-400 mt-0.5">What type of custom app do you want to build for your business or personal brand?</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {APP_CATEGORIES.map((cat) => {
                    const isSelected = appType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setAppType(cat.id);
                          if (appName === 'Wildpath Elite' || !appName) {
                            setAppName(`${cat.id.split(' ')[0]} App`);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5 ring-1 ring-gold/40'
                            : 'surface hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{cat.icon}</span>
                          {isSelected && <span className="text-xs font-bold text-gold">Selected ✓</span>}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-2">{cat.title}</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{cat.desc}</p>
                        <div className="mt-3 pt-2 border-t hairline flex items-center justify-between text-[10px] mono text-stone-500">
                          <span>Base: ${(cat.baseCost / 1000).toFixed(0)}k</span>
                          <span>~{cat.baseWeeks} wks</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary rounded-xl px-5 py-2.5 text-xs font-bold"
                  >
                    Next: Brand & Theme →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Branding & Identity */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">Branding & Visual Palette</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Customize your app name, tagline, logo icon, and color system.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1 block">App Name</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="e.g. Slate Vault"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1 block">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Elevate your everyday operations"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Preset Palettes */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-2 block">
                    Curated Luxury Color Schemes
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_PALETTES.map((p) => {
                      const isSel = primaryColor === p.primary && accentColor === p.accent;
                      return (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(p.primary);
                            setAccentColor(p.accent);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSel ? 'bg-white/10 border-gold ring-1 ring-gold' : 'surface hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              <span className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: p.primary }} />
                              <span className="w-4 h-4 rounded-full border border-black" style={{ backgroundColor: p.accent }} />
                            </div>
                            <span className="text-[11px] font-semibold text-stone-200">{p.name}</span>
                          </div>
                          {isSel && <span className="text-gold text-[10px]">●</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers & Theme */}
                <div className="grid sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold mb-1 block">Primary Hex</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full bg-[#12141a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold mb-1 block">Accent Hex</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full bg-[#12141a] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-semibold mb-1 block">UI Theme Mode</label>
                    <div className="flex rounded-xl p-1 bg-[#12141a] border border-white/10">
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${theme === 'dark' ? 'bg-gold text-black' : 'text-stone-400'}`}
                      >
                        🌙 Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${theme === 'light' ? 'bg-white text-black' : 'text-stone-400'}`}
                      >
                        ☀️ Light
                      </button>
                    </div>
                  </div>
                </div>

                {/* App Icon selector */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-2 block">
                    Choose App Emblem / Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => setIcon(ic.id)}
                        className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-xs transition-all ${
                          icon === ic.id
                            ? 'bg-gold/15 border-gold text-gold font-bold shadow'
                            : 'surface text-stone-400 hover:border-white/20'
                        }`}
                      >
                        <span>{ic.icon}</span>
                        <span>{ic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold">
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary rounded-xl px-5 py-2 text-xs font-bold">
                    Next: Features →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Feature Modules */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">Feature Modules & Integrations</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Toggle the capabilities you need. The simulator updates in real-time.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_FEATURES.map((feat) => {
                    const active = selectedFeatures.includes(feat.id);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => toggleFeature(feat.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between transition-all ${
                          active
                            ? 'bg-gold/10 border-gold ring-1 ring-gold/30'
                            : 'surface hover:border-white/20 opacity-70'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl">{feat.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{feat.name}</h4>
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              +${(feat.cost / 1000).toFixed(1)}k · +{feat.weeks} wk
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                            active ? 'bg-gold text-black' : 'border border-white/20'
                          }`}
                        >
                          {active ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold">
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(4)} className="btn-primary rounded-xl px-5 py-2 text-xs font-bold">
                    Next: Platforms →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Platforms */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">Target Platforms & Deployment</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Choose which environments your app will be published to.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {PLATFORMS.map((plat) => {
                    const active = selectedPlatforms.includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          active
                            ? 'bg-gold/10 border-gold ring-1 ring-gold/30'
                            : 'surface hover:border-white/20 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{plat.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{plat.name}</h4>
                            <span className="text-[10px] text-stone-400">Native Compiled & Signed</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                            active ? 'bg-gold text-black' : 'border border-white/20'
                          }`}
                        >
                          {active ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={() => setStep(3)} className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold">
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(5)} className="btn-primary rounded-xl px-5 py-2 text-xs font-bold">
                    Next: Review Blueprint →
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <form onSubmit={handleSaveAndSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base font-bold text-white">Review Blueprint & Generate App Spec</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Confirm your contact details to save this spec directly to your workspace.</p>
                </div>

                {/* Estimate Summary Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-gold/15 to-transparent border border-gold/40 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gold font-bold">Estimated Delivery & Investment</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">{costFormatted}</div>
                    <div className="text-xs text-stone-300 mt-0.5">{weeksFormatted} sprint completion</div>
                  </div>
                  <div className="text-right text-[11px] text-stone-400">
                    <div>{selectedFeatures.length} Feature Modules</div>
                    <div>{selectedPlatforms.length} Native Targets</div>
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1 block">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Jordan Michaels"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1 block">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1 block">Company / Brand</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Slate Innovations"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-1 block">Extra Notes or APIs</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Need Stripe Connect and custom CRM webhook"
                      className="w-full bg-[#12141a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button type="button" onClick={() => setStep(4)} className="btn-ghost rounded-xl px-4 py-2 text-xs font-semibold">
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-gold/20 hover:scale-[1.02] transition-transform"
                  >
                    {submitting ? 'Creating Spec...' : '🚀 Save & Submit App Blueprint'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Live Mobile Phone Simulator (5 cols) */}
          <div className={`lg:col-span-5 p-6 bg-[#0a0c10]/60 flex flex-col items-center justify-center ${showMobilePreview ? 'block' : 'hidden lg:flex'}`}>
            <div className="text-center mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gold">Live Device Simulator</div>
              <p className="text-[11px] text-stone-400">Interactive preview of your personalized build</p>
            </div>

            <MobileAppSimulator
              appName={appName}
              appType={appType}
              tagline={tagline}
              primaryColor={primaryColor}
              accentColor={accentColor}
              theme={theme}
              icon={icon}
              features={selectedFeatures}
              platforms={selectedPlatforms}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
