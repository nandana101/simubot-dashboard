
import { pipeline } from "@huggingface/transformers";

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
  private static classifier: any = null;

  static async initialize() {
    try {
      this.classifier = await pipeline(
        "text-classification",
        "onnx-community/distilbert-base-uncased-bot-detection",
        { device: "webgpu" }
      );
      console.log("Bot detection model initialized");
    } catch (error) {
      console.error("Error initializing bot detection model:", error);
    }
  }

  static async analyzeAccount(account: AccountActivity): Promise<DetectionResult> {
    if (!this.classifier) {
      await this.initialize();
    }

    // Convert account metrics to a descriptive text for analysis
    const accountDescription = `Account has ${account.followers} followers and follows ${account.following} users. 
    Posted ${account.tweets} tweets with ${account.retweets} retweets and ${account.likes} likes. 
    Activity level is ${account.activityLevel}%.`;

    try {
      const result = await this.classifier(accountDescription);
      const prediction = result[0];

      // Determine if account is likely a bot based on classification
      const isBot = prediction.label === "bot";
      
      let reason = isBot 
        ? "Suspicious pattern detected: "
        : "Account appears legitimate: ";

      // Add specific reasons based on metrics
      if (account.following > account.followers * 2) {
        reason += "Unusually high following to followers ratio. ";
      }
      if (account.retweets > account.tweets * 3) {
        reason += "Excessive retweet behavior. ";
      }
      if (account.activityLevel > 90) {
        reason += "Abnormally high activity level. ";
      }

      return {
        isBot: isBot,
        confidence: prediction.score,
        reason: reason.trim()
      };
    } catch (error) {
      console.error("Error analyzing account:", error);
      return {
        isBot: false,
        confidence: 0,
        reason: "Error analyzing account"
      };
    }
  }
}
