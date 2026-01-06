
export const calculateAngle = (p1: any, p2: any, p3: any): number => {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
};

export const MAJOR_JOINTS = {
  shoulder_l: 11, shoulder_r: 12,
  elbow_l: 13, elbow_r: 14,
  wrist_l: 15, wrist_r: 16,
  hip_l: 23, hip_r: 24,
  knee_l: 25, knee_r: 26,
  ankle_l: 27, ankle_r: 28,
};

// Explainable AI Logic: Mapping angles to human reasons
export const getCorrectionReason = (joint: string, angle: number): string => {
  if (joint === 'knee') {
    if (angle < 70) return "Excessive depth causes unnecessary knee strain.";
    if (angle > 110) return "Insufficient depth reduces muscle activation.";
  }
  if (joint === 'back') return "A rounded back shifts load to spinal discs instead of legs.";
  return "Keep joint alignment stable to prevent connective tissue injury.";
};
