const { Router } = require('express');
const ctrl = require('../controllers/maintenance.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { maintenanceSchema } = require('../utils/validators');

const router = Router();
router.use(authenticate);

const managers = authorize('FLEET_MANAGER');

router.get('/', ctrl.list);
router.post('/', managers, validate(maintenanceSchema), ctrl.create);
router.post('/:id/close', managers, ctrl.close);

module.exports = router;
