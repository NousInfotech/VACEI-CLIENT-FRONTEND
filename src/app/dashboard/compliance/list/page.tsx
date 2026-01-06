"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchTasks, fetchTaskCategories, fetchTaskStatuses } from "@/api/taskService";
import type { Category, Status, Task, Pagination } from "@/interfaces";

export default function ComplianceListPage() {
  const router = useRouter();

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
      setLoading(true);
      try {
        const [taskResponse, cats, stats] = await Promise.all([
          fetchTasks({
            page,
            search,
            categoryId: serviceFilter === "all" ? undefined : serviceFilter,
            statusId: statusFilter === "all" ? undefined : statusFilter,
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
    [search, serviceFilter, statusFilter]
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
          className="rounded-full px-4 text-sm"
          onClick={() => router.push("/dashboard/compliance")}
        >
          Back to calendar view
        </Button>
      </div>

      <div className="bg-card border border-border rounded-[16px] shadow-md p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row">
            <input
              type="text"
              placeholder="Search by item or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <select
              value={serviceFilter}
              onChange={(e) =>
                setServiceFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm md:w-44"
            >
              <option value="all">All services</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm md:w-40"
            >
              <option value="all">All status</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs"
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
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Due date</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">CTA</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Loading compliance items…
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No compliance items found for the current filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-t border-border/60 hover:bg-muted/40"
                  >
                    <td className="px-4 py-2 align-top">
                      {formatDate(task.dueDate as any)}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium text-brand-body">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {task.category || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {computeStatusLabel(task)}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <Button
                          size="sm"
                          className="rounded-full px-3 text-xs"
                          onClick={() => handleOpenTask(task.id)}
                        >
                          {computeCTA(task)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full px-3 text-[11px]"
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
        <div className="flex items-center justify-center gap-4 pt-3 text-xs text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-3"
            disabled={pagination.page === 1 || loading}
            onClick={() => gotoPage(pagination.page - 1)}
          >
            Prev
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-3"
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


