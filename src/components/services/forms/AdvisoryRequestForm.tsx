"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface AdvisoryFormData {
  whatDoYouNeed: "contract_review" | "compliance_advisory" | "project_coordination" | "other" | "";
  otherSpecify?: string;
  documentType?: string;
  contractReviewHelp?: string[];
  contractUrgency?: "standard" | "urgent";
  contractClarification?: string;
  complianceAreas?: string[];
  complianceOtherSpecify?: string;
  complianceClarification?: string;
  projectType?: "banking" | "investor" | "commercial" | "internal" | "other";
  projectOtherSpecify?: string;
  projectDeadline?: string;
  projectClarification?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface AdvisoryRequestFormProps {
  formData: AdvisoryFormData;
  onChange: (data: AdvisoryFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function AdvisoryRequestForm({
  formData,
  onChange,
  onFileChange,
}: AdvisoryRequestFormProps) {
  const showContractFields = formData.whatDoYouNeed === "contract_review";
  const showComplianceFields = formData.whatDoYouNeed === "compliance_advisory";
  const showProjectFields = formData.whatDoYouNeed === "project_coordination";
  const showOtherField = formData.whatDoYouNeed === "other";
  const showComplianceOther = formData.complianceAreas?.includes("other");
  const showProjectOther = formData.projectType === "other";

  const handleComplianceToggle = (area: string) => {
    const current = formData.complianceAreas || [];
    onChange({
      ...formData,
      complianceAreas: current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area],
    });
  };

  const handleContractHelpToggle = (help: string) => {
    const current = formData.contractReviewHelp || [];
    onChange({
      ...formData,
      contractReviewHelp: current.includes(help)
        ? current.filter((h) => h !== help)
        : [...current, help],
    });
  };

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
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
              { value: "compliance_advisory", label: "Compliance advisory" },
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

      {/* Conditional Fields - Contract review */}
      {showContractFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Contract / document review → Type of document
              </label>
              <Input
                type="text"
                value={formData.documentType || ""}
                onChange={(e) => onChange({ ...formData, documentType: e.target.value })}
                placeholder="Enter document type"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                What do you need help with?
              </label>
              <p className="text-xs text-gray-500 mb-2">(select all that apply)</p>
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
                      checked={formData.contractReviewHelp?.includes(option.value) || false}
                      onChange={() => handleContractHelpToggle(option.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
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
                      onChange={(e) =>
                        onChange({ ...formData, contractUrgency: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.contractClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, contractClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Compliance advisory */}
      {showComplianceFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Compliance advisory → Area of compliance
              </label>
              <p className="text-xs text-gray-500 mb-2">(select all that apply)</p>
              <div className="space-y-2">
                {[
                  { value: "corporate", label: "Corporate compliance" },
                  { value: "banking_kyc", label: "Banking / KYC readiness" },
                  { value: "regulatory_licensing", label: "Regulatory or licensing-related compliance" },
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
                      onChange={() => handleComplianceToggle(option.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showComplianceOther && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={formData.complianceOtherSpecify || ""}
                  onChange={(e) =>
                    onChange({ ...formData, complianceOtherSpecify: e.target.value })
                  }
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.complianceClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, complianceClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Project coordination */}
      {showProjectFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Project or transaction coordination → Type of project
              </label>
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
                      onChange={(e) =>
                        onChange({ ...formData, projectType: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showProjectOther && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={formData.projectOtherSpecify || ""}
                  onChange={(e) =>
                    onChange({ ...formData, projectOtherSpecify: e.target.value })
                  }
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Is there a deadline?
              </label>
              <Input
                type="date"
                value={formData.projectDeadline || ""}
                onChange={(e) => onChange({ ...formData, projectDeadline: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.projectClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, projectClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

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
          onChange={(e) => onChange({ ...formData, additionalDetails: e.target.value })}
          rows={4}
          className="w-full"
          placeholder="Enter additional details..."
        />
      </div>
    </div>
  );
}

