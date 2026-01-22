"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";

export interface CSPFormData {
  whatDoYouNeed:
    | "formation"
    | "registered_office"
    | "company_secretary"
    | "director_services"
    | "ongoing_csp"
    | "other"
    | "";
  otherSpecify?: string;
  // Company formation fields
  formationCountry?: string;
  formationTimeline?: "asap" | "flexible";
  formationClarification?: string;
  // Registered office services fields
  registeredOfficeType?: "setup" | "change" | "renewal";
  registeredOfficeClarification?: string;
  // Company secretary services fields
  secretaryType?: "appointment" | "renewal" | "change";
  secretaryClarification?: string;
  // Director services fields
  directorRequestType?: "natural" | "corporate" | "nominee";
  directorNature?: "appointment" | "renewal";
  directorClarification?: string;
  // Ongoing CSP fields
  cspScope?: string[]; // Statutory registers, Annual return, UBO, Substance support
  cspClarification?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface CSPRequestFormProps {
  formData: CSPFormData;
  onChange: (data: CSPFormData) => void;
}

export default function CSPRequestForm({ formData, onChange }: CSPRequestFormProps) {
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
  }, []);

  const handleChange = (field: keyof CSPFormData, value: any) => {
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

  const handleCheckboxChange = (value: string) => {
    const current = formData.cspScope || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleChange("cspScope", updated);
  };

  const showFormationFields = formData.whatDoYouNeed === "formation";
  const showRegisteredOfficeFields = formData.whatDoYouNeed === "registered_office";
  const showSecretaryFields = formData.whatDoYouNeed === "company_secretary";
  const showDirectorFields = formData.whatDoYouNeed === "director_services";
  const showCSPFields = formData.whatDoYouNeed === "ongoing_csp";
  const showOtherField = formData.whatDoYouNeed === "other";

  // Countries list (simplified - you can expand this)
  const countries = [
    "Malta",
    "United Kingdom",
    "Cyprus",
    "Ireland",
    "Luxembourg",
    "Netherlands",
    "Other",
  ];

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          Request corporate and CSP services. This form does not cover company structure changes
          (e.g. share transfers, director/shareholder changes) or liquidation.
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
              { value: "formation", label: "Company formation" },
              { value: "registered_office", label: "Registered office services" },
              { value: "company_secretary", label: "Company secretary services" },
              { value: "director_services", label: "Director services" },
              { value: "ongoing_csp", label: "Ongoing corporate administration (CSP)" },
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

      {/* Conditional Fields - Company formation */}
      {showFormationFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Country of incorporation */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Country of incorporation
            </label>
            <select
              value={formData.formationCountry || ""}
              onChange={(e) => handleChange("formationCountry", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
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
                    name="formationTimeline"
                    value={option.value}
                    checked={formData.formationTimeline === option.value}
                    onChange={(e) => handleChange("formationTimeline", e.target.value as any)}
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
              value={formData.formationClarification || ""}
              onChange={(e) => handleChange("formationClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Registered office services */}
      {showRegisteredOfficeFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of request */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type of request</label>
            <div className="space-y-2">
              {[
                { value: "setup", label: "Set up registered office" },
                { value: "change", label: "Change registered office" },
                { value: "renewal", label: "Annual renewal" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="registeredOfficeType"
                    value={option.value}
                    checked={formData.registeredOfficeType === option.value}
                    onChange={(e) => handleChange("registeredOfficeType", e.target.value as any)}
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
              value={formData.registeredOfficeClarification || ""}
              onChange={(e) => handleChange("registeredOfficeClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Company secretary services */}
      {showSecretaryFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of request */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type of request</label>
            <div className="space-y-2">
              {[
                { value: "appointment", label: "Appointment" },
                { value: "renewal", label: "Annual renewal" },
                { value: "change", label: "Change of secretary" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="secretaryType"
                    value={option.value}
                    checked={formData.secretaryType === option.value}
                    onChange={(e) => handleChange("secretaryType", e.target.value as any)}
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
              value={formData.secretaryClarification || ""}
              onChange={(e) => handleChange("secretaryClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Director services */}
      {showDirectorFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Type of request */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type of request</label>
            <div className="space-y-2">
              {[
                { value: "natural", label: "Natural person director" },
                { value: "corporate", label: "Corporate director" },
                { value: "nominee", label: "Nominee director" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="radio"
                    name="directorRequestType"
                    value={option.value}
                    checked={formData.directorRequestType === option.value}
                    onChange={(e) => handleChange("directorRequestType", e.target.value as any)}
                    className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nature of request */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Nature of request</label>
            <div className="flex gap-4">
              {[
                { value: "appointment", label: "Appointment" },
                { value: "renewal", label: "Annual renewal" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="directorNature"
                    value={option.value}
                    checked={formData.directorNature === option.value}
                    onChange={(e) => handleChange("directorNature", e.target.value as any)}
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
              value={formData.directorClarification || ""}
              onChange={(e) => handleChange("directorClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Conditional Fields - Ongoing CSP */}
      {showCSPFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>

          {/* Scope requested */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Scope requested (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                { value: "statutory_registers", label: "Statutory registers maintenance" },
                { value: "annual_return", label: "Annual return and MBR filings" },
                { value: "ubo_maintenance", label: "Beneficial ownership (UBO) maintenance" },
                { value: "substance_support", label: "Substance and compliance support" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.cspScope?.includes(option.value) || false}
                    onChange={() => handleCheckboxChange(option.value)}
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
              value={formData.cspClarification || ""}
              onChange={(e) => handleChange("cspClarification", e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Enter clarification..."
            />
          </div>
        </div>
      )}

      {/* Auto-filled (read-only) */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900">Auto-filled (read-only)</h3>
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
          Additional details related to the corporate request. You may include background
          information, urgency, or any specific requirements.
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

