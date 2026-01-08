// extractETBData.ts

// -------------------------
// TYPES
// -------------------------

type ClassificationParts = {
  grouping1?: string;
  grouping2?: string;
  grouping3?: string;
  grouping4?: string;
};

export interface ETBRow {
  _id: string;
  classification?: string;
  currentYear?: number;
  priorYear?: number;
  adjustments?: number;
  reclassification?: number;
  finalBalance?: number;
  [key: string]: any;
}

interface LeadSheetTotals {
  currentYear: number;
  priorYear: number;
  adjustments: number;
  reclassification: number;
  finalBalance: number;
}

interface LeadSheetNode {
  level: "grouping1" | "grouping2" | "grouping3" | "grouping4";
  group: string;
  id?: string;
  children?: LeadSheetNode[];
  totals?: LeadSheetTotals;
  rows?: string[];
}

interface IncomeStatementResult {
  year: number;
  net_result: number;
  resultType: "net_profit" | "net_loss";
  breakdowns: Record<
    string,
    {
      value: number;
      accounts: string[];
    }
  >;
}

interface BalanceSheetTotals {
  value: number;
  accounts: string[];
}

// -------------------------
// CLASSIFICATION PARSER
// -------------------------

const parseClassification = (classification: string = ""): ClassificationParts => {
  const parts = classification.split(" > ");
  return {
    grouping1: parts[0],
    grouping2: parts[1],
    grouping3: parts[2],
    grouping4: parts[3],
  };
};

// -------------------------
// NORMALIZE ETB (CORRECT)
// -------------------------

const normalizeETB = (rows: ETBRow[]): ETBRow[] => {
  const round = (v: unknown): number =>
    typeof v === "number" ? Math.round(v) : 0;

  return rows.map((row) => {
    const { grouping1 } = parseClassification(row.classification);

    const sign =
      grouping1 === "Equity" || grouping1 === "Liabilities" ? -1 : 1;

    const currentYear = round(row.currentYear) * sign;
    const priorYear = round(row.priorYear) * sign;
    const adjustments = round(row.adjustments) * sign;
    const reclassification = round(row.reclassification) * sign;

    const finalBalance = currentYear + adjustments + reclassification;

    return {
      ...row,
      currentYear,
      priorYear,
      adjustments,
      reclassification,
      finalBalance,
    };
  });
};

// -------------------------
// LEAD SHEET INDEX
// -------------------------

const buildLeadSheetIndex = (tree: LeadSheetNode[]): Record<string, string> => {
  const index: Record<string, string> = {};

  for (const g1 of tree) {
    for (const g2 of g1.children || []) {
      for (const g3 of g2.children || []) {
        if (g3.group && g3.id) {
          index[g3.group] = g3.id;
        }
      }
    }
  }

  return index;
};

// -------------------------
// LEAD SHEETS
// -------------------------

const getOrCreate = <T extends LeadSheetNode>(
  arr: T[],
  key: string,
  factory: () => T
): T => {
  let node = arr.find((n) => n.group === key);
  if (!node) {
    node = factory();
    arr.push(node);
  }
  return node;
};

const rollupTotals = (node: LeadSheetNode) => {
  if (!node.children || node.children.length === 0) return;

  const totals: LeadSheetTotals = {
    currentYear: 0,
    priorYear: 0,
    adjustments: 0,
    reclassification: 0,
    finalBalance: 0,
  };

  for (const child of node.children) {
    if (child.children) rollupTotals(child);
    if (child.totals) {
      totals.currentYear += child.totals.currentYear;
      totals.priorYear += child.totals.priorYear;
      totals.adjustments += child.totals.adjustments;
      totals.reclassification += child.totals.reclassification;
      totals.finalBalance += child.totals.finalBalance;
    }
  }

  node.totals = totals;
};

const buildLeadSheetTree = (rows: ETBRow[]): LeadSheetNode[] => {
  const tree: LeadSheetNode[] = [];
  let idCounter = 1;

  for (const row of rows) {
    const { grouping1, grouping2, grouping3, grouping4 } = parseClassification(
      row.classification
    );

    if (!grouping1 || !grouping2 || !grouping3) continue;

    const g1 = getOrCreate(tree, grouping1, () => ({
      level: "grouping1",
      group: grouping1,
      children: [],
    }));

    const g2 = getOrCreate(g1.children!, grouping2, () => ({
      level: "grouping2",
      group: grouping2,
      children: [],
    }));

    const g3 = getOrCreate(g2.children!, grouping3, () => ({
      level: "grouping3",
      group: grouping3,
      children: [],
    }));

    const g4 = getOrCreate(g3.children!, grouping4 || "_direct_", () => ({
      level: "grouping4",
      id: `LS_${idCounter++}`,
      group: grouping4 || "_direct_",
      totals: {
        currentYear: 0,
        priorYear: 0,
        adjustments: 0,
        reclassification: 0,
        finalBalance: 0,
      },
      rows: [],
    }));

    g4.totals!.currentYear += row.currentYear || 0;
    g4.totals!.priorYear += row.priorYear || 0;
    g4.totals!.adjustments += row.adjustments || 0;
    g4.totals!.reclassification += row.reclassification || 0;
    g4.totals!.finalBalance += row.finalBalance || 0;
    g4.rows!.push(row._id);
  }

  // Roll up totals from bottom to top
  for (const g1 of tree) {
    rollupTotals(g1);
  }

  return tree;
};

// -------------------------
// INCOME STATEMENT
// -------------------------

const deriveIncomeStatement = (
  tree: LeadSheetNode[],
  currentYear: number
) => {
  const priorYear = currentYear - 1;
  const leadIndex = buildLeadSheetIndex(tree);

  const equity = tree.find((n) => n.group === "Equity");
  const pl = equity?.children?.find(
    (n) => n.group === "Current Year Profits & Losses"
  );

  const empty = (year: number): IncomeStatementResult => ({
    year,
    net_result: 0,
    resultType: "net_profit",
    breakdowns: {},
  });

  if (!pl) {
    return {
      prior_year: empty(priorYear),
      current_year: empty(currentYear),
    };
  }

  const collect = (field: keyof LeadSheetTotals) => {
    const totals: Record<string, number> = {};
    for (const g3 of pl.children || []) {
      totals[g3.group] = g3.totals?.[field] || 0;
    }
    return totals;
  };

  const calculate = (totals: Record<string, number>) => {
    const grossProfit =
      (totals["Revenue"] || 0) + (totals["Cost of sales"] || 0);

    const operatingProfit =
      grossProfit +
      (totals["Sales and marketing expenses"] || 0) +
      (totals["Administrative expenses"] || 0) +
      (totals["Other operating income"] || 0);

    const netProfitBeforeTax =
      operatingProfit +
      (totals["Investment income"] || 0) +
      (totals["Investment losses"] || 0) +
      (totals["Finance costs"] || 0) +
      (totals["Share of profit of subsidiary"] || 0) +
      (totals["PBT Expenses"] || 0);

    const net = netProfitBeforeTax + (totals["Income tax expense"] || 0);

    return {
      net_result: net,
      resultType: net >= 0 ? "net_profit" : "net_loss",
      breakdowns: Object.fromEntries(
        Object.entries(totals).map(([k, v]) => [
          k,
          {
            value: Math.abs(v),
            accounts: leadIndex[k] ? [leadIndex[k]] : [],
          },
        ])
      ),
    };
  };

  return {
    prior_year: {
      year: priorYear,
      ...calculate(collect("priorYear")),
    },
    current_year: {
      year: currentYear,
      ...calculate(collect("finalBalance")),
    },
  };
};

// -------------------------
// RETAINED EARNINGS
// -------------------------

const deriveRetainedEarnings = (
  tree: LeadSheetNode[],
  incomeStatement: any,
  currentYear: number
) => {
  const priorYear = currentYear - 1;

  const equity = tree.find((n) => n.group === "Equity");
  const eqBlock = equity?.children?.find((n) => n.group === "Equity");
  const re = eqBlock?.children?.find((n) => n.group === "Retained earnings");

  const priorValue = re?.totals?.priorYear || 0;
  const net = incomeStatement.current_year.net_result;

  return {
    prior_year: { year: priorYear, value: priorValue },
    current_year: {
      year: currentYear,
      value: priorValue + net,
    },
  };
};

// -------------------------
// COLLECT GROUP ACCOUNTS
// -------------------------

const collectGroupAccounts = (
  tree: LeadSheetNode[],
  groupName: string,
  skip: { grouping2?: string[]; grouping3?: string[] } = {}
): string[] => {
  const node = tree.find((n) => n.group === groupName);
  if (!node) return [];

  const ids: string[] = [];

  for (const g2 of node.children || []) {
    if (skip.grouping2?.includes(g2.group)) continue;

    for (const g3 of g2.children || []) {
      if (skip.grouping3?.includes(g3.group)) continue;
      if (g3.id) ids.push(g3.id);
    }
  }

  return ids;
};

// -------------------------
// BALANCE SHEET
// -------------------------

const deriveBalanceSheet = (
  tree: LeadSheetNode[],
  retainedEarnings: any,
  currentYear: number
) => {
  const priorYear = currentYear - 1;

  const sum = (
    group: string,
    field: keyof LeadSheetTotals,
    skip: {
      grouping2?: string[];
      grouping3?: string[];
    } = {}
  ): number => {
    const node = tree.find((n) => n.group === group);
    if (!node) return 0;

    let total = 0;
    for (const g2 of node.children || []) {
      if (skip.grouping2?.includes(g2.group)) continue;
      for (const g3 of g2.children || []) {
        if (skip.grouping3?.includes(g3.group)) continue;
        total += g3.totals?.[field] || 0;
      }
    }
    return total;
  };

  const assetsCY = sum("Assets", "finalBalance");
  const liabilitiesCY = sum("Liabilities", "finalBalance");
  const equityCY =
    sum("Equity", "finalBalance", {
      grouping2: ["Current Year Profits & Losses"],
      grouping3: ["Retained earnings"],
    }) + retainedEarnings.current_year.value;

  const assetsPY = sum("Assets", "priorYear");
  const liabilitiesPY = sum("Liabilities", "priorYear");
  const equityPY =
    sum("Equity", "priorYear", {
      grouping2: ["Current Year Profits & Losses"],
      grouping3: ["Retained earnings"],
    }) + retainedEarnings.prior_year.value;

  return {
    prior_year: {
      year: priorYear,
      totals: {
        assets: {
          value: assetsPY,
          accounts: collectGroupAccounts(tree, "Assets"),
        },
        liabilities: {
          value: liabilitiesPY,
          accounts: collectGroupAccounts(tree, "Liabilities"),
        },
        equity: {
          value: equityPY,
          accounts: collectGroupAccounts(tree, "Equity", {
            grouping2: ["Current Year Profits & Losses"],
            grouping3: ["Retained earnings"],
          }),
        },
      },
      balanced: Math.abs(assetsPY - (liabilitiesPY + equityPY)) < 1,
    },
    current_year: {
      year: currentYear,
      totals: {
        assets: {
          value: assetsCY,
          accounts: collectGroupAccounts(tree, "Assets"),
        },
        liabilities: {
          value: liabilitiesCY,
          accounts: collectGroupAccounts(tree, "Liabilities"),
        },
        equity: {
          value: equityCY,
          accounts: collectGroupAccounts(tree, "Equity", {
            grouping2: ["Current Year Profits & Losses"],
            grouping3: ["Retained earnings"],
          }),
        },
      },
      balanced: Math.abs(assetsCY - (liabilitiesCY + equityCY)) < 1,
    },
  };
};

// -------------------------
// EXPORT
// -------------------------

export const extractETBData = (etbRows: ETBRow[], year: number) => {
  const normalized = normalizeETB(etbRows);
  const leadSheets = buildLeadSheetTree(normalized);
  const incomeStatement = deriveIncomeStatement(leadSheets, year);
  const retainedEarnings = deriveRetainedEarnings(
    leadSheets,
    incomeStatement,
    year
  );
  const balanceSheet = deriveBalanceSheet(
    leadSheets,
    retainedEarnings,
    year
  );

  // Inject Net Profit/Loss into visual tree for Balance Sheet consistency
  // Important: We do this AFTER summaries are derived so we don't double count in formulas
  const equityG1 = leadSheets.find((n) => n.group === "Equity");
  if (equityG1) {
    const pnlG2 = getOrCreate(equityG1.children!, "Current Year Profits & Losses", () => ({
      level: "grouping2",
      group: "Current Year Profits & Losses",
      children: [],
    }));

    getOrCreate(pnlG2.children!, "Current Year Profit / (Loss)", () => ({
      level: "grouping3",
      group: "Current Year Profit / (Loss)",
      totals: {
        currentYear: incomeStatement.current_year.net_result,
        priorYear: incomeStatement.prior_year.net_result,
        adjustments: 0,
        reclassification: 0,
        finalBalance: incomeStatement.current_year.net_result,
      },
      rows: [],
    }));
  }

  return {
    etb: normalized,
    lead_sheets: leadSheets,
    income_statement: incomeStatement,
    balance_sheet: balanceSheet,
    retained_earnings: retainedEarnings,
  };
};
