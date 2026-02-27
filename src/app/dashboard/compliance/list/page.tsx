"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";
import { fetchTasks, fetchTaskCategories, fetchTaskStatuses } from "@/api/taskService";
import type { Category, Status, Task, Pagination } from "@/interfaces";
import { useActiveCompany } from "@/context/ActiveCompanyContext";

export default function ComplianceListPage() {
  const router = useRouter();
  const { activeCompanyId } = useActiveCompany();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  const [serviceFilter, setServiceFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(
    async (page: number = 1) => {
      if (!activeCompanyId) {
        setTasks([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [taskResponse, cats, stats] = await Promise.all([
          fetchTasks({
            page,
            search,
            categoryId: serviceFilter === "all" ? undefined : serviceFilter,
            statusId: statusFilter === "all" ? undefined : statusFilter,
            companyId: activeCompanyId,
          }),
          fetchTaskCategories(),
          fetchTaskStatuses(),
        ]);
        setTasks(taskResponse.data);
        setPagination(taskResponse.pagination);
        setCategories(cats);
        setStatuses(stats);
      } finally {
        setLoading(false);
      }
    },
    [search, serviceFilter, statusFilter, activeCompanyId]
  );

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const gotoPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages || loading) return;
    loadData(page);
  };

  const handleOpenTask = (taskId: number) => {
    const encoded = btoa(taskId.toString());
    router.push(`/dashboard/compliance/detail?taskId=${encoded}`);
  };

  const serviceLinkFor = (task: Task) => {
    const name = (task.category || "").toLowerCase();
    if (name.includes("vat")) return "/dashboard/tax";
    if (name.includes("payroll")) return "/dashboard/invoices";
    if (name.includes("book") || name.includes("bk")) return "/dashboard/financial-statements/profit-loss";
    if (name.includes("audit")) return "/dashboard/services";
    if (name.includes("mbr") || name.includes("csp") || name.includes("corp")) return "/dashboard/services";
    return "/dashboard/services";
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  const computeStatusLabel = (task: Task) => {
    return task.status ?? "Not started";
  };

  const computeCTA = (task: Task) => {
    const lower = (task.title || "").toLowerCase();
    if (lower.includes("upload")) return "Upload";
    if (lower.includes("reply") || lower.includes("query")) return "Reply";
    return "Open";
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-body">
            Compliance – list
          </h1>
          <p className="text-sm text-muted-foreground">
            All open compliance items across bookkeeping, VAT, payroll, audit and MBR.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-lg px-4 text-sm shadow-sm hover:shadow-md transition-shadow"
          onClick={() => router.push("/dashboard/compliance")}
        >
          Back to calendar view
        </Button>
      </div>

      <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row">
            <input
              type="text"
              placeholder="Search by item or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Dropdown
              className="w-full md:w-44"
              trigger={
                <Button variant="outline" className="w-full md:w-44 h-9 justify-between">
                  {serviceFilter === "all" ? "All services" : categories.find(c => c.id === serviceFilter)?.name || "All services"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "all", label: "All services", onClick: () => setServiceFilter("all") },
                ...categories.map((cat) => ({
                  id: cat.id,
                  label: cat.name,
                  onClick: () => setServiceFilter(cat.id)
                }))
              ]}
            />
            <Dropdown
              className="w-full md:w-40"
              trigger={
                <Button variant="outline" className="w-full md:w-40 h-9 justify-between">
                  {statusFilter === "all" ? "All status" : statuses.find(s => s.id === statusFilter)?.name || "All status"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              }
              items={[
                { id: "all", label: "All status", onClick: () => setStatusFilter("all") },
                ...statuses.map((s) => ({
                  id: s.id,
                  label: s.name,
                  onClick: () => setStatusFilter(s.id)
                }))
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs shadow-sm hover:shadow-md transition-shadow"
              onClick={() => {
                setSearch("");
                setServiceFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Due date</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Item</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Service</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide text-right">CTA</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading compliance items…
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No compliance items found for the current filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="text-brand-body font-medium">{formatDate(task.dueDate as any)}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-brand-body">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex rounded-lg bg-muted border border-border px-2.5 py-1 text-xs font-medium text-brand-body">
                        {task.category || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs font-medium text-primary">
                        {computeStatusLabel(task)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <Button
                          size="sm"
                          className="rounded-lg px-3 text-xs shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => handleOpenTask(task.id)}
                        >
                          {computeCTA(task)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg px-3 text-xs shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => router.push(serviceLinkFor(task))}
                        >
                          Open service
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg px-3 shadow-sm hover:shadow-md transition-shadow"
            disabled={pagination.page === 1 || loading}
            onClick={() => gotoPage(pagination.page - 1)}
          >
            Prev
          </Button>
          <span className="text-brand-body font-medium">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg px-3 shadow-sm hover:shadow-md transition-shadow"
            disabled={
              pagination.page === pagination.totalPages || loading
            }
            onClick={() => gotoPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}


