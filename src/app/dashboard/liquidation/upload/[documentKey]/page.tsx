"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

// Document key to label mapping
const documentLabels: Record<string, string> = {
  "board-resolutions": "Board resolutions",
  "shareholder-resolutions": "Shareholder resolutions",
  "liquidator-appointment": "Liquidator appointment",
  "final-accounts": "Final accounts",
  "filing-confirmations": "Filing confirmations",
};

export default function LiquidationUploadPage() {
  const params = useParams();
  const router = useRouter();
  const documentKey = params.documentKey as string;
  const documentName = documentLabels[documentKey] || documentKey;

  const [needType, setNeedType] = useState<string>("");
  const [otherSpecify, setOtherSpecify] = useState("");
  const [isSolvent, setIsSolvent] = useState<string>("");
  const [estimatedTimeline, setEstimatedTimeline] = useState<string>("");
  const [isTrading, setIsTrading] = useState<string>("");
  const [windDownSituation, setWindDownSituation] = useState<string>("");
  const [windDownOtherSpecify, setWindDownOtherSpecify] = useState("");
  const [optionalClarification, setOptionalClarification] = useState("");
  const [conditionalClarification, setConditionalClarification] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState<string>("Your Company");
  const [jurisdiction, setJurisdiction] = useState<string>("Malta");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const companyId = typeof window !== "undefined" ? localStorage.getItem("vacei-active-company") || "" : "";
    const storedCompanies = typeof window !== "undefined" ? localStorage.getItem("vacei-companies") : null;

    if (companyId && storedCompanies) {
      try {
        const companies = JSON.parse(storedCompanies);
        const found = companies.find((c: any) => c.id === companyId || c._id === companyId);
        if (found) setCompanyName(found.name);
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Handle form submission here
      const formData = {
        needType,
        otherSpecify,
        isSolvent,
        estimatedTimeline,
        isTrading,
        windDownSituation,
        windDownOtherSpecify,
        optionalClarification,
        conditionalClarification,
        file: selectedFile,
        companyName,
        jurisdiction,
        documentKey,
        documentName,
      };
      
      console.log("Form submitted:", formData);
      
      // TODO: Upload file and submit form data to backend
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to upload another document (show list of documents)
      // Pass the document key as query parameter to update status
      router.push(`/dashboard/liquidation?uploaded=${documentKey}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showMVLCVLConditional = needType === "MVL" || needType === "CVL";
  const showStrikeOffConditional = needType === "Strike-off";
  const showWindDownConditional = needType === "Wind-down";

  return (
    <section className="flex flex-col gap-6 px-4 py-4 md:px-6 md:py-6 pt-2 md:pt-4">
      <PageHeader
        title={`Upload: ${documentName}`}
        subtitle="LIQUIDATION & WIND-DOWN — REQUEST FORM"
        description="This form does not cover ongoing corporate administration (CSP) or company structure changes."
        actions={
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/liquidation")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        }
      />

      <div className="max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg border border-gray-200 p-6 md:p-8">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Required fields</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you need? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {["MVL", "CVL", "Strike-off", "Wind-down", "Other"].map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="needType"
                      value={option}
                      checked={needType === option}
                      onChange={(e) => setNeedType(e.target.value)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      {option === "MVL" && "Members' Voluntary Liquidation (MVL)"}
                      {option === "CVL" && "Creditors' Voluntary Liquidation (CVL)"}
                      {option === "Strike-off" && "Company strike-off (dormant or inactive company)"}
                      {option === "Wind-down" && "Wind-down planning / advice"}
                      {option === "Other" && "Other"}
                    </span>
                  </label>
                ))}
              </div>
              {needType === "Other" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otherSpecify}
                    onChange={(e) => setOtherSpecify(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required={needType === "Other"}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Conditional Fields */}
          {showMVLCVLConditional && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Conditional fields</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is the company solvent? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isSolvent"
                        value={option}
                        checked={isSolvent === option}
                        onChange={(e) => setIsSolvent(e.target.value)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        required={showMVLCVLConditional}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated timeline <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["ASAP", "Flexible"].map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="estimatedTimeline"
                        value={option}
                        checked={estimatedTimeline === option}
                        onChange={(e) => setEstimatedTimeline(e.target.value)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        required={showMVLCVLConditional}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional clarification
                </label>
                <textarea
                  value={conditionalClarification}
                  onChange={(e) => setConditionalClarification(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Additional details..."
                />
              </div>
            </div>
          )}

          {showStrikeOffConditional && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Conditional fields</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is the company currently trading? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["Yes", "No", "Not sure"].map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isTrading"
                        value={option}
                        checked={isTrading === option}
                        onChange={(e) => setIsTrading(e.target.value)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        required={showStrikeOffConditional}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional clarification
                </label>
                <textarea
                  value={conditionalClarification}
                  onChange={(e) => setConditionalClarification(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Additional details..."
                />
              </div>
            </div>
          )}

          {showWindDownConditional && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Conditional fields</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What best describes your situation? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {["Company no longer operating", "Business restructuring", "Planned exit", "Other"].map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="windDownSituation"
                        value={option}
                        checked={windDownSituation === option}
                        onChange={(e) => setWindDownSituation(e.target.value)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        required={showWindDownConditional}
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {windDownSituation === "Other" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={windDownOtherSpecify}
                    onChange={(e) => setWindDownOtherSpecify(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required={windDownSituation === "Other"}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional clarification
                </label>
                <textarea
                  value={conditionalClarification}
                  onChange={(e) => setConditionalClarification(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Additional details..."
                />
              </div>
            </div>
          )}

          {/* Company Information Fields */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Company Information</h3>
            <p className="text-xs text-gray-500 mb-3">These fields are pre-filled from the General Service Request Form or existing client data, but can be edited if needed.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Optional Clarification */}
          <div className="space-y-4 border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optional clarification (free text)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Additional details related to the liquidation or wind-down
            </p>
            <textarea
              value={optionalClarification}
              onChange={(e) => setOptionalClarification(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="You may include background information, known deadlines, creditor considerations, or prior advice received."
            />
            <p className="text-xs text-gray-500">
              Helper text: You may include background information, known deadlines, creditor considerations, or prior advice received.
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-4 border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-active"
                required
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/liquidation")}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[100px] bg-brand-primary hover:bg-brand-active text-white"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

