"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookMarked,
  Calendar,
  Plus,
  LayoutDashboard,
  FileText,
  ListTree,
  RefreshCw,
  Pencil,
  Trash2,
  Receipt,
  BookOpen,
  Repeat,
  BarChart2,
  Eye,
  Landmark,
  History,
  Percent,
  Wallet,
} from "lucide-react";
import { BookkeepingPillTabs } from "./BookkeepingPillTabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  accountingApi,
  ACCOUNTING_ENDPOINTS,
  QUICKBOOKS_ENDPOINTS,
} from "@/api/accountingService";
import { CYCLE_STATUSES, TRANSACTION_TYPES, TABLE_WRAPPER_CLASS, TABLE_HEADER_ROW_CLASS } from "./constants";
import type { AccountingCycle, AccountingTransaction, ChartAccount, QBReportRow } from "./types";
import { TableSkeleton, useTableState, TablePagination, SearchAndDateFilter } from "./common";
import { SyncHistoryTab, InvoicesTab, BillsTab, AgingTab } from "./tabs";
import { flattenReportRows, currencyCodeFromRef } from "./utils";

const BOOKKEEPING_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: FileText },
  { id: "chart-of-accounts", label: "Chart of accounts", icon: ListTree },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "bills", label: "Bills", icon: FileText },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "recurring-expenses", label: "Recurring expenses", icon: Repeat },
  { id: "bank-accounts", label: "Bank accounts", icon: Landmark },
  { id: "ap-ar-aging", label: "AP/AR Aging", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart2 },
  { id: "sync-history", label: "Sync history", icon: History },
  { id: "tax", label: "Tax", icon: Percent },
];

interface ClientBookkeepingContentProps {
  engagementId?: string;
  companyId?: string;
}

export default function ClientBookkeepingContent({
  engagementId,
  companyId,
}: ClientBookkeepingContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [cycle, setCycle] = useState<AccountingCycle | null>(null);
  const [cycleLoading, setCycleLoading] = useState(true);
  const [cycleError, setCycleError] = useState(false);
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsForbidden, setTransactionsForbidden] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([]);
  const [chartAccountsLoading, setChartAccountsLoading] = useState(false);
  const [quickbooksAvailable, setQuickbooksAvailable] = useState(false);
  const [qbInvoices, setQbInvoices] = useState<any[]>([]);
  const [qbInvoicesLoading, setQbInvoicesLoading] = useState(false);
  const [qbBills, setQbBills] = useState<any[]>([]);
  const [qbBillsLoading, setQbBillsLoading] = useState(false);
  const [qbJournal, setQbJournal] = useState<any[]>([]);
  const [qbJournalLoading, setQbJournalLoading] = useState(false);
  const [qbRecurring, setQbRecurring] = useState<any[]>([]);
  const [qbRecurringLoading, setQbRecurringLoading] = useState(false);
  const [qbBankAccounts, setQbBankAccounts] = useState<any[]>([]);
  const [qbBankAccountsLoading, setQbBankAccountsLoading] = useState(false);
  const [qbReportsDashboard, setQbReportsDashboard] = useState<any>(null);
  const [qbReportsLoading, setQbReportsLoading] = useState(false);
  const [syncHistoryList, setSyncHistoryList] = useState<any[]>([]);
  const [syncHistoryLoading, setSyncHistoryLoading] = useState(false);
  const [agingData, setAgingData] = useState<{ ap: any; ar: any }>({ ap: null, ar: null });
  const [agingLoading, setAgingLoading] = useState(false);
  const [taxEntity, setTaxEntity] = useState<any>(null);
  const [taxEntityLoading, setTaxEntityLoading] = useState(false);
  const [journalLineItems, setJournalLineItems] = useState<any[]>([]);
  const [journalItemsLoading, setJournalItemsLoading] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isCreateBillModalOpen, setIsCreateBillModalOpen] = useState(false);

  const cycleId = cycle?.id;
  const cycleCompanyId = cycle?.companyId;
  const qbCompanyId = cycleCompanyId ?? companyId;
  const hasCycle = !!cycle && typeof cycle === "object" && "id" in cycle;

  const fetchCycle = useCallback(async () => {
    if (!engagementId) return;
    setCycleLoading(true);
    setCycleError(false);
    try {
      const res = await accountingApi.get<{ data: AccountingCycle }>(
        ACCOUNTING_ENDPOINTS.GET_BY_ENGAGEMENT_ID(engagementId)
      );
      const data = (res as any)?.data ?? res;
      setCycle(Array.isArray(data) ? null : data);
    } catch (e: any) {
      if (e?.response?.status !== 404) setCycleError(true);
      setCycle(null);
    } finally {
      setCycleLoading(false);
    }
  }, [engagementId]);

  useEffect(() => {
    fetchCycle();
  }, [fetchCycle]);

  useEffect(() => {
    if (!companyId) return;
    accountingApi
      .get<{ data?: { available?: boolean } }>(
        ACCOUNTING_ENDPOINTS.QUICKBOOKS_AVAILABLE(companyId)
      )
      .then((r) => setQuickbooksAvailable((r as any)?.data?.available ?? false))
      .catch(() => setQuickbooksAvailable(false));
  }, [companyId]);

  useEffect(() => {
    if (!cycleId || activeTab !== "transactions") return;
    setTransactionsLoading(true);
    setTransactionsForbidden(false);
    accountingApi
      .get<{ data?: AccountingTransaction[] }>(
        ACCOUNTING_ENDPOINTS.TRANSACTIONS_BY_CYCLE(cycleId)
      )
      .then((r: any) => {
        const raw = r?.data ?? r;
        setTransactions(Array.isArray(raw) ? raw : []);
      })
      .catch((e: any) => {
        if (e?.response?.status === 403) setTransactionsForbidden(true);
        setTransactions([]);
      })
      .finally(() => setTransactionsLoading(false));
  }, [cycleId, activeTab]);

  useEffect(() => {
    const id = cycleCompanyId ?? companyId;
    if (!id) return;
    const needChart =
      activeTab === "chart-of-accounts" || isTransactionModalOpen || isCreateInvoiceModalOpen || isCreateBillModalOpen;
    if (!needChart) return;
    setChartAccountsLoading(true);
    accountingApi
      .get<{ data?: ChartAccount[] }>(ACCOUNTING_ENDPOINTS.CHART_OF_ACCOUNTS(id))
      .then((r) => setChartAccounts((r as any)?.data ?? []))
      .catch(() => setChartAccounts([]))
      .finally(() => setChartAccountsLoading(false));
  }, [cycleCompanyId, companyId, activeTab, isTransactionModalOpen, isCreateInvoiceModalOpen, isCreateBillModalOpen]);

  useEffect(() => {
    if (!qbCompanyId || !quickbooksAvailable) return;
    if (activeTab === "invoices") {
      setQbInvoicesLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.INVOICES(qbCompanyId)).then((r: any) => {
        setQbInvoices(r?.data ?? []);
        setQbInvoicesLoading(false);
      }).catch(() => { setQbInvoices([]); setQbInvoicesLoading(false); });
    }
    if (activeTab === "bills") {
      setQbBillsLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.BILLS(qbCompanyId)).then((r: any) => {
        setQbBills(r?.data ?? []);
        setQbBillsLoading(false);
      }).catch(() => { setQbBills([]); setQbBillsLoading(false); });
    }
    if (activeTab === "journal") {
      setQbJournalLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.JOURNAL(qbCompanyId)).then((r: any) => {
        setQbJournal(r?.data ?? []);
        setQbJournalLoading(false);
      }).catch(() => { setQbJournal([]); setQbJournalLoading(false); });
    }
    if (activeTab === "recurring-expenses") {
      setQbRecurringLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.RECURRING_EXPENSES(qbCompanyId)).then((r: any) => {
        setQbRecurring(r?.data ?? []);
        setQbRecurringLoading(false);
      }).catch(() => { setQbRecurring([]); setQbRecurringLoading(false); });
    }
    if (activeTab === "bank-accounts") {
      setQbBankAccountsLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.BANK_ACCOUNTS(qbCompanyId)).then((r: any) => {
        setQbBankAccounts(r?.data ?? []);
        setQbBankAccountsLoading(false);
      }).catch(() => { setQbBankAccounts([]); setQbBankAccountsLoading(false); });
    }
    if (activeTab === "reports") {
      setQbReportsLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.REPORTS_DASHBOARD(qbCompanyId)).then((r: any) => {
        setQbReportsDashboard(r?.data ?? null);
        setQbReportsLoading(false);
      }).catch(() => { setQbReportsDashboard(null); setQbReportsLoading(false); });
    }
    if (activeTab === "sync-history") {
      setSyncHistoryLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.SYNC_HISTORY(qbCompanyId)).then((r: any) => {
        setSyncHistoryList(r?.data ?? []);
        setSyncHistoryLoading(false);
      }).catch(() => { setSyncHistoryList([]); setSyncHistoryLoading(false); });
    }
    if (activeTab === "ap-ar-aging") {
      setAgingLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.AGING_SYNCED(qbCompanyId)).then((r: any) => {
        setAgingData(r?.data ?? { ap: null, ar: null });
        setAgingLoading(false);
      }).catch(() => { setAgingData({ ap: null, ar: null }); setAgingLoading(false); });
    }
    if (activeTab === "tax") {
      setTaxEntityLoading(true);
      accountingApi.get(QUICKBOOKS_ENDPOINTS.TAX_ENTITY(qbCompanyId)).then((r: any) => {
        const raw = r?.data ?? r;
        setTaxEntity(raw && typeof raw === "object" ? raw : null);
        setTaxEntityLoading(false);
      }).catch(() => { setTaxEntity(null); setTaxEntityLoading(false); });
    }
  }, [qbCompanyId, quickbooksAvailable, activeTab]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<AccountingTransaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [transactionFormError, setTransactionFormError] = useState<string | null>(null);
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Record<string, unknown> | null>(null);
  const [viewBill, setViewBill] = useState<Record<string, unknown> | null>(null);
  const [viewJournalId, setViewJournalId] = useState<string | null>(null);
  const [mapInvoiceLoading, setMapInvoiceLoading] = useState<string | null>(null);
  const [mapBillLoading, setMapBillLoading] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [invoiceFormError, setInvoiceFormError] = useState<string | null>(null);
  const [billFormError, setBillFormError] = useState<string | null>(null);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [billSubmitting, setBillSubmitting] = useState(false);
  const [uploadInvoiceLoading, setUploadInvoiceLoading] = useState(false);
  const [uploadInvoiceError, setUploadInvoiceError] = useState<string | null>(null);

  const [txForm, setTxForm] = useState({
    type: "EXPENSE",
    txnDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    totalAmount: "",
    taxAmount: "",
    currency: "USD",
    vendor: "",
    customer: "",
    docNumber: "",
    description: "",
    lineItems: [{ chartAccountId: "", amount: "", description: "" }],
  });
  const [invoiceForm, setInvoiceForm] = useState({
    customer: "",
    docNumber: "",
    txnDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    totalAmount: "",
    currency: "USD",
    description: "",
    lineItems: [{ chartAccountId: "", amount: "", description: "" }],
  });
  const [billForm, setBillForm] = useState({
    vendor: "",
    docNumber: "",
    txnDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    totalAmount: "",
    currency: "USD",
    description: "",
    lineItems: [{ chartAccountId: "", amount: "", description: "" }],
  });

  const isOrgAdmin = true;
  const chartAccountsTableState = useTableState({
    data: chartAccounts,
    pageSize: 10,
    searchKeys: ["code", "name", "classification", "accountType"],
  });

  useEffect(() => {
    if (!qbCompanyId || !viewJournalId) return;
    setJournalItemsLoading(true);
    accountingApi
      .get(QUICKBOOKS_ENDPOINTS.JOURNAL_ITEMS(qbCompanyId, viewJournalId))
      .then((r: any) => {
        const raw = r?.data ?? r;
        const items = raw?.lineItems ?? raw?.Line ?? [];
        setJournalLineItems(Array.isArray(items) ? items : []);
      })
      .catch(() => setJournalLineItems([]))
      .finally(() => setJournalItemsLoading(false));
  }, [qbCompanyId, viewJournalId]);

  const handleCreateCycle = async () => {
    if (!engagementId) return;
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const payload: any = { engagementId };
      if (periodStart) payload.periodStart = new Date(periodStart).toISOString();
      if (periodEnd) payload.periodEnd = new Date(periodEnd).toISOString();
      await accountingApi.post(ACCOUNTING_ENDPOINTS.CREATE_CYCLE, payload);
      fetchCycle();
      setIsCreateModalOpen(false);
      setPeriodStart("");
      setPeriodEnd("");
    } catch (e: any) {
      setCreateError(e?.message ?? "Failed to create accounting cycle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!cycleId || !engagementId) return;
    setStatusUpdateError(null);
    setStatusUpdateLoading(true);
    try {
      await accountingApi.patch(ACCOUNTING_ENDPOINTS.UPDATE_STATUS(cycleId), {
        status: newStatus,
      });
      fetchCycle();
    } catch (e: any) {
      setStatusUpdateError(e?.message ?? "Failed to update status");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleSyncFromQB = async () => {
    if (!qbCompanyId || !engagementId || !cycleId) return;
    setSyncError(null);
    setSyncLoading(true);
    try {
      await accountingApi.post(ACCOUNTING_ENDPOINTS.IMPORT_SYNC_ALL(qbCompanyId));
      fetchCycle();
      setChartAccounts([]);
      setTransactions([]);
      setSyncHistoryList([]);
      setAgingData({ ap: null, ar: null });
      setQbBankAccounts([]);
    } catch (e: any) {
      setSyncError(e?.message ?? "Sync failed");
    } finally {
      setSyncLoading(false);
    }
  };

  const openTransactionModal = (txn?: AccountingTransaction | null) => {
    setTransactionFormError(null);
    if (txn) {
      setEditingTransaction(txn);
      setTxForm({
        type: txn.type,
        txnDate: txn.txnDate ? new Date(txn.txnDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        dueDate: txn.dueDate ? new Date(txn.dueDate).toISOString().slice(0, 10) : "",
        totalAmount: String(txn.totalAmount ?? ""),
        taxAmount: txn.taxAmount != null ? String(txn.taxAmount) : "",
        currency: txn.currency ?? "USD",
        vendor: txn.vendor ?? "",
        customer: txn.customer ?? "",
        docNumber: txn.docNumber ?? "",
        description: txn.description ?? "",
        lineItems:
          txn.lineItems?.length > 0
            ? txn.lineItems.map((li) => ({
                chartAccountId: li.chartAccountId,
                amount: String(li.amount),
                description: li.description ?? "",
              }))
            : [{ chartAccountId: "", amount: "", description: "" }],
      });
    } else {
      setEditingTransaction(null);
      setTxForm({
        type: "EXPENSE",
        txnDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        totalAmount: "",
        taxAmount: "",
        currency: "USD",
        vendor: "",
        customer: "",
        docNumber: "",
        description: "",
        lineItems: [{ chartAccountId: "", amount: "", description: "" }],
      });
    }
    setIsTransactionModalOpen(true);
  };

  const handleSubmitTransaction = async () => {
    if (!cycleId || !engagementId) return;
    setTransactionFormError(null);
    const totalNum = parseFloat(txForm.totalAmount);
    if (isNaN(totalNum) || txForm.lineItems.some((li) => !li.chartAccountId || li.amount === "")) {
      setTransactionFormError("Please fill required fields and at least one line item with account and amount.");
      return;
    }
    const lineItems = txForm.lineItems
      .filter((li) => li.chartAccountId && li.amount !== "")
      .map((li) => ({
        chartAccountId: li.chartAccountId,
        amount: parseFloat(li.amount) || 0,
        description: li.description || undefined,
      }));
    if (lineItems.length === 0) {
      setTransactionFormError("At least one line item with account and amount is required.");
      return;
    }
    setTransactionSubmitting(true);
    try {
      const payload = {
        type: txForm.type,
        txnDate: new Date(txForm.txnDate).toISOString(),
        totalAmount: totalNum,
        currency: txForm.currency,
        vendor: txForm.vendor || undefined,
        customer: txForm.customer || undefined,
        docNumber: txForm.docNumber || undefined,
        description: txForm.description || undefined,
        dueDate: txForm.dueDate ? new Date(txForm.dueDate).toISOString() : undefined,
        taxAmount: txForm.taxAmount ? parseFloat(txForm.taxAmount) : undefined,
        lineItems,
      };
      if (editingTransaction) {
        await accountingApi.patch(
          ACCOUNTING_ENDPOINTS.UPDATE_TRANSACTION(cycleId, editingTransaction.id),
          payload
        );
      } else {
        await accountingApi.post(ACCOUNTING_ENDPOINTS.CREATE_TRANSACTION(cycleId), payload);
      }
      fetchCycle();
      setTransactions([]);
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
    } catch (e: any) {
      setTransactionFormError(e?.message ?? "Failed to save transaction");
    } finally {
      setTransactionSubmitting(false);
    }
  };

  const handleMapInvoiceToTransaction = async (qbInvoiceId: string) => {
    if (!cycleCompanyId || !cycleId) return;
    setMapInvoiceLoading(qbInvoiceId);
    try {
      await accountingApi.post(
        ACCOUNTING_ENDPOINTS.MAP_INVOICE_TO_TRANSACTION(cycleCompanyId, qbInvoiceId),
        { accountingCycleId: cycleId }
      );
      fetchCycle();
      setTransactions([]);
    } catch (e: any) {
      alert(e?.message ?? "Failed to link invoice");
    } finally {
      setMapInvoiceLoading(null);
    }
  };

  const handleMapBillToTransaction = async (qbBillId: string) => {
    if (!cycleCompanyId || !cycleId) return;
    setMapBillLoading(qbBillId);
    try {
      await accountingApi.post(
        ACCOUNTING_ENDPOINTS.MAP_BILL_TO_TRANSACTION(cycleCompanyId, qbBillId),
        { accountingCycleId: cycleId }
      );
      fetchCycle();
      setTransactions([]);
    } catch (e: any) {
      alert(e?.message ?? "Failed to link bill");
    } finally {
      setMapBillLoading(null);
    }
  };

  const handleUploadInvoice = async (file: File) => {
    if (!cycleId || !engagementId) return;
    setUploadInvoiceError(null);
    setUploadInvoiceLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await accountingApi.postFormData(
        ACCOUNTING_ENDPOINTS.UPLOAD_INVOICE(cycleId),
        formData
      );
      fetchCycle();
      setTransactions([]);
    } catch (e: any) {
      setUploadInvoiceError(e?.response?.data?.message ?? e?.message ?? "Upload failed");
    } finally {
      setUploadInvoiceLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!qbCompanyId || !cycleId) return;
    setInvoiceFormError(null);
    const totalNum = parseFloat(invoiceForm.totalAmount);
    if (isNaN(totalNum) || invoiceForm.lineItems.some((li) => !li.chartAccountId || li.amount === "")) {
      setInvoiceFormError("Fill required fields and at least one line item.");
      return;
    }
    const lineItems = invoiceForm.lineItems
      .filter((li) => li.chartAccountId && li.amount !== "")
      .map((li) => ({
        chartAccountId: li.chartAccountId,
        amount: parseFloat(li.amount) || 0,
        description: li.description || undefined,
      }));
    if (lineItems.length === 0) {
      setInvoiceFormError("At least one line item required.");
      return;
    }
    setInvoiceSubmitting(true);
    try {
      await accountingApi.post(QUICKBOOKS_ENDPOINTS.CREATE_INVOICE(qbCompanyId), {
        accountingCycleId: cycleId,
        type: "INVOICE",
        customer: invoiceForm.customer || undefined,
        docNumber: invoiceForm.docNumber || undefined,
        txnDate: new Date(invoiceForm.txnDate).toISOString(),
        dueDate: invoiceForm.dueDate ? new Date(invoiceForm.dueDate).toISOString() : undefined,
        totalAmount: totalNum,
        currency: invoiceForm.currency,
        description: invoiceForm.description || undefined,
        lineItems,
      });
      setQbInvoices([]);
      fetchCycle();
      setIsCreateInvoiceModalOpen(false);
      setInvoiceForm({
        customer: "",
        docNumber: "",
        txnDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        totalAmount: "",
        currency: "USD",
        description: "",
        lineItems: [{ chartAccountId: "", amount: "", description: "" }],
      });
    } catch (e: any) {
      setInvoiceFormError(e?.message ?? "Failed to create invoice");
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const handleCreateBill = async () => {
    if (!qbCompanyId || !cycleId) return;
    setBillFormError(null);
    const totalNum = parseFloat(billForm.totalAmount);
    if (isNaN(totalNum) || billForm.lineItems.some((li) => !li.chartAccountId || li.amount === "")) {
      setBillFormError("Fill required fields and at least one line item.");
      return;
    }
    const lineItems = billForm.lineItems
      .filter((li) => li.chartAccountId && li.amount !== "")
      .map((li) => ({
        chartAccountId: li.chartAccountId,
        amount: parseFloat(li.amount) || 0,
        description: li.description || undefined,
      }));
    if (lineItems.length === 0) {
      setBillFormError("At least one line item required.");
      return;
    }
    setBillSubmitting(true);
    try {
      await accountingApi.post(QUICKBOOKS_ENDPOINTS.CREATE_BILL(qbCompanyId), {
        accountingCycleId: cycleId,
        type: "BILL",
        vendor: billForm.vendor || undefined,
        docNumber: billForm.docNumber || undefined,
        txnDate: new Date(billForm.txnDate).toISOString(),
        dueDate: billForm.dueDate ? new Date(billForm.dueDate).toISOString() : undefined,
        totalAmount: totalNum,
        currency: billForm.currency,
        description: billForm.description || undefined,
        lineItems,
      });
      setQbBills([]);
      fetchCycle();
      setIsCreateBillModalOpen(false);
      setBillForm({
        vendor: "",
        docNumber: "",
        txnDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        totalAmount: "",
        currency: "USD",
        description: "",
        lineItems: [{ chartAccountId: "", amount: "", description: "" }],
      });
    } catch (e: any) {
      setBillFormError(e?.message ?? "Failed to create bill");
    } finally {
      setBillSubmitting(false);
    }
  };

  if (cycleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px] p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full mt-4" />
        </div>
      </div>
    );
  }

  if (cycleError && !hasCycle) {
    return (
      <div className="space-y-6 rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
        Failed to load accounting cycle. Please try again.
      </div>
    );
  }

  if (!hasCycle) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 text-muted-foreground">
          <BookMarked className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Accounting cycle not created yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Create an accounting cycle to start bookkeeping for this engagement, or contact your organization admin.
        </p>
        <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl gap-2">
          <Plus size={18} />
          Create accounting cycle
        </Button>
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create accounting cycle"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCycle} disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create cycle"}
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground mb-4">
            Set the period (start and end date) for this bookkeeping cycle.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start date</label>
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End date</label>
              <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {companyId && (
        <div
          className={
            quickbooksAvailable
              ? "flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-green-800 text-sm font-medium"
              : "flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/40 border border-border text-foreground text-sm font-medium"
          }
        >
          <span className="font-semibold">QuickBooks:</span>
          <span>{quickbooksAvailable ? "Connected" : "Not connected"}</span>
        </div>
      )}

      <div className="w-full overflow-hidden flex items-center">
        <BookkeepingPillTabs
          tabs={BOOKKEEPING_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
        {activeTab === "overview" && (
          <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Cycle overview</h3>
                  <p className="text-sm text-muted-foreground">
                    {cycle?.company?.name ?? "Company"} · {cycle?.status ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {isOrgAdmin && (
                  <select
                    value={cycle?.status ?? ""}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdateLoading}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {CYCLE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                )}
                {quickbooksAvailable && (
                  <Button variant="outline" size="sm" onClick={handleSyncFromQB} disabled={syncLoading} className="gap-2 rounded-xl">
                    <RefreshCw className={`h-4 w-4 ${syncLoading ? "animate-spin" : ""}`} />
                    {syncLoading ? "Syncing…" : "Sync from QuickBooks"}
                  </Button>
                )}
              </div>
            </div>
            {statusUpdateError && <p className="mb-4 text-sm text-destructive">{statusUpdateError}</p>}
            {syncError && <p className="mb-4 text-sm text-destructive">{syncError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Period start</p>
                <p className="font-semibold text-foreground">
                  {cycle?.periodStart ? new Date(cycle.periodStart).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Period end</p>
                <p className="font-semibold text-foreground">
                  {cycle?.periodEnd ? new Date(cycle.periodEnd).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
            {typeof cycle?.transactionsCount === "number" && (
              <p className="mt-4 text-sm text-muted-foreground">
                {cycle.transactionsCount} transaction(s) in this cycle
              </p>
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="p-6">
            {transactionsForbidden ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                <p className="font-medium">You do not have access to view transactions for this engagement.</p>
              </div>
            ) : (
              <>
                {transactionsLoading ? (
                  <TableSkeleton columns={7} rows={5} />
                ) : (
                  <div className={TABLE_WRAPPER_CLASS}>
                    <Table>
                      <TableHeader>
                        <TableRow className={TABLE_HEADER_ROW_CLASS}>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Doc #</TableHead>
                          <TableHead>Vendor / Customer</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>QB Sync</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No data available here
                            </TableCell>
                          </TableRow>
                        ) : (
                          transactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{tx.type}</TableCell>
                              <TableCell>{tx.txnDate ? new Date(tx.txnDate).toLocaleDateString() : "—"}</TableCell>
                              <TableCell>{tx.docNumber ?? "—"}</TableCell>
                              <TableCell>{tx.vendor ?? tx.customer ?? "—"}</TableCell>
                              <TableCell className="text-right font-medium">
                                {typeof tx.totalAmount === "number" ? tx.totalAmount.toFixed(2) : tx.totalAmount}
                              </TableCell>
                              <TableCell>{tx.currency ?? "USD"}</TableCell>
                              <TableCell>{tx.quickbooksSyncStatus ?? "—"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "chart-of-accounts" && (
          <div className="p-6">
            {qbCompanyId && quickbooksAvailable && (
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={handleSyncFromQB} disabled={syncLoading} className="gap-2 rounded-xl">
                  <RefreshCw className={`h-4 w-4 ${syncLoading ? "animate-spin" : ""}`} />
                  {syncLoading ? "Syncing…" : "Sync from QuickBooks"}
                </Button>
              </div>
            )}
            {chartAccountsLoading ? (
              <TableSkeleton columns={5} rows={5} />
            ) : (
              <>
                <SearchAndDateFilter
                  search={chartAccountsTableState.search}
                  onSearchChange={chartAccountsTableState.setSearch}
                  showDateFilter={false}
                />
                <div className={TABLE_WRAPPER_CLASS}>
                  <Table>
                    <TableHeader>
                      <TableRow className={TABLE_HEADER_ROW_CLASS}>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chartAccountsTableState.sliced.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No data available here
                          </TableCell>
                        </TableRow>
                      ) : (
                        chartAccountsTableState.sliced.map((acc) => (
                          <TableRow key={acc.id}>
                            <TableCell className="font-mono">{acc.code}</TableCell>
                            <TableCell>{acc.name}</TableCell>
                            <TableCell>{acc.classification}</TableCell>
                            <TableCell>{acc.accountType ?? "—"}</TableCell>
                            <TableCell>{acc.active ? "Yes" : "No"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  page={chartAccountsTableState.page}
                  pageSize={chartAccountsTableState.pageSize}
                  total={chartAccountsTableState.total}
                  onPageChange={chartAccountsTableState.setPage}
                  onPageSizeChange={chartAccountsTableState.setPageSize}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <InvoicesTab
            quickbooksAvailable={quickbooksAvailable}
            loading={qbInvoicesLoading}
            invoices={qbInvoices}
            isOrgAdmin={isOrgAdmin}
            mapInvoiceLoading={mapInvoiceLoading}
            onMapInvoice={handleMapInvoiceToTransaction}
            onCreateClick={() => setIsCreateInvoiceModalOpen(true)}
            cycleId={cycleId}
            onUploadInvoice={handleUploadInvoice}
            uploadInvoiceLoading={uploadInvoiceLoading}
            uploadInvoiceError={uploadInvoiceError}
            onClearUploadError={() => setUploadInvoiceError(null)}
            companyIdForQb={qbCompanyId}
            engagementId={engagementId}
            viewInvoice={viewInvoice}
            onViewInvoice={(inv) => setViewInvoice(inv as Record<string, unknown> | null)}
          />
        )}

        {activeTab === "bills" && (
          <BillsTab
            quickbooksAvailable={quickbooksAvailable}
            loading={qbBillsLoading}
            bills={qbBills}
            isOrgAdmin={isOrgAdmin}
            mapBillLoading={mapBillLoading}
            onMapBill={handleMapBillToTransaction}
            onCreateClick={() => setIsCreateBillModalOpen(true)}
            viewBill={viewBill}
            onViewBill={(bill) => setViewBill(bill as Record<string, unknown> | null)}
          />
        )}

        {activeTab === "journal" && (
          <div className="p-6">
            {!quickbooksAvailable ? (
              <p className="text-muted-foreground py-8 text-center">Connect QuickBooks to view journal entries.</p>
            ) : qbJournalLoading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : (
              <div className={TABLE_WRAPPER_CLASS}>
                <Table>
                  <TableHeader>
                    <TableRow className={TABLE_HEADER_ROW_CLASS}>
                      <TableHead>Date</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-24">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qbJournal.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No data available here
                        </TableCell>
                      </TableRow>
                    ) : (
                      qbJournal.map((entry: any, idx: number) => (
                        <TableRow key={entry.Id ?? idx}>
                          <TableCell>{entry.TxnDate ? new Date(entry.TxnDate).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>{entry.PrivateNote ?? "—"}</TableCell>
                          <TableCell className="text-right font-medium">{entry.TotalAmt != null ? Number(entry.TotalAmt).toFixed(2) : "—"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => setViewJournalId(entry.Id ?? null)}>
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            {viewJournalId && (
              <Modal isOpen={!!viewJournalId} onClose={() => setViewJournalId(null)} title="Journal entry lines" footer={<Button onClick={() => setViewJournalId(null)}>Close</Button>}>
                {journalItemsLoading ? (
                  <TableSkeleton columns={2} rows={3} />
                ) : (
                  <div className={TABLE_WRAPPER_CLASS}>
                    <Table>
                      <TableHeader>
                        <TableRow className={TABLE_HEADER_ROW_CLASS}>
                          <TableHead>Account / Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {journalLineItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                              No journal entry lines to show
                            </TableCell>
                          </TableRow>
                        ) : (
                          journalLineItems.map((line: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>{line.Description ?? line.AccountRef?.name ?? line.JournalEntryLineDetail?.AccountRef?.name ?? "—"}</TableCell>
                              <TableCell className="text-right">{line.Amount != null ? Number(line.Amount).toFixed(2) : "—"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Modal>
            )}
          </div>
        )}

        {activeTab === "recurring-expenses" && (
          <div className="p-6">
            {!quickbooksAvailable ? (
              <p className="text-muted-foreground py-8 text-center">Connect QuickBooks to view recurring expenses.</p>
            ) : qbRecurringLoading ? (
              <TableSkeleton columns={3} rows={5} />
            ) : (
              <div className={TABLE_WRAPPER_CLASS}>
                <Table>
                  <TableHeader>
                    <TableRow className={TABLE_HEADER_ROW_CLASS}>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Total amount</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qbRecurring.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No data available here
                        </TableCell>
                      </TableRow>
                    ) : (
                      qbRecurring.map((row: any, idx: number) => (
                        <TableRow key={row.vendorId ?? idx}>
                          <TableCell>{row.vendorName ?? row.VendorRef?.name ?? "—"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {(row.totalAmount ?? row.TotalAmt) != null ? Number(row.totalAmount ?? row.TotalAmt).toFixed(2) : "—"}
                          </TableCell>
                          <TableCell className="text-right">{Array.isArray(row.transactions) ? row.transactions.length : "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {activeTab === "bank-accounts" && (
          <div className="p-6">
            {!quickbooksAvailable ? (
              <p className="text-muted-foreground py-8 text-center">Connect QuickBooks to view bank accounts.</p>
            ) : qbBankAccountsLoading ? (
              <TableSkeleton columns={5} rows={5} />
            ) : (
              <>
                <h3 className="text-lg font-bold text-foreground mb-4">Bank accounts</h3>
                <div className={TABLE_WRAPPER_CLASS}>
                  <Table>
                    <TableHeader>
                      <TableRow className={TABLE_HEADER_ROW_CLASS}>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Currency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qbBankAccounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No data available here
                          </TableCell>
                        </TableRow>
                      ) : (
                        qbBankAccounts.map((acc: any, idx: number) => (
                          <TableRow key={acc.Id ?? idx}>
                            <TableCell className="font-medium">{acc.Name ?? "—"}</TableCell>
                            <TableCell>{acc.AccountType ?? "—"}</TableCell>
                            <TableCell className="text-right">{acc.Balance != null ? Number(acc.Balance).toFixed(2) : "—"}</TableCell>
                            <TableCell>{acc.CurrencyRef ? currencyCodeFromRef(acc.CurrencyRef) : "—"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="p-6">
            {!quickbooksAvailable ? (
              <p className="text-muted-foreground py-8 text-center">Connect QuickBooks to view financial reports.</p>
            ) : qbReportsLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-48 rounded" />
                <TableSkeleton columns={2} rows={4} />
              </div>
            ) : (
              <div className="space-y-8">
                <h3 className="text-lg font-bold text-foreground">Financial reports</h3>
                {["balanceSheet", "profitLoss", "cashFlow"].map((key) => {
                  const report = (qbReportsDashboard as any)?.[key] as { Rows?: { Row?: QBReportRow[] }; Header?: { ReportName?: string } } | undefined;
                  const rows = report?.Rows?.Row;
                  const flat = flattenReportRows(rows ?? []);
                  const title = key === "balanceSheet" ? "Balance Sheet" : key === "profitLoss" ? "Profit & Loss" : "Cash Flow";
                  return (
                    <div key={key}>
                      <h4 className="text-base font-semibold text-foreground mb-2">{title}</h4>
                      <div className={TABLE_WRAPPER_CLASS}>
                        <Table>
                          <TableHeader>
                            <TableRow className={TABLE_HEADER_ROW_CLASS}>
                              <TableHead>Account / Description</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {flat.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                                  No data available here
                                </TableCell>
                              </TableRow>
                            ) : (
                              flat.map((r, i) => (
                                <TableRow key={i} className={r.isSummary ? "bg-muted/30 font-medium" : r.isSection ? "bg-muted/20" : ""}>
                                  <TableCell className={r.isSection ? "font-medium" : ""}>{r.cells[0] ?? "—"}</TableCell>
                                  <TableCell className="text-right">{r.cells[1] ?? "—"}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "sync-history" && (
          <SyncHistoryTab quickbooksAvailable={quickbooksAvailable} loading={syncHistoryLoading} list={syncHistoryList} />
        )}

        {activeTab === "ap-ar-aging" && (
          <AgingTab quickbooksAvailable={quickbooksAvailable} loading={agingLoading} ap={agingData.ap} ar={agingData.ar} />
        )}

        {activeTab === "tax" && (
          <div className="p-6">
            {!quickbooksAvailable ? (
              <p className="text-muted-foreground py-8 text-center">Connect QuickBooks to view tax information.</p>
            ) : taxEntityLoading ? (
              <TableSkeleton columns={2} rows={4} />
            ) : !taxEntity?.jsonData ? (
              <p className="text-muted-foreground py-8 text-center">
                No tax/company info synced yet. Run &quot;Sync from QuickBooks&quot; on Overview to pull company (tax) data.
              </p>
            ) : (() => {
              const j = taxEntity.jsonData as { time?: string; CompanyInfo?: Record<string, unknown> };
              const info = j?.CompanyInfo ?? {};
              const time = j?.time;
              const addr = (a: Record<string, unknown> | undefined) =>
                a ? [a.Line1, a.Line2, a.City, a.CountrySubDivisionCode, a.PostalCode, a.Country].filter(Boolean).join(", ") : "—";
              const email = (e: { Address?: string } | undefined) => (e?.Address ? String(e.Address) : "—");
              const nameValues = Array.isArray(info.NameValue) ? (info.NameValue as Array<{ Name?: string; Value?: string }>) : [];
              return (
                <>
                  <h3 className="text-lg font-bold text-foreground mb-1">Company information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    From QuickBooks (synced with &quot;Sync from QuickBooks&quot;).
                    {time ? (
                      <span className="block mt-1">Last synced: {new Date(String(time)).toLocaleString()}</span>
                    ) : null}
                  </p>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/30 border border-[hsl(var(--foreground)/0.08)]">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Company</p>
                        <p className="font-semibold text-foreground">{String(info.CompanyName ?? info.LegalName ?? "—")}</p>
                        <p className="text-sm text-muted-foreground mt-1">{String(info.Country ?? "—")} · {String(info.domain ?? "—")}</p>
                        <p className="text-sm text-muted-foreground mt-1">Email: {email(info.Email as { Address?: string }) || email(info.CustomerCommunicationEmailAddr as { Address?: string })}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border border-[hsl(var(--foreground)/0.08)]">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fiscal &amp; time</p>
                        <p className="text-sm text-foreground">Fiscal year starts: {String(info.FiscalYearStartMonth ?? "—")}</p>
                        <p className="text-sm text-foreground">Company start: {info.CompanyStartDate ? new Date(String(info.CompanyStartDate)).toLocaleDateString() : "—"}</p>
                        <p className="text-sm text-foreground">Time zone: {String(info.DefaultTimeZone ?? "—")}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Addresses</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border border-[hsl(var(--foreground)/0.08)] bg-background">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Legal</p>
                          <p className="text-sm text-foreground">{addr(info.LegalAddr as Record<string, unknown>)}</p>
                        </div>
                        <div className="p-3 rounded-lg border border-[hsl(var(--foreground)/0.08)] bg-background">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Company</p>
                          <p className="text-sm text-foreground">{addr(info.CompanyAddr as Record<string, unknown>)}</p>
                        </div>
                        <div className="p-3 rounded-lg border border-[hsl(var(--foreground)/0.08)] bg-background">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Customer communication</p>
                          <p className="text-sm text-foreground">{addr(info.CustomerCommunicationAddr as Record<string, unknown>)}</p>
                        </div>
                      </div>
                    </div>
                    {typeof info.MetaData === "object" && info.MetaData !== null && (() => {
                      const meta = info.MetaData as { CreateTime?: string; LastUpdatedTime?: string };
                      const created = meta.CreateTime ? new Date(meta.CreateTime).toLocaleString() : "—";
                      const updated = meta.LastUpdatedTime ? new Date(meta.LastUpdatedTime).toLocaleString() : "—";
                      return (
                        <div className="p-4 rounded-xl bg-muted/20 border border-[hsl(var(--foreground)/0.08)]">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metadata</p>
                          <p className="text-sm text-foreground">
                            Created: {created} · Last updated: {updated}
                          </p>
                        </div>
                      );
                    })()}
                    {nameValues.length > 0 && (
                      <div className={TABLE_WRAPPER_CLASS}>
                        <Table>
                          <TableHeader>
                            <TableRow className={TABLE_HEADER_ROW_CLASS}>
                              <TableHead>Name</TableHead>
                              <TableHead>Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {nameValues.map((nv, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium text-foreground">{nv.Name ?? "—"}</TableCell>
                                <TableCell className="text-muted-foreground">{nv.Value ?? "—"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Transaction modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => { setIsTransactionModalOpen(false); setEditingTransaction(null); setTransactionFormError(null); }}
        title={editingTransaction ? "Edit transaction" : "Add transaction"}
        size="wide"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsTransactionModalOpen(false); setEditingTransaction(null); }}>Cancel</Button>
            <Button onClick={handleSubmitTransaction} disabled={transactionSubmitting}>
              {transactionSubmitting ? "Saving…" : editingTransaction ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select value={txForm.type} onChange={(e) => setTxForm((p) => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground">
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transaction date *</label>
              <input type="date" value={txForm.txnDate} onChange={(e) => setTxForm((p) => ({ ...p, txnDate: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due date</label>
              <input type="date" value={txForm.dueDate} onChange={(e) => setTxForm((p) => ({ ...p, dueDate: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total amount *</label>
              <input type="number" step="0.01" value={txForm.totalAmount} onChange={(e) => setTxForm((p) => ({ ...p, totalAmount: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <input type="text" value={txForm.vendor} onChange={(e) => setTxForm((p) => ({ ...p, vendor: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <input type="text" value={txForm.customer} onChange={(e) => setTxForm((p) => ({ ...p, customer: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Line items *</label>
            <Button type="button" variant="outline" size="sm" onClick={() => setTxForm((p) => ({ ...p, lineItems: [...p.lineItems, { chartAccountId: "", amount: "", description: "" }] }))} className="rounded-lg mb-2">Add line</Button>
            <div className="space-y-2">
              {txForm.lineItems.map((li, idx) => (
                <div key={idx} className="flex gap-2 items-center flex-wrap">
                  <select
                    value={li.chartAccountId}
                    onChange={(e) => setTxForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, chartAccountId: e.target.value } : item) }))}
                    className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-border bg-background text-sm"
                  >
                    <option value="">Select account</option>
                    {chartAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.code} – {acc.name}</option>
                    ))}
                  </select>
                  <input type="number" step="0.01" placeholder="Amount" value={li.amount} onChange={(e) => setTxForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, amount: e.target.value } : item) }))} className="w-28 px-3 py-2 rounded-xl border border-border text-sm" />
                  <input type="text" placeholder="Description" value={li.description} onChange={(e) => setTxForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, description: e.target.value } : item) }))} className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-border text-sm" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setTxForm((p) => ({ ...p, lineItems: p.lineItems.length > 1 ? p.lineItems.filter((_, i) => i !== idx) : [{ chartAccountId: "", amount: "", description: "" }] }))} className="text-destructive h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          {transactionFormError && <p className="text-sm text-destructive">{transactionFormError}</p>}
        </div>
      </Modal>

      {/* Delete confirm */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete transaction"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!cycleId || !deleteConfirmId) return;
                  try {
                    await accountingApi.delete(ACCOUNTING_ENDPOINTS.DELETE_TRANSACTION(cycleId, deleteConfirmId));
                    fetchCycle();
                    setTransactions([]);
                    setDeleteConfirmId(null);
                  } catch (e: any) {
                    alert(e?.message ?? "Delete failed");
                  }
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone. Synced transactions cannot be deleted.</p>
        </Modal>
      )}

      {/* Create invoice modal - placeholder to match partner; full form can be added */}
      <Modal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
        title="Create invoice"
        size="wide"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateInvoiceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={invoiceSubmitting}>
              {invoiceSubmitting ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground mb-4">Create an invoice for this cycle. Fill customer, date, total amount, and line items.</p>
        <div className="space-y-4">
          <input type="text" placeholder="Customer" value={invoiceForm.customer} onChange={(e) => setInvoiceForm((p) => ({ ...p, customer: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
          <input type="date" value={invoiceForm.txnDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, txnDate: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
          <input type="number" step="0.01" placeholder="Total amount" value={invoiceForm.totalAmount} onChange={(e) => setInvoiceForm((p) => ({ ...p, totalAmount: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
          {invoiceForm.lineItems.map((li, idx) => (
            <div key={idx} className="flex gap-2">
              <select value={li.chartAccountId} onChange={(e) => setInvoiceForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, chartAccountId: e.target.value } : item) }))} className="flex-1 px-3 py-2 rounded-xl border border-border">
                <option value="">Account</option>
                {chartAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.code} – {acc.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Amount" value={li.amount} onChange={(e) => setInvoiceForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, amount: e.target.value } : item) }))} className="w-28 px-3 py-2 rounded-xl border border-border" />
            </div>
          ))}
          {invoiceFormError && <p className="text-sm text-destructive">{invoiceFormError}</p>}
        </div>
      </Modal>

      {/* Create bill modal - placeholder */}
      <Modal
        isOpen={isCreateBillModalOpen}
        onClose={() => setIsCreateBillModalOpen(false)}
        title="Create bill"
        size="wide"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateBillModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBill} disabled={billSubmitting}>
              {billSubmitting ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground mb-4">Create a bill for this cycle. Fill vendor, date, total amount, and line items.</p>
        <div className="space-y-4">
          <input type="text" placeholder="Vendor" value={billForm.vendor} onChange={(e) => setBillForm((p) => ({ ...p, vendor: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
          <input type="date" value={billForm.txnDate} onChange={(e) => setBillForm((p) => ({ ...p, txnDate: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
          <input type="number" step="0.01" placeholder="Total amount" value={billForm.totalAmount} onChange={(e) => setBillForm((p) => ({ ...p, totalAmount: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-border" />
          {billForm.lineItems.map((li, idx) => (
            <div key={idx} className="flex gap-2">
              <select value={li.chartAccountId} onChange={(e) => setBillForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, chartAccountId: e.target.value } : item) }))} className="flex-1 px-3 py-2 rounded-xl border border-border">
                <option value="">Account</option>
                {chartAccounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.code} – {acc.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Amount" value={li.amount} onChange={(e) => setBillForm((p) => ({ ...p, lineItems: p.lineItems.map((item, i) => i === idx ? { ...item, amount: e.target.value } : item) }))} className="w-28 px-3 py-2 rounded-xl border border-border" />
            </div>
          ))}
          {billFormError && <p className="text-sm text-destructive">{billFormError}</p>}
        </div>
      </Modal>
    </div>
  );
}
