"use client";

import React, { Suspense } from "react";
import MeetingViewInner from "../components/ScheduleView"; // Path to your new inner component

const MeetingViewParent: React.FC = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <div className="bg-card border border-border rounded-[10px] px-5 py-6">
          <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">View Meeting</h1>
        
            <MeetingViewInner />
         
        </div>
      </section>
    </Suspense>

  );
};

export default MeetingViewParent;