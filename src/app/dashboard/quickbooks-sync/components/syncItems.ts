// syncItems.ts

export type SyncItem = {
  title: string;
  description: string;
  endpoint: string;
  syncingKey: keyof SyncStatus;
  successMsg: string;
  failureMsg: string;
};

export type SyncStatus = {
  syncing: boolean;
  syncingCompany: boolean;
  syncingAccountsData: boolean;
  syncingCashFlowTrend: boolean;
  syncingRecurringExpenses: boolean;
  syncChartAccounts: boolean;
  syncApArAging: boolean;
  syncBankBalance: boolean;
  syncingInvoiceData: boolean;
  syncingJournal: boolean;
  syncingTax: boolean;
   syncingTransaction: boolean; // ✅ Add this line
};

export const syncItems: SyncItem[] = [
  {
    title: 'Sync Reports',
    description: 'Sync QuickBooks reports for the past twelve months manually.',
    endpoint: 'sync/reports',
    syncingKey: 'syncing',
    successMsg: 'QuickBooks data synced successfully.',
    failureMsg: 'Failed to sync QuickBooks data.',
  },
  {
    title: 'Sync Tax Data',
    description: 'Sync QuickBooks Tax Data manually.',
    endpoint: 'sync/taxData',
    syncingKey: 'syncingTax',
    successMsg: 'QuickBooks tax data synced successfully.',
    failureMsg: 'Failed to sync tax data.',
  },
  {
    title: 'Sync Company',
    description: 'Sync QuickBooks Company manually.',
    endpoint: 'sync/companyData',
    syncingKey: 'syncingCompany',
    successMsg: 'QuickBooks company data synced successfully.',
    failureMsg: 'Failed to sync company data.',
  },
  {
    title: 'Sync Ledger',
    description: 'Sync QuickBooks Ledger manually.',
    endpoint: 'sync/journalData',
    syncingKey: 'syncingJournal',
    successMsg: 'QuickBooks ledger data synced successfully.',
    failureMsg: 'Failed to sync ledger data.',
  },
  {
    title: 'Sync Transaction',
    description: 'Sync QuickBooks Transaction manually.',
    endpoint: 'sync/transactionData',
    syncingKey: 'syncingTransaction',
    successMsg: 'QuickBooks transaction data synced successfully.',
    failureMsg: 'Failed to sync transaction data.',
  },
  
   {
    title: 'Sync Accounts Data',
    description: 'Sync QuickBooks accounts data manually.',
    endpoint: 'sync/accountsData',
    syncingKey: 'syncingAccountsData',
    successMsg: 'QuickBooks accounts data synced successfully.',
    failureMsg: 'Failed to sync accounts data.',
  }, 
  {
    title: 'Sync Invoices',
    description: 'Sync QuickBooks invoice data manually.',
    endpoint: 'sync/invoiceData',
    syncingKey: 'syncingInvoiceData',
    successMsg: 'QuickBooks invoice data synced successfully.',
    failureMsg: 'Failed to sync invoice data.',
  }, 
  /*  {
    title: 'Cash Flow Trend',
    description: 'Sync QuickBooks cashflow trend data manually.',
    endpoint: 'sync/cashFlowTrend',
    syncingKey: 'syncingCashFlowTrend',
    successMsg: 'QuickBooks cashflow trend synced successfully.',
    failureMsg: 'Failed to sync cashflow trend.',
  },  */
  
  {
    title: 'Sync Recurring Expenses',
    description: 'Sync QuickBooks recurring expenses manually.',
    endpoint: 'sync/recurringData',
    syncingKey: 'syncingRecurringExpenses',
    successMsg: 'QuickBooks recurring expenses synced successfully.',
    failureMsg: 'Failed to sync recurring expenses.',
  }, 
   {
    title: 'Sync Bank Balance',
    description: 'Sync Bank Balance manually.',
    endpoint: 'sync/bankBalanceData',
    syncingKey: 'syncBankBalance',
    successMsg: 'QuickBooks bank balance synced successfully.',
    failureMsg: 'Failed to sync bank balance.',
  }, 
  {
    title: 'Sync AP Aging AR Aging',
    description: 'Sync AP Aging AR Aging manually.',
    endpoint: 'sync/apArAgingData',
    syncingKey: 'syncApArAging',
    successMsg: 'QuickBooks AP Aging AR Aging synced successfully.',
    failureMsg: 'Failed to sync AP Aging AR Aging.',
  },
   {
    title: 'Sync Chart Accounts',
    description: 'Sync Chart Accounts manually.',
    endpoint: 'sync/chartAccounts',
    syncingKey: 'syncChartAccounts',
    successMsg: 'QuickBooks Chart Accounts synced successfully.',
    failureMsg: 'Failed to sync Chart Accounts .',
  },
];
