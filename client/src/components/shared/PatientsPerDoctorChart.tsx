'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Row { doctorName: string; patientCount: number; }

interface PatientsPerDoctorChartProps {
  data: Row[];
}

export function PatientsPerDoctorChart({ data }: PatientsPerDoctorChartProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-foreground mb-4">Patients per Doctor (Top 10)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data.slice(0, 10)} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="text-[#e2e8f0]" vertical={false} />
          <YAxis dataKey="doctorName" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <XAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="patientCount" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}