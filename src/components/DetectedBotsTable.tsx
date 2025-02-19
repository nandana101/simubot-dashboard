
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DetectedBot {
  id: string;
  username: string;
  confidence: number;
  reason: string;
  category: 'normal' | 'disruptive' | 'satisfactory' | 'problematic';
}

interface DetectedBotsTableProps {
  bots: DetectedBot[];
  onRemoveBot: (id: string) => void;
}

export const DetectedBotsTable = ({ bots, onRemoveBot }: DetectedBotsTableProps) => {
  const { toast } = useToast();

  const handleRemove = (id: string) => {
    onRemoveBot(id);
    toast({
      title: "Bot account removed",
      description: "The account has been removed from the system.",
      duration: 3000,
    });
  };

  if (bots.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No bots detected yet
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bots.map((bot) => (
            <TableRow key={bot.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>@{bot.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  bot.category === 'normal' && "bg-emerald-100 text-emerald-700",
                  bot.category === 'satisfactory' && "bg-amber-100 text-amber-700",
                  bot.category === 'disruptive' && "bg-orange-100 text-orange-700",
                  bot.category === 'problematic' && "bg-rose-100 text-rose-700"
                )}>
                  {bot.category}
                </span>
              </TableCell>
              <TableCell>{(bot.confidence * 100).toFixed(1)}%</TableCell>
              <TableCell>{bot.reason}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(bot.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
