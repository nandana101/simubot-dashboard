
import { Activity, Users, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { AccountsTable } from "@/components/AccountsTable";
import { BotActivityChart } from "@/components/BotActivityChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">SimuBot Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time bot detection and monitoring
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Total Accounts"
            value="2,543"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Bot Detection Rate"
            value="23%"
            icon={<AlertTriangle className="h-5 w-5" />}
            trend={{ value: 4, isPositive: false }}
          />
          <MetricCard
            title="Activity Level"
            value="High"
            icon={<Activity className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <AccountsTable />
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Activity Analysis</h2>
            <BotActivityChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
