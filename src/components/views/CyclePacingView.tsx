import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Printer, 
  Sparkles, 
  CalendarRange, 
  Calendar, 
  Loader2, 
  List, 
  AlertCircle, 
  CheckCircle2, 
  FileWarning, 
  Clock,
  BarChart3,
  ChevronRight,
  Layers,
  Target,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Select, Input } from '../ui';
import { 
  CurriculumEntry, 
  YearlyCalendarPlan, 
  CyclePacingMap, 
  UserSettings, 
  GradeLevel, 
  Subject,
  CurriculumCoverage
} from '../../types';
import { generateCyclePacingMap, calculateCoverage } from '../../services/gemini';
import { cn, safeFormat } from '../../lib/utils';
import { useToasts } from '../../context/ToastContext';

interface CyclePacingViewProps {
  curriculum: CurriculumEntry[];
  yearlyCalendars: YearlyCalendarPlan[];
  cyclePacingMaps: CyclePacingMap[];
  userSettings: UserSettings;
  setActiveTab: (tab: string) => void;
  onSave: (map: CyclePacingMap) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CyclePacingView({ 
  curriculum, 
  yearlyCalendars, 
  cyclePacingMaps,
  userSettings,
  setActiveTab,
  onSave,
  onDelete
}: CyclePacingViewProps) {
  const { showToast } = useToasts();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(userSettings.defaultGrade);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(userSettings.defaultSubject);
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [distributionMethod, setDistributionMethod] = useState<'Balanced' | 'Teacher-Controlled' | 'Priority-Based' | 'Outcome-Based'>('Balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverage, setCoverage] = useState<CurriculumCoverage | null>(null);
  const [isCalculatingCoverage, setIsCalculatingCoverage] = useState(false);

  const activeCalendar = useMemo(() => {
    return yearlyCalendars.find(c => c.grade === selectedGrade && c.subject === selectedSubject) || null;
  }, [yearlyCalendars, selectedGrade, selectedSubject]);

  const availableWeeks = useMemo(() => {
    if (!activeCalendar) return 0;
    const cycleDays = activeCalendar.days.filter(d => d.cycle === selectedCycle && d.isTeachingDay);
    if (cycleDays.length === 0) return 0;
    
    const weeks = new Set(cycleDays.map(d => d.week));
    return weeks.size;
  }, [activeCalendar, selectedCycle]);

  const totalTeachingDays = useMemo(() => {
    if (!activeCalendar) return 0;
    return activeCalendar.days.filter(d => d.cycle === selectedCycle && d.isTeachingDay).length;
  }, [activeCalendar, selectedCycle]);

  const activeMap = useMemo(() => {
    return cyclePacingMaps.find(m => m.grade === selectedGrade && m.subject === selectedSubject && m.cycle === selectedCycle) || null;
  }, [cyclePacingMaps, selectedGrade, selectedSubject, selectedCycle]);

  useEffect(() => {
    const updateCoverage = async () => {
      if (activeMap && activeCalendar) {
        setIsCalculatingCoverage(true);
        try {
          const cycleEntries = curriculum.filter(c => c.grade === selectedGrade && c.subject === selectedSubject && c.cycle === selectedCycle);
          const result = await calculateCoverage({
            grade: selectedGrade,
            subject: selectedSubject,
            cycle: selectedCycle,
            pacingMap: activeMap,
            calendarDays: activeCalendar.days,
            curriculumEntries: cycleEntries
          });
          setCoverage(result as CurriculumCoverage);
        } catch (err) {
          console.error("Error calculating coverage:", err);
        } finally {
          setIsCalculatingCoverage(false);
        }
      } else {
        setCoverage(null);
      }
    };
    updateCoverage();
  }, [activeMap, activeCalendar, curriculum, selectedGrade, selectedSubject, selectedCycle]);

  const handleGenerate = async () => {
    const cycleEntries = curriculum.filter(c => c.grade === selectedGrade && c.subject === selectedSubject && c.cycle === selectedCycle);
    if (cycleEntries.length === 0) {
      showToast("No curriculum entries found for this cycle. Please upload curriculum first.", "error");
      return;
    }
    if (availableWeeks === 0) {
      showToast("No teaching weeks found for this cycle in the school calendar. Please set up the calendar first.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateCyclePacingMap({
        grade: selectedGrade,
        subject: selectedSubject,
        cycle: selectedCycle,
        totalWeeks: availableWeeks,
        totalTeachingDays,
        entries: cycleEntries,
        calendarDays: activeCalendar!.days,
        distributionMethod
      });

      await onSave({
        ...generated,
        grade: selectedGrade,
        subject: selectedSubject,
        cycle: selectedCycle,
        createdBy: '', // Will be set by App
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error generating pacing map:", err);
      showToast("Failed to generate pacing map. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grade Level</label>
              <div className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded flex items-center gap-1">
                <Calendar className="w-2 h-2 text-indigo-600" />
                <span className="text-[8px] font-black text-indigo-700 uppercase tracking-tighter">Belize 25/26</span>
              </div>
            </div>
            <Select 
              options={[
                { label: 'Infant 1', value: 'Infant 1' },
                { label: 'Infant 2', value: 'Infant 2' },
                { label: 'Standard 1', value: 'Standard 1' },
                { label: 'Standard 2', value: 'Standard 2' },
                { label: 'Standard 3', value: 'Standard 3' },
                { label: 'Standard 4', value: 'Standard 4' },
                { label: 'Standard 5', value: 'Standard 5' },
                { label: 'Standard 6', value: 'Standard 6' }
              ]} 
              value={selectedGrade} 
              onChange={(val) => setSelectedGrade(val as GradeLevel)} 
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</label>
            <Select 
              options={[
                { label: 'Mathematics', value: 'Mathematics' },
                { label: 'Language Arts', value: 'Language Arts' },
                { label: 'Science and Technology', value: 'Science and Technology' },
                { label: 'Belizean Studies', value: 'Belizean Studies' },
                { label: 'HFLE', value: 'HFLE' },
                { label: 'Spanish', value: 'Spanish' },
                { label: 'PE', value: 'PE' },
                { label: 'Creative Arts', value: 'Creative Arts' }
              ]} 
              value={selectedSubject} 
              onChange={(val) => setSelectedSubject(val as Subject)} 
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cycle</label>
            <Select 
              options={[
                { label: 'Cycle 1', value: 1 },
                { label: 'Cycle 2', value: 2 },
                { label: 'Cycle 3', value: 3 },
                { label: 'Cycle 4', value: 4 }
              ]} 
              value={selectedCycle} 
              onChange={(val) => setSelectedCycle(Number(val))} 
              className="w-32"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribution Method</label>
            <Select 
              options={[
                { label: 'Balanced', value: 'Balanced' },
                { label: 'Teacher-Controlled', value: 'Teacher-Controlled' },
                { label: 'Priority-Based', value: 'Priority-Based' },
                { label: 'Outcome-Based', value: 'Outcome-Based' }
              ]} 
              value={distributionMethod} 
              onChange={(val) => setDistributionMethod(val as any)} 
              className="w-48"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print Map
          </Button>
          <Button onClick={handleGenerate} isLoading={isGenerating}>
            <Sparkles className="w-4 h-4" />
            {activeMap ? 'Regenerate Map' : 'Generate Pacing Map'}
          </Button>
        </div>
      </div>

      {!activeMap && !isGenerating && (
        <Card className="p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <CalendarRange className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold">No Pacing Map Found</h3>
            <p className="text-gray-500">
              {availableWeeks > 0 
                ? `You have ${availableWeeks} teaching weeks available in Cycle ${selectedCycle}. Generate a pacing map to link these weeks to your curriculum topics.`
                : `No teaching weeks found for Cycle ${selectedCycle} in your school calendar. Please set up your calendar first to generate a pacing map.`
              }
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              {availableWeeks > 0 ? (
                <Button onClick={handleGenerate} size="lg">
                  <Sparkles className="w-4 h-4" />
                  Generate Pacing Map
                </Button>
              ) : (
                <Button onClick={() => setActiveTab('yearlyCalendar')} size="lg">
                  <Calendar className="w-4 h-4" />
                  Go to Calendar
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {isGenerating && (
        <Card className="p-12 text-center space-y-6">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Mapping Your Curriculum...</h3>
            <p className="text-gray-500">AI is analyzing learning outcomes and distributing topics across {availableWeeks} weeks using the {distributionMethod} method.</p>
          </div>
          <div className="max-w-xs mx-auto bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-indigo-600 h-full"
            />
          </div>
        </Card>
      )}

      {activeMap && !isGenerating && (
        <div className="space-y-6 print:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <List className="w-5 h-5 text-indigo-600" />
                    Weekly Pacing Guide
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-bold">
                      {activeMap.totalWeeks} Weeks • {activeMap.totalTeachingDays} Teaching Days
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-bold">
                      {activeMap.distributionMethod}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Week</th>
                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Topic & Focus</th>
                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Days</th>
                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeMap.weeks.map((week) => (
                        <tr key={week.weekNumber} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1">
                              <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                {week.weekNumber}
                              </span>
                              <p className="text-[8px] text-gray-400 font-bold uppercase text-center">
                                {safeFormat(week.dates?.[0], 'MMM d')}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 space-y-2">
                            <div>
                              {week.strand && (
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">{week.strand}</p>
                              )}
                              <p className="font-bold text-gray-900">{week.topic}</p>
                              <p className="text-sm text-gray-500">{week.focus}</p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {week.subtopics.map((st, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  {st}
                                </span>
                              ))}
                            </div>
                            {week.learningOutcomes.length > 0 && (
                              <div className="pt-2">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Learning Outcomes</p>
                                <ul className="list-disc list-inside text-xs text-gray-500 space-y-0.5">
                                  {week.learningOutcomes.slice(0, 3).map((lo, i) => (
                                    <li key={i} className="truncate">{lo}</li>
                                  ))}
                                  {week.learningOutcomes.length > 3 && (
                                    <li className="list-none text-indigo-600 font-medium">+{week.learningOutcomes.length - 3} more...</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-bold text-gray-700">{week.teachingDaysCount}</span>
                              <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">Days</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col gap-2">
                              {week.isReview && (
                                <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold uppercase tracking-wider text-center">Review</span>
                              )}
                              {week.isAssessment && (
                                <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold uppercase tracking-wider text-center">Assessment</span>
                              )}
                              {!week.isReview && !week.isAssessment && (
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-wider text-center">Teaching</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {coverage && (
                <Card className="p-6 space-y-4 border-indigo-100 bg-indigo-50/30">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Curriculum Coverage
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outcomes</p>
                      <p className="text-xl font-bold text-gray-900">
                        {coverage.stats.outcomesCompleted}/{coverage.stats.totalOutcomes}
                      </p>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full" 
                          style={{ width: `${(coverage.stats.outcomesCompleted / coverage.stats.totalOutcomes) * 100}%` }} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topics</p>
                      <p className="text-xl font-bold text-gray-900">
                        {coverage.stats.topicsCompleted}/{coverage.stats.totalTopics}
                      </p>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full" 
                          style={{ width: `${(coverage.stats.topicsCompleted / coverage.stats.totalTopics) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  {coverage.behindSchedule && (
                    <div className="flex gap-2 p-2 bg-rose-50 rounded-lg border border-rose-100">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-tight">Behind Schedule</p>
                    </div>
                  )}
                </Card>
              )}

              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Pacing Analysis
                </h3>
                <div className="space-y-3">
                  {activeMap.warnings.length > 0 ? (
                    activeMap.warnings.map((warning, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <FileWarning className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800 leading-tight">{warning}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-sm text-emerald-800 leading-tight">Pacing looks balanced for this cycle.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Topic Duration
                </h3>
                <div className="space-y-4">
                  {Array.from(new Set(activeMap.weeks.map(w => w.topic))).map(topic => {
                    const duration = activeMap.weeks.filter(w => w.topic === topic).length;
                    return (
                      <div key={topic} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{topic}</span>
                          <span className="text-gray-500">{duration} {duration === 1 ? 'week' : 'weeks'}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full" 
                            style={{ width: `${(duration / activeMap.totalWeeks) * 100}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-indigo-50 border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-900">Current Progress</h3>
                <div className="space-y-2">
                  <p className="text-sm text-indigo-700">
                    You are currently in <strong>Week 4 of {activeMap.totalWeeks}</strong>
                  </p>
                  <p className="text-xs text-indigo-600">
                    Topic: <strong>{activeMap.weeks[3]?.topic}</strong>
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" size="sm" className="w-full" onClick={() => setActiveTab('planner')}>
                      Plan Next Lesson
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
