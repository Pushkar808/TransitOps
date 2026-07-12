const cron = require('node-cron');
const prisma = require('../config/prisma');
const env = require('../config/env');
const { sendMail } = require('./email.service');

// Finds drivers whose licenses expire within the reminder window and notifies
// safety officers / admins.
const runLicenseReminderCheck = async () => {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + env.licenseReminderDays);

  const expiring = await prisma.driver.findMany({
    where: { licenseExpiry: { gte: now, lte: threshold } },
    orderBy: { licenseExpiry: 'asc' },
  });

  if (!expiring.length) return { count: 0 };

  const recipients = await prisma.user.findMany({
    where: { role: { in: ['SAFETY_OFFICER', 'ADMIN'] } },
    select: { email: true },
  });
  const to = recipients.map((r) => r.email).join(',');

  const lines = expiring.map(
    (d) => `- ${d.name} (${d.licenseNo}) expires ${d.licenseExpiry.toISOString().slice(0, 10)}`
  );
  const text = `The following driver licenses expire within ${env.licenseReminderDays} days:\n\n${lines.join(
    '\n'
  )}`;

  if (to) {
    await sendMail({ to, subject: `TransitOps: ${expiring.length} license(s) expiring soon`, text });
  }
  return { count: expiring.length };
};

// Schedules a daily 8:00 AM check. Safe no-op if there is nothing to send.
const scheduleLicenseReminders = () => {
  cron.schedule('0 8 * * *', () => {
    runLicenseReminderCheck().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('License reminder job failed:', err.message);
    });
  });
};

module.exports = { scheduleLicenseReminders, runLicenseReminderCheck };
