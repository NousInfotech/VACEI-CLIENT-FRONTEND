"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";

export interface CompanyStructureFormData {
  whatDoYouNeed:
    | "share_transfer"
    | "director_change"
    | "shareholder_change"
    | "share_capital_change"
    | "company_name_change"
    | "memorandum_amendment"
    | "restructuring"
    | "other"
    | "";
  otherSpecify?: string;
  // Share transfer fields
  shareTransferPercentage?: string;
  shareTransferUrgent?: "yes" | "no";
  shareTransferClarification?: string;
  // Director change fields
  directorChangeType?: string[]; // Appointment, Resignation, Both
  directorChangeClarification?: string;
  // Shareholder change fields
  shareholderChangeType?: string[]; // New shareholder, Removal, Change in percentages
  shareholderChangeClarification?: string;
  // Share capital change fields
  shareCapitalChangeType?: "increase" | "reduction" | "reclassification";
  shareCapitalChangeClarification?: string;
  // Company name change fields
  proposedCompanyName?: string;
  companyNameChangeClarification?: string;
  // Memorandum/objects amendment fields
  memorandumAmendmentNature?: string;
  memorandumAmendmentClarification?: string;
  // Restructuring/merger fields
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
}

export default function CompanyStructureRequestForm({
  formData,
  onChange,
}: CompanyStructureRequestFormProps) {
  const handleChange = (field: keyof CompanyStructureFormData, value: any) => {
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

  const handleCheckboxChange = (field: keyof CompanyStructureFormData, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleChange(field, updated);
  };

  const showShareTransferFields = formData.whatDoYouNeed === "share_transfer";
  const showDirectorChangeFields = formData.whatDoYouNeed === "director_change";
  const showShareholderChangeFields = formData.whatDoYouNeed === "shareholder_change";
  const showShareCapitalChangeFields = formData.whatDoYouNeed === "share_capital_change";
  const showCompanyNameChangeFields = formData.whatDoYouNeed === "company_name_change";
  const showMemorandumFields = formData.whatDoYouNeed === "memorandum_amendment";
  const showRestructuringFields = formData.whatDoYouNeed === "restructuring";
  const showOtherField = formData.whatDoYouNeed === "other";
  const showRestructuringOther = formData.restructuringType === "other";

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request services for company structure and corporate changes.
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
              { value: "share_capital_change", label: "Share capital change" },
              { value: "company_name_change", label: "Company name change" },
              { value: "memorandum_amendment", label: "Memorandum / objects amendment" },
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

      {/* Conditional Fields - Share transfer */}
      {showShareTransferFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Estimated percentage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Estimated percentage being transferred
            </label>
            <Input
              type="number"
              value={formData.shareTransferPercentage || ""}
              onChange={(e) => handleChange("shareTransferPercentage", e.target.value)}
              placeholder="Enter percentage"
              className="w-full"
              min="0"
              max="100"
            />
          </div>

          {/* Is this urgent? */}
          <div className="space-y-3">
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
                    onChange={(e) => handleChange("shareTransferUrgent", e.target.value as any)}
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
              value={formData.shareTransferClarification || ""}
              onChange={(e) => handleChange("shareTransferClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Director change */}
      {showDirectorChangeFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of change */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Type of change (select all that apply)
            </label>
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
                    onChange={() => handleCheckboxChange("directorChangeType", option.value)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
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
              value={formData.directorChangeClarification || ""}
              onChange={(e) => handleChange("directorChangeClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Shareholder change */}
      {showShareholderChangeFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of change */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Type of change (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                { value: "new", label: "New shareholder" },
                { value: "removal", label: "Removal of shareholder" },
                { value: "percentage_change", label: "Change in shareholding percentages" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.shareholderChangeType?.includes(option.value) || false}
                    onChange={() => handleCheckboxChange("shareholderChangeType", option.value)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
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
              value={formData.shareholderChangeClarification || ""}
              onChange={(e) => handleChange("shareholderChangeClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Share capital change */}
      {showShareCapitalChangeFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of change */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type of change</label>
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
                    onChange={(e) => handleChange("shareCapitalChangeType", e.target.value as any)}
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
              value={formData.shareCapitalChangeClarification || ""}
              onChange={(e) => handleChange("shareCapitalChangeClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Company name change */}
      {showCompanyNameChangeFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Proposed new company name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Proposed new company name (if known)
            </label>
            <Input
              type="text"
              value={formData.proposedCompanyName || ""}
              onChange={(e) => handleChange("proposedCompanyName", e.target.value)}
              placeholder="Enter proposed company name"
              className="w-full"
            />
          </div>

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.companyNameChangeClarification || ""}
              onChange={(e) => handleChange("companyNameChangeClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Memorandum/objects amendment */}
      {showMemorandumFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Nature of amendment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nature of amendment</label>
            <Textarea
              value={formData.memorandumAmendmentNature || ""}
              onChange={(e) => handleChange("memorandumAmendmentNature", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Describe the nature of the amendment"
            />
          </div>

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.memorandumAmendmentClarification || ""}
              onChange={(e) => handleChange("memorandumAmendmentClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Restructuring/merger */}
      {showRestructuringFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of project */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type of project</label>
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
                    onChange={(e) => handleChange("restructuringType", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* If Other */}
          {showRestructuringOther && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Other → Please specify
              </label>
              <Input
                type="text"
                value={formData.restructuringOtherSpecify || ""}
                onChange={(e) => handleChange("restructuringOtherSpecify", e.target.value)}
                placeholder="Please specify"
                className="w-full"
              />
            </div>
          )}

          {/* Is there a target timeline? */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Is there a target timeline? (optional)
            </label>
            <Input
              type="date"
              value={formData.restructuringTimeline || ""}
              onChange={(e) => handleChange("restructuringTimeline", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.restructuringClarification || ""}
              onChange={(e) => handleChange("restructuringClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Optional clarification */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Optional clarification (free text)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional details related to the corporate change. You may include background information,
          parties involved, dependencies, or known constraints.
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

