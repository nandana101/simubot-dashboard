
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  time: string;
  botActivity: number;
  normalActivity: number;
}

const generateRandomData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      botActivity: Math.floor(Math.random() * 100),
      normalActivity: Math.floor(Math.random() * 100),
    });
  }

  return data;
};

export const BotActivityChart = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    setData(generateRandomData());
    const interval = setInterval(() => {
      setData((currentData) => {
        const newData = [...currentData.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          botActivity: Math.floor(Math.random() * 100),
          normalActivity: Math.floor(Math.random() * 100),
        });
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Activity Overview</h3>
          <p className="text-sm text-muted-foreground">
            Real-time comparison of bot vs normal activity
          </p>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis
                dataKey="time"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Bot
                            </span>
                            <span className="font-bold text-rose-500">
                              {payload[0].value}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Normal
                            </span>
                            <span className="font-bold text-emerald-500">
                              {payload[1].value}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="botActivity"
                stroke="#f43f5e"
                fill="#fecdd3"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="normalActivity"
                stroke="#059669"
                fill="#a7f3d0"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
