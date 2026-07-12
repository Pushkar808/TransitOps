'use client';

import * as React from 'react';
import {
  Truck,
  CheckCircle2,
  Wrench,
  Route,
  Clock,
  Users,
  Gauge,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { toast } from 'sonner';
import { Loader } from '@/components/loader';

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

interface KpiProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}

function Kpi({ label, value, icon: Icon, accent = 'text-primary' }: KpiProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-lg bg-muted p-3 ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [type, setType] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [region, setRegion] = React.useState('');

  const load = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    if (region) params.set('region', region);
    try {
      const res = await api.get<DashboardData>(`/dashboard?${params.toString()}`);
      setData(res);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [type, status, region]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return <Loader />;
  }

  const k = data.kpis;

  return (
    <div>
      <PageHeader title="Dashboard" description="Fleet operations at a glance">
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-36">
          <option value="">All Types</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Pickup">Pickup</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="IN_SHOP">In Shop</option>
          <option value="RETIRED">Retired</option>
        </Select>
        <Select value={region} onChange={(e) => setRegion(e.target.value)} className="w-36">
          <option value="">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </Select>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active Vehicles" value={k?.activeVehicles ?? 0} icon={Truck} />
        <Kpi
          label="Available Vehicles"
          value={k?.availableVehicles ?? 0}
          icon={CheckCircle2}
          accent="text-green-500"
        />
        <Kpi
          label="In Maintenance"
          value={k?.inMaintenance ?? 0}
          icon={Wrench}
          accent="text-amber-500"
        />
        <Kpi label="Active Trips" value={k?.activeTrips ?? 0} icon={Route} />
        <Kpi label="Pending Trips" value={k?.pendingTrips ?? 0} icon={Clock} accent="text-amber-500" />
        <Kpi label="Drivers On Duty" value={k?.driversOnDuty ?? 0} icon={Users} />
        <Kpi
          label="Fleet Utilization"
          value={`${k?.fleetUtilization ?? 0}%`}
          icon={Gauge}
          accent="text-blue-500"
        />
        <Kpi label="Total Vehicles" value={k?.totalVehicles ?? 0} icon={Truck} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicles by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.charts.vehiclesByStatus ?? []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {(data?.charts.vehiclesByStatus ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicles by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.charts.vehiclesByType ?? []}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
