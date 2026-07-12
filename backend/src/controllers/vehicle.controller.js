const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Builds a Prisma filter object from query params (search/status/type/region).
const buildVehicleFilter = (query) => {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.region) where.region = query.region;
  if (query.search) {
    where.OR = [
      { registrationNo: { contains: query.search, mode: 'insensitive' } },
      { name: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
};

// GET /vehicles
const list = asyncHandler(async (req, res) => {
  const { sortBy = 'createdAt', order = 'desc' } = req.query;
  const vehicles = await prisma.vehicle.findMany({
    where: buildVehicleFilter(req.query),
    orderBy: { [sortBy]: order === 'asc' ? 'asc' : 'desc' },
    include: { documents: true },
  });
  res.json(vehicles);
});

// GET /vehicles/:id
const getOne = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: {
      documents: true,
      fuelLogs: { orderBy: { date: 'desc' } },
      expenses: { orderBy: { date: 'desc' } },
      maintenance: { orderBy: { openedAt: 'desc' } },
    },
  });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  res.json(vehicle);
});

// POST /vehicles
const create = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.create({ data: req.body });
  res.status(201).json(vehicle);
});

// PUT /vehicles/:id
const update = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(vehicle);
});

// DELETE /vehicles/:id
const remove = asyncHandler(async (req, res) => {
  const activeTrips = await prisma.trip.count({
    where: { vehicleId: req.params.id, status: { in: ['DRAFT', 'DISPATCHED'] } },
  });
  if (activeTrips > 0) {
    throw ApiError.conflict('Cannot delete a vehicle with active trips');
  }
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// GET /vehicles/dispatchable  -> only vehicles selectable for dispatch
const dispatchable = asyncHandler(async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { name: 'asc' },
  });
  res.json(vehicles);
});

// POST /vehicles/:id/documents
const addDocument = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  const doc = await prisma.vehicleDocument.create({
    data: { vehicleId: req.params.id, ...req.body },
  });
  res.status(201).json(doc);
});

// DELETE /vehicles/:id/documents/:docId
const removeDocument = asyncHandler(async (req, res) => {
  await prisma.vehicleDocument.delete({ where: { id: req.params.docId } });
  res.status(204).send();
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  dispatchable,
  addDocument,
  removeDocument,
};
