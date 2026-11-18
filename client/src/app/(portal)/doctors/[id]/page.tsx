'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { doctorService } from '@/services/doctor.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ArrowLeft, Stethoscope, User, Plus, Trash2, Edit3, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const doctorId = params.id as string;
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => doctorService.get(doctorId),
    enabled: !!doctorId,
  });

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['doctor-patients', doctorId],
    queryFn: () => doctorService.getDoctorPatients(doctorId),
    enabled: !!doctorId,
  });

  const addPatientMutation = useMutation({
    mutationFn: (data: any) => doctorService.addPatient(doctorId, data),
    onSuccess: () => {
      toast.success('Patient added');
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setAddPatientOpen(false);
    },
    onError: () => toast.error('Failed to add patient'),
  });

  const deletePatientMutation = useMutation({
    mutationFn: (patientId: string) => doctorService.removePatientFromDoctor(doctorId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-patients', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Patient removed');
      setDeleteConfirmId(null);
    },
    onError: () => toast.error('Failed to remove patient'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Skeleton className="h-8 w-32 animate-pulse" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-danger">Doctor not found</p>
        <Link href="/doctors" className="mt-4 text-primary-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Doctors
        </Link>
      </div>
    );
  }

  const patients = patientsData ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={doctor.name}
        description={`${doctor.specialization} • ${doctor.hospital}`}
        breadcrumb={[{ label: 'Doctors', href: '/doctors' }, { label: doctor.name, href: `/doctors/${doctorId}` }]}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setAddPatientOpen(true)}>
              <Plus className="ml-2" /> Add Patient
            </Button>
            <Link href={`/doctors/${doctorId}/edit`} className="hidden sm:inline-flex" passHref>
              <Button variant="outline">
                <Edit3 className="h-4 w-4 mr-1" /> Edit Doctor
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{doctor.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Specialization</div>
              <div className="font-medium">{doctor.specialization}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{doctor.email}</div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-medium">{doctor.phone}</div>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground">Hospital</div>
            <div className="font-medium">{doctor.hospital}</div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground">Joined</div>
            <div className="font-medium">{new Date(doctor.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm text-muted-foreground">Patients</div>
            <div className="font-medium">{doctor.patientCount ?? patients.length}</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Patients ({patients.length})</h2>
        </div>
        {patientsLoading ? (
          <Skeleton className="h-64" />
        ) : patients.length === 0 ? (
          <EmptyState title="No patients assigned" description="Add patients to this doctor." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[24%]">Name</TableHead>
                <TableHead className="w-[14%]">Age</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="w-[20%] text-center">Phone</TableHead>
                <TableHead className="w-[20%] text-center">Status</TableHead>
                <TableHead className="w-[16%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient: any) => (
                <TableRow key={patient._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {patient.name}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-center">{patient.age}</TableCell>
                  <TableCell className="whitespace-nowrap">{patient.condition}</TableCell>
                  <TableCell className="whitespace-nowrap text-center text-muted-foreground text-sm">{patient.phone}</TableCell>
                  <TableCell className="whitespace-nowrap text-center">
                    <Badge variant="secondary" className={patient.status === 'active' ? 'bg-success text-success-50' : 'bg-muted text-muted-foreground'} text-xs>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmId(patient._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>Register a new patient for {doctor.name}.</DialogDescription>
          </DialogHeader>
          <PatientForm defaultValues={{ doctor: { _id: doctorId } }} onSubmit={addPatientMutation.mutate} loading={addPatientMutation.isPending} />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}
        title="Remove patient"
        description="This will remove the patient from this doctor's list."
        onConfirm={() => { if (deleteConfirmId) deletePatientMutation.mutate(deleteConfirmId); }}
        destructive
      />
    </div>
  );
}

function PatientForm({ defaultValues, onSubmit, loading }: { defaultValues: any; onSubmit: (data: any) => void; loading: boolean }) {
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

