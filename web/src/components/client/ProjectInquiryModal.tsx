import React, { useEffect, useState } from 'react';
import { studioStore } from '../../store/studioStore';
import { useBodyLock } from '../../hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (leadId: string) => void;
}

export const ProjectInquiryModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  useBodyLock(open);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: 'Web Development',
    budget: '$25,000 - $50,000',
    timeline: '4-6 Weeks',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSubmitted(false);
      setSubmittedEmail('');
      setFormData({
        name: '',
        email: '',
        company: '',
        service: 'Web Development',
        budget: '$25,000 - $50,000',
        timeline: '4-6 Weeks',
        description: '',
      });
    } else {
      const u = studioStore.getState().currentUser;
      if (u && u.role === 'client') {
        setFormData((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
          company: u.company || prev.company,
        }));
      }
    }
  }, [open]);

  if (!open) return null;

  const currentUser = studioStore.getState().currentUser;
  const isClient = !!currentUser && currentUser.role === 'client';

  const steps = isClient
    ? [
        { num: 1, label: 'Scope & Service' },
        { num: 2, label: 'Budget & Timeline' },
      ]
    : [
        { num: 1, label: 'Scope & Service' },
        { num: 2, label: 'Budget & Timeline' },
        { num: 3, label: 'Company Info' },
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      alert('Please fill in your contact information.');
      return;
    }

    const lead = studioStore.addLead({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      service: formData.service,
      budget: formData.budget,
      timeline: formData.timeline,
      description: formData.description || 'Requested detailed scope discussion.',
    });

    setSubmittedEmail(formData.email);
    setSubmitted(true);
    onSuccess(lead.id);
  };

  const servicesList = [
    { title: 'Web Development', desc: 'SaaS platforms, Web apps, Marketing sites' },
    { title: 'Mobile Apps', desc: 'iOS & Android native React Native apps' },
    { title: 'Product Design', desc: 'Figma UI/UX, Design Systems' },
    { title: 'Performance & Scale', desc: 'Speed audit, Refactoring, Security' },
  ];

  const budgets = ['$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000+'];

  return (
    <div className="fixed inset-0 z-[250] video-modal-backdrop flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in" role="dialog">
      <div className="relative w-full max-w-2xl surface-strong rounded-3xl p-6 sm:p-8 gold-border shadow-2xl overflow-hidden animate-modal-in flex flex-col max-h-[90vh]">
        {/* Background ambient glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#c9a86c]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between pb-5 border-b hairline mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Client Found Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">Start a New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl surface flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {submitted ? (
          <div className="min-h-[55vh] flex flex-col items-center justify-center text-center py-8 animate-fade-in">
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-lime-400/15 border-2 border-lime-400/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-lime-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Inquiry Received!</h2>
            <p className="text-sm sm:text-base font-semibold text-stone-300 mt-3 max-w-md mx-auto leading-relaxed">
              Your project brief has reached our lead engineers. We'll review it and get back to you within 24 hours.
            </p>

            <div className="mt-7 w-full max-w-md p-5 rounded-2xl surface border border-[#c9a86c]/30 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-[#e3c893] font-bold text-sm">
                <span>📬</span> A confirmation email is on its way
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-stone-300 leading-relaxed">
                We've sent a confirmation to{' '}
                <span className="text-white font-bold">{submittedEmail}</span>. Please check your{' '}
                <span className="text-white font-bold">Inbox</span> — and if you don't see it within a few minutes, look in your{' '}
                <span className="text-amber-300 font-bold">Spam / Junk folder</span> and mark it as{' '}
                <span className="text-white font-bold">"Not Spam"</span> so our updates always reach you.
              </p>
            </div>

            <button onClick={onClose} className="btn-gold rounded-xl px-8 py-3 text-sm font-bold mt-7">
              Got it, thanks!
            </button>
          </div>
        ) : (
          <>
        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-white/[0.03] p-2 rounded-xl border hairline">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                step === s.num
                  ? 'bg-[#c9a86c]/20 border border-[#c9a86c]/40 text-[#e3c893] font-medium'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s.num ? 'bg-gold text-[#0a0c10]' : 'bg-white/10 text-stone-400'}`}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Services */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Select Primary Requirement</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {servicesList.map((svc) => (
                  <div
                    key={svc.title}
                    onClick={() => setFormData({ ...formData, service: svc.title })}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      formData.service === svc.title
                        ? 'bg-[#c9a86c]/15 border-[#c9a86c] text-white shadow-lg shadow-[#c9a86c]/5'
                        : 'surface border-white/5 text-stone-400 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white mb-1 flex items-center justify-between">
                      {svc.title}
                      {formData.service === svc.title && <span className="text-gold">✓</span>}
                    </div>
                    <div className="text-xs text-stone-400 leading-snug">{svc.desc}</div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-gold rounded-xl px-6 py-2.5 text-xs font-semibold"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Budget & Timeline */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 block">Estimated Budget</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {budgets.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setFormData({ ...formData, budget: b })}
                      className={`p-3 rounded-xl text-xs font-medium border text-center transition-all ${
                        formData.budget === b
                          ? 'bg-[#c9a86c]/20 border-[#c9a86c] text-[#e3c893]'
                          : 'surface border-white/5 text-stone-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2 block">Target Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-[#c9a86c]"
                >
                  <option value="ASAP (1-2 Weeks)">ASAP (1-2 Weeks urgent)</option>
                  <option value="4-6 Weeks">Standard Build (4-6 Weeks)</option>
                  <option value="8-12 Weeks">Comprehensive Enterprise (8-12 Weeks)</option>
                  <option value="Ongoing Partner">Ongoing Monthly Retainer</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2 block">Brief Project Description (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your product goals, technical stack preferences, or target launch date..."
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-[#c9a86c]"
                />
              </div>

              {isClient && (
                <div className="p-4 rounded-xl surface border border-[#c9a86c]/20 text-xs text-stone-300 space-y-0.5">
                  <div className="font-semibold text-[#e3c893]">👤 Submitting as {currentUser?.name}</div>
                  <div>{currentUser?.email} · {currentUser?.company}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost rounded-xl px-5 py-2 text-xs"
                >
                  ← Back
                </button>
                <button
                  type={isClient ? 'submit' : 'button'}
                  onClick={isClient ? undefined : () => setStep(3)}
                  className="btn-gold rounded-xl px-6 py-2.5 text-xs font-semibold"
                >
                  {isClient ? 'Submit Inquiry Now 🚀' : 'Next Step →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Contact Info & Submit (skipped when logged in) */}
          {step === 3 && !isClient && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1 block">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c9a86c]"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1 block">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c9a86c]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1 block">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Nexus Tech Labs"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c9a86c]"
                />
              </div>

              <div className="p-4 rounded-xl surface border border-[#c9a86c]/20 text-xs text-stone-300 space-y-1">
                <div className="font-semibold text-[#e3c893]">⚡ What happens next?</div>
                <div>Your request is instantly sent directly to our lead engineers. We will review your brief and send a fixed SOW & milestone schedule within 24 hours.</div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-ghost rounded-xl px-5 py-2 text-xs"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-7 py-3 text-xs font-bold text-[#0a0c10] shadow-lg shadow-white/10 hover:scale-105 transition-transform"
                >
                  Submit Inquiry Now 🚀
                </button>
              </div>
            </div>
          )}
        </form>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
