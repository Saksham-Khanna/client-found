import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../auth.js';
import { addLog } from '../db.js';
import { allInvoices, insertInvoice, updateInvoiceStatus } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';

export const invoicesRouter = Router();

const invoiceSchema = z.object({
  id: z.string().min(1).optional(),
  clientName: z.string().min(1),
  projectName: z.string().min(1),
  amount: z.number().min(0),
  status: z.enum(['Paid', 'Pending', 'Overdue']).default('Pending'),
  dueDate: z.string().min(1),
  issuedDate: z.string().optional(),
  description: z.string().min(1),
});

invoicesRouter.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ invoices: await allInvoices() });
}));

invoicesRouter.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid invoice data.' });
    return;
  }
  const data = parsed.data;
  const invoice = {
    id: data.id || `INV-${crypto.randomUUID()}`,
    clientName: data.clientName,
    projectName: data.projectName,
    amount: data.amount,
    status: data.status,
    dueDate: data.dueDate,
    issuedDate: data.issuedDate || new Date().toISOString().slice(0, 10),
    description: data.description,
  };
  await insertInvoice(invoice);
  await addLog(`Generated invoice ${invoice.id} for $${invoice.amount.toLocaleString()}`, 'invoice');
  res.json({ success: true, invoice });
}));

const statusSchema = z.object({
  status: z.enum(['Paid', 'Pending', 'Overdue']),
});

invoicesRouter.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid status.' });
    return;
  }
  await updateInvoiceStatus(req.params.id, parsed.data.status);
  await addLog(`Invoice ${req.params.id} marked as "${parsed.data.status}"`, 'invoice');
  res.json({ success: true });
}));
