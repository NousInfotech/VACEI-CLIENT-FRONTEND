"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAccounts, setDefaultAccount } from "../api/accountService";  
import { useAlert } from "../app/context/AlertContext";

interface Account {
  id: number;
  realmId: string;
}

const AccountSelector: React.FC = () => {
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const { setAlert } = useAlert();

  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const token = localStorage.getItem("token") || "";
        const user_id = localStorage.getItem("user_id") || "";

        if (!backendUrl || !user_id || !token) {
          throw new Error("Missing backend URL or credentials");
        }

        const data = await fetchAccounts(backendUrl, token);
        setAccounts(data);

        const savedEncodedAccountId = localStorage.getItem("account_id");
        if (savedEncodedAccountId) {
          const savedAccountId = parseInt(atob(savedEncodedAccountId));
          const existsInAccounts = data.some(acc => acc.id === savedAccountId);

          if (existsInAccounts) {
            setSelectedAccount(savedAccountId);
          } else if (data.length > 0) {
            setSelectedAccount(data[0].id);
          }
        } else if (data.length > 0) {
          setSelectedAccount(data[0].id);
        }

      } catch (e) {
        console.error(e);
        setAlert({ message: "Failed to load accounts", variant: "danger" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (accountId: number) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const token = localStorage.getItem("token") || "";

    try {
      const result = await setDefaultAccount(backendUrl, token, accountId);
      localStorage.setItem("account_id", btoa(String(result.accountId)));

      setAlert({ message: "Account changed successfully", variant: "success" });

      // Optional: redirect after short delay to allow user to see alert
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Failed to submit account selection", error);
      setAlert({ message: "Failed to change account", variant: "danger" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = parseInt(e.target.value);
    setSelectedAccount(accountId);
    handleSubmit(accountId);
  };

  return (
    <div className="account-dropdown p-4">
      
      <select
        className="w-full border rounded px-3 py-2 text-brand-body focus:outline-none focus:ring bg-sidebar-hover text-card-foreground"
        disabled={loading}
        value={selectedAccount ?? ""}
        onChange={handleChange}
      >
        <option value="" disabled className="text-card-foreground bg-sidebar-hover">
          {loading ? "Loading Accounts..." : "Select Account"}
        </option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id} className="text-card-foreground bg-sidebar-hover">
            {account.realmId}
          </option>
        ))}
      </select>
      <hr className="divider mt-4" />
    </div>
  );
};

export default AccountSelector;
