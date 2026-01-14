"use client";

import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { Grant } from "./types";

interface GrantDetailsModalProps {
  grant: Grant | null;
  isOpen: boolean;
  onClose: () => void;
  onStartRequest: (grant: Grant) => void;
}

export default function GrantDetailsModal({ grant, isOpen, onClose, onStartRequest }: GrantDetailsModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Grant Details"
    >
      <div className="h-[500px] overflow-y-auto px-2">
        {grant && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold leading-tight">{grant.title}</h2>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="text-[10px] bg-primary-color-new font-medium">{grant.provider}</Badge>
                <Badge variant="secondary" className="text-[10px] bg-primary-color-new font-medium uppercase">{grant.category}</Badge>
              </div>
            </div>

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

            <div className="space-y-5">
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
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                className="w-full rounded-xl h-11 font-bold bg-primary-color-new text-white" 
                onClick={() => onStartRequest(grant)}
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
      </div>
    </Modal>
  );
}
