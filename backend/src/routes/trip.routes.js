const { Router } = require('express');
const ctrl = require('../controllers/trip.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { tripSchema, completeTripSchema } = require('../utils/validators');

const router = Router();
router.use(authenticate);

// Drivers and fleet managers create/manage trips.
const dispatchers = authorize('DRIVER', 'FLEET_MANAGER');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', dispatchers, validate(tripSchema), ctrl.create);
router.post('/:id/dispatch', dispatchers, ctrl.dispatch);
router.post('/:id/complete', dispatchers, validate(completeTripSchema), ctrl.complete);
router.post('/:id/cancel', dispatchers, ctrl.cancel);

module.exports = router;
