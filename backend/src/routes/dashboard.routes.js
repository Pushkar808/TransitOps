const { Router } = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.summary);

module.exports = router;
