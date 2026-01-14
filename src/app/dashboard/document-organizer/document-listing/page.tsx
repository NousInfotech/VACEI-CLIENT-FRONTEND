import DocumentForm from "../components/DocumentForm";
import DocumentList from "../components/DocumentList";
import { Suspense } from 'react';
import DocumentTable from "../components/DocumentTable";
import { PageHeader } from "@/components/shared/PageHeader";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
    </div>
  );
};


export default function DocumentOrganizer() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
      <PageHeader
        title="View Documents"
        subtitle="List of all uploaded documents and their statuses."
      />
      <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
        <div className="mt-2">
          <Suspense fallback={<Loading />}>
            <DocumentList />
          </Suspense>
        </div>
      </div>
    </section>
  );
}