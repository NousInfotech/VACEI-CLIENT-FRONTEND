"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as yup from "yup";
import AlertMessage, { AlertVariant } from "@/components/AlertMessage";
import { getUserIdFromLocalStorage } from "@/utils/authUtils";
import MeetingForm from "../components/ScheduleForm";

// Import your API services
import {
  createMeeting,
  fetchMeetingById,
  updateMeeting,
} from "@/api/meetingService";
import { fetchChatUsers } from "@/api/taskService";

// Import interfaces from your common file
import {
  Accountant,
  MeetingDetails,
  ValidationErrors,
  User,
  Meeting,
} from "@/interfaces"; // BaseMeeting is not explicitly used here as commonPayload serves that role

/**
 * Maps Yup validation errors to a flat object.
 */
const mapValidationErrors = (error: yup.ValidationError): ValidationErrors => {
  const newErrors: ValidationErrors = {};
  if (error.inner) {
    error.inner.forEach((err) => {
      if (err.path) {
        newErrors[err.path] = err.message;
      }
    });
  } else if (error.path && error.message) {
    newErrors[error.path] = error.message;
  } else {
    newErrors.general = "An unknown validation error occurred.";
  }

  // Specific handling for end time validation message
  if (newErrors.end && newErrors.end.includes("after start time")) {
    newErrors.timeConflict = newErrors.end;
    delete newErrors.end;
  }
  return newErrors;
};

// Yup schema for meeting validation
const meetingSchema = yup.object().shape({
  title: yup.string().trim().required("Meeting title is required."),
  description: yup
    .string()
    .trim()
    .nullable()
    .transform((value) => value || null),
  accountantId: yup.string().required("Please assign an accountant."),
  start: yup
    .date()
    .nullable()
    .required("Start time is required.")
    .typeError("Invalid start date/time.")
    .test(
      "is-valid-date-obj",
      "Start time is required and must be a valid time.",
      (value): boolean => value instanceof Date && !isNaN(value.getTime())
    ),
  end: yup
    .date()
    .nullable()
    .required("End time is required.")
    .typeError("Invalid end date/time.")
    .test(
      "is-valid-date-obj",
      "End time is required and must be a valid time.",
      (value): boolean => value instanceof Date && !isNaN(value.getTime())
    )
    .when(
      "start",
      (startValue: any, schema: yup.DateSchema): yup.DateSchema => {
        if (startValue instanceof Date && !isNaN(startValue.getTime())) {
          return schema.min(startValue, "End time must be after start time.");
        }
        return schema;
      }
    ),
});

// Initial state for meeting details
const initialMeetingDetails: MeetingDetails = {
  title: "",
  description: "",
  accountantId: "",
  start: null,
  end: null,
  status: 1,
  client: undefined,
  accountant: undefined,
};

function SchedulePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [meetingDetails, setMeetingDetails] =
    useState<MeetingDetails>(initialMeetingDetails);
  const [accountants, setAccountants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<AlertVariant | undefined>(
    undefined
  );

  const clearAlertAndValidationErrors = useCallback(() => {
    setAlertMessage("");
    setValidationErrors({});
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    clearAlertAndValidationErrors();

    try {
     const users: any[] = await fetchChatUsers();
     console.log(users);
      setAccountants(users);

      const meetingIdParam = searchParams.get("meeting");
      const currentClientId = getUserIdFromLocalStorage() || null; // Ensure clientId is always set

      if (meetingIdParam) {
        const fetchedMeeting: Meeting = await fetchMeetingById(meetingIdParam);
        const selectedAccountant = users.find(
          (acc) => String(acc.id) === fetchedMeeting.accountantId
        );

        setMeetingDetails({
          id: fetchedMeeting.id,
          title: fetchedMeeting.title,
          description: fetchedMeeting.description || "",
          clientId: currentClientId,
          accountant: selectedAccountant,
          accountantId: fetchedMeeting.accountantId || "",
          start: fetchedMeeting.start,
          end: fetchedMeeting.end,
          status: fetchedMeeting.status,
          client: undefined, // Or fetch client if needed and implement a fetchUserById
        });
      } else {
        const startParam = searchParams.get("start");
        const endParam = searchParams.get("end");
        const parsedStart = startParam ? new Date(startParam) : null;
        const parsedEnd = endParam ? new Date(endParam) : null;

        setMeetingDetails((prevDetails) => ({
          ...prevDetails,
          clientId: currentClientId,
          start: parsedStart && !isNaN(parsedStart.getTime()) ? parsedStart : null,
          end: parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : null,
          status: 1,
        }));
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load data.";
      setError(errorMessage);
      setAlertMessage(errorMessage);
      setAlertVariant("danger");
      console.error("Failed to load data:", err);
      setMeetingDetails(initialMeetingDetails); // Reset on error
    } finally {
      setLoading(false);
    }
  }, [searchParams, clearAlertAndValidationErrors]);

  // Effect to fetch data on component mount or query param change
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleFormChange = useCallback(
    (
      name: keyof MeetingDetails,
      value: string | Date | number | User | Accountant | null
    ) => {
      clearAlertAndValidationErrors();

      setMeetingDetails((prevDetails) => {
        let updatedDetails = { ...prevDetails };

        if (name === "start" || name === "end") {
          if (typeof value === "string" && value) {
            let baseDate = null;

            // Prioritize the date part from the field being changed
            if (prevDetails[name] instanceof Date && !isNaN(prevDetails[name]!.getTime())) {
              baseDate = new Date(prevDetails[name] as Date);
            } else if (name === "end" && prevDetails.start instanceof Date && !isNaN(prevDetails.start.getTime())) {
              // If 'end' is being set and its date part is missing, try 'start'
              baseDate = new Date(prevDetails.start);
            } else if (name === "start" && prevDetails.end instanceof Date && !isNaN(prevDetails.end.getTime())) {
              // If 'start' is being set and its date part is missing, try 'end'
              baseDate = new Date(prevDetails.end);
            } else {
              // Fallback to current date if no existing date part is found
              baseDate = new Date();
            }

            const [hours, minutes] = value.split(":").map(Number);
            if (!isNaN(hours) && !isNaN(minutes) && baseDate) {
              baseDate.setHours(hours, minutes, 0, 0);
              updatedDetails = { ...updatedDetails, [name]: baseDate };
            } else {
              updatedDetails = { ...updatedDetails, [name]: null };
            }
          } else {
            // If value is already a Date object or null, assign directly
            updatedDetails = { ...updatedDetails, [name]: value };
          }
        } else if (
          (name === "accountant" || name === "client") &&
          typeof value === "object" &&
          value !== null &&
          "id" in value
        ) {
          if (name === "accountant") {
            updatedDetails = {
              ...updatedDetails,
              accountant: value as Accountant,
              accountantId: String(value.id),
            };
          } else if (name === "client") {
            updatedDetails = {
              ...updatedDetails,
              client: value as User,
              clientId: String(value.id),
            };
          }
        } else {
          updatedDetails = { ...updatedDetails, [name]: value };
        }

        // Clear specific validation errors when the related field changes
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          if (name === "start" || name === "end") {
            delete newErrors.end;
            delete newErrors.timeConflict;
            delete newErrors.start;
          }
          return newErrors;
        });

        return updatedDetails;
      });
    },
    [clearAlertAndValidationErrors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearAlertAndValidationErrors();

    try {
      // Validate the form data using Yup schema
      await meetingSchema.validate(meetingDetails, { abortEarly: false });

      // After successful Yup validation, start and end will be valid Date objects.
      const encodedAccountantId = btoa(String(meetingDetails.accountantId));

      // Construct the payload with correctly typed Date objects
      const commonPayload = {
        title: meetingDetails.title,
        description: meetingDetails.description,
        accountantId: encodedAccountantId,
        status: meetingDetails.status,
        start: meetingDetails.start as Date, // Cast to Date as Yup confirms it's not null
        end: meetingDetails.end as Date,     // Cast to Date as Yup confirms it's not null
        clientId: meetingDetails.clientId || null, // Ensure clientId is string | null
      };

      if (meetingDetails.id) {
        // --- Update Meeting Path ---
        const encodedMeetingIdForUpdate = btoa(String(meetingDetails.id));
        await updateMeeting(encodedMeetingIdForUpdate, commonPayload);
        setAlertMessage("Meeting updated successfully!");
      } else {
        // --- Create Meeting Path ---
        await createMeeting(commonPayload);
        setAlertMessage("Meeting scheduled successfully!");
      }
      setAlertVariant("success");
      router.push("/dashboard/schedule");
    } catch (error: any) {
      if (error instanceof yup.ValidationError) {
        setValidationErrors(mapValidationErrors(error));
        setAlertMessage("Please correct the highlighted errors.");
        setAlertVariant("danger");
      } else {
        const errorMessage =
          error.message ||
          "An unexpected error occurred while processing the meeting.";
        setValidationErrors({ general: errorMessage });
        setAlertMessage(errorMessage);
        setAlertVariant("danger");
        console.error("Failed to process meeting:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
     <section className="mx-auto max-w-[1400px] w-full pt-5">
     <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-6 overflow-hidden">
          <h1 className="text-xl leading-normal text-black capitalize font-medium">
          {meetingDetails.id ? "Edit Meeting" : "Schedule New Meeting"}
        </h1>

        {alertMessage && (
          <AlertMessage
            message={alertMessage}
            variant={alertVariant}
            onClose={() => setAlertMessage("")}
            duration={6000}
          />
        )}

        {loading ? (
          <p className="text-gray-600">
            Loading{" "}
            {searchParams.get("meeting")
              ? "meeting details..."
              : "accountants..."}
          </p>
        ) : error ? (
          <AlertMessage
            message={error}
            variant="danger"
            onClose={() => setError(null)}
          />
        ) : (
          <MeetingForm
            meetingDetails={meetingDetails}
            accountants={accountants}
            validationErrors={validationErrors}
            isSubmitting={isSubmitting}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </section>
  );
}

export default function CreateSchedulePage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <SchedulePageContent />
    </Suspense>
  );
}