"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface VATFormData {
  typeOfVATService: "return" | "review" | "correction" | "registration" | "deregistration" | "other" | "";
  otherSpecify?: string;
  correctionPeriod?: string;
  reviewReason?: "cross_border" | "unusual_amounts" | "audit_prep" | "other";
  reviewOtherSpecify?: string;
  registrationEffectiveDate?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface VATRequestFormInlineProps {
  formData: VATFormData;
  onChange: (data: VATFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function VATRequestFormInline({
  formData,
  onChange,
  onFileChange,
}: VATRequestFormInlineProps) {
  const [vatNumber, setVatNumber] = useState<string>("");
  const [countryJurisdiction, setCountryJurisdiction] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [correctionPeriodType, setCorrectionPeriodType] = useState<"month" | "quarter">("quarter");

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
            setVatNumber(activeCompany.vatNumber || activeCompany.vat_number || "");
            setCountryJurisdiction(activeCompany.jurisdiction || activeCompany.country || "");
          }
        } catch (e) {
          console.error("Error parsing company data:", e);
        }
      }
    }
  }, []);

  const showCorrectionFields = formData.typeOfVATService === "correction";
  const showReviewFields = formData.typeOfVATService === "review";
  const showRegistrationFields = formData.typeOfVATService === "registration";
  const showOtherField = formData.typeOfVATService === "other";
  const showReviewOther = formData.reviewReason === "other";

  // Generate year options
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
          Request VAT or tax-related services including filings, reviews, corrections, and registrations.
          This form is used when the selected service is VAT / Tax.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

        {/* Type of VAT service */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Type of VAT service <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: "return", label: "VAT return" },
              { value: "review", label: "VAT review" },
              { value: "correction", label: "VAT correction" },
              { value: "registration", label: "VAT registration" },
              { value: "deregistration", label: "VAT deregistration" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="typeOfVATService"
                  value={option.value}
                  checked={formData.typeOfVATService === option.value}
                  onChange={(e) =>
                    onChange({ ...formData, typeOfVATService: e.target.value as any })
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

      {/* Conditional Fields - VAT correction */}
      {showCorrectionFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If VAT correction → Which period needs correction?
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
                      value="quarter"
                      checked={correctionPeriodType === "quarter"}
                      onChange={(e) => setCorrectionPeriodType(e.target.value as any)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">Quarter</span>
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

      {/* Conditional Fields - VAT review */}
      {showReviewFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If VAT review → Reason for review
              </label>
              <div className="space-y-2">
                {[
                  { value: "cross_border", label: "Cross-border transactions" },
                  { value: "unusual_amounts", label: "Unusual amounts" },
                  { value: "audit_prep", label: "Audit preparation" },
                  { value: "other", label: "Other" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="reviewReason"
                      value={option.value}
                      checked={formData.reviewReason === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, reviewReason: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showReviewOther && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={formData.reviewOtherSpecify || ""}
                  onChange={(e) =>
                    onChange({ ...formData, reviewOtherSpecify: e.target.value })
                  }
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditional Fields - VAT registration */}
      {showRegistrationFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If VAT registration → Effective date (if known)
              </label>
              <Input
                type="date"
                value={formData.registrationEffectiveDate || ""}
                onChange={(e) =>
                  onChange({ ...formData, registrationEffectiveDate: e.target.value })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Auto-filled (read-only) */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Auto-filled (read-only)</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">VAT number (if registered)</label>
            <Input
              type="text"
              value={vatNumber}
              readOnly
              className="w-full bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country / jurisdiction</label>
            <Input
              type="text"
              value={countryJurisdiction}
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
          Additional details related to VAT / tax. You may describe the issue, transaction volume, or any relevant background.
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

