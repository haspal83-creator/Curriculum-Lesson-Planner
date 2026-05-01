import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  Target,
  Layers,
  Activity,
  Zap,
  Sparkles,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Card, Button } from '../ui';
import { 
  YearlyCurriculumMap, 
  CyclePlan, 
  CoverageRecord, 
  AcademicCalendar,
  GradeLevel,
  Subject,
  PacingStatus
} from '../../types';

interface PacingDashboardProps {
  calendar: AcademicCalendar | null;
  map: YearlyCurriculumMap | undefined;
  cyclePlan: CyclePlan | undefined;
  coverage: CoverageRecord[];
  grade: GradeLevel;
  subject: Subject;
  cycle: number;
}

export const PacingDashboard: React.FC<PacingDashboardProps> = ({
  calendar,
  map,
  cyclePlan,
  coverage,
  grade,
  subject,
  cycle
}) => {
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '0 weeks';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    
    if (weeks === 0) return `${diffDays} days`;
    if (remainingDays === 0) return `${weeks} weeks`;
    return `${weeks} weeks, ${remainingDays} days`;
  };

  // Mock metrics for now - in real app these would be calculated
  const metrics = {
    totalOutcomes: coverage.length,
    coveredOutcomes: coverage.filter(c => c.status !== 'Not Covered').length,
    plannedWeeks: cyclePlan?.weeks.length || 0,
    currentWeek: 4,
    status: 'On Track' as PacingStatus,
    lessonsMissed: 2,
    adjustmentSuggestions: [
      "Merge 'Healthy Eating' with 'Food Groups' next week",
      "Delay 'Personal Hygiene' assessment by one day",
      "Move Friday's review to Monday morning"
    ]
  };

  const currentCycleData = calendar?.cycles?.find(c => c.number === cycle);
  const cycleDuration = currentCycleData ? calculateDuration(currentCycleData.startDate, currentCycleData.endDate) : '0 weeks';

  const coveragePercent = metrics.totalOutcomes > 0 
    ? Math.round((metrics.coveredOutcomes / metrics.totalOutcomes) * 100) 
    : 0;

  const cycleProgress = metrics.plannedWeeks > 0 
    ? Math.round((metrics.currentWeek / metrics.plannedWeeks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Cycle Info Banner */}
      {currentCycleData && (
        <div className="flex items-center justify-between p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{currentCycleData.label || `Cycle ${cycle}`}</h2>
              <p className="text-xs text-indigo-100 font-medium">
                {currentCycleData.startDate} to {currentCycleData.endDate} • {cycleDuration}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 pr-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Current Progress</p>
              <p className="text-xl font-black">{cycleProgress}%</p>
            </div>
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${cycleProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pacing Status</p>
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-black text-slate-900">{metrics.status}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curriculum Covered</p>
              <p className="text-xl font-black text-slate-900">{coveragePercent}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cycle Progress</p>
              <p className="text-xl font-black text-slate-900">{cycleProgress}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lessons Missed</p>
              <p className="text-xl font-black text-slate-900">{metrics.lessonsMissed}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pacing Chart Area */}
        <Card className="p-6 bg-white border-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Cycle {cycle} Pacing Timeline</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                Planned
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                Actual
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end gap-2 px-2">
            {Array.from({ length: metrics.plannedWeeks }).map((_, i) => {
              const weekNum = i + 1;
              const isPast = weekNum < metrics.currentWeek;
              const isCurrent = weekNum === metrics.currentWeek;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Planned Bar */}
                  <div className="w-full bg-slate-100 rounded-t-lg h-32 relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-indigo-600/20"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                    {isPast && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500/40"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-indigo-600/10 animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold",
                    isCurrent ? "text-indigo-600" : "text-slate-400"
                  )}>W{weekNum}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-32 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl">
                    <p className="font-bold mb-1">Week {weekNum}</p>
                    <p className="text-slate-300">Coverage: {Math.round(Math.random() * 100)}%</p>
                    <p className="text-slate-300">Status: {isPast ? 'Completed' : 'Planned'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Next Milestone</h4>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="p-2 bg-white rounded-lg border border-indigo-200">
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Cycle Assessment</p>
                  <p className="text-xs font-bold text-slate-700">In 4 Weeks</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Teaching Load</h4>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="p-2 bg-white rounded-lg border border-emerald-200">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Balanced</p>
                  <p className="text-xs font-bold text-slate-700">Normal Intensity</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Upcoming Break</h4>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="p-2 bg-white rounded-lg border border-amber-200">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Mid-Cycle Break</p>
                  <p className="text-xs font-bold text-slate-700">Starts May 12</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart Adjustment Suggestions */}
        <Card className="p-6 bg-slate-900 text-white md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold">Auto-Pacing Assistant</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Based on your current progress and the 2 missed lessons, I suggest these adjustments to stay on track for the Cycle {cycle} assessment:
            </p>

            <div className="space-y-3">
              {metrics.adjustmentSuggestions.map((suggestion, i) => (
                <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xs text-slate-200 group-hover:text-white transition-colors">{suggestion}</p>
                </div>
              ))}
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
              Apply All Adjustments
            </Button>

            <div className="pt-6 mt-6 border-t border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-400 uppercase">Curriculum Gap Alert</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                "Reproduction in Plants" has 4 learning outcomes but only 1 week allocated. Consider adding a revision day.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
