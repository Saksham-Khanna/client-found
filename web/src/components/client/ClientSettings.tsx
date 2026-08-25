import React from 'react';
import { studioStore, UserProfile, ClientAccount } from '../../store/studioStore';
import { LogoutIcon } from '../common/icons';

interface Props {
  user: UserProfile;
  clientAccount?: ClientAccount;
  onReturnToSite: () => void;
}

export const ClientSettings: React.FC<Props> = ({ user, clientAccount, onReturnToSite }) => {
  const handleLogout = () => {
    studioStore.logout();
    onReturnToSite();
  };

  const details: { label: string; value: string }[] = [
    { label: 'Full Name', value: user.name },
    { label: 'Work Email', value: user.email },
    { label: 'Company', value: user.company || '—' },
    { label: 'Account ID', value: user.id },
    { label: 'Joined', value: user.joinedDate },
    ...(clientAccount?.phone ? [{ label: 'Phone', value: clientAccount.phone }] : []),
    ...(clientAccount ? [{ label: 'Lifetime Spend', value: `$${clientAccount.totalSpent.toLocaleString()}` }] : []),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-stone-400 mt-0.5">Your profile, billing identity and workspace access.</p>
      </div>

      {/* Profile Card */}
      <div className="surface-strong rounded-2xl p-5 sm:p-6 gold-border relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#c9a86c]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-extrabold text-2xl">
            {user.name[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <div className="text-xs text-stone-400 mt-0.5">{user.email}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="mono text-[9px] bg-gold/20 text-[#e3c893] px-2 py-0.5 rounded-full font-semibold border border-gold/30">
                {user.role.toUpperCase()}
              </span>
              {user.company && (
                <span className="mono text-[9px] bg-white/5 text-stone-400 px-2 py-0.5 rounded-full border hairline">
                  {user.company}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {details.map((d) => (
          <div key={d.label} className="surface rounded-2xl p-4 border hairline">
            <div className="text-[10px] text-stone-500 uppercase tracking-wider">{d.label}</div>
            <div className="text-sm font-bold text-white mt-1 break-all">{d.value}</div>
          </div>
        ))}
      </div>

      {/* Account Actions */}
      <div className="surface rounded-2xl p-5 border hairline space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Workspace Access</h3>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            You're signed in to the client portal. Use the client site for public content, or sign out to switch accounts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onReturnToSite} className="btn-ghost rounded-xl px-4 py-2.5 text-xs font-semibold">
            🌐 Back to Client Site
          </button>
          <button onClick={handleLogout} className="rounded-xl px-4 py-2.5 text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-colors flex items-center justify-center gap-2">
            <LogoutIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="text-[10px] text-stone-600 px-1">
        Profile fields are managed by your studio. For updates, contact your support team or email{' '}
        <a href="mailto:khanna.saksham2918@gmail.com" className="text-gold underline">khanna.saksham2918@gmail.com</a>.
      </div>
    </div>
  );
};
