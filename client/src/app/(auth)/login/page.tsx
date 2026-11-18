'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setIsLoading(true);
    try {
      await api.post('/auth/login', values);
      toast.success('Welcome back');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 p-12 text-white">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-6 border border-white/20">
              <span className="text-xl">⚕</span>
            </div>
            <h1 className="text-3xl font-bold">Doctor Tracker</h1>
            <p className="mt-4 text-teal-100 text-lg">Secure admin portal for managing doctors, patients, and clinic analytics.</p>
            <div className="mt-8 flex items-center gap-2 text-sm text-teal-200">
              <span>HttpOnly JWT sessions &bull; Role-based access</span>
            </div>
          </div>
          <div className="text-teal-200 text-sm font-semibold">doctor tracker &bull; admin</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#f8fafc] p-8 lg:p-0">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] mb-4">
              <span className="text-xl text-teal-600">⚕</span>
            </Link>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Sign in</h2>
            <p className="text-[#64748b]">Enter your admin credentials below</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#0f172a]">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input id="email" type="email" autoComplete="email" placeholder="name@clinic.com" {...form.register('email')} className="block w-full pl-10 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                {form.formState.errors.email && <p className="mt-1.5 text-sm text-[#ef4444]">{form.formState.errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[#0f172a]">Password</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="inline-flex items-center text-sm text-[#0d9488] hover:text-teal-700 focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" {...form.register('password')} className="block w-full pl-10 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                {form.formState.errors.password && <p className="mt-1.5 text-sm text-[#ef4444]">{form.formState.errors.password.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-70 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
              {isLoading ? 'Signing in…' : <><ArrowRight className="w-4 h-4" /> Sign in</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748b]">Don't have an account? <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">Contact administrator</a></p>
        </div>
      </div>
    </div>
  );
}
