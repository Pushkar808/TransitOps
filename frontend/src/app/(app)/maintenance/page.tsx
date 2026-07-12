'use client';

import * as React from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import type { MaintenanceLog, Vehicle } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('FLEET_MANAGER');

  const [logs, setLogs] = React.useState<MaintenanceLog[]>([]);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [form, setForm] = React.useState({ vehicleId: '', description: '', cost: 0 });

  const load = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    try {
      setLogs(await api.get<MaintenanceLog[]>(`/maintenance?${params.toString()}`));
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = async () => {
    setForm({ vehicleId: '', description: '', cost: 0 });
    try {
      // Only Available vehicles can enter maintenance.
      const all = await api.get<Vehicle[]>('/vehicles?status=AVAILABLE');
      setVehicles(all);
      setOpen(true);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', { ...form, cost: Number(form.cost) });
      toast.success('Maintenance opened — vehicle set to In Shop');
      setOpen(false);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const close = async (log: MaintenanceLog) => {
    try {
      await api.post(`/maintenance/${log.id}/close`);
      toast.success('Maintenance closed — vehicle restored');
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="Maintenance" description="Vehicle service records & shop status">
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Record
          </Button>
        )}
      </PageHeader>

      <Card className="mb-4">
        <CardContent className="flex gap-3 p-4">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.vehicle.registrationNo}</TableCell>
                  <TableCell>{l.description}</TableCell>
                  <TableCell>{formatCurrency(l.cost)}</TableCell>
                  <TableCell>{formatDate(l.openedAt)}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === 'OPEN' ? 'warning' : 'success'}>{l.status}</Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {l.status === 'OPEN' && (
                        <Button variant="ghost" size="sm" onClick={() => close(l)}>
                          <CheckCircle className="h-4 w-4 text-green-500" /> Close
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No maintenance records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New Maintenance Record">
        <form onSubmit={create} className="space-y-3">
          <div className="space-y-1">
            <Label>Vehicle (available only)</Label>
            <Select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required>
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNo} — {v.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Oil change, brake inspection"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Estimated Cost</Label>
            <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
          </div>
          <Button type="submit" className="w-full">
            Open Maintenance
          </Button>
        </form>
      </Modal>
    </div>
  );
}
