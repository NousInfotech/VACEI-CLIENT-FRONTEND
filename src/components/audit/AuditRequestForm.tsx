"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";

export interface AuditFormData {
  typeOfAuditService: "statutory" | "audit_ready" | "";
  financialYear?: string;
  auditDeadline?: string;
  isFirstStatutoryAudit?: "yes" | "no" | "not_sure";
  purposeOfAuditReady?: "statutory" | "bank" | "regulatory" | "other";
  purposeOtherSpecify?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface AuditRequestFormProps {
  formData: AuditFormData;
  onChange: (data: AuditFormData) => void;
}

export default function AuditRequestForm({ formData, onChange }: AuditRequestFormProps) {
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Generate year options (current year and previous 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const handleChange = (field: keyof AuditFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleChange("uploadedFiles", [...formData.uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    handleChange(
      "uploadedFiles",
      formData.uploadedFiles.filter((_, i) => i !== index)
    );
  };

  const showStatutoryFields = formData.typeOfAuditService === "statutory";
  const showAuditReadyFields = formData.typeOfAuditService === "audit_ready";
  const showPurposeOther = formData.purposeOfAuditReady === "other";

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2">
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
              { value: "statutory", label: "Statutory audit of annual accounts" },
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
                  onChange={(e) => handleChange("typeOfAuditService", e.target.value)}
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

          {/* Financial year */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Financial year</label>
            <select
              value={formData.financialYear || ""}
              onChange={(e) => handleChange("financialYear", e.target.value)}
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

          {/* Audit deadline */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Audit deadline (if known)</label>
            <Input
              type="date"
              value={formData.auditDeadline || ""}
              onChange={(e) => handleChange("auditDeadline", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Is this the first statutory audit? */}
          <div className="space-y-3">
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
                    name="isFirstStatutoryAudit"
                    value={option.value}
                    checked={formData.isFirstStatutoryAudit === option.value}
                    onChange={(e) => handleChange("isFirstStatutoryAudit", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Audit-ready financial statements */}
      {showAuditReadyFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Purpose of the audit-ready financial statements */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Purpose of the audit-ready financial statements
            </label>
            <div className="space-y-2">
              {[
                { value: "statutory", label: "Statutory audit" },
                { value: "bank", label: "Bank or investor requirement" },
                { value: "regulatory", label: "Regulatory submission" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="purposeOfAuditReady"
                    value={option.value}
                    checked={formData.purposeOfAuditReady === option.value}
                    onChange={(e) => handleChange("purposeOfAuditReady", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* If Other - Please specify */}
          {showPurposeOther && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Other → Please specify
              </label>
              <Input
                type="text"
                value={formData.purposeOtherSpecify || ""}
                onChange={(e) => handleChange("purposeOtherSpecify", e.target.value)}
                placeholder="Please specify"
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Optional clarification */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Optional clarification (free text)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional details related to the annual accounts or financial statements.
          You may mention reporting framework, group structure, or known issues from prior years.
        </p>
        <Textarea
          value={formData.additionalDetails || ""}
          onChange={(e) => handleChange("additionalDetails", e.target.value)}
          rows={4}
          className="w-full"
          placeholder="Enter additional details..."
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Upload documents <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />
          </label>

          {/* Uploaded files list */}
          {formData.uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {formData.uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

