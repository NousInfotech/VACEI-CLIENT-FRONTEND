// app/reset-password/page.tsx (or similar)
'use client'; // This ensures the page is client-side rendered

import ResetPasswordForm from './components/ResetPasswordForm'; // Adjust path as needed
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}