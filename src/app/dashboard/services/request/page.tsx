"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import DashboardCard from "@/components/DashboardCard";

import ServiceRequestForm from "@/components/services/ServiceRequestForm";

type ServiceCode =
  | "VAT"
  | "ACCOUNTING"
  | "AUDITING"
  | "PAYROLL"
  | "CSP"
  | "LEGAL"
  | "PROJECTS_TRANSACTIONS"
  | "TECHNOLOGY"
  | "GRANTS_AND_INCENTIVES"
  | "INCORPORATION";

const serviceLabels: Record<ServiceCode, string> = {
  VAT: "VAT",
  ACCOUNTING: "Accounting",
  AUDITING: "Audit & Annual Accounts",
  PAYROLL: "Payroll",
  CSP: "Corporate & CSP Services",
  LEGAL: "Legal",
  PROJECTS_TRANSACTIONS: "Projects & Transactions",
  TECHNOLOGY: "Technology",
  GRANTS_AND_INCENTIVES: "Grants & Incentives",
  INCORPORATION: "Incorporation",
};

export default function ServiceRequestPage() {
  const [serviceCode, setServiceCode] = useState<ServiceCode | "">("");

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <PageHeader
        title="Request a Service"
        subtitle="Select the service and complete the form."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
            >
              Clear draft
            </Button>

            <Button
              variant="outline"
              className="bg-light text-primary-color-new"
              disabled
            >
              Submit request
            </Button>
          </div>
        }
      />

      <DashboardCard className="p-6 space-y-6">
        {/* Service Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Service <span className="text-destructive">*</span>
          </label>

          <Dropdown
            className="w-full"
            trigger={
              <Button variant="outline" className="w-full h-9 justify-between">
                {serviceCode ? serviceLabels[serviceCode] : "Select service"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            }
            items={[
              {
                id: "",
                label: "Select service",
                onClick: () => setServiceCode(""),
              },
              ...Object.entries(serviceLabels).map(([code, label]) => ({
                id: code,
                label,
                onClick: () => setServiceCode(code as ServiceCode),
              })),
            ]}
          />
        </div>

        {/* ✅ ONE Dynamic Form */}
        {serviceCode && (
          <div className="border-t pt-6">
            <ServiceRequestForm service={serviceCode} />
          </div>
        )}
      </DashboardCard>
    </section>
  );
}
