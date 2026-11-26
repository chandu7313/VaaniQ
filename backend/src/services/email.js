import nodemailer from 'nodemailer';
import { config } from '../config.js';
import { log } from '../lib/logger.js';

let customMailer = null;
let cachedTransport = null;
let cachedKey = '';

/** Test hook: inject a mock mail sender instead of hitting real SMTP. */
export function setMailer(fn) {
  customMailer = fn;
}

function getTransport() {
  const { host, port, user, pass } = config.email;
  if (!host || !user || !pass) return null;
  const key = `${host}:${port}:${user}`;
  if (!cachedTransport || cachedKey !== key) {
    cachedTransport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
    cachedKey = key;
  }
  return cachedTransport;
}

export function buildConfirmationEmail({ customerName, projectName, location, slotLabel, reference, notes }) {
  const name = customerName || 'Customer';
  const project = projectName || 'GreenHaven Residences';
  const area = location || 'Gachibowli, Hyderabad';
  const subject = `Site Visit Confirmed: ${project} (${slotLabel}) [Ref: ${reference}]`;

  const text = [
    `Hello ${name},`,
    '',
    `Your site visit to ${project} (${area}) has been confirmed by our team.`,
    '',
    `Booking Reference: ${reference}`,
    `Date & Time: ${slotLabel}`,
    `Location: ${project}, ${area}`,
    notes ? `Notes: ${notes}` : null,
    '',
    'Please share this reference when you arrive at the sales office. If you need to reschedule, reply to this email or contact our team.',
    '',
    'Regards,',
    'ABC Developers – VaaniQ Sales Team',
  ]
    .filter((l) => l !== null)
    .join('\n');

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#202922;background:#f7f7f2;padding:24px;border-radius:12px;">
      <div style="background:#ffffff;border:1px solid #e2e4dc;border-radius:12px;padding:24px;">
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#244d3c;font-weight:600;">ABC Developers</p>
        <h2 style="margin:0 0 12px;font-size:22px;color:#202922;">Site Visit Confirmed</h2>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#3d4740;">
          Hello ${name}, your site visit to <strong>${project}</strong> has been confirmed by our sales team.
        </p>
        <table style="width:100%;border-collapse:collapse;background:#f7f7f2;border-radius:8px;margin-bottom:18px;">
          <tr><td style="padding:10px 14px;font-size:13px;color:#657168;">Reference</td><td style="padding:10px 14px;font-size:14px;font-weight:600;font-family:monospace;">${reference}</td></tr>
          <tr><td style="padding:10px 14px;font-size:13px;color:#657168;border-top:1px solid #e2e4dc;">Date &amp; Time</td><td style="padding:10px 14px;font-size:14px;font-weight:600;border-top:1px solid #e2e4dc;">${slotLabel}</td></tr>
          <tr><td style="padding:10px 14px;font-size:13px;color:#657168;border-top:1px solid #e2e4dc;">Location</td><td style="padding:10px 14px;font-size:14px;border-top:1px solid #e2e4dc;">${project}, ${area}</td></tr>
        </table>
        <p style="margin:0;font-size:13px;line-height:1.5;color:#657168;">
          Please mention reference <strong>${reference}</strong> at the project site office. Reply to this email if you need to reschedule.
        </p>
      </div>
    </div>
  `.trim();

  return { subject, text, html };
}

export async function sendAppointmentConfirmationEmail(details) {
  const { to } = details;
  if (!to) {
    return { sent: false, skipped: true, reason: 'Customer has no email address on file' };
  }
  const { subject, text, html } = buildConfirmationEmail(details);
  const from = config.email.from || config.email.adminEmail || config.email.user || 'no-reply@vaaniq.local';
  const replyTo = config.email.adminEmail || undefined;

  if (customMailer) {
    try {
      const info = await customMailer({ from, replyTo, to, subject, text, html });
      return { sent: true, skipped: false, to, messageId: info?.messageId || 'mock-id' };
    } catch (err) {
      log.warn('confirmation_email_failed', { to, reason: err.message });
      return { sent: false, skipped: false, to, error: err.message };
    }
  }

  if (config.email.brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'api-key': config.email.brevoApiKey },
        body: JSON.stringify({
          sender: { name: 'ABC Developers - VaaniQ', email: from },
          ...(replyTo ? { replyTo: { email: replyTo } } : {}),
          to: [{ email: to, name: details.customerName || 'Customer' }],
          subject,
          textContent: text,
          htmlContent: html,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `Brevo API HTTP ${res.status}`);
      log.info('confirmation_email_sent', { to, messageId: body.messageId, reference: details.reference });
      return { sent: true, skipped: false, to, messageId: body.messageId };
    } catch (err) {
      log.warn('confirmation_email_failed', { to, reason: err.message });
      return { sent: false, skipped: false, to, error: err.message };
    }
  }

  const transport = getTransport();
  if (!transport) {
    return { sent: false, skipped: true, to, reason: 'SMTP email not configured' };
  }

  try {
    const info = await transport.sendMail({
      from: `ABC Developers - VaaniQ <${from}>`,
      ...(replyTo ? { replyTo } : {}),
      to,
      subject,
      text,
      html,
    });
    log.info('confirmation_email_sent', { to, messageId: info.messageId, reference: details.reference });
    return { sent: true, skipped: false, to, messageId: info.messageId };
  } catch (err) {
    log.warn('confirmation_email_failed', { to, reason: err.message });
    return { sent: false, skipped: false, to, error: err.message };
  }
}
