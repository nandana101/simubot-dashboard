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

const FIRST_NAMES = [
  "emma", "liam", "olivia", "noah", "ava", "oliver", "sophia", "lucas",
  "isabella", "mason", "mia", "harry", "charlotte", "alex", "amelia",
  "ethan", "aria", "james", "riley", "aiden", "zoe", "carter", "lily",
  "michael", "emily", "elijah", "hannah", "john", "madison", "david",
  "sarah", "chris", "sofia", "daniel", "victoria", "matthew", "grace"
];

const generateUsername = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const randomNum = Math.floor(Math.random() * 9999);
  return `${firstName}${randomNum}`;
};

const generateRandomAccount = (): Account => {
  const statuses: Account["status"][] = ["normal", "suspicious", "bot"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `acc_${Math.random().toString(36).substr(2, 9)}`,
    username: generateUsername(),
    status,
    activityLevel: Math.floor(Math.random() * 100),
    lastActive: new Date().toISOString(),
    riskScore: Math.floor(Math.random() * 100),
  };
};

const MAX_ACCOUNTS = 100; // Maximum number of accounts to keep in memory

export const AccountsTable = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    // Initial accounts
    setAccounts(Array.from({ length: 10 }, generateRandomAccount));

    // Add new account every 5 seconds
    const interval = setInterval(() => {
      setAccounts(currentAccounts => {
        const newAccount = generateRandomAccount();
        // Keep only the last MAX_ACCOUNTS accounts
        return [newAccount, ...currentAccounts].slice(0, MAX_ACCOUNTS);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg border bg-card animate-fade-in">
      <div className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
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
    </div>
  );
};
