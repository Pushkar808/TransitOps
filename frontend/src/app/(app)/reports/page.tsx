'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
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
import dynamic from 'next/dynamic';

const ReportsChart = dynamic(() => import('@/components/reports-chart'), {
  loading: () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Revenue vs Operational Cost</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] flex items-center justify-center">
        <Loader className="min-h-0 py-0" />
      </CardContent>
    </Card>
  ),
  ssr: false,
});

interface ReportResponse {
  rows: VehicleReportRow[];
  totals: { operationalCost: number; revenue: number; fuelLiters: number; distanceKm: number };
}

export default function ReportsPage() {
  const [report, setReport] = React.useState<ReportResponse | null>(null);

  React.useEffect(() => {
    api
      .get<ReportResponse>('/reports/vehicles')
      .then(setReport)
      .catch((err) => toast.error((err as Error).message));
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
      <ReportsChart chartData={chartData} />

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
    </div>
  );
}
