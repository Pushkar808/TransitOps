const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// GET /dashboard  -> KPIs + chart data (supports type/status/region filters)
const summary = asyncHandler(async (req, res) => {
  const vehicleWhere = {};
  if (req.query.type) vehicleWhere.type = req.query.type;
  if (req.query.region) vehicleWhere.region = req.query.region;
  if (req.query.status) vehicleWhere.status = req.query.status;

  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    vehiclesByType,
    vehiclesByStatus,
  ] = await Promise.all([
    prisma.vehicle.count({ where: vehicleWhere }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'IN_SHOP' } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: 'RETIRED' } }),
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    prisma.trip.count({ where: { status: 'DRAFT' } }),
    prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.groupBy({ by: ['type'], _count: true, where: vehicleWhere }),
    prisma.vehicle.groupBy({ by: ['status'], _count: true, where: vehicleWhere }),
  ]);

  // Active = on trip; fleet utilization = active vehicles / (total - retired).
  const operable = totalVehicles - retiredVehicles;
  const fleetUtilization = operable > 0 ? Math.round((onTripVehicles / operable) * 100) : 0;

  res.json({
    kpis: {
      activeVehicles: onTripVehicles,
      availableVehicles,
      inMaintenance: inShopVehicles,
      retiredVehicles,
      totalVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization,
    },
    charts: {
      vehiclesByType: vehiclesByType.map((v) => ({ name: v.type, value: v._count })),
      vehiclesByStatus: vehiclesByStatus.map((v) => ({ name: v.status, value: v._count })),
    },
  });
});

module.exports = { summary };
