import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Target, 
  ListChecks, 
  Layers, 
  MessageSquare, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  RefreshCw, 
  XCircle, 
  Printer, 
  Download,
  Save,
  CalendarDays,
  BookOpenCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Input, Select, LessonStatusBadge, DropdownMenu } from '../ui';
import { LessonPlanDisplay } from '../LessonPlanDisplay';
import { LanguageArtsWeeklyPlanDisplay } from '../LanguageArtsWeeklyPlanDisplay';
import { 
  CurriculumEntry, 
  UserSettings, 
  GradeLevel, 
  Subject, 
  TeachingModel, 
  OutputStyle, 
  LessonPlan,
  DailyLessonPlan,
  YearlyCalendarPlan,
  CyclePacingMap,
  CalendarDayType,
  LanguageArtsWeeklyPlan,
  LanguageArtsWeeklyStructure,
  WeeklyLessonPlan
} from '../../types';
import { generateLessonPlan, improveContent, generateLanguageArtsWeeklyPlan, generateWeeklyLessonPlan } from '../../services/gemini';
import { useToasts } from '../../context/ToastContext';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { WeeklyLessonPlanDisplay } from '../WeeklyLessonPlanDisplay';

interface PlannerViewProps {
  activeClass: GradeLevel | null;
  curriculum: CurriculumEntry[];
  setActiveTab: (tab: string) => void;
  dailyLessonPlans: DailyLessonPlan[];
  yearlyCalendars: YearlyCalendarPlan[];
  cyclePacingMaps: CyclePacingMap[];
  userSettings: UserSettings;
  prefillData?: any;
  onSave: (plan: any) => Promise<void>;
  onGenerateResource: (plan: LessonPlan, type: string) => Promise<void>;
}

export function PlannerView({ 
  activeClass,
  curriculum, 
  setActiveTab, 
  dailyLessonPlans,
  yearlyCalendars,
  cyclePacingMaps,
  userSettings, 
  prefillData, 
  onSave,
  onGenerateResource 
}: PlannerViewProps) {
  const { showToast } = useToasts();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(prefillData?.grade || activeClass || userSettings.defaultGrade);

  useEffect(() => {
    if (activeClass) {
      setSelectedGrade(activeClass);
    }
  }, [activeClass]);

  // Handle prefill updates when returning from Yearly Calendar
  useEffect(() => {
    if (prefillData) {
      if (prefillData.grade) setSelectedGrade(prefillData.grade);
      if (prefillData.subject) setSelectedSubject(prefillData.subject);
      if (prefillData.cycle) setSelectedCycle(prefillData.cycle);
      if (prefillData.week) setSelectedWeek(prefillData.week);
      if (prefillData.topic) setSelectedTopic(prefillData.topic);
      if (prefillData.subtopic) setSelectedSubtopic(prefillData.subtopic);
      if (prefillData.outcomes?.[0]) setSelectedOutcome(prefillData.outcomes[0]);
    }
  }, [prefillData]);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(prefillData?.subject || userSettings.defaultSubject);
  const [selectedCycle, setSelectedCycle] = useState<number>(prefillData?.cycle || 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(prefillData?.week || 1);
  const [selectedDate, setSelectedDate] = useState<string>(prefillData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [selectedTopic, setSelectedTopic] = useState<string>(prefillData?.topic || '');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(prefillData?.subtopic || '');
  const [selectedOutcome, setSelectedOutcome] = useState<string>(prefillData?.outcomes?.[0] || '');
  const [teachingModel, setTeachingModel] = useState<TeachingModel>(userSettings.teachingModel || '5E');
  const [outputStyle, setOutputStyle] = useState<OutputStyle>(userSettings.aiQuality.defaultOutputStyle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isLAWeeklyMode, setIsLAWeeklyMode] = useState(false);
  const [isWeeklyPlanMode, setIsWeeklyPlanMode] = useState(false);
  const [laWeeklyStructure, setLAWeeklyStructure] = useState<LanguageArtsWeeklyStructure>('Recommended');
  const [generatedLAWeeklyPlan, setGeneratedLAWeeklyPlan] = useState<LanguageArtsWeeklyPlan | null>(null);
  const [generatedWeeklyPlan, setGeneratedWeeklyPlan] = useState<WeeklyLessonPlan | null>(null);

  // Reset selections when grade or subject changes, unless it's the initial prefill
  useEffect(() => {
    if (!prefillData) {
      setSelectedTopic('');
      setSelectedSubtopic('');
      setSelectedOutcome('');
    }
  }, [selectedGrade, selectedSubject]);

  const activeCalendar = useMemo(() => {
    return yearlyCalendars.find(c => c.grade === selectedGrade && c.subject === selectedSubject) || null;
  }, [yearlyCalendars, selectedGrade, selectedSubject]);

  const selectedDayInfo = useMemo(() => {
    if (!activeCalendar) return null;
    return activeCalendar.days.find(d => d.date === selectedDate) || null;
  }, [activeCalendar, selectedDate]);

  // Update cycle/week based on selected date
  useEffect(() => {
    if (selectedDayInfo) {
      if (selectedDayInfo.cycle) setSelectedCycle(selectedDayInfo.cycle);
      if (selectedDayInfo.week) setSelectedWeek(selectedDayInfo.week);
    }
  }, [selectedDayInfo]);

  const activeMap = useMemo(() => {
    return cyclePacingMaps.find(m => m.grade === selectedGrade && m.subject === selectedSubject && m.cycle === selectedCycle) || null;
  }, [cyclePacingMaps, selectedGrade, selectedSubject, selectedCycle]);

  const activeWeekData = useMemo(() => {
    if (!activeMap) return null;
    return activeMap.weeks.find(w => w.weekNumber === selectedWeek) || null;
  }, [activeMap, selectedWeek]);

  // Auto-fill from pacing map when week changes
  useEffect(() => {
    if (activeWeekData) {
      setSelectedTopic(activeWeekData.topic);
      if (activeWeekData.subtopics.length > 0) {
        setSelectedSubtopic(activeWeekData.subtopics[0]);
      }
      if (activeWeekData.learningOutcomes.length > 0) {
        setSelectedOutcome(activeWeekData.learningOutcomes[0]);
      }
    }
  }, [activeWeekData]);

  const filteredTopics = useMemo(() => {
    const curriculumTopics = curriculum
      .filter(c => c.grade === selectedGrade && c.subject === selectedSubject)
      .map(c => c.topic);
    
    const uniqueCurriculumTopics = Array.from(new Set(curriculumTopics));

    if (activeMap && activeMap.weeks.length > 0) {
      const mapTopics = activeMap.weeks.map(w => w.topic);
      const uniqueMapTopics = Array.from(new Set(mapTopics));
      // Merge them, prioritizing map topics but ensuring all curriculum topics are available
      return Array.from(new Set([...uniqueMapTopics, ...uniqueCurriculumTopics]));
    }
    
    return uniqueCurriculumTopics;
  }, [curriculum, selectedGrade, selectedSubject, activeMap]);

  const filteredSubtopics = useMemo(() => {
    if (activeWeekData && activeWeekData.topic === selectedTopic) {
      return activeWeekData.subtopics;
    }
    return Array.from(new Set(curriculum.filter(c => c.grade === selectedGrade && c.subject === selectedSubject && c.topic === selectedTopic).map(c => c.subtopic)));
  }, [curriculum, selectedGrade, selectedSubject, selectedTopic, activeWeekData]);

  const filteredOutcomes = useMemo(() => {
    if (activeWeekData && activeWeekData.topic === selectedTopic) {
      return activeWeekData.learningOutcomes;
    }
    const entries = curriculum.filter(c => c.grade === selectedGrade && c.subject === selectedSubject && c.topic === selectedTopic && (selectedSubtopic ? c.subtopic === selectedSubtopic : true));
    const outcomes: string[] = [];
    entries.forEach(e => outcomes.push(...e.learning_outcomes));
    return Array.from(new Set(outcomes));
  }, [curriculum, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, activeWeekData]);

  const handleGenerate = async () => {
    if (!selectedTopic || !selectedOutcome) {
      showToast("Please select a topic and learning outcome first.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      if (isWeeklyPlanMode) {
        const weeklyPlan = await generateWeeklyLessonPlan({
          grade: selectedGrade,
          subject: selectedSubject,
          topic: selectedTopic,
          cycle: selectedCycle,
          week: selectedWeek,
          teachingModel,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          calendarDays: activeCalendar?.days
        });
        setGeneratedWeeklyPlan(weeklyPlan);
      } else if (isLAWeeklyMode && selectedSubject === 'Language Arts') {
        const plan = await generateLanguageArtsWeeklyPlan({
          grade: selectedGrade,
          cycle: selectedCycle,
          week: selectedWeek,
          topic: selectedTopic,
          learningOutcomes: [selectedOutcome],
          structure: laWeeklyStructure,
          calendarDays: activeCalendar?.days
        });
        setGeneratedLAWeeklyPlan({
          ...plan,
          grade: selectedGrade,
          subject: 'Language Arts',
          cycle: selectedCycle,
          week: selectedWeek,
          structure: laWeeklyStructure,
          createdAt: new Date().toISOString(),
          createdBy: ''
        });
      } else {
        const plan = await generateLessonPlan({
          grade: selectedGrade,
          subject: selectedSubject,
          cycle: selectedCycle,
          week: selectedWeek,
          day: selectedDayInfo?.dayNumber || 1, 
          date: selectedDate,
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          lessonTitle: selectedTopic, 
          learningOutcome: selectedOutcome,
          objectives: [selectedOutcome], 
          duration: '45 minutes', 
          teachingModel,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          calendarDays: activeCalendar?.days
        });

        setGeneratedPlan({
          ...plan,
          structured_json: plan,
          grade: selectedGrade,
          subject: selectedSubject,
          cycle: selectedCycle,
          week: selectedWeek,
          date: selectedDate,
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          learningOutcome: selectedOutcome,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          createdAt: new Date().toISOString(),
          createdBy: '', 
          status: 'Planned',
          isReadyToTeach: !!(plan.videoAssistant && plan.inDepthVisuals && plan.boardVisualPlan && plan.exactMaterials)
        });
      }
    } catch (err) {
      console.error("Error generating lesson plan:", err);
      showToast("Failed to generate lesson plan. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async (instruction: string) => {
    if (!generatedPlan) return;
    setIsImproving(true);
    try {
      const improved = await improveContent(generatedPlan.content, instruction, generatedPlan);
      setGeneratedPlan(prev => prev ? { ...prev, content: improved } : null);
    } catch (err) {
      console.error("Error improving lesson plan:", err);
    } finally {
      setIsImproving(false);
    }
  };

  const getDayTypeColor = (type: CalendarDayType) => {
    switch (type) {
      case 'Regular School Day': return 'text-emerald-600 bg-emerald-50';
      case 'Public Holiday': return 'text-rose-600 bg-rose-50';
      case 'School Holiday / Break': return 'text-amber-600 bg-amber-50';
      case 'Professional Development Day': return 'text-indigo-600 bg-indigo-50';
      case 'School Planning Day': return 'text-blue-600 bg-blue-50';
      case 'Weekend': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {!generatedPlan && !generatedLAWeeklyPlan && !generatedWeeklyPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create New Lesson Plan</h2>
                <p className="text-gray-500">Select curriculum outcomes to generate an AI-powered lesson plan.</p>
              </div>
              <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2">
                <CalendarDays className="w-3 h-3 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Belize 2025/2026</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grade Level</label>
                <Select 
                  disabled={!!activeClass}
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
                />
                {activeClass && (
                  <p className="text-[10px] text-indigo-600 font-medium">
                    Locked to active class: {activeClass}
                  </p>
                )}
              </div>
              <div className="space-y-2">
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teaching Date</label>
                <div className="relative">
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={cn(
                      "pl-10",
                      selectedDayInfo && !selectedDayInfo.isTeachingDay && "border-rose-300 bg-rose-50"
                    )}
                  />
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {selectedDayInfo && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter", getDayTypeColor(selectedDayInfo.type))}>
                      {selectedDayInfo.type}
                    </span>
                    {!selectedDayInfo.isTeachingDay && (
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">Non-Teaching Day</span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cycle & Week</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      options={[
                        { label: 'Cycle 1', value: 1 },
                        { label: 'Cycle 2', value: 2 },
                        { label: 'Cycle 3', value: 3 },
                        { label: 'Cycle 4', value: 4 }
                      ]} 
                      value={selectedCycle} 
                      onChange={(val) => setSelectedCycle(Number(val))} 
                    />
                  </div>
                  <div className="flex-1">
                    <Select 
                      options={Array.from({ length: 12 }, (_, i) => ({ label: `Week ${i + 1}`, value: i + 1 }))} 
                      value={selectedWeek} 
                      onChange={(val) => setSelectedWeek(Number(val))} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-gray-50">
              {activeWeekData && (
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Pacing Map Context
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                      Cycle {selectedCycle} • Week {selectedWeek}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-indigo-900">{activeWeekData.topic}</p>
                    <p className="text-xs text-indigo-700 leading-relaxed">{activeWeekData.focus}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">{activeWeekData.teachingDaysCount} Teaching Days</span>
                    </div>
                    {activeWeekData.isAssessment && (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-bold text-rose-700 uppercase">Assessment Week</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Topic</label>
                <Select 
                  options={filteredTopics.map(t => ({ label: t, value: t }))} 
                  value={selectedTopic} 
                  onChange={(val) => setSelectedTopic(val)} 
                  placeholder={filteredTopics.length > 0 ? "Select a topic..." : "No topics found for this grade/subject"}
                />
                {filteredTopics.length === 0 && (
                  <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Upload curriculum for {selectedGrade} {selectedSubject} to see topics here.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subtopic</label>
                <Select 
                  options={filteredSubtopics.map(t => ({ label: t, value: t }))} 
                  value={selectedSubtopic} 
                  onChange={(val) => setSelectedSubtopic(val)} 
                  placeholder={selectedTopic ? (filteredSubtopics.length > 0 ? "Select a subtopic..." : "No subtopics found") : "Select a topic first"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Learning Outcome</label>
                <Select 
                  options={filteredOutcomes.map(o => ({ label: o, value: o }))} 
                  value={selectedOutcome} 
                  onChange={(val) => setSelectedOutcome(val)} 
                  placeholder={selectedTopic ? (filteredOutcomes.length > 0 ? "Select a learning outcome..." : "No outcomes found") : "Select a topic first"}
                />
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-indigo-900">Weekly Lesson Planner</h4>
                  </div>
                  <Button 
                    variant={isWeeklyPlanMode ? "primary" : "outline"} 
                    size="sm"
                    onClick={() => {
                        setIsWeeklyPlanMode(!isWeeklyPlanMode);
                        if (isLAWeeklyMode) setIsLAWeeklyMode(false);
                    }}
                    className="text-[10px] h-7"
                  >
                    {isWeeklyPlanMode ? "Enabled" : "Enable Mode"}
                  </Button>
                </div>
                {isWeeklyPlanMode && (
                  <p className="text-xs text-indigo-800">Generate a progressive 5-day plan (Monday–Friday) for this topic.</p>
                )}
              </div>

              {selectedSubject === 'Language Arts' && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="w-5 h-5 text-amber-600" />
                      <h4 className="text-sm font-bold text-amber-900">Language Arts Weekly Scope & Sequence</h4>
                    </div>
                    <Button 
                      variant={isLAWeeklyMode ? "primary" : "outline"} 
                      size="sm"
                      onClick={() => setIsLAWeeklyMode(!isLAWeeklyMode)}
                      className="text-[10px] h-7"
                    >
                      {isLAWeeklyMode ? "Enabled" : "Enable Mode"}
                    </Button>
                  </div>
                  {isLAWeeklyMode && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs text-amber-800">Generate a full 5-day plan following the official weekly structure.</p>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Weekly Structure</label>
                        <Select 
                          options={[
                            { label: 'Recommended (Comprehension/Phonics/Production)', value: 'Recommended' },
                            { label: 'Alternative (Phonics/Comprehension)', value: 'Alternative' }
                          ]} 
                          value={laWeeklyStructure} 
                          onChange={(val) => setLAWeeklyStructure(val as LanguageArtsWeeklyStructure)} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleGenerate} isLoading={isGenerating} size="lg" className="w-full py-6 text-lg">
                <Sparkles className="w-5 h-5" />
                {isWeeklyPlanMode ? "Generate Weekly Plan" : isLAWeeklyMode && selectedSubject === 'Language Arts' ? "Generate Weekly LA Plan" : "Generate Lesson Plan"}
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-bold">AI Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teaching Model</label>
                  <Select 
                    options={[
                      { label: '5E Model', value: '5E' },
                      { label: 'Competency-based', value: 'Competency-based' },
                      { label: 'Inquiry-based', value: 'Inquiry-based' },
                      { label: 'Direct Instruction', value: 'Direct instruction' },
                      { label: 'UDL Framework', value: 'Universal Design for Learning (UDL)' }
                    ]} 
                    value={teachingModel} 
                    onChange={(val) => setTeachingModel(val as TeachingModel)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Output Style</label>
                  <Select 
                    options={[
                      { label: 'Standard Teacher', value: 'Standard Teacher' },
                      { label: 'Detailed Teacher', value: 'Detailed Teacher' },
                      { label: 'Observation-Ready', value: 'Observation-Ready' },
                      { label: 'Student-Friendly', value: 'Student-Friendly' },
                      { label: 'Ministry-Style Formal', value: 'Ministry-Style Formal' }
                    ]} 
                    value={outputStyle} 
                    onChange={(val) => setOutputStyle(val as OutputStyle)} 
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-indigo-50 border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Calendar Awareness</h3>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed">
                The AI automatically adjusts lesson complexity based on the <strong>teaching days available</strong> in the selected week.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => { setGeneratedPlan(null); setGeneratedLAWeeklyPlan(null); setGeneratedWeeklyPlan(null); }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Planner
            </Button>
            <div className="flex gap-3">
              {generatedPlan && (
                <Button variant="secondary" onClick={() => handleImprove('Make it more interactive')}>
                  <RefreshCw className="w-4 h-4" />
                  Make Interactive
                </Button>
              )}
              <Button onClick={() => onSave(generatedPlan || generatedLAWeeklyPlan || generatedWeeklyPlan)}>
                <Save className="w-4 h-4" />
                Save Plan
              </Button>
            </div>
          </div>

          {isImproving && (
            <Card className="p-4 bg-indigo-50 border-indigo-100 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <p className="text-sm font-medium text-indigo-900">AI is refining your lesson plan...</p>
            </Card>
          )}

          {generatedWeeklyPlan ? (
            <WeeklyLessonPlanDisplay
              plan={generatedWeeklyPlan}
              onGenerateResource={onGenerateResource}
              onSave={onSave}
              onUpdateDayPlan={(idx, updated) => {
                setGeneratedWeeklyPlan(prev => {
                  if (!prev) return null;
                  const newDays = [...prev.week.days];
                  newDays[idx] = { ...newDays[idx], lesson: updated };
                  return { ...prev, week: { ...prev.week, days: newDays } };
                });
              }}
            />
          ) : generatedPlan ? (
            <LessonPlanDisplay 
              plan={generatedPlan} 
              onGenerateResource={onGenerateResource}
              onUpdatePlan={async (updated) => setGeneratedPlan(updated)}
              onDuplicate={async (p) => {
                const { id, ...rest } = p;
                setGeneratedPlan({ ...rest } as LessonPlan);
                showToast("Lesson duplicated in editor", "success");
              }}
            />
          ) : (
            <LanguageArtsWeeklyPlanDisplay 
              plan={generatedLAWeeklyPlan!} 
            />
          )}
        </div>
      )}
    </div>
  );
}
