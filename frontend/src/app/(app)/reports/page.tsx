'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api, downloadCsv } from '@/lib/api';
import type { VehicleReportRow } from '@/lib/types';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import { Loader } from '@/components/loader';

interface ReportResponse {
  rows: VehicleReportRow[];
  totals: { operationalCost: number; revenue: number; fuelLiters: number; distanceKm: number };
}

export default function ReportsPage() {
  const [report, setReport] = React.useState<ReportResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api
      .get<ReportResponse>('/reports/vehicles')
      .then(setReport)
      .catch((err) => toast.error((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = async () => {
    try {
      await downloadCsv('/reports/vehicles/export', 'vehicle-report.csv');
      toast.success('CSV exported');
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const rows = report?.rows ?? [];
  const chartData = rows.map((r) => ({
    name: r.registrationNo,
    Operational: r.operationalCost,
    Revenue: r.revenue,
  }));

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Fuel efficiency, cost and ROI insights">
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </PageHeader>

      {loading || !report ? (
        <Loader />
      ) : (
        <>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">{formatCurrency(report?.totals.revenue ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">{formatCurrency(report?.totals.operationalCost ?? 0)}</p>
            <p className="text-xs text-muted-foreground">Operational Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">{(report?.totals.distanceKm ?? 0).toLocaleString()} km</p>
            <p className="text-xs text-muted-foreground">Total Distance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">{(report?.totals.fuelLiters ?? 0).toLocaleString()} L</p>
            <p className="text-xs text-muted-foreground">Total Fuel</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue vs Operational Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
              <Legend />
              <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Operational" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-Vehicle Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Fuel Eff. (km/L)</TableHead>
                <TableHead>Operational Cost</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.registrationNo}>
                  <TableCell className="font-medium">
                    {r.registrationNo}
                    <span className="block text-xs text-muted-foreground">{r.name}</span>
                  </TableCell>
                  <TableCell>{r.completedTrips}</TableCell>
                  <TableCell>{r.distanceKm} km</TableCell>
                  <TableCell>{r.fuelEfficiency}</TableCell>
                  <TableCell>{formatCurrency(r.operationalCost)}</TableCell>
                  <TableCell>{formatCurrency(r.revenue)}</TableCell>
                  <TableCell className={r.roi >= 0 ? 'text-green-600' : 'text-destructive'}>
                    {(r.roi * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}
