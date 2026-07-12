'use client';

import * as React from 'react';
import { Plus, Send, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Driver, Trip, Vehicle } from '@/lib/types';
import { formatStatus, tripStatusVariant } from '@/lib/format';
import { toast } from 'sonner';

export default function TripsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('DRIVER', 'FLEET_MANAGER');

  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [search, setSearch] = React.useState('');

  const [open, setOpen] = React.useState(false);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [form, setForm] = React.useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    plannedDistance: '',
    revenue: '',
  });

  const [completeTrip, setCompleteTrip] = React.useState<Trip | null>(null);
  const [completeForm, setCompleteForm] = React.useState({ finalOdometer: '', fuelConsumed: '', revenue: '' });

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    try {
      setTrips(await api.get<Trip[]>(`/trips?${params.toString()}`));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = async () => {
    setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistance: '', revenue: '' });
    try {
      const [v, d] = await Promise.all([
        api.get<Vehicle[]>('/vehicles/dispatchable'),
        api.get<Driver[]>('/drivers/dispatchable'),
      ]);
      setVehicles(v);
      setDrivers(d);
      setOpen(true);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/trips', {
        ...form,
        cargoWeightKg: Number(form.cargoWeightKg),
        plannedDistance: Number(form.plannedDistance),
        revenue: Number(form.revenue),
      });
      toast.success('Trip created (Draft)');
      setOpen(false);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const act = async (trip: Trip, action: 'dispatch' | 'cancel') => {
    try {
      await api.post(`/trips/${trip.id}/${action}`);
      toast.success(`Trip ${action === 'dispatch' ? 'dispatched' : 'cancelled'}`);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openComplete = (trip: Trip) => {
    setCompleteTrip(trip);
    setCompleteForm({
      finalOdometer: trip.vehicle.odometer + trip.plannedDistance,
      fuelConsumed: 0,
      revenue: trip.revenue,
    });
  };

  const submitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTrip) return;
    try {
      await api.post(`/trips/${completeTrip.id}/complete`, {
        finalOdometer: Number(completeForm.finalOdometer),
        fuelConsumed: Number(completeForm.fuelConsumed),
        revenue: Number(completeForm.revenue),
      });
      toast.success('Trip completed');
      setCompleteTrip(null);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="Trip Management" description="Create, dispatch and track deliveries">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        )}
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <Input
            placeholder="Search source/destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 7 : 6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
                      <p className="text-xs text-white/30">Loading trips...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      {t.source} → {t.destination}
                    </TableCell>
                    <TableCell>{t.vehicle.registrationNo}</TableCell>
                    <TableCell>{t.driver.name}</TableCell>
                    <TableCell>{t.cargoWeightKg} kg</TableCell>
                    <TableCell>{t.plannedDistance} km</TableCell>
                    <TableCell>
                      <Badge variant={tripStatusVariant[t.status]}>{formatStatus(t.status)}</Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {t.status === 'DRAFT' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => act(t, 'dispatch')} title="Dispatch">
                                <Send className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => act(t, 'cancel')} title="Cancel">
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {t.status === 'DISPATCHED' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openComplete(t)} title="Complete">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => act(t, 'cancel')} title="Cancel">
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
              {!loading && trips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 7 : 6} className="py-8 text-center text-muted-foreground">
                    No trips found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Trip">
        <form onSubmit={create} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Source</Label>
              <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Destination</Label>
              <Input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Vehicle (available only)</Label>
              <Select
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                required
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNo} — {v.name} (max {v.maxLoadKg}kg)
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Driver (eligible only)</Label>
              <Select
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                required
              >
                <option value="">Select driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.licenseCategory}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Cargo Weight (kg)</Label>
              <Input
                type="number"
                value={form.cargoWeightKg}
                onChange={(e) => setForm({ ...form, cargoWeightKg: e.target.value })}
                required
              />
              {selectedVehicle && form.cargoWeightKg > selectedVehicle.maxLoadKg && (
                <p className="text-xs text-destructive">Exceeds capacity ({selectedVehicle.maxLoadKg}kg)</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Planned Distance (km)</Label>
              <Input
                type="number"
                value={form.plannedDistance}
                onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Expected Revenue</Label>
              <Input
                type="number"
                value={form.revenue}
                onChange={(e) => setForm({ ...form, revenue: e.target.value })}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!!selectedVehicle && form.cargoWeightKg > selectedVehicle.maxLoadKg}
          >
            Create Trip
          </Button>
        </form>
      </Modal>

      <Modal open={!!completeTrip} onClose={() => setCompleteTrip(null)} title="Complete Trip">
        <form onSubmit={submitComplete} className="space-y-3">
          <div className="space-y-1">
            <Label>Final Odometer (km)</Label>
            <Input
              type="number"
              value={completeForm.finalOdometer}
              onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Fuel Consumed (liters)</Label>
            <Input
              type="number"
              value={completeForm.fuelConsumed}
              onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Revenue</Label>
            <Input
              type="number"
              value={completeForm.revenue}
              onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Complete Trip
          </Button>
        </form>
      </Modal>
    </div>
  );
}
