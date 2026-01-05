// src/components/MeetingInfoPopup.tsx
"use client";

import React, { useMemo, useState } from "react";
// Make sure MeetingInfoPopupProps includes updated meeting structure (client and accountant objects)
import { MeetingInfoPopupProps } from "@/interfaces";
import { deleteMeeting } from "@/api/meetingService";
import AlertMessage, { AlertVariant } from "@/components/AlertMessage";

// Import the main React component for Hugeicons
import { HugeiconsIcon } from '@hugeicons/react';

// Import the specific icon data (SVG definitions) from the core-free package
import {
  Cancel01Icon,
  Delete02Icon,
  Edit03Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';

// Helper function to map status number to a human-readable string
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

// Helper function to make URLs in text clickable
const renderDescriptionWithLinks = (text?: string) => {
  if (!text) {
    return '<p class="text-muted-foreground italic">No description provided for this meeting.</p>';
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const htmlContent = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-brand-primary hover:underline break-all">${url}</a>`;
  });

  // Use a div instead of a p if the content might have multiple paragraphs or other block elements
  // This helps avoid nested <p> tags if the incoming text already has newlines
  return `<div class="whitespace-pre-wrap">${htmlContent}</div>`;
};

const MeetingInfoPopup: React.FC<MeetingInfoPopupProps> = ({
  meeting,
  // Removed 'accountants' prop as it's no longer needed here
  onClose,
  onEdit,
  onView,
  onMeetingDeleted,
}) => {
  const [message, setMessage] = useState<string>("");
  const [alertVariant, setAlertVariant] = useState<AlertVariant | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

   console.log(meeting); // This is good for debugging, but can be removed in production

  // Extract client and accountant display names directly from the 'meeting' object
  // Assuming 'meeting.client' and 'meeting.accountant' are objects like { name: string, email: string }
  // or { first_name: string, last_name: string, email: string } based on your Prisma includes.
  // I will use first_name/last_name for display.
  const clientDisplayName = meeting.client
    ? `${meeting.client} `
    : "N/A";

  const accountantDisplayName = meeting.accountant
    ? `${meeting.accountant} `
    : "N/A";

  const statusDisplayName = getStatusDisplayName(meeting.status);

  const descriptionHtml = useMemo(
  () => renderDescriptionWithLinks(meeting.description ?? undefined),
  [meeting.description]
);

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        // Ensure meeting.id is a number before toString() and btoa()
        const encodedId = btoa(String(meeting.id)); // Safely convert to string before encoding
        await deleteMeeting(encodedId);
        setMessage("Meeting deleted successfully!");
        setAlertVariant("success");
        setTimeout(() => {
          onClose();
          if (onMeetingDeleted) {
            onMeetingDeleted();
          }
        }, 1500);
      } catch (error) {
        console.error("Failed to delete meeting:", error);
        setMessage("Failed to delete meeting. Please try again.");
        setAlertVariant("danger");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-sidebar-background bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6">
      {/* Modal Container - Smaller border-radius, more subtle shadow */}
      <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl h-[80vh] mx-auto flex flex-col overflow-hidden">
        {message && (
          <div className="p-4 sm:p-5 flex-shrink-0">
            <AlertMessage message={message} variant={alertVariant} onClose={() => setMessage("")} duration={3000} />
          </div>
        )}

        {/* Modal Header - Gmail-like header with actions */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-border flex-shrink-0">
          <h3 className="text-xl sm:text-2xl font-bold text-brand-body truncate pr-8">
            {meeting.title}
          </h3>
          <div className="flex items-center space-x-2"> {/* Grouping header actions */}
            {/* Conditional rendering for Edit and Delete buttons */}
             <button
                  onClick={() => onView(meeting.id!)} // Use non-null assertion as we checked for meeting.id
                  className="p-2 rounded-full text-muted-foreground hover:bg-brand-muted hover:text-brand-body focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="View Meeting"
                 
                >
                  <HugeiconsIcon icon={ViewIcon} className="h-5 w-5" />
                </button>
            {meeting.owner === 1 && meeting.id && ( // Also check if meeting.id exists for edit/delete
              <>
                {/* Edit Icon Button in Header */}
                <button
                  onClick={() => onEdit(meeting.id!)} // Use non-null assertion as we checked for meeting.id
                  className="p-2 rounded-full text-muted-foreground hover:bg-brand-muted hover:text-brand-body focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Edit Meeting"
                  disabled={isDeleting}
                >
                  <HugeiconsIcon icon={Edit03Icon} className="h-5 w-5" />
                </button>

                {/* Delete Icon Button in Header */}
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-full text-muted-foreground hover:bg-brand-muted hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete Meeting"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-5 w-5 text-brand-body" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
                  )}
                </button>
              </>
            )}

            {/* Close Button in Header (always visible) */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-muted-foreground hover:bg-brand-muted hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Close"
              disabled={isDeleting}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Modal Body (Content) - Updated text sizes and spacing */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 pb-4 border-b border-border">
            <div className="flex justify-between items-center mb-2">
              {/* Display Client and Accountant */}
              <div className="text-gray-800 font-medium text-base">
                <p className="mb-1">
                  Client: <span className="text-brand-primary">{clientDisplayName}</span>
                </p>
                <p>
                  Accountant: <span className="text-brand-primary">{accountantDisplayName}</span>
                </p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold ${
                  meeting.status === 1
                    ? "bg-sidebar-background text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {statusDisplayName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Date:</span>{" "}
              {meeting.start.toLocaleDateString()}
              <span className="mx-2">|</span>
              <span className="font-medium">Time:</span>{" "}
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

          <div className="text-gray-800 leading-relaxed">
            <p className="text-base font-semibold mb-2">Details:</p> {/* Adjusted text size */}
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingInfoPopup;