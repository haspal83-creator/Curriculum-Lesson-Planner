import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Layers, 
  Zap, 
  BookOpen 
} from 'lucide-react';
import { Button, Card, Input, Select } from '../ui';
import { LessonPlan, WeeklyCurriculumPlan, DailyLessonPlan, LanguageArtsWeeklyPlan } from '../../types';
import { cn } from '../../lib/utils';

interface SavedPlansViewProps {
  plans: LessonPlan[];
  weeklyPlans: WeeklyCurriculumPlan[];
  laWeeklyPlans: LanguageArtsWeeklyPlan[];
  dailyLessonPlans: DailyLessonPlan[];
  resources: any[];
  onDelete: (id: string) => Promise<void>;
  onOpen: (plan: LessonPlan) => void;
  onViewLesson: (lessonId: string) => void;
  onDeleteWeekly: (id: string) => Promise<void>;
  onOpenWeekly: (plan: WeeklyCurriculumPlan) => void;
  onDeleteLAWeekly: (id: string) => Promise<void>;
  onOpenLAWeekly: (plan: LanguageArtsWeeklyPlan) => void;
  onDeleteDaily: (id: string) => Promise<void>;
  onOpenDaily: (plan: DailyLessonPlan) => void;
  onDeleteResource: (id: string) => Promise<void>;
  onOpenResource: (res: any) => void;
}

export function SavedPlansView({ 
  plans, 
  weeklyPlans, 
  laWeeklyPlans,
  dailyLessonPlans, 
  resources, 
  onDelete, 
  onOpen,
  onViewLesson,
  onDeleteWeekly,
  onOpenWeekly,
  onDeleteLAWeekly,
  onOpenLAWeekly,
  onDeleteDaily,
  onOpenDaily,
  onDeleteResource,
  onOpenResource
}: SavedPlansViewProps) {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'resource'>('all');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Saved Plans & Resources</h2>
          <p className="text-sm text-gray-500">Access and manage all your generated educational content.</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'daily' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('daily')}>Daily</Button>
          <Button variant={filter === 'weekly' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('weekly')}>Weekly</Button>
          <Button variant={filter === 'resource' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('resource')}>Resources</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search plans..." className="pl-10" />
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <Card className="divide-y divide-gray-50">
            {(filter === 'all' || filter === 'daily') && [...(plans || []), ...(dailyLessonPlans || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((plan) => (
              <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => 'lessonTitle' in plan ? onOpen(plan as LessonPlan) : onOpenDaily(plan as DailyLessonPlan)}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">{(plan as any).grade}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">{(plan as any).subject}</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase tracking-widest">Daily</span>
                        {(plan as any).isReadyToTeach && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-2 h-2" />
                            Ready to Teach
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{'lessonTitle' in plan ? plan.lessonTitle : (plan as DailyLessonPlan).lesson_title}</h3>
                      <p className="text-sm text-gray-500">{(plan as any).topic} • {new Date(plan.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLesson(plan.id!);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Teach
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={(e) => {
                      e.stopPropagation();
                      'lessonTitle' in plan ? onDelete(plan.id!) : onDeleteDaily(plan.id!);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-300 mt-2" />
                  </div>
                </div>
              </div>
            ))}

            {(filter === 'all' || filter === 'weekly') && [...(weeklyPlans || []), ...(laWeeklyPlans || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((plan) => (
              <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => 'days' in plan ? onOpenLAWeekly(plan as LanguageArtsWeeklyPlan) : onOpenWeekly(plan as WeeklyCurriculumPlan)}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", 'days' in plan ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">{'days' in plan ? (plan as LanguageArtsWeeklyPlan).grade : (plan as WeeklyCurriculumPlan).grade_level}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">{plan.subject}</span>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest", 'days' in plan ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                          {'days' in plan ? "LA Weekly Scope" : "Weekly"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{'days' in plan ? (plan as LanguageArtsWeeklyPlan).theme : (plan as WeeklyCurriculumPlan).weekly_topic}</h3>
                      <p className="text-sm text-gray-500">
                        Cycle {'days' in plan ? (plan as LanguageArtsWeeklyPlan).cycle : (plan as WeeklyCurriculumPlan).cycle} • 
                        Week {'days' in plan ? (plan as LanguageArtsWeeklyPlan).week : (plan as WeeklyCurriculumPlan).week_number} • 
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={(e) => {
                      e.stopPropagation();
                      'days' in plan ? onDeleteLAWeekly(plan.id!) : onDeleteWeekly(plan.id!);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-300 mt-2" />
                  </div>
                </div>
              </div>
            ))}

            {(filter === 'all' || filter === 'resource') && (resources || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((res) => (
              <div key={res.id} className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => onOpenResource(res)}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase tracking-widest">Resource</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-black uppercase tracking-widest">{res.type}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{res.type} for Lesson</h3>
                      <p className="text-sm text-gray-500">{new Date(res.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={(e) => {
                      e.stopPropagation();
                      onDeleteResource(res.id!);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-300 mt-2" />
                  </div>
                </div>
              </div>
            ))}

            {(plans || []).length === 0 && (weeklyPlans || []).length === 0 && (laWeeklyPlans || []).length === 0 && (dailyLessonPlans || []).length === 0 && (resources || []).length === 0 && (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <h3 className="text-lg font-bold">No Saved Plans</h3>
                  <p className="text-gray-500 text-sm">Your generated lesson plans and resources will appear here.</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-indigo-900 text-white space-y-4">
            <h3 className="text-lg font-bold">Organization Tips</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-indigo-300 shrink-0" />
                <p className="text-sm text-indigo-100">Use the filters to quickly switch between daily plans, weekly overviews, and teaching resources.</p>
              </div>
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-indigo-300 shrink-0" />
                <p className="text-sm text-indigo-100">Saved plans can be printed or exported as PDF for your teaching portfolio.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
