'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Point { _id: string; count: number; }

interface PatientTimelineChartProps {
  data: Point[];
  range: string;
}

export function PatientTimelineChart({ data, range }: PatientTimelineChartProps) {
  const labels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '12m': 'Last 12 Months',
  };
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Patient Growth Timeline</h3>
        <span className="text-xs text-muted-foreground">{labels[range as keyof typeof labels]}</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="text-[#e2e8f0]" />
          <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip cursor={{ stroke: '#0d9488' }} />
          <Area type="monotone" dataKey="count" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}