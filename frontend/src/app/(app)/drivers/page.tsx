'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
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
import type { Driver, DriverStatus } from '@/lib/types';
import {
  driverStatusVariant,
  formatDate,
  formatStatus,
  isLicenseExpired,
  isLicenseExpiringSoon,
} from '@/lib/format';
import { toast } from 'sonner';

const EMPTY = {
  name: '',
  licenseNo: '',
  licenseCategory: 'LGV',
  licenseExpiry: '',
  contact: '',
  safetyScore: 100,
  region: '',
  status: 'AVAILABLE' as DriverStatus,
};

export default function DriversPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('FLEET_MANAGER', 'SAFETY_OFFICER');

  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [sortBy, setSortBy] = React.useState('createdAt');

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Driver | null>(null);
  const [form, setForm] = React.useState(EMPTY);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    params.set('sortBy', sortBy);
    params.set('order', sortBy === 'name' ? 'asc' : 'desc');
    try {
      setDrivers(await api.get<Driver[]>(`/drivers?${params.toString()}`));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  React.useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      name: d.name,
      licenseNo: d.licenseNo,
      licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry.slice(0, 10),
      contact: d.contact,
      safetyScore: d.safetyScore,
      region: d.region ?? '',
      status: d.status,
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      safetyScore: Number(form.safetyScore),
      region: form.region || null,
    };
    try {
      if (editing) {
        await api.put(`/drivers/${editing.id}`, payload);
        toast.success('Driver updated');
      } else {
        await api.post('/drivers', payload);
        toast.success('Driver created');
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const remove = async (d: Driver) => {
    if (!confirm(`Delete driver ${d.name}?`)) return;
    try {
      await api.delete(`/drivers/${d.id}`);
      toast.success('Driver deleted');
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="Driver Management" description="Driver profiles & license compliance">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Driver
          </Button>
        )}
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <Input
            placeholder="Search name or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-48">
            <option value="createdAt">Sort: Newest</option>
            <option value="name">Sort: Name</option>
            <option value="safetyScore">Sort: Safety Score</option>
            <option value="licenseExpiry">Sort: License Expiry</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License No</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Safety</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
                      <p className="text-xs text-white/30">Loading drivers...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((d) => {
                  const expired = isLicenseExpired(d.licenseExpiry);
                  const soon = isLicenseExpiringSoon(d.licenseExpiry);
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.licenseNo}</TableCell>
                      <TableCell>{d.licenseCategory}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {formatDate(d.licenseExpiry)}
                          {expired && <Badge variant="destructive">Expired</Badge>}
                          {!expired && soon && (
                            <span title="Expiring soon">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{d.contact}</TableCell>
                      <TableCell>{d.safetyScore}</TableCell>
                      <TableCell>
                        <Badge variant={driverStatusVariant[d.status]}>{formatStatus(d.status)}</Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(d)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(d)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
              {!loading && drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} className="py-8 text-center text-muted-foreground">
                    No drivers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>License No</Label>
              <Input
                value={form.licenseNo}
                onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>License Category</Label>
              <Select
                value={form.licenseCategory}
                onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
              >
                <option value="LGV">LGV</option>
                <option value="HGV">HGV</option>
                <option value="PCV">PCV</option>
                <option value="Car">Car</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>License Expiry</Label>
              <Input
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Contact</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Safety Score</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.safetyScore}
                onChange={(e) => setForm({ ...form, safetyScore: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SUSPENDED">Suspended</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            {editing ? 'Save Changes' : 'Create Driver'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
