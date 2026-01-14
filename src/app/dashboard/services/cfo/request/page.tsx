"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SERVICE_OPTIONS = [
  "Monthly CFO support",
  "Management accounts",
  "Cash flow forecasting",
  "Budgeting & planning",
  "Financial review",
  "Other",
];

export default function RequestCfoService() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    serviceNeeded: "",
    mainConcern: "",
    timeHorizon: "",
  });

  // SUBMIT HANDLER
  const handleSubmit = () => {
    const isRecurring =
      form.serviceNeeded === "Monthly CFO support";

    const finalData = {
      service: "cfo",
      company_id: "COMPANY_001",
      status: "active",
      type: isRecurring ? "recurring" : "project",
      review_frequency: isRecurring ? "monthly" : null,
      next_review_date: isRecurring ? "2025-08-20" : null,
      request_details: {
        service_needed: form.serviceNeeded,
        main_concern: form.mainConcern,
        time_horizon: form.timeHorizon,
      },
      insights: [],
      deliverables: [],
      projects: isRecurring
        ? []
        : [
            {
              name: form.serviceNeeded,
              status: "In progress",
              billing: "per project",
            },
          ],
    };

    console.log("✅ CFO REQUEST SUBMITTED:", finalData);
    // alert("CFO request submitted. Check console.");
  };

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/services/cfo">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Request CFO Services
            </h1>
            <p className="text-sm text-gray-500">
              Step {step} of 2
            </p>
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              What do you need?
            </h2>

            <div className="space-y-3">
              {SERVICE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer
                  ${
                    form.serviceNeeded === option
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    checked={form.serviceNeeded === option}
                    onChange={() =>
                      setForm({ ...form, serviceNeeded: option })
                    }
                  />
                  <span className="text-sm font-medium">
                    {option}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                disabled={!form.serviceNeeded}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Priority & context
            </h2>

            {/* Main concern */}
            <div>
              <label className="text-sm font-medium">
                Main concern
              </label>
              <textarea
                className="w-full border rounded-lg p-3 mt-1 text-sm"
                placeholder="Describe your concern"
                value={form.mainConcern}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mainConcern: e.target.value,
                  })
                }
              />
            </div>

            {/* Time horizon */}
            <div>
              <label className="text-sm font-medium">
                Time horizon
              </label>
              <div className="mt-2 space-y-2">
                {["Immediate", "Next 3 months", "Strategic"].map(
                  (t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        checked={form.timeHorizon === t}
                        onChange={() =>
                          setForm({
                            ...form,
                            timeHorizon: t,
                          })
                        }
                      />
                      <span className="text-sm">{t}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>

              <Button
                disabled={
                  !form.mainConcern || !form.timeHorizon
                }
                onClick={handleSubmit}
              >
                Submit request
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
