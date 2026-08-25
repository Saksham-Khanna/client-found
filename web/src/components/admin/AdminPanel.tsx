import React, { useState, useEffect, useRef } from 'react';
import { studioStore } from '../../store/studioStore';
import { showToast } from '../../store/toast';
import { AdminLogin } from './AdminLogin';
import { DashboardOverview } from './DashboardOverview';
import { LeadsManager } from './LeadsManager';
import { ProjectsManager } from './ProjectsManager';
import { InvoicesManager } from './InvoicesManager';
import { CMSManager } from './CMSManager';
import { AuditLogs } from './AuditLogs';
import { ChatInboxManager } from './ChatInboxManager';
import { LogoutIcon } from '../common/icons';

interface Props {
  onReturnToSite: () => void;
}

type AdminTab = 'dashboard' | 'leads' | 'projects' | 'invoices' | 'chats' | 'cms' | 'logs';

export const AdminPanel: React.FC<Props> = ({ onReturnToSite }) => {
  const [storeState, setStoreState] = useState(studioStore.getState());
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [readLogIds, setReadLogIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number } | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin-console-theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-console-theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = studioStore.subscribe(() => {
      setStoreState({ ...studioStore.getState() });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    const handleResize = () => setShowNotifications(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [showNotifications]);

  const toggleNotifications = () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }
    if (notificationsRef.current) {
      const rect = notificationsRef.current.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - 16);
      setPopoverStyle({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - width),
      });
    }
    setShowNotifications(true);
  };

  const unreadLogs = storeState.logs.filter((log) => !readLogIds.includes(log.id));
  const unreadChatCount = storeState.chatThreads.filter((t) => t.unreadCountAdmin > 0).length;

  if (storeState.currentUser?.role !== 'admin') {
    return <AdminLogin theme={theme} onSuccess={() => setStoreState({ ...studioStore.getState() })} />;
  }

  const handleLogout = () => {
    studioStore.logout();
    showToast('Logged out successfully.');
  };

  const navItems: { id: AdminTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'leads', label: 'Inbound Leads', icon: '📥', badge: storeState.leads.filter(l => l.status === 'New').length },
    { id: 'projects', label: 'Active Builds', icon: '🚀', badge: storeState.projects.filter(p => p.status === 'In Progress').length },
    { id: 'chats', label: 'Live Chat Desk', icon: '💬', badge: unreadChatCount },
    { id: 'invoices', label: 'Invoices & Billing', icon: '💳', badge: storeState.invoices.filter(i => i.status === 'Pending').length },
    { id: 'cms', label: 'Site CMS & Slots', icon: '⚙️' },
    { id: 'logs', label: 'Audit Logs', icon: '📜' },
  ];

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
                  ADMIN CONSOLE
                </span>
              </div>
              <div className="text-[10px] text-stone-400">Operations, Leads & Infrastructure Control</div>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#0a0c10] border border-white/10 rounded-xl px-3 py-1.5 text-xs w-64">
              <span className="text-stone-500 mr-2">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, projects, clients..."
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>

            {/* Notifications Popover */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className="w-9 h-9 rounded-xl surface flex items-center justify-center text-stone-300 hover:text-white transition-colors relative"
                aria-label="Notifications"
              >
                🔔
                {unreadLogs.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-gold text-[#0a0c10] text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadLogs.length > 9 ? '9+' : unreadLogs.length}
                  </span>
                )}
              </button>

              {showNotifications && popoverStyle && (
                <div
                  className="fixed w-72 max-w-[calc(100vw-16px)] surface-strong rounded-2xl p-4 shadow-2xl shadow-black/60 space-y-3 z-[100] animate-modal-in"
                  style={popoverStyle}
                >
                  <div className="flex items-center justify-between pb-2 border-b hairline">
                    <span className="text-xs font-bold text-white">System Notifications</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReadLogIds(storeState.logs.map((log) => log.id))}
                        className="mono text-[9px] text-gold hover:text-gold-bright transition-colors"
                        title="Mark all as read"
                      >
                        Mark all as read
                      </button>
                      <button
                        onClick={() => storeState.logs.forEach((log) => studioStore.deleteLog(log.id))}
                        className="mono text-[9px] text-stone-400 hover:text-red-400 transition-colors"
                        title="Clear all notifications"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Close"
                        aria-label="Close notifications"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {storeState.logs.length === 0 ? (
                    <div className="text-xs text-stone-500 text-center py-4">No notifications yet.</div>
                  ) : (
                    <div className="space-y-2 text-xs max-h-[60vh] overflow-y-auto">
                      {storeState.logs.slice(0, 4).map((log) => (
                        <div key={log.id} className="group p-2 rounded-lg bg-white/[0.02] border hairline">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {!readLogIds.includes(log.id) && (
                                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" title="Unread" />
                              )}
                              <div className="text-stone-200 font-medium truncate">{log.action}</div>
                            </div>
                            <button
                              onClick={() => studioStore.deleteLog(log.id)}
                              className="w-5 h-5 rounded-md flex items-center justify-center text-stone-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              title="Delete notification"
                              aria-label="Delete notification"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-[9px] text-stone-500 mt-0.5">{log.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl surface flex items-center justify-center text-stone-300 hover:text-white transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light/Dark Theme"
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
              onClick={onReturnToSite}
              className="btn-ghost rounded-xl px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              🌐 Home
            </button>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl surface flex items-center justify-center text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
              title="Logout Admin"
              aria-label="Logout Admin"
            >
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-80 surface-strong rounded-2xl p-4 gold-border h-fit space-y-2 flex-shrink-0">
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-stone-500 px-3 py-1.5">Console Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-gold text-[#0a0c10] font-bold shadow-lg shadow-gold/10'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === item.id ? 'bg-[#0a0c10] text-gold' : 'bg-gold text-[#0a0c10]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t hairline mt-4 text-[12px] text-stone-500 space-y-1.5 px-3">
            <div>Engineered for Client Found</div>
            <div className="mono text-[10px]">v2.4.0 · Direct Deploy Ready</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <DashboardOverview onNavigate={(t) => setActiveTab(t as any)} />}
          {activeTab === 'leads' && (
            <LeadsManager
              onNotification={(msg) => showToast(msg)}
              onOpenProject={() => setActiveTab('projects')}
            />
          )}
          {activeTab === 'projects' && <ProjectsManager onNotification={(msg) => showToast(msg)} />}
          {activeTab === 'chats' && <ChatInboxManager onNotification={(msg) => showToast(msg)} />}
          {activeTab === 'invoices' && <InvoicesManager onNotification={(msg) => showToast(msg)} />}
          {activeTab === 'cms' && <CMSManager onNotification={(msg) => showToast(msg)} />}
          {activeTab === 'logs' && <AuditLogs />}
        </main>
      </div>
    </div>
  );
};
