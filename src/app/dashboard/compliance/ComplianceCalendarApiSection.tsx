"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import Dropdown from "@/components/Dropdown";
import { Modal } from "@/components/ui/modal";
import {
  ChevronDown,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { getCompanies } from "@/api/auditService";
import {
  listComplianceCalendars,
  createComplianceCalendar,
  updateComplianceCalendar,
  deleteComplianceCalendar,
  getComplianceCalendarById,
  type ComplianceCalendarEntry,
  type CreatePayload,
  type UpdatePayload,
  type CalendarType,
  type ServiceCategory,
  type Frequency,
  type CustomFrequencyUnit,
} from "@/api/complianceCalendarService";

const SERVICE_CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "AUDITING", label: "Auditing" },
  { value: "VAT", label: "VAT" },
  { value: "CFO", label: "CFO" },
  { value: "CSP", label: "CSP" },
  { value: "LEGAL", label: "Legal" },
  { value: "PAYROLL", label: "Payroll" },
  { value: "PROJECTS_TRANSACTIONS", label: "Projects & Transactions" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "GRANTS_AND_INCENTIVES", label: "Grants & Incentives" },
  { value: "INCORPORATION", label: "Incorporation" },
  { value: "MBR", label: "MBR" },
  { value: "TAX", label: "Tax" },
  { value: "CUSTOM", label: "Custom" },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "CUSTOM", label: "Custom" },
];

const CUSTOM_UNIT_OPTIONS: { value: CustomFrequencyUnit; label: string }[] = [
  { value: "DAYS", label: "Days" },
  { value: "WEEK", label: "Weeks" },
  { value: "MONTH", label: "Months" },
  { value: "YEAR", label: "Years" },
];

function formatDate(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Convert date-only (YYYY-MM-DD) to ISO at start of day for API */
function dateToStartISO(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return "";
  const d = new Date(dateStr + "T00:00:00.000Z");
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** Convert date-only (YYYY-MM-DD) to ISO at end of day for API */
function dateToEndISO(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return "";
  const d = new Date(dateStr + "T23:59:59.000Z");
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

interface CompanyOption {
  id: string;
  name: string;
}

export default function ComplianceCalendarApiSection() {
  const [entries, setEntries] = useState<ComplianceCalendarEntry[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<CalendarType | "">("");
  const [companyIdFilter, setCompanyIdFilter] = useState<string>("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewEntry, setViewEntry] = useState<ComplianceCalendarEntry | null>(null);
  const [editEntry, setEditEntry] = useState<ComplianceCalendarEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<ComplianceCalendarEntry | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCompanies = useCallback(async () => {
    try {
      const list = await getCompanies();
      setCompanies(
        (list || []).map((c: { _id?: string; id?: string; name: string }) => ({
          id: c._id || (c as { id?: string }).id || "",
          name: c.name,
        }))
      );
    } catch (e) {
      console.error("Failed to load companies", e);
      setCompanies([]);
    }
  }, []);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params: { type?: CalendarType; companyId?: string } = {};
      if (typeFilter === "GLOBAL" || typeFilter === "COMPANY") params.type = typeFilter;
      if (companyIdFilter) params.companyId = companyIdFilter;
      const data = await listComplianceCalendars(params);
      setEntries(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load calendar deadlines";
      setApiError(msg);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, companyIdFilter]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = entries;

  const handleCreate = async (payload: CreatePayload) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await createComplianceCalendar(payload);
      setShowCreateModal(false);
      await loadEntries();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, payload: UpdatePayload) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await updateComplianceCalendar(id, payload);
      setEditEntry(null);
      await loadEntries();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await deleteComplianceCalendar(id);
      setDeleteEntry(null);
      await loadEntries();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardCard className="overflow-visible">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-body flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Calendar deadlines
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Platform and company compliance deadlines. As a client you can add global deadlines only; edit and delete only your own.
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-lg shrink-0"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add deadline
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Dropdown
            className="w-auto min-w-[140px]"
            align="left"
            side="bottom"
            trigger={
              <Button variant="outline" size="sm" className="w-auto min-w-[140px] h-9 justify-between">
                {typeFilter === "" ? "All types" : typeFilter}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            }
            items={[
              { id: "all", label: "All types", onClick: () => setTypeFilter("") },
              { id: "GLOBAL", label: "Global", onClick: () => setTypeFilter("GLOBAL") },
              { id: "COMPANY", label: "Company", onClick: () => setTypeFilter("COMPANY") },
            ]}
          />
          <Dropdown
            className="w-auto min-w-[180px]"
            align="left"
            side="bottom"
            trigger={
              <Button variant="outline" size="sm" className="w-auto min-w-[180px] h-9 justify-between">
                {companyIdFilter
                  ? companies.find((c) => c.id === companyIdFilter)?.name ?? "Company"
                  : "All companies"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            }
            items={[
              { id: "", label: "All companies", onClick: () => setCompanyIdFilter("") },
              ...companies.map((c) => ({
                id: c.id,
                label: c.name,
                onClick: () => setCompanyIdFilter(c.id),
              })),
            ]}
          />
        </div>
      </div>

      <div className="p-6">
        {apiError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading…
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No calendar deadlines found. Add a global deadline to get started.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Due date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Company</th>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide">Frequency</th>
                  <th className="px-4 py-3 text-xs font-semibold text-brand-body uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-brand-body">{formatDate(entry.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-brand-body">{entry.title}</span>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{entry.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium ${
                          entry.type === "GLOBAL"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.serviceCategory}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.frequency === "CUSTOM" && entry.customFrequencyPeriodValue != null && entry.customFrequencyPeriodUnit
                        ? `Every ${entry.customFrequencyPeriodValue} ${entry.customFrequencyPeriodUnit.toLowerCase()}`
                        : entry.frequency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setViewEntry(entry)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditEntry(entry)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteEntry(entry)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal – CLIENT: GLOBAL only */}
      {showCreateModal && (
        <CreateEditForm
          mode="create"
          initial={{ type: "GLOBAL" }}
          clientRole
          onSave={(payload) => handleCreate(payload as CreatePayload)}
          onClose={() => { setShowCreateModal(false); setActionError(null); }}
          submitting={submitting}
          error={actionError}
        />
      )}

      {/* View modal */}
      {viewEntry && (
        <ViewModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
        />
      )}

      {/* Edit modal */}
      {editEntry && (
        <CreateEditForm
          mode="edit"
          initial={editEntry}
          clientRole={false}
          onSave={(payload) => handleUpdate(editEntry.id, payload as UpdatePayload)}
          onClose={() => { setEditEntry(null); setActionError(null); }}
          submitting={submitting}
          error={actionError}
        />
      )}

      {/* Delete confirm */}
      {deleteEntry && (
        <Modal
          isOpen={true}
          onClose={() => { setDeleteEntry(null); setActionError(null); }}
          title="Delete deadline"
        >
          <div className="space-y-4">
            <p className="text-sm text-brand-body">
              Delete &quot;{deleteEntry.title}&quot;? This cannot be undone.
            </p>
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteEntry(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={submitting}
                onClick={() => handleDelete(deleteEntry.id)}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardCard>
  );
}

function ViewModal({
  entry,
  onClose,
}: {
  entry: ComplianceCalendarEntry;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={true} onClose={onClose} title={entry.title}>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>{" "}
          <span className="font-medium text-brand-body">{entry.type}</span>
        </div>
        {entry.company && (
          <div>
            <span className="text-muted-foreground">Company:</span>{" "}
            <span className="font-medium text-brand-body">{entry.company.name}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Due date:</span>{" "}
          <span className="font-medium text-brand-body">{formatDate(entry.dueDate)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Start date:</span>{" "}
          <span className="font-medium text-brand-body">{formatDate(entry.startDate)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Category:</span>{" "}
          <span className="font-medium text-brand-body">{entry.serviceCategory}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Frequency:</span>{" "}
          <span className="font-medium text-brand-body">
            {entry.frequency === "CUSTOM" && entry.customFrequencyPeriodValue != null && entry.customFrequencyPeriodUnit
              ? `Every ${entry.customFrequencyPeriodValue} ${entry.customFrequencyPeriodUnit.toLowerCase()}`
              : entry.frequency}
          </span>
        </div>
        {entry.description && (
          <div>
            <span className="text-muted-foreground">Description:</span>
            <p className="mt-1 text-brand-body">{entry.description}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function CreateEditForm({
  mode,
  initial,
  clientRole,
  onSave,
  onClose,
  submitting,
  error,
}: {
  mode: "create" | "edit";
  initial: Partial<ComplianceCalendarEntry> & { type?: CalendarType };
  clientRole: boolean;
  onSave: (p: CreatePayload | UpdatePayload) => Promise<void> | void;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [type, setType] = useState<CalendarType>(initial.type ?? "GLOBAL");
  const [companyId, setCompanyId] = useState(initial.companyId ?? "");
  const [startDate, setStartDate] = useState(
    initial.startDate ? initial.startDate.slice(0, 10) : ""
  );
  const [dueDate, setDueDate] = useState(
    initial.dueDate ? initial.dueDate.slice(0, 10) : ""
  );
  const [frequency, setFrequency] = useState<Frequency>(initial.frequency ?? "YEARLY");
  const [customUnit, setCustomUnit] = useState<CustomFrequencyUnit | "">(
    initial.customFrequencyPeriodUnit ?? ""
  );
  const [customValue, setCustomValue] = useState(
    initial.customFrequencyPeriodValue ?? 1
  );
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(
    initial.serviceCategory ?? "ACCOUNTING"
  );

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  useEffect(() => {
    getCompanies().then((list) =>
      setCompanies(
        (list || []).map((c: { _id?: string; id?: string; name: string }) => ({
          id: c._id || (c as { id?: string }).id || "",
          name: c.name,
        }))
      )
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = dateToStartISO(startDate);
    const due = dateToEndISO(dueDate);
    if (!title.trim()) return;
    if (!start || !due) return;
    if (frequency === "CUSTOM" && (!customUnit || customValue < 1)) return;

    if (mode === "create") {
      const payload: CreatePayload = {
        type: clientRole ? "GLOBAL" : type,
        title: title.trim(),
        description: description.trim() || null,
        startDate: start,
        dueDate: due,
        frequency,
        serviceCategory,
      };
      if (!clientRole && type === "COMPANY" && companyId) payload.companyId = companyId;
      if (frequency === "CUSTOM") {
        payload.customFrequencyPeriodUnit = customUnit as CustomFrequencyUnit;
        payload.customFrequencyPeriodValue = customValue;
      }
      onSave(payload);
    } else {
      const payload: UpdatePayload = {
        title: title.trim(),
        description: description.trim() || null,
        startDate: start,
        dueDate: due,
        frequency,
        serviceCategory,
      };
      if (!clientRole) {
        payload.type = type;
        if (type === "COMPANY") payload.companyId = companyId || null;
      }
      if (frequency === "CUSTOM") {
        payload.customFrequencyPeriodUnit = customUnit as CustomFrequencyUnit;
        payload.customFrequencyPeriodValue = customValue;
      }
      onSave(payload);
    }
  };

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === "create" ? "Add deadline (global)" : "Edit deadline"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {mode === "create" && clientRole && (
          <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 border border-border p-3">
            As a client you can only create global deadlines. Company-specific entries are managed by your service team.
          </p>
        )}

        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} min-h-[72px] resize-y`}
            rows={2}
          />
        </div>

        {!clientRole && mode === "create" && (
          <>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CalendarType)}
                className={inputClass}
              >
                <option value="GLOBAL">Global</option>
                <option value="COMPANY">Company</option>
              </select>
            </div>
            {type === "COMPANY" && (
              <div>
                <label className={labelClass}>Company *</label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className={inputClass}
                  required={type === "COMPANY"}
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Due date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Service category *</label>
          <select
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
            className={inputClass}
          >
            {SERVICE_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Frequency *</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className={inputClass}
          >
            {FREQUENCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {frequency === "CUSTOM" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Every</label>
              <input
                type="number"
                min={1}
                value={customValue}
                onChange={(e) => setCustomValue(parseInt(e.target.value, 10) || 1)}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Unit</label>
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value as CustomFrequencyUnit)}
                className={inputClass}
              >
                {CUSTOM_UNIT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
