'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { patientService } from '@/services/patient.service';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const COLORS = ['#4F46E5', '#14B8A6', '#F5B83D', '#FF6B4A', '#3B82F6'];

export default function DashboardPage() {
  const [range, setRange] = useState<'7d' | '30d' | '12m'>('7d');
  const queryClient = useQueryClient();

  const summary = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
  });
  const patientsPerDoctor = useQuery({
    queryKey: ['dashboard-patients-per-doctor'],
    queryFn: () => dashboardService.getPatientsPerDoctor(10),
  });
  const timeline = useQuery({
    queryKey: ['dashboard-timeline', range],
    queryFn: () => dashboardService.getTimeline(range),
  });
  const conditions = useQuery({
    queryKey: ['dashboard-conditions'],
    queryFn: dashboardService.getConditions,
  });
  const specializations = useQuery({
    queryKey: ['dashboard-specializations'],
    queryFn: dashboardService.getSpecializations,
  });
  const recentPatientsQuery = useQuery({
    queryKey: ['dashboard-recent-patients'],
    queryFn: () => patientService.list({ page: 1, limit: 5 }),
  });

  const loading =
    summary.isLoading ||
    patientsPerDoctor.isLoading ||
    timeline.isLoading ||
    conditions.isLoading ||
    specializations.isLoading ||
    recentPatientsQuery.isLoading;
  const s = summary.data;
  const recentPatients = recentPatientsQuery.data?.data ?? [];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of doctors, patients, and clinic analytics." />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of doctors, patients, and clinic analytics."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Stat Cards - 2x3 grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Doctors" value={s?.totalDoctors ?? 0} />
        <StatCard title="Total Patients" value={s?.totalPatients ?? 0} />
        <StatCard
          title="New This Month"
          value={s?.patientsThisMonth ?? 0}
          change="+12%"
          positive
          icon={<span className="text-success">↑</span>}
        />
        <StatCard title="Avg Patients/Doctor" value={s?.avgPatientsPerDoctor ?? 0} />
        <StatCard title="Today" value={s?.patientsToday ?? 0} icon={<span className="text-info">●</span>} />
        <StatCard title="This Week" value={s?.patientsThisWeek ?? 0} icon={<span className="text-info">●</span>} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Patient Timeline */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Patient Growth Timeline</CardTitle>
              <div className="flex gap-1">
                {(['7d', '30d', '12m'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === r ? 'bg-primary-600 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                  >
                    {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '12 Months'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline.data?.patients || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Patients per Doctor - Horizontal Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patients per Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {patientsPerDoctor.data && patientsPerDoctor.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={patientsPerDoctor.data}
                    layout="vertical"
                    margin={{ left: 120, right: 20, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="doctorName"
                      width={120}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                    />
                    <Tooltip />
                    <Bar dataKey="patientCount" fill="#14B8A6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patients by Condition - Pie with Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patients by Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {conditions.data && conditions.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conditions.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {conditions.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Doctors by Specialization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doctors by Specialization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              {specializations.data && specializations.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={specializations.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Patients</CardTitle>
            <Link href="/patients" className="text-xs text-primary-600 hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentPatients.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="w-[25%]">Doctor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPatients.slice(0, 5).map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.condition}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {(p.doctor as any)?.name ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState title="No recent patients" description="Patients will appear here once added." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
