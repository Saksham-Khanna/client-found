import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { addLog } from './db.js';
import type { Lead } from './types.js';

let transporter: Transporter | null = null;
let configError: string | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    configError = 'SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing).';
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user, pass },
    });
  }
  return transporter;
}

export function getSenderAddress(): string {
  return process.env.SMTP_FROM || process.env.SMTP_USER || '';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function summaryRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 16px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:1%;">${label}</td>
      <td style="padding:10px 16px;color:#1f2937;font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

export function buildInquiryHtml(lead: Lead): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;width:100%;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#0a0c10;padding:28px 32px;">
            <div style="color:#e3c893;font-size:12px;letter-spacing:2px;font-weight:bold;">CLIENT FOUND STUDIO</div>
            <div style="color:#ffffff;font-size:22px;font-weight:bold;margin-top:6px;">We received your project inquiry</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="color:#1f2937;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${escapeHtml(lead.name)},</p>
            <p style="color:#1f2937;font-size:15px;line-height:1.6;margin:0 0 24px;">Thank you for reaching out to Client Found Studio. Our lead engineers have received your brief and will send you a fixed scope of work with a milestone schedule within 24 hours.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin:0 0 24px;">
              ${summaryRow('Service', lead.service)}
              ${summaryRow('Company', lead.company)}
              ${summaryRow('Estimated Budget', lead.budget)}
              ${summaryRow('Target Timeline', lead.timeline)}
              <tr>
                <td style="padding:10px 16px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:1%;">Your Brief</td>
                <td style="padding:10px 16px;color:#1f2937;font-size:14px;line-height:1.5;vertical-align:top;">${escapeHtml(lead.description)}</td>
              </tr>
            </table>
            <p style="color:#1f2937;font-size:15px;line-height:1.6;margin:0 0 8px;"><strong>What happens next?</strong></p>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 0;">If you have any questions, simply reply to this email and our team will get back to you.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#0a0c10;padding:20px 32px;text-align:center;">
            <div style="color:#9ca3af;font-size:12px;">Client Found Studio &middot; Reply to this email for any questions</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildInquiryBody(lead: Lead): string {
  return [
    `Hi ${lead.name},`,
    ``,
    `Thank you for reaching out to Client Found Studio. Our lead engineers have received your brief and will send you a fixed scope of work with a milestone schedule within 24 hours.`,
    ``,
    `Here's a summary of your request:`,
    ``,
    `Service: ${lead.service}`,
    `Company: ${lead.company}`,
    `Estimated Budget: ${lead.budget}`,
    `Target Timeline: ${lead.timeline}`,
    ``,
    `Your Brief:`,
    `${lead.description}`,
    ``,
    `What happens next?`,
    `We will review your brief and send you a fixed scope of work (SOW) with a milestone schedule within 24 hours.`,
    ``,
    `If you have any questions, simply reply to this email and we'll get back to you.`,
    ``,
    `Best regards,`,
    `Client Found Studio Team`,
  ].join('\n');
}

export async function sendInquiryNotification(lead: Lead): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    await addLog(`Inquiry email to ${lead.email} skipped: ${configError}`, 'lead');
    return false;
  }

  const from = getSenderAddress();
  const mail = {
    from: `Client Found Studio <${from}>`,
    to: lead.email,
    replyTo: from,
    subject: 'We received your project inquiry — Client Found Studio',
    text: buildInquiryBody(lead),
    html: buildInquiryHtml(lead),
  };

  try {
    await t.sendMail(mail);
    await addLog(`Inquiry email sent to ${lead.email}`, 'lead');
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await addLog(`Inquiry email to ${lead.email} failed: ${msg}`, 'lead');
    console.error('[mailer] Failed to send inquiry email:', err);
    return false;
  }
}
