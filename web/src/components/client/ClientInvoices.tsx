import React from 'react';
import { studioStore, Invoice } from '../../store/studioStore';

interface Props {
  invoices: Invoice[];
  onNotification: (msg: string) => void;
}

export const ClientInvoices: React.FC<Props> = ({ invoices, onNotification }) => {
  const totalBilled = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === 'Pending');
  const pendingSum = pending.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.status === 'Paid');
  const overdue = invoices.filter((i) => i.status === 'Overdue');

  const handlePay = (inv: Invoice) => {
    studioStore.updateInvoiceStatus(inv.id, 'Paid');
    onNotification(`Invoice ${inv.id} successfully paid! Thank you.`);
  };

  const renderInvoice = (inv: Invoice, actionable: boolean) => (
    <div key={inv.id} className="p-4 rounded-2xl surface border hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] text-gold">{inv.id}</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
            inv.status === 'Paid' ? 'bg-lime-400/20 text-lime-300 border-lime-400/30'
            : inv.status === 'Overdue' ? 'bg-red-400/20 text-red-300 border-red-400/30'
            : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
          }`}>
            {inv.status}
          </span>
          <span className="text-[10px] text-stone-500">· {inv.projectName}</span>
        </div>
        <h4 className="text-sm font-bold text-white">{inv.description}</h4>
        <div className="text-xs text-stone-500">Issued: {inv.issuedDate} · Due: {inv.dueDate}</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-base font-bold text-white tabular-nums">${inv.amount.toLocaleString()}</div>
        </div>
        {actionable && inv.status === 'Pending' && (
          <button
            onClick={() => handlePay(inv)}
            className="btn-gold rounded-xl px-4 py-2 text-xs font-bold shadow-lg shadow-gold/20"
          >
            ⚡ Pay Now
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Invoices & Payments</h1>
        <p className="text-xs text-stone-400 mt-0.5">Track your billing, pay open invoices and review payment history.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Total Billed</div>
          <div className="text-xl font-bold text-white mt-1 tabular-nums">${totalBilled.toLocaleString()}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">{invoices.length} invoice{invoices.length === 1 ? '' : 's'}</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Paid</div>
          <div className="text-xl font-bold text-lime-300 mt-1 tabular-nums">${totalPaid.toLocaleString()}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">{paid.length} settled</div>
        </div>
        <div className="surface rounded-2xl p-4 border hairline">
          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Outstanding</div>
          <div className="text-xl font-bold text-amber-300 mt-1 tabular-nums">${pendingSum.toLocaleString()}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {pending.length} pending{pending.length === 1 ? '' : 's'}{overdue.length > 0 ? ` · ${overdue.length} overdue` : ''}
          </div>
        </div>
      </div>

      {/* Open Invoices */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold px-1">Open Invoices</h3>
          {pending.map((inv) => renderInvoice(inv, true))}
        </div>
      )}

      {invoices.length === 0 && (
        <div className="py-16 text-center surface rounded-2xl border hairline space-y-3">
          <div className="text-4xl">💳</div>
          <h3 className="text-base font-bold text-white">No Invoices Yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">Invoices for your builds will appear here with secure payment options.</p>
        </div>
      )}

      {/* Payment History */}
      {paid.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold px-1">Payment History</h3>
          {paid.map((inv) => renderInvoice(inv, false))}
        </div>
      )}
    </div>
  );
};
