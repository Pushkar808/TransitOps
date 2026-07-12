const { Router } = require('express');
const ctrl = require('../controllers/vehicle.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { vehicleSchema, vehicleUpdateSchema, documentSchema } = require('../utils/validators');

const router = Router();
router.use(authenticate);

const managers = authorize('FLEET_MANAGER');

router.get('/', ctrl.list);
router.get('/dispatchable', ctrl.dispatchable);
router.get('/:id', ctrl.getOne);
router.post('/', managers, validate(vehicleSchema), ctrl.create);
router.put('/:id', managers, validate(vehicleUpdateSchema), ctrl.update);
router.delete('/:id', managers, ctrl.remove);

router.post('/:id/documents', managers, validate(documentSchema), ctrl.addDocument);
router.delete('/:id/documents/:docId', managers, ctrl.removeDocument);

module.exports = router;
