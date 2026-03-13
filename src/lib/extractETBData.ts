// extractETBData.ts
// Mirror of VACEI_PARTNER_PORTAL audit/utils/etbDataProcessor.ts so Income Statement and Balance Sheet match exactly.

// -------------------------
// TYPES
// -------------------------

type ClassificationParts = {
  grouping1: string | null;
  grouping2: string | null;
  grouping3: string | null;
  grouping4: string | null;
};

/** ETB row shape accepted by extractETBData (compatible with mockEngagementData.ETBRow) */
export interface ETBRow {
  _id: string;
  classification?: string;
  code?: string;
  accountName?: string;
  currentYear?: number;
  priorYear?: number;
  adjustments?: number;
  reclassification?: number;
  reClassification?: number;
  finalBalance?: number;
  grouping1?: string | null;
  grouping2?: string | null;
  grouping3?: string | null;
  grouping4?: string | null;
  group1?: string | null;
  group2?: string | null;
  group3?: string | null;
  group4?: string | null;
  linkedExcelFiles?: unknown[];
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
// HELPERS (match partner)
// -------------------------

const normalizeGroupKey = (s: string): string => s.trim().toLowerCase();

const toNumber = (v: unknown): number =>
  Number.isFinite(Number(v)) ? Number(v) : 0;

// Parse classification string – trim, filter empty; return null for missing (match partner)
const parseClassification = (classification: string = ""): ClassificationParts => {
  const parts = classification.split(" > ").map((p) => p.trim()).filter(Boolean);
  return {
    grouping1: parts[0] || null,
    grouping2: parts[1] || null,
    grouping3: parts[2] || null,
    grouping4: parts[3] || null,
  };
};

// -------------------------
// NORMALIZE ETB (mirror partner: sign flip Equity/Liabilities, round, finalBalance)
// -------------------------

const normalizeETB = (rows: ETBRow[]): ETBRow[] => {
  const round = (v: unknown): number =>
    typeof v === "number" ? Math.round(v) : 0;

  return rows.map((row) => {
    const parsed = parseClassification(row.classification);
    const grouping1 =
      row.group1 ?? row.grouping1 ?? parsed.grouping1;
    const sign =
      grouping1 === "Equity" || grouping1 === "Liabilities" ? -1 : 1;

    const reclass =
      row.reclassification ?? row.reClassification ?? 0;
    const currentYear = round(row.currentYear) * sign;
    const priorYear = round(row.priorYear) * sign;
    const adjustments = round(row.adjustments) * sign;
    const reclassification = round(reclass) * sign;
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
// LEAD SHEET TREE (4-level; only g4 has totals; use normalized keys for merge – match partner)
// -------------------------

interface TreeNodeWithMap extends LeadSheetNode {
  _map?: Map<string, TreeNodeWithMap>;
}

const buildLeadSheetTree = (rows: ETBRow[]): LeadSheetNode[] => {
  const tree: TreeNodeWithMap[] = [];
  let idCounter = 1;
  const normalize = normalizeGroupKey;

  const g1Map = new Map<string, TreeNodeWithMap>();

  for (const row of rows) {
    const parsed = parseClassification(row.classification);
    const grouping1 = row.group1 ?? row.grouping1 ?? parsed.grouping1;
    const grouping2 = row.group2 ?? row.grouping2 ?? parsed.grouping2;
    const grouping3 = row.group3 ?? row.grouping3 ?? parsed.grouping3;
    const grouping4 = row.group4 ?? row.grouping4 ?? parsed.grouping4;

    if (!grouping1 || !grouping2 || !grouping3) continue;

    const k1 = normalize(grouping1);
    const k2 = normalize(grouping2);
    const k3 = normalize(grouping3);
    const k4 = normalize(grouping4 ?? "");

    let g1 = g1Map.get(k1);
    if (!g1) {
      g1 = {
        level: "grouping1",
        group: grouping1,
        children: [],
        _map: new Map(),
      };
      g1Map.set(k1, g1);
      tree.push(g1);
    }

    let g2 = g1._map!.get(k2);
    if (!g2) {
      g2 = {
        level: "grouping2",
        group: grouping2,
        children: [],
        _map: new Map(),
      };
      g1._map!.set(k2, g2);
      g1.children!.push(g2);
    }

    let g3 = g2._map!.get(k3);
    if (!g3) {
      g3 = {
        level: "grouping3",
        group: grouping3,
        children: [],
        _map: new Map(),
      };
      g2._map!.set(k3, g3);
      g2.children!.push(g3);
    }

    const leafKey = k4 || `__unnamed_${idCounter}`;
    let g4 = g3._map!.get(leafKey);
    if (!g4) {
      g4 = {
        level: "grouping4",
        id: `LS_${idCounter++}`,
        group: grouping4 || "",
        children: [],
        totals: {
          currentYear: 0,
          priorYear: 0,
          adjustments: 0,
          reclassification: 0,
          finalBalance: 0,
        },
        rows: [],
      };
      g3._map!.set(leafKey, g4);
      g3.children!.push(g4);
    }

    g4.totals!.currentYear += toNumber(row.currentYear);
    g4.totals!.priorYear += toNumber(row.priorYear);
    g4.totals!.adjustments += toNumber(row.adjustments);
    g4.totals!.reclassification += toNumber(row.reclassification);
    g4.totals!.finalBalance += toNumber(row.finalBalance);
    g4.rows!.push(row._id);
  }

  const cleanup = (nodes: TreeNodeWithMap[]): void => {
    for (const n of nodes) {
      delete n._map;
      if (n.children?.length) cleanup(n.children as TreeNodeWithMap[]);
    }
  };
  cleanup(tree);

  return tree;
};

// -------------------------
// BRANCH TOTALS (single tree scan – match partner buildBranchTotals)
// -------------------------

export type BranchTotals = {
  priorYear: Record<string, number>;
  finalBalance: Record<string, number>;
  nodeIndex: Record<string, LeadSheetNode>;
};

export const buildBranchTotals = (tree: LeadSheetNode[]): BranchTotals => {
  const priorYearMap: Record<string, number> = {};
  const finalBalanceMap: Record<string, number> = {};
  const nodeIndex: Record<string, LeadSheetNode> = {};

  const traverse = (
    node: LeadSheetNode
  ): { priorYear: number; finalBalance: number } => {
    if (!node) return { priorYear: 0, finalBalance: 0 };

    if (!node.children?.length) {
      const priorYear = node.totals?.priorYear ?? 0;
      const finalBalance = node.totals?.finalBalance ?? 0;
      const key = normalizeGroupKey(node.group);
      if (key) {
        priorYearMap[key] = (priorYearMap[key] ?? 0) + priorYear;
        finalBalanceMap[key] = (finalBalanceMap[key] ?? 0) + finalBalance;
        nodeIndex[key] = node;
      }
      return { priorYear, finalBalance };
    }

    let priorYear = 0;
    let finalBalance = 0;
    for (const child of node.children) {
      const sub = traverse(child);
      priorYear += sub.priorYear;
      finalBalance += sub.finalBalance;
    }
    const key = normalizeGroupKey(node.group);
    if (key) {
      priorYearMap[key] = (priorYearMap[key] ?? 0) + priorYear;
      finalBalanceMap[key] = (finalBalanceMap[key] ?? 0) + finalBalance;
      nodeIndex[key] = node;
    }
    return { priorYear, finalBalance };
  };

  for (const root of tree) traverse(root);

  return {
    priorYear: priorYearMap,
    finalBalance: finalBalanceMap,
    nodeIndex,
  };
};

// Find first node whose group matches name (case-insensitive)
const findNodeByGroup = (
  nodes: LeadSheetNode[],
  name: string
): LeadSheetNode | null => {
  const n = normalizeGroupKey(name);
  for (const node of nodes) {
    if (normalizeGroupKey(node.group) === n) return node;
    const found = findNodeByGroup(node.children || [], name);
    if (found) return found;
  }
  return null;
};

// Collect all leaf (g4) IDs under a node
const collectLeafIdsUnder = (node: LeadSheetNode): string[] => {
  if (node.id) return [node.id];
  const ids: string[] = [];
  for (const child of node.children || [])
    ids.push(...collectLeafIdsUnder(child));
  return ids;
};

const getBranch = (
  totals: { priorYear: Record<string, number>; finalBalance: Record<string, number> },
  groupName: string,
  field: "priorYear" | "finalBalance"
) => totals[field][normalizeGroupKey(groupName)] ?? 0;

// -------------------------
// INCOME STATEMENT (mirror partner deriveIncomeStatement)
// -------------------------

const deriveIncomeStatement = (
  tree: LeadSheetNode[],
  currentYear: number,
  branchTotals?: BranchTotals
) => {
  const priorYear = currentYear - 1;
  const totalsMap = branchTotals ?? buildBranchTotals(tree);
  const { priorYear: priorYearMap, finalBalance: finalBalanceMap, nodeIndex } = totalsMap;
  const totals = { priorYear: priorYearMap, finalBalance: finalBalanceMap };

  const calculate = (field: "priorYear" | "finalBalance") => {
    const revenue = getBranch(totals, "Revenue", field);
    const costOfSales = getBranch(totals, "Cost of Sales", field);
    const grossProfit = revenue - Math.abs(costOfSales);

    const salesMarketing = getBranch(totals, "Selling & Marketing Expenses", field);
    const adminExpenses = getBranch(totals, "Administrative Expenses", field);
    const otherOperatingIncome = getBranch(totals, "Other Operating Income", field);
    const operatingProfit =
      grossProfit -
      Math.abs(adminExpenses) -
      Math.abs(salesMarketing) +
      otherOperatingIncome;

    const investmentIncome = getBranch(totals, "Investment Income", field);
    const otherGainsLosses = getBranch(totals, "Other Gains/Losses", field);
    const financeCosts = getBranch(totals, "Finance Costs", field);
    const profitBeforeTax =
      operatingProfit +
      investmentIncome +
      otherGainsLosses -
      Math.abs(financeCosts);

    const taxExpense = getBranch(totals, "Taxation", field);
    const net = profitBeforeTax - Math.abs(taxExpense);

    const accountsFor = (groupName: string) => {
      const node =
        nodeIndex[normalizeGroupKey(groupName)] ?? findNodeByGroup(tree, groupName);
      return node ? collectLeafIdsUnder(node) : [];
    };

    const breakdowns: Record<string, { value: number; accounts: string[] }> = {
      Revenue: { value: Math.abs(revenue), accounts: accountsFor("Revenue") },
      "Cost of sales": {
        value: Math.abs(costOfSales),
        accounts: accountsFor("Cost of Sales"),
      },
      "Sales and marketing expenses": {
        value: Math.abs(salesMarketing),
        accounts: accountsFor("Selling & Marketing Expenses"),
      },
      "Administrative expenses": {
        value: Math.abs(adminExpenses),
        accounts: accountsFor("Administrative Expenses"),
      },
      "Other operating income": {
        value: Math.abs(otherOperatingIncome),
        accounts: accountsFor("Other Operating Income"),
      },
      "Investment income": {
        value: Math.abs(investmentIncome),
        accounts: accountsFor("Investment Income"),
      },
      "Other Gains/Losses": {
        value: Math.abs(otherGainsLosses),
        accounts: accountsFor("Other Gains/Losses"),
      },
      "Finance costs": {
        value: Math.abs(financeCosts),
        accounts: accountsFor("Finance Costs"),
      },
      "Income tax expense": {
        value: Math.abs(taxExpense),
        accounts: accountsFor("Taxation"),
      },
    };

    return {
      net_result: net,
      resultType: net >= 0 ? ("net_profit" as const) : ("net_loss" as const),
      breakdowns,
    };
  };

  return {
    prior_year: {
      year: priorYear,
      ...calculate("priorYear"),
    },
    current_year: {
      year: currentYear,
      ...calculate("finalBalance"),
    },
  };
};

// -------------------------
// RETAINED EARNINGS (mirror partner: Equity > Retained Earnings > Accumulated Profits > Retained Earnings B/F)
// -------------------------

const deriveRetainedEarnings = (
  tree: LeadSheetNode[],
  incomeStatement: ReturnType<typeof deriveIncomeStatement>,
  currentYear: number
) => {
  const priorYear = currentYear - 1;

  const equity = tree.find(
    (n) => normalizeGroupKey(n.group) === normalizeGroupKey("Equity")
  );
  const retainedEarnings = equity?.children?.find(
    (n) => normalizeGroupKey(n.group) === normalizeGroupKey("Retained Earnings")
  );
  const accumulatedProfits = retainedEarnings?.children?.find(
    (n) =>
      normalizeGroupKey(n.group) === normalizeGroupKey("Accumulated Profits")
  );

  let priorValue = 0;
  if (accumulatedProfits?.children) {
    for (const g4 of accumulatedProfits.children) {
      if (
        normalizeGroupKey(g4.group) ===
        normalizeGroupKey("Retained Earnings B/F")
      ) {
        priorValue += g4.totals?.priorYear || 0;
        break;
      }
    }
  }

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
// COLLECT GROUP ACCOUNTS (mirror partner: support grouping4 skip; iterate to g4)
// -------------------------

const collectGroupAccounts = (
  tree: LeadSheetNode[],
  groupName: string,
  skip: {
    grouping2?: string[];
    grouping3?: string[];
    grouping4?: string[];
  } = {}
): string[] => {
  const node = tree.find(
    (n) => normalizeGroupKey(n.group) === normalizeGroupKey(groupName)
  );
  if (!node) return [];

  const ids: string[] = [];

  for (const g2 of node.children || []) {
    if (
      skip.grouping2?.some((s) => normalizeGroupKey(s) === normalizeGroupKey(g2.group))
    )
      continue;
    for (const g3 of g2.children || []) {
      if (
        skip.grouping3?.some((s) => normalizeGroupKey(s) === normalizeGroupKey(g3.group))
      )
        continue;
      for (const g4 of g3.children || []) {
        if (
          skip.grouping4?.some((s) => normalizeGroupKey(s) === normalizeGroupKey(g4.group))
        )
          continue;
        if (g4.id) ids.push(g4.id);
      }
    }
  }

  return ids;
};

// -------------------------
// BALANCE SHEET (mirror partner: exclude grouping4 "Current Year Profit / Loss", use branchTotals)
// -------------------------

const deriveBalanceSheet = (
  tree: LeadSheetNode[],
  retainedEarnings: ReturnType<typeof deriveRetainedEarnings>,
  currentYear: number,
  branchTotals?: BranchTotals
) => {
  const priorYear = currentYear - 1;
  const key = normalizeGroupKey;
  const currentYearProfitLossKey = key("Current Year Profit / Loss");

  let assetsCY: number;
  let liabilitiesCY: number;
  let equityCY: number;
  let assetsPY: number;
  let liabilitiesPY: number;
  let equityPY: number;

  if (branchTotals) {
    const py = branchTotals.priorYear;
    const cy = branchTotals.finalBalance;
    assetsCY = cy[key("Assets")] ?? 0;
    liabilitiesCY = cy[key("Liabilities")] ?? 0;
    assetsPY = py[key("Assets")] ?? 0;
    liabilitiesPY = py[key("Liabilities")] ?? 0;
    const equityFromTreeCY = cy[key("Equity")] ?? 0;
    const equityFromTreePY = py[key("Equity")] ?? 0;
    const currentYearProfitLossCY = cy[currentYearProfitLossKey] ?? 0;
    const currentYearProfitLossPY = py[currentYearProfitLossKey] ?? 0;
    equityCY =
      equityFromTreeCY -
      currentYearProfitLossCY +
      retainedEarnings.current_year.value;
    equityPY =
      equityFromTreePY -
      currentYearProfitLossPY +
      retainedEarnings.prior_year.value;
  } else {
    const sum = (
      group: string,
      field: "priorYear" | "finalBalance",
      skip: {
        grouping2?: string[];
        grouping3?: string[];
        grouping4?: string[];
      } = {}
    ): number => {
      const node = tree.find(
        (n) => normalizeGroupKey(n.group) === normalizeGroupKey(group)
      );
      if (!node) return 0;
      let total = 0;
      for (const g2 of node.children || []) {
        if (
          skip.grouping2?.some((s) => normalizeGroupKey(s) === normalizeGroupKey(g2.group))
        )
          continue;
        for (const g3 of g2.children || []) {
          if (
            skip.grouping3?.some((s) => normalizeGroupKey(s) === normalizeGroupKey(g3.group))
          )
            continue;
          for (const g4 of g3.children || []) {
            if (
              skip.grouping4?.some(
                (s) => normalizeGroupKey(s) === normalizeGroupKey(g4.group)
              )
            )
              continue;
            total += g4.totals?.[field] || 0;
          }
        }
      }
      return total;
    };
    assetsCY = sum("Assets", "finalBalance");
    liabilitiesCY = sum("Liabilities", "finalBalance");
    equityCY =
      sum("Equity", "finalBalance", {
        grouping4: ["Current Year Profit / Loss"],
      }) + retainedEarnings.current_year.value;
    assetsPY = sum("Assets", "priorYear");
    liabilitiesPY = sum("Liabilities", "priorYear");
    equityPY =
      sum("Equity", "priorYear", {
        grouping4: ["Current Year Profit / Loss"],
      }) + retainedEarnings.prior_year.value;
  }

  const totalAssetsCY = assetsCY;
  const totalEquityAndLiabilitiesCY = equityCY + liabilitiesCY;
  const totalAssetsPY = assetsPY;
  const totalEquityAndLiabilitiesPY = equityPY + liabilitiesPY;

  const equityAccountsSkip = { grouping4: ["Current Year Profit / Loss"] };

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
          accounts: collectGroupAccounts(tree, "Equity", equityAccountsSkip),
        },
        total_assets: {
          value: totalAssetsPY,
          accounts: collectGroupAccounts(tree, "Assets"),
        },
        total_equity_and_liabilities: {
          value: totalEquityAndLiabilitiesPY,
          accounts: [
            ...collectGroupAccounts(tree, "Equity", equityAccountsSkip),
            ...collectGroupAccounts(tree, "Liabilities"),
          ],
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
          accounts: collectGroupAccounts(tree, "Equity", equityAccountsSkip),
        },
        total_assets: {
          value: totalAssetsCY,
          accounts: collectGroupAccounts(tree, "Assets"),
        },
        total_equity_and_liabilities: {
          value: totalEquityAndLiabilitiesCY,
          accounts: [
            ...collectGroupAccounts(tree, "Equity", equityAccountsSkip),
            ...collectGroupAccounts(tree, "Liabilities"),
          ],
        },
      },
      balanced: Math.abs(assetsCY - (liabilitiesCY + equityCY)) < 1,
    },
  };
};

// -------------------------
// EXPORT (single pipeline – match partner extractETBData)
// -------------------------

export const extractETBData = (etbRows: ETBRow[], year: number) => {
  const normalized = normalizeETB(etbRows);
  const leadSheets = buildLeadSheetTree(normalized);
  const branchTotals = buildBranchTotals(leadSheets);
  const incomeStatement = deriveIncomeStatement(
    leadSheets,
    year,
    branchTotals
  );
  const retainedEarnings = deriveRetainedEarnings(
    leadSheets,
    incomeStatement,
    year
  );
  const balanceSheet = deriveBalanceSheet(
    leadSheets,
    retainedEarnings,
    year,
    branchTotals
  );

  return {
    etb: normalized,
    lead_sheets: leadSheets,
    income_statement: incomeStatement,
    balance_sheet: balanceSheet,
    normalized_rows: normalized,
  };
};
