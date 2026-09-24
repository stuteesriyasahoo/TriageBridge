'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CurrentUser, PatientProfile, HealthcareWorkerProfile, UserRole } from '../lib/types';
import { DEMO_PATIENTS, DEMO_HEALTHCARE_WORKERS } from '../lib/mock-data';
import { dataStore } from '../lib/store';

interface AuthContextType {
  currentUser: CurrentUser | null;
  role: UserRole | null;
  isLoading: boolean;
  loginPatient: (profile: Partial<PatientProfile>) => void;
  loginHealthcareWorker: (profile: Partial<HealthcareWorkerProfile>) => void;
  loginAsDemoUser: (userId: string) => void;
  logout: () => void;
  updatePreferredLanguage: (lang: import('../lib/types').SupportedLocale) => void;
  isPatient: boolean;
  isHealthcareWorker: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  role: null,
  isLoading: true,
  loginPatient: () => {},
  loginHealthcareWorker: () => {},
  loginAsDemoUser: () => {},
  logout: () => {},
  updatePreferredLanguage: () => {},
  isPatient: false,
  isHealthcareWorker: false,
});

const AUTH_STORAGE_KEY = 'tb_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      } else {
        // Default to demo patient (Ramesh Nayak) so the app is immediately navigable for reviewers
        setCurrentUser(DEMO_PATIENTS[0]);
      }
    } catch {
      setCurrentUser(DEMO_PATIENTS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Strict Route Guard logic
  useEffect(() => {
    if (isLoading) return;

    const isPatientPath = pathname?.startsWith('/patient');
    const isHealthcarePath = pathname?.startsWith('/healthcare');

    if (isPatientPath) {
      if (!currentUser) {
        router.push('/login/patient');
      } else if (currentUser.role !== 'PATIENT') {
        // Healthcare worker trying to access patient routes
        router.push('/access-denied');
      }
    } else if (isHealthcarePath) {
      if (!currentUser) {
        router.push('/login/healthcare');
      } else if (currentUser.role === 'PATIENT') {
        // Patient trying to access clinical review routes
        router.push('/access-denied');
      }
    }
  }, [pathname, currentUser, isLoading, router]);

  const saveUser = (user: CurrentUser | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const loginPatient = (details: Partial<PatientProfile>) => {
    const syntheticId = details.syntheticId || `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPatient: PatientProfile = {
      id: details.id || `pat-${Date.now()}`,
      role: 'PATIENT',
      syntheticId,
      maskedAadhaar: details.maskedAadhaar || 'XXXX-XXXX-1234',
      fullName: details.fullName || 'Citizen Patient',
      phoneNumber: details.phoneNumber || '+91 94370 00000',
      preferredLanguage: details.preferredLanguage || 'en',
      age: details.age || 40,
      gender: details.gender || 'MALE',
      location: details.location || 'Odisha, India',
      emergencyContactName: details.emergencyContactName || 'Family Member',
      emergencyContactPhone: details.emergencyContactPhone || '+91 94370 11111',
    };

    saveUser(fullPatient);

    // Audit log
    dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: fullPatient.id,
      actorName: fullPatient.fullName,
      actorRole: 'PATIENT',
      actionType: 'USER_LOGIN',
      resourceType: 'AUTH_SESSION',
      resourceId: fullPatient.id,
      details: { maskedAadhaar: fullPatient.maskedAadhaar, method: 'SIMULATED_OTP' },
      timestamp: new Date().toISOString(),
    });

    router.push('/patient/dashboard');
  };

  const loginHealthcareWorker = (details: Partial<HealthcareWorkerProfile>) => {
    const fullWorker: HealthcareWorkerProfile = {
      id: details.id || `hcw-${Date.now()}`,
      role: (details.role as HealthcareWorkerProfile['role']) || 'DOCTOR',
      fullName: details.fullName || 'Dr. Medical Officer',
      phoneNumber: details.phoneNumber || '+91 94371 00000',
      preferredLanguage: details.preferredLanguage || 'en',
      medicalCouncil: details.medicalCouncil || 'Odisha Medical Council',
      registrationNumber: details.registrationNumber || 'SMC-ODI-99999',
      licenceNumber: details.licenceNumber || 'MED-2026-0001',
      facilityName: details.facilityName || 'SCB Medical College & Hospital',
      department: details.department || 'Emergency Triage',
    };

    saveUser(fullWorker);

    // Audit log
    dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: fullWorker.id,
      actorName: fullWorker.fullName,
      actorRole: fullWorker.role,
      actionType: 'USER_LOGIN',
      resourceType: 'AUTH_SESSION',
      resourceId: fullWorker.id,
      details: { regNumber: fullWorker.registrationNumber, role: fullWorker.role },
      timestamp: new Date().toISOString(),
    });

    router.push('/healthcare/dashboard');
  };

  const loginAsDemoUser = (userId: string) => {
    const patient = DEMO_PATIENTS.find(p => p.id === userId);
    if (patient) {
      saveUser(patient);
      router.push('/patient/dashboard');
      return;
    }

    const worker = DEMO_HEALTHCARE_WORKERS.find(w => w.id === userId);
    if (worker) {
      saveUser(worker);
      router.push('/healthcare/dashboard');
      return;
    }
  };

  const updatePreferredLanguage = (lang: import('../lib/types').SupportedLocale) => {
    if (currentUser) {
      const updated = { ...currentUser, preferredLanguage: lang };
      saveUser(updated as CurrentUser);
    }
  };

  const logout = () => {
    saveUser(null);
    router.push('/role-select');
  };

  const isPatient = currentUser?.role === 'PATIENT';
  const isHealthcareWorker =
    currentUser?.role === 'DOCTOR' ||
    currentUser?.role === 'NURSE' ||
    currentUser?.role === 'MEDICAL_OFFICER' ||
    currentUser?.role === 'HEALTH_WORKER';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isLoading,
        loginPatient,
        loginHealthcareWorker,
        loginAsDemoUser,
        logout,
        updatePreferredLanguage,
        isPatient,
        isHealthcareWorker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
