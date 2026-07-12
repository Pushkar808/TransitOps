const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const tripInclude = { vehicle: true, driver: true };

// Validates that a vehicle + driver can be assigned to a trip per business rules.
const assertAssignable = async (vehicle, driver, cargoWeightKg) => {
  if (!vehicle) throw ApiError.notFound('Vehicle not found');
  if (!driver) throw ApiError.notFound('Driver not found');

  // Retired or In Shop vehicles must never be dispatched.
  if (['RETIRED', 'IN_SHOP'].includes(vehicle.status)) {
    throw ApiError.badRequest(`Vehicle is ${vehicle.status} and cannot be dispatched`);
  }
  // Already On Trip vehicle cannot be reassigned.
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.badRequest('Vehicle is already on a trip');
  }
  // Cargo must not exceed capacity.
  if (cargoWeightKg > vehicle.maxLoadKg) {
    throw ApiError.badRequest(
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.maxLoadKg}kg)`
    );
  }
  // Suspended drivers cannot be assigned.
  if (driver.status === 'SUSPENDED') {
    throw ApiError.badRequest('Driver is suspended and cannot be assigned');
  }
  // Already On Trip driver cannot be reassigned.
  if (driver.status === 'ON_TRIP') {
    throw ApiError.badRequest('Driver is already on a trip');
  }
  // Expired licenses cannot be assigned.
  if (new Date(driver.licenseExpiry) < new Date()) {
    throw ApiError.badRequest('Driver license has expired');
  }
};

// GET /trips
const list = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where.OR = [
      { source: { contains: req.query.search, mode: 'insensitive' } },
      { destination: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }
  const trips = await prisma.trip.findMany({
    where,
    include: tripInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json(trips);
});

// GET /trips/:id
const getOne = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: tripInclude,
  });
  if (!trip) throw ApiError.notFound('Trip not found');
  res.json(trip);
});

// POST /trips  (creates in DRAFT; validates assignability up-front)
const create = asyncHandler(async (req, res) => {
  const { vehicleId, driverId, cargoWeightKg } = req.body;
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);
  await assertAssignable(vehicle, driver, cargoWeightKg);

  const trip = await prisma.trip.create({
    data: { ...req.body, createdById: req.user.id, status: 'DRAFT' },
    include: tripInclude,
  });
  res.status(201).json(trip);
});

// POST /trips/:id/dispatch  -> vehicle + driver become ON_TRIP
const dispatch = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id },
    include: tripInclude,
  });
  if (!trip) throw ApiError.notFound('Trip not found');
  if (trip.status !== 'DRAFT') {
    throw ApiError.badRequest(`Only DRAFT trips can be dispatched (current: ${trip.status})`);
  }
  await assertAssignable(trip.vehicle, trip.driver, trip.cargoWeightKg);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'ON_TRIP' } });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'ON_TRIP' } });
    return tx.trip.update({
      where: { id: trip.id },
      data: { status: 'DISPATCHED' },
      include: tripInclude,
    });
  });
  res.json(updated);
});

// POST /trips/:id/complete -> restores AVAILABLE, records odometer + fuel
const complete = asyncHandler(async (req, res) => {
  const { finalOdometer, fuelConsumed, revenue } = req.body;
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) throw ApiError.notFound('Trip not found');
  if (trip.status !== 'DISPATCHED') {
    throw ApiError.badRequest('Only DISPATCHED trips can be completed');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'AVAILABLE', odometer: finalOdometer },
    });
    await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
    // Persist fuel consumption as a fuel log for reporting.
    if (fuelConsumed > 0) {
      await tx.fuelLog.create({
        data: { vehicleId: trip.vehicleId, liters: fuelConsumed, cost: 0 },
      });
    }
    return tx.trip.update({
      where: { id: trip.id },
      data: {
        status: 'COMPLETED',
        finalOdometer,
        fuelConsumed,
        revenue: revenue ?? trip.revenue,
      },
      include: tripInclude,
    });
  });
  res.json(updated);
});

// POST /trips/:id/cancel -> restores AVAILABLE if it was dispatched
const cancel = asyncHandler(async (req, res) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
  if (!trip) throw ApiError.notFound('Trip not found');
  if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
    throw ApiError.badRequest(`Trip is already ${trip.status}`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (trip.status === 'DISPATCHED') {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
    }
    return tx.trip.update({
      where: { id: trip.id },
      data: { status: 'CANCELLED' },
      include: tripInclude,
    });
  });
  res.json(updated);
});

module.exports = { list, getOne, create, dispatch, complete, cancel };
