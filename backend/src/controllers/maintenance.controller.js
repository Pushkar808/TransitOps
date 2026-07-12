const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /maintenance
const list = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
  const logs = await prisma.maintenanceLog.findMany({
    where,
    include: { vehicle: true },
    orderBy: { openedAt: 'desc' },
  });
  res.json(logs);
});

// POST /maintenance -> opening a record sets vehicle to IN_SHOP
const create = asyncHandler(async (req, res) => {
  const { vehicleId } = req.body;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.badRequest('Vehicle is on a trip and cannot enter maintenance');
  }
  if (vehicle.status === 'RETIRED') {
    throw ApiError.badRequest('Retired vehicles cannot enter maintenance');
  }

  const log = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'IN_SHOP' } });
    const created = await tx.maintenanceLog.create({
      data: { ...req.body, status: 'OPEN' },
      include: { vehicle: true },
    });
    // Log the maintenance cost as an expense for reporting.
    if (req.body.cost > 0) {
      await tx.expense.create({
        data: {
          vehicleId,
          type: 'MAINTENANCE',
          amount: req.body.cost,
          note: req.body.description,
        },
      });
    }
    return created;
  });
  res.status(201).json(log);
});

// POST /maintenance/:id/close -> restores vehicle to AVAILABLE unless retired
const close = asyncHandler(async (req, res) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: req.params.id },
    include: { vehicle: true },
  });
  if (!log) throw ApiError.notFound('Maintenance record not found');
  if (log.status === 'CLOSED') throw ApiError.badRequest('Maintenance is already closed');

  const updated = await prisma.$transaction(async (tx) => {
    if (log.vehicle.status !== 'RETIRED') {
      await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } });
    }
    return tx.maintenanceLog.update({
      where: { id: log.id },
      data: { status: 'CLOSED', closedAt: new Date() },
      include: { vehicle: true },
    });
  });
  res.json(updated);
});

module.exports = { list, create, close };
