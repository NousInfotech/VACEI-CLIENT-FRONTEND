"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cfoProjects } from "./cfoProjects";
import { ArrowLeft, Download, Eye } from "lucide-react";

export default function CFOProjectDetail() {
  const params = useParams();
  const id = params?.id as string;

  const project = cfoProjects.find(
    (p) => p.id === id
  );

  if (!project) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Project not found
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-6 space-y-6">

      {/* 🔙 Back */}
      <Link
        href="/dashboard/services/cfo"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CFO Services
      </Link>

      {/* 🧾 Header */}
      <div className="rounded-xl border bg-white p-6 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {project.description}
            </p>
          </div>

          {/* Status Badge */}
          <span className="rounded-full border px-3 py-1 text-xs font-medium">
            {project.status}
          </span>
        </div>
      </div>

      {/* 📊 Meta Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-muted-foreground">Due date</div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {project.dueDate}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-muted-foreground">Assigned CFO</div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {project.additionalDetails.assignedCFO}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs text-muted-foreground">Billing</div>
          <div className="text-sm font-medium text-gray-900 mt-1">
            {project.additionalDetails.billing}
          </div>
        </div>
      </div>

      {/* 📌 Scope */}
      <div className="rounded-xl border bg-white p-6 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">
          Project scope
        </h3>
        <p className="text-sm text-gray-700">
          {project.additionalDetails.scope}
        </p>
      </div>

      {/* 📁 Documents */}
      <div className="rounded-xl border bg-white p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Documents
        </h3>

        {project.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
        ) : (
          <div className="space-y-3">
            {project.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: {doc.status}
                  </p>
                </div>

                {/* SaaS Actions */}
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs hover:bg-gray-100">
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs hover:bg-gray-100">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
