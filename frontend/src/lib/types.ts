export type Role = 'ADMIN' | 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';

export interface Vehicle {
  id: string;
  registrationNo: string;
  name: string;
  type: string;
  maxLoadKg: number;
  odometer: number;
  acquisitionCost: number;
  region?: string | null;
  status: VehicleStatus;
  documents?: VehicleDocument[];
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  title: string;
  url: string;
}

export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';

export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  licenseCategory: string;
  licenseExpiry: string;
  contact: string;
  safetyScore: number;
  region?: string | null;
  status: DriverStatus;
}

export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistance: number;
  finalOdometer?: number | null;
  fuelConsumed?: number | null;
  revenue: number;
  status: TripStatus;
  vehicle: Vehicle;
  driver: Driver;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string | null;
  vehicle: Vehicle;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  vehicle: Vehicle;
}

export type ExpenseType = 'TOLL' | 'FUEL' | 'MAINTENANCE' | 'OTHER';

export interface Expense {
  id: string;
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  note?: string | null;
  date: string;
  vehicle: Vehicle;
}

export interface DashboardData {
  kpis: {
    activeVehicles: number;
    availableVehicles: number;
    inMaintenance: number;
    retiredVehicles: number;
    totalVehicles: number;
    activeTrips: number;
    pendingTrips: number;
    driversOnDuty: number;
    fleetUtilization: number;
  };
  charts: {
    vehiclesByType: { name: string; value: number }[];
    vehiclesByStatus: { name: string; value: number }[];
  };
}

export interface VehicleReportRow {
  registrationNo: string;
  name: string;
  type: string;
  status: string;
  completedTrips: number;
  distanceKm: number;
  fuelLiters: number;
  fuelEfficiency: number;
  fuelCost: number;
  maintenanceCost: number;
  operationalCost: number;
  revenue: number;
  roi: number;
}
