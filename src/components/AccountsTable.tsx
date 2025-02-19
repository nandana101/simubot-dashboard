
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

interface Account {
  id: string;
  username: string;
  activityLevel: number;
  lastActive: string;
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
  const activityLevel = Math.floor(Math.random() * 100);

  const joinDate = new Date();
  joinDate.setFullYear(joinDate.getFullYear() - Math.random());
  
  return {
    id: `acc_${Math.random().toString(36).substr(2, 9)}`,
    username: generateUsername(),
    activityLevel,
    lastActive: new Date().toISOString(),
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
    isCurrentlyActive: Math.random() > 0.7
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
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [botDetectionRate, setBotDetectionRate] = useState(0);
  const [avgActivityLevel, setAvgActivityLevel] = useState(0);
  const { toast } = useToast();

  // Function to analyze account for bot behavior
  const analyzeAccount = (account: Account) => {
    const metrics = {
      tweetFollowerRatio: account.tweets / (account.followers || 1),
      followingFollowerRatio: account.following / (account.followers || 1),
      mentionTweetRatio: account.mentions / (account.tweets || 1),
      urlTweetRatio: account.urls / (account.tweets || 1),
      retweetRatio: account.retweets / (account.tweets || 1),
      interactionFrequency: account.intertime,
    };

    // Calculate bot probability based on metrics
    let botProbability = 0;
    let reason = '';

    if (metrics.tweetFollowerRatio > 100) {
      botProbability += 0.4;
      reason = 'Unusually high tweet-to-follower ratio';
    }
    if (metrics.followingFollowerRatio > 10) {
      botProbability += 0.3;
      reason = 'Suspicious following-to-follower ratio';
    }
    if (metrics.interactionFrequency < 1) {
      botProbability += 0.4;
      reason = 'Extremely high posting frequency';
    }
    if (metrics.mentionTweetRatio > 0.8) {
      botProbability += 0.3;
      reason = 'Excessive mention usage';
    }
    if (metrics.urlTweetRatio > 0.7) {
      botProbability += 0.3;
      reason = 'High frequency of URL sharing';
    }
    if (metrics.retweetRatio > 0.9) {
      botProbability += 0.3;
      reason = 'Predominantly retweet behavior';
    }

    // Normalize probability to be between 0 and 1
    botProbability = Math.min(botProbability, 1);

    return {
      isBot: botProbability > 0.3,
      confidence: botProbability,
      reason: reason || 'Multiple suspicious patterns detected'
    };
  };

  useEffect(() => {
    setAccounts(Array.from({ length: 10 }, generateRandomAccount));

    const interval = setInterval(async () => {
      const newAccount = generateRandomAccount();
      
      try {
        const detectionResult = analyzeAccount(newAccount);
        
        if (detectionResult.isBot) {
          let category: 'disruptive' | 'satisfactory' | 'problematic';
          const confidence = detectionResult.confidence;
          
          if (confidence < 0.4) {
            category = 'satisfactory';
          } else if (confidence < 0.7) {
            category = 'disruptive';
          } else {
            category = 'problematic';
          }

          const botAccount = {
            id: newAccount.id,
            username: newAccount.username,
            confidence: detectionResult.confidence,
            reason: detectionResult.reason,
            category
          };

          setDetectedBots(current => [...current, botAccount]);
          
          toast({
            title: "Bot Account Detected",
            description: `@${newAccount.username} has been flagged as a ${category} bot.`,
            duration: 5000,
          });
        }

        // Add the new account to the accounts list
        setAccounts(currentAccounts => {
          const updatedAccounts = currentAccounts.map(account => ({
            ...account,
            activityLevel: Math.floor(Math.random() * 100),
            isCurrentlyActive: Math.random() > 0.7,
            lastActive: new Date().toISOString(),
            retweets: account.retweets + Math.floor(Math.random() * 5),
            likes: account.likes + Math.floor(Math.random() * 10),
            replies: account.replies + Math.floor(Math.random() * 3),
            mentions: account.mentions + Math.floor(Math.random() * 2)
          }));
          return [newAccount, ...updatedAccounts].slice(0, MAX_ACCOUNTS);
        });

        // Update metrics
        setTotalAccounts(prev => prev + 1);
        setBotDetectionRate(current => {
          const totalBots = detectedBots.length;
          const total = totalAccounts + 1;
          return (totalBots / total) * 100;
        });
        setAvgActivityLevel(current => {
          const activities = accounts.map(a => a.activityLevel);
          return activities.reduce((a, b) => a + b, 0) / activities.length;
        });

      } catch (error) {
        console.error('Error in bot detection:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast, totalAccounts, accounts.length]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Activity</h3>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Account Info</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Activity Metrics</TableHead>
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
