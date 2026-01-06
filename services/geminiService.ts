
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutPlan, WearableMetrics, ChatMessage, SocialData, SessionIntent } from "../types";
import { integrationService } from "./integrationService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWorkoutPlan = async (profile: UserProfile, intent: SessionIntent = 'PEAK'): Promise<WorkoutPlan> => {
  const metrics = profile.wearableMetrics;
  const recoveryInsight = metrics ? integrationService.getRecoveryInsight(metrics) : "No wearable data present. Using baseline calibration.";
  const recoveryScore = metrics ? integrationService.getRecoveryScore(metrics) : 100;
  
  const intentPrompts: Record<SessionIntent, string> = {
    PEAK: "Focus on strength + mobility + focus. If recovery is <60, prioritize mobility. If >85, add progressive holds and maximum systemic load.",
    STAMINA: "Focus on cardio endurance. If recovery is <50, increase rest intervals by 50% to prevent metabolic overreach.",
    STABILITY: "Focus on balance + posture. Slower tempo required if resting heart rate is elevated.",
    BREATH: "Focus on nervous system reset. Passive stretching. Mandatory if recovery score is critical (<40)."
  };

  const prompt = `
    Generate a smart workout session for FitFlow AI.
    USER IDENTITY: ${profile.name}
    INTENT: ${intent} - ${intentPrompts[intent]}
    
    BIOMETRIC CONTEXT:
    - Current Recovery Index: ${recoveryScore}/100
    - Health Signal Insight: ${recoveryInsight}
    - Gear Available: ${profile.equipment.join(', ')}
    
    CRITICAL REQUIREMENT:
    In the "aiInsight" field, you MUST explain how the biometrics affected this session. 
    Example: "Because your resting HR was elevated, I've reduced the explosive movements."
    
    DATA REQUIREMENTS:
    - Return 3-5 exercises.
    - "adaptationRules": Precise logic on how to modify if the user feels pain or fatigue.
    - "exercises": Include name, reps, sets, and a description.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          intent: { type: Type.STRING },
          totalDuration: { type: Type.NUMBER },
          aiInsight: { type: Type.STRING },
          adaptationRules: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                reps: { type: Type.NUMBER },
                sets: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["id", "title", "intent", "exercises", "aiInsight", "adaptationRules"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getFlowBotResponse = async (
  message: string, 
  history: ChatMessage[], 
  context: {
    profile: UserProfile | null,
    metrics: WearableMetrics | null,
    streak: number,
    coins: number,
    tokens: number,
    social?: SocialData
  }
): Promise<string> => {
  const recoveryScore = context.metrics ? integrationService.getRecoveryScore(context.metrics) : 100;
  const recoveryInsight = context.metrics ? integrationService.getRecoveryInsight(context.metrics) : "No health data linked.";
  
  const systemInstruction = `
    You are FlowBot, the Adaptive AI Coach for FitFlow AI.
    
    BIOMETRIC TELEMETRY:
    - Recovery Score: ${recoveryScore}%
    - Source: ${context.metrics?.dataSource || 'None'}
    - Insight: ${recoveryInsight}
    
    YOUR ROLE:
    1. Answer fitness and health data questions.
    2. Be explainable: "Your sleep was low (5.5h), so I recommend avoiding high-intensity stamina today."
    3. Privacy-first: If asked about data security, explain that processing is local and temporary.
    4. Safety-first: Never give medical advice. Suggest rest if biometrics are poor.
    5. DFT (Flow Tokens) refresh daily. BREATH sessions are always 0 DFT.
    6. Keep responses under 3 concise sentences.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      ...history.map(m => ({ parts: [{ text: m.text }], role: m.role })),
      { parts: [{ text: message }], role: 'user' }
    ] as any,
    config: { systemInstruction }
  });

  return response.text?.trim() || "Sensors unresponsive. Priority: Safe movement baseline.";
};
