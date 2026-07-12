const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { scheduleLicenseReminders } = require('./services/licenseReminder.service');

const start = async () => {
  try {
    await prisma.$connect();
    scheduleLicenseReminders();

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`TransitOps API running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
