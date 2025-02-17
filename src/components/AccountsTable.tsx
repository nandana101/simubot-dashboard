
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  username: string;
  status: "normal" | "suspicious" | "bot";
  activityLevel: number;
  lastActive: string;
  riskScore: number;
}

const generateRandomAccounts = (count: number): Account[] => {
  const statuses: Account["status"][] = ["normal", "suspicious", "bot"];
  const accounts: Account[] = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    accounts.push({
      id: `acc_${Math.random().toString(36).substr(2, 9)}`,
      username: `user_${Math.random().toString(36).substr(2, 6)}`,
      status,
      activityLevel: Math.floor(Math.random() * 100),
      lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      riskScore: Math.floor(Math.random() * 100),
    });
  }

  return accounts;
};

export const AccountsTable = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    setAccounts(generateRandomAccounts(10));
    const interval = setInterval(() => {
      setAccounts(generateRandomAccounts(10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border bg-card animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Activity Level</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Risk Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">@{account.username}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    account.status === "normal" && "border-emerald-500 text-emerald-500",
                    account.status === "suspicious" && "border-amber-500 text-amber-500",
                    account.status === "bot" && "border-rose-500 text-rose-500"
                  )}
                >
                  {account.status}
                </Badge>
              </TableCell>
              <TableCell>{account.activityLevel}%</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(account.lastActive).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      account.riskScore < 33 && "bg-emerald-500",
                      account.riskScore >= 33 && account.riskScore < 66 && "bg-amber-500",
                      account.riskScore >= 66 && "bg-rose-500"
                    )}
                    style={{ width: `${account.riskScore}%` }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
