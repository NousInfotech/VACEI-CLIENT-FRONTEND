"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface PayrollFormData {
  whatDoYouNeed: "start" | "add_remove" | "review" | "correction" | "other" | "";
  otherSpecify?: string;
  numberOfEmployeesAffected?: string;
  addRemoveClarification?: string;
  correctionPeriod?: string;
  expectedStartMonth?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface PayrollRequestFormInlineProps {
  formData: PayrollFormData;
  onChange: (data: PayrollFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function PayrollRequestFormInline({
  formData,
  onChange,
  onFileChange,
}: PayrollRequestFormInlineProps) {
  const [countryJurisdiction, setCountryJurisdiction] = useState<string>("");
  const [existingPayrollStatus, setExistingPayrollStatus] = useState<string>("Not set up");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [correctionPeriodType, setCorrectionPeriodType] = useState<"month" | "pay_period">("month");

  // Load company data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeCompanyId = localStorage.getItem("vacei-active-company");
      const companies = localStorage.getItem("vacei-companies");

      if (activeCompanyId && companies) {
        try {
          const companiesList = JSON.parse(companies);
          const activeCompany = companiesList.find(
            (c: any) => c.id === activeCompanyId || c._id === activeCompanyId
          );
          if (activeCompany) {
            setCountryJurisdiction(activeCompany.jurisdiction || activeCompany.country || "");
            setExistingPayrollStatus(activeCompany.payrollStatus || "Not set up");
          }
        } catch (e) {
          console.error("Error parsing company data:", e);
        }
      }
    }
  }, []);

  const showOtherField = formData.whatDoYouNeed === "other";
  const showAddRemoveFields = formData.whatDoYouNeed === "add_remove";
  const showCorrectionFields = formData.whatDoYouNeed === "correction";
  const showStartPayrollFields = formData.whatDoYouNeed === "start";

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(parseInt(selectedYear), i, 1);
    return date.toLocaleString("default", { month: "long" });
  });

  // Generate pay period options
  const payPeriodOptions = [
    "Week 1", "Week 2", "Week 3", "Week 4",
    "Bi-weekly Period 1", "Bi-weekly Period 2",
  ];

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request payroll services to start payroll, make changes, review existing payroll, or correct payroll records.
          This form is used when the selected service is Payroll.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

        {/* What do you need? */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What do you need? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: "start", label: "Start payroll" },
              { value: "add_remove", label: "Add or remove employees" },
              { value: "review", label: "Payroll review" },
              { value: "correction", label: "Payroll correction" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="whatDoYouNeed"
                  value={option.value}
                  checked={formData.whatDoYouNeed === option.value}
                  onChange={(e) =>
                    onChange({ ...formData, whatDoYouNeed: e.target.value as any })
                  }
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* If Other */}
        {showOtherField && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              If Other → Please specify
            </label>
            <Input
              type="text"
              value={formData.otherSpecify || ""}
              onChange={(e) => onChange({ ...formData, otherSpecify: e.target.value })}
              placeholder="Please specify"
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Conditional Fields - Add or remove employees */}
      {showAddRemoveFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Add or remove employees → Number of employees affected
              </label>
              <Input
                type="number"
                min="0"
                value={formData.numberOfEmployeesAffected || ""}
                onChange={(e) =>
                  onChange({ ...formData, numberOfEmployeesAffected: e.target.value })
                }
                placeholder="Enter number"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.addRemoveClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, addRemoveClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Payroll correction */}
      {showCorrectionFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Payroll correction → Which payroll period needs correction?
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer px-2">
                    <input
                      type="radio"
                      name="correctionPeriodType"
                      value="month"
                      checked={correctionPeriodType === "month"}
                      onChange={(e) => setCorrectionPeriodType(e.target.value as any)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">Month</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer px-2">
                    <input
                      type="radio"
                      name="correctionPeriodType"
                      value="pay_period"
                      checked={correctionPeriodType === "pay_period"}
                      onChange={(e) => setCorrectionPeriodType(e.target.value as any)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">Pay period</span>
                  </label>
                </div>
                {correctionPeriodType === "month" ? (
                  <select
                    value={formData.correctionPeriod || ""}
                    onChange={(e) =>
                      onChange({ ...formData, correctionPeriod: e.target.value })
                    }
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select month</option>
                    {monthOptions.map((month, index) => (
                      <option key={index} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={formData.correctionPeriod || ""}
                    onChange={(e) =>
                      onChange({ ...formData, correctionPeriod: e.target.value })
                    }
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select pay period</option>
                    {payPeriodOptions.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Start payroll */}
      {showStartPayrollFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Start payroll → Expected start month
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.expectedStartMonth || ""}
                  onChange={(e) =>
                    onChange({ ...formData, expectedStartMonth: e.target.value })
                  }
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select month</option>
                  {monthOptions.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-filled (read-only) */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Auto-filled (read-only)</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country / jurisdiction</label>
            <Input
              type="text"
              value={countryJurisdiction}
              readOnly
              className="w-full bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Existing payroll status</label>
            <Input
              type="text"
              value={existingPayrollStatus}
              readOnly
              className="w-full bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Optional clarification */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Optional clarification (free text)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional details related to payroll. You may include information about pay frequency, special allowances, benefits, or known payroll issues.
        </p>
        <Textarea
          value={formData.additionalDetails || ""}
          onChange={(e) => onChange({ ...formData, additionalDetails: e.target.value })}
          rows={4}
          className="w-full"
          placeholder="Enter additional details..."
        />
      </div>
    </div>
  );
}

