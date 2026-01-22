"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface CompanyStructureFormData {
  whatDoYouNeed: "share_transfer" | "director_change" | "shareholder_change" | "share_capital" | "company_name" | "memorandum" | "restructuring" | "other" | "";
  otherSpecify?: string;
  shareTransferPercentage?: string;
  shareTransferUrgent?: "yes" | "no";
  shareTransferClarification?: string;
  directorChangeType?: string[];
  directorClarification?: string;
  shareholderChangeType?: string[];
  shareholderClarification?: string;
  shareCapitalChangeType?: "increase" | "reduction" | "reclassification";
  shareCapitalClarification?: string;
  companyNameProposed?: string;
  companyNameClarification?: string;
  memorandumNature?: string;
  memorandumClarification?: string;
  restructuringType?: "group" | "pre_merger" | "cross_border" | "redomiciliation" | "other";
  restructuringOtherSpecify?: string;
  restructuringTimeline?: string;
  restructuringClarification?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface CompanyStructureRequestFormProps {
  formData: CompanyStructureFormData;
  onChange: (data: CompanyStructureFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function CompanyStructureRequestForm({
  formData,
  onChange,
  onFileChange,
}: CompanyStructureRequestFormProps) {
  const showShareTransferFields = formData.whatDoYouNeed === "share_transfer";
  const showDirectorFields = formData.whatDoYouNeed === "director_change";
  const showShareholderFields = formData.whatDoYouNeed === "shareholder_change";
  const showShareCapitalFields = formData.whatDoYouNeed === "share_capital";
  const showCompanyNameFields = formData.whatDoYouNeed === "company_name";
  const showMemorandumFields = formData.whatDoYouNeed === "memorandum";
  const showRestructuringFields = formData.whatDoYouNeed === "restructuring";
  const showOtherField = formData.whatDoYouNeed === "other";
  const showRestructuringOther = formData.restructuringType === "other";

  const handleDirectorToggle = (type: string) => {
    const current = formData.directorChangeType || [];
    onChange({
      ...formData,
      directorChangeType: current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    });
  };

  const handleShareholderToggle = (type: string) => {
    const current = formData.shareholderChangeType || [];
    onChange({
      ...formData,
      shareholderChangeType: current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    });
  };

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request company structure and corporate changes.
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
              { value: "share_transfer", label: "Share transfer" },
              { value: "director_change", label: "Director change" },
              { value: "shareholder_change", label: "Shareholder change" },
              { value: "share_capital", label: "Share capital change" },
              { value: "company_name", label: "Company name change" },
              { value: "memorandum", label: "Memorandum / objects amendment" },
              { value: "restructuring", label: "Restructuring or merger" },
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

      {/* Conditional Fields - Share transfer */}
      {showShareTransferFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Share transfer → Estimated percentage being transferred
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.shareTransferPercentage || ""}
                onChange={(e) =>
                  onChange({ ...formData, shareTransferPercentage: e.target.value })
                }
                placeholder="Enter percentage"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Is this urgent?</label>
              <div className="flex gap-4">
                {[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="shareTransferUrgent"
                      value={option.value}
                      checked={formData.shareTransferUrgent === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, shareTransferUrgent: e.target.value as any })
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
                value={formData.shareTransferClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, shareTransferClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Director change */}
      {showDirectorFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Director change → Type of change
              </label>
              <p className="text-xs text-gray-500 mb-2">(select all that apply)</p>
              <div className="space-y-2">
                {[
                  { value: "appointment", label: "Appointment" },
                  { value: "resignation", label: "Resignation" },
                  { value: "both", label: "Both" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.directorChangeType?.includes(option.value) || false}
                      onChange={() => handleDirectorToggle(option.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.directorClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, directorClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Shareholder change */}
      {showShareholderFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Shareholder change → Type of change
              </label>
              <p className="text-xs text-gray-500 mb-2">(select all that apply)</p>
              <div className="space-y-2">
                {[
                  { value: "new", label: "New shareholder" },
                  { value: "removal", label: "Removal of shareholder" },
                  { value: "percentage", label: "Change in shareholding percentages" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.shareholderChangeType?.includes(option.value) || false}
                      onChange={() => handleShareholderToggle(option.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.shareholderClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, shareholderClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Share capital change */}
      {showShareCapitalFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Share capital change → Type of change
              </label>
              <div className="space-y-2">
                {[
                  { value: "increase", label: "Increase" },
                  { value: "reduction", label: "Reduction" },
                  { value: "reclassification", label: "Reclassification" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="shareCapitalChangeType"
                      value={option.value}
                      checked={formData.shareCapitalChangeType === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, shareCapitalChangeType: e.target.value as any })
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
                value={formData.shareCapitalClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, shareCapitalClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Company name change */}
      {showCompanyNameFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Company name change → Proposed new company name (if known)
              </label>
              <Input
                type="text"
                value={formData.companyNameProposed || ""}
                onChange={(e) =>
                  onChange({ ...formData, companyNameProposed: e.target.value })
                }
                placeholder="Enter proposed company name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.companyNameClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, companyNameClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Memorandum amendment */}
      {showMemorandumFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Memorandum / objects amendment → Nature of amendment
              </label>
              <Input
                type="text"
                value={formData.memorandumNature || ""}
                onChange={(e) =>
                  onChange({ ...formData, memorandumNature: e.target.value })
                }
                placeholder="Enter nature of amendment"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.memorandumClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, memorandumClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Restructuring */}
      {showRestructuringFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Restructuring or merger → Type of project
              </label>
              <div className="space-y-2">
                {[
                  { value: "group", label: "Group restructuring" },
                  { value: "pre_merger", label: "Pre-merger structuring" },
                  { value: "cross_border", label: "Cross-border merger" },
                  { value: "redomiciliation", label: "Re-domiciliation (if applicable)" },
                  { value: "other", label: "Other" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="restructuringType"
                      value={option.value}
                      checked={formData.restructuringType === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, restructuringType: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showRestructuringOther && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={formData.restructuringOtherSpecify || ""}
                  onChange={(e) =>
                    onChange({ ...formData, restructuringOtherSpecify: e.target.value })
                  }
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Is there a target timeline?
              </label>
              <Input
                type="date"
                value={formData.restructuringTimeline || ""}
                onChange={(e) =>
                  onChange({ ...formData, restructuringTimeline: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.restructuringClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, restructuringClarification: e.target.value })
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
          Additional details related to the corporate change. You may include background information, parties involved, dependencies, or known constraints.
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

