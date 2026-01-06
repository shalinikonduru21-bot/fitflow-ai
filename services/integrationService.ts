
import { WearableMetrics } from '../types';
import { storage } from './storageService';

export interface HealthAdapter {
  fetchMetrics(): Promise<WearableMetrics>;
  sourceName: WearableMetrics['dataSource'];
}

export const StravaAdapter: HealthAdapter = {
  sourceName: 'Strava',
  async fetchMetrics() {
    return {
      avgHeartRate: 72,
      restingHeartRate: 60,
      sleepHours: 8.0,
      activityDuration: 45,
      calories: 450,
      lastActivityType: 'Running',
      lastActivityIntensity: 'high',
      dataSource: 'Strava',
      timestamp: Date.now()
    };
  }
};

export const WatchAdapter: HealthAdapter = {
  sourceName: 'Watch',
  async fetchMetrics() {
    return {
      avgHeartRate: 85,
      restingHeartRate: 74,
      sleepHours: 5.5,
      activityDuration: 10,
      calories: 120,
      dataSource: 'Watch',
      timestamp: Date.now()
    };
  }
};

export const DemoAdapter: HealthAdapter = {
  sourceName: 'Demo',
  async fetchMetrics() {
    const isTired = Math.random() > 0.5;
    return {
      avgHeartRate: isTired ? 88 : 68,
      restingHeartRate: isTired ? 75 : 62,
      sleepHours: isTired ? 5.0 : 8.2,
      activityDuration: 30,
      calories: 300,
      dataSource: 'Demo',
      timestamp: Date.now()
    };
  }
};

export const integrationService = {
  getRecoveryScore: (metrics: WearableMetrics | undefined | null): number => {
    if (!metrics) return 100;
    let score = 100;
    if (metrics.sleepHours < 6) score -= 30;
    else if (metrics.sleepHours < 7) score -= 15;
    if (metrics.restingHeartRate > 75) score -= 20;
    else if (metrics.restingHeartRate > 70) score -= 10;
    if (metrics.lastActivityIntensity === 'high') score -= 15;
    return Math.max(10, score);
  },

  getRecoveryInsight: (metrics: WearableMetrics | undefined | null): string => {
    if (!metrics) return "Connect a wearable to receive biological trajectory insights.";
    const score = integrationService.getRecoveryScore(metrics);
    if (score < 50) {
      if (metrics.sleepHours < 6) return `Sleep deficit detected (${metrics.sleepHours}h). AI protocol: Low-intensity mobility.`;
      if (metrics.restingHeartRate > 75) return "Resting HR is elevated. Suggesting a BREATH session for nervous system recovery.";
      return "General systemic load detected. Workouts adapted for safety.";
    }
    if (score > 85) return "Prime biometric state. High-intensity progressive holds are now enabled.";
    return "Balanced state detected. Proceeding with optimized baseline plan.";
  },

  async sync(adapter: HealthAdapter) {
    try {
      const data = await adapter.fetchMetrics();
      storage.save({ wearableData: data });
      storage.addNotification({
        title: 'Biometric Sync Complete',
        message: `Health data successfully imported from ${adapter.sourceName}.`,
        type: 'recovery'
      });
      return data;
    } catch (e) {
      console.error("Sync failed", e);
      return null;
    }
  }
};
