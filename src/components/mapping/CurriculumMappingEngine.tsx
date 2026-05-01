import React, { useState } from 'react';
import { 
  Calendar, 
  Map as MapIcon, 
  ListChecks, 
  BarChart3, 
  Settings, 
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button } from '../ui';
import { 
  YearlyCurriculumMap, 
  CyclePlan, 
  WeeklyTeachingPlan, 
  AcademicCalendar,
  CoverageRecord,
  GradeLevel,
  Subject
} from '../../types';
import { cn } from '../../lib/utils';
import { YearlyMap } from './YearlyMap';
import { CyclePlanView } from './CyclePlanView';
import { WeeklyPlanView } from './WeeklyPlanView';
import { CoverageTracker } from './CoverageTracker';
import { AcademicCalendarManager } from './AcademicCalendarManager';
import { PacingDashboard } from './PacingDashboard';

interface CurriculumMappingEngineProps {
  calendar: AcademicCalendar | null;
  yearlyMaps: YearlyCurriculumMap[];
  cyclePlans: CyclePlan[];
  weeklyPlans: WeeklyTeachingPlan[];
  coverage: CoverageRecord[];
  onGenerateYearlyMap: (grade: GradeLevel, subject: Subject) => Promise<void>;
  onGenerateCyclePlan: (map: YearlyCurriculumMap, cycle: number) => Promise<void>;
  onGenerateWeeklyPlan: (cyclePlan: CyclePlan, week: number) => Promise<void>;
  onUpdateCalendar: (calendar: AcademicCalendar) => Promise<void>;
  onUpdateCoverage: (record: CoverageRecord) => Promise<void>;
  onViewWeeklyPlan?: (week: number) => void;
  isGenerating?: boolean;
  error?: string | null;
}

export const CurriculumMappingEngine: React.FC<CurriculumMappingEngineProps> = ({
  calendar,
  yearlyMaps,
  cyclePlans,
  weeklyPlans,
  coverage,
  onGenerateYearlyMap,
  onGenerateCyclePlan,
  onGenerateWeeklyPlan,
  onUpdateCalendar,
  onUpdateCoverage,
  isGenerating,
  error
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'yearly' | 'cycle' | 'weekly' | 'coverage' | 'calendar'>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('Standard 6');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [selectedCycle, setSelectedCycle] = useState<number>(1);

  const currentMap = yearlyMaps.find(m => m.grade === selectedGrade && m.subject === selectedSubject);
  const currentCyclePlan = cyclePlans.find(p => p.grade === selectedGrade && p.subject === selectedSubject && p.cycleNumber === selectedCycle);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'yearly', label: 'Yearly Map', icon: MapIcon },
    { id: 'cycle', label: 'Cycle Plan', icon: ListChecks },
    { id: 'weekly', label: 'Weekly Plan', icon: Calendar },
    { id: 'coverage', label: 'Coverage', icon: CheckCircle2 },
    { id: 'calendar', label: 'Calendar', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MapIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Curriculum Mapping Engine</h2>
            <p className="text-sm text-slate-500">Full school year pacing and coverage system</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Infant 1">Infant 1</option>
            <option value="Infant 2">Infant 2</option>
            <option value="Standard 1">Standard 1</option>
            <option value="Standard 2">Standard 2</option>
            <option value="Standard 3">Standard 3</option>
            <option value="Standard 4">Standard 4</option>
            <option value="Standard 5">Standard 5</option>
            <option value="Standard 6">Standard 6</option>
          </select>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Language Arts">Language Arts</option>
            <option value="Science and Technology">Science and Technology</option>
            <option value="Belizean Studies">Belizean Studies</option>
            <option value="HFLE">HFLE</option>
            <option value="Spanish">Spanish</option>
            <option value="PE">PE</option>
            <option value="Creative Arts">Creative Arts</option>
          </select>
          <select 
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value={1}>Cycle 1</option>
            <option value={2}>Cycle 2</option>
            <option value={3}>Cycle 3</option>
            <option value={4}>Cycle 4</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeSubTab === tab.id 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isGenerating && (
        <div className="p-12 flex flex-col items-center justify-center space-y-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-indigo-100">
          <Clock className="w-12 h-12 text-indigo-600 animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">Generating Your Curriculum Map...</h3>
            <p className="text-slate-500">Our AI is analyzing your curriculum and distributing it across the school year.</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!isGenerating && (
        <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeSubTab === 'dashboard' && (
              <PacingDashboard 
                calendar={calendar}
                map={currentMap}
                cyclePlan={currentCyclePlan}
                coverage={coverage}
                grade={selectedGrade}
                subject={selectedSubject}
                cycle={selectedCycle}
              />
            )}
            {activeSubTab === 'yearly' && (
              <YearlyMap 
                map={currentMap}
                grade={selectedGrade}
                subject={selectedSubject}
                onGenerate={() => onGenerateYearlyMap(selectedGrade, selectedSubject)}
                isGenerating={isGenerating}
              />
            )}
            {activeSubTab === 'cycle' && (
              <CyclePlanView 
                plan={currentCyclePlan}
                map={currentMap}
                cycleNumber={selectedCycle}
                onGenerate={() => currentMap && onGenerateCyclePlan(currentMap, selectedCycle)}
                onViewWeeklyPlan={(week) => setActiveSubTab('weekly')}
                isGenerating={isGenerating}
              />
            )}
            {activeSubTab === 'weekly' && (
              <WeeklyPlanView 
                plans={weeklyPlans.filter(p => p.grade === selectedGrade && p.subject === selectedSubject && p.cycleNumber === selectedCycle)}
                cyclePlan={currentCyclePlan}
                onGenerate={(week) => currentCyclePlan && onGenerateWeeklyPlan(currentCyclePlan, week)}
                isGenerating={isGenerating}
              />
            )}
            {activeSubTab === 'coverage' && (
              <CoverageTracker 
                coverage={coverage.filter(c => c.grade === selectedGrade && c.subject === selectedSubject)}
                grade={selectedGrade}
                subject={selectedSubject}
                onUpdate={onUpdateCoverage}
              />
            )}
            {activeSubTab === 'calendar' && (
              <AcademicCalendarManager 
                calendar={calendar}
                onUpdate={onUpdateCalendar}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      )}
    </div>
  );
};
