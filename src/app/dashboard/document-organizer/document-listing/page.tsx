import DocumentForm from "../components/DocumentForm";
import DocumentList from "../components/DocumentList";
import { Suspense } from 'react';
import DocumentTable from "../components/DocumentTable";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
    </div>
  );
};


export default function DocumentOrganizer() {
  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
        <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">View Documents</h1>
        <hr className="my-3 border-t border-gray-100" />
        <div className="mt-5">
          <Suspense fallback={<Loading />}>
            <DocumentList />
          </Suspense>
        </div>
      </div>
    </section>
  );
}