"use client";

import React, { Suspense } from "react";
import DocumentViewPageInner from "../components/DocumentClient"; // move your current logic here

export default function DocumentViewPage() {
  return (
    
    <Suspense fallback={<p>Loading...</p>}>
       <section className="mx-auto max-w-[1400px] w-full pt-5">
           <div className="bg-card border border-border rounded-[10px] px-5 py-6 overflow-hidden">
      <DocumentViewPageInner />
      </div>
       </section>
    </Suspense>
   
  );
}
