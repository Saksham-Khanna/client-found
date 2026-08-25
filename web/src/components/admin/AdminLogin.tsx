import React, { useState } from 'react';
import { studioStore } from '../../store/studioStore';

interface Props {
  onSuccess: () => void;
  theme?: 'dark' | 'light';
}

export const AdminLogin: React.FC<Props> = ({ onSuccess, theme = 'dark' }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await studioStore.adminLogin(password);
    if (ok) {
      onSuccess();
    } else {
      setError('Invalid master password. (Hint: enter "admin123" or click One-Click Login)');
    }
  };

  const handleQuickLogin = async () => {
    await studioStore.adminLogin('admin123');
    onSuccess();
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c9a86c]/[0.08] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#4a5a75]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md surface-strong rounded-3xl p-8 gold-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#c9a86c]/15 border border-[#c9a86c]/30 text-gold text-2xl mb-2">
            🛡️
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.25em] text-[#e3c893]">Client Found Studios</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Master Console</h1>
          <p className="text-xs text-stone-400">Authenticate to access leads, active projects, invoices & CMS.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1.5 block">Master Access Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password..."
              className="w-full bg-[#12141a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c9a86c]"
            />
          </div>

          {error && <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{error}</div>}

          <button
            type="submit"
            className="w-full btn-gold rounded-xl py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#c9a86c]/20"
          >
            Authenticate & Access Console →
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t hairline"></div>
          <span className="flex-shrink mx-3 mono text-[10px] text-stone-500 uppercase">Or Instant Demo</span>
          <div className="flex-grow border-t hairline"></div>
        </div>

        <button
          onClick={handleQuickLogin}
          className="w-full btn-primary rounded-xl py-3 text-xs font-semibold text-[#0a0c10] flex items-center justify-center gap-2"
        >
          ⚡ One-Click Master Login (Demo)
        </button>

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
            ← Return to Client Landing Page
          </a>
        </div>
      </div>
    </div>
  );
};
