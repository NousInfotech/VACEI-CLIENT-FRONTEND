export interface ETBRow {
  _id: string;
  code: string;
  accountName: string;
  currentYear: number;
  priorYear: number;
  adjustments: number;
  reclassification: number;
  finalBalance: number;
  classification: string;
  grouping1?: string;
  grouping2?: string;
  grouping3?: string;
  grouping4?: string;
  linkedExcelFiles?: any[];
  mappings?: any[];
  adjustmentRefs?: string[];
  reclassificationRefs?: string[];
  isNewAccount?: boolean;
}

export interface AdjustmentEntry {
  etbRowId: string;
  code: string;
  accountName: string;
  dr: number;
  cr: number;
  details: string;
}

export interface Adjustment {
  _id: string;
  engagementId: string;
  etbId: string;
  adjustmentNo: string;
  description: string;
  status: string;
  entries: AdjustmentEntry[];
  totalDr: number;
  totalCr: number;
  createdAt: string;
  updatedAt: string;
  evidenceFiles: any[];
  history?: any[];
}

export interface ReclassificationEntry {
  etbRowId: string;
  code: string;
  accountName: string;
  dr: number;
  cr: number;
  details: string;
}

export interface Reclassification {
  _id: string;
  engagementId: string;
  etbId: string;
  reclassificationNo: string;
  description: string;
  status: string;
  entries: ReclassificationEntry[];
  totalDr: number;
  totalCr: number;
  createdAt: string;
  updatedAt: string;
  evidenceFiles: any[];
  history?: any[];
  __v?: number;
}

export interface LeadSheetFinal {
  level: string;
  id: string;
  group: string;
  totals: {
    currentYear: number;
    priorYear: number;
    adjustments: number;
    reclassification: number;
    finalBalance: number;
  };
  rows: string[];
}

export interface LeadSheetGrouping {
  level: string;
  group: string;
  children: (LeadSheetGrouping | LeadSheetFinal)[];
}

export interface FinancialYearData {
  year: number;
  net_result: number;
  resultType: string;
  breakdowns: Record<string, { value: number; accounts: string[] }>;
}

export interface BalanceSheetYearData {
  year: number;
  totals: {
    assets: { value: number; accounts: string[] };
    liabilities: { value: number; accounts: string[] };
    equity: { value: number; accounts: string[] };
  };
  balanced: boolean;
}

export interface EngagementData {
  engagement: {
    title: string;
    yearEndDate: string;
  };
  company: {
    name: string;
    registrationNumber: string;
    address: string;
  };
  etb: ETBRow[];
  adjustments: Adjustment[];
  reclassifications: Reclassification[];
  profit_and_loss: {
    prior_year: FinancialYearData;
    current_year: FinancialYearData;
  };
  balance_sheet: {
    prior_year: BalanceSheetYearData;
    current_year: BalanceSheetYearData;
  };
  lead_sheets: LeadSheetGrouping[];
  documentRequests: any[];
}

export const MOCK_ENGAGEMENT_DATA: EngagementData = {
  engagement: {
    title: "Audit Engagement 2024",
    yearEndDate: "2024-12-31"
  },
  company: {
    name: "Springfield Egg Farm Ltd",
    registrationNumber: "01234567",
    address: "123 Farm Road, Springfield, SP1 1EE"
  },
  etb: [
    {
      "_id": "row_690cafecf694875bd80da500",
      "code": "1000",
      "accountName": "Stock",
      "currentYear": 80514,
      "priorYear": 80514,
      "adjustments": 4210,
      "finalBalance": 84724,
      "classification": "Assets > Current > Inventories > Finished goods",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Inventories",
      "grouping4": "Finished goods",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690ded9764086700aec83d9f"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da501",
      "code": "1100",
      "accountName": "Debtors Control Account",
      "currentYear": 44413,
      "priorYear": 33202,
      "adjustments": -1,
      "finalBalance": 44412,
      "classification": "Assets > Current > Trade and other receivables > Trade Receivables",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Trade and other receivables",
      "grouping4": "Trade Receivables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da502",
      "code": "1200",
      "accountName": "Bank Current Account",
      "currentYear": -42127,
      "priorYear": -55662,
      "adjustments": 0,
      "finalBalance": -42127,
      "classification": "Liabilities > Current > Borrowings > Bank overdraft",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Borrowings",
      "grouping4": "Bank overdraft",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da504",
      "code": "2100",
      "accountName": "Creditors control account",
      "currentYear": -23904,
      "priorYear": -23903,
      "adjustments": 0,
      "finalBalance": -23904,
      "classification": "Liabilities > Current > Trade and other payables > Trade payables",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Trade payables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da506",
      "code": "2109",
      "accountName": "Accruals",
      "currentYear": 783,
      "priorYear": 783,
      "adjustments": 0,
      "finalBalance": 783,
      "classification": "Liabilities > Current > Trade and other payables > Amount due to Shareholder",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Amount due to Shareholder",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da507",
      "code": "2110",
      "accountName": "FSS due",
      "currentYear": 0,
      "priorYear": -2433,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "Liabilities > Current > Trade and other payables > Other payables",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Other payables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da508",
      "code": "2201",
      "accountName": "Purchase tax control account",
      "currentYear": 24738,
      "priorYear": 12880,
      "adjustments": -434,
      "finalBalance": 24304,
      "classification": "Assets > Current > Trade and other receivables > Other receivables",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Trade and other receivables",
      "grouping4": "Other receivables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da509",
      "code": "2202",
      "accountName": "VAT Liability",
      "currentYear": -2252,
      "priorYear": 5038,
      "adjustments": 0,
      "finalBalance": -2252,
      "classification": "Assets > Current > Trade and other receivables > Other receivables",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Trade and other receivables",
      "grouping4": "Other receivables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da50a",
      "code": "11",
      "accountName": "FSS Liability",
      "currentYear": -2433,
      "priorYear": 0,
      "adjustments": 0,
      "finalBalance": -2433,
      "classification": "Liabilities > Current > Trade and other payables > Other payables",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Other payables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da50b",
      "code": "3010",
      "accountName": "Capital",
      "currentYear": -15000,
      "priorYear": -15000,
      "adjustments": 0,
      "finalBalance": -15000,
      "classification": "Equity > Equity > Share capital",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Equity",
      "grouping3": "Share capital",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da50c",
      "code": "3060",
      "accountName": "JJD Loan",
      "currentYear": 97516,
      "priorYear": 96429,
      "adjustments": 0,
      "finalBalance": 97516,
      "classification": "Assets > Current > Trade and other receivables > Amount due from Subsidiary Co.",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Trade and other receivables",
      "grouping4": "Amount due from Subsidiary Co.",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da50d",
      "code": "2101",
      "accountName": "Shareholders Loan",
      "currentYear": -3127,
      "priorYear": 0,
      "adjustments": 1258,
      "finalBalance": -1869,
      "classification": "Liabilities > Current > Trade and other payables > Amount due to Shareholder",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Amount due to Shareholder",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da50e",
      "code": "3200",
      "accountName": "Profit and loss account",
      "currentYear": -547982,
      "priorYear": -577594,
      "adjustments": -29612,
      "finalBalance": -577594,
      "classification": "Equity > Equity > Retained earnings",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Equity",
      "grouping3": "Retained earnings",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da50f",
      "code": "3500",
      "accountName": "Company tax",
      "currentYear": 45850,
      "priorYear": 19376,
      "adjustments": -23494,
      "finalBalance": 22356,
      "classification": "Assets > Current > Trade and other receivables > Other receivables",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Trade and other receivables",
      "grouping4": "Other receivables",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c",
        "690deddd64086700aec83db5"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da510",
      "code": "3501",
      "accountName": "Deferred Tax",
      "currentYear": -8925,
      "priorYear": -8079,
      "adjustments": 846,
      "finalBalance": -8079,
      "classification": "Liabilities > Non-current > Deferred tax liability",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Non-current",
      "grouping3": "Deferred tax liability",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da511",
      "code": "new",
      "accountName": "Accruals - Audit Fee",
      "currentYear": 0,
      "priorYear": 0,
      "adjustments": -1400,
      "finalBalance": -1400,
      "classification": "Liabilities > Current > Trade and other payables > Accrued expenses",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Accrued expenses",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690ded4e64086700aec83d95"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da512",
      "code": "4000",
      "accountName": "Sales - Eggs",
      "currentYear": -913753,
      "priorYear": -883342,
      "adjustments": 0,
      "finalBalance": -913753,
      "classification": "Equity > Current Year Profits & Losses > Revenue > Sale of goods",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Revenue",
      "grouping4": "Sale of goods",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da513",
      "code": "4200",
      "accountName": "SUBSIDIES - GOVT",
      "currentYear": -55,
      "priorYear": 0,
      "adjustments": 0,
      "finalBalance": -55,
      "classification": "Equity > Current Year Profits & Losses > Revenue > Sale of goods",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Revenue",
      "grouping4": "Sale of goods",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da514",
      "code": "4300",
      "accountName": "Covid Assistance",
      "currentYear": 0,
      "priorYear": 0,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "",
      "reclassification": 0,
      "grouping1": "",
      "grouping2": "",
      "grouping3": "",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da515",
      "code": "5000",
      "accountName": "Feeds",
      "currentYear": 361708,
      "priorYear": 397310,
      "adjustments": 0,
      "finalBalance": 361708,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da516",
      "code": "5100",
      "accountName": "Plastic trays - Packing",
      "currentYear": 32261,
      "priorYear": 68604,
      "adjustments": 0,
      "finalBalance": 32261,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da517",
      "code": "5200",
      "accountName": "Chicks - Purchases",
      "currentYear": 18745,
      "priorYear": 21207,
      "adjustments": -4210,
      "finalBalance": 14535,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690ded9764086700aec83d9f"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da518",
      "code": "5250",
      "accountName": "Eggs for resale",
      "currentYear": 203344,
      "priorYear": 189618,
      "adjustments": 0,
      "finalBalance": 203344,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da519",
      "code": "5300",
      "accountName": "Medicines",
      "currentYear": 17986,
      "priorYear": 8406,
      "adjustments": -8406,
      "finalBalance": 9580,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da51a",
      "code": "5400",
      "accountName": "Fuel",
      "currentYear": 4268,
      "priorYear": 4253,
      "adjustments": -4253,
      "finalBalance": 15,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da51b",
      "code": "5450",
      "accountName": "Waste Disposal - incineration",
      "currentYear": 0,
      "priorYear": 0,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "",
      "reclassification": 0,
      "grouping1": "",
      "grouping2": "",
      "grouping3": "",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da51c",
      "code": "5499",
      "accountName": "Stock Movement",
      "currentYear": -40070,
      "priorYear": 0,
      "adjustments": 40070,
      "finalBalance": 0,
      "classification": "",
      "reclassification": 0,
      "grouping1": "",
      "grouping2": "",
      "grouping3": "",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da51d",
      "code": "5500",
      "accountName": "Feeds/ Transport - Cost of sales",
      "currentYear": 13354,
      "priorYear": 2113,
      "adjustments": -2113,
      "finalBalance": 11241,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da51e",
      "code": "5600",
      "accountName": "Stock movement",
      "currentYear": 0,
      "priorYear": -40070,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "Equity > Current Year Profits & Losses > Cost of sales",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Cost of sales",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da51f",
      "code": "7000",
      "accountName": "Telephones",
      "currentYear": 952,
      "priorYear": 750,
      "adjustments": 0,
      "finalBalance": 952,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da520",
      "code": "7100",
      "accountName": "Wages + NI",
      "currentYear": 146714,
      "priorYear": 164722,
      "adjustments": 0,
      "finalBalance": 146714,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da521",
      "code": "7102",
      "accountName": "Directors Salaries",
      "currentYear": 0,
      "priorYear": 0,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "",
      "reclassification": 0,
      "grouping1": "",
      "grouping2": "",
      "grouping3": "",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da522",
      "code": "7150",
      "accountName": "Stationery + Printing",
      "currentYear": 0,
      "priorYear": 425,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da523",
      "code": "7175",
      "accountName": "Adverts",
      "currentYear": 2195,
      "priorYear": 1436,
      "adjustments": 0,
      "finalBalance": 2195,
      "classification": "Equity > Current Year Profits & Losses > Sales and marketing expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Sales and marketing expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da524",
      "code": "7200",
      "accountName": "Licenses & Insurance",
      "currentYear": 2450,
      "priorYear": 2522,
      "adjustments": 0,
      "finalBalance": 2450,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da525",
      "code": "7250",
      "accountName": "Life insurance",
      "currentYear": 893,
      "priorYear": 893,
      "adjustments": 0,
      "finalBalance": 893,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da526",
      "code": "7260",
      "accountName": "Subscriptions",
      "currentYear": 350,
      "priorYear": 350,
      "adjustments": 0,
      "finalBalance": 350,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da527",
      "code": "7300",
      "accountName": "Transport expenses",
      "currentYear": 7428,
      "priorYear": 2168,
      "adjustments": 0,
      "finalBalance": 7428,
      "classification": "Equity > Current Year Profits & Losses > Sales and marketing expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Sales and marketing expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da528",
      "code": "7500",
      "accountName": "Personal - Directors fees",
      "currentYear": 0,
      "priorYear": 0,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "",
      "reclassification": 0,
      "grouping1": "",
      "grouping2": "",
      "grouping3": "",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da529",
      "code": "7550",
      "accountName": "Cleaning",
      "currentYear": 383,
      "priorYear": 299,
      "adjustments": 0,
      "finalBalance": 383,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da52a",
      "code": "7600",
      "accountName": "Electricity & fuel",
      "currentYear": 10431,
      "priorYear": 14616,
      "adjustments": 0,
      "finalBalance": 10431,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da52b",
      "code": "7700",
      "accountName": "Bank Charges & Interest",
      "currentYear": 1095,
      "priorYear": 863,
      "adjustments": 0,
      "finalBalance": 1095,
      "classification": "Equity > Current Year Profits & Losses > Finance costs",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Finance costs",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da52c",
      "code": "7800",
      "accountName": "Depreciation",
      "currentYear": 0,
      "priorYear": 15086,
      "adjustments": 16301,
      "finalBalance": 16301,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690decb564086700aec83d88"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da52d",
      "code": "7900",
      "accountName": "Audit fees",
      "currentYear": 3100,
      "priorYear": 1225,
      "adjustments": 1400,
      "finalBalance": 4500,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690ded4e64086700aec83d95"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da52e",
      "code": "7901",
      "accountName": "Professional fees",
      "currentYear": 1441,
      "priorYear": 832,
      "adjustments": 0,
      "finalBalance": 1441,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da52f",
      "code": "7950",
      "accountName": "Maintenance",
      "currentYear": 11771,
      "priorYear": 13558,
      "adjustments": 0,
      "finalBalance": 11771,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da530",
      "code": "7951",
      "accountName": "Donations",
      "currentYear": 5700,
      "priorYear": 3800,
      "adjustments": 0,
      "finalBalance": 5700,
      "classification": "Equity > Current Year Profits & Losses > Administrative expenses",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Administrative expenses",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da531",
      "code": "9000",
      "accountName": "Income tax P+L",
      "currentYear": 0,
      "priorYear": 2428,
      "adjustments": 22076,
      "finalBalance": 22076,
      "classification": "Equity > Current Year Profits & Losses > Income tax expense",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Income tax expense",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deddd64086700aec83db5"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da532",
      "code": "9001",
      "accountName": "Deferred Tax Expense",
      "currentYear": 0,
      "priorYear": -846,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "Equity > Current Year Profits & Losses > Income tax expense",
      "reclassification": 0,
      "grouping1": "Equity",
      "grouping2": "Current Year Profits & Losses",
      "grouping3": "Income tax expense",
      "grouping4": "",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da533",
      "code": "500",
      "accountName": "Equipment",
      "currentYear": 606084,
      "priorYear": 604249,
      "adjustments": -1,
      "finalBalance": 606083,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Cost",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Cost",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da534",
      "code": "501",
      "accountName": "Prov for Depn - Equipment",
      "currentYear": -587586,
      "priorYear": -587168,
      "adjustments": -3366,
      "finalBalance": -590952,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Accumulated Depreciation",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Accumulated Depreciation",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c",
        "690decb564086700aec83d88"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da535",
      "code": "510",
      "accountName": "Building Improvements",
      "currentYear": 580946,
      "priorYear": 580946,
      "adjustments": 0,
      "finalBalance": 580946,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Cost",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Cost",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da536",
      "code": "0511",
      "accountName": "Prov for Depn - Building Improvements",
      "currentYear": -181124,
      "priorYear": -180957,
      "adjustments": -7833,
      "finalBalance": -188957,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Accumulated Depreciation",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Accumulated Depreciation",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c",
        "690decb564086700aec83d88"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da537",
      "code": "0525",
      "accountName": "Furniture + fittings",
      "currentYear": 55848,
      "priorYear": 55848,
      "adjustments": 0,
      "finalBalance": 55848,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Cost",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Cost",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da538",
      "code": "0526",
      "accountName": "Prov for Depn - Furniture + fittings",
      "currentYear": -44556,
      "priorYear": -44416,
      "adjustments": -2145,
      "finalBalance": -46701,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Accumulated Depreciation",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Accumulated Depreciation",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c",
        "690decb564086700aec83d88"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da539",
      "code": "0550",
      "accountName": "Vehicles",
      "currentYear": 66916,
      "priorYear": 52416,
      "adjustments": 0,
      "finalBalance": 66916,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Cost",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Cost",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row_690cafecf694875bd80da53a",
      "code": "0551",
      "accountName": "Prov for Depn - Vehicles",
      "currentYear": -45089,
      "priorYear": -44600,
      "adjustments": -1743,
      "finalBalance": -46832,
      "classification": "Assets > Non-current > Property, plant and equipment > Property, plant and equipment - Accumulated Depreciation",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Non-current",
      "grouping3": "Property, plant and equipment",
      "grouping4": "Property, plant and equipment - Accumulated Depreciation",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c",
        "690decb564086700aec83d88"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row-1762533425230-mcrm85",
      "code": "6",
      "accountName": "Shareholders loan",
      "currentYear": 0,
      "priorYear": -1869,
      "adjustments": 0,
      "finalBalance": 0,
      "classification": "Liabilities > Current > Trade and other payables > Amount due to Shareholder",
      "reclassification": 0,
      "grouping1": "Liabilities",
      "grouping2": "Current",
      "grouping3": "Trade and other payables",
      "grouping4": "Amount due to Shareholder",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [],
      "reclassificationRefs": [],
      "isNewAccount": false
    },
    {
      "_id": "row-1762776361443-5slu49",
      "code": "1210",
      "accountName": "Cash",
      "currentYear": 7805,
      "priorYear": 0,
      "adjustments": 2850,
      "finalBalance": 10655,
      "classification": "Assets > Current > Cash and bank balances > Cash in hand",
      "reclassification": 0,
      "grouping1": "Assets",
      "grouping2": "Current",
      "grouping3": "Cash and bank balances",
      "grouping4": "Cash in hand",
      "linkedExcelFiles": [],
      "mappings": [],
      "adjustmentRefs": [
        "690deb4b64086700aec83d5c"
      ],
      "reclassificationRefs": [],
      "isNewAccount": false
    }
  ],
  adjustments: [
    {
      "_id": "690deddd64086700aec83db5",
      "engagementId": "68f62e70da7e334a6f9b79c6",
      "etbId": "6909e19bc2d86ea68ad6e2d2",
      "adjustmentNo": "AA5",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "row_690cafecf694875bd80da531",
          "code": "50",
          "accountName": "Income tax P+L",
          "dr": 22076,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da50f",
          "code": "16",
          "accountName": "Company tax",
          "dr": 0,
          "cr": 22076,
          "details": ""
        }
      ],
      "totalDr": 22076,
      "totalCr": 22076,
      "createdAt": "2025-11-07T13:02:21.514Z",
      "updatedAt": "2025-12-02T09:23:46.052Z",
      "evidenceFiles": [],
      "history": [
        {
          "action": "updated",
          "timestamp": "2025-12-02T09:23:46.048Z",
          "userId": "0453e6ce-4ad1-484d-9525-956ff14014e5",
          "userName": "Cleven",
          "previousValues": {
            "description": "",
            "entriesCount": 2,
            "totalDr": 21584,
            "totalCr": 21584,
            "status": "posted"
          },
          "newValues": {
            "description": "",
            "entriesCount": 2,
            "totalDr": 22076,
            "totalCr": 22076,
            "status": "posted"
          },
          "metadata": {
            "etbUpdated": true,
            "updatedBy": "ahsan@a4.com.mt",
            "totalDr": 21584,
            "totalCr": 21584,
            "entriesCount": 2
          },
          "description": "Adjustment AA5 updated",
          "_id": "692eb02296784a72d486c994"
        }
      ]
    },
    {
      "_id": "690ded9764086700aec83d9f",
      "engagementId": "68f62e70da7e334a6f9b79c6",
      "etbId": "6909e19bc2d86ea68ad6e2d2",
      "adjustmentNo": "AA4",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "row_690cafecf694875bd80da500",
          "code": "1",
          "accountName": "Stock",
          "dr": 4210,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da517",
          "code": "24",
          "accountName": "Chicks - Purchases",
          "dr": 0,
          "cr": 4210,
          "details": ""
        }
      ],
      "totalDr": 4210,
      "totalCr": 4210,
      "createdAt": "2025-11-07T13:01:11.883Z",
      "updatedAt": "2025-11-07T13:01:12.892Z",
      "history": [],
      "evidenceFiles": []
    },
    {
      "_id": "690ded4e64086700aec83d95",
      "engagementId": "68f62e70da7e334a6f9b79c6",
      "etbId": "6909e19bc2d86ea68ad6e2d2",
      "adjustmentNo": "AA3",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "row_690cafecf694875bd80da52d",
          "code": "46",
          "accountName": "Audit fees",
          "dr": 1400,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da511",
          "code": "18",
          "accountName": "Accruals - Audit Fee",
          "dr": 0,
          "cr": 1400,
          "details": ""
        }
      ],
      "totalDr": 1400,
      "totalCr": 1400,
      "createdAt": "2025-11-07T12:59:58.357Z",
      "updatedAt": "2025-11-07T12:59:59.139Z",
      "history": [],
      "evidenceFiles": []
    },
    {
      "_id": "690decb564086700aec83d88",
      "engagementId": "68f62e70da7e334a6f9b79c6",
      "etbId": "6909e19bc2d86ea68ad6e2d2",
      "adjustmentNo": "AA2",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "row_690cafecf694875bd80da52c",
          "code": "45",
          "accountName": "Depreciation",
          "dr": 16301,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da534",
          "code": "53",
          "accountName": "Prov for Depn - Equipment",
          "dr": 0,
          "cr": 3783,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da536",
          "code": "55",
          "accountName": "Prov for Depn - Building Improvements",
          "dr": 0,
          "cr": 8000,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da53a",
          "code": "59",
          "accountName": "Prov for Depn - Vehicles",
          "dr": 0,
          "cr": 2232,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da538",
          "code": "57",
          "accountName": "Prov for Depn - Furniture + fittings",
          "dr": 0,
          "cr": 2286,
          "details": ""
        }
      ],
      "totalDr": 16301,
      "totalCr": 16301,
      "createdAt": "2025-11-07T12:57:25.589Z",
      "updatedAt": "2025-11-10T12:37:40.371Z",
      "history": [],
      "evidenceFiles": []
    },
    {
      "_id": "690deb4b64086700aec83d5c",
      "engagementId": "68f62e70da7e334a6f9b79c6",
      "etbId": "6909e19bc2d86ea68ad6e2d2",
      "adjustmentNo": "AA1",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "row_690cafecf694875bd80da533",
          "code": "52",
          "accountName": "Equipment",
          "dr": 0,
          "cr": 1,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da534",
          "code": "53",
          "accountName": "Prov for Depn - Equipment",
          "dr": 417,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da536",
          "code": "55",
          "accountName": "Prov for Depn - Building Improvements",
          "dr": 167,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da538",
          "code": "57",
          "accountName": "Prov for Depn - Furniture + fittings",
          "dr": 141,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da53a",
          "code": "59",
          "accountName": "Prov for Depn - Vehicles",
          "dr": 489,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da510",
          "code": "17",
          "accountName": "Deferred Tax",
          "dr": 846,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da51c",
          "code": "29",
          "accountName": "Stock Movement",
          "dr": 40070,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da501",
          "code": "2",
          "accountName": "Debtors Control Account",
          "dr": 0,
          "cr": 1,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da508",
          "code": "9",
          "accountName": "Purchase tax control account",
          "dr": 0,
          "cr": 434,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da50e",
          "code": "15",
          "accountName": "Profit and loss account",
          "dr": 0,
          "cr": 29612,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da50f",
          "code": "16",
          "accountName": "Company tax",
          "dr": 0,
          "cr": 1418,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da519",
          "code": "26",
          "accountName": "Medicines",
          "dr": 0,
          "cr": 8406,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da51a",
          "code": "27",
          "accountName": "Fuel",
          "dr": 0,
          "cr": 4253,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da51d",
          "code": "30",
          "accountName": "Feeds/ Transport - Cost of sales",
          "dr": 0,
          "cr": 2113,
          "details": ""
        },
        {
          "etbRowId": "row-1762776361443-5slu49",
          "code": "4",
          "accountName": "Cash",
          "dr": 2850,
          "cr": 0,
          "details": ""
        },
        {
          "etbRowId": "row_690cafecf694875bd80da50d",
          "code": "14",
          "accountName": "Shareholders Loan",
          "dr": 1258,
          "cr": 0,
          "details": ""
        }
      ],
      "totalDr": 46238,
      "totalCr": 46238,
      "createdAt": "2025-11-07T12:51:23.953Z",
      "updatedAt": "2025-11-10T12:35:56.478Z",
      "history": [],
      "evidenceFiles": []
    }
  ],
  reclassifications: [
    {
      "_id": "695de7c86c1143b70f81c4b9",
      "engagementId": "6948e9b8f1db589343afd30d",
      "etbId": "6948fdf7de12f80410d9450e",
      "reclassificationNo": "RC2",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "1000",
          "code": "1000",
          "accountName": "Cash",
          "dr": 20,
          "cr": 50,
          "details": ""
        },
        {
          "etbRowId": "1300",
          "code": "1300",
          "accountName": "Prepaid Expenses",
          "dr": 40,
          "cr": 70,
          "details": ""
        }
      ],
      "totalDr": 60,
      "totalCr": 120,
      "history": [
        {
          "action": "created",
          "timestamp": "2026-01-07T04:57:44.279Z",
          "userId": "225d3e71-de46-444d-b6d3-9f3d51fc5e9f",
          "userName": "Kannan",
          "previousValues": null,
          "newValues": {
            "reclassificationNo": "RC2",
            "description": "",
            "entriesCount": 2,
            "status": "draft"
          },
          "metadata": {
            "createdBy": "kannan.employee@gmail.com",
            "totalDr": 60,
            "totalCr": 120,
            "entriesCount": 2
          },
          "description": "Reclassification RC2 created with 2 entries",
          "_id": "695de7c86c1143b70f81c4ba"
        },
        {
          "action": "posted",
          "timestamp": "2026-01-07T04:57:45.944Z",
          "userId": "225d3e71-de46-444d-b6d3-9f3d51fc5e9f",
          "userName": "Kannan",
          "previousValues": {
            "status": "draft"
          },
          "newValues": {
            "status": "posted"
          },
          "metadata": {
            "etbRowsUpdated": 2,
            "totalRows": 16,
            "postedBy": "kannan.employee@gmail.com",
            "totalDr": 60,
            "totalCr": 120,
            "entriesCount": 2
          },
          "description": "Reclassification RC2 posted to ETB (Dr: 60, Cr: 120)",
          "_id": "695de7c96c1143b70f81c4c4"
        }
      ],
      "evidenceFiles": [],
      "createdAt": "2026-01-07T04:57:44.278Z",
      "updatedAt": "2026-01-07T04:57:45.949Z",
      "__v": 1
    },
    {
      "_id": "695d01a315597e608037f66b",
      "engagementId": "6948e9b8f1db589343afd30d",
      "etbId": "6948fdf7de12f80410d9450e",
      "reclassificationNo": "RC1",
      "description": "",
      "status": "posted",
      "entries": [
        {
          "etbRowId": "1000",
          "code": "1000",
          "accountName": "Cash",
          "dr": 10,
          "cr": 20,
          "details": ""
        },
        {
          "etbRowId": "1200",
          "code": "1200",
          "accountName": "Inventory",
          "dr": 30,
          "cr": 40,
          "details": ""
        }
      ],
      "totalDr": 40,
      "totalCr": 60,
      "history": [
        {
          "action": "created",
          "timestamp": "2026-01-06T12:35:47.956Z",
          "userId": "225d3e71-de46-444d-b6d3-9f3d51fc5e9f",
          "userName": "Kannan",
          "previousValues": null,
          "newValues": {
            "reclassificationNo": "RC1",
            "description": "",
            "entriesCount": 2,
            "status": "draft"
          },
          "metadata": {
            "createdBy": "kannan.employee@gmail.com",
            "totalDr": 40,
            "totalCr": 60,
            "entriesCount": 2
          },
          "description": "Reclassification RC1 created with 2 entries",
          "_id": "695d01a315597e608037f66c"
        },
        {
          "action": "posted",
          "timestamp": "2026-01-06T12:35:49.872Z",
          "userId": "225d3e71-de46-444d-b6d3-9f3d51fc5e9f",
          "userName": "Kannan",
          "previousValues": {
            "status": "draft"
          },
          "newValues": {
            "status": "posted"
          },
          "metadata": {
            "etbRowsUpdated": 2,
            "totalRows": 16,
            "postedBy": "kannan.employee@gmail.com",
            "totalDr": 40,
            "totalCr": 60,
            "entriesCount": 2
          },
          "description": "Reclassification RC1 posted to ETB (Dr: 40, Cr: 60)",
          "_id": "695d01a515597e608037f675"
        }
      ],
      "evidenceFiles": [],
      "createdAt": "2026-01-06T12:35:47.956Z",
      "updatedAt": "2026-01-06T12:35:49.876Z",
      "__v": 1
    }
  ],
  profit_and_loss: {
    prior_year: { year: 2022, net_result: 154230.0, resultType: 'net_profit', breakdowns: { 'Gross Profit': { value: 450000.0, accounts: [] }, 'Operating Expenses': { value: -250000.0, accounts: [] }, 'Tax': { value: -45770.0, accounts: [] } } },
    current_year: { year: 2023, net_result: 168940.0, resultType: 'net_profit', breakdowns: { 'Gross Profit': { value: 485000.0, accounts: [] }, 'Operating Expenses': { value: -265000.0, accounts: [] }, 'Tax': { value: -51060.0, accounts: [] } } }
  },
  balance_sheet: {
    prior_year: { year: 2022, totals: { assets: { value: 1250000.0, accounts: [] }, liabilities: { value: 650000.0, accounts: [] }, equity: { value: 600000.0, accounts: [] } }, balanced: true },
    current_year: { year: 2023, totals: { assets: { value: 1380000.0, accounts: [] }, liabilities: { value: 710000.0, accounts: [] }, equity: { value: 670000.0, accounts: [] } }, balanced: true }
  },
  lead_sheets: [],
  documentRequests: [
    {
        "_id": "695d05ef15597e608038070b",
        "engagement": "68f62e70da7e334a6f9b79c6",
        "clientId": "ff0978b5-ca1d-4f44-977c-f5e0b9c5952c",
        "name": "Capital & Reserves Request - 6/1/2026",
        "category": "Capital & Reserves",
        "description": "Upload the required document",
        "comment": "",
        "notificationEmails": [],
        "emailNotificationSent": false,
        "status": "pending",
        "documents": [
            {
                "template": {
                    "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/kyc/template_1763141608284_3mncy.pdf",
                    "instruction": "Provide a detailed overview of what the company does, including primary business sectors, services offered, and operational activities. Ensure the information is clear and accurate."
                },
                "name": "Company Activity Form",
                "type": "template",
                "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/68f62e70da7e334a6f9b79c6/Capital%20&%20Reserves/1767704381824_44279.jpg",
                "uploadedFileName": "bank-statement-template-22.jpg",
                "uploadedAt": "2026-01-06T12:59:42.323Z",
                "status": "uploaded",
                "comment": "",
                "_id": "695d073e15597e6080381791"
            },
            {
                "template": {
                    "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/kyc/template_1763141636327_pvnzr.pdf",
                    "instruction": "Fill in all sections with accurate corporate details, including legal name, registration number, ownership structure, management information, and contact details. Ensure consistency with other corporate documents."
                },
                "name": "Company Profile Document",
                "type": "template",
                "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/68f62e70da7e334a6f9b79c6/Capital%20&%20Reserves/1767705174150_pmhj4.jpg",
                "uploadedFileName": "35349124-8922707-image-a-3_1604699265915.jpg",
                "uploadedAt": "2026-01-06T13:12:54.584Z",
                "status": "uploaded",
                "comment": "",
                "_id": "695d0a5615597e6080382271"
            },
            {
                "template": {
                    "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/kyc/template_1763141684042_wg32h.pdf",
                    "instruction": "State clearly if any involved individuals are PEPs. Provide relevant details when applicable. If none are PEPs, declare “No PEP involvement” and sign where required."
                },
                "name": "Politically Exposed Person (PEP) Declaration",
                "type": "template",
                "status": "pending",
                "comment": "",
                "_id": "695d05ef15597e608038070e",
                "uploadedAt": "2026-01-06T12:54:07.058Z"
            },
            {
                "template": {
                    "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/kyc/template_1763141750305_qp4xp.pdf",
                    "instruction": "Describe the origin of funds used for the company or transactions. Provide supporting information such as income history, business profits, investment returns, or inheritance details. Ensure the explanation is clear and truthful."
                },
                "name": "Source of Wealth Declaration",
                "type": "template",
                "status": "pending",
                "comment": "",
                "_id": "695d05ef15597e608038070f",
                "uploadedAt": "2026-01-06T12:54:07.058Z"
            },
            {
                "name": "ID/Passport",
                "type": "direct",
                "status": "pending",
                "comment": "",
                "_id": "695d05ef15597e6080380710",
                "uploadedAt": "2026-01-06T12:54:07.058Z"
            },
            {
                "name": "Utility Bill",
                "type": "direct",
                "status": "pending",
                "comment": "",
                "_id": "695d05ef15597e6080380711",
                "uploadedAt": "2026-01-06T12:54:07.058Z"
            }
        ],
        "multipleDocuments": [
            {
                "name": "Bank Proof",
                "type": "template",
                "instruction": "Upload Required Document",
                "multiple": [
                    {
                        "template": {
                            "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/templates/template_1767704212952_0lj37.pdf",
                            "instruction": "Upload Required Document"
                        },
                        "label": "Front SIde",
                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/68f62e70da7e334a6f9b79c6/Capital%20&%20Reserves/1767705186191_bz41y_0.jpg",
                        "uploadedFileName": "example-of-a-real-bank-statement-from-bank-of-america-1440x1238.jpg",
                        "uploadedAt": "2026-01-06T13:13:06.984Z",
                        "status": "uploaded",
                        "comment": "",
                        "_id": "695d0a6215597e608038228e"
                    },
                    {
                        "template": {
                            "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/templates/template_1767704213011_4q17m.pdf",
                            "instruction": "Upload Required Document"
                        },
                        "label": "Back Side",
                        "status": "pending",
                        "comment": "",
                        "_id": "695d069615597e60803807e8",
                        "uploadedAt": "2026-01-06T12:56:54.431Z"
                    }
                ],
                "_id": "695d069615597e60803807e6"
            }
        ],
        "requestedAt": "2026-01-06T12:54:07.059Z",
        "__v": 1
    }
  ]
};
