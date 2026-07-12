'use client';

import * as React from 'react';
import { Plus, Fuel as FuelIcon, Receipt } from 'lucide-react';
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
import type { Expense, FuelLog, Vehicle } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { Loader } from '@/components/loader';

type Tab = 'fuel' | 'expenses';

export default function FinancePage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('FINANCIAL_ANALYST', 'FLEET_MANAGER');

  const [tab, setTab] = React.useState<Tab>('fuel');
  const [fuel, setFuel] = React.useState<FuelLog[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [fuelForm, setFuelForm] = React.useState({ vehicleId: '', liters: 0, cost: 0 });
  const [expenseForm, setExpenseForm] = React.useState({ vehicleId: '', type: 'TOLL', amount: 0, note: '' });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [f, e, v] = await Promise.all([
        api.get<FuelLog[]>('/finance/fuel'),
        api.get<Expense[]>('/finance/expenses'),
        api.get<Vehicle[]>('/vehicles'),
      ]);
      setFuel(f);
      setExpenses(e);
      setVehicles(v);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const submitFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/fuel', {
        ...fuelForm,
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
      });
      toast.success('Fuel log added');
      setOpen(false);
      setFuelForm({ vehicleId: '', liters: 0, cost: 0 });
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', {
        ...expenseForm,
        amount: Number(expenseForm.amount),
        note: expenseForm.note || null,
      });
      toast.success('Expense added');
      setOpen(false);
      setExpenseForm({ vehicleId: '', type: 'TOLL', amount: 0, note: '' });
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const totalFuel = fuel.reduce((s, f) => s + f.cost, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader title="Fuel & Expenses" description="Operational cost tracking">
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add {tab === 'fuel' ? 'Fuel Log' : 'Expense'}
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3 text-blue-500">
              <FuelIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalFuel)}</p>
              <p className="text-xs text-muted-foreground">Total Fuel Cost</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-muted p-3 text-amber-500">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-muted-foreground">Total Other Expenses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'fuel' ? 'default' : 'outline'} size="sm" onClick={() => setTab('fuel')}>
          Fuel Logs
        </Button>
        <Button variant={tab === 'expenses' ? 'default' : 'outline'} size="sm" onClick={() => setTab('expenses')}>
          Expenses
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {tab === 'fuel' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center">
                      <Loader className="py-0 min-h-0" />
                    </TableCell>
                  </TableRow>
                ) : fuel.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No fuel logs
                    </TableCell>
                  </TableRow>
                ) : (
                  fuel.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.vehicle.registrationNo}</TableCell>
                      <TableCell>{f.liters} L</TableCell>
                      <TableCell>{formatCurrency(f.cost)}</TableCell>
                      <TableCell>{formatDate(f.date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <Loader className="py-0 min-h-0" />
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No expenses
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell className="font-medium">{ex.vehicle.registrationNo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ex.type}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(ex.amount)}</TableCell>
                      <TableCell>{ex.note}</TableCell>
                      <TableCell>{formatDate(ex.date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={tab === 'fuel' ? 'Add Fuel Log' : 'Add Expense'}
      >
        {tab === 'fuel' ? (
          <form onSubmit={submitFuel} className="space-y-3">
            <div className="space-y-1">
              <Label>Vehicle</Label>
              <Select
                value={fuelForm.vehicleId}
                onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                required
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNo} — {v.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Liters</Label>
                <Input
                  type="number"
                  value={fuelForm.liters}
                  onChange={(e) => setFuelForm({ ...fuelForm, liters: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Cost</Label>
                <Input
                  type="number"
                  value={fuelForm.cost}
                  onChange={(e) => setFuelForm({ ...fuelForm, cost: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Add Fuel Log
            </Button>
          </form>
        ) : (
          <form onSubmit={submitExpense} className="space-y-3">
            <div className="space-y-1">
              <Label>Vehicle</Label>
              <Select
                value={expenseForm.vehicleId}
                onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
                required
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNo} — {v.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                >
                  <option value="TOLL">Toll</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="FUEL">Fuel</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Note</Label>
              <Input value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">
              Add Expense
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
