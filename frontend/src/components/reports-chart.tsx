'use client';

import * as React from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportsChartProps {
  chartData: Array<{ name: string; Operational: number; Revenue: number }>;
}

export default function ReportsChart({ chartData }: ReportsChartProps) {
  return (
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
  );
}
