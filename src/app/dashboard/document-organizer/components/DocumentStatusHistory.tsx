"use client";

import React, { useEffect, useState } from 'react';

// --- Type Definitions for Document Status History ---
interface DocumentStatus {
  id: number;
  name: string; // Assuming DocumentStatus has a 'name' field
  // Add other properties if available, e.g., 'description'
}

interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string | null; // Added first_name
  last_name?: string | null;  // Added last_name
  // Add other properties if available, e.g., 'email'
}

interface DocumentStatusHistoryEntry {
  id: number;
  documentId: number;
  previousStatusId?: number | null;
  newStatusId: number;
  changedById: number;
  changedAt: string; // Date-time string
  comments?: string | null;
  
  // Relations (as they would be included by Prisma)
  previousStatus?: DocumentStatus | null;
  newStatus?: DocumentStatus;
  changedBy?: User; // Updated User interface to include first_name and last_name
}

interface DocumentStatusHistoryDisplayProps {
  documentId: number;
  backendUrl: string; // Base URL for the backend API
}

// --- Comment Modal Component ---
interface CommentModalProps {
  comment: string;
  onClose: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ comment, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto flex flex-col">
        <div className="flex justify-between items-center pb-3 border-b border-gray-300 mb-4">
          <h3 className="text-xl font-bold text-gray-900">Full Comment</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="flex-grow overflow-y-auto text-gray-700 text-base mb-4">
          <p className="whitespace-pre-wrap">{comment}</p> {/* Use pre-wrap to preserve newlines */}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const DocumentStatusHistoryDisplay: React.FC<DocumentStatusHistoryDisplayProps> = ({ documentId, backendUrl }) => {
  const [history, setHistory] = useState<DocumentStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullComment, setShowFullComment] = useState<string | null>(null); // State to hold the full comment for the modal

  const COMMENT_TRUNCATE_LENGTH = 70; // Define a length to truncate comments

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      setHistory([]);
      return;
    }

    const fetchStatusHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        
        // Encode the documentId using btoa and encodeURIComponent
        // This matches the decodeIdFromUrl logic on the backend
        const encodedDocId = encodeURIComponent(btoa(JSON.stringify(documentId)));

        // CORRECTED URL: Changed 'document-status-history' to 'documents/status-history'
        // to match the backend route definition provided previously.
        const res = await fetch(`${backendUrl}document-status-history?documentId=${encodedDocId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorText = await res.text();
          // Attempt to parse JSON error if available, otherwise use raw text
          let errorMessage = `Failed to fetch status history: ${res.status} ${res.statusText}`;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
                errorMessage = `Failed to fetch status history: ${errorJson.message}`;
            } else if (errorJson.details) {
                errorMessage = `Failed to fetch status history: ${errorJson.details}`;
            }
          } catch (parseError) {
            // If not JSON, use the raw text
            errorMessage = `Failed to fetch status history: ${res.status} ${res.statusText}. Response: ${errorText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        // Assuming data.data is an array of DocumentStatusHistoryEntry
        setHistory(data.data || []); 
      } catch (e: any) {
        console.error("Error fetching document status history:", e);
        setError(e.message || "An unknown error occurred while fetching status history.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusHistory();
  }, [documentId, backendUrl]);

  const handleReadMoreClick = (comment: string) => {
    setShowFullComment(comment);
  };

  const handleCloseModal = () => {
    setShowFullComment(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg animate-pulse">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Status History</h3>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-5/6"></div>
          <div className="h-6 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md shadow-md">
        <h3 className="text-xl font-semibold mb-2">Error Loading Status History</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg text-gray-600 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Status History</h3>
        <p>No status history found for this document.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Status History</h3>
      {/* Added border and rounded corners to the table container */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                Changed By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Previous Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Changed At
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                Comments
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((entry) => (
              <tr key={entry.id} className="even:bg-gray-50"> {/* Added even:bg-gray-50 here */}
                <td className="px-6 py-4  text-sm font-medium text-gray-900">
                  {/* Show username and email in brackets */}
                  {entry.changedBy ? 
                    `${entry.changedBy.username || 'N/A'} ${entry.changedBy.email ? `(${entry.changedBy.email})` : ''}`.trim()
                    : 'N/A'
                  }
                </td>
                <td className="px-6 py-4  text-sm text-gray-500">
                  {entry.previousStatus?.name || 'N/A'}
                </td>
                <td className="px-6 py-4  text-sm text-gray-900 font-semibold">
                  {entry.newStatus?.name || 'N/A'}
                </td>
                <td className="px-6 py-4  text-sm text-gray-500">
                  {new Date(entry.changedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs"> {/* Removed whitespace-normal */}
                  {entry.comments && entry.comments.length > COMMENT_TRUNCATE_LENGTH ? (
                    <>
                      {`${entry.comments.substring(0, COMMENT_TRUNCATE_LENGTH)}... `}
                      <button 
                        onClick={() => handleReadMoreClick(entry.comments!)} // Use ! to assert non-null
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read More
                      </button>
                    </>
                  ) : (
                    entry.comments || 'No comments'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render CommentModal if showFullComment state is not null */}
      {showFullComment && (
        <CommentModal comment={showFullComment} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default DocumentStatusHistoryDisplay;
