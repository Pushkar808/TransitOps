const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const buildDriverFilter = (query) => {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.region) where.region = query.region;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { licenseNo: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
};

// GET /drivers
const list = asyncHandler(async (req, res) => {
  const { sortBy = 'createdAt', order = 'desc' } = req.query;
  const drivers = await prisma.driver.findMany({
    where: buildDriverFilter(req.query),
    orderBy: { [sortBy]: order === 'asc' ? 'asc' : 'desc' },
  });
  res.json(drivers);
});

// GET /drivers/:id
const getOne = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: { id: req.params.id },
    include: { trips: { orderBy: { createdAt: 'desc' }, take: 10, include: { vehicle: true } } },
  });
  if (!driver) throw ApiError.notFound('Driver not found');
  res.json(driver);
});

// POST /drivers
const create = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.create({ data: req.body });
  res.status(201).json(driver);
});

// PUT /drivers/:id
const update = asyncHandler(async (req, res) => {
  const driver = await prisma.driver.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(driver);
});

// DELETE /drivers/:id
const remove = asyncHandler(async (req, res) => {
  const activeTrips = await prisma.trip.count({
    where: { driverId: req.params.id, status: { in: ['DRAFT', 'DISPATCHED'] } },
  });
  if (activeTrips > 0) {
    throw ApiError.conflict('Cannot delete a driver with active trips');
  }
  await prisma.driver.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// GET /drivers/dispatchable -> only assignable drivers (rules enforced)
const dispatchable = asyncHandler(async (_req, res) => {
  const drivers = await prisma.driver.findMany({
    where: {
      status: 'AVAILABLE',
      licenseExpiry: { gt: new Date() },
    },
    orderBy: { name: 'asc' },
  });
  res.json(drivers);
});

module.exports = { list, getOne, create, update, remove, dispatchable };
