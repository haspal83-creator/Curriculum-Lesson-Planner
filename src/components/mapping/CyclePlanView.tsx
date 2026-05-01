import React from 'react';
import { 
  Plus, 
  ListChecks, 
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
  Activity
} from 'lucide-react';
import { Card, Button } from '../ui';
import { CyclePlan, YearlyCurriculumMap } from '../../types';

interface CyclePlanViewProps {
  plan: CyclePlan | undefined;
  map: YearlyCurriculumMap | undefined;
  cycleNumber: number;
  onGenerate: () => void;
  onViewWeeklyPlan?: (week: number) => void;
  isGenerating?: boolean;
}

export const CyclePlanView: React.FC<CyclePlanViewProps> = ({ plan, map, cycleNumber, onGenerate, onViewWeeklyPlan, isGenerating }) => {
  if (!plan) {
    return (
      <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-indigo-50 rounded-full">
          <ListChecks className="w-12 h-12 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">No Cycle {cycleNumber} Plan Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Break down Cycle {cycleNumber} into a detailed week-by-week teaching roadmap.
          </p>
        </div>
        <Button 
          onClick={onGenerate} 
          disabled={!map || isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating...' : `Generate Cycle ${cycleNumber} Plan`}
        </Button>
        {!map && <p className="text-xs text-amber-600 font-medium">Generate a Yearly Map first</p>}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle Summary Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
            C{cycleNumber}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cycle {cycleNumber} Roadmap</h3>
            <p className="text-sm text-slate-500">{(plan.weeks || []).length} Weeks of Instruction</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Regenerate Plan'}
          </Button>
        </div>
      </div>

      {/* Week by Week Roadmap */}
      <div className="space-y-4">
        {(plan.weeks || []).map((week) => (
          <Card key={week.weekNumber} className="overflow-hidden border-slate-200 group hover:border-indigo-200 transition-all">
            <div className="flex flex-col md:flex-row">
              {/* Week Indicator */}
              <div className={cn(
                "w-full md:w-48 p-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100",
                week.status === 'Ready' ? "bg-emerald-50" : "bg-slate-50"
              )}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Week</span>
                <span className="text-3xl font-black text-slate-800">{week.weekNumber}</span>
                <span className="text-[10px] font-medium text-slate-500 mt-1">{week.dates}</span>
                <div className="mt-3">
                  {week.status === 'Ready' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 px-2 py-0.5 bg-emerald-100 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      READY
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 px-2 py-0.5 bg-amber-100 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      INCOMPLETE
                    </span>
                  )}
                </div>
              </div>

              {/* Week Content */}
              <div className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Topic & Outcomes */}
                <div className="md:col-span-1 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Topic</h4>
                    <p className="text-sm font-bold text-slate-900">{week.topic}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{Array.isArray(week.subTopics) ? week.subTopics.join(', ') : ''}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Learning Outcomes</h4>
                    <ul className="space-y-1">
                      {(week.outcomes || []).slice(0, 3).map((outcome, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span className="line-clamp-2">{outcome}</span>
                        </li>
                      ))}
                      {(week.outcomes || []).length > 3 && (
                        <li className="text-[10px] font-bold text-indigo-600">+{(week.outcomes || []).length - 3} more outcomes</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Daily Focus */}
                <div className="md:col-span-1 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Lesson Focus</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">5 Days</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(week.lessonFocus || []).map((focus, i) => (
                      <div key={i} className="flex items-start gap-3 text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:bg-white transition-colors shadow-sm">
                        <div className="w-6 h-6 shrink-0 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                          {['M', 'T', 'W', 'T', 'F'][i]}
                        </div>
                        <span className="leading-tight font-medium">{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources & Assessment */}
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resources Needed</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(week.resourcesNeeded || []).map((res, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] font-medium text-slate-600 px-2 py-1 bg-slate-100 rounded border border-slate-200">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assessment Opportunities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(week.assessmentOpportunities || []).map((ass, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 px-2 py-1 bg-emerald-50 rounded border border-emerald-100">
                          <Activity className="w-3 h-3 text-emerald-400" />
                          {ass}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewWeeklyPlan?.(week.weekNumber)}
                      className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50 text-[10px] h-9 rounded-xl font-bold"
                    >
                      <ArrowRight className="w-3.5 h-3.5 mr-2" />
                      View Weekly Roadmap
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
