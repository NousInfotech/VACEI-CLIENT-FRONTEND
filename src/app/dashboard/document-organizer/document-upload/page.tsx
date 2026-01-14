import DocumentForm from "../components/DocumentForm";
import DocumentList from "../components/DocumentList";
import DocumentTable from "../components/DocumentTable";
import { PageHeader } from "@/components/shared/PageHeader";

export default function DocumentOrganizer() {
    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
            <PageHeader
                title="Upload Documents"
                subtitle="Upload new documents and tag them to specific services."
            />
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <div className="mt-2">
                    <DocumentForm />
                </div>
            </div>
        </section>
    );
}