import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  MessageSquare, 
  HelpCircle, 
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedLesson, LessonResourceNew } from '../../../types';
import { cn } from '../../../lib/utils';

interface TeachNowAssistantProps {
  lesson: SavedLesson;
  resources: LessonResourceNew[];
  onClose: () => void;
}

export const TeachNowAssistant: React.FC<TeachNowAssistantProps> = ({
  lesson,
  resources,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scriptResource = resources.find(r => r.resource_type === 'teacher_script');
  const scriptContent = scriptResource?.content || {};

  const steps = [
    { title: 'Introduction', duration: 10, prompt: 'Hook the students with a question about the eye.' },
    { title: 'Explanation', duration: 15, prompt: 'Use the visual aid to explain the parts of the eye.' },
    { title: 'Demonstration', duration: 10, prompt: 'Show how light enters the eye using the flashlight.' },
    { title: 'Guided Practice', duration: 15, prompt: 'Help students label their own diagrams.' },
    { title: 'Closure', duration: 10, prompt: 'Quick exit ticket: Name one part of the eye.' },
  ];

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-24 right-6 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 fill-current" />
          <span className="font-bold text-sm uppercase tracking-wider">Teach Now</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Timer */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Timer className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Lesson Timer</span>
            </div>
            <span className="text-2xl font-mono font-bold text-gray-900">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                isActive ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              )}
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={() => { setTimeLeft(3600); setIsActive(false); }}
              className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Step</span>
            <span className="text-[10px] font-bold text-indigo-600">{currentStep + 1} / {steps.length}</span>
          </div>
          
          <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h4 className="font-bold text-gray-900 mb-1">{steps[currentStep].title}</h4>
            <p className="text-xs text-gray-500 mb-4">{steps[currentStep].duration} minutes</p>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3 h-3 text-indigo-600" />
                </div>
                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{steps[currentStep].prompt}"
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Ask: "What do you think happens when light hits the lens?"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button 
            onClick={() => currentStep < steps.length - 1 ? setCurrentStep(prev => prev + 1) : onClose()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
