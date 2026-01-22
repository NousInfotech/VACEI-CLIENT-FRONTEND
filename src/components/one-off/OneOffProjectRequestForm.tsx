"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";

export interface OneOffProjectFormData {
  briefDescription: string;
  deadline?: string;
  additionalContext?: string;
  uploadedFiles: File[];
}

interface OneOffProjectRequestFormProps {
  formData: OneOffProjectFormData;
  onChange: (data: OneOffProjectFormData) => void;
}

export default function OneOffProjectRequestForm({
  formData,
  onChange,
}: OneOffProjectRequestFormProps) {
  const handleChange = (field: keyof OneOffProjectFormData, value: any) => {
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

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          This section appears only when the selected service is One-off / Special Project (or not sure/other).
          Capture requests that do not fall under standard bookkeeping, VAT, payroll, audit, legal, or corporate services.
          This form is intentionally flexible and descriptive.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

        {/* Briefly describe what you need */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Briefly describe what you need <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Please describe the nature of the request, what you are trying to achieve, and any relevant background.
          </p>
          <Textarea
            value={formData.briefDescription}
            onChange={(e) => handleChange("briefDescription", e.target.value)}
            rows={5}
            className="w-full"
            placeholder="Describe your request..."
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Optional fields</h3>

        {/* Is there a deadline? */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Is there a deadline? (optional)
          </label>
          <Input
            type="date"
            value={formData.deadline || ""}
            onChange={(e) => handleChange("deadline", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Any additional context or constraints? */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Any additional context or constraints? (optional)
          </label>
          <Textarea
            value={formData.additionalContext || ""}
            onChange={(e) => handleChange("additionalContext", e.target.value)}
            rows={4}
            className="w-full"
            placeholder="Enter additional context or constraints..."
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Attachments (optional)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Upload any relevant documents that may help us understand the request.
          Examples: draft documents, data extracts, prior correspondence, schedules.
        </p>
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

