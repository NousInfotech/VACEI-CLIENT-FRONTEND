"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMeetingById } from "@/api/meetingService";
import { CalendarEvent } from "@/interfaces";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// Helper function to get display name for meeting status
const getStatusDisplayName = (statusCode: number): string => {
  switch (statusCode) {
    case 0:
      return "Inactive / Cancelled";
    case 1:
      return "Active";
    default:
      return "Unknown";
  }
};

// Helper function to render description with clickable links
const renderDescriptionWithLinks = (text?: string) => {
  if (!text) {
    return '<p class="text-muted-foreground italic">No description provided for this meeting.</p>';
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const htmlContent = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-brand-primary hover:underline break-all">${url}</a>`;
  });
  return `<div class="whitespace-pre-wrap">${htmlContent}</div>`;
};

const MeetingViewInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [meeting, setMeeting] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    const meetingParam = searchParams.get("meeting");
    if (!meetingParam) {
      setError("No meeting ID provided in the URL.");
      setNotFound(true);
      setIsLoading(false);
      router.replace("/dashboard/schedule");
      return;
    }

    let meetingId: number | null = null;
    try {
      const decodedMeetingIdBase64 = decodeURIComponent(meetingParam);
      meetingId = parseInt(atob(decodedMeetingIdBase64));

      if (isNaN(meetingId)) {
        setError("Invalid meeting ID format.");
        setNotFound(true);
        setIsLoading(false);
        router.replace("/dashboard/schedule");
        return;
      }
    } catch {
      setError("Error processing meeting ID from URL.");
      setNotFound(true);
      setIsLoading(false);
      router.replace("/dashboard/schedule");
      return;
    }

    const loadMeeting = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        // Assuming fetchMeetingById can handle the base64 encoded ID or decodes it internally
        const fetchedMeeting = await fetchMeetingById(meetingParam);
        if (fetchedMeeting) {
          setMeeting(fetchedMeeting);
        } else {
          setNotFound(true);
          setError("Meeting not found or deleted.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load meeting details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMeeting();
  }, [searchParams, router]);

  const descriptionHtml = useMemo(
    () => renderDescriptionWithLinks(meeting?.description ?? undefined),
    [meeting?.description]
  );

  const clientDisplayName = useMemo(
    () =>
      meeting?.client
        ? `${meeting?.client?.username ?? "N/A"} (${meeting?.client?.email ?? "N/A"
        })`
        : "N/A",
    [meeting?.client]
  );

  const accountantDisplayName = useMemo(
    () =>
      meeting?.accountant
        ? `${meeting?.accountant?.username ?? "N/A"} (${meeting?.accountant?.email ?? "N/A"
        })`
        : "N/A",
    [meeting?.accountant]
  );

  const statusDisplayName = useMemo(
    () =>
      meeting?.status !== undefined ? getStatusDisplayName(meeting.status) : "Unknown",
    [meeting?.status]
  );

  // Loading state
  if (isLoading) {
    return (
      <section className="min-h-screen px-4 py-10 bg-brand-body flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-6 text-center text-brand-body">
          <svg
            className="animate-spin h-8 w-8 text-brand-primary mx-auto mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p className="text-lg font-medium">Loading meeting details...</p>
        </div>
      </section>
    );
  }

  // Error or Not Found state
  if (error || notFound) {
    return (
      <section className="min-h-screen px-4 py-10 bg-brand-body flex items-center justify-center">
        <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-6 text-center text-red-600">
          <p className="text-xl font-bold mb-4">Error Loading Meeting</p>
          <p className="text-lg mb-4">{error || "The meeting could not be found."}</p>
          <button
            onClick={() => router.push("/dashboard/schedule")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-card-foreground bg-brand-primary hover:bg-brand-primary700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer" // Added cursor-pointer here
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5 mr-2" />
            Go to Schedule
          </button>
        </div>
      </section>
    );
  }

  // No Meeting Data (should ideally be covered by error/notFound but as a fallback)
  if (!meeting) {
    return (
      <section className="min-h-screen px-4 py-10 bg-brand-body flex items-center justify-center">
        <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-6 text-center text-brand-body">
          <p className="text-xl font-bold mb-4">No Meeting Data</p>
          <p className="text-lg mb-4">No meeting data is available.</p>
          <button
            onClick={() => router.push("/dashboard/schedule")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-card-foreground bg-brand-primary hover:bg-brand-primary700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5 mr-2" />
            Go to Schedule
          </button>
        </div>
      </section>
    );
  }

  return (
  
      <div className="">
       

        <hr className="border-border mb-6" />

        {/* Meeting Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
           {/* Client */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Title:</p>
           <p className="text-lg text-brand-body font-medium">
              {meeting.title}
            </p>
          </div>
          {/* Client */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Client:</p>
            <p className="text-lg text-brand-primary700 font-semibold break-words">
              {clientDisplayName}
            </p>
          </div>
          {/* Accountant */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Accountant:</p>
            <p className="text-lg text-brand-primary700 font-semibold break-words">
              {accountantDisplayName}
            </p>
          </div>
          {/* Date */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Date:</p>
            <p className="text-lg text-brand-body font-medium">
              {meeting.start.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {/* Time */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Time:</p>
            <p className="text-lg text-brand-body font-medium">
              {meeting.start.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {meeting.end.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {/* Status */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Status:</p>
            <span
              className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${meeting.status === 1
                  ? "bg-sidebar-background text-green-800"
                  : "bg-red-100 text-red-800"
                }`}
            >
              {statusDisplayName}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-brand-body mb-3">Description:</h2>
          <div className="prose max-w-none text-brand-body leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
        </div>
      </div>
 
  );
};

export default MeetingViewInner;