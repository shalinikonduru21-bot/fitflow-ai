
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { calculateAngle, MAJOR_JOINTS, getCorrectionReason } from '../services/poseService';
import { PoseAnalysis, JointStatus, RepQuality } from '../types';

interface PoseCanvasProps {
  onAnalysis: (analysis: PoseAnalysis) => void;
  exercise: any;
}

const PoseCanvas: React.FC<PoseCanvasProps> = ({ onAnalysis, exercise }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const stateRef = useRef<'up' | 'down'>('neutral' as any);
  const countRef = useRef<number>(0);
  const repStartTimeRef = useRef<number>(0);
  const lastRepQualityRef = useRef<RepQuality>('clean');

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const landmarks = results.poseLandmarks;
    const jointStatuses: Record<string, JointStatus> = {};
    let isSafe = true;

    // 1. Calculate Joint Statuses (Heat Zones)
    const kneeAngle = calculateAngle(landmarks[MAJOR_JOINTS.hip_l], landmarks[MAJOR_JOINTS.knee_l], landmarks[MAJOR_JOINTS.ankle_l]);
    const targetKnee = 90;
    const diff = Math.abs(kneeAngle - targetKnee);
    
    let kneeStatus: JointStatus['status'] = 'correct';
    if (kneeAngle < 60) { kneeStatus = 'unsafe'; isSafe = false; }
    else if (diff > 35) kneeStatus = 'warning';
    
    jointStatuses['knee'] = { angle: kneeAngle, status: kneeStatus, reason: getCorrectionReason('knee', kneeAngle) };

    // 2. Neon Visualization Layer
    // @ts-ignore
    if (window.drawConnectors) {
      const colorMap = { correct: '#00ffff', warning: '#facc15', unsafe: '#ff0055' };
      const mainColor = colorMap[kneeStatus];

      // Draw background video dimmed
      ctx.globalAlpha = 0.6;
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;

      // Glow effect for skeleton
      ctx.shadowBlur = 20;
      ctx.shadowColor = mainColor;
      // @ts-ignore
      window.drawConnectors(ctx, landmarks, window.POSE_CONNECTIONS, { color: mainColor, lineWidth: 4 });
      // @ts-ignore
      window.drawLandmarks(ctx, landmarks, { color: '#ffffff', radius: 3 });

      // HUD Label on Joint
      const kneePos = landmarks[MAJOR_JOINTS.knee_l];
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px Inter";
      ctx.fillText(`${Math.round(kneeAngle)}°`, kneePos.x * canvas.width + 10, kneePos.y * canvas.height);
    }

    // 3. Rep Intelligence State Machine
    if (isSafe) {
      if (kneeAngle < 110 && stateRef.current !== 'down') {
        stateRef.current = 'down';
        repStartTimeRef.current = Date.now();
      } else if (kneeAngle > 160 && stateRef.current === 'down') {
        stateRef.current = 'up';
        countRef.current += 1;
        
        const repTime = Date.now() - repStartTimeRef.current;
        if (repTime < 1000) lastRepQualityRef.current = 'rushed';
        else lastRepQualityRef.current = 'clean';
      }
    } else {
      if (stateRef.current === 'down') {
         lastRepQualityRef.current = 'unsafe';
         stateRef.current = 'neutral' as any;
      }
    }

    onAnalysis({
      formQuality: Math.max(0, 100 - diff),
      jointStatuses,
      repCount: countRef.current,
      lastRepQuality: lastRepQualityRef.current,
      state: stateRef.current,
      isSafe
    });

    ctx.restore();
  }, [onAnalysis]);

  useEffect(() => {
    // @ts-ignore
    const pose = new window.Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    pose.onResults(onResults);
    
    if (videoRef.current) {
      // @ts-ignore
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => { if (videoRef.current) await pose.send({ image: videoRef.current }); },
        width: 1280, height: 720
      });
      camera.start();
      setIsLoaded(true);
    }
  }, [onResults]);

  return (
    <div className="relative w-full h-full bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-10" width={1280} height={720} />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center">
           <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-cyan-400 font-mono tracking-widest text-xs uppercase animate-pulse">Initializing Vision Link...</p>
        </div>
      )}

      {/* Real-time Angle Overlay */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-4">
         <div className="glass p-4 rounded-2xl flex flex-col">
           <span className="text-[10px] text-slate-500 font-black uppercase">KNEE ANGLE</span>
           <span className="text-2xl font-black text-cyan-400">
             {Math.round(Object.values(MAJOR_JOINTS).length > 0 ? 0 : 0)}
           </span>
         </div>
      </div>
    </div>
  );
};

export default PoseCanvas;
