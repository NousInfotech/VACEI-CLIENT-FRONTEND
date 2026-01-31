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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem("token") || "";

    const query = new URLSearchParams({
        reportType: params.reportType,
        startDate: params.startDate,
        endDate: params.endDate,
    });

    if (params.filterType === '12month' && params.quickFilterRange) {
        query.append('quickFilterRange', params.quickFilterRange);
    }

    const url = `${backendUrl?.replace(/\/?$/, "/")}financial-reports/fetchReports?${query.toString()}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reports;
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem("token") || "";

    if (!backendUrl) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined.");
        throw new Error("Backend URL is not configured.");
    }

    const query = new URLSearchParams({ startDate, endDate });
    const url = `${backendUrl?.replace(/\/?$/, "/")}financial-reports/monthly-cash-flow?${query.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MonthlyCashFlowReportResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching monthly cash flow report:", error);
        throw error;
    }
}

// This is the function whose return type needs to be aligned with the single, correct CashSpendApiResponse
export async function fetchCashSpend(startDate: string, endDate: string): Promise<CashSpendApiResponse> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem("token") || "";

    if (!backendUrl) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined.");
        throw new Error("Backend URL is not configured.");
    }

    const query = new URLSearchParams({ startDate, endDate });
    const url = `${backendUrl.replace(/\/?$/, "/")}financial-reports/cash-spend?${query.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        const data: CashSpendApiResponse = await response.json(); // Type assertion here
        return data;
    } catch (error) {
        console.error("Error fetching cash spend data:", error);
        throw error;
    }
}