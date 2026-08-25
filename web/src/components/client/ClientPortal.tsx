import React, { useEffect, useState } from 'react';
import { studioStore, ClientAccount } from '../../store/studioStore';
import { showToast } from '../../store/toast';
import { ProjectInquiryModal } from './ProjectInquiryModal';
import { ClientOverview } from './ClientOverview';
import { ClientBuilds } from './ClientBuilds';
import { ClientInvoices } from './ClientInvoices';
import { ClientAssets } from './ClientAssets';
import { ClientTeam } from './ClientTeam';
import { ClientSettings } from './ClientSettings';
import { AppConfiguratorModal } from '../configurator/AppConfiguratorModal';
import { LogoutIcon } from '../common/icons';

interface Props {
  onReturnToSite: () => void;
}

type ClientTab = 'overview' | 'builds' | 'invoices' | 'assets' | 'team' | 'settings';

export const ClientPortal: React.FC<Props> = ({ onReturnToSite }) => {
  const [storeState, setStoreState] = useState(studioStore.getState());
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('client-portal-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('client-portal-theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = studioStore.subscribe(() => {
      setStoreState({ ...studioStore.getState() });
    });
    return unsubscribe;
  }, []);

  const user = storeState.currentUser;

  const clientProjects = user
    ? storeState.projects.filter(
        (p) =>
          p.clientEmail.toLowerCase() === user.email.toLowerCase() ||
          p.clientName.toLowerCase().includes(user.name.toLowerCase())
      )
    : [];

  const clientInvoices = user
    ? storeState.invoices.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(user.name.toLowerCase()) ||
          (user.company && inv.clientName.toLowerCase().includes(user.company.toLowerCase()))
      )
    : [];

  const clientAccount: ClientAccount | undefined = user
    ? storeState.clients.find(
        (c) =>
          c.email.toLowerCase() === user.email.toLowerCase() ||
          c.name.toLowerCase().includes(user.name.toLowerCase()) ||
          (user.company && c.company.toLowerCase().includes(user.company.toLowerCase()))
      )
    : undefined;

  if (!user || user.role !== 'client') {
    return <ClientLoginGate />;
  }

  const navItems: { id: ClientTab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'builds', label: 'My Builds', icon: '🚀', badge: clientProjects.filter((p) => p.status !== 'Shipped').length },
    { id: 'invoices', label: 'Invoices & Payments', icon: '💳', badge: clientInvoices.filter((i) => i.status === 'Pending').length },
    { id: 'assets', label: 'Assets & Deliverables', icon: '📦', badge: storeState.assets.length },
    { id: 'team', label: 'Team & Support', icon: '🤝' },
    { id: 'settings', label: 'Account Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    studioStore.logout();
    showToast('Logged out successfully.');
    onReturnToSite();
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-[#0a0c10] text-stone-200 flex flex-col antialiased selection:bg-[#c9a86c]/30 selection:text-white transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="border-b hairline bg-[#12141a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center font-bold text-gold">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">Client<span className="text-gold">Found</span></span>
                <span className="mono text-[9px] bg-gold/20 text-[#e3c893] px-2 py-0.5 rounded-md font-semibold border border-gold/30">
                  CLIENT PORTAL
                </span>
              </div>
              <div className="text-[10px] text-stone-400">Your Build Workspace & Delivery Tracker</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl surface flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setConfiguratorOpen(true)}
              className="btn-ghost rounded-xl px-3.5 py-2 text-xs font-semibold text-gold border-gold/40 flex items-center gap-1.5"
            >
              🛠️ Design App
            </button>
            <button
              onClick={() => setInquiryOpen(true)}
              className="btn-gold rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
            >
              + Request Build
            </button>
            <button
              onClick={onReturnToSite}
              className="btn-ghost rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              🌐 Home
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl surface flex items-center justify-center text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Portal Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-80 surface-strong rounded-3xl p-5 gold-border h-fit space-y-3 flex-shrink-0">
          <div className="flex items-center gap-4 px-3 py-3.5 mb-2 border-b hairline">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-extrabold text-xl tracking-tight">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-white tracking-tight truncate">{user.name}</div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5">{user.company || 'Client Account'}</div>
            </div>
          </div>

          <div className="mono text-[10px] uppercase tracking-[0.25em] text-stone-500 px-3 py-1.5">Workspace Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-gold text-[#0a0c10] shadow-lg shadow-gold/10'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-base leading-none ${activeTab === item.id ? '' : 'opacity-90'}`}>{item.icon}</span>
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold tabular-nums ${
                  activeTab === item.id ? 'bg-[#0a0c10] text-gold' : 'bg-gold text-[#0a0c10]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t hairline mt-4 text-[12px] text-stone-500 space-y-1.5 px-3">
            <div className="font-medium">Engineered for Client Found</div>
            <div className="mono text-[10px]">v2.5.0 · Personal App Studio</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <ClientOverview
              user={user}
              projects={clientProjects}
              invoices={clientInvoices}
              cms={storeState.cms}
              onNavigate={(tab) => setActiveTab(tab as ClientTab)}
              onOpenInquiry={() => setInquiryOpen(true)}
            />
          )}
          {activeTab === 'builds' && (
            <ClientBuilds user={user} projects={clientProjects} />
          )}
          {activeTab === 'invoices' && (
            <ClientInvoices invoices={clientInvoices} onNotification={(msg) => showToast(msg)} />
          )}
          {activeTab === 'assets' && (
            <ClientAssets projects={clientProjects} assets={storeState.assets} />
          )}
          {activeTab === 'team' && (
            <ClientTeam projects={clientProjects} clientAccount={clientAccount} cms={storeState.cms} />
          )}
          {activeTab === 'settings' && (
            <ClientSettings user={user} clientAccount={clientAccount} onReturnToSite={onReturnToSite} />
          )}
        </main>
      </div>

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
    </div>
  );
};

/* ════════════════════════════ Login Gate ════════════════════════════ */
function ClientLoginGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await studioStore.clientLogin(email, password);
    if (!res.success || !res.user) {
      setError(res.message || 'Invalid email or password.');
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setError('');
    await studioStore.clientLogin(demoEmail, 'client123');
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-stone-200 flex items-center justify-center p-4 antialiased selection:bg-[#c9a86c]/30 selection:text-white relative overflow-hidden">
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-[#c9a86c]/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="relative w-full max-w-md surface-strong rounded-3xl p-6 sm:p-8 gold-border shadow-2xl animate-modal-in">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Client Found Studio</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Client Portal Access</h1>
        <p className="text-xs text-stone-400 mt-1.5 mb-6">
          Sign in to your client workspace to track active builds, milestones, invoices and your dedicated team.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1 block">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c9a86c]"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#c9a86c]"
            />
          </div>

          {error && (
            <div className="text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full rounded-xl px-4 py-3 text-xs font-bold text-[#0a0c10] shadow-lg shadow-white/10 hover:scale-[1.01] transition-transform">
            Access My Workspace →
          </button>
        </form>

        <div className="mt-6 pt-5 border-t hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mb-2">Quick Demo Access</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => quickLogin('jordan@slate.inc')} className="text-[11px] text-gold underline hover:text-gold-bright">
              jordan@slate.inc
            </button>
            <button onClick={() => quickLogin('priya@canvashealth.com')} className="text-[11px] text-gold underline hover:text-gold-bright">
              priya@canvashealth.com
            </button>
            <button onClick={() => quickLogin('lena@wildpath.app')} className="text-[11px] text-gold underline hover:text-gold-bright">
              lena@wildpath.app
            </button>
          </div>
          <div className="text-[10px] text-stone-500 mt-2">Password for demo accounts: <span className="text-stone-300">client123</span></div>
        </div>
      </div>
    </div>
  );
}
