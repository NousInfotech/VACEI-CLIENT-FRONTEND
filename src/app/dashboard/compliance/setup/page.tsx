"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import Dropdown from "@/components/Dropdown";
import { DatePickerWithIcon } from "@/components/DatePickerWithIcon";
import { ChevronDown, Settings as SettingsIcon } from "lucide-react";

type VatFrequency = "Monthly" | "Quarterly" | "Not registered";
type PayrollFrequency = "Monthly" | "Not applicable";

interface ComplianceSetupState {
  jurisdiction: string;
  financialYearEnd: string;
  vatFrequency: VatFrequency;
  payrollFrequency: PayrollFrequency;
  corporateType: "Company" | "Partnership" | "Self-employed" | "";
  mbrAnniversaryDate: string;
  vatDueDateOffsetOverride: string;
  payrollSubmissionDueDateOverride: string;
  provisionalTaxEnabled: boolean;
  extensionsEnabled: boolean;
  servicesActivated: {
    accounting: boolean;
    vatTax: boolean;
    payroll: boolean;
    corporate: boolean;
    statutory: boolean;
    audit: boolean;
    grants: boolean;
    regulatedLicences: boolean;
    banking: boolean;
    corporateActions: boolean;
  };
}

export default function ComplianceSetupPage() {
  const [form, setForm] = useState<ComplianceSetupState>({
    jurisdiction: "Malta",
    financialYearEnd: "",
    vatFrequency: "Quarterly",
    payrollFrequency: "Monthly",
    corporateType: "Company",
    mbrAnniversaryDate: "",
    vatDueDateOffsetOverride: "",
    payrollSubmissionDueDateOverride: "",
    provisionalTaxEnabled: false,
    extensionsEnabled: false,
    servicesActivated: {
      accounting: true,
      vatTax: true,
      payroll: true,
      corporate: true,
      statutory: true,
      audit: false,
      grants: false,
      regulatedLicences: false,
      banking: false,
      corporateActions: false,
    },
  });
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const companyId = localStorage.getItem("vacei-active-company") || "";
    if (!companyId) return;
    const raw = localStorage.getItem(`vacei-compliance-setup-${companyId}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const companyId = localStorage.getItem("vacei-active-company") || "";
    if (!companyId) return;
    localStorage.setItem(`vacei-compliance-setup-${companyId}`, JSON.stringify(form));
  }, [form]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || "";
      if (companyId && base && token) {
        const res = await fetch(`${base}compliance/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companyId,
            jurisdiction: form.jurisdiction,
            financialYearEnd: form.financialYearEnd,
            vatFrequency: form.vatFrequency,
            payrollFrequency: form.payrollFrequency,
            corporateType: form.corporateType || null,
            mbrAnniversaryDate: form.mbrAnniversaryDate || null,
            vatDueDateOffsetOverride: form.vatDueDateOffsetOverride || null,
            payrollSubmissionDueDateOverride: form.payrollSubmissionDueDateOverride || null,
            provisionalTaxEnabled: form.provisionalTaxEnabled,
            extensionsEnabled: form.extensionsEnabled,
            servicesActivated: form.servicesActivated,
          }),
        });
        if (!res.ok) {
          console.error("Failed to save compliance settings");
        }
      }
      setLastSavedAt(new Date().toLocaleString());
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (key: keyof ComplianceSetupState["servicesActivated"]) => {
    setForm((prev) => ({
      ...prev,
      servicesActivated: {
        ...prev.servicesActivated,
        [key]: !prev.servicesActivated[key],
      },
    }));
  };

  return (
    <section className="flex flex-col gap-6 px-4 py-4 md:px-6 md:py-6 pt-2 md:pt-4">
      <DashboardCard animate className="p-8 bg-[#0f1729] border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Compliance Setup
              </h1>
              <p className="text-white/60 font-medium">
                Configure per-company compliance anchors and active services.
              </p>
              <p className="text-white/50 text-sm max-w-2xl pt-2 leading-relaxed">
                These settings drive the auto-generated Compliance Calendar for your clients. Set the key dates and frequencies that drive all deadlines.
              </p>
            </div>
            
            {lastSavedAt && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">
                  Last saved {lastSavedAt}
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="default"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  jurisdiction: "Malta",
                  vatFrequency: "Quarterly",
                  payrollFrequency: "Monthly",
                }));
              }}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Reset to Malta defaults
            </Button>
            <Button
              size="default"
              className="bg-brand-primary hover:bg-brand-active text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-brand-body">Compliance Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Set the key dates and frequencies that drive all deadlines.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Jurisdiction</label>
                <input
                  value={form.jurisdiction}
                  onChange={(e) => setForm((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  placeholder="e.g. Malta"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Financial year-end date</label>
                <DatePickerWithIcon
                  selected={form.financialYearEnd ? new Date(form.financialYearEnd) : null}
                  onChange={(date) => setForm((prev) => ({ ...prev, financialYearEnd: date ? date.toISOString().split('T')[0] : "" }))}
                  placeholder="Select date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">VAT frequency</label>
                <Dropdown
                  className="w-full"
                  align="left"
                  side="bottom"
                  autoPosition={false}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 justify-between rounded-lg"
                    >
                      <span className="text-sm">
                        {form.vatFrequency === "Not registered" ? "Not registered" : form.vatFrequency}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-60" />
                    </Button>
                  }
                  items={[
                    { id: "Monthly", label: "Monthly", onClick: () => setForm((prev) => ({ ...prev, vatFrequency: "Monthly" })) },
                    { id: "Quarterly", label: "Quarterly", onClick: () => setForm((prev) => ({ ...prev, vatFrequency: "Quarterly" })) },
                    { id: "Not registered", label: "Not registered", onClick: () => setForm((prev) => ({ ...prev, vatFrequency: "Not registered" })) },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Payroll frequency</label>
                <Dropdown
                  className="w-full"
                  align="left"
                  side="bottom"
                  autoPosition={false}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 justify-between rounded-lg"
                    >
                      <span className="text-sm">
                        {form.payrollFrequency === "Not applicable" ? "Not applicable" : form.payrollFrequency}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-60" />
                    </Button>
                  }
                  items={[
                    { id: "Monthly", label: "Monthly", onClick: () => setForm((prev) => ({ ...prev, payrollFrequency: "Monthly" })) },
                    { id: "Not applicable", label: "Not applicable", onClick: () => setForm((prev) => ({ ...prev, payrollFrequency: "Not applicable" })) },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Corporate type</label>
                <Dropdown
                  className="w-full"
                  align="left"
                  side="bottom"
                  autoPosition={false}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 justify-between rounded-lg"
                    >
                      <span className="text-sm">
                        {form.corporateType || "Select type"}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-60" />
                    </Button>
                  }
                  items={[
                    { id: "Company", label: "Company", onClick: () => setForm((prev) => ({ ...prev, corporateType: "Company" })) },
                    { id: "Partnership", label: "Partnership", onClick: () => setForm((prev) => ({ ...prev, corporateType: "Partnership" })) },
                    { id: "Self-employed", label: "Self-employed", onClick: () => setForm((prev) => ({ ...prev, corporateType: "Self-employed" })) },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">MBR anniversary date</label>
                <DatePickerWithIcon
                  selected={form.mbrAnniversaryDate ? new Date(form.mbrAnniversaryDate) : null}
                  onChange={(date) => setForm((prev) => ({ ...prev, mbrAnniversaryDate: date ? date.toISOString().split('T')[0] : "" }))}
                  placeholder="Select date"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">VAT due date offset override</label>
                <input
                  value={form.vatDueDateOffsetOverride}
                  onChange={(e) => setForm((prev) => ({ ...prev, vatDueDateOffsetOverride: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Optional override (days or description)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-body">Payroll submission due date override</label>
                <input
                  value={form.payrollSubmissionDueDateOverride}
                  onChange={(e) => setForm((prev) => ({ ...prev, payrollSubmissionDueDateOverride: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Optional override (days or description)"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleRow
                label="Provisional tax enabled"
                description="If enabled, provisional tax instalments will be generated (e.g. 30 Apr, 31 Aug, 21 Dec)."
                checked={form.provisionalTaxEnabled}
                onChange={(value) => setForm((prev) => ({ ...prev, provisionalTaxEnabled: value }))}
              />
              <ToggleRow
                label="Extensions enabled"
                description="Allows obligations to carry an extension date where applicable."
                checked={form.extensionsEnabled}
                onChange={(value) => setForm((prev) => ({ ...prev, extensionsEnabled: value }))}
              />
            </div>
          </DashboardCard>

          <DashboardCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-brand-body">Deadline rules (summary)</h2>
                <p className="text-sm text-muted-foreground">
                  Rules are stored centrally and can be configured per jurisdiction by your firm admin team.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <RuleSummary
                title="VAT"
                lines={[
                  "Monthly return: 15th of following month",
                  "Quarterly return: 15th of second month after quarter",
                  "VAT payment: same as VAT return",
                ]}
              />
              <RuleSummary
                title="Payroll"
                lines={[
                  "Monthly FS5: 15th of following month",
                  "SSC payment: 10th of following month",
                  "FS7 annual reconciliation: 15 Feb",
                ]}
              />
              <RuleSummary
                title="Corporate / MBR"
                lines={[
                  "Annual return: company anniversary date",
                  "BO changes: event-based (generated on trigger)",
                ]}
              />
              <RuleSummary
                title="Audit / FS / MBR filing"
                lines={[
                  "AGM: within 10 months of year-end",
                  "FS filing: 42 days after AGM",
                  "Audit sign-off: before FS filing (e.g. FS - 7 days)",
                ]}
              />
              <RuleSummary
                title="Tax"
                lines={[
                  "Provisional tax instalments (if enabled): 30 Apr, 31 Aug, 21 Dec",
                  "Tax return due date: firm-configurable per jurisdiction",
                ]}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              To keep your system flexible, store rule definitions in a central rule library (per jurisdiction) and avoid hard-coding due dates in the calendar UI.
            </p>
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-brand-body">
                  Statuses &amp; action logic
                </h3>
                <p className="text-xs text-muted-foreground">
                  Client-facing obligations use a small, fixed set of statuses and a single primary action.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-brand-body">
                      Global statuses
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>Not active (for catalogue-only items, optional)</li>
                      <li>Upcoming</li>
                      <li>Due soon</li>
                      <li>Waiting on you</li>
                      <li>Completed</li>
                      <li>Overdue</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-brand-body">
                      CTA rules (one CTA only)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>Waiting on you → Upload OR Reply OR Approve (by obligation type)</li>
                      <li>Due soon → View</li>
                      <li>In progress → View</li>
                      <li>Completed → View</li>
                      <li>Overdue → Resolve (opens upload / reply flow)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-brand-body">
                  Example page data (Acme Ltd)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Static sample configuration used for demo/testing of the Compliance Calendar.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-brand-body">
                      Sample configuration
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>Client: Acme Ltd</li>
                      <li>VAT frequency: Quarterly</li>
                      <li>Financial year-end: 31 Dec 2025</li>
                      <li>Payroll: Monthly</li>
                      <li>Services active: VAT, Payroll, Audit, Corporate</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-brand-body">
                      Generated obligations (examples)
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>VAT Return Q2: 15 Aug 2025</li>
                      <li>VAT Return Q3: 15 Nov 2025</li>
                      <li>Payroll submissions: 15th of each month</li>
                      <li>SSC: 10th of each month</li>
                      <li>AGM: 31 Oct 2026 (10 months after FY end)</li>
                      <li>FS filing: 42 days after AGM</li>
                      <li>Audit sign-off: 7 days before FS filing</li>
                      <li>Annual return: company anniversary date (sample date)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-brand-body">Services activated</h2>
              </div>
            </div>
            <div className="space-y-2">
              <ServiceToggle
                label="Accounting & Bookkeeping"
                checked={form.servicesActivated.accounting}
                onChange={() => toggleService("accounting")}
              />
              <ServiceToggle
                label="VAT & Tax"
                checked={form.servicesActivated.vatTax}
                onChange={() => toggleService("vatTax")}
              />
              <ServiceToggle
                label="Payroll"
                checked={form.servicesActivated.payroll}
                onChange={() => toggleService("payroll")}
              />
              <ServiceToggle
                label="Corporate Services (CSP)"
                checked={form.servicesActivated.corporate}
                onChange={() => toggleService("corporate")}
              />
              <ServiceToggle
                label="Statutory Compliance"
                checked={form.servicesActivated.statutory}
                onChange={() => toggleService("statutory")}
              />
              <ServiceToggle
                label="Audit (Annual)"
                checked={form.servicesActivated.audit}
                onChange={() => toggleService("audit")}
              />
              <ServiceToggle
                label="Grants & Incentives (Project-based)"
                checked={form.servicesActivated.grants}
                onChange={() => toggleService("grants")}
              />
              <ServiceToggle
                label="Regulated Licences (MGA etc., project-based)"
                checked={form.servicesActivated.regulatedLicences}
                onChange={() => toggleService("regulatedLicences")}
              />
              <ServiceToggle
                label="Banking (project-based)"
                checked={form.servicesActivated.banking}
                onChange={() => toggleService("banking")}
              />
              <ServiceToggle
                label="Corporate Actions (project-based)"
                checked={form.servicesActivated.corporateActions}
                onChange={() => toggleService("corporateActions")}
              />
            </div>
          </DashboardCard>
        </div>
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="space-y-1">
        <div className="text-sm font-medium text-brand-body">{label}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
          checked ? "bg-brand-primary border-brand-primary" : "bg-muted border-border"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ServiceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors"
    >
      <span>{label}</span>
      <span
        className={`inline-flex h-4 w-7 items-center rounded-full border ${
          checked ? "bg-brand-primary border-brand-primary" : "bg-muted border-border"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
            checked ? "translate-x-3" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

function RuleSummary({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="text-sm font-semibold text-brand-body">{title}</div>
      <ul className="text-xs text-muted-foreground space-y-1">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
