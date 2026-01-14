"use client";

import React, { Suspense } from "react";
import DocumentViewPageInner from "../components/DocumentClient"; // move your current logic here
import { PageHeader } from "@/components/shared/PageHeader";

export default function DocumentViewPage() {
  return (
    
    <Suspense fallback={<p>Loading...</p>}>
       <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
         <PageHeader
           title="Document Viewer"
           subtitle="Detailed view of the selected document."
         />
         <div className="bg-card border border-border rounded-[10px] px-5 py-6 overflow-hidden">
           <DocumentViewPageInner />
         </div>
       </section>
    </Suspense>
   
  );
}
