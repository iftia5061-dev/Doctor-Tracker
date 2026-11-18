'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/select';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.string().min(1, 'Specialization is required'),
  hospital: z.string().min(1, 'Hospital is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  defaultValues: Partial<DoctorFormData>;
  onSubmit: (data: DoctorFormData) => void;
  loading?: boolean;
}

export function DoctorForm({ defaultValues, onSubmit, loading }: DoctorFormProps) {
  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialization: '',
      hospital: '',
      phone: '',
      email: '',
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit((data) => onSubmit(data));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Dr. Sarah Chen" {...form.register('name')} />
          {form.formState.errors.name && (
            <span className="text-xs text-danger">{form.formState.errors.name.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input id="specialization" placeholder="Cardiology" {...form.register('specialization')} />
          {form.formState.errors.specialization && (
            <span className="text-xs text-danger">{form.formState.errors.specialization.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="hospital">Hospital</Label>
          <Input id="hospital" placeholder="City Hospital" {...form.register('hospital')} />
          {form.formState.errors.hospital && (
            <span className="text-xs text-danger">{form.formState.errors.hospital.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+1 555-000-0000" {...form.register('phone')} />
          {form.formState.errors.phone && (
            <span className="text-xs text-danger">{form.formState.errors.phone.message}</span>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="sarah@hospital.com" {...form.register('email')} />
          {form.formState.errors.email && (
            <span className="text-xs text-danger">{form.formState.errors.email.message}</span>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => form.reset()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save doctor'}
        </Button>
      </div>
    </form>
  );
}
