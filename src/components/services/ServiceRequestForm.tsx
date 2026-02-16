"use client";

import { useEffect, useState } from "react";
import DynamicServiceRequestForm from "./DynamicServiceRequestForm";
import {
  getActiveServiceTemplate,
} from "@/api/serviceRequestTemplateService";
import {
  createDraft,
  updateDraft,
  submitRequest,
  listServiceRequests,
} from "@/api/serviceRequestService";
import { FormField } from "@/types/serviceTemplate";
import { Button } from "@/components/ui/button";
import ServiceFormSkeleton from "./ServiceFormSkeleton";
import { Save, Send, AlertCircle, FileUp } from "lucide-react";
import { toast } from "sonner";
import { FileUploader } from "./FileUploader";

interface Props {
  service: string;
  customServiceId?: string;
  companyId: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess?: () => void;
  onDraftSave?: () => void;
}

export default function ServiceRequestForm({
  service,
  customServiceId,
  companyId,
  onDirtyChange,
  onSuccess,
  onDraftSave,
}: Props) {
  const [requestId, setRequestId] = useState<string | null>(null);
  
  // Templates
  const [serviceFields, setServiceFields] = useState<FormField[]>([]);
  
  // Values
  const [serviceValues, setServiceValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<{ id: string, file_name: string, url: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync dirty state with parent
  useEffect(() => {
    onDirtyChange?.(isDirty || files.length > 0);
  }, [isDirty, files.length, onDirtyChange]);

  // Load templates and check for existing drafts
  useEffect(() => {
    const initForm = async () => {
      if (!companyId) return;
      try {
        setLoading(true);
        
        // Parallel fetching of SPECIFIC template and existing drafts
        const [specRes, listRes] = await Promise.all([
          getActiveServiceTemplate(service, customServiceId),
          listServiceRequests({
            companyId,
            service,
            customServiceCycleId: customServiceId,
            status: "DRAFT",
            limit: 1,
          })
        ]);

        setServiceFields(specRes?.data?.formFields || []);

        if (listRes?.data?.length > 0) {
          const draft = listRes.data[0];
          setRequestId(draft.id);

          const sValues: Record<string, any> = {};
          draft.serviceDetails?.forEach((d: any) => {
            sValues[d.question] = d.answer;
          });

          setServiceValues(sValues);
          setExistingFiles(draft.submittedDocuments || []);
          toast.success("Existing draft loaded", {
            description: "You can continue where you left off.",
          });
        } else {
          setRequestId(null);
          setServiceValues({});
          setExistingFiles([]);
        }
        setErrors({});
        setIsDirty(false);
        setFiles([]);
      } catch (err) {
        console.error("Initialization failed:", err);
        toast.error("Failed to load form. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [service, customServiceId, companyId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    serviceFields.forEach((field) => {
      if (field.required) {
        const value = serviceValues[field.question];
        const isEmpty = 
          value === undefined || 
          value === null || 
          value === "" || 
          (Array.isArray(value) && value.length === 0);
        
        if (isEmpty) {
          newErrors[field.question] = "This field is required";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!companyId) return;
    try {
      setSubmitting(true);
      const payload = {
        generalDetails: [], 
        serviceDetails: Object.entries(serviceValues).map(([question, answer]) => ({
          question,
          answer,
        })),
        companyId,
        service,
        customServiceCycleId: customServiceId 
      };

      let response;
      if (requestId) {
        response = await updateDraft(requestId, payload, files);
      } else {
        response = await createDraft(payload, files);
        setRequestId(response.data.id);
      }
      
      // Update existing files from response to keep UI in sync
      if (response?.data?.submittedDocuments) {
        setExistingFiles(response.data.submittedDocuments);
      }

      setIsDirty(false);
      setFiles([]); 
      
      onDraftSave?.();
      toast.success("Draft saved successfully");
    } catch (err) {
      console.error("Save draft failed:", err);
      toast.error("Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!companyId) return;

    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setSubmitting(true);
      let rid = requestId;

      const payload = {
        generalDetails: [], // No longer using general fields
        serviceDetails: Object.entries(serviceValues).map(([question, answer]) => ({
          question,
          answer,
        })),
      };

      if (!rid) {
        const newDraft = await createDraft({ 
          companyId, 
          service, 
          customServiceCycleId: customServiceId 
        });
        rid = newDraft.data.id;
        setRequestId(rid);
      }

      await submitRequest(rid!, payload, files);
      setIsDirty(false);
      setFiles([]);
      setExistingFiles([]);
      onSuccess?.();
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500">
      {/* SERVICE DETAILS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            {service.replace(/_/g, ' ')} Details
          </h3>
        </div>

        <DynamicServiceRequestForm
          fields={serviceFields}
          values={serviceValues}
          errors={errors}
          onChange={(key, value) => {
            setServiceValues((prev) => ({
              ...prev,
              [key]: value,
            }));
            
            // Clear error when user interacts
            if (errors[key]) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
              });
            }
            
            setIsDirty(true);
          }}
        />
      </section>

      {/* DOCUMENT UPLOAD */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Supporting Documents
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <FileUp className="h-3.5 w-3.5" />
            Max 10 files
          </div>
        </div>
        
        <FileUploader 
          files={files} 
          onFilesChange={setFiles}
          existingFiles={existingFiles}
        />
      </section>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between pt-8 border-t">
        <p className="text-sm text-gray-500 italic">
          {isDirty || files.length > 0 ? "● Unsaved changes" : "✓ All changes saved"}
        </p>
        <div className="flex gap-4">
          {(isDirty || files.length > 0) && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="h-11 px-6 gap-2 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-primary transition-all shadow-sm animate-in fade-in slide-in-from-right-2 duration-300"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Saving..." : "Save Draft"}
            </Button>
          )}
          <Button
            className="h-11 px-8 gap-2 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
