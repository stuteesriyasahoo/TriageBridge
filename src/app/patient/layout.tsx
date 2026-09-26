'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.replace('/login/patient');
      } else if (role !== 'PATIENT') {
        router.replace('/healthcare/dashboard');
      }
    }
  }, [currentUser, role, isLoading, router]);

  // Prevent flash of protected patient content during authorization or role switching
  if (isLoading || !currentUser || role !== 'PATIENT') {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center bg-[#F7FAFC] dark:bg-[#0B1220] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying Patient Authorization...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
