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
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { toast } from 'sonner';
import { Loader } from '../../../components/loader';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/dashboard-charts'), {
  loading: () => (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vehicles by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <Loader className="min-h-0 py-0" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vehicles by Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <Loader className="min-h-0 py-0" />
        </CardContent>
      </Card>
    </div>
  ),
  ssr: false,
});

interface KpiProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

function Kpi({ label, value, icon: Icon, iconColor = 'text-white/50' }: KpiProps) {
  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-white/90 leading-none">{value}</p>
        <p className="mt-1 text-xs text-white/38">{label}</p>
      </div>
    </div>
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active Vehicles" value={k?.activeVehicles ?? 0} icon={Truck} iconColor="text-white/70" />
        <Kpi label="Available Vehicles" value={k?.availableVehicles ?? 0} icon={CheckCircle2} iconColor="text-emerald-400" />
        <Kpi label="In Maintenance" value={k?.inMaintenance ?? 0} icon={Wrench} iconColor="text-amber-400" />
        <Kpi label="Active Trips" value={k?.activeTrips ?? 0} icon={Route} iconColor="text-blue-400" />
        <Kpi label="Pending Trips" value={k?.pendingTrips ?? 0} icon={Clock} iconColor="text-amber-400" />
        <Kpi label="Drivers On Duty" value={k?.driversOnDuty ?? 0} icon={Users} iconColor="text-violet-400" />
        <Kpi label="Fleet Utilization" value={`${k?.fleetUtilization ?? 0}%`} icon={Gauge} iconColor="text-cyan-400" />
        <Kpi label="Total Vehicles" value={k?.totalVehicles ?? 0} icon={Truck} iconColor="text-white/50" />
      </div>
      <DashboardCharts data={data} />
    </div>
  );
}
