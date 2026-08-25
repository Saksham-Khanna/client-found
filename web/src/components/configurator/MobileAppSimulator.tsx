import React, { useState } from 'react';

interface Props {
  appName: string;
  appType: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  theme: 'dark' | 'light';
  icon: string;
  features: string[];
  platforms: string[];
}

export const MobileAppSimulator: React.FC<Props> = ({
  appName,
  appType,
  tagline,
  primaryColor,
  accentColor,
  theme,
  icon,
  features,
  platforms,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'feed' | 'services' | 'profile'>('home');
  const isDark = theme === 'dark';

  const renderIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'shield':
        return <span className={className}>🛡️</span>;
      case 'fitness':
        return <span className={className}>⚡</span>;
      case 'cart':
        return <span className={className}>🛍️</span>;
      case 'chat':
        return <span className={className}>💬</span>;
      case 'crown':
        return <span className={className}>👑</span>;
      case 'camera':
        return <span className={className}>📸</span>;
      case 'calendar':
        return <span className={className}>📅</span>;
      case 'sparkles':
      default:
        return <span className={className}>✨</span>;
    }
  };

  const bgStyle = isDark ? 'bg-[#0e1117] text-stone-100' : 'bg-[#f8fafc] text-stone-900';
  const cardBg = isDark ? 'bg-[#181c24] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const subtextColor = isDark ? 'text-stone-400' : 'text-slate-500';

  return (
    <div className="flex flex-col items-center">
      {/* Device wrapper */}
      <div className="relative w-[300px] sm:w-[320px] h-[610px] sm:h-[630px] rounded-[48px] p-3 bg-[#1e232d] shadow-2xl shadow-black/80 ring-1 ring-white/20 border-4 border-[#2d3442] flex flex-col justify-between overflow-hidden select-none">
        {/* Dynamic Island / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between px-3 py-1 w-28 h-6 bg-black rounded-full shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a3560]/60" />
          </div>
          <div className="w-2 h-2 rounded-full bg-lime-400/80 animate-pulse" />
        </div>

        {/* Screen Container */}
        <div className={`relative w-full h-full rounded-[38px] overflow-hidden flex flex-col ${bgStyle} transition-colors duration-300 font-sans`}>
          {/* Top Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight opacity-80 z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <span className="text-xs">📶</span>
              <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center">
                <div className="w-full h-full bg-current rounded-xs" />
              </div>
            </div>
          </div>

          {/* App Header */}
          <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between z-10`} style={{ backgroundColor: `${primaryColor}12` }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-md font-bold flex-shrink-0"
                style={{ backgroundColor: primaryColor, color: isDark ? '#0a0c10' : '#ffffff' }}
              >
                {renderIcon(icon, 'w-4 h-4')}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate leading-tight tracking-tight">{appName || 'My Personal App'}</h4>
                <p className={`text-[9px] truncate ${subtextColor}`}>{tagline || appType}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs surface"
                style={{ borderColor: `${primaryColor}40` }}
                title="Notifications"
              >
                🔔
              </button>
            </div>
          </div>

          {/* Scrollable App Screen Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-none text-left">
            {activeTab === 'home' && (
              <>
                {/* Hero / Welcome Banner */}
                <div
                  className="rounded-2xl p-4 relative overflow-hidden border"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}25, ${accentColor}15)`,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${primaryColor}30`, color: primaryColor }}>
                      {appType}
                    </span>
                    <span className="text-[9px] opacity-70">Live Preview</span>
                  </div>
                  <h3 className="text-sm font-bold mt-2 leading-snug">
                    Welcome to your personalized workspace
                  </h3>
                  <p className={`text-[10px] mt-1 line-clamp-2 ${subtextColor}`}>
                    {tagline || 'Experience custom built mobile performance engineered for founders and clients.'}
                  </p>
                  <button
                    className="mt-3 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                    style={{ backgroundColor: primaryColor, color: isDark ? '#0a0c10' : '#ffffff' }}
                  >
                    Get Started →
                  </button>
                </div>

                {/* Enabled Feature Badges */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold mb-2">
                    <span className={subtextColor}>ENABLED MODULES ({features.length})</span>
                    <span className="text-[9px]" style={{ color: primaryColor }}>All Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {features.slice(0, 4).map((f) => (
                      <div key={f} className={`p-2.5 rounded-xl border text-[10px] font-medium flex items-center gap-2 ${cardBg}`}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Preview Cards based on appType */}
                <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Activity Feed</span>
                    <span className="text-[9px] mono" style={{ color: accentColor }}>Real-time</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { title: 'New Member Onboarded', time: '2m ago', icon: '👤' },
                      { title: 'Payment Received ($1,250)', time: '14m ago', icon: '💳' },
                      { title: 'Cloud Sync Completed', time: '1h ago', icon: '☁️' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-[10px] py-1 border-b last:border-0 border-white/5">
                        <span className="text-sm">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{item.title}</p>
                          <p className={`text-[8px] ${subtextColor}`}>{item.time}</p>
                        </div>
                        <span className="text-[10px] text-lime-400">✓</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Platforms */}
                <div className="text-[9px] text-center opacity-70 py-1">
                  Targeted for {platforms.join(' · ')}
                </div>
              </>
            )}

            {activeTab === 'feed' && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold">Community & Messages</div>
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`p-3 rounded-xl border ${cardBg} space-y-2`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${primaryColor}40` }}>
                        U{n}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold">Member #{n * 42}</div>
                        <div className="text-[8px] text-stone-500">{n * 5}m ago</div>
                      </div>
                    </div>
                    <p className={`text-[10px] ${subtextColor}`}>
                      The new in-app updates for {appName} feel ultra responsive and smooth!
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold">Catalog & Services</div>
                {[
                  { name: 'VIP Access Tier', price: '$49/mo' },
                  { name: '1-on-1 Consultation', price: '$150' },
                  { name: 'Digital Asset Pack', price: '$79' },
                ].map((s, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border ${cardBg} flex items-center justify-between`}>
                    <div>
                      <div className="text-[11px] font-bold">{s.name}</div>
                      <div className="text-[9px] font-semibold text-lime-400">{s.price}</div>
                    </div>
                    <button className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: primaryColor, color: isDark ? '#0a0c10' : '#ffffff' }}>
                      Book
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className={`p-4 rounded-2xl border ${cardBg} text-center space-y-3`}>
                <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-xl shadow-lg font-bold"
                  style={{ backgroundColor: primaryColor, color: isDark ? '#0a0c10' : '#ffffff' }}
                >
                  {renderIcon(icon, 'w-8 h-8')}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{appName || 'Client Account'}</h4>
                  <p className={`text-[9px] ${subtextColor}`}>{appType} Edition</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t hairline text-[9px]">
                  <div>
                    <span className={subtextColor}>Brand Palette:</span>
                    <div className="flex gap-1.5 mt-1 items-center">
                      <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: primaryColor }} />
                      <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: accentColor }} />
                    </div>
                  </div>
                  <div>
                    <span className={subtextColor}>Theme Mode:</span>
                    <div className="font-bold uppercase mt-1">{theme}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Simulated Tab Bar */}
          <div className={`px-3 py-2 border-t ${isDark ? 'border-white/10 bg-[#12151c]' : 'border-slate-200 bg-white'} flex items-center justify-around z-20`}>
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'feed', label: 'Feed', icon: '💬' },
              { id: 'services', label: 'Explore', icon: '⚡' },
              { id: 'profile', label: 'Account', icon: '👤' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all"
                  style={{ color: active ? primaryColor : isDark ? '#64748b' : '#94a3b8' }}
                >
                  <span className="text-sm leading-none">{tab.icon}</span>
                  <span className={`text-[8px] font-semibold ${active ? 'font-bold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Home Indicator Bar */}
          <div className="pb-1 pt-0.5 flex justify-center">
            <div className={`w-28 h-1 rounded-full ${isDark ? 'bg-white/30' : 'bg-slate-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
