'use client';

import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center px-4">
                <span className="text-xl font-bold text-primary-600">
                  Doctor Tracker
                </span>
              </Link>
              <div className="hidden md:flex space-x-8 ml-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-3 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/doctors"
                  className="inline-flex items-center px-3 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Doctors
                </Link>
                <Link
                  href="/patients"
                  className="inline-flex items-center px-3 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Patients
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-700 hover:text-primary-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
