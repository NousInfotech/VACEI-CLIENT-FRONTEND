import DocumentForm from "../components/DocumentForm";
import DocumentList from "../components/DocumentList";
import DocumentTable from "../components/DocumentTable";

export default function DocumentOrganizer() {
    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-2xl leading-normal text-brand-body capitalize font-medium">Upload Documents</h1>
                <hr className="my-3 border-t border-gray-100"></hr>
                <div className="mt-5">
                    <DocumentForm />
                </div>
            </div>
        </section>
    );
}