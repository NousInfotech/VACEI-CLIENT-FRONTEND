"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface OneOffFormData {
  description: string;
  deadline?: string;
  additionalContext?: string;
  uploadedFiles: File[];
}

interface OneOffRequestFormProps {
  formData: OneOffFormData;
  onChange: (data: OneOffFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function OneOffRequestForm({
  formData,
  onChange,
  onFileChange,
}: OneOffRequestFormProps) {
  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Capture requests that do not fall under standard bookkeeping, VAT, payroll, audit, legal, or corporate services.
          This form is intentionally flexible and descriptive.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Briefly describe what you need <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Please describe the nature of the request, what you are trying to achieve, and any relevant background.
          </p>
          <Textarea
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full"
            placeholder="Describe your request..."
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Optional fields</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Is there a deadline?
          </label>
          <Input
            type="date"
            value={formData.deadline || ""}
            onChange={(e) => onChange({ ...formData, deadline: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Any additional context or constraints?
          </label>
          <Textarea
            value={formData.additionalContext || ""}
            onChange={(e) => onChange({ ...formData, additionalContext: e.target.value })}
            rows={4}
            className="w-full"
            placeholder="Enter any additional context or constraints..."
          />
        </div>
      </div>
    </div>
  );
}

