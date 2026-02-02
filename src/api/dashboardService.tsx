// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchDashboardStats() {
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock dashboard stats data
  return {
    totalRevenue: 125450.00,
    totalExpenses: 89230.00,
    netIncome: 36220.00,
    cashFlow: 42180.00,
    revenueChange: "+12.5%",
    expensesChange: "+5.2%",
    netIncomeChange: "+28.3%",
    cashFlowChange: "+15.7%",
  };
}
