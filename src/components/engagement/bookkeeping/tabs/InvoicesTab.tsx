"use client";

import { useState } from "react";
import { Plus, Eye, Link2, Upload, RefreshCw, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableSkeleton,
  TABLE_WRAPPER_CLASS,
  TABLE_HEADER_ROW_CLASS,
  StatsCards,
  TablePagination,
  SearchAndDateFilter,
  useTableState,
  InvoiceDetailDialog,
} from "../common";
import type { QBInvoiceDetail } from "../types";

interface InvoiceRow {
  Id?: string;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  TotalAmt?: number;
  Balance?: number;
  CustomerRef?: { name?: string };
  linkedFile?: { id: string; url: string; file_name: string } | null;
}

interface InvoicesTabProps {
  quickbooksAvailable: boolean;
  loading: boolean;
  invoices: InvoiceRow[];
  stats?: { total?: number; outstanding?: number; count?: number };
  isOrgAdmin?: boolean;
  mapInvoiceLoading: string | null;
  onMapInvoice: (qbInvoiceId: string) => void;
  onCreateClick?: () => void;
  cycleId?: string | null;
  onUploadInvoice?: (file: File) => Promise<void>;
  uploadInvoiceLoading?: boolean;
  uploadInvoiceError?: string | null;
  onClearUploadError?: () => void;
  companyIdForQb?: string | null;
  engagementId?: string | null;
  onLinkFile?: (qbInvoiceId: string, fileId: string) => Promise<void>;
  viewInvoice: QBInvoiceDetail | Record<string, unknown> | null;
  onViewInvoice: (inv: InvoiceRow | null) => void;
}

export interface LinkedFileInfo {
  id: string;
  url: string;
  file_name: string;
}

const ACCEPT_INVOICE_FILES = "application/pdf,image/jpeg,image/png,image/tiff";

export function InvoicesTab({
  quickbooksAvailable,
  loading,
  invoices,
  stats,
  isOrgAdmin,
  mapInvoiceLoading,
  onMapInvoice,
  onCreateClick,
  cycleId,
  onUploadInvoice,
  uploadInvoiceLoading = false,
  uploadInvoiceError,
  onClearUploadError,
  companyIdForQb,
  onLinkFile,
  viewInvoice,
  onViewInvoice,
}: InvoicesTabProps) {
  const [linkFileForId, setLinkFileForId] = useState<string | null>(null);
  const [linkFileError, setLinkFileError] = useState<string | null>(null);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    total,
    sliced,
  } = useTableState({
    data: invoices,
    pageSize: 10,
    searchKeys: ["DocNumber", "CustomerRef"] as (keyof InvoiceRow)[],
    searchFn: (item, s) => {
      const doc = (item.DocNumber ?? "").toLowerCase();
      const cust = (item.CustomerRef?.name ?? "").toLowerCase();
      return doc.includes(s) || cust.includes(s);
    },
    dateKey: "TxnDate",
    filterByDateRange: true,
  });

  if (!quickbooksAvailable) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground py-8 text-center">
          Connect QuickBooks to view and create invoices.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/30 animate-pulse"
            />
          ))}
        </div>
        <TableSkeleton columns={isOrgAdmin ? 9 : 8} rows={5} />
      </div>
    );
  }

  const paidCount = invoices.filter((i) => (i.Balance ?? 0) <= 0).length;
  const unpaidCount = invoices.filter((i) => (i.Balance ?? 0) > 0).length;
  const outstanding =
    stats?.outstanding != null
      ? Number(stats.outstanding).toFixed(2)
      : invoices
          .reduce((s, i) => s + (Number(i.Balance) || 0), 0)
          .toFixed(2);

  return (
    <div className="p-6 space-y-4">
      {(onCreateClick || onUploadInvoice) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {cycleId && onUploadInvoice && (
            <>
              <input
                type="file"
                accept={ACCEPT_INVOICE_FILES}
                className="hidden"
                id="invoice-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadInvoice(file).finally(() => {
                      e.target.value = "";
                    });
                  }
                }}
                disabled={uploadInvoiceLoading}
              />
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("invoice-upload")?.click()
                }
                disabled={uploadInvoiceLoading}
                className="gap-2 rounded-xl"
              >
                {uploadInvoiceLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload invoice
              </Button>
            </>
          )}
          {isOrgAdmin && onCreateClick && (
            <Button onClick={onCreateClick} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Create invoice
            </Button>
          )}
        </div>
      )}
      {uploadInvoiceError && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm flex items-center justify-between">
          <span>{uploadInvoiceError}</span>
          {onClearUploadError && (
            <Button variant="ghost" size="sm" onClick={onClearUploadError}>
              Dismiss
            </Button>
          )}
        </div>
      )}
      <StatsCards
        items={[
          { label: "Paid", value: paidCount },
          { label: "Unpaid", value: unpaidCount },
          { label: "Total invoices", value: invoices.length },
          { label: "Outstanding balance", value: outstanding, highlight: true },
        ]}
        className="w-full"
      />
      <SearchAndDateFilter
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        searchPlaceholder="Search by doc # or customer..."
        showDateFilter={true}
      />
      <div className={TABLE_WRAPPER_CLASS}>
        <Table>
          <TableHeader>
            <TableRow className={TABLE_HEADER_ROW_CLASS}>
              <TableHead>Invoice number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="w-32">View</TableHead>
              <TableHead className="w-24" title="View file">
                <Eye className="h-4 w-4 inline" />
              </TableHead>
              <TableHead className="w-32">Attachment</TableHead>
              {isOrgAdmin && (
                <TableHead className="w-32">Link to cycle</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sliced.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isOrgAdmin ? 9 : 8}
                  className="text-center text-muted-foreground py-8"
                >
                  No data available here
                </TableCell>
              </TableRow>
            ) : (
              sliced.map((inv, idx) => (
                <TableRow key={inv.Id ?? idx}>
                  <TableCell className="font-medium">
                    {inv.DocNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    {inv.TxnDate
                      ? new Date(inv.TxnDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {inv.DueDate
                      ? new Date(inv.DueDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {inv.TotalAmt != null
                      ? Number(inv.TotalAmt).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {inv.Balance != null ? Number(inv.Balance).toFixed(2) : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8"
                      onClick={() => onViewInvoice(inv)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8"
                      disabled={!inv.linkedFile}
                      title={inv.linkedFile ? "View file" : "No file linked"}
                      onClick={() =>
                        inv.linkedFile &&
                        window.open(inv.linkedFile.url, "_blank")
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {inv.linkedFile ? (
                      <span
                        className="text-sm truncate max-w-[120px] block"
                        title={inv.linkedFile.file_name}
                      >
                        {inv.linkedFile.file_name}
                      </span>
                    ) : (
                      "—"
                    )}
                    {companyIdForQb && onLinkFile && inv.Id && !String(inv.Id).startsWith("local-") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-8 mt-1"
                        onClick={() => {
                          if (inv.Id) {
                            setLinkFileForId(inv.Id);
                            setLinkFileError(null);
                          }
                        }}
                      >
                        <Paperclip className="h-4 w-4" />
                        Link file
                      </Button>
                    )}
                  </TableCell>
                  {isOrgAdmin && inv.Id && !String(inv.Id).startsWith("local-") && (
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-8"
                        disabled={mapInvoiceLoading === inv.Id}
                        onClick={() => inv.Id && onMapInvoice(inv.Id)}
                      >
                        {mapInvoiceLoading === inv.Id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                        Link
                      </Button>
                    </TableCell>
                  )}
                  {isOrgAdmin && inv.Id && String(inv.Id).startsWith("local-") && (
                    <TableCell className="text-muted-foreground text-xs">
                      Uploaded
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {total > 0 && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
      <InvoiceDetailDialog
        open={!!viewInvoice}
        onOpenChange={(open) => !open && onViewInvoice(null)}
        invoice={viewInvoice}
      />

      <Modal
        isOpen={!!linkFileForId}
        onClose={() => {
          setLinkFileForId(null);
          setLinkFileError(null);
        }}
        title="Link file to invoice"
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setLinkFileForId(null);
              setLinkFileError(null);
            }}
          >
            Cancel
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground mb-4">
          Choose a file from the engagement&apos;s Invoices folder to attach to
          this QuickBooks invoice.
        </p>
        {linkFileError && (
          <p className="text-sm text-destructive mb-4">{linkFileError}</p>
        )}
        <div className="py-6 text-center text-sm text-muted-foreground">
          No files in the Invoices folder. Upload an invoice first to see files
          here, or use your document library.
        </div>
      </Modal>
    </div>
  );
}
