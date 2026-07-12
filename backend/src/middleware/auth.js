const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token and attaches the user to req.user.
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw ApiError.unauthorized('Missing authentication token');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

// Restricts a route to the given roles. ADMIN always allowed.
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === 'ADMIN' || roles.includes(req.user.role)) {
      return next();
    }
    return next(ApiError.forbidden('You do not have access to this resource'));
  };

module.exports = { authenticate, authorize };
