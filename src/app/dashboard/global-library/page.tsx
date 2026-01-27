"use client"

import React from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import { LibraryExplorer } from '@/components/library/LibraryExplorer';
import PageHeader from '@/components/shared/PageHeader';
import { Book02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export default function GlobalLibraryPage() {
  return (
    <div className="flex flex-col gap-6 p-4 min-h-full">
      <PageHeader 
        title="Global Library"
        description="Access and manage centralized company documents, agreements, and templates."
        icon={({ className }) => <HugeiconsIcon icon={Book02Icon} className={className} />}
        animate={true}
      />

      <LibraryExplorer />
    </div>
  );
}
