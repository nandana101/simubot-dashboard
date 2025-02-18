
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
  private static modelLoaded = false;
  private static model: any = null;

  static async loadModel() {
    if (!this.modelLoaded) {
      try {
        // Import the model (you'll need to host this file and update the URL)
        const response = await fetch('/models/random_forest_model.json');
        this.model = await response.json();
        this.modelLoaded = true;
        console.log('Bot detection model loaded successfully');
      } catch (error) {
        console.error('Error loading bot detection model:', error);
      }
    }
  }

  private static preprocessAccount(account: AccountActivity) {
    // Transform account data to match the model's expected input format
    return {
      retweets: account.retweets,
      replies: 0, // We'll need to add this to AccountActivity if available
      favoriteC: account.likes,
      hashtag: 0, // We'll need to add this to AccountActivity if available
      url: 0, // We'll need to add this to AccountActivity if available
      mentions: 0, // We'll need to add this to AccountActivity if available
      intertime: account.activityLevel, // Using as a proxy for interaction time
      ffratio: account.following / (account.followers || 1), // Prevent division by zero
      statuses_count: account.tweets,
      followers_count: account.followers,
      friends_count: account.following,
      favourites_count: account.likes,
      listed_count: 0 // We'll need to add this to AccountActivity if available
    };
  }

  private static predict(features: any): boolean {
    if (!this.model) {
      return this.fallbackDetection(features);
    }

    try {
      // This is a simplified version of Random Forest prediction
      // In a real implementation, you'd need to implement the actual RF algorithm
      const threshold = 0.5;
      let voteSum = 0;
      
      // Simulate random forest voting based on feature thresholds
      if (features.ffratio > 2) voteSum += 0.3;
      if (features.statuses_count < 50) voteSum += 0.2;
      if (features.intertime > 90) voteSum += 0.2;
      if (features.retweets / features.statuses_count > 0.8) voteSum += 0.3;

      return voteSum >= threshold;
    } catch (error) {
      console.error('Error during prediction:', error);
      return this.fallbackDetection(features);
    }
  }

  private static fallbackDetection(features: any): boolean {
    // Fallback to rule-based detection if ML fails
    let botScore = 0;
    
    if (features.ffratio > 2) botScore += 0.3;
    if (features.retweets / features.statuses_count > 0.8) botScore += 0.3;
    if (features.intertime > 90) botScore += 0.2;
    
    return botScore >= 0.5;
  }

  static async analyzeAccount(account: AccountActivity): Promise<DetectionResult> {
    await this.loadModel();
    
    const features = this.preprocessAccount(account);
    const isBot = this.predict(features);
    
    // Generate reason based on the features that contributed to the decision
    let reasons: string[] = [];
    
    if (features.ffratio > 2) {
      reasons.push("Unusual following to followers ratio");
    }
    if (features.retweets / features.statuses_count > 0.8) {
      reasons.push("High proportion of retweets");
    }
    if (features.intertime > 90) {
      reasons.push("Suspicious activity patterns");
    }

    return {
      isBot,
      confidence: reasons.length * 0.25, // Simple confidence score based on number of suspicious patterns
      reason: reasons.length > 0 
        ? reasons.join(". ") 
        : "No suspicious patterns detected"
    };
  }
}
