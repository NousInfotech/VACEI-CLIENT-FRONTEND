"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface AuditFormData {
  typeOfAuditService: "statutory_audit" | "audit_ready" | "";
  financialYear?: string;
  auditDeadline?: string;
  isFirstAudit?: "yes" | "no" | "not_sure";
  purposeOfStatements?: "statutory_audit" | "bank_investor" | "regulatory" | "other";
  purposeOtherSpecify?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface AuditRequestFormProps {
  formData: AuditFormData;
  onChange: (data: AuditFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function AuditRequestForm({
  formData,
  onChange,
  onFileChange,
}: AuditRequestFormProps) {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Generate year options (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const showStatutoryFields = formData.typeOfAuditService === "statutory_audit";
  const showAuditReadyFields = formData.typeOfAuditService === "audit_ready";
  const showPurposeOther = formData.purposeOfStatements === "other";

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request audit-related services strictly related to annual accounts and financial statements.
          This form is shown only when the selected service is Audit.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

        {/* Type of audit service */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Type of audit service <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: "statutory_audit", label: "Statutory audit of annual accounts" },
              { value: "audit_ready", label: "Audit-ready financial statements" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="typeOfAuditService"
                  value={option.value}
                  checked={formData.typeOfAuditService === option.value}
                  onChange={(e) =>
                    onChange({ ...formData, typeOfAuditService: e.target.value as any })
                  }
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Fields - Statutory audit */}
      {showStatutoryFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Statutory audit of annual accounts → Financial year
              </label>
              <select
                value={formData.financialYear || ""}
                onChange={(e) => onChange({ ...formData, financialYear: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Audit deadline (if known)
              </label>
              <Input
                type="date"
                value={formData.auditDeadline || ""}
                onChange={(e) => onChange({ ...formData, auditDeadline: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Is this the first statutory audit for this entity?
              </label>
              <div className="flex gap-4">
                {[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "not_sure", label: "Not sure" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="isFirstAudit"
                      value={option.value}
                      checked={formData.isFirstAudit === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, isFirstAudit: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Audit-ready financial statements */}
      {showAuditReadyFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Audit-ready financial statements → Purpose of the audit-ready financial statements
              </label>
              <div className="space-y-2">
                {[
                  { value: "statutory_audit", label: "Statutory audit" },
                  { value: "bank_investor", label: "Bank or investor requirement" },
                  { value: "regulatory", label: "Regulatory submission" },
                  { value: "other", label: "Other" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="purposeOfStatements"
                      value={option.value}
                      checked={formData.purposeOfStatements === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, purposeOfStatements: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showPurposeOther && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={formData.purposeOtherSpecify || ""}
                  onChange={(e) =>
                    onChange({ ...formData, purposeOtherSpecify: e.target.value })
                  }
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional clarification */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Optional clarification (free text)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional details related to the annual accounts or financial statements. You may mention reporting framework, group structure, or known issues from prior years.
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

