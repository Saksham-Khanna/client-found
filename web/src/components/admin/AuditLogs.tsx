import React from 'react';
import { studioStore } from '../../store/studioStore';

export const AuditLogs: React.FC = () => {
  const state = studioStore.getState();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b hairline">
        <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">System Logs & Audit Trail</div>
        <h2 className="text-xl font-bold text-white tracking-tight">Security & Operational Activity Logs</h2>
        <p className="text-xs text-stone-400">Complete immutable record of studio lead receipts, invoice creations, and status edits</p>
      </div>

      <div className="surface rounded-2xl border hairline overflow-hidden">
        <div className="p-4 bg-white/[0.02] border-b hairline flex justify-between items-center text-xs">
          <span className="font-semibold text-white">Chronological System Events</span>
          <span className="mono text-[10px] text-gold">{state.logs.length} Total Log Entries</span>
        </div>

        <div className="divide-y hairline text-xs">
          {state.logs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  log.type === 'auth' ? 'bg-purple-400' : log.type === 'lead' ? 'bg-gold' : log.type === 'project' ? 'bg-lime-400' : 'bg-blue-400'
                }`} />
                <div>
                  <div className="font-medium text-white">{log.action}</div>
                  <div className="text-[10px] text-stone-500">Triggered by {log.user} · Event: {log.type}</div>
                </div>
              </div>
              <span className="mono text-[10px] text-stone-500">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
