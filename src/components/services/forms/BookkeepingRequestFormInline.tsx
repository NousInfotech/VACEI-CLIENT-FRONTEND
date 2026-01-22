"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface BookkeepingFormData {
  whatDoYouNeed: "start" | "catchup" | "review" | "monthly" | "other" | "";
  otherSpecify?: string;
  periodType?: "month" | "quarter";
  periodValue?: string;
  missingDocuments?: "yes" | "no" | "not_sure";
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface BookkeepingRequestFormInlineProps {
  formData: BookkeepingFormData;
  onChange: (data: BookkeepingFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function BookkeepingRequestFormInline({
  formData,
  onChange,
  onFileChange,
}: BookkeepingRequestFormInlineProps) {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [companyName, setCompanyName] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("");

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
            setCompanyName(activeCompany.name || "");
            setJurisdiction(activeCompany.jurisdiction || activeCompany.country || "");
          }
        } catch (e) {
          console.error("Error parsing company data:", e);
        }
      }
    }
  }, []);

  const showPeriodFields =
    formData.whatDoYouNeed === "catchup" ||
    formData.whatDoYouNeed === "review" ||
    formData.whatDoYouNeed === "monthly";

  const showOtherField = formData.whatDoYouNeed === "other";

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(parseInt(selectedYear), i, 1);
    return date.toLocaleString("default", { month: "long" });
  });

  // Generate quarter options
  const quarterOptions = ["Q1", "Q2", "Q3", "Q4"];

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request bookkeeping services to start, extend, review, or correct accounting records.
          This form is used when the selected service is Bookkeeping.
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
              { value: "start", label: "Start bookkeeping" },
              { value: "catchup", label: "Catch-up / backlog" },
              { value: "review", label: "Review / corrections" },
              { value: "monthly", label: "Monthly extension" },
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

      {/* Optional Conditional Fields */}
      {showPeriodFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Optional (conditional fields)
          </h3>

          {/* Which periods are affected? */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Which periods are affected?
            </label>

            {/* Period type */}
            <div className="space-y-2">
              <label className="text-xs text-gray-600">Period type</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periodType"
                    value="month"
                    checked={formData.periodType === "month"}
                    onChange={(e) =>
                      onChange({
                        ...formData,
                        periodType: e.target.value as "month" | "quarter",
                        periodValue: "",
                      })
                    }
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">Month</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periodType"
                    value="quarter"
                    checked={formData.periodType === "quarter"}
                    onChange={(e) =>
                      onChange({
                        ...formData,
                        periodType: e.target.value as "month" | "quarter",
                        periodValue: "",
                      })
                    }
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">Quarter</span>
                </label>
              </div>
            </div>

            {/* Period selector */}
            <div className="space-y-2">
              <label className="text-xs text-gray-600">Period selector</label>
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
                {formData.periodType === "month" ? (
                  <select
                    value={formData.periodValue || ""}
                    onChange={(e) =>
                      onChange({ ...formData, periodValue: e.target.value })
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
                    value={formData.periodValue || ""}
                    onChange={(e) =>
                      onChange({ ...formData, periodValue: e.target.value })
                    }
                    className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select quarter</option>
                    {quarterOptions.map((quarter) => (
                      <option key={quarter} value={quarter}>
                        {quarter} {selectedYear}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Do you have missing documents? */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Optional (conditional fields)</h3>
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Do you have missing documents?
          </label>
          <div className="space-y-2">
            {[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not_sure", label: "Not sure" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="missingDocuments"
                  value={option.value}
                  checked={formData.missingDocuments === option.value}
                  onChange={(e) =>
                    onChange({ ...formData, missingDocuments: e.target.value as any })
                  }
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-filled (read-only) */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Auto-filled (read-only)</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Company name</label>
            <Input
              type="text"
              value={companyName}
              readOnly
              className="w-full bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Jurisdiction</label>
            <Input
              type="text"
              value={jurisdiction}
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
          Additional details related to bookkeeping. You may briefly explain the situation, volume of transactions, or any known issues.
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

