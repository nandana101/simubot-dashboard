
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
