'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Row { _id: string; count: number; }

interface SpecializationsChartProps {
  data: Row[];
}

export function SpecializationsChart({ data }: SpecializationsChartProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-foreground mb-4">Doctors by Specialization</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="text-[#e2e8f0]" />
          <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="count" fill="#0d9488" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}