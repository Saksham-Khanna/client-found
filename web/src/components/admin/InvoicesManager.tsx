import React, { useState } from 'react';
import { studioStore, Invoice } from '../../store/studioStore';

interface Props {
  onNotification: (msg: string) => void;
}

export const InvoicesManager: React.FC<Props> = ({ onNotification }) => {
  const state = studioStore.getState();
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');

  const [newInv, setNewInv] = useState({
    clientName: '',
    projectName: '',
    amount: 15000,
    dueDate: '2026-08-30',
    description: '50% Milestone Completion Payment',
  });

  const filteredInvoices = state.invoices.filter((i) => (filter === 'All' ? true : i.status === filter));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.clientName || !newInv.projectName || !newInv.amount) {
      alert('Please fill in required invoice fields.');
      return;
    }
    const inv = studioStore.addInvoice({
      clientName: newInv.clientName,
      projectName: newInv.projectName,
      amount: Number(newInv.amount),
      status: 'Pending',
      dueDate: newInv.dueDate,
      description: newInv.description,
    });
    onNotification(`Generated invoice ${inv.id} for $${inv.amount.toLocaleString()}!`);
    setIsCreating(false);
  };

  const handleStatusToggle = (id: string, currentStatus: Invoice['status']) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    studioStore.updateInvoiceStatus(id, nextStatus);
    onNotification(`Invoice ${id} marked as ${nextStatus}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b hairline">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[#e3c893]">Studio Billing & Receivables</div>
          <h2 className="text-xl font-bold text-white tracking-tight">Invoices & Financial Management</h2>
          <p className="text-xs text-stone-400">Generate client invoices, track milestone payments, and process receipts</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn-gold rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2"
        >
          + Create New Invoice
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['All', 'Paid', 'Pending', 'Overdue'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === st
                ? 'bg-gold text-[#0a0c10] font-bold'
                : 'surface text-stone-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="surface rounded-2xl border hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b hairline bg-white/[0.02] text-[10px] uppercase tracking-wider text-stone-400">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Client / Project</th>
                <th className="p-4">Description</th>
                <th className="p-4">Issued / Due</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline text-xs text-stone-300">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 mono font-bold text-gold">{inv.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{inv.clientName}</div>
                    <div className="text-[11px] text-stone-400">{inv.projectName}</div>
                  </td>
                  <td className="p-4 text-stone-300 max-w-xs">{inv.description}</td>
                  <td className="p-4 mono text-[10px] text-stone-500">
                    <div>Issued: {inv.issuedDate}</div>
                    <div className="text-stone-300">Due: {inv.dueDate}</div>
                  </td>
                  <td className="p-4 font-bold text-white text-sm tabular-nums">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inv.status === 'Paid'
                        ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30'
                        : inv.status === 'Pending'
                        ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                        : 'bg-red-500/15 text-red-300 border border-red-500/30'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(inv.id, inv.status)}
                      className="btn-ghost rounded-lg px-3 py-1 text-xs"
                    >
                      Toggle {inv.status === 'Paid' ? 'Pending' : 'Paid'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-[300] video-modal-backdrop flex items-center justify-center p-4">
          <div className="surface-strong rounded-3xl p-6 sm:p-8 gold-border w-full max-w-md space-y-4 animate-modal-in">
            <div className="flex justify-between items-center pb-3 border-b hairline">
              <h3 className="text-lg font-bold text-white">Generate Client Invoice</h3>
              <button onClick={() => setIsCreating(false)} className="text-stone-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Client Name *</label>
                <input
                  type="text"
                  required
                  value={newInv.clientName}
                  onChange={(e) => setNewInv({ ...newInv, clientName: e.target.value })}
                  placeholder="e.g. Jordan Michaels (Slate)"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newInv.projectName}
                  onChange={(e) => setNewInv({ ...newInv, projectName: e.target.value })}
                  placeholder="e.g. Hearth Banking Portal"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-semibold mb-1 block">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={newInv.amount}
                    onChange={(e) => setNewInv({ ...newInv, amount: Number(e.target.value) })}
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-semibold mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={newInv.dueDate}
                    onChange={(e) => setNewInv({ ...newInv, dueDate: e.target.value })}
                    className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-semibold mb-1 block">Description</label>
                <input
                  type="text"
                  value={newInv.description}
                  onChange={(e) => setNewInv({ ...newInv, description: e.target.value })}
                  placeholder="e.g. Phase 2 Release Payment"
                  className="w-full bg-[#12141a] border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsCreating(false)} className="btn-ghost rounded-xl px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="btn-gold rounded-xl px-6 py-2 font-bold">
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
