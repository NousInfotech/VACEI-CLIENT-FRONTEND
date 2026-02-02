interface Account {
  id: number;
  realmId: string;
}

// Mock implementation - no backend calls
// Simulate API delay
async function simulateDelay(ms: number = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// API call to fetch accounts
export const fetchAccounts = async (backendUrl: string, token: string): Promise<Account[]> => {
  // Simulate API delay
  await simulateDelay(300);
  
  // Mock accounts data
  return [
    { id: 1, realmId: "Account 1" },
    { id: 2, realmId: "Account 2" },
    { id: 3, realmId: "Account 3" },
  ];
};

// API call to set default account
export const setDefaultAccount = async (
  backendUrl: string,
  token: string,
  accountId: number
) => {
  // Simulate API delay
  await simulateDelay(200);
  
  // Mock response
  return { accountId };
};
