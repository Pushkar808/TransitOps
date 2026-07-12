const { Router } = require('express');
const ctrl = require('../controllers/registration.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public signup schema
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']),
  // Driver-specific optional
  licenseNo: z.string().optional(),
  licenseCategory: z.string().optional(),
  licenseExpiry: z.string().optional(),
  contact: z.string().optional(),
});

// Public — anyone can submit a registration request
router.post('/signup', validate(signupSchema), ctrl.signup);

// Admin-only routes
router.get('/requests', authenticate, authorize('ADMIN'), ctrl.listRequests);
router.post('/requests/:id/approve', authenticate, authorize('ADMIN'), ctrl.approveRequest);
router.post('/requests/:id/reject', authenticate, authorize('ADMIN'), ctrl.rejectRequest);

module.exports = router;
