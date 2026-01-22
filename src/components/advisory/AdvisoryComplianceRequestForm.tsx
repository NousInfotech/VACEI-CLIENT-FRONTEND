"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";

export interface AdvisoryComplianceFormData {
  whatDoYouNeed: "contract_review" | "compliance" | "project_coordination" | "other" | "";
  otherSpecify?: string;
  // Contract/document review fields
  documentType?: string;
  contractReviewNeeds?: string[]; // Review and comments, Risk identification, etc.
  contractUrgency?: "standard" | "urgent";
  contractClarification?: string;
  // Compliance advisory fields
  complianceAreas?: string[]; // Corporate compliance, Banking/KYC, etc.
  complianceOtherSpecify?: string;
  complianceClarification?: string;
  // Project/transaction coordination fields
  projectType?: "banking" | "investor" | "commercial" | "internal" | "other";
  projectOtherSpecify?: string;
  projectDeadline?: string;
  projectClarification?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface AdvisoryComplianceRequestFormProps {
  formData: AdvisoryComplianceFormData;
  onChange: (data: AdvisoryComplianceFormData) => void;
}

export default function AdvisoryComplianceRequestForm({
  formData,
  onChange,
}: AdvisoryComplianceRequestFormProps) {
  const handleChange = (field: keyof AdvisoryComplianceFormData, value: any) => {
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

  const handleCheckboxChange = (field: keyof AdvisoryComplianceFormData, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleChange(field, updated);
  };

  const showContractFields = formData.whatDoYouNeed === "contract_review";
  const showComplianceFields = formData.whatDoYouNeed === "compliance";
  const showProjectFields = formData.whatDoYouNeed === "project_coordination";
  const showOtherField = formData.whatDoYouNeed === "other";
  const showComplianceOther = formData.complianceAreas?.includes("other");
  const showProjectOther = formData.projectType === "other";

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          This section appears only when the selected service is Advisory & Compliance — Special Matters.
          This form does not cover corporate changes, share transfers, liquidation, or litigation.
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
              { value: "contract_review", label: "Contract / document review" },
              { value: "compliance", label: "Compliance advisory" },
              { value: "project_coordination", label: "Project or transaction coordination" },
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
                  onChange={(e) => handleChange("whatDoYouNeed", e.target.value)}
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
              onChange={(e) => handleChange("otherSpecify", e.target.value)}
              placeholder="Please specify"
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Conditional Fields - Contract/document review */}
      {showContractFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of document */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type of document</label>
            <Input
              type="text"
              value={formData.documentType || ""}
              onChange={(e) => handleChange("documentType", e.target.value)}
              placeholder="Enter document type"
              className="w-full"
            />
          </div>

          {/* What do you need help with? */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              What do you need help with? (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                { value: "review_comments", label: "Review and comments" },
                { value: "risk_identification", label: "Risk or issue identification" },
                { value: "management_summary", label: "Management summary" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.contractReviewNeeds?.includes(option.value) || false}
                    onChange={() => handleCheckboxChange("contractReviewNeeds", option.value)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Urgency</label>
            <div className="flex gap-4">
              {[
                { value: "standard", label: "Standard" },
                { value: "urgent", label: "Urgent" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="contractUrgency"
                    value={option.value}
                    checked={formData.contractUrgency === option.value}
                    onChange={(e) => handleChange("contractUrgency", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.contractClarification || ""}
              onChange={(e) => handleChange("contractClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Compliance advisory */}
      {showComplianceFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Area of compliance */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Area of compliance (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                { value: "corporate", label: "Corporate compliance" },
                { value: "banking_kyc", label: "Banking / KYC readiness" },
                { value: "regulatory", label: "Regulatory or licensing-related compliance" },
                { value: "cross_border", label: "Cross-border considerations" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.complianceAreas?.includes(option.value) || false}
                    onChange={() => handleCheckboxChange("complianceAreas", option.value)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* If Other */}
          {showComplianceOther && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Other → Please specify
              </label>
              <Input
                type="text"
                value={formData.complianceOtherSpecify || ""}
                onChange={(e) => handleChange("complianceOtherSpecify", e.target.value)}
                placeholder="Please specify"
                className="w-full"
              />
            </div>
          )}

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.complianceClarification || ""}
              onChange={(e) => handleChange("complianceClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Project/transaction coordination */}
      {showProjectFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of project */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type of project</label>
            <div className="space-y-2">
              {[
                { value: "banking", label: "Banking or financing support" },
                { value: "investor", label: "Investor or third-party coordination" },
                { value: "commercial", label: "Commercial transaction support" },
                { value: "internal", label: "Internal planning or structuring (non-filing)" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="projectType"
                    value={option.value}
                    checked={formData.projectType === option.value}
                    onChange={(e) => handleChange("projectType", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* If Other */}
          {showProjectOther && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Other → Please specify
              </label>
              <Input
                type="text"
                value={formData.projectOtherSpecify || ""}
                onChange={(e) => handleChange("projectOtherSpecify", e.target.value)}
                placeholder="Please specify"
                className="w-full"
              />
            </div>
          )}

          {/* Is there a deadline? */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Is there a deadline? (optional)
            </label>
            <Input
              type="date"
              value={formData.projectDeadline || ""}
              onChange={(e) => handleChange("projectDeadline", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.projectClarification || ""}
              onChange={(e) => handleChange("projectClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Auto-filled (read-only) - will be handled by parent */}
      
      {/* Optional clarification */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Optional clarification (free text)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional details. You may briefly describe the background, parties involved, or the outcome you are seeking.
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

