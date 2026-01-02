"use client";

import React, { Suspense } from "react";
import ProfileInner from "./components/profileInner"; // Path to your new inner component

const MeetingViewParent: React.FC = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <section className="mx-auto max-w-[1400px] w-full pt-5">
        <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
          <h1 className="text-xl leading-normal text-black capitalize font-medium">Edit Profile</h1>
     
            <ProfileInner />
        
        </div>
      </section>
    </Suspense>

  );
};

export default MeetingViewParent;