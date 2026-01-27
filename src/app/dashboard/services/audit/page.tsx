"use client";

import ServiceEngagement from "@/components/engagement/ServiceEngagement";

// import Link from "next/link";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import PageHeader from "@/components/shared/PageHeader";
// import PillTabs from "@/components/shared/PillTabs";

// import ServiceEngagement from "@/components/engagement/ServiceEngagement";

// type TabKey = "requests" | "queries" | "reports" | "messages";

// export default function AuditWorkspacePage() {
//   const [activeTab, setActiveTab] = useState<TabKey>("requests");

//   return (
//     <>
//       <ServiceEngagement serviceSlug="audit" />
//       {false && (
//         <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
//           <PageHeader
//             title="Audit"
//             subtitle="Engagement overview, document requests, audit queries, and reports."
//             actions={
//               <div className="flex gap-2">
//                 <Link href="/dashboard/document-organizer/document-upload">
//                   <Button variant="outline" className="bg-light text-primary-color-new">
//                     Upload PBC docs
//                   </Button>
//                 </Link>
//                 <Link href="/dashboard/todo-list">
//                   <Button variant="outline" className="bg-light text-primary-color-new">
//                     View audit tasks
//                   </Button>
//                 </Link>
//               </div>
//             }
//           />

//           {/* Timeline / engagement overview */}
//           <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-base font-semibold text-brand-body">Engagement overview</h3>
//                 <p className="text-sm text-muted-foreground">Status: — | Year‑end: — | Phase: Fieldwork</p>
//               </div>
//               <p className="text-xs text-muted-foreground">Planning → Fieldwork → Completion</p>
//             </div>
//           </div>

//           {/* Tabs: Requests / Queries / Reports / Messages */}
//           <PillTabs
//             tabs={[
//               { id: "requests", label: "Requests" },
//               { id: "queries", label: "Queries" },
//               { id: "reports", label: "Reports" },
//               { id: "messages", label: "Messages" },
//             ]}
//             activeTab={activeTab}
//             onTabChange={(id) => setActiveTab(id as TabKey)}
//           />

//           {/* Tab content */}
//           {activeTab === "requests" && (
//             <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
//               <h3 className="text-base font-semibold text-brand-body">Audit requests (PBC list)</h3>
//               <div className="overflow-x-auto rounded-lg border border-border">
//                 <table className="w-full text-left text-xs">
//                   <thead className="bg-muted/60 text-muted-foreground">
//                     <tr>
//                       <th className="px-4 py-2 font-medium">Item</th>
//                       <th className="px-4 py-2 font-medium">Due</th>
//                       <th className="px-4 py-2 font-medium">Status</th>
//                       <th className="px-4 py-2 font-medium text-right">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {[
//                       { item: "Bank confirmation letter", due: "—", status: "Missing" },
//                       { item: "Loan agreement", due: "—", status: "Missing" },
//                     ].map((row) => (
//                       <tr key={row.item} className="border-t border-border">
//                         <td className="px-4 py-2 text-brand-body font-semibold">{row.item}</td>
//                         <td className="px-4 py-2">{row.due}</td>
//                         <td className="px-4 py-2">{row.status}</td>
//                         <td className="px-4 py-2 text-right">
//                           <Link href="/dashboard/document-organizer/document-upload">
//                             <Button
//                               size="sm"
//                               className="h-7 rounded-lg text-[11px] px-3 shadow-sm hover:shadow-md transition-shadow text-primary-color-new bg-light"
//                             >
//                               Upload
//                             </Button>
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {activeTab === "queries" && (
//             <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
//               <h3 className="text-base font-semibold text-brand-body">Audit queries</h3>
//               <div className="overflow-x-auto rounded-lg border border-border">
//                 <table className="w-full text-left text-xs">
//                   <thead className="bg-muted/60 text-muted-foreground">
//                     <tr>
//                       <th className="px-4 py-2 font-medium">Query</th>
//                       <th className="px-4 py-2 font-medium">Due</th>
//                       <th className="px-4 py-2 font-medium">Status</th>
//                       <th className="px-4 py-2 font-medium text-right">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {[
//                       { q: "Q#12 Revenue cutoff", due: "—", status: "Waiting on you" },
//                     ].map((row) => (
//                       <tr key={row.q} className="border-t border-border">
//                         <td className="px-4 py-2 text-brand-body font-semibold">{row.q}</td>
//                         <td className="px-4 py-2">{row.due}</td>
//                         <td className="px-4 py-2">{row.status}</td>
//                         <td className="px-4 py-2 text-right">
//                           <Link href="/dashboard/messages">
//                             <Button
//                               size="sm"
//                               className="h-7 rounded-lg text-[11px] px-3 shadow-sm hover:shadow-md transition-shadow text-primary-color-new bg-light"
//                             >
//                               Open / Reply
//                             </Button>
//                           </Link>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {activeTab === "reports" && (
//             <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
//               <h3 className="text-base font-semibold text-brand-body">Reports & archive</h3>
//               <p className="text-sm text-muted-foreground">
//                 Draft and final reports, management letters and signed PDFs will appear here once your firm uploads them.
//               </p>
//               <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
//                 No reports yet. Ask your auditor to share the latest draft via Messages or upload it into Documents.
//               </div>
//             </div>
//           )}

//           {activeTab === "messages" && (
//             <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
//               <h3 className="text-base font-semibold text-brand-body">Messages</h3>
//               <p className="text-sm text-muted-foreground">
//                 Open the unified inbox to continue audit conversations, attach files and track read status.
//               </p>
//               <Link href="/dashboard/messages">
//                 <Button className="rounded-lg text-xs px-4 shadow-sm hover:shadow-md transition-shadow text-primary-color-new bg-light">
//                   Go to Messages
//                 </Button>
//               </Link>
//             </div>
//           )}
//         </section>
//       )}
//     </>
//   );
// }

export default function AuditWorkspacePage() {
  return (
    <ServiceEngagement serviceSlug="audit" />
  );
}
