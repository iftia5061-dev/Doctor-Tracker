'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, debouncedSearch[0], specialization, hospital],
    queryFn: () => doctorService.list({ 
      page, 
      search: debouncedSearch[0], 
      specialization,
      hospital 
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: doctorService.delete,
    onSuccess: () => {
      toast.success('Doctor deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
    onError: () => {
      toast.error('Failed to delete doctor');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
          Add Doctor
        </button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Specializations</option>
        </select>
        <select
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Hospitals</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : !data?.data.length ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No doctors found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {doctor.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.specialization}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.hospital}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{doctor.patientCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(doctor._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.meta && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= data.meta.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
