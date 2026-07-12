const { z } = require('zod');

const roles = ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(roles).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const vehicleSchema = z.object({
  registrationNo: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  maxLoadKg: z.number().positive(),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().min(0).optional(),
  region: z.string().optional().nullable(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});

const vehicleUpdateSchema = vehicleSchema.partial();

const driverSchema = z.object({
  name: z.string().min(1),
  licenseNo: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.coerce.date(),
  contact: z.string().min(1),
  safetyScore: z.number().min(0).max(100).optional(),
  region: z.string().optional().nullable(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
});

const driverUpdateSchema = driverSchema.partial();

const tripSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistance: z.number().positive(),
  revenue: z.number().min(0).optional(),
});

const completeTripSchema = z.object({
  finalOdometer: z.number().min(0),
  fuelConsumed: z.number().min(0),
  revenue: z.number().min(0).optional(),
});

const maintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().min(0).optional(),
});

const fuelSchema = z.object({
  vehicleId: z.string().min(1),
  liters: z.number().positive(),
  cost: z.number().min(0),
  date: z.coerce.date().optional(),
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(['TOLL', 'FUEL', 'MAINTENANCE', 'OTHER']).optional(),
  amount: z.number().min(0),
  note: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
});

const documentSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});

module.exports = {
  registerSchema,
  loginSchema,
  vehicleSchema,
  vehicleUpdateSchema,
  driverSchema,
  driverUpdateSchema,
  tripSchema,
  completeTripSchema,
  maintenanceSchema,
  fuelSchema,
  expenseSchema,
  documentSchema,
};
