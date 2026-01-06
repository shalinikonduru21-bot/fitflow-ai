
import { 
  DailyChallenges, UserProfile, WearableMetrics, SocialData, 
  ActivityUpdate, PartialWorkout, WorkoutRecord, UserSettings, 
  Notification, StoreItem, MultiStreaks, DailyActiveStats 
} from '../types';

const STORAGE_KEY = 'fitflow_pro_v5_system';

export interface AppData {
  coins: number;
  tokens: number;
  lastTokenRefresh: string;
  streak: number; // Backwards compatibility
  multiStreaks: MultiStreaks;
  dailyActive: DailyActiveStats;
  streakSaveUsed: boolean;
  longestStreak: number;
  formStreak: number;
  lastWorkoutDate: string;
  lastLoginDate: string;
  workoutsCompleted: number;
  workoutHistory: WorkoutRecord[];
  badges: string[];
  challenges: DailyChallenges;
  profile?: UserProfile;
  settings: UserSettings;
  notifications: Notification[];
  purchasedItems: string[];
  workoutPlan?: any;
  partialWorkout?: PartialWorkout;
  integrations: {
    watchConnected: boolean;
    stravaConnected: boolean;
    useDemoData: boolean;
  };
  wearableData?: WearableMetrics;
  social: SocialData;
  reflections: { date: string; score: number; note: string }[];
}

const defaultSettings: UserSettings = {
  privacy: { socialVisibility: true, shareStats: true, communityOptIn: true },
  appearance: { theme: 'dark', accentColor: '#22d3ee', motionEnabled: true },
  notifications: {
    reminders: true, recoveryNudges: true, social: true, 
    tokens: true, achievements: true, timerMilestones: true,
    quietHoursStart: '22:00', quietHoursEnd: '07:00'
  }
};

const defaultData: AppData = {
  coins: 500,
  tokens: 100,
  lastTokenRefresh: new Date().toISOString(),
  streak: 0,
  multiStreaks: { activeMinutes: 0, consistency: 0, recovery: 0 },
  dailyActive: { totalSeconds: 0, lastUpdated: new Date().toISOString(), targetSeconds: 1800 },
  streakSaveUsed: false,
  longestStreak: 0,
  formStreak: 0,
  lastWorkoutDate: '',
  lastLoginDate: '',
  workoutsCompleted: 0,
  workoutHistory: [],
  badges: ['First Step'],
  challenges: {
    spinCompleted: false, blitzAttempts: 3, 
    bingoProgress: new Array(25).fill(false),
    beatYesterdayGoal: 15, beatYesterdayCurrent: 12
  },
  settings: defaultSettings,
  notifications: [],
  purchasedItems: [],
  integrations: { watchConnected: false, stravaConnected: false, useDemoData: true },
  social: { partners: [], circles: [], challenges: [], feed: [] },
  reflections: []
};

export const storage = {
  get: (): AppData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultData;
      const parsed = JSON.parse(data);
      // Ensure daily reset
      const today = new Date().toISOString().split('T')[0];
      const lastUpdate = parsed.dailyActive?.lastUpdated?.split('T')[0];
      if (lastUpdate !== today) {
        parsed.dailyActive = { 
          totalSeconds: 0, 
          lastUpdated: new Date().toISOString(), 
          targetSeconds: parsed.dailyActive?.targetSeconds || 1800 
        };
      }
      return { ...defaultData, ...parsed };
    } catch {
      return defaultData;
    }
  },
  save: (data: Partial<AppData>): AppData => {
    const current = storage.get();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
  
  addActiveSeconds: (seconds: number) => {
    const data = storage.get();
    const newTotal = data.dailyActive.totalSeconds + seconds;
    const today = new Date().toISOString().split('T')[0];
    
    // Notification logic for milestones
    if (data.settings.notifications.timerMilestones) {
      const oldMins = Math.floor(data.dailyActive.totalSeconds / 60);
      const newMins = Math.floor(newTotal / 60);
      if (newMins > oldMins && newMins % 10 === 0) {
        storage.addNotification({
          title: 'Activity Milestone',
          message: `You've been active for ${newMins} minutes today — great start.`,
          type: 'timer'
        });
      }
    }
    
    return storage.save({
      dailyActive: {
        ...data.dailyActive,
        totalSeconds: newTotal,
        lastUpdated: new Date().toISOString()
      }
    });
  },

  addCoins: (amount: number) => {
    const data = storage.get();
    return storage.save({ coins: data.coins + amount });
  },
  addTokens: (amount: number) => {
    const data = storage.get();
    return storage.save({ tokens: data.tokens + amount });
  },
  useTokens: (amount: number): boolean => {
    const data = storage.get();
    if (data.tokens < amount) return false;
    storage.save({ tokens: data.tokens - amount });
    return true;
  },

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const data = storage.get();
    // Check quiet hours
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isQuiet = currentTime >= data.settings.notifications.quietHoursStart || currentTime <= data.settings.notifications.quietHoursEnd;

    const newNotif: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      isRead: false,
      isQuiet
    };
    storage.save({ notifications: [newNotif, ...data.notifications].slice(0, 50) });
  },

  saveWorkout: (record: WorkoutRecord, tokenCostUsed: number = 0) => {
    const data = storage.get();
    const history = [record, ...data.workoutHistory];
    const today = new Date().toISOString().split('T')[0];
    
    // Partial sessions earn value: If less than 20% complete, refund some tokens
    if (record.completedPercent < 20 && tokenCostUsed > 0) {
      const refund = Math.floor(tokenCostUsed * 0.8);
      storage.addTokens(refund);
      storage.addNotification({
        title: 'Token Refund',
        message: `Session exited early. ${refund} DFT returned to your vault.`,
        type: 'token'
      });
    }

    let { activeMinutes, consistency, recovery } = data.multiStreaks;

    // Update Consistency Streak
    if (data.lastWorkoutDate !== today) {
      consistency += 1;
    }

    // Update Active Minutes Streak
    if (data.dailyActive.totalSeconds >= data.dailyActive.targetSeconds && data.lastWorkoutDate !== today) {
      activeMinutes += 1;
    }

    // Recovery Streak: If it's a BREATH session or following a high-intensity day
    if (record.intent === 'BREATH' || record.intent === 'STABILITY') {
      recovery += 1;
    }

    storage.save({ 
      workoutHistory: history, 
      workoutsCompleted: data.workoutsCompleted + 1,
      lastWorkoutDate: today,
      multiStreaks: { activeMinutes, consistency, recovery },
      formStreak: record.avgFormQuality >= 90 ? data.formStreak + 1 : 0
    });
  },

  updateStreak: () => {
    const data = storage.get();
    const today = new Date().toISOString().split('T')[0];
    
    if (data.lastTokenRefresh.split('T')[0] !== today) {
      storage.save({ tokens: 100, lastTokenRefresh: new Date().toISOString() });
    }

    if (data.lastLoginDate === today) return data;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let { consistency, activeMinutes, recovery } = data.multiStreaks;

    // Gentle Handling: Check if last workout was more than 1 day ago
    if (data.lastWorkoutDate !== today && data.lastWorkoutDate !== yesterdayStr) {
      if (data.streakSaveUsed) {
        // Preserved, but reset the save
        storage.save({ streakSaveUsed: false });
        storage.addNotification({
          title: 'Streak Preserved',
          message: "You missed a cycle, but your historical progress was safeguarded.",
          type: 'recovery'
        });
      } else {
        consistency = 0;
        activeMinutes = 0;
        recovery = 0;
      }
    }
    
    return storage.save({ 
      lastLoginDate: today, 
      multiStreaks: { consistency, activeMinutes, recovery } 
    });
  },
  reactToFeed: (feedId: string, emoji: string): AppData => {
    const data = storage.get();
    const feed = data.social.feed.map(item => {
      if (item.id === feedId) {
        const reactions = { ...item.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...item, reactions };
      }
      return item;
    });
    return storage.save({ social: { ...data.social, feed } });
  },
  nudgePartner: (partnerId: string): AppData => {
    const data = storage.get();
    const partners = data.social.partners.map(p => {
      if (p.id === partnerId) {
        return { ...p, lastNudgeAt: Date.now() };
      }
      return p;
    });
    return storage.save({ social: { ...data.social, partners } });
  },
  joinChallenge: (chId: string): AppData => {
    const data = storage.get();
    const challenges = data.social.challenges.map(c => {
      if (c.id === chId) {
        return { ...c, isJoined: true };
      }
      return c;
    });
    return storage.save({ social: { ...data.social, challenges } });
  },
  // Added purchaseItem method to handle marketplace transactions
  purchaseItem: (item: StoreItem): boolean => {
    const data = storage.get();
    if (data.purchasedItems.includes(item.id)) return true;
    
    const canAfford = item.currency === 'coins' ? data.coins >= item.cost : data.tokens >= item.cost;
    if (!canAfford) return false;
    
    const update: Partial<AppData> = {
      purchasedItems: [...data.purchasedItems, item.id]
    };
    
    if (item.currency === 'coins') {
      update.coins = data.coins - item.cost;
    } else {
      update.tokens = data.tokens - item.cost;
    }
    
    storage.save(update);
    storage.addNotification({
      title: 'Item Unlocked',
      message: `${item.name} is now available in your arsenal.`,
      type: 'achievement'
    });
    return true;
  }
};
