"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import PillTabs from "@/components/shared/PillTabs";
import { useTabQuery } from "@/hooks/useTabQuery";
import { LayoutDashboard, LineChart } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import BookkeepingRequestForm, { BookkeepingFormData } from "@/components/bookkeeping/BookkeepingRequestForm";

function BookkeepingWorkspaceContent() {
  const [activeTab, setActiveTab] = useTabQuery("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section className="mx-auto max-w-[1200px] w-full pt-5 space-y-6">
      <PageHeader
        title="Bookkeeping"
        subtitle="Overview of status, missing items, uploads, and monthly summaries."
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-light text-primary-color-new"
              onClick={() => setIsFormOpen(true)}
            >
              Upload documents
            </Button>
            <Link href="/dashboard/todo-list">
              <Button variant="outline" className="bg-light text-primary-color-new">View requests</Button>
            </Link>
          </div>
        }
      />

      {/* Tabs: Overview / Insight */}
      <PillTabs
        tabs={[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "insight", label: "Insight", icon: LineChart },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <h3 className="text-lg font-semibold text-brand-body">In progress</h3>
                  <p className="text-sm text-muted-foreground">Last completed: —</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                  Download report (PDF)
                </Button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
              <h3 className="text-base font-semibold text-brand-body">Missing items</h3>
              <ul className="space-y-2 text-sm">
                {["Bank statements (latest period)", "Card statements", "Unlinked invoices"].map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 shadow-sm"
                  >
                    <span className="text-brand-body font-medium">{item}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      onClick={() => setIsFormOpen(true)}
                    >
                      Upload
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
              <h3 className="text-base font-semibold text-brand-body">Requests / tasks</h3>
              <p className="text-sm text-muted-foreground">
                This section can list To‑Do tasks filtered for bookkeeping. Link to To‑Do list for now.
              </p>
              <Link href="/dashboard/todo-list">
                <Button variant="outline" size="sm" className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow">
                  Open To-Do
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
              <h3 className="text-base font-semibold text-brand-body">Monthly summaries</h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                  <div key={m} className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-center shadow-sm">
                    <div className="font-semibold text-brand-body">{m}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">—</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
              <h3 className="text-base font-semibold text-brand-body">Insights (read-only)</h3>
              <p className="text-sm text-muted-foreground">
                Bank activity, income/expense summaries, category breakdowns, linked/unlinked documents.
                Add data wiring when backend is available.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "insight" && (
        <div className="grid gap-5 md:grid-cols-[1.3fr,1fr]">
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-brand-body">Bank activity</h3>
                <p className="text-xs text-muted-foreground">Read-only preview</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium text-center">Doc</th>
                      <th className="px-3 py-2 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "—", desc: "Sample txn #223", amount: "€—", category: "Draft", doc: "Linked", status: "In progress" },
                      { date: "—", desc: "Sample txn #224", amount: "€—", category: "Uncategorised", doc: "Missing", status: "Waiting on you" },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-3 py-2">{row.date}</td>
                        <td className="px-3 py-2">{row.desc}</td>
                        <td className="px-3 py-2 text-right">{row.amount}</td>
                        <td className="px-3 py-2">{row.category}</td>
                        <td className="px-3 py-2 text-center">{row.doc}</td>
                        <td className="px-3 py-2 text-center">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-3">
              <h3 className="text-base font-semibold text-brand-body">Summary tiles</h3>
              <p className="text-sm text-muted-foreground">
                Quick read-only KPIs such as income vs expenses, top categories, and cash trend can be displayed here once
                backend data is connected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bookkeeping Request Form Modal */}
      <BookkeepingRequestForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data: BookkeepingFormData) => {
          console.log("Bookkeeping request submitted:", data);
          // TODO: Handle form submission (API call, etc.)
          // You can add API call here to submit the form data
        }}
      />
    </section>
  );
}

export default function BookkeepingWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading workspace...</div>}>
      <BookkeepingWorkspaceContent />
    </Suspense>
  );
}


