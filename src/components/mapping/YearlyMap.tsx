import React from 'react';
import { 
  Plus, 
  Map as MapIcon, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  CalendarDays,
  Target,
  Layers
} from 'lucide-react';
import { Card, Button } from '../ui';
import { YearlyCurriculumMap, GradeLevel, Subject } from '../../types';

interface YearlyMapProps {
  map: YearlyCurriculumMap | undefined;
  grade: GradeLevel;
  subject: Subject;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const YearlyMap: React.FC<YearlyMapProps> = ({ map, grade, subject, onGenerate, isGenerating }) => {
  if (!map || !map.cycles) {
    return (
      <Card className="p-12 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-indigo-50 rounded-full">
          <MapIcon className="w-12 h-12 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">No Yearly Map Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mt-2">
            Generate a full school year curriculum map for {grade} {subject} spread across 4 teaching cycles.
          </p>
        </div>
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating...' : 'Build My School Year'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(cycleNum => {
          const cycle = map.cycles.find(c => c.cycleNumber === cycleNum);
          return (
            <Card key={cycleNum} className="p-4 border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Cycle {cycleNum}</span>
                <span className="text-xs text-slate-400">{cycle?.topics.length || 0} Topics</span>
              </div>
              <p className="text-sm font-medium text-slate-700 truncate">
                {cycle?.topics[0]?.topic || 'No topics assigned'}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Cycle Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {map.cycles.map((cycle) => (
          <Card key={cycle.cycleNumber} className="overflow-hidden border-slate-200">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  C{cycle.cycleNumber}
                </div>
                <h3 className="font-bold text-slate-900">Cycle {cycle.cycleNumber} Roadmap</h3>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                  {(cycle.revisionWeeks || []).length} Revision Weeks
                </span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
                  {(cycle.assessmentWeeks || []).length} Assessment Weeks
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {(cycle.topics || []).map((topic, idx) => (
                <div key={topic.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:border-indigo-500 group-hover:text-indigo-600 transition-colors">
                      {idx + 1}
                    </div>
                    {idx < (cycle.topics || []).length - 1 && (
                      <div className="w-0.5 h-full bg-slate-100 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-800">{topic.topic}</h4>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                        topic.priority === 'High' ? "bg-red-100 text-red-700" :
                        topic.priority === 'Medium' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {topic.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-1">{(topic.subtopics || []).join(', ')}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {topic.estimatedWeeks} Weeks
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {(topic.outcomes || []).length} Outcomes
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Starts Week {topic.plannedWeekStart}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Regeneration Option */}
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={onGenerate}
          disabled={isGenerating}
          className="text-slate-500 hover:text-indigo-600 border-slate-200 hover:border-indigo-200 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Regenerate Yearly Map'}
        </Button>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
