
interface AccountActivity {
  followers: number;
  following: number;
  tweets: number;
  retweets: number;
  likes: number;
  activityLevel: number;
  replies?: number;
  hashtags?: number;
  urls?: number;
  mentions?: number;
  listedCount?: number;
}

interface DetectionResult {
  isBot: boolean;
  confidence: number;
  reason: string;
}

interface TreeNode {
  feature: number;
  threshold: number;
  left: TreeNode | number;
  right: TreeNode | number;
}

interface RandomForestModel {
  trees: TreeNode[];
  features: string[];
  numClasses: number;
}

export class BotDetectionService {
  private static modelLoaded = false;
  private static model: RandomForestModel | null = null;

  static async loadModel() {
    if (!this.modelLoaded) {
      try {
        const response = await fetch('/models/random_forest_model.json');
        this.model = await response.json();
        this.modelLoaded = true;
        console.log('Random Forest model loaded successfully');
      } catch (error) {
        console.error('Error loading Random Forest model:', error);
      }
    }
  }

  private static predictTree(tree: TreeNode, features: number[]): number {
    let node: TreeNode | number = tree;
    
    while (typeof node !== 'number') {
      if (features[node.feature] <= node.threshold) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    
    return node;
  }

  private static preprocessAccount(account: AccountActivity): number[] {
    if (!this.model) return [];

    // Map account features to match the model's expected input format
    const featureMap: { [key: string]: number } = {
      retweets: account.retweets,
      replies: account.replies || 0,
      favoriteC: account.likes,
      hashtag: account.hashtags || 0,
      url: account.urls || 0,
      mentions: account.mentions || 0,
      intertime: account.activityLevel,
      ffratio: account.following / (account.followers || 1),
      statuses_count: account.tweets,
      followers_count: account.followers,
      friends_count: account.following,
      favourites_count: account.likes,
      listed_count: account.listedCount || 0
    };

    // Return features in the same order as the model expects them
    return this.model.features.map(feature => featureMap[feature] || 0);
  }

  private static predict(features: number[]): boolean {
    if (!this.model) {
      return this.fallbackDetection(features);
    }

    try {
      // Get predictions from all trees
      const predictions = this.model.trees.map(tree => 
        this.predictTree(tree, features)
      );

      // Calculate the average prediction (for binary classification)
      const avgPrediction = predictions.reduce((a, b) => a + b, 0) / predictions.length;
      
      // Use 0.5 as the threshold for binary classification
      return avgPrediction >= 0.5;
    } catch (error) {
      console.error('Error during Random Forest prediction:', error);
      return this.fallbackDetection(features);
    }
  }

  private static fallbackDetection(features: number[]): boolean {
    if (!this.model) return false;
    
    // Get feature indices for important features
    const ffratioIndex = this.model.features.indexOf('ffratio');
    const statusesIndex = this.model.features.indexOf('statuses_count');
    const retweetsIndex = this.model.features.indexOf('retweets');
    
    // Fallback to rule-based detection
    let botScore = 0;
    
    if (features[ffratioIndex] > 2) botScore += 0.3;
    if (features[statusesIndex] < 50) botScore += 0.2;
    if (features[retweetsIndex] / features[statusesIndex] > 0.8) botScore += 0.3;
    
    return botScore >= 0.5;
  }

  private static generateReason(features: number[]): string[] {
    if (!this.model) return ["Model not loaded"];

    const reasons: string[] = [];
    const featureImportance = [
      { name: 'ffratio', threshold: 2, message: "Unusual following to followers ratio" },
      { name: 'retweets', threshold: 0.8, message: "High proportion of retweets" },
      { name: 'intertime', threshold: 90, message: "Suspicious activity patterns" },
      { name: 'statuses_count', threshold: 50, message: "Low number of total tweets" },
      { name: 'mentions', threshold: 0.8, message: "Excessive use of mentions" }
    ];

    featureImportance.forEach(({ name, threshold, message }) => {
      const index = this.model!.features.indexOf(name);
      if (index !== -1 && features[index] > threshold) {
        reasons.push(message);
      }
    });

    return reasons;
  }

  static async analyzeAccount(account: AccountActivity): Promise<DetectionResult> {
    await this.loadModel();
    
    const features = this.preprocessAccount(account);
    const isBot = this.predict(features);
    const reasons = this.generateReason(features);
    
    return {
      isBot,
      confidence: reasons.length > 0 ? reasons.length * 0.25 : 0.1,
      reason: reasons.length > 0 ? reasons.join(". ") : "No suspicious patterns detected"
    };
  }
}
