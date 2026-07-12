/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

async function main() {
  console.log('Seeding TransitOps database...');

  // ---- Users ----
  const users = [
    { name: 'System Admin', email: 'admin@transitops.com', password: 'Admin@123', role: 'ADMIN' },
    { name: 'Fiona Fleet', email: 'fleet@transitops.com', password: 'Fleet@123', role: 'FLEET_MANAGER' },
    { name: 'Dan Driver', email: 'driver@transitops.com', password: 'Driver@123', role: 'DRIVER' },
    { name: 'Sam Safety', email: 'safety@transitops.com', password: 'Safety@123', role: 'SAFETY_OFFICER' },
    { name: 'Fred Finance', email: 'finance@transitops.com', password: 'Finance@123', role: 'FINANCIAL_ANALYST' },
  ];

  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, password, role: u.role },
    });
  }

  // ---- Vehicles ----
  const vehicleData = [
    { registrationNo: 'VAN-05', name: 'Ford Transit', type: 'Van', maxLoadKg: 500, odometer: 42000, acquisitionCost: 35000, region: 'North', status: 'AVAILABLE' },
    { registrationNo: 'TRK-12', name: 'Volvo FH', type: 'Truck', maxLoadKg: 18000, odometer: 120000, acquisitionCost: 90000, region: 'West', status: 'AVAILABLE' },
    { registrationNo: 'TRK-18', name: 'Scania R450', type: 'Truck', maxLoadKg: 20000, odometer: 88000, acquisitionCost: 95000, region: 'South', status: 'IN_SHOP' },
    { registrationNo: 'VAN-09', name: 'Mercedes Sprinter', type: 'Van', maxLoadKg: 800, odometer: 25000, acquisitionCost: 42000, region: 'East', status: 'AVAILABLE' },
    { registrationNo: 'PKP-02', name: 'Toyota Hilux', type: 'Pickup', maxLoadKg: 1000, odometer: 60000, acquisitionCost: 30000, region: 'North', status: 'RETIRED' },
  ];

  const vehicles = {};
  for (const v of vehicleData) {
    const created = await prisma.vehicle.upsert({
      where: { registrationNo: v.registrationNo },
      update: {},
      create: v,
    });
    vehicles[v.registrationNo] = created;
  }

  // ---- Drivers ----
  const driverData = [
    { name: 'Alex Morgan', licenseNo: 'DL-1001', licenseCategory: 'HGV', licenseExpiry: daysFromNow(400), contact: '+15550001', safetyScore: 95, region: 'North', status: 'AVAILABLE' },
    { name: 'Priya Singh', licenseNo: 'DL-1002', licenseCategory: 'LGV', licenseExpiry: daysFromNow(20), contact: '+15550002', safetyScore: 88, region: 'West', status: 'AVAILABLE' },
    { name: 'Carlos Diaz', licenseNo: 'DL-1003', licenseCategory: 'HGV', licenseExpiry: daysFromNow(-5), contact: '+15550003', safetyScore: 70, region: 'South', status: 'AVAILABLE' },
    { name: 'Mei Chen', licenseNo: 'DL-1004', licenseCategory: 'LGV', licenseExpiry: daysFromNow(200), contact: '+15550004', safetyScore: 60, region: 'East', status: 'SUSPENDED' },
  ];

  for (const d of driverData) {
    await prisma.driver.upsert({
      where: { licenseNo: d.licenseNo },
      update: {},
      create: d,
    });
  }

  // ---- Fuel logs & expenses for reporting ----
  const van05 = vehicles['VAN-05'];
  const trk12 = vehicles['TRK-12'];

  const existingFuel = await prisma.fuelLog.count();
  if (existingFuel === 0) {
    await prisma.fuelLog.createMany({
      data: [
        { vehicleId: van05.id, liters: 45, cost: 90 },
        { vehicleId: van05.id, liters: 50, cost: 100 },
        { vehicleId: trk12.id, liters: 200, cost: 420 },
      ],
    });
    await prisma.expense.createMany({
      data: [
        { vehicleId: van05.id, type: 'TOLL', amount: 25, note: 'Highway toll' },
        { vehicleId: trk12.id, type: 'MAINTENANCE', amount: 300, note: 'Brake pads' },
      ],
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
