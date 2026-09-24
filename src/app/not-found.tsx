'use client';

import React from 'react';
import Link from 'next/navigation';
import { useRouter } from 'next/navigation';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-[#F7FAFC] py-16 px-4 flex flex-col justify-center items-center text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0F8B8D] flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#102A43]">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          The requested healthcare page or triage record does not exist or has been archived.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
}
