const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

// Converts an array of flat objects into a CSV string.
const toCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headers.join(','), ...lines].join('\n');
};

// Computes per-vehicle analytics: fuel efficiency, operational cost, ROI.
const buildVehicleReport = async () => {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      fuelLogs: true,
      expenses: true,
      trips: { where: { status: 'COMPLETED' } },
    },
  });

  return vehicles.map((v) => {
    const totalFuelLiters = v.fuelLogs.reduce((s, f) => s + f.liters, 0);
    const totalFuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
    const maintenanceCost = v.expenses
      .filter((e) => e.type === 'MAINTENANCE')
      .reduce((s, e) => s + e.amount, 0);
    const otherExpenses = v.expenses
      .filter((e) => e.type !== 'MAINTENANCE')
      .reduce((s, e) => s + e.amount, 0);
    const distance = v.trips.reduce((s, t) => s + (t.plannedDistance || 0), 0);
    const revenue = v.trips.reduce((s, t) => s + (t.revenue || 0), 0);

    const operationalCost = totalFuelCost + maintenanceCost + otherExpenses;
    const fuelEfficiency = totalFuelLiters > 0 ? distance / totalFuelLiters : 0;
    const roi =
      v.acquisitionCost > 0
        ? (revenue - (maintenanceCost + totalFuelCost)) / v.acquisitionCost
        : 0;

    return {
      registrationNo: v.registrationNo,
      name: v.name,
      type: v.type,
      status: v.status,
      completedTrips: v.trips.length,
      distanceKm: Number(distance.toFixed(1)),
      fuelLiters: Number(totalFuelLiters.toFixed(1)),
      fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
      fuelCost: Number(totalFuelCost.toFixed(2)),
      maintenanceCost: Number(maintenanceCost.toFixed(2)),
      operationalCost: Number(operationalCost.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      roi: Number(roi.toFixed(3)),
    };
  });
};

// GET /reports/vehicles
const vehicleReport = asyncHandler(async (_req, res) => {
  const rows = await buildVehicleReport();
  const totals = rows.reduce(
    (acc, r) => {
      acc.operationalCost += r.operationalCost;
      acc.revenue += r.revenue;
      acc.fuelLiters += r.fuelLiters;
      acc.distanceKm += r.distanceKm;
      return acc;
    },
    { operationalCost: 0, revenue: 0, fuelLiters: 0, distanceKm: 0 }
  );
  res.json({ rows, totals });
});

// GET /reports/vehicles/export -> CSV download
const vehicleReportCsv = asyncHandler(async (_req, res) => {
  const rows = await buildVehicleReport();
  const csv = toCsv(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="vehicle-report.csv"');
  res.send(csv);
});

module.exports = { vehicleReport, vehicleReportCsv };
