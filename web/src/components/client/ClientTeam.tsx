import React from 'react';
import { Project, ClientAccount, CMSConfig } from '../../store/studioStore';

interface Props {
  projects: Project[];
  clientAccount?: ClientAccount;
  cms: CMSConfig;
}

const SUPPORT_EMAILS = [
  { email: 'khanna.saksham2918@gmail.com', label: 'Saksham Khanna', role: 'Studio Principal' },
  { email: 'ayushyadav2332004@gmail.com', label: 'Ayush Yadav', role: 'Client Success Lead' },
];

export const ClientTeam: React.FC<Props> = ({ projects, clientAccount, cms }) => {
  const teamByName = new Map<string, { name: string; role: string; avatarBg: string; projectNames: string[] }>();
  projects.forEach((p) => {
    p.team.forEach((t) => {
      const existing = teamByName.get(t.name);
      if (existing) {
        if (!existing.projectNames.includes(p.name)) existing.projectNames.push(p.name);
      } else {
        teamByName.set(t.name, { name: t.name, role: t.role, avatarBg: t.avatarBg, projectNames: [p.name] });
      }
    });
  });
  const team = Array.from(teamByName.values());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Team & Support</h1>
        <p className="text-xs text-stone-400 mt-0.5">Meet the engineers building your product and reach your dedicated support desk.</p>
      </div>

      {/* Support Contacts */}
      <div className="grid sm:grid-cols-2 gap-3">
        {SUPPORT_EMAILS.map((c) => (
          <a
            key={c.email}
            href={`mailto:${c.email}?subject=${encodeURIComponent('Client Found Studio — Project Inquiry')}`}
            className="surface rounded-2xl p-4 border border-[#c9a86c]/25 hover:border-[#c9a86c]/50 transition-all card-lift group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">
                {c.label[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white">{c.label}</div>
                <div className="text-[10px] text-gold">{c.role}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-stone-400 truncate">{c.email}</span>
              <span className="btn-gold rounded-lg px-3 py-1.5 font-bold flex-shrink-0 group-hover:scale-[1.03] transition-transform">
                ✉️ Email
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Book a slot */}
      <div className="surface rounded-2xl p-5 border border-[#c9a86c]/25 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs">📅</span>
          <h3 className="text-sm font-bold text-white">Book a Sync Call</h3>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          {cms.openSlotsText ? <span className="text-lime-300 font-semibold">{cms.openSlotsText}.</span> : null}{' '}
          {cms.nextAvailableStart ? <>Next available start: <span className="text-white font-semibold">{cms.nextAvailableStart}</span>.</> : null}{' '}
          Schedule a call with your team for sprint reviews, roadmap planning or technical deep-dives.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {SUPPORT_EMAILS.map((c) => (
            <a
              key={c.email}
              href={`mailto:${c.email}?subject=${encodeURIComponent('Sync Call Request')}&body=${encodeURIComponent(
                `Hi, I'd like to book a sync call to discuss my build. Preferred times:\n\n- \n\nThanks,\n${clientAccount?.name || ''}`
              )}`}
              className="btn-ghost rounded-xl px-3.5 py-2 text-[11px] font-semibold"
            >
              Request slot via {c.label.split(' ')[0]}
            </a>
          ))}
          {clientAccount?.phone && (
            <a href={`tel:${clientAccount.phone.replace(/[^+\d]/g, '')}`} className="btn-ghost rounded-xl px-3.5 py-2 text-[11px] font-semibold">
              📞 {clientAccount.phone}
            </a>
          )}
        </div>
      </div>

      {/* Assigned Engineers */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold px-1">Your Engineering Team</h3>
        {team.length === 0 && (
          <div className="py-12 text-center surface rounded-2xl border hairline">
            <div className="text-3xl mb-2">🤝</div>
            <p className="text-xs text-stone-400">Engineers will appear here once your build kicks off.</p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {team.map((t) => (
            <div key={t.name} className="surface rounded-2xl p-4 border hairline">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.avatarBg} text-sm font-bold text-black flex items-center justify-center border border-black`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-gold">{t.role}</div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-stone-500 leading-relaxed">
                Building: <span className="text-stone-300">{t.projectNames.join(' · ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
