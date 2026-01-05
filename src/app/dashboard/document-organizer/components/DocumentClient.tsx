"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentPreview from "../components/DocumentPreview";
import CommentSection from "../components/CommentSection";
import DocumentStatusHistoryDisplay from "../components/DocumentStatusHistory"; // Corrected import name

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function DocumentViewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams?.get("param") || "";

  const [document, setDocument] = useState<any | null>(null);
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${backendUrl}documents/get-documents?id=${docId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load document");
        const data = await res.json();
        const doc = data.data?.[0];
        setDocument(doc);
        if (doc?.files?.length > 0) setPreviewFile(doc.files[0]);
      } catch (e) {
        // Using console.error instead of alert for better UX
        console.error("Error loading document:", e);
        // You might want to show a user-friendly message in the UI here
      } finally {
        setLoading(false);
      }
    })();
  }, [docId]);

  if (loading) {
    return (
      <div className="w-full p-6 animate-pulse space-y-4">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>

        {/* File buttons skeleton */}
        <div className="flex gap-2 flex-wrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-300 rounded"></div>
          ))}
        </div>

        {/* Document preview skeleton */}
        <div className="h-[24rem] bg-gray-300 rounded"></div>

        {/* Comment section skeleton */}
        <div className="h-[12rem] bg-gray-300 rounded"></div>

        {/* Status History skeleton */}
        <div className="h-[10rem] bg-gray-300 rounded"></div> {/* Added skeleton for status history */}
      </div>
    );
  }

  if (!document) return <p>Document not found.</p>;

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-4">{document.document_title}</h1>

      <div className="mb-4 flex gap-2 flex-wrap">
        {document.files?.length ? (
          document.files.map((file: any) => (
            <button
              key={file.id}
              onClick={() => setPreviewFile(file)}
              className={`border p-2 text-sm cursor-pointer rounded ${
                previewFile?.id === file.id
                  ? "bg-brand-primary100 border-brand-primary"
                  : "border-border"
              }`}
            >
              {file.fileName}
            </button>
          ))
        ) : (
          <p>No files found for this document.</p>
        )}
      </div>

      {previewFile && (
        <>
          <DocumentPreview
            fileUrl={previewFile.fileUrl}
            fileType={previewFile.fileType}
            fileName={previewFile.fileName}
          />
          <CommentSection fileId={previewFile.id} files={document.files} />
        </>
      )}

      {/* Render the new DocumentStatusHistoryDisplay component */}
      {document.id && ( // Ensure document.id exists before rendering
        <div className="mt-8">
          <DocumentStatusHistoryDisplay 
            documentId={document.id} 
            backendUrl={backendUrl} 
          />
        </div>
      )}
    </div>
  );
}

export default function DocumentViewPage() {
  return (
    <Suspense fallback={<p>Loading page...</p>}>
      <DocumentViewPageInner />
    </Suspense>
  );
}
