
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
  featureImportance: { [key: string]: number };
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

  private static predict(features: number[]): number {
    if (!this.model) return 0;

    // Get predictions from all trees
    const predictions = this.model.trees.map(tree => 
      this.predictTree(tree, features)
    );

    // Calculate the average prediction
    const avgPrediction = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    
    // Return 1 for bot, 0 for genuine user
    return avgPrediction >= 0.5 ? 1 : 0;
  }

  private static calculateConfidence(features: number[]): number {
    if (!this.model) return 0;

    // Calculate confidence based on feature importance and deviation from thresholds
    let confidence = 0;
    let totalImportance = 0;

    Object.entries(this.model.featureImportance).forEach(([feature, importance]) => {
      const featureIndex = this.model.features.indexOf(feature);
      const featureValue = features[featureIndex];
      
      // Add to confidence if the feature value is significantly different from typical user patterns
      if (feature === 'ffratio' && featureValue > 2) {
        confidence += importance;
      } else if (feature === 'intertime' && featureValue < 5) {
        confidence += importance;
      } else if (feature === 'statuses_count' && featureValue > 1000) {
        confidence += importance;
      }
      
      totalImportance += importance;
    });

    return Math.min(confidence / totalImportance, 1);
  }

  private static generateReason(features: number[]): string[] {
    if (!this.model) return ["Model not loaded"];

    const reasons: string[] = [];
    const featureChecks = [
      { 
        name: 'ffratio', 
        threshold: 2, 
        message: "Unusual following to followers ratio",
        index: this.model.features.indexOf('ffratio')
      },
      { 
        name: 'intertime', 
        threshold: 5, 
        message: "Very high activity frequency",
        index: this.model.features.indexOf('intertime')
      },
      { 
        name: 'statuses_count', 
        threshold: 1000, 
        message: "Excessive number of tweets",
        index: this.model.features.indexOf('statuses_count')
      },
      { 
        name: 'mentions', 
        threshold: 0.8, 
        message: "High frequency of mentions",
        index: this.model.features.indexOf('mentions')
      }
    ];

    featureChecks.forEach(check => {
      if (check.index !== -1 && features[check.index] > check.threshold) {
        reasons.push(check.message);
      }
    });

    return reasons;
  }

  static async analyzeAccount(account: AccountActivity): Promise<DetectionResult> {
    await this.loadModel();
    
    const features = this.preprocessAccount(account);
    const prediction = this.predict(features);
    const confidence = this.calculateConfidence(features);
    const reasons = this.generateReason(features);
    
    return {
      isBot: prediction === 1,
      confidence,
      reason: reasons.length > 0 ? reasons.join(". ") : "No suspicious patterns detected"
    };
  }
}
