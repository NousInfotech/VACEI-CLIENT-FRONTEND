"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, FileText } from "lucide-react";

interface VATRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: VATFormData) => void;
}

export interface VATFormData {
  typeOfVATService: "return" | "review" | "correction" | "registration" | "deregistration" | "other" | "";
  otherSpecify?: string;
  correctionPeriod?: string; // For VAT correction
  reviewReason?: "cross_border" | "unusual_amounts" | "audit_prep" | "other";
  reviewOtherSpecify?: string; // If review reason is "other"
  registrationEffectiveDate?: string; // For VAT registration
  additionalDetails?: string;
  uploadedFiles: File[];
}

export default function VATRequestForm({
  isOpen,
  onClose,
  onSubmit,
}: VATRequestFormProps) {
  const [formData, setFormData] = useState<VATFormData>({
    typeOfVATService: "",
    otherSpecify: "",
    correctionPeriod: "",
    reviewReason: undefined,
    reviewOtherSpecify: "",
    registrationEffectiveDate: "",
    additionalDetails: "",
    uploadedFiles: [],
  });

  const [vatNumber, setVatNumber] = useState<string>("");
  const [countryJurisdiction, setCountryJurisdiction] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [correctionPeriodType, setCorrectionPeriodType] = useState<"month" | "quarter">("quarter");

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
            setVatNumber(activeCompany.vatNumber || activeCompany.vat_number || "");
            setCountryJurisdiction(activeCompany.jurisdiction || activeCompany.country || "");
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
        typeOfVATService: "",
        otherSpecify: "",
        correctionPeriod: "",
        reviewReason: undefined,
        reviewOtherSpecify: "",
        registrationEffectiveDate: "",
        additionalDetails: "",
        uploadedFiles: [],
      });
      setSelectedYear(new Date().getFullYear().toString());
      setCorrectionPeriodType("quarter");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.typeOfVATService) {
      alert("Please select a type of VAT service.");
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

  const showOtherField = formData.typeOfVATService === "other";
  const showCorrectionFields = formData.typeOfVATService === "correction";
  const showReviewFields = formData.typeOfVATService === "review";
  const showRegistrationFields = formData.typeOfVATService === "registration";

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
          <h2 className="text-xl font-semibold text-brand-body">VAT / TAX — REQUEST FORM</h2>
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
                Request VAT or tax-related services including filings, reviews, corrections, and registrations.
                This form is used when the selected service is VAT / Tax.
              </p>
            </div>

            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

              {/* Type of VAT service */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Type of VAT service <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { value: "return", label: "VAT return" },
                    { value: "review", label: "VAT review" },
                    { value: "correction", label: "VAT correction" },
                    { value: "registration", label: "VAT registration" },
                    { value: "deregistration", label: "VAT deregistration" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="radio"
                        name="typeOfVATService"
                        value={option.value}
                        checked={formData.typeOfVATService === option.value}
                        onChange={(e) =>
                          setFormData({ ...formData, typeOfVATService: e.target.value as any })
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

            {/* Conditional Fields */}
            {/* If VAT correction */}
            {showCorrectionFields && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    If VAT correction → Which period needs correction?
                  </label>
                  
                  {/* Year selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setFormData({ ...formData, correctionPeriod: "" });
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

                  {/* Period type */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Period type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctionPeriodType"
                          value="month"
                          checked={correctionPeriodType === "month"}
                          onChange={(e) => {
                            setCorrectionPeriodType(e.target.value as "month" | "quarter");
                            setFormData({ ...formData, correctionPeriod: "" });
                          }}
                          className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">Month</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctionPeriodType"
                          value="quarter"
                          checked={correctionPeriodType === "quarter"}
                          onChange={(e) => {
                            setCorrectionPeriodType(e.target.value as "month" | "quarter");
                            setFormData({ ...formData, correctionPeriod: "" });
                          }}
                          className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">Quarter</span>
                      </label>
                    </div>
                  </div>

                  {/* Period selector */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Period selector</label>
                    <select
                      value={formData.correctionPeriod || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, correctionPeriod: e.target.value })
                      }
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select {correctionPeriodType === "month" ? "month" : "quarter"}</option>
                      {correctionPeriodType === "month"
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

            {/* If VAT review */}
            {showReviewFields && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    If VAT review → Reason for review
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "cross_border", label: "Cross-border transactions" },
                      { value: "unusual_amounts", label: "Unusual amounts" },
                      { value: "audit_prep", label: "Audit preparation" },
                      { value: "other", label: "Other" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="radio"
                          name="reviewReason"
                          value={option.value}
                          checked={formData.reviewReason === option.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reviewReason: e.target.value as any,
                              reviewOtherSpecify: "",
                            })
                          }
                          className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* If Other - Please specify */}
                  {formData.reviewReason === "other" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        If Other → Please specify
                      </label>
                      <Input
                        type="text"
                        value={formData.reviewOtherSpecify || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, reviewOtherSpecify: e.target.value })
                        }
                        placeholder="Please specify"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If VAT registration */}
            {showRegistrationFields && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    If VAT registration → Effective date (if known)
                  </label>
                  <Input
                    type="date"
                    value={formData.registrationEffectiveDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationEffectiveDate: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Auto-filled (read-only) */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Auto-filled (read-only)
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600">VAT number (if registered)</label>
                  <Input
                    type="text"
                    value={vatNumber}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed"
                    placeholder="Not registered"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Country / jurisdiction</label>
                  <Input
                    type="text"
                    value={countryJurisdiction}
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
                Additional details related to VAT / tax. You may describe the issue, transaction volume, or any relevant background.
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

