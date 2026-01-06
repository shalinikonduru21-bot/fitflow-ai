
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, UserProfile, WorkoutPlan, NavigationState, PartialWorkout } from './types';
import { Header, BottomNav } from './components/Navigation';
import Onboarding from './components/Onboarding';
import Questionnaire from './components/Questionnaire';
import WorkoutView from './components/WorkoutView';
import SocialDashboard from './components/SocialDashboard';
import SummaryView from './components/SummaryView';
import Integrations from './components/Integrations';
import CommunityView from './components/CommunityView';
import AnalyticsView from './components/AnalyticsView';
import StoreView from './components/StoreView';
import ProfileView from './components/ProfileView';
import FlowBot from './components/FlowBot';
import ConfirmModal from './components/ConfirmModal';
import TrainHub from './components/TrainHub';
import { generateWorkoutPlan } from './services/geminiService';
import { storage } from './services/storageService';
import { Sparkles, Brain, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [nav, setNav] = useState<NavigationState>({
    current: AppState.ONBOARDING,
    stack: [],
    breadcrumb: ['Intro']
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [resumeData, setResumeData] = useState<PartialWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing');
  const [isReady, setIsReady] = useState(false);
  const [exitConfirmState, setExitConfirmState] = useState<{ isOpen: boolean; target: AppState | null }>({ isOpen: false, target: null });

  useEffect(() => {
    const init = async () => {
      storage.updateStreak();
      const data = storage.get();
      if (data.profile) setProfile(data.profile);
      if (data.workoutPlan) setWorkoutPlan(data.workoutPlan);
      if (data.partialWorkout) setResumeData(data.partialWorkout);
      
      // Handle the initial onboarding skip if profile exists
      if (data.profile && nav.current === AppState.ONBOARDING) {
        setNav(prev => ({ ...prev, current: AppState.DASHBOARD }));
      }

      setIsReady(true);
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
      }
    };
    init();
  }, []);

  // Safety logic: Prevent stuck "Black Screen" if state is inconsistent
  useEffect(() => {
    if (isReady && !isLoading && nav.current === AppState.WORKOUT_EXECUTION && !workoutPlan) {
      setStep(AppState.DASHBOARD, true);
    }
  }, [isReady, isLoading, nav.current, workoutPlan]);

  const getBreadcrumb = (state: AppState): string[] => {
    switch(state) {
      case AppState.DASHBOARD: return ['Home'];
      case AppState.TRAIN_HUB: return ['Home', 'Train'];
      case AppState.QUESTIONNAIRE: return ['Home', 'Profile Setup'];
      case AppState.WORKOUT_EXECUTION: return ['Home', 'Active Session'];
      case AppState.ANALYTICS: return ['Home', 'Insights'];
      case AppState.SOCIAL: return ['Home', 'Circle'];
      case AppState.STORE: return ['Home', 'Marketplace'];
      case AppState.PROFILE: return ['Home', 'Settings'];
      case AppState.INTEGRATIONS: return ['Home', 'Health Data'];
      case AppState.POST_WORKOUT: return ['Home', 'Summary'];
      default: return ['FitFlow AI'];
    }
  };

  const setStep = useCallback((target: AppState, skipHistory: boolean = false) => {
    if (nav.current === AppState.WORKOUT_EXECUTION && target !== AppState.POST_WORKOUT) {
      setExitConfirmState({ isOpen: true, target });
      return;
    }

    setNav(prev => {
      const nextStack = skipHistory ? prev.stack : [...prev.stack, prev.current];
      return {
        current: target,
        stack: nextStack,
        breadcrumb: getBreadcrumb(target)
      };
    });
  }, [nav.current]);

  const goBack = useCallback(() => {
    setNav(prev => {
      if (prev.stack.length === 0) return prev;
      const prevStep = prev.stack[prev.stack.length - 1];
      return {
        current: prevStep,
        stack: prev.stack.slice(0, -1),
        breadcrumb: getBreadcrumb(prevStep)
      };
    });
  }, []);

  const handleOnboardingComplete = () => {
    const data = storage.get();
    if (data.profile) setStep(AppState.DASHBOARD, true);
    else setStep(AppState.QUESTIONNAIRE, true);
  };

  const startSession = (plan: WorkoutPlan, resumeFrom?: PartialWorkout) => {
    setWorkoutPlan(plan);
    setResumeData(resumeFrom || null);
    storage.save({ workoutPlan: plan });
    setStep(AppState.WORKOUT_EXECUTION);
  };

  const handleQuestionnaireSubmit = async (userProfile: UserProfile) => {
    setIsLoading(true);
    setLoadingText('Calibrating Neural Pathways...');
    
    // Save locally immediately to prevent data loss
    const data = storage.get();
    const fullProfile = { ...userProfile, wearableMetrics: data.wearableData };
    setProfile(fullProfile);
    storage.save({ profile: fullProfile });
    
    // Safety Timeout to prevent infinite spinner
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setStep(AppState.DASHBOARD, true);
    }, 12000);

    try {
      const plan = await generateWorkoutPlan(fullProfile);
      setWorkoutPlan(plan);
      storage.save({ workoutPlan: plan });
      clearTimeout(safetyTimer);
      setIsLoading(false);
      setStep(AppState.DASHBOARD, true);
    } catch (error) {
      console.error("AI Error:", error);
      clearTimeout(safetyTimer);
      setIsLoading(false);
      setStep(AppState.DASHBOARD, true);
    }
  };

  const renderContent = () => {
    switch (nav.current) {
      case AppState.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case AppState.QUESTIONNAIRE:
        return <Questionnaire onSubmit={handleQuestionnaireSubmit} />;
      case AppState.DASHBOARD:
        return <SocialDashboard setStep={setStep} />;
      case AppState.TRAIN_HUB:
        return <TrainHub onStartSession={startSession} profile={profile!} setStep={setStep} />;
      case AppState.INTEGRATIONS:
        return <Integrations />;
      case AppState.ANALYTICS:
        return <AnalyticsView />;
      case AppState.SOCIAL:
        return <CommunityView setStep={setStep} />;
      case AppState.STORE:
        return <StoreView />;
      case AppState.PROFILE:
        return <ProfileView />;
      case AppState.WORKOUT_EXECUTION:
        if (!workoutPlan || !profile) return null;
        return (
          <WorkoutView 
            plan={workoutPlan} 
            profile={profile} 
            resumeData={resumeData}
            onComplete={() => { storage.save({ partialWorkout: undefined }); setStep(AppState.POST_WORKOUT); }} 
            onExit={() => setStep(AppState.DASHBOARD, true)}
          />
        );
      case AppState.POST_WORKOUT:
        return <SummaryView onHome={() => setStep(AppState.DASHBOARD, true)} />;
      default:
        return <div className="flex-1 bg-black" />;
    }
  };

  if (!isReady) return null;

  const showNavShell = ![AppState.ONBOARDING, AppState.QUESTIONNAIRE, AppState.WORKOUT_EXECUTION].includes(nav.current);

  return (
    <div className="h-full bg-black text-slate-100 flex flex-col font-sans selection:bg-cyan-500 overflow-hidden relative">
      {isLoading && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="relative mb-12">
             <div className="w-24 h-24 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(0,255,255,0.2)]" />
             <Brain className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">{loadingText}</h2>
          <p className="text-slate-500 text-sm font-medium italic">"Synthesizing biological trajectory..."</p>
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mt-8">
             <div className="h-full bg-gradient-to-r from-cyan-400 to-magenta-500 animate-[ticker_3s_linear_infinite]" style={{ width: '40%' }} />
          </div>
        </div>
      )}

      {showNavShell && (
        <Header 
          currentStep={nav.current} 
          setStep={setStep} 
          goBack={goBack} 
          breadcrumb={nav.breadcrumb} 
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative h-full">
        {renderContent()}
      </main>

      {showNavShell && <BottomNav currentStep={nav.current} setStep={setStep} />}
      <FlowBot currentStep={nav.current} />

      <ConfirmModal 
        isOpen={exitConfirmState.isOpen}
        title="Leave Active Session?"
        message="Progress state is cached, but biometric focus will reset."
        confirmText="Exit Session"
        cancelText="Resume"
        onConfirm={() => {
          const target = exitConfirmState.target || AppState.DASHBOARD;
          setExitConfirmState({ isOpen: false, target: null });
          setNav(prev => ({
            current: target,
            stack: [...prev.stack, prev.current],
            breadcrumb: getBreadcrumb(target)
          }));
        }}
        onCancel={() => setExitConfirmState({ isOpen: false, target: null })}
      />
    </div>
  );
};

export default App;
