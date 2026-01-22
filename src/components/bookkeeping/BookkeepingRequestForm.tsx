"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, FileText } from "lucide-react";

interface BookkeepingRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: BookkeepingFormData) => void;
}

export interface BookkeepingFormData {
  whatDoYouNeed: "start" | "catchup" | "review" | "monthly" | "other" | "";
  otherSpecify?: string;
  periodType?: "month" | "quarter";
  periodValue?: string; // Month or quarter value
  missingDocuments?: "yes" | "no" | "not_sure";
  additionalDetails?: string;
  uploadedFiles: File[];
}

export default function BookkeepingRequestForm({
  isOpen,
  onClose,
  onSubmit,
}: BookkeepingRequestFormProps) {
  const [formData, setFormData] = useState<BookkeepingFormData>({
    whatDoYouNeed: "",
    otherSpecify: "",
    periodType: "month",
    periodValue: "",
    missingDocuments: undefined,
    additionalDetails: "",
    uploadedFiles: [],
  });

  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const [companyName, setCompanyName] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("");

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
            setCompanyName(activeCompany.name || "");
            setJurisdiction(activeCompany.jurisdiction || activeCompany.country || "");
          }
        } catch (e) {
          console.error("Error parsing company data:", e);
        }
      }
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        whatDoYouNeed: "",
        otherSpecify: "",
        periodType: "month",
        periodValue: "",
        missingDocuments: undefined,
        additionalDetails: "",
        uploadedFiles: [],
      });
      setSelectedYear(new Date().getFullYear().toString());
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.whatDoYouNeed) {
      alert("Please select what you need.");
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const showPeriodFields =
    formData.whatDoYouNeed === "catchup" ||
    formData.whatDoYouNeed === "review" ||
    formData.whatDoYouNeed === "monthly";

  const showOtherField = formData.whatDoYouNeed === "other";

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => (currentYear - i).toString());

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(parseInt(selectedYear), i, 1);
    return date.toLocaleString("default", { month: "long" });
  });

  // Generate quarter options
  const quarterOptions = ["Q1", "Q2", "Q3", "Q4"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Larger size for form */}
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-semibold text-brand-body">BOOKKEEPING — REQUEST FORM</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-brand-body transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Purpose Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
          <p className="text-sm text-gray-600">
            Request bookkeeping services to start, extend, review, or correct accounting records.
            This form is used when the selected service is Bookkeeping.
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
                { value: "start", label: "Start bookkeeping" },
                { value: "catchup", label: "Catch-up / backlog" },
                { value: "review", label: "Review / corrections" },
                { value: "monthly", label: "Monthly extension" },
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
                      setFormData({ ...formData, whatDoYouNeed: e.target.value as any })
                    }
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* If Other - Please specify */}
          {showOtherField && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Other → Please specify
              </label>
              <Input
                type="text"
                value={formData.otherSpecify || ""}
                onChange={(e) =>
                  setFormData({ ...formData, otherSpecify: e.target.value })
                }
                placeholder="Please specify"
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Optional Conditional Fields */}
        {showPeriodFields && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Optional (conditional fields)
            </h3>

            {/* Which periods are affected? */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Which periods are affected?
              </label>

              {/* Period type */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Period type</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodType"
                      value="month"
                      checked={formData.periodType === "month"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          periodType: e.target.value as "month" | "quarter",
                          periodValue: "",
                        })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">Month</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="periodType"
                      value="quarter"
                      checked={formData.periodType === "quarter"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          periodType: e.target.value as "month" | "quarter",
                          periodValue: "",
                        })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">Quarter</span>
                  </label>
                </div>
              </div>

              {/* Year selector */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setFormData({ ...formData, periodValue: "" });
                  }}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period selector */}
              <div className="space-y-2">
                <label className="text-xs text-gray-600">Period selector</label>
                <select
                  value={formData.periodValue || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, periodValue: e.target.value })
                  }
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select {formData.periodType === "month" ? "month" : "quarter"}</option>
                  {formData.periodType === "month"
                    ? monthOptions.map((month, idx) => (
                        <option key={idx} value={`${month} ${selectedYear}`}>
                          {month} {selectedYear}
                        </option>
                      ))
                    : quarterOptions.map((quarter) => (
                        <option key={quarter} value={`${quarter} ${selectedYear}`}>
                          {quarter} {selectedYear}
                        </option>
                      ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Do you have missing documents? */}
        <div className="space-y-3 border-t pt-4">
          <label className="text-sm font-medium text-gray-700">
            Do you have missing documents?
          </label>
          <div className="space-y-2">
            {[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not_sure", label: "Not sure" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="missingDocuments"
                  value={option.value}
                  checked={formData.missingDocuments === option.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      missingDocuments: e.target.value as any,
                    })
                  }
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Auto-filled (read-only) */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Auto-filled (read-only)
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">Company name</label>
              <Input
                type="text"
                value={companyName}
                readOnly
                className="w-full bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Jurisdiction</label>
              <Input
                type="text"
                value={jurisdiction}
                readOnly
                className="w-full bg-gray-50 cursor-not-allowed"
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
            Additional details related to bookkeeping. You may briefly explain the situation,
            volume of transactions, or any known issues.
          </p>
          <textarea
            value={formData.additionalDetails || ""}
            onChange={(e) =>
              setFormData({ ...formData, additionalDetails: e.target.value })
            }
            rows={4}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Enter additional details..."
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2 border-t pt-4">
          <label className="text-sm font-medium text-gray-700">
            Upload documents
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

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-brand-primary hover:bg-brand-active text-white">
            Submit Request
          </Button>
        </div>
          </form>
        </div>
      </div>
    </div>
  );
}

