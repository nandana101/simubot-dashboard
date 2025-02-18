
interface AccountActivity {
  followers: number;
  following: number;
  tweets: number;
  retweets: number;
  likes: number;
  activityLevel: number;
}

interface DetectionResult {
  isBot: boolean;
  confidence: number;
  reason: string;
}

export class BotDetectionService {
  static analyzeAccount(account: AccountActivity): DetectionResult {
    let botScore = 0;
    let reasons: string[] = [];

    // Check following to followers ratio
    if (account.following > account.followers * 2) {
      botScore += 0.3;
      reasons.push("Unusually high following to followers ratio");
    }

    // Check retweet behavior
    if (account.retweets > account.tweets * 3) {
      botScore += 0.3;
      reasons.push("Excessive retweet behavior");
    }

    // Check activity level
    if (account.activityLevel > 90) {
      botScore += 0.2;
      reasons.push("Abnormally high activity level");
    }

    // Check engagement ratio
    const engagementRatio = (account.likes + account.retweets) / account.tweets;
    if (engagementRatio > 10) {
      botScore += 0.2;
      reasons.push("Suspicious engagement pattern");
    }

    return {
      isBot: botScore >= 0.5,
      confidence: botScore,
      reason: reasons.length > 0 
        ? reasons.join(". ") 
        : "No suspicious patterns detected"
    };
  }
}
