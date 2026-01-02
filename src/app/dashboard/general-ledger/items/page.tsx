// app/dashboard/general-ledger/items/page.tsx
"use client";

import { Suspense } from 'react';
import JournalListContent from './components/JournalListContent'; // Import the .tsx file

export default function JournalListPage() {
  return (
    <Suspense fallback={<div>Loading ledger items...</div>}>
      <section className="mx-auto max-w-[1400px] w-full pt-5">
           <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
      <JournalListContent />
      </div>
     </section>
    </Suspense>
  );
}