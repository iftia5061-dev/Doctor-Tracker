'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Row { _id: string; count: number; }

interface ConditionsChartProps {
  data: Row[];
}

export function ConditionsChart({ data }: ConditionsChartProps) {
  const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#0ea5e9', '#10b981'];
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-foreground mb-4">Patients by Condition</h3>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Tooltip />
            <Pie
              data={data}
              dataKey="count"
              nameKey="_id"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              labelLine={false}
              label={(entry: any) => {
                const pct = total ? ((entry.value / total) * 100).toFixed(0) : '0';
                return `${pct}%`;
              }}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}