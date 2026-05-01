import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Target, 
  StickyNote, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Card, Button } from '../ui';
import { StatCard, QuickAction } from '../DashboardComponents';
import { 
  GradeLevel, 
  CurriculumEntry, 
  WeeklyCurriculumPlan, 
  LessonPlan, 
  OutcomeMastery,
  YearlyCalendarPlan
} from '../../types';

interface ClassDashboardProps {
  activeClass: GradeLevel;
  curriculum: CurriculumEntry[];
  weeklyPlans: WeeklyCurriculumPlan[];
  lessonPlans: LessonPlan[];
  outcomeMastery: OutcomeMastery[];
  yearlyCalendars: YearlyCalendarPlan[];
  onAction: (tab: string) => void;
  onViewLesson: (lessonId: string) => void;
}

export const ClassDashboard: React.FC<ClassDashboardProps> = ({
  activeClass,
  curriculum,
  weeklyPlans,
  lessonPlans,
  outcomeMastery,
  yearlyCalendars,
  onAction,
  onViewLesson
}) => {
  const stats = useMemo(() => {
    const classCurriculum = (curriculum || []).filter(c => c.grade === activeClass);
    const classLessons = (lessonPlans || []).filter(p => p.grade === activeClass);
    const classMastery = (outcomeMastery || []).filter(m => m.grade === activeClass);
    const classCalendar = (yearlyCalendars || []).find(c => c.grade === activeClass);

    let progress = 0;
    if (classCalendar) {
      const teachingDays = (classCalendar.days || []).filter(d => d.isTeachingDay);
      const completed = teachingDays.filter(d => d.status === 'Completed' || d.status === 'Taught').length;
      progress = teachingDays.length > 0 ? Math.round((completed / teachingDays.length) * 100) : 0;
    }

    const weakOutcomes = classMastery.filter(m => m.status === 'Needs reteach').length;

    const getTime = (val: any) => {
      if (!val) return 0;
      if (typeof val === 'string') return new Date(val).getTime();
      if (val.toDate) return val.toDate().getTime();
      if (val instanceof Date) return val.getTime();
      if (typeof val === 'number') return val;
      return 0;
    };

    return {
      curriculumCount: classCurriculum.length,
      lessonCount: classLessons.length,
      progress,
      weakOutcomes,
      recentPlans: [...classLessons].sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt)).slice(0, 3)
    };
  }, [activeClass, curriculum, lessonPlans, outcomeMastery, yearlyCalendars]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {activeClass} Dashboard
          </h2>
          <p className="text-gray-500 mt-1">Overview of your current teaching session and class progress.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onAction('planner')}>
            <Plus className="w-4 h-4" />
            New Lesson
          </Button>
          <Button onClick={() => onAction('mapping')}>
            <Target className="w-4 h-4" />
            Mapping Engine
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<BookOpen className="text-indigo-600" />} 
          label="Curriculum Items" 
          value={stats.curriculumCount} 
          color="bg-indigo-50" 
        />
        <StatCard 
          icon={<Target className="text-emerald-600" />} 
          label="Teaching Progress" 
          value={`${stats.progress}%`} 
          color="bg-emerald-50" 
        />
        <StatCard 
          icon={<TrendingUp className="text-amber-600" />} 
          label="Saved Lessons" 
          value={stats.lessonCount} 
          color="bg-amber-50" 
        />
        <StatCard 
          icon={<AlertCircle className="text-rose-600" />} 
          label="Needs Reteach" 
          value={stats.weakOutcomes} 
          color="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recent Lesson Plans
              </h3>
              <Button variant="ghost" size="sm" onClick={() => onAction('saved')} className="text-indigo-600">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {stats.recentPlans.length > 0 ? (
                stats.recentPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    onClick={() => onViewLesson(plan.id!)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <StickyNote className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{plan.lessonTitle}</p>
                        <p className="text-xs text-gray-500">{plan.subject} • {plan.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        plan.status === 'Ready to Teach' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                      )}>
                        {plan.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                  <StickyNote className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No lesson plans generated yet for this class.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => onAction('planner')}>
                    Create First Plan
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <QuickAction 
              icon={<Plus />} 
              title="Quick Lesson" 
              desc="Generate a plan in seconds" 
              onClick={() => onAction('planner')} 
              color="bg-indigo-600" 
            />
            <QuickAction 
              icon={<Calendar />} 
              title="Weekly Map" 
              desc="Plan your upcoming week" 
              onClick={() => onAction('mapping')} 
              color="bg-emerald-600" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-indigo-900 text-white border-none shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Class Mastery</h3>
              <p className="text-indigo-200 text-sm mb-6">
                {stats.weakOutcomes > 0 
                  ? `You have ${stats.weakOutcomes} learning outcomes that need attention.`
                  : "All assessed outcomes are currently on track!"}
              </p>
              <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 border-none font-bold" onClick={() => onAction('tracker')}>
                Review Mastery
              </Button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Class Checklist
            </h3>
            <div className="space-y-3">
              <CheckItem label="Upload Curriculum Guide" completed={stats.curriculumCount > 0} />
              <CheckItem label="Generate Yearly Map" completed={(yearlyCalendars || []).some(c => c.grade === activeClass)} />
              <CheckItem label="Set Up Weekly Plan" completed={(weeklyPlans || []).length > 0} />
              <CheckItem label="Assess First Lesson" completed={(outcomeMastery || []).some(m => m.grade === activeClass)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

function CheckItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
        completed ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-300"
      )}>
        <CheckCircle2 className="w-3 h-3" />
      </div>
      <span className={cn("text-sm", completed ? "text-gray-900 font-medium" : "text-gray-400")}>
        {label}
      </span>
    </div>
  );
}

import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';
