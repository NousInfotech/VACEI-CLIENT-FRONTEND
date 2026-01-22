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
  Share2,
  UserCheck,
  TrendingUp,
  Globe,
  Building2,
  CheckCircle2,
  X,
  Users
} from "lucide-react";
import { getCompanyById, type Company, type Shareholder, type RepresentationalSchema } from "@/api/auditService";

type MBRFilingType = "share_transfer" | "director_change" | "share_capital" | "cross_border_merger" | "company_name_change";

interface FilingTypeInfo {
  type: MBRFilingType;
  name: string;
  icon: any;
  description: string;
}

const filingTypeConfigs: Record<MBRFilingType, FilingTypeInfo> = {
  share_transfer: {
    type: "share_transfer",
    name: "Share Transfer",
    icon: Share2,
    description: "Transfer shares between shareholders",
  },
  director_change: {
    type: "director_change",
    name: "Director Change",
    icon: UserCheck,
    description: "Appoint or remove directors",
  },
  share_capital: {
    type: "share_capital",
    name: "Share Capital Increase/Reduction",
    icon: TrendingUp,
    description: "Modify company share capital",
  },
  cross_border_merger: {
    type: "cross_border_merger",
    name: "Cross-Border Merger",
    icon: Globe,
    description: "Merge with another company",
  },
  company_name_change: {
    type: "company_name_change",
    name: "Company Name Change",
    icon: Building2,
    description: "Change your company name",
  }
};

interface PersonOption {
  id: string;
  name: string;
  nationality: string;
  address: string;
  shares?: number;
  sharePercentage?: number;
  shareClass?: string;
  roles?: string[];
}

export default function MBRFilingRequestPage() {
  const router = useRouter();
  const params = useParams();
  const filingType = params?.type as MBRFilingType;
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // Person selection state
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const filingConfig = filingType ? filingTypeConfigs[filingType] : null;
  const Icon = filingConfig?.icon || FileText;
  const showPersonSelection = filingType === "share_transfer" || filingType === "director_change";

  useEffect(() => {
    if (!filingType || !filingTypeConfigs[filingType]) {
      router.push("/dashboard/services/mbr-filing");
    }
  }, [filingType, router]);

  // Load company data and persons
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!showPersonSelection) return;

      setLoadingPersons(true);
      try {
        const companyId = localStorage.getItem("vacei-active-company");
        if (!companyId) {
          setLoadingPersons(false);
          return;
        }

        const companyData = await getCompanyById(companyId);
        setCompany(companyData);

        const personsList: PersonOption[] = [];

        if (filingType === "share_transfer") {
          // Get shareholders
          if (companyData.shareHolders && companyData.shareHolders.length > 0) {
            companyData.shareHolders.forEach((shareholder: Shareholder) => {
              if (shareholder.personId) {
                const totalShares = shareholder.sharesData?.reduce((sum, share) => sum + share.totalShares, 0) || 0;
                personsList.push({
                  id: shareholder.personId.id || shareholder.personId._id,
                  name: shareholder.personId.name,
                  nationality: shareholder.personId.nationality,
                  address: shareholder.personId.address,
                  shares: totalShares,
                  sharePercentage: shareholder.sharePercentage,
                  shareClass: shareholder.sharesData?.[0]?.class || "Ordinary",
                });
              }
            });
          }
        } else if (filingType === "director_change") {
          // Get directors from representationalSchema
          if (companyData.representationalSchema && companyData.representationalSchema.length > 0) {
            companyData.representationalSchema.forEach((rep: RepresentationalSchema) => {
              if (rep.personId && rep.role && rep.role.some(role => role.toLowerCase().includes("director"))) {
                personsList.push({
                  id: rep.personId.id || rep.personId._id,
                  name: rep.personId.name,
                  nationality: rep.personId.nationality,
                  address: rep.personId.address,
                  roles: rep.role,
                });
              }
            });
          }
        }

        setPersons(personsList);
      } catch (error) {
        console.error("Error loading company data:", error);
      } finally {
        setLoadingPersons(false);
      }
    };

    loadCompanyData();
  }, [filingType, showPersonSelection]);

  if (!filingConfig) {
    return null;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handlePersonToggle = (personId: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPersonIds.length === persons.length) {
      setSelectedPersonIds([]);
    } else {
      setSelectedPersonIds(persons.map((p) => p.id));
    }
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Validation Error",
        message: "Please upload at least one file related to this service.",
        type: "error"
      });
      return;
    }

    if (showPersonSelection && selectedPersonIds.length === 0) {
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Validation Error",
        message: `Please select at least one ${filingType === "share_transfer" ? "shareholder" : "director"}.`,
        type: "error"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get company ID
      const companyId = localStorage.getItem("vacei-active-company") || "";
      
      // Create filing record
      const filingId = `mbr-${filingType}-${Date.now()}`;
      const newFiling = {
        id: filingId,
        type: filingType,
        name: filingConfig.name,
        description: filingConfig.description,
        icon: filingConfig.icon,
        status: "in_progress" as const,
        submissionDate: new Date().toISOString(),
        uploadedFiles: uploadedFiles.map(f => f.name),
        notes: notes,
        reference: `MBR-${filingType.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
        selectedPersons: showPersonSelection ? selectedPersonIds.map(id => {
          const person = persons.find(p => p.id === id);
          return person ? {
            id: person.id,
            name: person.name,
            nationality: person.nationality,
            address: person.address,
            ...(filingType === "share_transfer" && {
              shares: person.shares,
              sharePercentage: person.sharePercentage,
              shareClass: person.shareClass,
            }),
            ...(filingType === "director_change" && {
              roles: person.roles,
            }),
          } : null;
        }).filter(Boolean) : []
      };

      // Save to localStorage
      const storageKey = `vacei-mbr-filings-${companyId}`;
      const existingFilings = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updatedFilings = existingFilings.map((f: any) => 
        f.type === filingType ? newFiling : f
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedFilings));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAlertModal(true);
      setAlertModalContent({
        title: "Filing Submitted",
        message: `Your ${filingConfig.name} request has been submitted successfully. Reference: ${newFiling.reference}`,
        type: "success"
      });
    } catch (error) {
      console.error("Error submitting filing:", error);
      setSubmitting(false);
      setShowAlertModal(true);
      setAlertModalContent({
        title: "Submission Failed",
        message: "Failed to submit filing. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] w-full pt-5 space-y-6">
      <BackButton />
      
      {/* Page Header */}
      <PageHeader
        title={filingConfig.name}
        description={filingConfig.description}
        icon={Icon}
      />

      {/* Form */}
      <DashboardCard className="p-6">
        <h2 className="text-xl font-semibold text-brand-body mb-6">Request Service</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {/* Select Persons Section - Only for Share Transfer and Director Change */}
          {showPersonSelection && (
            <div className="space-y-4 border-b pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-brand-body mb-1">
                    Select Persons ({persons.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filingType === "share_transfer" 
                      ? "Select shareholders involved in this share transfer."
                      : "Select directors involved in this director change."}
                  </p>
                </div>
                {persons.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    {selectedPersonIds.length === persons.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>

              {loadingPersons ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading persons...
                </div>
              ) : persons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {filingType === "share_transfer" ? "shareholders" : "directors"} found for this company.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Section Header */}
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-semibold text-brand-body uppercase tracking-wide">
                      {filingType === "share_transfer" ? "Shareholders" : "Directors"}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-xs h-7"
                    >
                      Select All
                    </Button>
                  </div>

                  {/* Persons List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto border border-border rounded-lg p-3 bg-muted/20">
                    {persons.map((person) => {
                      // Calculate total shares for display
                      const totalShares = filingType === "share_transfer" && person.shares 
                        ? person.shares 
                        : 0;
                      const issuedShares = company?.issuedShares || 0;
                      const sharePercentage = issuedShares > 0 && totalShares > 0
                        ? ((totalShares / issuedShares) * 100).toFixed(2)
                        : person.sharePercentage?.toFixed(2) || "0.00";

                      return (
                        <label
                          key={person.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPersonIds.includes(person.id)}
                            onChange={() => handlePersonToggle(person.id)}
                            className="mt-1 w-4 h-4 text-brand-primary focus:ring-brand-primary rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-brand-body">{person.name}</span>
                            </div>
                            <div className="space-y-0.5 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Nationality:</span> {person.nationality}
                              </div>
                              <div>
                                <span className="font-medium">Address:</span> {person.address}
                              </div>
                              {filingType === "share_transfer" && totalShares > 0 && (
                                <div>
                                  <span className="font-medium">Shares:</span> {totalShares.toLocaleString()} {person.shareClass || "ordinary"} shares
                                  <span className="ml-1">({sharePercentage}%)</span>
                                </div>
                              )}
                              {filingType === "director_change" && person.roles && person.roles.length > 0 && (
                                <div>
                                  <span className="font-medium">Roles:</span> {person.roles.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-brand-body mb-2">
              Upload Files <span className="text-destructive">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">Upload files related to this service</p>
              </div>
              <Input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
            </label>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-brand-body truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-medium text-brand-body mb-2">
              Optional Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or context (optional)..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can add any additional information or context if needed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Link href="/dashboard/services/mbr-filing">
              <Button type="button" variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={uploadedFiles.length === 0 || submitting || (showPersonSelection && selectedPersonIds.length === 0)}
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
              router.push("/dashboard/services/mbr-filing");
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

