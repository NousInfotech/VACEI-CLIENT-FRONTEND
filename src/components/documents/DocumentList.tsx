"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { fetchDocuments } from "@/api/documenService";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  document_title: string;
  created_at: string;
  uploader?: {
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  status?: string;
  file_path?: string;
}

export default function DocumentList({ refreshTrigger }: { refreshTrigger: number }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetchDocuments({ page: 1, limit: 50 });
      // Handle both array response or object with data property
      const rawDocs = Array.isArray(res) ? res : (res.data || []);
      // Map API response to Document interface
      const docs: Document[] = rawDocs.map((doc: any) => ({
        id: doc.id,
        document_title: doc.name || doc.document_title || '',
        created_at: doc.createdAt || doc.created_at || new Date().toISOString(),
        status: doc.status,
        uploader: doc.uploader,
        file_path: doc.file_path,
      }));
      setDocuments(docs);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch documents", err);
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  if (loading && documents.length === 0) {
    return (
        <div className="space-y-4">
            <div className="h-8 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full bg-gray-50 rounded animate-pulse" />
                ))}
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (documents.length === 0) {
    return <div className="text-gray-500 text-sm">No documents found.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="font-medium text-gray-500">File name</TableHead>
              <TableHead className="font-medium text-gray-500">Upload date</TableHead>
              <TableHead className="font-medium text-gray-500">Uploaded by</TableHead>
              <TableHead className="font-medium text-gray-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                <TableCell className="font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {doc.document_title}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {doc.created_at ? format(new Date(doc.created_at), "MMM d, yyyy") : "-"}
                </TableCell>
                <TableCell className="text-gray-600">
                  {doc.uploader?.name || 
                   (doc.uploader?.first_name ? `${doc.uploader.first_name} ${doc.uploader.last_name || ""}` : "System")}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    doc.status === "Reviewed" ? "bg-green-50 text-green-700" :
                    doc.status === "Action required" ? "bg-red-50 text-red-700" :
                    "bg-blue-50 text-blue-700"
                  )}>
                    {doc.status || "Received"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
