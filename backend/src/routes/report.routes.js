const { Router } = require('express');
const ctrl = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/vehicles', ctrl.vehicleReport);
router.get('/vehicles/export', ctrl.vehicleReportCsv);

module.exports = router;
