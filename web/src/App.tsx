import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from './utils/cn';
import { useReveal, useSpotlight, useTilt, useActiveSection, useStickyProgress, useBodyLock } from './hooks';
import { studioStore, CMSConfig, UserProfile } from './store/studioStore';
import { AdminPanel } from './components/admin/AdminPanel';
import { ClientPortal } from './components/client/ClientPortal';
import { ProjectInquiryModal } from './components/client/ProjectInquiryModal';
import { AuthModal } from './components/auth/AuthModal';
import { AppConfiguratorModal } from './components/configurator/AppConfiguratorModal';
import { MobileAppSimulator } from './components/configurator/MobileAppSimulator';
import { DirectChatWidget } from './components/common/DirectChatWidget';
import { ToastHost } from './components/common/ToastNotification';
import { showToast } from './store/toast';
import { LogoutIcon } from './components/common/icons';

/* ════════════════════════════ Media ════════════════════════════ */
const MEDIA = {
  scrollFilm: {
    src: 'https://videos.pexels.com/video-files/8631879/8631879-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/8631879/pexels-photo-8631879.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200',
  },
  modalFilm: {
    src: 'https://videos.pexels.com/video-files/5439072/5439072-uhd_3840_2160_25fps.mp4',
    poster: 'https://images.pexels.com/videos/5439072/black-guy-boss-business-business-person-5439072.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200',
  },
};

/* ════════════════════════════ Icons ════════════════════════════ */
const I = {
  Logo: ({ className = 'w-7 h-7' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="3" fill="#f4f2ed" />
      <rect x="18" y="2" width="12" height="12" rx="3" fill="#c9a86c" />
      <rect x="2" y="18" width="12" height="12" rx="3" fill="#c9a86c" />
      <rect x="18" y="18" width="12" height="12" rx="3" fill="#3a3d45" />
    </svg>
  ),
  ArrowUpRight: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
  ),
  ArrowRight: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
  ),
  Check: ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
  ),
  Plus: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
  ),
  Minus: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14" /></svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" /></svg>
  ),
  Close: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" /></svg>
  ),
  Star: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
  ),
  Sparkles: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinejoin="round" /></svg>
  ),
  Play: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z" /></svg>
  ),
  Quote: ({ className = 'w-7 h-7 text-[#c9a86c]/40' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor"><path d="M10 8c-3 0-5 2-5 6v10h8V14H9c0-2 1-3 3-3V8h-2zm12 0c-3 0-5 2-5 6v10h8V14h-4c0-2 1-3 3-3V8h-2z" /></svg>
  ),
  X: () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" /></svg>),
  Li: () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>),
  Gh: () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.8-.26.8-.58v-2.17c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.82 2.81 1.3 3.5 1 .1-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.92 0-1.3.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.8 1.1.8 2.22v3.29c0 .32.2.7.8.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" /></svg>),
  Ig: () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>),
  TrendUp: ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8M14 7h7v7" /></svg>
  ),
  Globe: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>
  ),
  Smartphone: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" strokeLinecap="round" /></svg>
  ),
  Shield: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M9 12l2 2 4-4m5.6-4.02A11.96 11.96 0 0012 2.94c-3.28.32-6.24 1.72-8.4 3.84A12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2.05-.4-3.02z" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  Palette: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 2a10 10 0 000 20c1 0 2-.8 2-2a2 2 0 012-2h2a4 4 0 004-4 10 10 0 00-10-10z" /><circle cx="7.5" cy="10.5" r="1" fill="currentColor" /><circle cx="11.5" cy="7.5" r="1" fill="currentColor" /><circle cx="16.5" cy="10.5" r="1" fill="currentColor" /></svg>
  ),
  Zap: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" /></svg>
  ),
  Scale: ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M16 16.5l4-9M8 16.5l-4-9M12 3v18M3 7.5A5 5 0 008 12a5 5 0 005-5M13 7.5A5 5 0 0018 12a5 5 0 005-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
};

/* ════════════════════════════ Scroll Progress Bar ════════════════════════════ */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#a5854e] via-[#e3c893] to-[#a5854e]" style={{ transform: `scaleX(${p})`, transformOrigin: 'left' }} />
    </div>
  );
}

/* ════════════════════════════ Navbar ════════════════════════════ */
function Nav({
  user,
  onOpenInquiry,
  onOpenAuth,
  onOpenDashboard,
  onGoAdmin,
  onLogout,
}: {
  user: UserProfile | null;
  onOpenInquiry: () => void;
  onOpenAuth: (tab?: 'client' | 'admin') => void;
  onOpenDashboard: () => void;
  onGoAdmin: () => void;
  onLogout: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(['services', 'film', 'work', 'process', 'pricing', 'faq']);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'The Film', href: '#film', id: 'film' },
    { label: 'Work', href: '#work', id: 'work' },
    { label: 'Process', href: '#process', id: 'process' },
    { label: 'Pricing', href: '#pricing', id: 'pricing' },
    { label: 'FAQ', href: '#faq', id: 'faq' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-3 px-3 sm:pt-4 sm:px-6">
      <nav className={cn('max-w-6xl mx-auto rounded-2xl transition-all duration-300', scrolled ? 'surface-strong shadow-2xl shadow-black/50' : 'surface')}>
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
          <a href="#" className="flex items-center gap-2.5 focus-ring rounded-md">
            <I.Logo className="w-7 h-7" />
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight text-stone-100">
                Client<span className="text-gold">Found</span>
              </span>
              <span className="mono text-[8px] uppercase tracking-[0.25em] text-stone-500 mt-0.5">Studios</span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={cn(
                  'text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors focus-ring',
                  active === l.id ? 'text-white bg-white/5' : 'text-stone-400 hover:text-white hover:bg-white/5'
                )}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' ? (
                  <button onClick={onGoAdmin} className="btn-ghost rounded-lg px-3 py-1.5 text-[12px] font-semibold text-gold border-gold/40 flex items-center gap-1.5">
                    🛡️ Admin Console
                  </button>
                ) : (
                  <button onClick={onOpenDashboard} className="btn-ghost rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white border-white/20 flex items-center gap-1.5">
                    👤 My Workspace
                  </button>
                )}
                <span className="text-xs text-stone-400 font-medium px-1">{user.name.split(' ')[0]}</span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-stone-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                  title="Sign Out"
                >
                  <LogoutIcon className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <button onClick={() => onOpenAuth('client')} className="btn-ghost rounded-lg px-3.5 py-1.5 text-[12px] font-medium text-gold border-gold/30 flex items-center gap-1.5 focus-ring">
                <span>Sign in / Register</span>
              </button>
            )}

            <button onClick={onOpenInquiry} className="btn-primary rounded-lg px-3.5 py-1.5 text-[13px] font-medium flex items-center gap-1.5 focus-ring">
              Start a project
              <I.ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button className="lg:hidden text-stone-300 p-2 -mr-2 rounded-lg focus-ring" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <I.Close /> : <I.Menu />}
          </button>
        </div>

        <div className={cn('lg:hidden overflow-hidden transition-all duration-300', open ? 'max-h-96' : 'max-h-0')}>
          <div className="px-4 pb-4 pt-1 flex flex-col gap-1 border-t hairline mt-1">
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-stone-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg text-sm">
                {l.label}
              </a>
            ))}
            <button onClick={() => { setOpen(false); onOpenAuth('client'); }} className="btn-ghost border-gold/40 text-gold rounded-lg py-2 text-xs mt-2">
              Sign in / Register
            </button>
            <button onClick={() => { setOpen(false); onOpenInquiry(); }} className="btn-primary rounded-lg px-4 py-2.5 text-sm font-medium mt-1 text-center">
              Start a project
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ════════════════════════════ Hero ════════════════════════════ */
function Hero({
  onOpenInquiry,
  cms,
}: {
  onOpenInquiry: () => void;
  cms: CMSConfig;
}) {
  const spotlightRef = useSpotlight();
  const tiltRef = useTilt(4);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden spotlight-container border-b hairline" ref={spotlightRef}>
      <div className="spotlight-glow" />
      <div className="absolute inset-0 bg-grid-fine [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#c9a86c]/[0.06] rounded-full blur-[140px]" />
      <div className="absolute top-32 -left-32 w-[420px] h-[420px] bg-[#4a5a75]/20 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-3">
          <h1 className="reveal stagger-1 text-[32px] sm:text-[46px] md:text-[56px] font-bold tracking-[-0.035em] leading-[1.05] text-stone-50 text-balance mb-2">
            {cms.heroTitle}
            <br />
            <span className="text-brand">{cms.heroHighlight}</span>
          </h1>

          <p className="reveal stagger-2 text-[14px] sm:text-[15px] text-stone-400 max-w-lg mx-auto leading-relaxed text-pretty">
            {cms.heroSubtitle}
          </p>
        </div>

        {/* Tilt dashboard - Main Landing Page Centerpiece */}
        <div className="reveal stagger-3 relative device-3d" ref={tiltRef}>
          <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-b from-[#c9a86c]/10 via-transparent to-transparent blur-2xl pointer-events-none" />
          <div className="relative chrome-window rounded-xl overflow-hidden surface-strong gold-border">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b hairline bg-[#12141a]/80">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="surface rounded-md px-3 py-1 text-[11px] text-stone-500 mono flex items-center gap-2">
                  <span className="text-gold">◉</span> app.clientfound.com
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse-dot" />
                <span className="mono">LIVE</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-[#0b0d12]">
              <div className="grid lg:grid-cols-4 gap-4">
                <div className="hidden lg:flex flex-col gap-1">
                  {[
                    { l: 'Overview', a: true },
                    { l: 'Projects', a: false },
                    { l: 'Inbox', a: false, badge: '3' },
                    { l: 'Deployments', a: false },
                    { l: 'Analytics', a: false },
                    { l: 'Settings', a: false },
                  ].map((x) => (
                    <div key={x.l} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors', x.a ? 'bg-[#c9a86c]/10 border border-[#c9a86c]/25 text-[#e3c893]' : 'text-stone-500 hover:text-stone-300')}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', x.a ? 'bg-gold' : 'bg-stone-700')} />
                      {x.l}
                      {x.badge && <span className="ml-auto bg-[#c9a86c] text-[#0a0c10] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{x.badge}</span>}
                    </div>
                  ))}
                  <div className="mt-4 surface rounded-lg p-3">
                    <div className="text-[10px] text-stone-500 mb-1">Build minutes</div>
                    <div className="text-white font-semibold text-sm tabular-nums">427 / 500</div>
                    <div className="h-1 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-[#a5854e] to-[#e3c893] rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-[0.15em]">Tuesday, March 17</div>
                      <div className="text-lg sm:text-xl font-semibold text-white mt-0.5 tracking-tight">Welcome back, Jordan</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="btn-ghost rounded-lg px-3 py-1.5 text-[11px] hidden sm:block mono">Last 30 days</div>
                      <button onClick={onOpenInquiry} className="btn-primary rounded-lg px-3 py-1.5 text-[11px] font-medium whitespace-nowrap">+ New project</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { l: 'Active projects', v: '12', t: '+3 this month', c: 'text-[#e3c893]', bg: 'from-[#c9a86c]/[0.08]' },
                      { l: 'Deployments', v: '147', t: '99.9% uptime', c: 'text-lime-300', bg: 'from-lime-500/[0.07]' },
                      { l: 'Median LCP', v: '0.9s', t: 'top 2% globally', c: 'text-[#9db8d2]', bg: 'from-[#8fa3b8]/[0.08]' },
                      { l: 'Client MRR', v: '$48.2K', t: '+21% MoM', c: 'text-[#d9b892]', bg: 'from-[#b8927a]/[0.08]' },
                    ].map((s) => (
                      <div key={s.l} className={cn('rounded-xl p-3 bg-gradient-to-br to-transparent border hairline', s.bg)}>
                        <div className="text-[10px] text-stone-500 font-medium mb-1">{s.l}</div>
                        <div className="text-xl sm:text-2xl font-bold text-white tracking-tight tabular-nums">{s.v}</div>
                        <div className={cn('text-[10px] mt-0.5 font-medium', s.c)}>{s.t}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 surface rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[12px] font-medium text-white">Request volume</div>
                          <div className="text-[10px] text-stone-500">All projects · last 14 days</div>
                        </div>
                        <div className="flex gap-1">
                          {['1W', '2W', '1M'].map((x, i) => (
                            <div key={x} className={cn('text-[10px] px-2 py-0.5 rounded mono', i === 1 ? 'bg-[#c9a86c]/15 text-[#e3c893]' : 'text-stone-600')}>{x}</div>
                          ))}
                        </div>
                      </div>
                      <svg viewBox="0 0 400 96" className="w-full h-24" aria-hidden="true">
                        <defs>
                          <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c9a86c" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#c9a86c" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0 78 L28 68 L56 73 L84 54 L112 58 L140 40 L168 46 L196 30 L224 36 L252 24 L280 30 L308 17 L336 26 L364 14 L392 20 L400 19 L400 96 L0 96 Z" fill="url(#heroFill)" />
                        <path d="M0 78 L28 68 L56 73 L84 54 L112 58 L140 40 L168 46 L196 30 L224 36 L252 24 L280 30 L308 17 L336 26 L364 14 L392 20 L400 19" stroke="#e3c893" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        {[[140, 40], [252, 24], [364, 14]].map(([x, y], i) => (
                          <circle key={i} cx={x} cy={y} r="3.5" fill="#e3c893" stroke="#0b0d12" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>

                    <div className="surface rounded-xl p-4">
                      <div className="text-[12px] font-medium text-white mb-3">Recent deploys</div>
                      <div className="space-y-3">
                        {[
                          { m: 'fix: checkout overflow on Safari', a: 'Ana', s: 'live', t: '2m ago' },
                          { m: 'feat: SSO with Azure AD', a: 'Tom', s: 'merged', t: '1h ago' },
                          { m: 'chore: upgrade Postgres 16', a: 'Priya', s: 'queued', t: '3h ago' },
                        ].map((d) => (
                          <div key={d.m} className="flex items-start gap-2.5">
                            <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', d.s === 'live' ? 'bg-lime-400 animate-pulse-dot' : d.s === 'merged' ? 'bg-[#c9a86c]' : 'bg-stone-600')} />
                            <div className="min-w-0">
                              <div className="text-[11px] text-stone-200 truncate">{d.m}</div>
                              <div className="text-[9px] text-stone-500 mono mt-0.5">
                                <span className={cn(d.s === 'live' ? 'text-lime-300' : d.s === 'merged' ? 'text-[#e3c893]' : 'text-stone-500')}>{d.s}</span>
                                {' · '}{d.a} · {d.t}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Logo marquee ════════════════════════════ */
function Logos() {
  const names = ['Ramp', 'Linear', 'Vercel', 'Stripe', 'Notion', 'Figma', 'Arc', 'Raycast', 'Framer', 'Supabase'];
  return (
    <section className="py-14 relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <p className="text-center text-[11px] text-stone-500 uppercase tracking-[0.25em] mb-8">Trusted by product teams at</p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-14 animate-marquee whitespace-nowrap">
            {[...names, ...names].map((n, i) => (
              <span key={i} className="text-2xl font-bold text-stone-700 hover:text-stone-400 transition-colors duration-300 tracking-tight flex-shrink-0">{n}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Personal App Interactive Showcase ════════════════════════════ */
function PersonalAppShowcase({
  onOpenConfigurator,
  onOpenInquiry,
}: {
  onOpenConfigurator: () => void;
  onOpenInquiry: () => void;
}) {
  const [activePreset, setActivePreset] = useState<number>(0);
  const presets = [
    {
      appName: 'Apex Guild',
      appType: 'Creator Community',
      subtitle: 'VIP Paywalls & Chat',
      tagline: 'Private network for pro creators and founders',
      primaryColor: '#c9a86c',
      accentColor: '#e3c893',
      theme: 'dark' as const,
      icon: 'crown',
      emoji: '👑',
      glowColor: 'rgba(201, 168, 108, 0.25)',
      features: ['User Auth & SSO', 'Push Alerts', 'In-App Chat', 'Paywalls & Subscriptions'],
      platforms: ['iOS App Store', 'Android Play Store', 'PWA Web App'],
    },
    {
      appName: 'Velocity Fit',
      appType: 'Fitness & Coaching',
      subtitle: 'Workouts & Apple Health',
      tagline: 'Hyper-personalized athletic performance coaching',
      primaryColor: '#10b981',
      accentColor: '#6ee7b7',
      theme: 'dark' as const,
      icon: 'fitness',
      emoji: '⚡',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      features: ['Workout Streak', '1-on-1 Booking', 'Push Alerts', 'Apple Health Sync'],
      platforms: ['iOS App Store', 'Android Play Store'],
    },
    {
      appName: 'Maison Noir',
      appType: 'E-Commerce Store',
      subtitle: 'Drops & Apple Pay',
      tagline: 'Curated luxury apparel drops & Apple Pay checkout',
      primaryColor: '#f43f5e',
      accentColor: '#fda4af',
      theme: 'light' as const,
      icon: 'cart',
      emoji: '🛍️',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      features: ['Apple Pay Checkout', 'Push Drops', 'Real-time Stock', 'VIP Tiers'],
      platforms: ['iOS App Store', 'Android Play Store', 'PWA Web App'],
    },
  ];

  const current = presets[activePreset];

  return (
    <section className="pt-28 sm:pt-36 pb-20 sm:pb-24 relative overflow-hidden bg-[#07090e] border-b hairline">
      {/* Dynamic ambient backdrop that reacts to current archetype color */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none transition-all duration-700 opacity-60"
        style={{ background: current.glowColor }}
      />
      <div className="absolute inset-0 bg-grid-fine opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Controls & Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2.5 surface-strong px-4 py-1.5 rounded-full text-[11px] font-bold text-gold border border-gold/30 shadow-lg shadow-gold/10">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="tracking-wide uppercase">Next-Gen Personal App Studio</span>
            </div>

            {/* Main Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.06]">
                Your Brand. Your Features.<br />
                <span className="text-brand">Your Personal App.</span>
              </h2>
              <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-xl mt-3.5">
                Whether you need a private community, coaching app, or mobile storefront — select an archetype below to watch the live phone simulator adapt instantly.
              </p>
            </div>

            {/* Interactive Archetype Selector Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="mono text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-400">
                  Select Archetype to Simulate:
                </span>
                <span className="text-[11px] text-gold/80 font-medium">⚡ Click to test drive</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presets.map((p, idx) => {
                  const isActive = activePreset === idx;
                  return (
                    <button
                      key={p.appName}
                      onClick={() => setActivePreset(idx)}
                      className={cn(
                        'group relative p-3.5 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between overflow-hidden cursor-pointer',
                        isActive
                          ? 'surface-strong border-gold shadow-[0_0_25px_rgba(201,168,108,0.25)] scale-[1.02]'
                          : 'surface border-white/10 hover:border-white/25 hover:bg-white/[0.04] hover:scale-[1.01]'
                      )}
                    >
                      {/* Active glowing accent line */}
                      {isActive && (
                        <div
                          className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold via-[#fce7c8] to-gold"
                        />
                      )}

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xl p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                          {p.emoji}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-mono">#{idx + 1}</span>
                        )}
                      </div>

                      <div>
                        <div className={cn('text-xs font-bold transition-colors', isActive ? 'text-white' : 'text-stone-300 group-hover:text-white')}>
                          {p.appType}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate mt-0.5">
                          {p.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feature Modules Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { icon: '📱', title: 'iOS & Android', desc: 'Swift & Kotlin Native', tag: 'Store Ready' },
                { icon: '⚡', title: 'Instant PWA', desc: 'Zero store friction', tag: 'No Install' },
                { icon: '💳', title: 'In-App Paywalls', desc: 'Stripe & Apple Pay', tag: 'Monetize' },
                { icon: '🔔', title: 'Push Alerts', desc: 'Direct engagement', tag: 'Retention' },
                { icon: '🛡️', title: 'Admin Command', desc: 'User & content desk', tag: 'Full Control' },
                { icon: '🌐', title: 'Custom Domain', desc: 'White-labeled DNS', tag: '100% Yours' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-3 rounded-2xl surface border hairline hover:border-gold/30 hover:bg-white/[0.04] transition-all group cursor-default"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{item.icon}</span>
                    <span className="mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-stone-400 group-hover:text-gold group-hover:bg-gold/10 transition-colors">
                      {item.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-gold transition-colors">{item.title}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* High Impact Action Buttons */}
            <div className="pt-3 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Primary Pulsing Gold CTA */}
                <button
                  onClick={onOpenConfigurator}
                  className="group relative overflow-hidden rounded-2xl px-8 py-4 font-extrabold text-sm text-[#0a0c10] bg-gradient-to-r from-[#e8d5b0] via-[#c9a86c] to-[#d8ba7d] shadow-[0_0_30px_rgba(201,168,108,0.35)] hover:shadow-[0_0_50px_rgba(201,168,108,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {/* Sweeping light shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                  <span className="text-base">🛠️</span>
                  <span>Design Your Personal App</span>
                  <I.ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Secondary Inquire Button */}
                <button
                  onClick={onOpenInquiry}
                  className="rounded-2xl px-6 py-4 font-bold text-xs text-stone-200 surface-strong border border-white/15 hover:border-gold/60 hover:text-white hover:bg-white/[0.08] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Project Inquiry</span>
                  <span className="text-gold">→</span>
                </button>
              </div>

              {/* Subtitle Guarantee Tag */}
              <div className="flex items-center gap-2 text-stone-500 text-[11px] mono">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse-dot" />
                <span>Real-time dynamic cost & timeline calculator · Zero commitment</span>
              </div>
            </div>
          </div>

          {/* Right Phone Simulator (5 cols) */}
          <div className="lg:col-span-5 flex justify-center device-3d">
            <MobileAppSimulator
              appName={current.appName}
              appType={current.appType}
              tagline={current.tagline}
              primaryColor={current.primaryColor}
              accentColor={current.accentColor}
              theme={current.theme}
              icon={current.icon}
              features={current.features}
              platforms={current.platforms}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Immersive scroll film ════════════════════════════ */
function ImmersiveFilm({ onWatchFilm, cms }: { onWatchFilm: () => void; cms: CMSConfig }) {
  const { ref, progress } = useStickyProgress();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView]);

  const grow = Math.min(progress / 0.72, 1);
  const easedGrow = 1 - Math.pow(1 - grow, 3);
  const scale = 0.62 + easedGrow * 0.38;
  const radius = Math.max(0, 20 * (1 - grow));
  const frameBorder = grow > 0.97 ? 0 : 1;

  const cap1 = progress < 0.22 ? Math.min(progress / 0.08, 1) : Math.max(1 - (progress - 0.22) / 0.1, 0);
  const cap2 = progress > 0.5 && progress < 0.78 ? 1 : 0;
  const endUI = progress > 0.8 ? Math.min((progress - 0.8) / 0.12, 1) : 0;

  return (
    <section ref={ref} id="film" className="relative" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0a0c10]">
        <div
          className="film-frame absolute inset-0 w-full h-full will-change-transform"
          style={{
            transform: `scale(${scale})`,
            borderRadius: `${radius}px`,
            outline: frameBorder ? '1px solid rgba(255,255,255,0.1)' : 'none',
            transformOrigin: 'center center',
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={cms.filmVideoUrl || MEDIA.scrollFilm.src}
            poster={cms.filmPosterUrl || MEDIA.scrollFilm.poster}
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10]/90 via-[#0a0c10]/25 to-[#0a0c10]/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10]/40 via-transparent to-[#0a0c10]/40" />

          <div
            className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 surface-strong rounded-full px-4 py-1.5 transition-opacity duration-500"
            style={{ opacity: 1 - easedGrow }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-dot" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-stone-300">Client Found — The Film</span>
          </div>

          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6 transition-all duration-300 pointer-events-none"
            style={{ opacity: cap1, transform: `translateY(calc(-50% + ${(1 - cap1) * 30}px))` }}
          >
            <div className="mono text-[11px] uppercase tracking-[0.35em] text-[#e3c893] mb-4">Inside the studio</div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white text-balance">
              One team. Every discipline.
            </h2>
          </div>

          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6 transition-all duration-500 pointer-events-none"
            style={{ opacity: cap2, transform: `translateY(calc(-50% + ${(1 - cap2) * 20}px))` }}
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white text-balance">
              From first sketch<br />to shipped product.
            </h2>
          </div>

          <div
            className="absolute left-6 sm:left-10 bottom-8 sm:bottom-12 max-w-sm transition-all duration-500"
            style={{ opacity: endUI, transform: `translateY(${(1 - endUI) * 24}px)` }}
          >
            <div className="mono text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-2">Austin · Lisbon · 07 people</div>
            <p className="text-white/90 text-lg sm:text-xl font-medium leading-snug text-balance">
              Designers, engineers and strategists — at one table, shipping together.
            </p>
          </div>

          <div
            className="absolute right-6 sm:right-10 bottom-8 sm:bottom-12 flex items-center gap-3 transition-all duration-500"
            style={{ opacity: endUI, transform: `translateY(${(1 - endUI) * 24}px)` }}
          >
            <div className="text-right hidden sm:block">
              <div className="text-white text-sm font-semibold">Watch the full story</div>
              <div className="mono text-[10px] text-stone-400">1:36 · with sound</div>
            </div>
            <button
              onClick={onWatchFilm}
              aria-label="Play full film"
              className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f4f2ed] text-[#0a0c10] flex items-center justify-center transition-transform hover:scale-110 focus-ring"
            >
              <span className="absolute inset-0 rounded-full border border-white/40 scale-110 animate-pulse-ring" />
              <I.Play className="w-5 h-5 ml-0.5" />
            </button>
          </div>

          <button
            onClick={onWatchFilm}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 focus-ring"
            style={{ opacity: 1 - easedGrow }}
            aria-label="Play film"
          >
            <span className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <I.Play className="w-6 h-6 ml-1" />
            </span>
          </button>
        </div>

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 pointer-events-none"
          style={{ opacity: progress < 0.05 ? 1 : 0 }}
        >
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Keep scrolling</span>
          <div className="w-px h-8 bg-gradient-to-b from-stone-600 to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Video Modal ════════════════════════════ */
function VideoModal({ open, onClose, cms }: { open: boolean; onClose: () => void; cms: CMSConfig }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useBodyLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    const v = videoRef.current;
    if (open && v) {
      v.currentTime = 0;
      v.muted = false;
      v.play().catch(() => {
        if (v) {
          v.muted = true;
          v.play().catch(() => {});
        }
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] video-modal-backdrop animate-fade-in flex flex-col" role="dialog" aria-modal="true" aria-label="Client Found film">
      <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <I.Logo className="w-6 h-6" />
          <div className="leading-none">
            <div className="text-[13px] font-semibold text-white">Client Found — The Film</div>
            <div className="mono text-[9px] text-stone-500 mt-0.5 uppercase tracking-[0.2em]">Inside the studio · 1:36</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn-ghost rounded-lg px-3 py-2 text-[13px] font-medium flex items-center gap-2 focus-ring"
          aria-label="Close film"
        >
          <span className="hidden sm:inline">Close</span>
          <I.Close className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-0 sm:p-8 overflow-hidden">
        <div className="relative w-full h-full max-w-none animate-modal-in">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            src={cms.filmVideoUrl || MEDIA.modalFilm.src}
            poster={cms.filmPosterUrl || MEDIA.modalFilm.poster}
            controls
            playsInline
            preload="auto"
          />
        </div>
      </div>

      <div className="px-5 sm:px-8 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6 overflow-x-auto">
          {[
            ['07', 'specialists'],
            ['2', 'locations'],
            ['53', 'products shipped'],
            ['4.9/5', 'client rating'],
          ].map(([v, l]) => (
            <div key={l} className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-lg font-bold text-[#e3c893] tabular-nums">{v}</span>
              <span className="text-[12px] text-stone-400">{l}</span>
            </div>
          ))}
        </div>
        <a
          href="#cta"
          onClick={onClose}
          className="btn-primary rounded-lg px-4 py-2 text-[13px] font-semibold flex items-center gap-1.5 focus-ring"
        >
          Work with us
          <I.ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

/* ════════════════════════════ Services ════════════════════════════ */
function Services() {
  const services = [
    { icon: <I.Globe />, num: '01', title: 'Web Development', desc: 'Marketing sites, SaaS platforms and complex web applications built with Next.js, Astro and React. Fast, accessible, and engineered to convert.', tags: ['Next.js', 'Astro', 'Remix', 'Webflow'] },
    { icon: <I.Smartphone />, num: '02', title: 'Mobile Applications', desc: 'Native-feeling iOS and Android apps in React Native and Expo. Offline-first, App Store submission handled end-to-end.', tags: ['React Native', 'Expo', 'Swift', 'Kotlin'] },
    { icon: <I.Palette />, num: '03', title: 'Product Design', desc: 'Research-led UX and pixel-perfect UI in Figma. Design systems your internal team can extend long after we hand over.', tags: ['UI/UX', 'Figma', 'Prototyping', 'Design systems'] },
    { icon: <I.Zap />, num: '04', title: 'Performance Engineering', desc: 'Core Web Vitals audits, bundle optimisation and accessibility reviews. We regularly take products from failing to green.', tags: ['CWV', 'Lighthouse', 'WCAG', 'SEO'] },
    { icon: <I.Shield />, num: '05', title: 'Security & Compliance', desc: 'SOC 2, GDPR and HIPAA experience. Secure authentication, encrypted data paths, and privacy-by-default architecture.', tags: ['SOC 2', 'GDPR', 'HIPAA', 'OWASP'] },
    { icon: <I.Scale />, num: '06', title: 'MVP to Scale', desc: 'From a four-week MVP to infrastructure serving millions. Built for today, architected for what comes next.', tags: ['Postgres', 'AWS', 'Edge', 'CI/CD'] },
  ];

  return (
    <section id="services" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mb-16">
          <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5 mb-5">
            <I.Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[12px] font-medium text-stone-300">Capabilities</span>
          </div>
          <h2 className="reveal stagger-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-5 text-balance">
            Full-cycle product development —{' '}
            <span className="text-stone-400 font-medium text-2xl sm:text-3xl md:text-4xl">without the agency overhead.</span>
          </h2>
          <p className="reveal stagger-2 text-[15px] sm:text-base text-stone-400 leading-relaxed">
            Strategy, design, engineering and launch under one roof, accountable to one standard: does it measurably move your business?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s, i) => (
            <div key={s.title} className={cn('reveal card-lift group surface rounded-2xl p-6 flex flex-col cursor-default relative overflow-hidden', `stagger-${(i % 6) + 1}`)}>
              <div className="mono text-[10px] text-stone-600 absolute top-5 right-6 group-hover:text-gold transition-colors">{s.num}</div>
              <div className="w-11 h-11 rounded-xl bg-[#12141a] border hairline flex items-center justify-center text-stone-300 group-hover:bg-[#c9a86c]/10 group-hover:text-[#e3c893] group-hover:border-[#c9a86c]/30 transition-all duration-300 mb-5">
                {s.icon}
              </div>
              <h3 className="text-[17px] font-semibold text-white mb-2.5 tracking-tight">{s.title}</h3>
              <p className="text-[14px] text-stone-400 leading-relaxed mb-5 flex-1">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span key={t} className="text-[11px] mono text-stone-500 bg-white/5 px-2 py-1 rounded-md border hairline">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Project Mock Components ════════════════════════════ */
function MockFinTech() {
  return (
    <div className="flex flex-col h-full bg-[#0b0d12] text-white text-[10px]">
      <div className="flex items-center gap-2 px-3 py-2 border-b hairline">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 text-center mono text-[9px] text-stone-500">hearth.app/dashboard</div>
      </div>
      <div className="flex-1 p-3.5 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-stone-500 uppercase tracking-wider">Total balance</div>
            <div className="text-base font-bold tabular-nums">$284,921<span className="text-stone-500 font-normal">.47</span></div>
          </div>
          <div className="flex items-center gap-1 text-lime-300 bg-lime-400/10 px-1.5 py-0.5 rounded border border-lime-400/20">
            <I.TrendUp className="w-3 h-3" />
            <span className="text-[9px] font-semibold tabular-nums">+12.4%</span>
          </div>
        </div>
        <svg viewBox="0 0 200 44" className="w-full h-11" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="finG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a86c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c9a86c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 32 L20 27 L40 30 L60 22 L80 24 L100 17 L120 20 L140 12 L160 15 L180 8 L200 10 L200 44 L0 44 Z" fill="url(#finG)" />
          <path d="M0 32 L20 27 L40 30 L60 22 L80 24 L100 17 L120 20 L140 12 L160 15 L180 8 L200 10" stroke="#e3c893" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="space-y-1">
          {[
            { n: 'Apple Store', c: 'Hardware', a: '-$1,299', t: 'Today', neg: true },
            { n: 'Stripe payout', c: 'Revenue', a: '+$12,480', t: 'Yesterday', neg: false },
            { n: 'AWS infra', c: 'Tools', a: '-$641', t: 'Mar 12', neg: true },
          ].map((tx) => (
            <div key={tx.n} className="flex items-center justify-between py-1.5 border-b hairline">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold text-stone-300">{tx.n[0]}</div>
                <div>
                  <div className="text-[10px] font-medium">{tx.n}</div>
                  <div className="text-[8px] text-stone-500">{tx.t} · {tx.c}</div>
                </div>
              </div>
              <div className={cn('text-[10px] font-semibold tabular-nums', tx.neg ? 'text-stone-400' : 'text-lime-300')}>{tx.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockWildpath() {
  return (
    <div className="h-full bg-gradient-to-b from-[#111a12] via-[#0b0d12] to-[#0a0c10] text-white flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <svg viewBox="0 0 200 300" className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M0 220 C40 180 60 200 90 150 C120 100 150 130 200 80" stroke="#8ba888" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M0 250 C50 210 80 230 110 180 C140 130 170 160 200 120" stroke="#8ba888" strokeWidth="0.7" fill="none" opacity="0.35" />
          <path d="M40 240 L100 150 L160 210" stroke="#c9a86c" strokeWidth="2" strokeDasharray="5 3" fill="none" />
          <circle cx="40" cy="240" r="4" fill="#e3c893" />
          <circle cx="100" cy="150" r="6" fill="#a8c29a"><animate attributeName="r" values="6;8;6" dur="2.5s" repeatCount="indefinite" /></circle>
          <circle cx="160" cy="210" r="4" fill="#9ca38b" />
        </svg>
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="surface-strong rounded-lg px-2.5 py-1 text-[9px] font-semibold text-stone-200">Bright Angel Trail</div>
          <div className="surface-strong rounded-full w-7 h-7 flex items-center justify-center text-[10px] text-stone-300">⤢</div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 surface-strong rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div><div className="text-[11px] font-bold tabular-nums">3.2 mi</div><div className="text-[8px] text-stone-500">remaining</div></div>
            <div className="w-px h-6 bg-white/10" />
            <div><div className="text-[11px] font-bold text-[#a8c29a] tabular-nums">1h 42m</div><div className="text-[8px] text-stone-500">estimated</div></div>
            <div className="w-px h-6 bg-white/10" />
            <div><div className="text-[11px] font-bold text-[#e3c893]">Moderate</div><div className="text-[8px] text-stone-500">difficulty</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockHealth() {
  return (
    <div className="h-full bg-[#0c0e14] text-white flex flex-col">
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b hairline bg-[#9ca38b]/5">
        <div className="w-7 h-7 rounded-full bg-[#9ca38b]/20 border border-[#9ca38b]/30 flex items-center justify-center text-[10px] font-bold text-[#c9d4a8]">PM</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold truncate">Dr. Priya Mehta</div>
          <div className="flex items-center gap-1 text-[8px] text-lime-300">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse-dot" />
            In consultation · 14:23
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px]">🎙</div>
          <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-[9px]">✕</div>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {[['HR', '72'], ['BP', '120/80'], ['SpO₂', '98%']].map(([k, v]) => (
            <div key={k} className="bg-white/[0.04] border hairline rounded-lg p-2 text-center">
              <div className="text-[8px] text-stone-500 uppercase tracking-wider">{k}</div>
              <div className="text-sm font-bold text-white mt-0.5 tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <div className="bg-white/[0.04] border hairline rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold">Session summary</div>
            <div className="text-[8px] text-[#9db8d2] mono">AI-assisted</div>
          </div>
          <div className="space-y-1.5 text-[9px] text-stone-400">
            {['Patient reports improved sleep on adjusted dosage', 'Follow-up labs scheduled for Friday 9:00', 'Prescription renewed — sent to pharmacy'].map((x) => (
              <div key={x} className="flex gap-1.5 items-start">
                <I.Check className="w-2.5 h-2.5 text-lime-300 mt-0.5 flex-shrink-0" />{x}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 btn-primary rounded-md py-1.5 text-[9px] font-semibold text-center">Send prescription</div>
          <div className="btn-ghost rounded-md py-1.5 px-2.5 text-[9px]">Attach</div>
        </div>
      </div>
    </div>
  );
}

function MockMarketing() {
  return (
    <div className="h-full bg-gradient-to-br from-[#10141c] via-[#0a0c10] to-[#101210] text-white flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b hairline">
        <div className="text-[10px] font-bold flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#9db8d2]" />
          Nimbus
        </div>
        <div className="hidden sm:flex gap-3 text-[8px] text-stone-500">
          <span>Product</span><span>Pricing</span><span>Docs</span>
        </div>
        <div className="btn-primary rounded px-2.5 py-0.5 text-[8px] font-semibold">Get started</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-4">
        <div className="inline-flex items-center gap-1.5 surface rounded-full px-2 py-0.5 text-[7px] mb-2.5 text-stone-400">
          <span className="w-1 h-1 rounded-full bg-lime-400" /> v3.0 now available
        </div>
        <div className="text-base sm:text-lg font-bold tracking-tight leading-tight mb-1.5">
          Deploy to the edge in <span className="text-[#9db8d2]">seconds</span>
        </div>
        <div className="text-[8px] text-stone-500 max-w-[220px] mb-3">The infrastructure platform for teams that value their time.</div>
        <div className="flex gap-1.5 mb-3">
          <div className="btn-primary rounded px-2.5 py-1 text-[8px] font-semibold">Start free</div>
          <div className="btn-ghost rounded px-2.5 py-1 text-[8px]">Read the docs</div>
        </div>
        <div className="w-full surface rounded-lg p-2.5 text-left">
          <div className="flex items-center gap-1.5 mb-1.5 text-[8px] text-stone-500">
            <span className="text-[#e3c893]">▸</span> <span className="mono">$ nimbus deploy</span>
          </div>
          <div className="mono text-[8px] space-y-0.5 pl-3">
            <div className="text-lime-300">✓ Build complete (847ms)</div>
            <div className="text-lime-300">✓ Pushed to 32 edge regions</div>
            <div className="text-white">→ https://app.nimbus.dev <span className="animate-blink">▍</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ Work ════════════════════════════ */
function Work({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  const projects = [
    { name: 'Hearth', type: 'FinTech · Banking dashboard', year: '2025', desc: 'Rebuilt the customer portal end-to-end — real-time analytics, a re-engineered data layer, and a transaction interface users finally trust. Load times down 72%, trial-to-paid doubled.', metric: '2.1×', metricLabel: 'conversion lift', tags: ['Next.js', 'tRPC', 'Postgres'], mock: <MockFinTech />, accent: 'text-[#e3c893]', bg: 'from-[#c9a86c]/[0.07]' },
    { name: 'Wildpath', type: 'Consumer · iOS & Android', year: '2025', desc: 'The #1-rated hiking app on the App Store. Offline topographic maps, community routes, zero tracking. Featured by Apple as App of the Day within two months of launch.', metric: '120K', metricLabel: 'monthly active users', tags: ['React Native', 'Expo', 'Mapbox'], mock: <MockWildpath />, accent: 'text-[#a8c29a]', bg: 'from-[#9caf88]/[0.07]' },
    { name: 'Canvas Health', type: 'Healthcare · Telehealth SaaS', year: '2024', desc: 'A HIPAA-compliant telehealth platform with AI-assisted note-taking, live vitals and e-prescriptions. Five-week MVP, $18M Series A closed four months post-launch.', metric: '$18M', metricLabel: 'Series A raised', tags: ['Next.js', 'WebRTC', 'HIPAA'], mock: <MockHealth />, accent: 'text-[#c9d4a8]', bg: 'from-[#9ca38b]/[0.07]' },
    { name: 'Nimbus', type: 'Developer tools · Marketing site', year: '2024', desc: 'Complete brand and web platform for a developer infrastructure company. 98/100 Lighthouse, demo requests up 40%, and a component system their team owns outright.', metric: '98', metricLabel: 'Lighthouse score', tags: ['Astro', 'Figma', 'CMS'], mock: <MockMarketing />, accent: 'text-[#9db8d2]', bg: 'from-[#8fa3b8]/[0.07]' },
  ];

  return (
    <section id="work" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-dots-fine opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5 mb-5">
              <I.Star className="w-3.5 h-3.5 text-[#e3c893]" />
              <span className="text-[12px] font-medium text-stone-300">Selected work · 2024–2025</span>
            </div>
            <h2 className="reveal stagger-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-balance">
              Shipped. Measured. <span className="text-stone-400 font-medium text-2xl sm:text-3xl md:text-4xl">Trusted.</span>
            </h2>
          </div>
          <button onClick={onOpenInquiry} className="reveal stagger-2 btn-ghost rounded-lg px-4 py-2 text-[13px] font-medium inline-flex items-center gap-1.5 self-start focus-ring">
            Request case studies <I.ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {projects.map((p, i) => (
            <article key={p.name} className={cn('reveal group surface rounded-2xl overflow-hidden card-lift', `stagger-${(i % 4) + 1}`)}>
              <div className="sm:grid sm:grid-cols-12">
                <div className={cn('relative sm:col-span-6 p-5 sm:p-7', i % 2 === 1 && 'sm:order-2')}>
                  <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent', p.bg)} />
                  <div className="relative h-64 sm:h-full sm:min-h-[340px] overflow-hidden rounded-xl chrome-window border hairline">
                    {p.mock}
                  </div>
                </div>

                <div className={cn('relative sm:col-span-6 p-7 sm:p-9 flex flex-col justify-center', i % 2 === 1 && 'sm:order-1')}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium">{p.type}</span>
                    <span className="text-stone-700">·</span>
                    <span className="mono text-[10px] text-stone-500">{p.year}</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 group-hover:text-[#e3c893] transition-colors">{p.name}</h3>
                  <p className="text-[14px] sm:text-[15px] text-stone-400 leading-relaxed mb-6 text-pretty">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-7">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[11px] mono text-stone-400 bg-white/5 px-2 py-1 rounded-md border hairline">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-5 pt-5 border-t hairline">
                    <div>
                      <div className={cn('text-3xl font-bold tracking-tight tabular-nums', p.accent)}>{p.metric}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{p.metricLabel}</div>
                    </div>
                    <div className="flex-1" />
                    <button onClick={onOpenInquiry} className="w-11 h-11 rounded-full surface flex items-center justify-center text-stone-400 group-hover:bg-[#f4f2ed] group-hover:text-[#0a0c10] transition-all">
                      <I.ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Process ════════════════════════════ */
function Process() {
  const steps = [
    { n: '01', t: 'Discovery call', d: 'A focused 30 minutes on your goals, users, constraints and timeline. You will leave with honest advice — whether or not we work together.' },
    { n: '02', t: 'Proposal & design sprint', d: 'A fixed quote with milestones, then a week of Figma prototypes you can click through and challenge before any code is written.' },
    { n: '03', t: 'Weekly builds', d: 'Agile sprints with a live demo every Friday. You always have something running in your hands, never a status deck.' },
    { n: '04', t: 'Launch & warranty', d: 'Deployment, store submissions, analytics — then a minimum 30-day bug warranty. We do not disappear after invoicing.' },
  ];

  const commitments = [
    'Senior team only — no juniors, hand-offs or subcontractors',
    'Direct Slack channel with the people building your product',
    'Friday demos, every single week, without exception',
    'Fixed-price quotes or transparent hourly — your choice',
    'Full IP transfer: you own 100% of code and design files',
    'Documentation and handover your internal team can run with',
  ];

  return (
    <section id="process" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-[#c9a86c]/[0.05] rounded-full blur-[130px]" />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <div>
            <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5 mb-5">
              <I.Check className="w-3.5 h-3.5 text-lime-300" />
              <span className="text-[12px] font-medium text-stone-300">The Client Found method</span>
            </div>
            <h2 className="reveal stagger-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 text-balance">
              A process that respects{' '}
              <span className="text-stone-400 font-medium text-2xl sm:text-3xl md:text-4xl">your time and budget.</span>
            </h2>
            <p className="reveal stagger-2 text-[15px] text-stone-400 leading-relaxed mb-10">
              No six-month discovery phases. No contractors-of-contractors. A small team, a clear plan, and usable software from week two onwards.
            </p>

            <div className="reveal stagger-3 surface-strong rounded-2xl p-6 sm:p-7 space-y-3.5 gold-border">
              <div className="mono text-[10px] uppercase tracking-[0.25em] text-stone-500 mb-1">Every engagement includes</div>
              {commitments.map((c) => (
                <div key={c} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#c9a86c]/15 border border-[#c9a86c]/30 flex items-center justify-center flex-shrink-0">
                    <I.Check className="w-2.5 h-2.5 text-[#e3c893]" />
                  </div>
                  <span className="text-[14px] text-stone-300">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={s.n} className={cn('reveal card-lift surface rounded-2xl p-6 flex gap-5', `stagger-${i + 1}`)}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#12141a] border hairline flex items-center justify-center">
                    <span className="mono text-[13px] font-semibold text-[#e3c893]">{s.n}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-[#c9a86c]/30 to-transparent mt-2" />}
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="text-[17px] font-semibold text-white tracking-tight mb-1.5">{s.t}</h3>
                  <p className="text-[14px] text-stone-400 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Tech stack ════════════════════════════ */
function TechStack() {
  const techs = [
    'Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL',
    'React Native', 'Figma', 'tRPC', 'Prisma', 'Stripe', 'AWS', 'Supabase',
    'Vercel', 'Framer Motion', 'Expo', 'GraphQL', 'Redis',
  ];
  return (
    <section className="py-14 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-8">
          <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-stone-400">The stack we ship in production</span>
          </div>
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-2.5 animate-marquee whitespace-nowrap py-1">
            {[...techs, ...techs].map((t, i) => (
              <div key={i} className="surface rounded-lg px-4 py-2 text-[13px] font-medium text-stone-300 flex-shrink-0 hover:text-white hover:border-white/15 transition-colors">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Testimonials ════════════════════════════ */
function Testimonials() {
  const reviews = [
    { quote: 'They shipped our MVP in three weeks and it was genuinely good. We raised $4M on the back of a product investors could actually use, not a pitch deck.', name: 'Jordan Michaels', role: 'Co-founder & CEO, Slate', initials: 'JM', color: 'bg-[#c9a86c] text-[#141310]' },
    { quote: 'Six agencies in five years. Client Found is the only one I have re-booked. They treat your roadmap like their own balance sheet depends on it.', name: 'Ana Sharma', role: 'VP Product, Lumen', initials: 'AS', color: 'bg-[#8fa3b8] text-[#0c0e12]' },
    { quote: 'From a 42 to a 96 Lighthouse score, and demo requests up 300%. No design ego, no engineering drama, no missed deadlines.', name: 'Ryan Kim', role: 'CEO, Outpost', initials: 'RK', color: 'bg-[#b8927a] text-[#141010]' },
    { quote: 'The app they built was featured by Apple. There is not much more to say — they simply know what they are doing.', name: 'Lena Carstens', role: 'Founder, Wildpath', initials: 'LC', color: 'bg-[#9caf88] text-[#0e120c]' },
    { quote: 'I am a technical founder and admittedly particular about code. The architecture is something my internal team happily inherited. That is rare.', name: 'Tom Whitaker', role: 'CTO, Hearth', initials: 'TW', color: 'bg-[#a08fb4] text-[#100e14]' },
    { quote: 'HIPAA-compliant telehealth in five weeks, passed every audit first time, on budget. Our board now reviews their sprint demos.', name: 'Dr. Priya Mehta', role: 'Co-founder, Canvas Health', initials: 'PM', color: 'bg-[#9ca38b] text-[#0e120c]' },
  ];

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5 mb-5">
              <I.Star className="w-3.5 h-3.5 text-[#e3c893]" />
              <span className="text-[12px] font-medium text-stone-300">4.9 average · 53 verified reviews</span>
            </div>
            <h2 className="reveal stagger-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-balance">
              Real clients.<br />Real results.
            </h2>
          </div>
          <p className="reveal stagger-2 max-w-md text-stone-400 text-[15px]">
            Straight from the founders and executives who trusted us with their most important digital products.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reviews.map((r, i) => (
            <figure 
              key={r.name} 
              className={cn(
                'reveal card-lift surface rounded-2xl p-7 flex flex-col border-l-2 border-transparent hover:border-[#c9a86c] transition-all',
                i === 0 ? 'lg:col-span-1 lg:row-span-2' : '',
                `stagger-${(i % 6) + 1}`
              )}
            >
              <div className="flex mb-4">
                <I.Quote />
              </div>
              <blockquote className={cn(
                'text-stone-200 leading-snug flex-1 text-pretty',
                i === 0 ? 'text-xl sm:text-2xl font-medium' : 'text-[15px]'
              )}>
                “{r.quote}”
              </blockquote>

              <div className="flex items-center gap-3 mt-8 pt-6 border-t hairline">
                <div className={cn('w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold', r.color)}>
                  {r.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white tracking-tight">{r.name}</div>
                  <div className="text-[12px] text-stone-500">{r.role}</div>
                </div>
                <div className="ml-auto flex text-[#e3c893]">
                  {[...Array(5)].map((_, idx) => <I.Star key={idx} className="w-3.5 h-3.5" />)}
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Pricing ════════════════════════════ */
function Pricing({ onOpenInquiry }: { onOpenInquiry: () => void }) {
  const tiers = [
    { name: 'Starter', price: '$6,500', note: 'fixed price · ~3 weeks', desc: 'Landing pages, marketing sites and focused feature work for early-stage teams.', features: ['Up to 6 pages or screens', 'Responsive, accessible build', 'CMS integration (Sanity/Contentful)', 'On-page SEO & Core Web Vitals', 'Two structured revision rounds', '30-day post-launch support'], cta: 'Book an intro call', highlight: false },
    { name: 'Build', price: '$20K–$75K', note: 'fixed · 4–10 weeks', desc: 'Full web or mobile applications delivered end-to-end. Our most common engagement.', features: ['Unlimited pages / screens', 'Custom UI/UX design in Figma', 'Full-stack engineering', 'API & third-party integrations', 'Weekly demos + dedicated Slack', 'Analytics & conversion tracking', '90-day post-launch support', 'Complete IP transfer'], cta: 'Scope your build', highlight: true },
    { name: 'Partner', price: '$9,500', note: 'per month · rolling', desc: 'An embedded product team for organisations shipping continuously.', features: ['Everything in Build', 'Dedicated three-person pod', 'Continuous weekly delivery', 'Same-week turnaround', 'Quarterly roadmap sessions', 'Design system stewardship', 'Performance & uptime monitoring', 'Pause or cancel anytime'], cta: 'Discuss a partnership', highlight: false },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5 mb-5">
            <span className="mono text-[11px] text-gold">$</span>
            <span className="text-[12px] font-medium text-stone-300">Engagement models</span>
          </div>
          <h2 className="reveal stagger-1 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 text-balance">
            Clear pricing. <span className="text-stone-400 font-medium text-2xl sm:text-3xl md:text-4xl">No surprise invoices.</span>
          </h2>
          <p className="reveal stagger-2 text-[15px] text-stone-400">
            Fixed prices for defined scopes. Rolling retainers for continuous work. The same senior standard either way.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {tiers.map((t, i) => (
            <div key={t.name} className={cn('reveal rounded-2xl p-7 flex flex-col relative', t.highlight ? 'surface-strong gold-border lg:-translate-y-2 lg:scale-[1.02] glow-gold' : 'surface card-lift', `stagger-${i + 1}`)}>
              {t.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="btn-gold rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">Most engaged</span>
                </div>
              )}
              <div className="mb-6">
                <div className="text-[13px] font-semibold text-white mb-1">{t.name}</div>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">{t.price}</span>
                </div>
                <div className="text-[12px] text-stone-500 mt-1">{t.note}</div>
              </div>
              <p className="text-[13px] text-stone-400 mb-6 leading-relaxed">{t.desc}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-stone-300">
                    <I.Check className="w-4 h-4 text-lime-300 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onOpenInquiry} className={cn('rounded-xl py-3 text-[14px] font-semibold text-center transition-all focus-ring flex items-center justify-center gap-1.5', t.highlight ? 'btn-primary' : 'btn-ghost')}>
                {t.cta}
                <I.ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ FAQ ════════════════════════════ */
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { q: 'How quickly can you start?', a: 'New engagements typically kick off within one to two weeks of contract. For time-sensitive programmes we can occasionally start sooner — we will be direct about what is realistic on the intro call.' },
    { q: 'What does a typical engagement cost?', a: 'Landing pages range $5K–$15K, web or mobile applications $20K–$80K, and ongoing partnership is $9,500 per month. Every quote is itemised by milestone, in writing, with no change-order surprises.' },
    { q: 'Can you meet procurement and compliance requirements?', a: 'Yes. We are comfortable with enterprise and public-sector procurement: MSA/SOW structures, security questionnaires, accessibility standards (WCAG 2.2 AA), GDPR data processing agreements, and indemnity requirements. Documentation is a deliverable, not an afterthought.' },
    { q: 'Do you work with early-stage startups?', a: 'Around 40% of our clients are pre-seed or seed-stage. For teams we believe in, we occasionally structure reduced fees against a small equity position. Raise it on the call if it matters to you.' },
    { q: 'Who actually does the work?', a: 'Seven specialists across Austin and Lisbon — designers, engineers and a product lead. No offshore subcontractors and no junior hand-offs. You meet the exact people building your product before signing anything.' },
    { q: 'What happens after launch?', a: 'Every project carries a minimum 30-day bug warranty. Afterwards, most clients move to the Partner retainer or ad-hoc hours for iteration, monitoring and new features.' },
    { q: 'Which technologies do you build with?', a: 'Primarily React, Next.js and TypeScript on the web; React Native and Expo for mobile; PostgreSQL for data; Vercel, AWS or GCP for infrastructure. We recommend tools against your team and roadmap, not our CV.' },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 relative">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-12">
          <div className="reveal inline-flex items-center gap-2 surface rounded-full px-3 py-1.5 mb-5">
            <span className="mono text-[11px] text-gold">?</span>
            <span className="text-[12px] font-medium text-stone-300">Questions, answered</span>
          </div>
          <h2 className="reveal stagger-1 text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">Still deciding?</h2>
          <p className="reveal stagger-2 text-stone-400 text-[15px]">Anything else — ask us directly on the call.</p>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className={cn('reveal surface rounded-xl overflow-hidden transition-colors', open === i && 'border-[#c9a86c]/30', `stagger-${(i % 6) + 1}`)}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4" aria-expanded={open === i}>
                <span className="text-[14px] sm:text-[15px] font-medium text-white">{item.q}</span>
                <span className={cn('flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300', open === i ? 'bg-[#f4f2ed] text-[#0a0c10]' : 'bg-white/5 text-stone-400')}>
                  {open === i ? <I.Minus /> : <I.Plus />}
                </span>
              </button>
              <div className={cn('overflow-hidden transition-all duration-300 ease-out', open === i ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0')}>
                <p className="px-5 pb-5 text-[14px] text-stone-400 leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Final CTA ════════════════════════════ */
function FinalCTA({ onOpenInquiry, cms }: { onOpenInquiry: () => void; cms: CMSConfig }) {
  return (
    <section id="cta" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c9a86c]/[0.06] via-transparent to-transparent" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-[#4a5a75]/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 w-[280px] h-[280px] bg-[#c9a86c]/10 rounded-full blur-[110px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 sm:px-6">
        <div className="reveal surface-strong rounded-3xl p-8 sm:p-14 text-center gold-border relative overflow-hidden">
          <div className="absolute inset-0 bg-dots-fine opacity-30" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 surface rounded-full px-3.5 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse-dot" />
              <span className="text-[12px] text-stone-300">Next available start: <span className="text-white font-medium">{cms.nextAvailableStart}</span></span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 leading-tight text-balance">
              Let's build something people actually use.
              <span className="block mt-2 text-stone-400 font-medium text-xl sm:text-2xl md:text-3xl">
                Thirty minutes. No obligation. A clear answer.
              </span>
            </h2>

            <p className="text-[15px] sm:text-base text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed text-pretty">
              Book an intro call and we will tell you plainly whether we are the right team — and if not, who is.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <button onClick={onOpenInquiry} className="btn-primary rounded-xl px-7 py-4 text-[15px] font-semibold w-full sm:w-auto flex items-center justify-center gap-2 focus-ring">
                Book a free intro call
                <I.ArrowRight className="w-4 h-4" />
              </button>
              <a href="mailto:hello@clientfound.com" className="btn-ghost rounded-xl px-7 py-4 text-[15px] font-semibold w-full sm:w-auto flex items-center justify-center gap-2 focus-ring">
                hello@clientfound.com
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] text-stone-500">
              {['Reply within 24 hours', 'Mutual NDA on request', 'References available'].map((x) => (
                <span key={x} className="flex items-center gap-1.5">
                  <I.Check className="w-3 h-3 text-lime-300" />
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════ Footer ════════════════════════════ */
function Footer({ onOpenAuth }: { onOpenAuth: () => void }) {
  const cols = [
    { h: 'Services', l: ['Web Development', 'Mobile Apps', 'Product Design', 'Performance Engineering', 'MVP to Scale'] },
    { h: 'Studio', l: ['About', 'Process', 'Case Studies', 'Careers', 'Contact'] },
    { h: 'Resources', l: ['Insights', 'Pricing Guide', 'Accessibility (WCAG)', 'Privacy', 'Terms'] },
  ];

  return (
    <footer id="contact" className="border-t hairline pt-16 pb-8 relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <I.Logo />
              <div className="flex flex-col leading-none">
                <span className="text-[16px] font-semibold tracking-tight text-stone-100">Client<span className="text-gold">Found</span></span>
                <span className="mono text-[8px] uppercase tracking-[0.25em] text-stone-500 mt-0.5">Studios</span>
              </div>
            </a>
            <p className="text-[14px] text-stone-400 leading-relaxed mb-6 max-w-xs text-pretty">
              A senior product studio designing and engineering websites and applications for ambitious organisations. Austin & Lisbon.
            </p>
            <div className="flex gap-2">
              {[
                { i: <I.X />, l: 'X (Twitter)' },
                { i: <I.Li />, l: 'LinkedIn' },
                { i: <I.Gh />, l: 'GitHub' },
                { i: <I.Ig />, l: 'Instagram' },
              ].map((s) => (
                <a key={s.l} href="#" aria-label={s.l} className="w-9 h-9 rounded-lg surface flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors focus-ring">
                  {s.i}
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.h}>
              <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.18em] mb-4">{col.h}</h4>
              <ul className="space-y-2.5">
                {col.l.map((link) => (
                  <li key={link}><a href="#" className="text-[13px] text-stone-500 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-7 border-t hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-stone-500">© 2026 Client Found Studios LLC. All rights reserved.</p>
          <div className="flex items-center gap-5 text-[12px] text-stone-500">
            <button onClick={onOpenAuth} className="hover:text-white transition-colors">Login</button>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse-dot" />
              <span className="mono text-[10px] uppercase tracking-wider">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════ App Main Router ════════════════════════════ */
export default function App() {
  useReveal();

  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [storeState, setStoreState] = useState(studioStore.getState());
  const [storeReady, setStoreReady] = useState(studioStore.isReady());
  const [filmOpen, setFilmOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'client' | 'admin'>('client');

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    const unsubscribe = studioStore.subscribe(() => {
      setStoreState({ ...studioStore.getState() });
    });

    if (!studioStore.isReady()) {
      studioStore.init().then(() => setStoreReady(true));
    } else {
      setStoreReady(true);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsubscribe();
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFilm = useCallback(() => setFilmOpen(true), []);
  const closeFilm = useCallback(() => setFilmOpen(false), []);

  const handleAuthSuccess = (user: UserProfile) => {
    showToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})!`);
    if (user.role === 'admin') {
      navigateTo('/admin');
    } else {
      navigateTo('/client');
    }
  };

  const isAdminRoute = currentPath.startsWith('/admin') || window.location.hash === '#/admin' || window.location.hash === '#admin';
  const isClientRoute = currentPath.startsWith('/client') || window.location.hash === '#/client' || window.location.hash === '#client';

  if (!storeReady) {
    return (
      <>
        <ToastHost />
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin mx-auto" />
            <div className="mono text-[10px] uppercase tracking-[0.25em] text-stone-500">Loading Client Found</div>
          </div>
        </div>
      </>
    );
  }

  if (isAdminRoute) {
    return (
      <>
        <ToastHost />
        <AdminPanel onReturnToSite={() => navigateTo('/')} />
        <DirectChatWidget />
      </>
    );
  }

  if (isClientRoute) {
    return (
      <>
        <ToastHost />
        <ClientPortal onReturnToSite={() => navigateTo('/')} />
        <DirectChatWidget />
      </>
    );
  }

  return (
    <div className="relative bg-[#0a0c10] text-stone-200 min-h-screen antialiased">
      <div className="noise-overlay" />
      <ScrollProgress />

      <ToastHost />

      <Nav
        user={storeState.currentUser}
        onOpenInquiry={() => setInquiryOpen(true)}
        onOpenAuth={(tab = 'client') => { setAuthTab(tab); setAuthOpen(true); }}
        onOpenDashboard={() => navigateTo('/client')}
        onGoAdmin={() => navigateTo('/admin')}
        onLogout={() => {
          studioStore.logout();
          showToast('Logged out successfully.');
        }}
      />

      <main>
        <PersonalAppShowcase
          onOpenConfigurator={() => setConfiguratorOpen(true)}
          onOpenInquiry={() => setInquiryOpen(true)}
        />
        <Logos />
        <Hero
          onOpenInquiry={() => setInquiryOpen(true)}
          cms={storeState.cms}
        />
        <ImmersiveFilm onWatchFilm={openFilm} cms={storeState.cms} />
        <Services />
        <Work onOpenInquiry={() => setInquiryOpen(true)} />
        <Process />
        <TechStack />
        <Testimonials />
        <Pricing onOpenInquiry={() => setInquiryOpen(true)} />
        <FAQ />
        <FinalCTA onOpenInquiry={() => setInquiryOpen(true)} cms={storeState.cms} />
      </main>

      <Footer
        onOpenAuth={() => { setAuthTab('client'); setAuthOpen(true); }}
      />

      <VideoModal open={filmOpen} onClose={closeFilm} cms={storeState.cms} />

      <ProjectInquiryModal
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        onSuccess={() => {}}
      />

      <AppConfiguratorModal
        open={configuratorOpen}
        onClose={() => setConfiguratorOpen(false)}
        onSuccess={() => {}}
      />

      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <DirectChatWidget
        onOpenAuth={() => { setAuthTab('client'); setAuthOpen(true); }}
      />
    </div>
  );
}