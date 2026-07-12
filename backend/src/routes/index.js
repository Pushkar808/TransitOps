const { Router } = require('express');
const authRoutes = require('./auth.routes');
const vehicleRoutes = require('./vehicle.routes');
const driverRoutes = require('./driver.routes');
const tripRoutes = require('./trip.routes');
const maintenanceRoutes = require('./maintenance.routes');
const financeRoutes = require('./finance.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'transitops-api' }));
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/finance', financeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
