const { Router } = require('express');
const ctrl = require('../controllers/finance.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { fuelSchema, expenseSchema } = require('../utils/validators');

const router = Router();
router.use(authenticate);

const finance = authorize('FINANCIAL_ANALYST', 'FLEET_MANAGER');

router.get('/fuel', ctrl.listFuel);
router.post('/fuel', finance, validate(fuelSchema), ctrl.createFuel);

router.get('/expenses', ctrl.listExpenses);
router.post('/expenses', finance, validate(expenseSchema), ctrl.createExpense);

module.exports = router;
