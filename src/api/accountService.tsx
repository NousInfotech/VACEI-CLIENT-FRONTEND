interface Account {
  id: number;
  realmId: string;
}

// API call to fetch accounts
export const fetchAccounts = async (backendUrl: string, token: string): Promise<Account[]> => {
  const res = await fetch(`${backendUrl}intuitAccount/get-all-accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to load accounts");

  return await res.json();
};

// API call to set default account
export const setDefaultAccount = async (
  backendUrl: string,
  token: string,
  accountId: number
) => {
  const res = await fetch(`${backendUrl}intuitAccount/set-default`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ accountId }),
  });

  if (!res.ok) throw new Error(await res.text());

  return await res.json();
};
