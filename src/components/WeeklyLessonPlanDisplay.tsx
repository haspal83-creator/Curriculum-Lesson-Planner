import React, { useState } from 'react';
import { WeeklyLessonPlan, LessonPlan } from '../types';
import { LessonPlanDisplay } from './LessonPlanDisplay';
import { Card, Tabs, TabsList, TabsTrigger, TabsContent, Button } from './ui';
import { Calendar, ChevronRight, ChevronLeft, Download, CheckCircle2, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { exportWeeklyLessonPlanToWord } from '../lib/exportUtils';

interface WeeklyLessonPlanDisplayProps {
  plan: WeeklyLessonPlan;
  onUpdateDayPlan?: (dayIndex: number, updatedPlan: LessonPlan) => void;
  onGenerateResource?: (plan: LessonPlan, type: string) => Promise<void>;
  onSave?: (plan: WeeklyLessonPlan) => Promise<void>;
}

export function WeeklyLessonPlanDisplay({ 
  plan, 
  onUpdateDayPlan, 
  onGenerateResource,
  onSave 
}: WeeklyLessonPlanDisplayProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleNext = () => {
    setActiveDayIndex((prev) => (prev < 4 ? prev + 1 : prev));
  };

  const handlePrev = () => {
    setActiveDayIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleCopyMonday = () => {
    if (!onUpdateDayPlan) return;
    const mondayPlan = plan.week.days[0].lesson;
    // Copy Monday to Tues-Fri
    for (let i = 1; i < 5; i++) {
        onUpdateDayPlan(i, { ...mondayPlan });
    }
  };

  const activeDay = plan.week.days[activeDayIndex];

  return (
    <div className="space-y-6">
      {/* Weekly Header Summary */}
      <Card className="p-6 bg-white border-gray-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Calendar className="w-32 h-32" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Weekly Planning Mode</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{plan.week.topic}</h2>
              <p className="text-gray-500 font-medium">{plan.week.grade} • {plan.week.subject}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportWeeklyLessonPlanToWord(plan, auth.currentUser?.displayName || undefined)}
                className="h-9 px-4 rounded-full font-bold text-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Week (MS Word)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyMonday}
                className="h-9 px-4 rounded-full font-bold text-gray-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Monday to Week
              </Button>
              {onSave && (
                <Button onClick={() => onSave(plan)} size="sm" className="h-9 px-4 rounded-full font-bold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Weekly Plan
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-4">
            {plan.week.days.map((d, idx) => (
              <button
                key={d.day}
                onClick={() => setActiveDayIndex(idx)}
                className={cn(
                  "p-3 rounded-2xl border transition-all text-left group",
                  activeDayIndex === idx 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 translate-y-[-2px]" 
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-indigo-200 hover:shadow-md"
                )}
              >
                <span className={cn(
                  "block text-[10px] font-black uppercase tracking-widest mb-1",
                  activeDayIndex === idx ? "text-indigo-100" : "text-gray-400 group-hover:text-indigo-400"
                )}>
                  {d.day}
                </span>
                <span className="block text-xs font-bold truncate">
                  {d.lesson.lessonTitle || d.day}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="relative">
        <div className="flex justify-between items-center mb-4 px-2">
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={activeDayIndex === 0} 
            onClick={handlePrev}
            className="text-gray-500 hover:text-indigo-600 font-bold"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous Day
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Day {activeDayIndex + 1} of 5
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={activeDayIndex === 4} 
            onClick={handleNext}
            className="text-gray-500 hover:text-indigo-600 font-bold"
          >
            Next Day
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDayIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeDay && (
              <LessonPlanDisplay
                plan={activeDay.lesson}
                onUpdatePlan={async (updated) => {
                  if (onUpdateDayPlan) {
                    onUpdateDayPlan(activeDayIndex, updated);
                  }
                }}
                onGenerateResource={onGenerateResource}
                // We wrap it in a container so it doesn't look like a full-page stand-alone if needed
                // But the user said "render using the same lesson UI already built"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
