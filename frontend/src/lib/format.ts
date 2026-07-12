import type { DriverStatus, TripStatus, VehicleStatus } from '@/lib/types';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';

export const vehicleStatusVariant: Record<VehicleStatus, BadgeVariant> = {
  AVAILABLE: 'success',
  ON_TRIP: 'default',
  IN_SHOP: 'warning',
  RETIRED: 'destructive',
};

export const driverStatusVariant: Record<DriverStatus, BadgeVariant> = {
  AVAILABLE: 'success',
  ON_TRIP: 'default',
  OFF_DUTY: 'secondary',
  SUSPENDED: 'destructive',
};

export const tripStatusVariant: Record<TripStatus, BadgeVariant> = {
  DRAFT: 'secondary',
  DISPATCHED: 'default',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

export const formatStatus = (s: string) =>
  s
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const formatDate = (d: string) => new Date(d).toLocaleDateString();

// Whether a driver's license expires within the given number of days.
export const isLicenseExpiringSoon = (expiry: string, days = 30) => {
  const diff = new Date(expiry).getTime() - Date.now();
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
};

export const isLicenseExpired = (expiry: string) => new Date(expiry).getTime() < Date.now();
