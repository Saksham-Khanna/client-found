import React, { useState, useEffect } from 'react';
import { studioStore, UserProfile } from '../../store/studioStore';
import { useBodyLock } from '../../hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialTab?: 'client' | 'admin';
}

export const AuthModal: React.FC<Props> = ({ open, onClose, onSuccess, initialTab = 'client' }) => {
  useBodyLock(open);

  const [activeRole, setActiveRole] = useState<'client' | 'admin'>(initialTab);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    if (open) {
      setActiveRole(initialTab);
      setMode('login');
      setShowPassword(false);
      setErrorMessage('');
    }
  }, [open, initialTab]);

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    const res = await studioStore.clientLogin(email, password);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(
        activeRole === 'admin'
          ? 'Invalid admin credentials. Use admin@clientfound.com with password "admin123".'
          : res.message || 'Invalid email or password.'
      );
    }
  };

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName || !regEmail || !regPassword || !regCompany) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }
    const res = await studioStore.clientRegister({
      name: regName,
      email: regEmail,
      password: regPassword,
      company: regCompany,
    });
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  const handleQuickDemoClient = async (demoEmail: string) => {
    const res = await studioStore.clientLogin(demoEmail, 'client123');
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    }
  };

  const handleQuickDemoAdmin = async () => {
    await studioStore.adminLogin('admin123');
    const state = studioStore.getState();
    if (state.currentUser) {
      onSuccess(state.currentUser);
      onClose();
    }
  };

  const switchRole = (role: 'client' | 'admin') => {
    setActiveRole(role);
    setMode('login');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4 sm:p-6 animate-fade-in" role="dialog">
      <div className="relative w-full max-w-md surface-strong rounded-3xl p-6 sm:p-8 gold-border shadow-2xl overflow-hidden animate-modal-in">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#c9a86c]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b hairline mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-lg">
              CF
            </div>
            <div>
              <div className="mono text-[9px] uppercase tracking-[0.2em] text-[#e3c893]">Studio Gateway</div>
              <h2 className="text-xl font-bold text-white tracking-tight">Member Login</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl surface flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Role Selector (Client vs Admin) */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-black/40 border hairline mb-6">
          <button
            type="button"
            onClick={() => switchRole('client')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'client'
                ? 'bg-gold text-[#0a0c10] shadow-md shadow-gold/10'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>👤 Client Portal</span>
          </button>
          <button
            type="button"
            onClick={() => switchRole('admin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'admin'
                ? 'bg-gold text-[#0a0c10] shadow-md shadow-gold/10'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>🛡️ Admin Console</span>
          </button>
        </div>

        <div className="space-y-4">
          {activeRole === 'client' && (
            <div className="flex justify-between items-center text-xs pb-2 border-b hairline">
              <span className="text-stone-400 font-medium">
                {mode === 'login' ? 'Access your active build portal' : 'Register new client account'}
              </span>
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMessage(''); }}
                className="text-gold font-bold hover:underline"
              >
                {mode === 'login' ? 'Need an account? Sign Up' : 'Already registered? Sign In'}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              ⚠️ {errorMessage}
            </div>
          )}

          {activeRole === 'client' && mode === 'register' ? (
            /* REGISTER FORM */
            <form onSubmit={handleClientRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Nexus Labs Inc."
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Work Email *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="alex@nexuslabs.io"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Password *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-gold rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/15"
              >
                Create Client Account →
              </button>
            </form>
          ) : (
            /* LOGIN FORM (shared by Client & Admin) */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeRole === 'admin' ? 'admin@clientfound.com' : 'jordan@slate.inc'}
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              {activeRole === 'admin' && (
                <div className="p-3 rounded-xl bg-gold/[0.06] border border-gold/20 text-[10px] text-stone-400 mono">
                  Demo admin — email: <span className="text-[#e3c893]">admin@clientfound.com</span> · password: <span className="text-[#e3c893]">admin123</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-gold rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/15"
              >
                {activeRole === 'admin' ? 'Sign in to Admin Console →' : 'Sign in to Client Portal →'}
              </button>
            </form>
          )}

          {/* Quick Demo Accounts */}
          {activeRole === 'client' ? (
            <div className="pt-3 border-t hairline space-y-2">
              <div className="mono text-[9px] uppercase tracking-wider text-stone-500 text-center">Quick Demo Client Logins</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoClient('jordan@slate.inc')}
                  className="p-2 rounded-xl bg-white/[0.03] border hairline hover:border-gold text-[10px] text-left truncate transition-colors"
                >
                  <div className="font-bold text-white truncate">Jordan M.</div>
                  <div className="text-stone-500 text-[8px] truncate">Slate Banking</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoClient('priya@canvashealth.com')}
                  className="p-2 rounded-xl bg-white/[0.03] border hairline hover:border-gold text-[10px] text-left truncate transition-colors"
                >
                  <div className="font-bold text-white truncate">Dr. Priya</div>
                  <div className="text-stone-500 text-[8px] truncate">Canvas Health</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoClient('lena@wildpath.app')}
                  className="p-2 rounded-xl bg-white/[0.03] border hairline hover:border-gold text-[10px] text-left truncate transition-colors"
                >
                  <div className="font-bold text-white truncate">Lena C.</div>
                  <div className="text-stone-500 text-[8px] truncate">Wildpath</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-3 border-t hairline">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t hairline"></div>
                <span className="flex-shrink mx-3 mono text-[9px] text-stone-500 uppercase">Or Demo Access</span>
                <div className="flex-grow border-t hairline"></div>
              </div>

              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                className="w-full btn-primary rounded-xl py-2.5 text-xs font-bold text-[#0a0c10] flex items-center justify-center gap-2"
              >
                ⚡ 1-Click Master Admin Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
