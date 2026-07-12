const { Prisma } = require('@prisma/client');
const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

// Central error handler. Normalizes Prisma/Zod/ApiError into JSON responses.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({ message: `A record with this ${target} already exists` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found' });
    }
  }

  if (env.nodeEnv === 'development') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(500).json({ message: 'Internal server error' });
};

const notFound = (_req, res) => res.status(404).json({ message: 'Route not found' });

module.exports = { errorHandler, notFound };
