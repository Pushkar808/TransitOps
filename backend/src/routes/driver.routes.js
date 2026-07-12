const { Router } = require('express');
const ctrl = require('../controllers/driver.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { driverSchema, driverUpdateSchema } = require('../utils/validators');

const router = Router();
router.use(authenticate);

// Fleet managers and safety officers can manage drivers.
const managers = authorize('FLEET_MANAGER', 'SAFETY_OFFICER');

router.get('/', ctrl.list);
router.get('/dispatchable', ctrl.dispatchable);
router.get('/:id', ctrl.getOne);
router.post('/', managers, validate(driverSchema), ctrl.create);
router.put('/:id', managers, validate(driverUpdateSchema), ctrl.update);
router.delete('/:id', managers, ctrl.remove);

module.exports = router;
