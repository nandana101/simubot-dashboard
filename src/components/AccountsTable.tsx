
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { MessageSquare, Repeat2, Users, Heart } from "lucide-react";
import { BotDetectionService } from "@/services/BotDetectionService";
import { DetectedBotsTable } from "@/components/DetectedBotsTable";
import { useToast } from "@/components/ui/use-toast";

interface Account {
  id: string;
  username: string;
  activityLevel: number;
  lastActive: string;
  riskScore: number;
  followers: number;
  following: number;
  tweets: number;
  retweets: number;
  likes: number;
  joinedDate: string;
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
  const followers = Math.floor(Math.random() * 10000);
  const following = Math.floor(Math.random() * 5000);
  const tweets = Math.floor(Math.random() * 5000);
  const retweets = Math.floor(Math.random() * 1000);
  const likes = Math.floor(Math.random() * 5000);

  const joinDate = new Date();
  joinDate.setFullYear(joinDate.getFullYear() - Math.random());
  
  return {
    id: `acc_${Math.random().toString(36).substr(2, 9)}`,
    username: generateUsername(),
    activityLevel: Math.floor(Math.random() * 100),
    lastActive: new Date().toISOString(),
    riskScore: Math.floor(Math.random() * 100),
    followers,
    following,
    tweets,
    retweets,
    likes,
    joinedDate: joinDate.toISOString(),
  };
};

const MAX_ACCOUNTS = 100;

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export const AccountsTable = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [detectedBots, setDetectedBots] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setAccounts(Array.from({ length: 10 }, generateRandomAccount));

    const interval = setInterval(async () => {
      const newAccount = generateRandomAccount();
      
      try {
        const detectionResult = await BotDetectionService.analyzeAccount(newAccount);
        
        if (detectionResult.isBot) {
          setDetectedBots(current => [...current, {
            id: newAccount.id,
            username: newAccount.username,
            confidence: detectionResult.confidence,
            reason: detectionResult.reason
          }]);
          
          toast({
            title: "Bot Account Detected",
            description: `@${newAccount.username} has been flagged as a potential bot.`,
            duration: 5000,
          });
        }

        setAccounts(currentAccounts => [newAccount, ...currentAccounts].slice(0, MAX_ACCOUNTS));
      } catch (error) {
        console.error('Error in bot detection:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

  const handleRemoveBot = (id: string) => {
    setDetectedBots(current => current.filter(bot => bot.id !== id));
    setAccounts(current => current.filter(account => account.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card animate-fade-in">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Account Info</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Risk Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">@{account.username}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(account.joinedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {formatNumber(account.followers)} followers
                        </span>
                        <span>·</span>
                        <span>{formatNumber(account.following)} following</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-3 w-3" />
                        <span>{formatNumber(account.tweets)} tweets</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Repeat2 className="h-3 w-3" />
                        <span>{formatNumber(account.retweets)} retweets</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(account.likes)} likes</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{account.activityLevel}% active</div>
                      <div className="text-xs text-muted-foreground">
                        Last seen: {new Date(account.lastActive).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
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
                      <div className="text-xs text-muted-foreground">
                        {account.riskScore}% risk level
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Detected Bots</h2>
        <DetectedBotsTable 
          bots={detectedBots}
          onRemoveBot={handleRemoveBot}
        />
      </div>
    </div>
  );
};
