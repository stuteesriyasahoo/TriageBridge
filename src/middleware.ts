import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const HEALTHCARE_ROLES = new Set([
  'DOCTOR',
  'NURSE',
  'MEDICAL_OFFICER',
  'HEALTH_WORKER',
  'ADMIN',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('tb_role')?.value;

  const isPatientRoute = pathname.startsWith('/patient');
  const isHealthcareRoute = pathname.startsWith('/healthcare');

  // Shared public routes are allowed through
  if (!isPatientRoute && !isHealthcareRoute) {
    return NextResponse.next();
  }

  // Unauthenticated access
  if (!role) {
    if (isPatientRoute) {
      return NextResponse.redirect(new URL('/login/patient', request.url), 307);
    }
    if (isHealthcareRoute) {
      return NextResponse.redirect(new URL('/login/healthcare', request.url), 307);
    }
  }

  // PATIENT route isolation: PATIENT users may access only /patient/*
  if (role === 'PATIENT') {
    if (isHealthcareRoute) {
      // Redirect PATIENT accessing /healthcare/* immediately to /patient/dashboard
      return NextResponse.redirect(new URL('/patient/dashboard', request.url), 307);
    }
    return NextResponse.next();
  }

  // HEALTHCARE route isolation: DOCTOR, NURSE and authorized workers may access only /healthcare/*
  if (HEALTHCARE_ROLES.has(role as string)) {
    if (isPatientRoute) {
      // Redirect DOCTOR/NURSE accessing /patient/* immediately to /healthcare/dashboard
      return NextResponse.redirect(new URL('/healthcare/dashboard', request.url), 307);
    }
    return NextResponse.next();
  }

  // Invalid or unrecognized role -> redirect to role selection
  return NextResponse.redirect(new URL('/role-select', request.url), 307);
}

export const config = {
  matcher: ['/patient/:path*', '/healthcare/:path*'],
};
