"use client";

import { useEffect, useState } from "react";
import DynamicServiceRequestForm from "./DynamicServiceRequestForm";
import {
  getActiveGeneralTemplate,
  getActiveServiceTemplate,
} from "@/api/serviceRequestTemplateService";
import { FormField } from "@/types/serviceTemplate";
import { Button } from "@/components/ui/button";

interface Props {
  service: string;
}

export default function ServiceRequestForm({ service }: Props) {
  const [generalFields, setGeneralFields] = useState<FormField[]>([]);
  const [serviceFields, setServiceFields] = useState<FormField[]>([]);

  const [generalValues, setGeneralValues] = useState<Record<string, any>>({});
  const [serviceValues, setServiceValues] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);

        const [generalRes, serviceRes] = await Promise.all([
          getActiveGeneralTemplate(),
          getActiveServiceTemplate(service),
        ]);

        setGeneralFields(generalRes?.data?.formFields || []);
        setServiceFields(serviceRes?.data?.formFields || []);
      } catch (err) {
        console.error("Template load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [service]);

  const handleSubmit = () => {
    const payload = {
      service,
      generalDetails: Object.entries(generalValues).map(
        ([question, answer]) => ({
          question,
          answer,
        })
      ),
      serviceDetails: Object.entries(serviceValues).map(
        ([question, answer]) => ({
          question,
          answer,
        })
      ),
    };

    console.log("SERVICE REQUEST:", payload);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading form…</p>;
  }

  return (
    <div className="w-full space-y-12">
      {/* GENERAL */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
          General Details
        </h3>

        <DynamicServiceRequestForm
          fields={generalFields}
          values={generalValues}
          onChange={(key, value) =>
            setGeneralValues((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
        />
      </section>

      {/* SERVICE */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
          {service} Details
        </h3>

        <DynamicServiceRequestForm
          fields={serviceFields}
          values={serviceValues}
          onChange={(key, value) =>
            setServiceValues((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
        />
      </section>

      {/* ACTION */}
      <div className="flex justify-end pt-8 border-t">
        <Button className="px-6" onClick={handleSubmit}>
          Submit Request
        </Button>
      </div>
    </div>
  );
}
