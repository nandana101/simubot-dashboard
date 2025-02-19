
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
import { MessageSquare, Repeat2, Users, Heart, Hash, Link2, AtSign, Clock } from "lucide-react";
import { BotDetectionService } from "@/services/BotDetectionService";
import { DetectedBotsTable } from "@/components/DetectedBotsTable";
import { useToast } from "@/components/ui/use-toast";
import { BotFilterSelect } from "./BotFilterSelect";

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
  replies: number;
  hashtags: number;
  urls: number;
  mentions: number;
  intertime: number;
  isCurrentlyActive: boolean;
  botCategory?: 'normal' | 'disruptive' | 'satisfactory' | 'problematic';
}

const FIRST_NAMES = [
  "emma", "liam", "olivia", "noah", "ava", "oliver", "sophia", "lucas",
  "isabella", "mason", "mia", "harry", "charlotte", "alex", "amelia"
];

const generateUsername = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const randomNum = Math.floor(Math.random() * 9999);
  return `${firstName}${randomNum}`;
};

const determineBotCategory = (riskScore: number, activityLevel: number): Account['botCategory'] => {
  if (riskScore < 25) return 'normal';
  if (riskScore < 50) return 'satisfactory';
  if (riskScore < 75) return 'disruptive';
  return 'problematic';
};

const generateRandomAccount = (): Account => {
  const followers = Math.floor(Math.random() * 10000);
  const following = Math.floor(Math.random() * 5000);
  const tweets = Math.floor(Math.random() * 5000);
  const retweets = Math.floor(Math.random() * 1000);
  const likes = Math.floor(Math.random() * 5000);
  const replies = Math.floor(Math.random() * 800);
  const hashtags = Math.floor(Math.random() * 200);
  const urls = Math.floor(Math.random() * 150);
  const mentions = Math.floor(Math.random() * 300);
  const intertime = Math.floor(Math.random() * 24);
  const riskScore = Math.floor(Math.random() * 100);
  const activityLevel = Math.floor(Math.random() * 100);

  const joinDate = new Date();
  joinDate.setFullYear(joinDate.getFullYear() - Math.random());
  
  return {
    id: `acc_${Math.random().toString(36).substr(2, 9)}`,
    username: generateUsername(),
    activityLevel,
    lastActive: new Date().toISOString(),
    riskScore,
    followers,
    following,
    tweets,
    retweets,
    likes,
    joinedDate: joinDate.toISOString(),
    replies,
    hashtags,
    urls,
    mentions,
    intertime,
    isCurrentlyActive: Math.random() > 0.7,
    botCategory: determineBotCategory(riskScore, activityLevel)
  };
};

const MAX_ACCOUNTS = 100;

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const AccountsTable = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [detectedBots, setDetectedBots] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
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
            reason: detectionResult.reason,
            category: newAccount.botCategory
          }]);
          
          toast({
            title: "Bot Account Detected",
            description: `@${newAccount.username} has been flagged as a potential ${newAccount.botCategory} bot.`,
            duration: 5000,
          });
        }

        // Update random account activities
        setAccounts(currentAccounts => {
          return currentAccounts.map(account => ({
            ...account,
            activityLevel: Math.floor(Math.random() * 100),
            isCurrentlyActive: Math.random() > 0.7,
            lastActive: new Date().toISOString(),
            retweets: account.retweets + Math.floor(Math.random() * 5),
            likes: account.likes + Math.floor(Math.random() * 10),
            replies: account.replies + Math.floor(Math.random() * 3),
            mentions: account.mentions + Math.floor(Math.random() * 2)
          }));
        });

        setAccounts(currentAccounts => [newAccount, ...currentAccounts].slice(0, MAX_ACCOUNTS));
      } catch (error) {
        console.error('Error in bot detection:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

  const filteredAccounts = accounts.filter(account => {
    if (filter === "all") return true;
    return account.botCategory === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Account List</h3>
        <BotFilterSelect onFilterChange={setFilter} />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Account Info</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Activity Metrics</TableHead>
                <TableHead>Risk Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
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
                      <div className="flex items-center space-x-2">
                        <AtSign className="h-3 w-3" />
                        <span>{formatNumber(account.mentions)} mentions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-3 w-3" />
                        <span>{formatNumber(account.hashtags)} hashtags</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link2 className="h-3 w-3" />
                        <span>{formatNumber(account.urls)} URLs</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {account.activityLevel}% active
                        {account.isCurrentlyActive && (
                          <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last seen: {new Date(account.lastActive).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Intertime: {account.intertime}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        FF Ratio: {(account.following / (account.followers || 1)).toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            account.riskScore < 25 && "bg-emerald-500",
                            account.riskScore >= 25 && account.riskScore < 50 && "bg-amber-500",
                            account.riskScore >= 50 && account.riskScore < 75 && "bg-orange-500",
                            account.riskScore >= 75 && "bg-rose-500"
                          )}
                          style={{ width: `${account.riskScore}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {account.riskScore}% risk level
                      </div>
                      {account.botCategory && (
                        <div className="text-xs font-medium">
                          Category: {account.botCategory}
                        </div>
                      )}
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
          onRemoveBot={(id) => {
            setDetectedBots(current => current.filter(bot => bot.id !== id));
            setAccounts(current => current.filter(account => account.id !== id));
          }}
        />
      </div>
    </div>
  );
};
