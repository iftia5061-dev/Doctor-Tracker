'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';
import { patientService } from '@/services/patient.service';
import { doctorService } from '@/services/doctor.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SearchInput } from '@/components/shared/SearchInput';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Plus, User, Stethoscope, Building2, Phone, Mail, Trash2, Edit3 } from 'lucide-react';

const GENDER_BADGE: Record<string, string> = {
  male: 'bg-blue-50 text-blue-700',
  female: 'bg-pink-50 text-pink-700',
  other: 'bg-slate-50 text-slate-700',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-success text-success-50',
  inactive: 'bg-muted text-muted-foreground',
};

interface PatientRow {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  condition: string;
  status: 'active' | 'inactive';
  notes?: string;
  doctor?: { _id: string; name: string; specialization: string };
  createdAt: string;
  updatedAt: string;
}

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [doctor, setDoctor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientRow | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, pageSize, debouncedSearch[0], condition, doctor, from, to, sort],
    queryFn: () => patientService.list({
      page, limit: pageSize, search: debouncedSearch[0], condition, doctor, from, to, sort,
    }),
  });
  const { data: filterOptions } = useQuery({
    queryKey: ['patient-filter-options'],
    queryFn: patientService.getFilterOptions,
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => doctorService.addPatient(editingPatient?.doctor?._id || data.doctor, data),
    onSuccess: () => {
      toast.success('Patient created');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setAddPatientOpen(false);
    },
    onError: () => toast.error('Failed to create patient'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientRow> }) => patientService.update(id, data),
    onSuccess: () => {
      toast.success('Patient updated');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setEditPatientOpen(false);
      setEditingPatient(null);
    },
    onError: () => toast.error('Failed to update patient'),
  });

  const deleteMutation = useMutation({
    mutationFn: patientService.delete,
    onSuccess: () => {
      toast.success('Patient deleted');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setDeleteConfirmId(null);
    },
    onError: () => toast.error('Failed to delete patient'),
  });

  const handleEditSubmit = (data: any) => {
    if (editingPatient) editMutation.mutate({ id: editingPatient._id, data });
  };
  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const handleEdit = (patient: PatientRow) => {
    setEditingPatient(patient);
    setEditPatientOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage patient records. Search, filter, and paginate across all patients."
        action={
          <Button onClick={() => { setEditingPatient(null); setAddPatientOpen(true); }}>
            <Plus className="ml-2" /> Add Patient
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients…" />
        </div>
        <div className="flex flex-col md:col-span-3">
          <label className="text-xs font-medium text-muted-foreground mb-1">Condition</label>
          <select
            value={condition}
            onChange={(e) => { setCondition(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            <option value="">All Conditions</option>
            {(filterOptions?.conditions ?? []).map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:col-span-3">
          <label className="text-xs font-medium text-muted-foreground mb-1">Doctor</label>
          <select
            value={doctor}
            onChange={(e) => { setDoctor(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
          >
            <option value="">All Doctors</option>
            {(filterOptions?.doctors ?? []).map((d: any) => (
              <option key={d._id} value={d._id}>{d.name}</option>
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
        <EmptyState title="No patients found" description="Try adjusting your filters or add a patient." />
      ) : (
        <>
          <Card className="border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow className="border-border">
                    <TableHead className="w-[18%]">Name</TableHead>
                    <TableHead className="w-[8%] text-center">Age</TableHead>
                    <TableHead className="w-[10%] text-center">Gender</TableHead>
                    <TableHead className="w-[16%]">Condition</TableHead>
                    <TableHead className="w-[18%]">Doctor</TableHead>
                    <TableHead className="w-[10%] text-center">Status</TableHead>
                    <TableHead className="w-[10%] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {data?.data.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link href={`/patients/${patient._id}`}>{patient.name}</Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center">{patient.age}</TableCell>
                    <TableCell className="whitespace-nowrap text-center">
                      <Badge variant="secondary" className={`${GENDER_BADGE[patient.gender] ?? ''} text-xs`}>
                        {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{patient.condition}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                      {patient.doctor?.name ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center">
                      <Badge variant="secondary" className={`${STATUS_BADGE[patient.status] ?? ''} text-xs`}>
                        {patient.status ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1) : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(patient)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(patient._id)} className="ml-2">
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
      <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>Register a new patient and assign to a doctor.</DialogDescription>
          </DialogHeader>
          <PatientForm defaultValues={{}} onSubmit={handleEditSubmit} loading={addMutation.isPending} doctors={(filterOptions?.doctors ?? []) as any[]} />
        </DialogContent>
      </Dialog>
      <Dialog open={editPatientOpen} onOpenChange={(open) => { if (!open) setEditingPatient(null); setEditPatientOpen(open); }}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update the patient's details.</DialogDescription>
          </DialogHeader>
          <PatientForm
            defaultValues={editingPatient ?? {}}
            onSubmit={handleEditSubmit}
            loading={editMutation.isPending}
            doctors={(filterOptions?.doctors ?? []) as any[]}
          />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}
        title="Delete patient"
        description="This will permanently remove the patient record."
        onConfirm={() => { if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId); }}
        destructive
      />
    </div>
  );
}

function PatientForm({ defaultValues, onSubmit, loading, doctors }: { defaultValues: any; onSubmit: (data: any) => void; loading: boolean; doctors: any[] }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input defaultValue={defaultValues.name} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Age</label>
          <input type="number" defaultValue={defaultValues.age} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gender</label>
          <select defaultValue={defaultValues.gender ?? 'male'} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone</label>
          <input type="tel" defaultValue={defaultValues.phone} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input type="email" defaultValue={defaultValues.email} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Condition</label>
          <input defaultValue={defaultValues.condition} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Doctor</label>
          <select defaultValue={defaultValues.doctor?._id ?? ''} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2">
            <option value="">Select doctor</option>
            {doctors.map((d: any) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>
          <select defaultValue={defaultValues.status ?? 'active'} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notes</label>
          <textarea defaultValue={defaultValues.notes} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save patient'}
        </Button>
      </div>
    </form>
  );
}

