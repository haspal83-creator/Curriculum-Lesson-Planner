import React from 'react';
import { 
  Plus, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays,
  Target,
  Layers,
  BookOpen,
  FileText,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { Card, Button } from '../ui';
import { WeeklyTeachingPlan, CyclePlan } from '../../types';
import { cn } from '../../lib/utils';

interface WeeklyPlanViewProps {
  plans: WeeklyTeachingPlan[];
  cyclePlan: CyclePlan | undefined;
  onGenerate: (week: number) => void;
  isGenerating?: boolean;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ plans, cyclePlan, onGenerate, isGenerating }) => {
  if (!cyclePlan) {
    return (
      <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-indigo-50 rounded-full">
          <Calendar className="w-12 h-12 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">No Cycle Plan Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Generate a Cycle Plan first to break it down into weekly teaching roadmaps.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Week Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(cyclePlan.weeks || []).map((week, idx) => {
          const plan = (plans || []).find(p => p.weekNumber === week.weekNumber);
          return (
            <button
              key={`week-btn-${week.weekNumber}-${idx}`}
              onClick={() => !plan && !isGenerating && onGenerate(week.weekNumber)}
              disabled={isGenerating}
              className={cn(
                "p-3 rounded-xl border text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed",
                plan 
                  ? "bg-white border-indigo-200 shadow-sm hover:shadow-md" 
                  : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Week {week.weekNumber}</span>
                {plan ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700 truncate">{week.topic}</p>
              <p className="text-[9px] text-slate-400 mt-1">{week.dates}</p>
            </button>
          );
        })}
      </div>

      {/* Detailed Weekly Plans Roadmap */}
      <div className="space-y-10">
        {(cyclePlan.weeks || []).map((week, idx) => {
          const plan = (plans || []).find(p => p.weekNumber === week.weekNumber);
          
          return (
            <div key={`week-detail-${week.weekNumber}-${idx}`} className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
                  {week.weekNumber}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Week {week.weekNumber}: {week.topic}</h3>
                  <p className="text-xs text-slate-500 font-medium">{week.dates}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  {!plan ? (
                    <Button 
                      size="sm" 
                      onClick={() => onGenerate(week.weekNumber)}
                      disabled={isGenerating}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate Detailed Week'}
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      DETAILED PLAN READY
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {plan ? (
                  // Show Detailed Plan Days
                  (plan.days || []).map((day, i) => (
                    <div 
                      key={`day-${day.day}-${i}`} 
                      className={cn(
                        "flex flex-col rounded-2xl border transition-all p-5 shadow-sm",
                        day.isTeachingDay 
                          ? "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md" 
                          : "bg-slate-50 border-slate-100 opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{day.day}</span>
                        <span className="text-[10px] font-bold text-slate-400">{day.date}</span>
                      </div>

                      {!day.isTeachingDay ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 py-6">
                          <div className="p-2.5 bg-slate-100 rounded-full">
                            <CalendarDays className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{day.reason || 'No School'}</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col">
                          <div className="mb-4">
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Focus</h4>
                            <p className="text-xs font-bold text-slate-800 leading-snug">{day.lessonSnapshot?.focus || day.topic}</p>
                          </div>
                          
                          {day.lessonSnapshot && (
                            <div className="mb-4 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                              <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Snapshot</h4>
                              <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3">{day.lessonSnapshot.about}</p>
                            </div>
                          )}

                          <div className="mb-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Outcome</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed italic">"{day.outcome}"</p>
                          </div>

                          {day.learningObjectivesBoard && (
                            <div className="mb-4 space-y-2">
                              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Success Criteria</h4>
                              <ul className="space-y-1">
                                {(day.learningObjectivesBoard.successCriteria || []).slice(0, 2).map((criteria, idx) => (
                                  <li key={idx} className="text-[9px] text-slate-500 flex items-start gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="line-clamp-1">{criteria}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-slate-50">
                            {day.lessonId ? (
                              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-9 rounded-xl">
                                <BookOpen className="w-3.5 h-3.5 mr-2" />
                                View Lesson
                              </Button>
                            ) : (
                              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] h-9 rounded-xl shadow-md shadow-indigo-100">
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                                Generate Lesson
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Show Cycle Plan Lesson Focus Fallback
                  (week.lessonFocus || []).map((focus, i) => (
                    <div 
                      key={`focus-${i}`} 
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm opacity-80 hover:opacity-100 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i]}</span>
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Planned Focus</h4>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{focus}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Clock className="w-3 h-3" />
                          Detail Pending
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
