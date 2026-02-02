// utils/api/financialReportsApi.ts

// Existing interfaces (keep these if they are used by other parts of your app)
export interface FetchReportParams {
    reportType: string;
    filterType: '12month' | 'custom';
    startDate: string; //YYYY-mm-dd
    endDate: string; //YYYY-mm-dd
    quickFilterRange?: string | null;
}

export interface BackendDashboardStat {
      link: string | null; // Explicitly allow null for link
    title: string;
    amount: string;
    change: string;
    note: string;
    param1: string;
    param2: string;
}

export interface ProcessedDashboardStat {
    title: string;
    link: string | null; // Explicitly allow null for link
    amount: string;
    change: string;
    note: string;
    param1: string;
    param2: string;
    bgColor: string;
    iconClass?: string;
}

export interface DashboardSummaryResponse {
    stats: BackendDashboardStat[];
}

export interface MonthlyCashFlowReportRow {
    name: string;
    [monthYear: string]: string;
}

export interface MonthlyCashFlowReportResponse {

    endingCash: any;
    beginningCash: any;
    cashIncrease: any;
    months: string[];
    data: MonthlyCashFlowReportRow[];
}

// =========================================================
// REMOVE THE OLD/DUPLICATE CashSpendApiResponse and CashSpendDataRow IF NOT USED BY ANOTHER fetcher
// OR RENAME THEM IF THEY ARE FOR A DIFFERENT API ENDPOINT THAT RETURNS TABULAR DATA.
// For example, if you have a separate "cash flow statement" endpoint that returns
// a table with "Cash In", "Cash Out" rows across multiple months, you'd keep
// CashSpendDataRow and the old CashSpendApiResponse, but give them more specific names
// like 'TabularCashFlowRow' and 'TabularCashFlowResponse'.
// =========================================================
// If you want to keep the tabular structure for other uses, rename them:
/*
export interface TabularCashSpendDataRow {
    name: string;
    [key: string]: string | number | undefined;
}
export interface TabularCashSpendApiResponse {
    months: string[];
    data: TabularCashSpendDataRow[];
}
*/
// =========================================================


// =========================================================
// This is the CORRECTED and DEDICATED CashSpendApiResponse for the
// fetchCashSpend function that returns the detailed categories + total.
// =========================================================

// Define the type for a single category outflow item
export interface CashOutflowCategory {
    category: string;
    amount: number;
}

// Define the type for the API response from the backend's `fetchCashSpend`
export interface CashSpendApiResponse {
    data: { // This 'data' property is an object, matching your backend's current output
        month: string; // e.g., "Jul 2025"
        totalSpend: number;
        categories: CashOutflowCategory[]; // Array of detailed spend categories
    } | null; // The entire 'data' object itself might be null if the backend sends { "data": null }
}
// =========================================================


// Existing fetch functions...

export async function fetchFinancialReports(params: FetchReportParams) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock financial reports
    return [
        {
            id: 1,
            reportType: params.reportType,
            startDate: params.startDate,
            endDate: params.endDate,
            revenue: 125450.00,
            expenses: 89230.00,
            netIncome: 36220.00,
        },
        {
            id: 2,
            reportType: params.reportType,
            startDate: params.startDate,
            endDate: params.endDate,
            revenue: 118000.00,
            expenses: 85000.00,
            netIncome: 33000.00,
        },
    ];
}

export async function fetchDashboardSummary(): Promise<any> {
  // Mock data - simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock dashboard summary data
  const mockStats: BackendDashboardStat[] = [
    {
      link: null,
      title: "Total Revenue",
      amount: "€125,450.00",
      change: "+12.5%",
      note: "vs last month",
      param1: "",
      param2: "",
    },
    {
      link: null,
      title: "Total Expenses",
      amount: "€89,230.00",
      change: "+5.2%",
      note: "vs last month",
      param1: "",
      param2: "",
    },
    {
      link: null,
      title: "Net Income",
      amount: "€36,220.00",
      change: "+28.3%",
      note: "vs last month",
      param1: "",
      param2: "",
    },
    {
      link: null,
      title: "Cash Flow",
      amount: "€42,180.00",
      change: "+15.7%",
      note: "vs last month",
      param1: "",
      param2: "",
    },
  ];

  const stats = mockStats.map((stat) => ({
    link: stat.link || null,
    title: stat.title,
    amount: stat.amount,
    change: stat.change,
    param1: stat.param1,
    param2: stat.param2,
    note: stat.note,
    bgColor: "#D9E5FF",
    iconClass: "wallet",
  }));

  return {
    stats,
    netIncomeYTD: {
      value: 36220,
      change: "+28.3%",
    },
  };
}



export async function fetchMonthlyCashFlowReport(startDate: string, endDate: string): Promise<MonthlyCashFlowReportResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock monthly cash flow report
    const months = ["Jan 2024", "Feb 2024", "Mar 2024", "Apr 2024", "May 2024", "Jun 2024"];
    
    return {
        beginningCash: 50000,
        endingCash: 75000,
        cashIncrease: 25000,
        months: months,
        data: [
            { name: "Operating Activities", "Jan 2024": "15000", "Feb 2024": "18000", "Mar 2024": "20000", "Apr 2024": "22000", "May 2024": "25000", "Jun 2024": "28000" },
            { name: "Investing Activities", "Jan 2024": "-5000", "Feb 2024": "-3000", "Mar 2024": "-2000", "Apr 2024": "-1000", "May 2024": "-500", "Jun 2024": "0" },
            { name: "Financing Activities", "Jan 2024": "10000", "Feb 2024": "5000", "Mar 2024": "3000", "Apr 2024": "2000", "May 2024": "1000", "Jun 2024": "0" },
        ],
    };
}

// This is the function whose return type needs to be aligned with the single, correct CashSpendApiResponse
export async function fetchCashSpend(startDate: string, endDate: string): Promise<CashSpendApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock cash spend data
    return {
        data: {
            month: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            totalSpend: 89230.00,
            categories: [
                { category: "Office Supplies", amount: 5000 },
                { category: "Utilities", amount: 3000 },
                { category: "Salaries", amount: 60000 },
                { category: "Marketing", amount: 10000 },
                { category: "Other", amount: 11230 },
            ],
        },
    };
}