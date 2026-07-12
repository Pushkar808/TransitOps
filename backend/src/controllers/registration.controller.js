const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Roles that are allowed to self-register (not ADMIN)
const ALLOWED_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

// POST /auth/signup — public, creates a PENDING registration request
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, licenseNo, licenseCategory, licenseExpiry, contact } =
    req.body;

  if (!ALLOWED_ROLES.includes(role)) {
    throw ApiError.badRequest('Invalid role. You cannot register as ADMIN.');
  }

  // Check no existing approved user with this email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw ApiError.conflict('Email is already registered.');

  // Check no pending/approved request already
  const existingReq = await prisma.registrationRequest.findFirst({
    where: { email, status: { in: ['PENDING', 'APPROVED'] } },
  });
  if (existingReq) {
    if (existingReq.status === 'PENDING')
      throw ApiError.conflict('A pending request already exists for this email.');
    throw ApiError.conflict('Email is already registered.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const request = await prisma.registrationRequest.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      licenseNo: licenseNo || null,
      licenseCategory: licenseCategory || null,
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
      contact: contact || null,
    },
  });

  res.status(201).json({
    message: 'Registration request submitted. You will be able to log in once an admin approves your account.',
    requestId: request.id,
  });
});

// GET /admin/requests — ADMIN only
const listRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const where = status ? { status } : {};

  const requests = await prisma.registrationRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json(requests);
});

// POST /admin/requests/:id/approve — ADMIN only
const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await prisma.registrationRequest.findUnique({ where: { id } });
  if (!request) throw ApiError.notFound('Request not found.');
  if (request.status !== 'PENDING')
    throw ApiError.badRequest('Request is not pending.');

  // Check no user already exists with this email (race condition safety)
  const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
  if (existingUser) {
    await prisma.registrationRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });
    throw ApiError.conflict('A user with this email already exists.');
  }

  // Create the User and, if DRIVER, also a Driver profile
  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        name: request.name,
        email: request.email,
        password: request.passwordHash,
        role: request.role,
      },
    });

    // Auto-create a Driver record when the role is DRIVER and license info was provided
    if (request.role === 'DRIVER' && request.licenseNo && request.licenseExpiry) {
      await tx.driver.create({
        data: {
          name: request.name,
          licenseNo: request.licenseNo,
          licenseCategory: request.licenseCategory || 'LGV',
          licenseExpiry: request.licenseExpiry,
          contact: request.contact || '',
        },
      });
    }

    await tx.registrationRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });
  });

  res.json({ message: 'Request approved. User account created.' });
});

// POST /admin/requests/:id/reject — ADMIN only
const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const request = await prisma.registrationRequest.findUnique({ where: { id } });
  if (!request) throw ApiError.notFound('Request not found.');
  if (request.status !== 'PENDING')
    throw ApiError.badRequest('Request is not pending.');

  await prisma.registrationRequest.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date(), reviewNote: note || null },
  });

  res.json({ message: 'Request rejected.' });
});

module.exports = { signup, listRequests, approveRequest, rejectRequest };
