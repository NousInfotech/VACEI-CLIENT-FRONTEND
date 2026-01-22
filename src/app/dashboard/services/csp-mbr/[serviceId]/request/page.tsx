"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardCard from "@/components/DashboardCard";
import BackButton from "@/components/shared/BackButton";
import PageHeader from "@/components/shared/PageHeader";
import { AlertModal } from "@/components/ui/modal";
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText,
  X,
  Building2,
  UserCheck,
  Share2,
  FileCheck,
  Shield,
  Briefcase,
  Mail,
  Award,
  Banknote,
  GitBranch,
  Globe,
  Users,
  Home,
  MapPin
} from "lucide-react";
import { getCSPService } from "@/lib/cspStorage";
import type { CSPService } from "@/lib/cspRenewalUtils";

type CSPServiceType = 
  | "registered_office"
  | "company_secretary"
  | "director_services"
  | "nominee_director"
  | "nominee_shareholder"
  | "statutory_registers"
  | "ubo_maintenance"
  | "mbr_filings"
  | "documentation_maintenance"
  | "substance_support"
  | "compliance_oversight"
  | "director_declarations"
  | "mail_handling"
  | "certified_copies"
  | "bank_liaison"
  | "malta_company_formation"
  | "malta_branch_establishment"
  | "company_redomiciliation"
  | "directorship_company_secretarial"
  | "malta_back_office"
  | "family_office_services"
  | "dubai_company_registration";

const getServiceIcon = (serviceType: CSPServiceType) => {
  const iconMap: Record<CSPServiceType, any> = {
    registered_office: Building2,
    company_secretary: FileText,
    director_services: Users,
    nominee_director: UserCheck,
    nominee_shareholder: Share2,
    statutory_registers: FileCheck,
    ubo_maintenance: Shield,
    mbr_filings: FileCheck,
    documentation_maintenance: FileText,
    substance_support: Briefcase,
    compliance_oversight: Shield,
    director_declarations: UserCheck,
    mail_handling: Mail,
    certified_copies: Award,
    bank_liaison: Banknote,
    malta_company_formation: Building2,
    malta_branch_establishment: GitBranch,
    company_redomiciliation: Globe,
    directorship_company_secretarial: Users,
    malta_back_office: Briefcase,
    family_office_services: Home,
    dubai_company_registration: MapPin
  };
  return iconMap[serviceType] || Building2;
};

export default function CSPServiceRequestPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params?.serviceId as string;
  
  const [service, setService] = useState<CSPService | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // Form state
  const [whatDoYouNeed, setWhatDoYouNeed] = useState<"formation" | "registered_office" | "company_secretary" | "director_services" | "ongoing_csp" | "other" | "">("");
  const [otherSpecify, setOtherSpecify] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  
  // Conditional fields
  const [formationCountry, setFormationCountry] = useState("");
  const [formationTimeline, setFormationTimeline] = useState<"asap" | "flexible" | "">("");
  const [formationClarification, setFormationClarification] = useState("");
  
  const [registeredOfficeType, setRegisteredOfficeType] = useState<"setup" | "change" | "renewal" | "">("");
  const [registeredOfficeClarification, setRegisteredOfficeClarification] = useState("");
  
  const [secretaryType, setSecretaryType] = useState<"appointment" | "renewal" | "change" | "">("");
  const [secretaryClarification, setSecretaryClarification] = useState("");
  
  const [directorRequestType, setDirectorRequestType] = useState<"natural" | "corporate" | "nominee" | "">("");
  const [directorNature, setDirectorNature] = useState<"appointment" | "renewal" | "">("");
  const [directorClarification, setDirectorClarification] = useState("");
  
  const [cspScope, setCspScope] = useState<string[]>([]);
  const [cspClarification, setCspClarification] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCompany = localStorage.getItem("vacei-active-company");
      const storedCompanies = localStorage.getItem("vacei-companies");
      
      if (storedCompany) {
        setCompanyId(storedCompany);
        const serviceData = getCSPService(serviceId, storedCompany);
        if (serviceData) {
          setService(serviceData);
        } else {
          // Service not found, redirect back
          router.push("/dashboard/services/csp-mbr");
        }
      }

      // Load company data
      if (storedCompanies) {
        try {
          const companies = JSON.parse(storedCompanies);
          const activeCompany = companies.find(
            (c: any) => c.id === storedCompany || c._id === storedCompany
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
  }, [serviceId, router]);

  if (!service) {
    return (
      <section className="mx-auto max-w-[1000px] w-full pt-5">
        <DashboardCard className="p-12 text-center">
          <p className="text-muted-foreground">Loading service...</p>
        </DashboardCard>
      </section>
    );
  }

  const Icon = getServiceIcon(service.service_type as CSPServiceType);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleCspScopeToggle = (scope: string) => {
    setCspScope((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatDoYouNeed) {
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Validation Error",
        message: "Please select what you need.",
        type: "error"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create service request record
      const requestId = `csp-request-${serviceId}-${Date.now()}`;
      const newRequest = {
        id: requestId,
        serviceId: serviceId,
        serviceName: service.service_name,
        serviceType: service.service_type,
        status: "pending" as const,
        submissionDate: new Date().toISOString(),
        uploadedFiles: uploadedFiles.map(f => f.name),
        notes: notes,
        reference: `CSP-${serviceId.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
        formData: {
          whatDoYouNeed,
          otherSpecify,
          formationCountry,
          formationTimeline,
          formationClarification,
          registeredOfficeType,
          registeredOfficeClarification,
          secretaryType,
          secretaryClarification,
          directorRequestType,
          directorNature,
          directorClarification,
          cspScope,
          cspClarification,
        }
      };

      // Save to localStorage
      const storageKey = `vacei-csp-requests-${companyId}`;
      const existingRequests = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existingRequests.push(newRequest);
      localStorage.setItem(storageKey, JSON.stringify(existingRequests));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAlertModal(true);
      setAlertModalContent({
        title: "Service Request Submitted",
        message: `Your ${service.service_name} request has been submitted successfully. Reference: ${newRequest.reference}`,
        type: "success"
      });
    } catch (error) {
      console.error("Error submitting service request:", error);
      setSubmitting(false);
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Submission Failed",
        message: "Failed to submit service request. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <PageHeader
        title="CORPORATE and CSP SERVICES — REQUEST FORM"
        description="This form does not cover company structure changes (e.g. share transfers, director/shareholder changes) or liquidation."
        icon={Icon}
      />

      {/* Form */}
      <DashboardCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purpose Section */}
          <div className="space-y-2 pb-4 border-b">
            <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
            <p className="text-sm text-gray-600">
              Request corporate and CSP services. This form does not cover company structure changes (e.g. share transfers, director/shareholder changes) or liquidation.
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
                      checked={whatDoYouNeed === option.value}
                      onChange={(e) => setWhatDoYouNeed(e.target.value as any)}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* If Other - Please specify */}
            {whatDoYouNeed === "other" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={otherSpecify}
                  onChange={(e) => setOtherSpecify(e.target.value)}
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Conditional Fields */}
          {/* If Company formation */}
          {whatDoYouNeed === "formation" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    If Company formation → Country of incorporation
                  </label>
                  <select
                    value={formationCountry}
                    onChange={(e) => setFormationCountry(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select country</option>
                    <option value="Malta">Malta</option>
                    <option value="Dubai">Dubai</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estimated timeline</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="formationTimeline"
                        value="asap"
                        checked={formationTimeline === "asap"}
                        onChange={(e) => setFormationTimeline(e.target.value as any)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">ASAP</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="formationTimeline"
                        value="flexible"
                        checked={formationTimeline === "flexible"}
                        onChange={(e) => setFormationTimeline(e.target.value as any)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">Flexible</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Optional clarification</label>
                  <Textarea
                    value={formationClarification}
                    onChange={(e) => setFormationClarification(e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Enter optional clarification..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Registered office services */}
          {whatDoYouNeed === "registered_office" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  If Registered office services → Type of request
                </label>
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
                        checked={registeredOfficeType === option.value}
                        onChange={(e) => setRegisteredOfficeType(e.target.value as any)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Optional clarification</label>
                  <Textarea
                    value={registeredOfficeClarification}
                    onChange={(e) => setRegisteredOfficeClarification(e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Enter optional clarification..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Company secretary services */}
          {whatDoYouNeed === "company_secretary" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  If Company secretary services → Type of request
                </label>
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
                        checked={secretaryType === option.value}
                        onChange={(e) => setSecretaryType(e.target.value as any)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Optional clarification</label>
                  <Textarea
                    value={secretaryClarification}
                    onChange={(e) => setSecretaryClarification(e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Enter optional clarification..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Director services */}
          {whatDoYouNeed === "director_services" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    If Director services → Type of request
                  </label>
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
                          checked={directorRequestType === option.value}
                          onChange={(e) => setDirectorRequestType(e.target.value as any)}
                          className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nature of request</label>
                  <div className="space-y-2">
                    {[
                      { value: "appointment", label: "Appointment" },
                      { value: "renewal", label: "Annual renewal" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="radio"
                          name="directorNature"
                          value={option.value}
                          checked={directorNature === option.value}
                          onChange={(e) => setDirectorNature(e.target.value as any)}
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
                    value={directorClarification}
                    onChange={(e) => setDirectorClarification(e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Enter optional clarification..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Ongoing corporate administration (CSP) */}
          {whatDoYouNeed === "ongoing_csp" && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  If Ongoing corporate administration (CSP) → Scope requested
                </label>
                <p className="text-xs text-gray-500 mb-2">(select all that apply)</p>
                <div className="space-y-2">
                  {[
                    { value: "statutory_registers", label: "Statutory registers maintenance" },
                    { value: "annual_return_mbr", label: "Annual return and MBR filings" },
                    { value: "ubo_maintenance", label: "Beneficial ownership (UBO) maintenance" },
                    { value: "substance_compliance", label: "Substance and compliance support" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={cspScope.includes(option.value)}
                        onChange={() => handleCspScopeToggle(option.value)}
                        className="w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Optional clarification</label>
                  <Textarea
                    value={cspClarification}
                    onChange={(e) => setCspClarification(e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Enter optional clarification..."
                  />
                </div>
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
              Additional details related to the corporate request. You may include background information, urgency, or any specific requirements.
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full"
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
              <Input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </label>

              {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
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
          <div className="flex items-center justify-between pt-4 border-t">
          <Link href="/dashboard/services/csp-mbr">
              <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button
              type="submit"
            variant="default"
            size="sm"
              disabled={submitting}
            className="min-w-[140px]"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Request
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        </form>
      </DashboardCard>

      {/* Alert Modal */}
      {showAlertModal && (
        <AlertModal
          isOpen={showAlertModal}
          onClose={() => {
            setShowAlertModal(false);
            if (alertModalContent.type === "success") {
              router.push("/dashboard/services/csp-mbr");
            }
          }}
          title={alertModalContent.title}
          message={alertModalContent.message}
          type={alertModalContent.type}
        />
      )}
    </section>
  );
}

