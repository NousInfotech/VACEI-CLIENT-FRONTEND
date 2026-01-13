"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2, 
  Calendar, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  Building2,
  FileText,
  ExternalLink,
  Plus
} from "lucide-react";
import { cn, createSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/DashboardCard";
import PageHeader from "@/components/shared/PageHeader";
import Dropdown from "@/components/Dropdown";

// Data & Types
import { MOCK_GRANTS } from "@/components/services/grants/data";
import { Grant } from "@/components/services/grants/types";

function GrantDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const grantId = params.id as string;

  const grant = useMemo(() => 
    MOCK_GRANTS.find(g => createSlug(g.title) === grantId) || MOCK_GRANTS[0], 
  [grantId]);

  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    description: "",
    budget: "",
    timeline: "",
    previouslyApplied: false,
    callDate: "",
    callTime: "",
    callType: "Video",
    docsUploaded: false
  });

  // Handle direct step navigation via query param
  useEffect(() => {
    const requestedStep = searchParams.get('step');
    if (requestedStep === '2') {
      setStep(2);
    }
  }, [searchParams]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // STEP 5: Success (Exact replication of SupportWizard Step 4)
  if (step === 5) {
    return (
      <section className="mx-auto max-w-[1400px] w-full pt-10 px-4 md:px-6">
        <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-brand-body">Request Sent!</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We've received your request for the <b>{grant.title}</b>. One of our specialists will confirm your discovery call shortly.
            </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 text-left space-y-3 max-w-sm mx-auto">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-body">Discovery Call Booked</p>
                  <p className="text-[10px] text-muted-foreground">{wizardData.callDate || "Jan 20, 2026"} at {wizardData.callTime || "10:00 AM"}</p>
                </div>
             </div>
          </div>

          <Button 
            className="w-full max-w-xs rounded-xl h-12 font-bold bg-primary-color-new text-white" 
            onClick={() => router.push('/dashboard/services/grants-incentives')}
          >
            Go to my requests
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 px-4 md:px-6 space-y-6 pb-20">
      {/* Back Button */}
      <div className="flex items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-body transition-colors group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 group-hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium">Back</span>
        </button>
      </div>

      <div className={cn(
        "mx-auto space-y-6 transition-all duration-500",
        step === 1 ? "max-w-5xl" : "max-w-xl"
      )}>
        {/* Progress Indicator (from SupportWizard) */}
        {step > 1 && step < 5 && (
          <div className="flex items-center gap-2 px-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  (step - 1) >= s ? "bg-primary-color-new" : "bg-gray-200"
                )} 
              />
            ))}
          </div>
        )}

        <DashboardCard className="p-6">
          <div className="space-y-6">
            <div className="border-b pb-4 mb-2">
              <h2 className="text-lg font-bold text-brand-body">
                {step === 1 ? "Grant Details" : "Request Support"}
              </h2>
            </div>

            {/* STEP 1: Details (Exact replication of GrantDetailsModal) */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                <PageHeader 
                  title={grant.title}
                  badge={
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="secondary" className="text-[10px] bg-primary-color-new text-white font-medium">{grant.provider}</Badge>
                      <Badge variant="secondary" className="text-[10px] bg-primary-color-new text-white font-medium uppercase">{grant.category}</Badge>
                    </div>
                  }
                  animate={false}
                  className="p-6 mb-6"
                />

                <div className="grid grid-cols-2 gap-4">
                  <DashboardCard className="p-3">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Target Funding</span>
                    <span className="text-sm font-medium">{grant.fundingAmount}</span>
                  </DashboardCard>
                  <DashboardCard className="p-3">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Deadline</span>
                    <span className="text-sm font-medium">{grant.deadline}</span>
                  </DashboardCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-brand-body mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-color-new text-[10px] text-white font-bold">1</div>
                        Eligibility Snapshot
                      </h4>
                      <ul className="space-y-2 pl-2">
                        {grant.eligibility.map((item, i) => (
                          <li key={i} className="text-sm text-brand-body/80 flex items-start gap-2.5 ">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-brand-body mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-color-new text-[10px] text-white font-bold">2</div>
                        What you'll need
                      </h4>
                      <ul className="space-y-2 pl-2">
                        {grant.documentsNeeded.map((doc, i) => (
                          <li key={i} className="text-sm text-brand-body/80 flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-brand-body mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary-color-new text-[10px] text-white font-bold">3</div>
                        Estimated Timeline
                      </h4>
                      <ul className="pl-2">
                        <li className="text-sm text-brand-body/80 flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                          {grant.timeline} approval process
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                       <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Expert Guidance
                       </h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">
                          Our specialists will guide you through the entire application process, from document preparation to submission.
                       </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button 
                    className="w-full rounded-xl h-11 font-bold bg-primary-color-new text-white" 
                    onClick={nextStep}
                  >
                    Request support
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl h-11 font-bold flex items-center justify-center gap-2 border-primary/10 text-primary" asChild>
                    <a href={grant.sourceLink} target="_blank" rel="noopener noreferrer">
                      Source: grants.mt <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: SupportWizard Step 1 (Confirm Grant) */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Select Grant</label>
                  <div className="p-4 rounded-2xl border-2 border-primary-color-new bg-primary/5 space-y-1">
                    <h4 className="text-base font-bold text-brand-body">{grant.title}</h4>
                    <p className="text-xs text-muted-foreground">{grant.provider}</p>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold">
                    I'm not sure, recommend the best match
                  </Button>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button variant="ghost" className="flex-1 font-bold rounded-xl h-12" onClick={prevStep}>Back</Button>
                  <Button className="flex-[2] rounded-xl h-12 font-bold bg-primary-color-new text-white" onClick={nextStep}>
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: SupportWizard Step 2 (Basic Info) */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Contact Person</label>
                    <Input defaultValue="John Doe" disabled className="bg-muted/30 h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Short Project Description</label>
                    <Input 
                      placeholder="Describe your goals in 1-2 sentences..." 
                      className="h-11 rounded-xl"
                      value={wizardData.description}
                      onChange={e => setWizardData({...wizardData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Estimated Budget</label>
                    <Dropdown 
                      trigger={
                        <Button variant="outline" className="w-full h-11 justify-between rounded-xl">
                          {wizardData.budget || "Select range"} 
                          <ChevronDown className="w-4 h-4 opacity-50"/>
                        </Button>
                      }
                      className="w-full"
                      items={[
                        { id: "1", label: "< €10,000", onClick: () => setWizardData({...wizardData, budget: "< €10,000"}) },
                        { id: "2", label: "€10,000 - €50,000", onClick: () => setWizardData({...wizardData, budget: "€10,000 - €50,000"}) },
                        { id: "3", label: "€50,000+", onClick: () => setWizardData({...wizardData, budget: "€50,000+"}) }
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Timeline</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Now", "1-3 months", "3-6 months", "6+ months"].map(t => (
                        <Button 
                          key={t}
                          variant={wizardData.timeline === t ? "default" : "outline"}
                          className={cn(
                            "text-[12px] h-9 font-bold rounded-xl",
                            wizardData.timeline === t ? "bg-primary-color-new text-white" : "border-primary/10 text-primary"
                          )}
                          onClick={() => setWizardData({...wizardData, timeline: t})}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Have you applied for grants before?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={wizardData.previouslyApplied ? "default" : "outline"}
                        className={cn(
                          "text-[12px] h-9 font-bold rounded-xl",
                          wizardData.previouslyApplied ? "bg-primary-color-new text-white" : "border-primary/10 text-primary"
                        )}
                        onClick={() => setWizardData({...wizardData, previouslyApplied: true})}
                      >
                        Yes
                      </Button>
                      <Button 
                        variant={!wizardData.previouslyApplied ? "default" : "outline"}
                        className={cn(
                          "text-[12px] h-9 font-bold rounded-xl",
                          !wizardData.previouslyApplied ? "bg-primary-color-new text-white" : "border-primary/10 text-primary"
                        )}
                        onClick={() => setWizardData({...wizardData, previouslyApplied: false})}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex flex-col items-center gap-2 cursor-pointer transition-colors hover:bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-primary">Identity verification (KYC)</span>
                    <span className="text-[10px] text-muted-foreground">Upload Passport / ID for validation</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-color-new focus:ring-primary-color-new" id="consent" />
                  <label htmlFor="consent" className="text-[11px] text-muted-foreground font-bold">
                    I confirm information is accurate
                  </label>
                </div>
                
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={prevStep} className="font-bold rounded-xl h-11">Back</Button>
                  <Button className="bg-primary-color-new text-white font-bold rounded-xl h-11" onClick={nextStep}>Continue</Button>
                </div>
              </div>
            )}

            {/* STEP 4: SupportWizard Step 3 (Discovery Call) */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1.5">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Free Discovery Call
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Book a 15-min call to finalize your approach and dokumentation needs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Preferred Date</label>
                      <Input 
                        type="date" 
                        className="h-11 rounded-xl" 
                        value={wizardData.callDate}
                        onChange={e => setWizardData({...wizardData, callDate: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Time</label>
                          <Input 
                            type="time" 
                            className="h-11 rounded-xl"
                            value={wizardData.callTime}
                            onChange={e => setWizardData({...wizardData, callTime: e.target.value})}
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Meeting Type</label>
                          <Dropdown 
                            trigger={
                              <Button variant="outline" className="w-full h-11 justify-between rounded-xl">
                                {wizardData.callType} 
                                <ChevronDown className="w-4 h-4 opacity-50"/>
                              </Button>
                            }
                            className="w-full"
                            items={[
                              { id: "1", label: "Video Call", onClick: () => setWizardData({...wizardData, callType: "Video Call"}) },
                              { id: "2", label: "Phone Call", onClick: () => setWizardData({...wizardData, callType: "Phone Call"}) }
                            ]}
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={prevStep} className="font-bold rounded-xl h-11">Back</Button>
                  <Button className="bg-primary-color-new text-white font-bold rounded-xl h-11" onClick={nextStep}>
                    Book & Submit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </section>
  );
}

export default function GrantDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading details...</div>}>
      <GrantDetailsContent />
    </Suspense>
  );
}
