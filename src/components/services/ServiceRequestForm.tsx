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
import { Save, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  service: string;
  companyId: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess?: () => void;
  onDraftSave?: () => void;
}

export default function ServiceRequestForm({
  service,
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync dirty state with parent
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Load templates and check for existing drafts
  useEffect(() => {
    const initForm = async () => {
      if (!companyId) return;
      try {
        setLoading(true);
        
        // Parallel fetching of SPECIFIC template and existing drafts
        const [specRes, listRes] = await Promise.all([
          getActiveServiceTemplate(service),
          listServiceRequests({
            companyId,
            service,
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
          toast.success("Existing draft loaded", {
            description: "You can continue where you left off.",
          });
        } else {
          setRequestId(null);
          setServiceValues({});
        }
        setErrors({});
        setIsDirty(false);
      } catch (err) {
        console.error("Initialization failed:", err);
        toast.error("Failed to load form. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initForm();
  }, [service, companyId]);

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
        generalDetails: [], // No longer using general fields
        serviceDetails: Object.entries(serviceValues).map(([question, answer]) => ({
          question,
          answer,
        })),
      };

      if (requestId) {
        await updateDraft(requestId, payload);
      } else {
        const newDraft = await createDraft({ companyId, service });
        setRequestId(newDraft.data.id);
        await updateDraft(newDraft.data.id, payload);
      }
      
      setIsDirty(false);
      onDraftSave?.();
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
        const newDraft = await createDraft({ companyId, service });
        rid = newDraft.data.id;
        setRequestId(rid);
      }

      await submitRequest(rid!, payload);
      setIsDirty(false);
      onSuccess?.();
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-gray-50/50">
        <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-600">
          Please select a company in the sidebar to proceed.
        </p>
      </div>
    );
  }

  if (loading) {
    return <ServiceFormSkeleton />;
  }

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

      {/* ACTION BAR */}
      <div className="flex items-center justify-between pt-8 border-t">
        <p className="text-sm text-gray-500 italic">
          {isDirty ? "● Unsaved changes" : "✓ All changes saved"}
        </p>
        <div className="flex gap-4">
          {isDirty && (
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
