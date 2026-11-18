'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';
import { doctorService } from '@/services/doctor.service';
import { DoctorForm } from '@/components/shared/DoctorForm';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Plus, Stethoscope, Building2, Phone, Mail, Trash2, Edit3, ChevronRight } from 'lucide-react';

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, pageSize, debouncedSearch[0], specialization, hospital, from, to, sort],
    queryFn: () => doctorService.list({
      page,
      limit: pageSize,
      search: debouncedSearch[0],
      specialization,
      hospital,
      from,
      to,
      sort,
    }),
  });
  const { data: filterOptions } = useQuery({
    queryKey: ['doctor-filter-options'],
    queryFn: doctorService.getFilterOptions,
  });

  const addMutation = useMutation({
    mutationFn: doctorService.create,
    onSuccess: () => {
      toast.success('Doctor created');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setAddDoctorOpen(false);
    },
    onError: () => toast.error('Failed to create doctor'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => doctorService.update(id, data),
    onSuccess: () => {
      toast.success('Doctor updated');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setEditDoctorOpen(false);
      setEditingDoctor(null);
    },
    onError: () => toast.error('Failed to update doctor'),
  });

  const deleteMutation = useMutation({
    mutationFn: doctorService.delete,
    onSuccess: () => {
      toast.success('Doctor deleted');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setDeleteConfirmId(null);
    },
    onError: () => toast.error('Failed to delete doctor'),
  });

  const handleAddSubmit = (data: any) => addMutation.mutate(data);
  const handleEditSubmit = (data: any) => {
    if (editingDoctor) editMutation.mutate({ id: editingDoctor._id, data });
  };
  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setEditDoctorOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Manage doctors. Add, edit, or remove doctors and view their patients."
        action={
          <Button onClick={() => { setEditingDoctor(null); setAddDoctorOpen(true); }}>
            <Plus className="ml-2" /> Add Doctor
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search doctors…" />
        </div>
        <div className="flex flex-col md:col-span-3">
          <label className="text-xs font-medium text-muted-foreground mb-1">Specialization</label>
          <select
            value={specialization}
            onChange={(e) => { setSpecialization(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            <option value="">All Specializations</option>
            {(filterOptions?.specializations ?? []).map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:col-span-3">
          <label className="text-xs font-medium text-muted-foreground mb-1">Hospital</label>
          <select
            value={hospital}
            onChange={(e) => { setHospital(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            <option value="">All Hospitals</option>
            {(filterOptions?.hospitals ?? []).map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1">Created</label>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="h-9" />
            <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="h-9" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : !data?.data.length ? (
        <EmptyState title="No doctors found" description="Try adjusting your filters or add a doctor." />
      ) : (
        <>
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow className="border-border">
                    <TableHead className="w-[20%]">Name</TableHead>
                    <TableHead className="w-[15%]">Specialization</TableHead>
                    <TableHead className="w-[15%]">Hospital</TableHead>
                    <TableHead className="w-[18%]">Email</TableHead>
                    <TableHead className="w-[12%]">Phone</TableHead>
                    <TableHead className="w-[10%] text-center">Patients</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((doctor) => (
                    <TableRow key={doctor._id} className="border-border">
                      <TableCell className="font-medium whitespace-nowrap">
                        <Link href={`/doctors/${doctor._id}`} className="hover:text-primary-600">
                          {doctor.name}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{doctor.specialization}</TableCell>
                      <TableCell className="whitespace-nowrap">{doctor.hospital}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{doctor.email}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{doctor.phone}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{doctor.patientCount ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(doctor)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(doctor._id)} className="ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </Card>

          {/* Pagination Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {data?.meta?.page ?? 1} of {data?.meta?.totalPages ?? 1}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (data?.meta?.totalPages ?? 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      <Dialog open={addDoctorOpen} onOpenChange={setAddDoctorOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Doctor</DialogTitle>
            <DialogDescription>Register a new doctor in the system.</DialogDescription>
          </DialogHeader>
          <DoctorForm defaultValues={{}} onSubmit={handleAddSubmit} loading={addMutation.isPending} />
        </DialogContent>
      </Dialog>
      <Dialog open={editDoctorOpen} onOpenChange={(open) => { if (!open) setEditingDoctor(null); setEditDoctorOpen(open); }}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>Update the doctor's details.</DialogDescription>
          </DialogHeader>
          <DoctorForm
            defaultValues={editingDoctor ?? {}}
            onSubmit={handleEditSubmit}
            loading={editMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}
        title="Delete doctor"
        description="This will also remove all patients assigned to this doctor."
        onConfirm={() => { if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId); }}
        destructive
      />
    </div>
  );
}
