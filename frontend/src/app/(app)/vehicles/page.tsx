'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
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
import type { Vehicle, VehicleStatus } from '@/lib/types';
import { formatCurrency, formatStatus, vehicleStatusVariant } from '@/lib/format';
import { toast } from 'sonner';

const EMPTY = {
  registrationNo: '',
  name: '',
  type: 'Van',
  maxLoadKg: '',
  odometer: '',
  acquisitionCost: '',
  region: '',
  status: 'AVAILABLE' as VehicleStatus,
};

export default function VehiclesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('FLEET_MANAGER');

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('createdAt');

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vehicle | null>(null);
  const [form, setForm] = React.useState(EMPTY);
  const [docModal, setDocModal] = React.useState<Vehicle | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    params.set('sortBy', sortBy);
    params.set('order', sortBy === 'name' ? 'asc' : 'desc');
    try {
      setVehicles(await api.get<Vehicle[]>(`/vehicles?${params.toString()}`));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, sortBy]);

  React.useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      registrationNo: v.registrationNo,
      name: v.name,
      type: v.type,
      maxLoadKg: v.maxLoadKg,
      odometer: v.odometer,
      acquisitionCost: v.acquisitionCost,
      region: v.region ?? '',
      status: v.status,
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      maxLoadKg: Number(form.maxLoadKg),
      odometer: Number(form.odometer),
      acquisitionCost: Number(form.acquisitionCost),
      region: form.region || null,
    };
    try {
      if (editing) {
        await api.put(`/vehicles/${editing.id}`, payload);
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', payload);
        toast.success('Vehicle created');
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async (v: Vehicle) => {
    if (!confirm(`Delete vehicle ${v.registrationNo}?`)) return;
    try {
      await api.delete(`/vehicles/${v.id}`);
      toast.success('Vehicle deleted');
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="Vehicle Registry" description="Master list of fleet vehicles">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        )}
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <Input
            placeholder="Search reg. no or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-36">
            <option value="">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Pickup">Pickup</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-44">
            <option value="createdAt">Sort: Newest</option>
            <option value="name">Sort: Name</option>
            <option value="odometer">Sort: Odometer</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg. No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
                      <p className="text-xs text-white/30">Loading vehicles...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.registrationNo}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{v.maxLoadKg} kg</TableCell>
                    <TableCell>{v.odometer.toLocaleString()} km</TableCell>
                    <TableCell>{formatCurrency(v.acquisitionCost)}</TableCell>
                    <TableCell>
                      <Badge variant={vehicleStatusVariant[v.status]}>{formatStatus(v.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDocModal(v)} title="Documents">
                          <FileText className="h-4 w-4" />
                        </Button>
                        {canManage && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(v)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No vehicles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Registration No</Label>
              <Input
                value={form.registrationNo}
                onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Name / Model</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Pickup">Pickup</option>
                <option value="Car">Car</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Max Load (kg)</Label>
              <Input
                type="number"
                value={form.maxLoadKg}
                onChange={(e) => setForm({ ...form, maxLoadKg: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Odometer (km)</Label>
              <Input
                type="number"
                value={form.odometer}
                onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Acquisition Cost</Label>
              <Input
                type="number"
                value={form.acquisitionCost}
                onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                <option value="">Select region</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="IN_SHOP">In Shop</option>
                <option value="RETIRED">Retired</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            {editing ? 'Save Changes' : 'Create Vehicle'}
          </Button>
        </form>
      </Modal>

      {docModal && (
        <DocumentsModal vehicle={docModal} canManage={canManage} onClose={() => setDocModal(null)} onChange={load} />
      )}
    </div>
  );
}

function DocumentsModal({
  vehicle,
  canManage,
  onClose,
  onChange,
}: {
  vehicle: Vehicle;
  canManage: boolean;
  onClose: () => void;
  onChange: () => void;
}) {
  const [docs, setDocs] = React.useState(vehicle.documents ?? []);
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doc = await api.post<{ id: string; title: string; url: string; vehicleId: string }>(
        `/vehicles/${vehicle.id}/documents`,
        { title, url }
      );
      setDocs([...docs, doc]);
      setTitle('');
      setUrl('');
      onChange();
      toast.success('Document added');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/vehicles/${vehicle.id}/documents/${id}`);
      setDocs(docs.filter((d) => d.id !== id));
      onChange();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Documents — ${vehicle.registrationNo}`}>
      <div className="space-y-3">
        {docs.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
        {docs.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded border p-2">
            <a href={d.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
              {d.title}
            </a>
            {canManage && (
              <Button variant="ghost" size="icon" onClick={() => remove(d.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        {canManage && (
          <form onSubmit={add} className="space-y-2 border-t pt-3">
            <Input placeholder="Title (e.g. Insurance)" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="https://document-url" value={url} onChange={(e) => setUrl(e.target.value)} required />
            <Button type="submit" className="w-full" size="sm">
              Add Document
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
