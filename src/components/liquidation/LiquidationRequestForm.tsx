"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";

export interface LiquidationFormData {
  whatDoYouNeed:
    | "mvl"
    | "cvl"
    | "strike_off"
    | "wind_down"
    | "other"
    | "";
  otherSpecify?: string;
  // MVL/CVL fields
  isCompanySolvent?: "yes" | "no" | "not_sure";
  liquidationTimeline?: "asap" | "flexible";
  liquidationClarification?: string;
  // Strike-off fields
  isCompanyTrading?: "yes" | "no" | "not_sure";
  strikeOffClarification?: string;
  // Wind-down planning fields
  windDownSituation?: "no_longer_operating" | "restructuring" | "planned_exit" | "other";
  windDownOtherSpecify?: string;
  windDownClarification?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface LiquidationRequestFormProps {
  formData: LiquidationFormData;
  onChange: (data: LiquidationFormData) => void;
}

export default function LiquidationRequestForm({
  formData,
  onChange,
}: LiquidationRequestFormProps) {
  const handleChange = (field: keyof LiquidationFormData, value: any) => {
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

  const showMVLCVLFields =
    formData.whatDoYouNeed === "mvl" || formData.whatDoYouNeed === "cvl";
  const showStrikeOffFields = formData.whatDoYouNeed === "strike_off";
  const showWindDownFields = formData.whatDoYouNeed === "wind_down";
  const showOtherField = formData.whatDoYouNeed === "other";
  const showWindDownOther = formData.windDownSituation === "other";

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request services for liquidation and wind-down. This form does not cover ongoing
          corporate administration (CSP) or company structure changes.
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
              { value: "mvl", label: "Members' Voluntary Liquidation (MVL)" },
              { value: "cvl", label: "Creditors' Voluntary Liquidation (CVL)" },
              { value: "strike_off", label: "Company strike-off (dormant or inactive company)" },
              { value: "wind_down", label: "Wind-down planning / advice" },
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

      {/* Conditional Fields - MVL/CVL */}
      {showMVLCVLFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Is the company solvent? */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Is the company solvent?
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
                    name="isCompanySolvent"
                    value={option.value}
                    checked={formData.isCompanySolvent === option.value}
                    onChange={(e) => handleChange("isCompanySolvent", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Estimated timeline */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Estimated timeline</label>
            <div className="flex gap-4">
              {[
                { value: "asap", label: "ASAP" },
                { value: "flexible", label: "Flexible" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="liquidationTimeline"
                    value={option.value}
                    checked={formData.liquidationTimeline === option.value}
                    onChange={(e) => handleChange("liquidationTimeline", e.target.value as any)}
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
              value={formData.liquidationClarification || ""}
              onChange={(e) => handleChange("liquidationClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Strike-off */}
      {showStrikeOffFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Is the company currently trading? */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Is the company currently trading?
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
                    name="isCompanyTrading"
                    value={option.value}
                    checked={formData.isCompanyTrading === option.value}
                    onChange={(e) => handleChange("isCompanyTrading", e.target.value as any)}
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
              value={formData.strikeOffClarification || ""}
              onChange={(e) => handleChange("strikeOffClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Wind-down planning */}
      {showWindDownFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* What best describes your situation? */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              What best describes your situation?
            </label>
            <div className="space-y-2">
              {[
                { value: "no_longer_operating", label: "Company no longer operating" },
                { value: "restructuring", label: "Business restructuring" },
                { value: "planned_exit", label: "Planned exit" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="windDownSituation"
                    value={option.value}
                    checked={formData.windDownSituation === option.value}
                    onChange={(e) => handleChange("windDownSituation", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* If Other */}
          {showWindDownOther && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Other → Please specify
              </label>
              <Input
                type="text"
                value={formData.windDownOtherSpecify || ""}
                onChange={(e) => handleChange("windDownOtherSpecify", e.target.value)}
                placeholder="Please specify"
                className="w-full"
              />
            </div>
          )}

          {/* Optional clarification */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional clarification</label>
            <Textarea
              value={formData.windDownClarification || ""}
              onChange={(e) => handleChange("windDownClarification", e.target.value)}
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
          Additional details related to the liquidation or wind-down. You may include background
          information, known deadlines, creditor considerations, or prior advice received.
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

