'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { useState } from 'react';

const COLORS = ['#4F46E5', '#14B8A6', '#F5B83D', '#FF6B4A', '#3B82F6'];

export default function DashboardPage() {
  const [timelineRange, setTimelineRange] = useState('7d');
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
  });

  const { data: patientsPerDoctor } = useQuery({
    queryKey: ['dashboard-patients-per-doctor'],
    queryFn: () => dashboardService.getPatientsPerDoctor(10),
  });

  const { data: timeline } = useQuery({
    queryKey: ['dashboard-timeline', timelineRange],
    queryFn: () => dashboardService.getTimeline(timelineRange),
  });

  const { data: conditions } = useQuery({
    queryKey: ['dashboard-conditions'],
    queryFn: dashboardService.getConditions,
  });

  const { data: specializations } = useQuery({
    queryKey: ['dashboard-specializations'],
    queryFn: dashboardService.getSpecializations,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Doctors</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalDoctors || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalPatients || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">New This Month</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.patientsThisMonth || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Patients/Doctor</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.avgPatientsPerDoctor || 0}</p>
        </div>
      </div>

      {/* Today & This Week */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today</h3>
          <p className="text-3xl font-bold text-primary-600">{stats?.patientsToday || 0}</p>
          <p className="text-sm text-gray-500">New patients</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
          <p className="text-3xl font-bold text-primary-600">{stats?.patientsThisWeek || 0}</p>
          <p className="text-sm text-gray-500">New patients</p>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Patient Growth Timeline</h3>
          <select
            value={timelineRange}
            onChange={(e) => setTimelineRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeline?.patients || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patients per Doctor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientsPerDoctor || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patientCount" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patients by Condition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conditions || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry._id} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {conditions?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctors by Specialization</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={specializations || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#14B8A6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
