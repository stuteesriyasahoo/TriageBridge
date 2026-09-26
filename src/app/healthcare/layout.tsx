'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function HealthcareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, role, isLoading, isHealthcareWorker } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.replace('/login/healthcare');
      } else if (role === 'PATIENT') {
        router.replace('/patient/dashboard');
      }
    }
  }, [currentUser, role, isLoading, router]);

  // Prevent flash of protected clinical content during authorization or role switching
  if (isLoading || !currentUser || !isHealthcareWorker) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center bg-[#F7FAFC] dark:bg-[#0B1220] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying Healthcare Practitioner Credentials...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
