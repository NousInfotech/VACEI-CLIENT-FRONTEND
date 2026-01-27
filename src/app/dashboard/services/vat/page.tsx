// "use client";

import ServiceEngagement from "@/components/engagement/ServiceEngagement";

// import Link from "next/link";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import PageHeader from "@/components/shared/PageHeader";
// import VATRequestForm, { VATFormData } from "@/components/vat/VATRequestForm";

// import ServiceEngagement from "@/components/engagement/ServiceEngagement";

// export default function VatWorkspacePage() {
//   const [isFormOpen, setIsFormOpen] = useState(false);

//   return (
//     <>
//       <ServiceEngagement serviceSlug="vat" />
//       {false && (
//         <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
//           <PageHeader
//             title="VAT & Tax"
//             subtitle="VAT overview, periods, missing items, submission status, and payment info."
//             actions={
//               <div className="flex gap-2">
//                 <Button 
//                   variant="outline" 
//                   className="bg-light text-primary-color-new"
//                   onClick={() => setIsFormOpen(true)}
//                 >
//                   Upload documents
//                 </Button>
//                 <Link href="/dashboard/todo-list">
//                   <Button variant="outline" className="bg-light text-primary-color-new">
//                     View requests
//                   </Button>
//                 </Link>
//               </div>
//             }
//           />

//           <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
//             <div className="space-y-5">
//               <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
//                 <h3 className="text-base font-semibold text-brand-body">VAT registrations</h3>
//                 <p className="text-sm text-muted-foreground">Registration #: — | Status: —</p>
//               </div>

//               <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
//                 <h3 className="text-base font-semibold text-brand-body">VAT periods</h3>
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   {["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"].map((p) => (
//                     <div
//                       key={p}
//                       className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between shadow-sm"
//                     >
//                       <div>
//                         <div className="font-semibold text-brand-body">{p}</div>
//                         <div className="text-xs text-muted-foreground mt-0.5">Status: —</div>
//                       </div>
//                       <Link href={`/dashboard/services/vat/period/${encodeURIComponent(p.replace(' ', '-').toLowerCase())}`}>
//                         <Button variant="ghost" size="sm" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow">
//                           View
//                         </Button>
//                       </Link>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
//                 <h3 className="text-base font-semibold text-brand-body">Missing items</h3>
//                 <ul className="space-y-2 text-sm">
//                   {["Sales invoices for current period", "Purchase invoices", "Payment proofs"].map((item) => (
//                     <li
//                       key={item}
//                       className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
//                     >
//                       <span className="text-brand-body font-medium">{item}</span>
//                       <Button 
//                         size="sm" 
//                         variant="ghost" 
//                         className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow"
//                         onClick={() => setIsFormOpen(true)}
//                       >
//                         Upload
//                       </Button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             <div className="space-y-5">
//               <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
//                 <h3 className="text-base font-semibold text-brand-body">Submission status</h3>
//                 <p className="text-sm text-muted-foreground">Status: — | Submission date: —</p>
//                 <p className="text-sm text-muted-foreground">Payment: — | Deadline: —</p>
//               </div>

//               <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
//                 <h3 className="text-base font-semibold text-brand-body">VAT history</h3>
//                 <p className="text-sm text-muted-foreground">Previous submissions and payments will appear here.</p>
//               </div>
//             </div>
//           </div>

//           {/* VAT Request Form Modal */}
//           <VATRequestForm
//             isOpen={isFormOpen}
//             onClose={() => setIsFormOpen(false)}
//             onSubmit={(data: VATFormData) => {
//               console.log("VAT request submitted:", data);
//               // TODO: Handle form submission (API call, etc.)
//               // You can add API call here to submit the form data
//             }}
//           />
//         </section>
//       )}
//     </>
//   );
// }


export default function VatWorkspacePage() {
  return (
    <ServiceEngagement serviceSlug="vat" />
  );
}


