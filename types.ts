
export enum AppState {
  ONBOARDING = 'ONBOARDING',
  QUESTIONNAIRE = 'QUESTIONNAIRE',
  DASHBOARD = 'DASHBOARD',
  TRAIN_HUB = 'TRAIN_HUB',
  WORKOUT_EXECUTION = 'WORKOUT_EXECUTION',
  POST_WORKOUT = 'POST_WORKOUT',
  ANALYTICS = 'ANALYTICS',
  SOCIAL = 'SOCIAL',
  STORE = 'STORE',
  PROFILE = 'PROFILE',
  INTEGRATIONS = 'INTEGRATIONS'
}

export type SessionIntent = 'PEAK' | 'STAMINA' | 'STABILITY' | 'BREATH';
export type RepQuality = 'clean' | 'rushed' | 'incomplete' | 'unsafe';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MultiStreaks {
  activeMinutes: number; // Days meeting min active time
  consistency: number;   // Consecutive days with any activity
  recovery: number;      // Consecutive days with balance between PEAK and BREATH
}

export interface DailyActiveStats {
  totalSeconds: number;
  lastUpdated: string; // ISO Date
  targetSeconds: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'coins' | 'tokens';
  category: 'session' | 'insight' | 'preset' | 'recovery' | 'cosmetic';
  isUnlocked?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'recovery' | 'social' | 'token' | 'achievement' | 'timer';
  timestamp: number;
  isRead: boolean;
  isQuiet?: boolean;
}

export interface UserSettings {
  privacy: {
    socialVisibility: boolean;
    shareStats: boolean;
    communityOptIn: boolean;
  };
  appearance: {
    theme: 'dark' | 'neon' | 'oled';
    accentColor: string;
    motionEnabled: boolean;
  };
  notifications: {
    reminders: boolean;
    recoveryNudges: boolean;
    social: boolean;
    tokens: boolean;
    achievements: boolean;
    timerMilestones: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
}

export interface WorkoutRecord {
  id: string;
  date: string; 
  title: string;
  intent: SessionIntent;
  duration: number; 
  reps: number;
  avgFormQuality: number; 
  cleanReps: number;
  rushedReps: number;
  unsafeReps: number;
  tokensEarned: number;
  completedPercent: number;
}

export interface ActivityUpdate {
  id: string;
  userName: string;
  avatar: string;
  type: 'streak' | 'completion' | 'milestone' | 'form_win' | 'reflection';
  detail: string;
  timestamp: number;
  reactions: Record<string, number>;
}

export interface Partner {
  id: string;
  name: string;
  avatar: string;
  lastWorkout: string;
  streak: number;
  status: 'active' | 'resting' | 'completed';
  lastNudgeAt?: number;
}

export interface Circle {
  id: string;
  name: string;
  members: { id: string; name: string; avatar: string; activeToday: boolean }[];
  goal: string;
  activityLevel: 'low' | 'medium' | 'high';
  recentWins: string[];
}

export interface SocialChallenge {
  id: string;
  title: string;
  participants: number;
  daysRemaining: number;
  progress: number; 
  type: 'consistency' | 'volume' | 'form';
  isJoined: boolean;
}

export interface SocialData {
  partners: Partner[];
  circles: Circle[];
  challenges: SocialChallenge[];
  feed: ActivityUpdate[];
}

export interface WearableMetrics {
  avgHeartRate: number;
  restingHeartRate: number;
  sleepHours: number;
  activityDuration: number; // minutes
  calories: number;
  lastActivityType?: string;
  lastActivityIntensity?: 'low' | 'medium' | 'high';
  dataSource: 'Watch' | 'Strava' | 'GoogleFit' | 'Demo' | 'None';
  timestamp: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  medicalConditions: string;
  injuries: string;
  limitations: string[];
  equipment: string[];
  duration: number;
  frequency: number;
  focusAreas: string[];
  motivationStyle: 'encouraging' | 'strict' | 'technical';
  wearableMetrics?: WearableMetrics;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  reps: number;
  sets: number;
  targetAngles?: {
    joint: string;
    ideal: number;
    threshold: number;
  }[];
  variations?: {
    name: string;
    description: string;
    equipmentRequired?: string;
  }[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  intent: SessionIntent;
  exercises: Exercise[];
  totalDuration: number;
  aiInsight?: string;
  adaptationRules?: string;
}

export interface PartialWorkout {
  plan: WorkoutPlan;
  currentExIndex: number;
  currentSet: number;
  totalRepsDone: number;
  timestamp: number;
  tokenCost?: number;
}

export interface JointStatus {
  angle: number;
  status: 'correct' | 'warning' | 'unsafe';
  reason: string;
}

export interface PoseAnalysis {
  formQuality: number;
  jointStatuses: Record<string, JointStatus>;
  repCount: number;
  lastRepQuality?: RepQuality;
  state: 'up' | 'down' | 'neutral';
  isSafe: boolean;
}

export interface DailyChallenges {
  spinCompleted: boolean;
  blitzAttempts: number;
  bingoProgress: boolean[];
  beatYesterdayGoal: number;
  beatYesterdayCurrent: number;
}

export interface NavigationState {
  current: AppState;
  stack: AppState[];
  breadcrumb: string[];
}
