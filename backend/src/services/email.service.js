const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

// Lazily creates a nodemailer transporter, or null if SMTP is unconfigured.
const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user) return null;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
};

// Sends an email; falls back to console logging when SMTP is not configured.
const sendMail = async ({ to, subject, text, html }) => {
  const tx = getTransporter();
  if (!tx) {
    // eslint-disable-next-line no-console
    console.log(`[email:console] To: ${to} | ${subject}\n${text || ''}`);
    return;
  }
  await tx.sendMail({ from: env.smtp.from, to, subject, text, html });
};

module.exports = { sendMail };
