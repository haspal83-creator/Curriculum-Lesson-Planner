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
  BookOpenCheck,
  FileCheck,
  History
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
  WeeklyLessonPlan,
  WeeklyCurriculumPlan,
  LanguageArtsComponent,
  LANGUAGE_ARTS_5_COMPONENTS
} from '../../types';
import { 
  generateLessonPlan, 
  generateLanguageArtsDailyPlan,
  improveContent, 
  generateLanguageArtsWeeklyPlan, 
  generateWeeklyLessonPlan,
  generatePowerPoint
} from '../../services/gemini';
import { buildDeterministicPowerPoint } from '../../lib/powerpointService';
import { 
  getFilteredTopics, 
  getFilteredSubtopics, 
  getFilteredOutcomes, 
  validateTopicInContext, 
  validateGeneratedLesson, 
  getCurriculumEmptyStateMessage 
} from '../../services/curriculumFilterService';
import { 
  buildCleanGenerationContext, 
  validatePreGenerationContext, 
  validateGeneratedLessonQuality 
} from '../../services/curriculumHierarchyService';
import { 
  getInstructionalWeekForDate, 
  getMasterCalendar, 
  getAcademicWeekDetails, 
  getDatesForCycleWeek, 
  AcademicWeekDetails 
} from '../../services/calendarService';
import { useToasts } from '../../context/ToastContext';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';
import { WeeklyLessonPlanDisplay } from '../WeeklyLessonPlanDisplay';
import { WeeklyTestGeneratorModal } from '../WeeklyTestGeneratorModal';

interface PlannerViewProps {
  activeClass: GradeLevel | null;
  curriculum: CurriculumEntry[];
  setActiveTab: (tab: string) => void;
  dailyLessonPlans: DailyLessonPlan[];
  yearlyCalendars: YearlyCalendarPlan[];
  cyclePacingMaps: CyclePacingMap[];
  userSettings: UserSettings;
  prefillData?: any;
  plans?: LessonPlan[];
  weeklyPlans?: WeeklyCurriculumPlan[];
  laWeeklyPlans?: LanguageArtsWeeklyPlan[];
  onSave: (plan: any) => Promise<void>;
  onGenerateResource: (plan: LessonPlan, type: string) => Promise<void>;
  onGenerateFullPack?: (plan: LessonPlan) => Promise<void>;
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
  plans = [],
  weeklyPlans = [],
  laWeeklyPlans = [],
  onSave,
  onGenerateResource,
  onGenerateFullPack
}: PlannerViewProps) {
  const { showToast } = useToasts();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    prefillData?.academicYear || userSettings.defaultAcademicYear || '2026-2027'
  );
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(prefillData?.grade || activeClass || userSettings.defaultGrade);

  useEffect(() => {
    if (activeClass) {
      setSelectedGrade(activeClass);
    }
  }, [activeClass]);

  // Handle prefill updates when returning from Yearly Calendar or Saved Plans
  useEffect(() => {
    if (prefillData) {
      if (prefillData.academicYear) setSelectedAcademicYear(prefillData.academicYear);
      if (prefillData.grade) setSelectedGrade(prefillData.grade);
      if (prefillData.subject) setSelectedSubject(prefillData.subject);
      if (prefillData.cycle) setSelectedCycle(prefillData.cycle);
      if (prefillData.date) {
        setSelectedDate(prefillData.date);
      } else if (prefillData.cycle && prefillData.week) {
        // Derive date from cycle and week if date was not provided
        const weekDates = getDatesForCycleWeek(
          prefillData.cycle, 
          prefillData.week, 
          prefillData.academicYear || selectedAcademicYear
        );
        if (weekDates.length > 0) {
          setSelectedDate(format(weekDates[0], 'yyyy-MM-dd'));
        }
      }
      if (prefillData.topic) setSelectedTopic(prefillData.topic);
      if (prefillData.subtopic) setSelectedSubtopic(prefillData.subtopic);
      if (prefillData.outcomes?.[0]) setSelectedOutcome(prefillData.outcomes[0]);
    }
  }, [prefillData]);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(prefillData?.subject || userSettings.defaultSubject);
  const [selectedCycle, setSelectedCycle] = useState<number>(prefillData?.cycle || 1);
  const [selectedDate, setSelectedDate] = useState<string>(prefillData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [selectedTopic, setSelectedTopic] = useState<string>(prefillData?.topic || '');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(prefillData?.subtopic || '');
  const [selectedOutcome, setSelectedOutcome] = useState<string>(prefillData?.outcomes?.[0] || '');
  const [teachingModel, setTeachingModel] = useState<TeachingModel>(userSettings.teachingModel || '5E');
  const [outputStyle, setOutputStyle] = useState<OutputStyle>(userSettings.aiQuality.defaultOutputStyle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFilteringTopics, setIsFilteringTopics] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isLAWeeklyMode, setIsLAWeeklyMode] = useState(false);
  const [isWeeklyPlanMode, setIsWeeklyPlanMode] = useState(false);
  const [laWeeklyStructure, setLAWeeklyStructure] = useState<LanguageArtsWeeklyStructure>('Recommended');
  const [generatedLAWeeklyPlan, setGeneratedLAWeeklyPlan] = useState<LanguageArtsWeeklyPlan | null>(null);
  const [generatedWeeklyPlan, setGeneratedWeeklyPlan] = useState<WeeklyLessonPlan | null>(null);
  const [selectedLAComponents, setSelectedLAComponents] = useState<LanguageArtsComponent[]>([
    'Comprehension — Oral Expression and Listening',
    'Production and Language Structure — Writing and Composition'
  ]);
  const [autoSelectLAComponents, setAutoSelectLAComponents] = useState<boolean>(true);
  const [isTestGeneratorOpen, setIsTestGeneratorOpen] = useState(false);

  const activeCalendar = useMemo(() => {
    return yearlyCalendars.find(c => c.grade === selectedGrade && c.subject === selectedSubject) || null;
  }, [yearlyCalendars, selectedGrade, selectedSubject]);

  const selectedDayInfo = useMemo(() => {
    if (!activeCalendar) return null;
    return activeCalendar.days.find(d => d.date === selectedDate) || null;
  }, [activeCalendar, selectedDate]);

  // AUTHORITATIVE DATE-TO-WEEK CALCULATION:
  // The selected lesson date is the single source of truth for:
  // Selected Lesson Date -> Academic Week -> Cycle -> Subject -> Week's Curriculum Topics -> Outcomes -> Lesson
  const detectedWeekDetails = useMemo<AcademicWeekDetails>(() => {
    return getAcademicWeekDetails(selectedDate, selectedAcademicYear);
  }, [selectedDate, selectedAcademicYear]);

  const detectedWeek = detectedWeekDetails.isValid ? detectedWeekDetails.week : null;
  const detectedCycle = detectedWeekDetails.isValid ? detectedWeekDetails.cycle : selectedCycle;

  // Synchronize cycle and academic year automatically when detected from the date
  useEffect(() => {
    if (detectedWeekDetails.isValid) {
      if (detectedWeekDetails.academicYear !== selectedAcademicYear) {
        setSelectedAcademicYear(detectedWeekDetails.academicYear);
      }
      if (detectedWeekDetails.cycle !== selectedCycle) {
        setSelectedCycle(detectedWeekDetails.cycle);
      }
    }
  }, [detectedWeekDetails.isValid, detectedWeekDetails.cycle, detectedWeekDetails.academicYear, selectedCycle, selectedAcademicYear]);

  // Cycle selector remains available for navigation: changing cycle jumps date to cycle start
  const handleCycleChange = (newCycle: number) => {
    setSelectedCycle(newCycle);
    try {
      const cal = getMasterCalendar(selectedAcademicYear);
      const cycleObj = cal.cycles.find(c => c.cycle === newCycle);
      if (cycleObj) {
        setSelectedDate(cycleObj.start);
      }
    } catch (err) {
      console.warn('Could not auto-adjust date for cycle switch:', err);
    }
  };

  const activeMap = useMemo(() => {
    return cyclePacingMaps.find(m => m.grade === selectedGrade && m.subject === selectedSubject && m.cycle === detectedCycle) || null;
  }, [cyclePacingMaps, selectedGrade, selectedSubject, detectedCycle]);

  const activeWeekData = useMemo(() => {
    if (!activeMap || detectedWeek === null) return null;
    return activeMap.weeks.find(w => w.weekNumber === detectedWeek) || null;
  }, [activeMap, detectedWeek]);

  // SYSTEM-WIDE CURRICULUM FILTERING RULE:
  // Strictly filter by Academic Year + Class + Subject + Date's Cycle + Date's Academic Week
  // NEVER displays topics from another cycle, subject, class, unrelated week, or current week if a past date is selected.
  const filteredTopics = useMemo(() => {
    if (!detectedWeekDetails.isValid || detectedWeek === null) {
      return [];
    }

    return getFilteredTopics(curriculum, {
      academicYear: detectedWeekDetails.academicYear,
      className: selectedGrade,
      subject: selectedSubject,
      cycle: detectedWeekDetails.cycle,
      week: detectedWeek,
      pacingMaps: cyclePacingMaps
    });
  }, [curriculum, detectedWeekDetails, selectedGrade, selectedSubject, detectedWeek, cyclePacingMaps]);

  // When changing lesson date, class, or subject:
  // Clear any previously selected topic that is no longer valid for the newly detected week
  useEffect(() => {
    if (selectedTopic && !filteredTopics.includes(selectedTopic)) {
      setSelectedTopic('');
      setSelectedSubtopic('');
      setSelectedOutcome('');
    }
  }, [filteredTopics, selectedTopic]);

  // STRICT SUBJECT ISOLATION:
  // When changing subject, grade, or cycle, reset all previous lesson state to prevent cross-subject contamination
  useEffect(() => {
    setGeneratedPlan(null);
    setGeneratedWeeklyPlan(null);
    setGeneratedLAWeeklyPlan(null);
    setSelectedTopic('');
    setSelectedSubtopic('');
    setSelectedOutcome('');
  }, [selectedSubject, selectedGrade, selectedCycle]);

  const filteredSubtopics = useMemo(() => {
    if (!detectedWeekDetails.isValid || detectedWeek === null || !selectedTopic) {
      return [];
    }
    return getFilteredSubtopics(curriculum, {
      academicYear: detectedWeekDetails.academicYear,
      className: selectedGrade,
      subject: selectedSubject,
      cycle: detectedWeekDetails.cycle,
      topic: selectedTopic,
      week: detectedWeek,
      pacingMaps: cyclePacingMaps
    });
  }, [curriculum, detectedWeekDetails, selectedGrade, selectedSubject, selectedTopic, detectedWeek, cyclePacingMaps]);

  const filteredOutcomes = useMemo(() => {
    if (!detectedWeekDetails.isValid || detectedWeek === null || !selectedTopic) {
      return [];
    }
    return getFilteredOutcomes(curriculum, {
      academicYear: detectedWeekDetails.academicYear,
      className: selectedGrade,
      subject: selectedSubject,
      cycle: detectedWeekDetails.cycle,
      topic: selectedTopic,
      subtopic: selectedSubtopic,
      week: detectedWeek,
      pacingMaps: cyclePacingMaps
    });
  }, [curriculum, detectedWeekDetails, selectedGrade, selectedSubject, selectedTopic, selectedSubtopic, detectedWeek, cyclePacingMaps]);

  // Synchronize topic selection with filteredTopics
  useEffect(() => {
    if (filteredTopics.length > 0) {
      if (!selectedTopic || !filteredTopics.includes(selectedTopic)) {
        const preferredTopic = (activeWeekData && filteredTopics.includes(activeWeekData.topic))
          ? activeWeekData.topic
          : filteredTopics[0];
        setSelectedTopic(preferredTopic);
      }
    } else {
      setSelectedTopic('');
      setSelectedSubtopic('');
      setSelectedOutcome('');
    }
  }, [filteredTopics, activeWeekData, selectedTopic]);

  // Synchronize subtopic selection with filteredSubtopics
  useEffect(() => {
    if (filteredSubtopics.length > 0) {
      if (!selectedSubtopic || !filteredSubtopics.includes(selectedSubtopic)) {
        const preferredSubtopic = (activeWeekData?.subtopics && activeWeekData.subtopics.find(st => filteredSubtopics.includes(st)))
          || filteredSubtopics[0];
        setSelectedSubtopic(preferredSubtopic);
      }
    } else {
      setSelectedSubtopic('');
    }
  }, [filteredSubtopics, activeWeekData, selectedSubtopic]);

  // Synchronize outcome selection with filteredOutcomes
  useEffect(() => {
    if (filteredOutcomes.length > 0) {
      if (!selectedOutcome || !filteredOutcomes.includes(selectedOutcome)) {
        const preferredOutcome = (activeWeekData?.learningOutcomes && activeWeekData.learningOutcomes.find(lo => filteredOutcomes.includes(lo)))
          || filteredOutcomes[0];
        setSelectedOutcome(preferredOutcome);
      }
    } else {
      setSelectedOutcome('');
    }
  }, [filteredOutcomes, activeWeekData, selectedOutcome]);

  // RESET / CLEAR INVALID DOWNSTREAM SELECTIONS:
  // When any selector (academicYear, class, subject, cycle) changes, reset downstream selections if no longer valid
  useEffect(() => {
    if (selectedTopic && !filteredTopics.includes(selectedTopic)) {
      setSelectedTopic('');
      setSelectedSubtopic('');
      setSelectedOutcome('');
    }
  }, [filteredTopics, selectedTopic]);

  useEffect(() => {
    if (selectedSubtopic && !filteredSubtopics.includes(selectedSubtopic)) {
      setSelectedSubtopic('');
      setSelectedOutcome('');
    }
  }, [filteredSubtopics, selectedSubtopic]);

  useEffect(() => {
    if (selectedOutcome && !filteredOutcomes.includes(selectedOutcome)) {
      setSelectedOutcome('');
    }
  }, [filteredOutcomes, selectedOutcome]);

  const handleGenerate = async () => {
    if (!detectedWeekDetails.isValid || detectedWeek === null) {
      showToast(detectedWeekDetails.error || "The instructional week could not be determined for this date.", "error");
      return;
    }

    if (!selectedTopic || !selectedOutcome) {
      showToast("Please select a topic and learning outcome first.", "error");
      return;
    }

    const targetWeek = detectedWeekDetails.week;
    const targetCycle = detectedWeekDetails.cycle;
    const targetAcademicYear = detectedWeekDetails.academicYear;

    // MANDATORY PRE-GENERATION VALIDATION:
    // Verify that the selected topic belongs to the approved curriculum for the detected week
    const validation = validateTopicInContext(curriculum, {
      academicYear: targetAcademicYear,
      className: selectedGrade,
      subject: selectedSubject,
      cycle: targetCycle,
      week: targetWeek,
      pacingMaps: cyclePacingMaps,
      topic: selectedTopic
    });

    if (!validation.valid) {
      showToast(validation.reason || "This topic is not scheduled for the detected instructional week.", "error");
      return;
    }

    setIsGenerating(true);
    // Guarantee clean isolation: reset previous generated plans immediately
    setGeneratedPlan(null);
    setGeneratedWeeklyPlan(null);
    setGeneratedLAWeeklyPlan(null);

    // Build and validate clean generation context
    const cleanContext = buildCleanGenerationContext({
      academicYear: targetAcademicYear,
      grade: selectedGrade,
      subject: selectedSubject,
      cycle: targetCycle,
      topic: selectedTopic,
      subtopic: selectedSubtopic,
      learningOutcome: selectedOutcome,
      curriculum
    });

    const preVal = validatePreGenerationContext(cleanContext);
    if (!preVal.valid) {
      showToast(`Pre-generation validation error: ${preVal.errors[0]}`, "error");
      setIsGenerating(false);
      return;
    }

    try {
      if (isWeeklyPlanMode) {
        const weeklyPlan = await generateWeeklyLessonPlan({
          academicYear: targetAcademicYear,
          grade: selectedGrade,
          subject: selectedSubject,
          topic: selectedTopic,
          cycle: targetCycle,
          week: targetWeek,
          teachingModel,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          calendarDays: activeCalendar?.days
        });

        // Validate generated plan against curriculum integrity
        const weeklyIntegrity = validateGeneratedLesson(weeklyPlan, curriculum, {
          academicYear: targetAcademicYear,
          className: selectedGrade,
          subject: selectedSubject,
          cycle: targetCycle,
          week: targetWeek,
          pacingMaps: cyclePacingMaps,
          topic: selectedTopic
        });

        if (!weeklyIntegrity.valid) {
          showToast(`Generation rejected: ${weeklyIntegrity.reason}`, "error");
          return;
        }

        setGeneratedWeeklyPlan({
          ...weeklyPlan,
          academicYear: targetAcademicYear,
          schoolYear: targetAcademicYear,
          grade: selectedGrade,
          subject: selectedSubject,
          cycle: targetCycle,
          week_number: targetWeek
        } as any);
      } else if (isLAWeeklyMode && selectedSubject === 'Language Arts') {
        const plan = await generateLanguageArtsWeeklyPlan({
          academicYear: targetAcademicYear,
          grade: selectedGrade,
          cycle: targetCycle,
          week: targetWeek,
          topic: selectedTopic,
          learningOutcomes: [selectedOutcome],
          structure: laWeeklyStructure,
          calendarDays: activeCalendar?.days
        });

        const laIntegrity = validateGeneratedLesson(plan, curriculum, {
          academicYear: targetAcademicYear,
          className: selectedGrade,
          subject: selectedSubject,
          cycle: targetCycle,
          week: targetWeek,
          pacingMaps: cyclePacingMaps,
          topic: selectedTopic
        });

        if (!laIntegrity.valid) {
          showToast(`Generation rejected: ${laIntegrity.reason}`, "error");
          return;
        }

        setGeneratedLAWeeklyPlan({
          ...plan,
          academicYear: targetAcademicYear,
          schoolYear: targetAcademicYear,
          grade: selectedGrade,
          subject: 'Language Arts',
          cycle: targetCycle,
          week: targetWeek,
          structure: laWeeklyStructure,
          createdAt: new Date().toISOString(),
          createdBy: ''
        });
      } else if (selectedSubject === 'Language Arts') {
        const componentsToUse = autoSelectLAComponents || selectedLAComponents.length !== 2
          ? undefined
          : (selectedLAComponents as [LanguageArtsComponent, LanguageArtsComponent]);

        const plan = await generateLanguageArtsDailyPlan({
          academicYear: selectedAcademicYear,
          grade: selectedGrade,
          cycle: selectedCycle,
          week: targetWeek,
          day: selectedDayInfo?.dayNumber || 1, 
          date: selectedDate,
          topic: selectedTopic,
          subtopic: selectedSubtopic,
          lessonTitle: selectedTopic, 
          learningOutcome: selectedOutcome,
          objectives: [selectedOutcome], 
          duration: '90 minutes', 
          teachingModel,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          calendarDays: activeCalendar?.days,
          components: componentsToUse
        });

        // Validate generated lesson against curriculum integrity
        const lessonIntegrity = validateGeneratedLesson(plan, curriculum, {
          academicYear: selectedAcademicYear,
          className: selectedGrade,
          subject: selectedSubject,
          cycle: selectedCycle,
          week: targetWeek,
          pacingMaps: cyclePacingMaps,
          topic: selectedTopic,
          subtopic: selectedSubtopic
        });

        if (!lessonIntegrity.valid) {
          showToast(`Generation rejected: ${lessonIntegrity.reason}`, "error");
          return;
        }

        const laPlanWithContext = {
          ...plan,
          structured_json: plan,
          academicYear: selectedAcademicYear,
          schoolYear: selectedAcademicYear,
          grade: selectedGrade,
          subject: 'Language Arts',
          cycle: selectedCycle,
          week: targetWeek,
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
          isReadyToTeach: plan.languageArtsAlignmentAudit ? plan.languageArtsAlignmentAudit.isReadyToTeach : (plan.isReadyToTeach ?? true),
          powerpointPresentation: buildDeterministicPowerPoint({
            ...plan,
            subject: 'Language Arts',
            grade: selectedGrade,
            topic: selectedTopic,
            subtopic: selectedSubtopic,
            learningOutcome: selectedOutcome
          })
        };

        setGeneratedPlan(laPlanWithContext);

        generatePowerPoint(laPlanWithContext).then((aiPres) => {
          if (aiPres && Array.isArray(aiPres.slides) && aiPres.slides.length >= 6) {
            setGeneratedPlan(prev => prev ? { ...prev, powerpointPresentation: aiPres } : null);
          }
        }).catch(err => console.warn('Background AI PowerPoint generation notice:', err));
      } else {
        const plan = await generateLessonPlan({
          academicYear: cleanContext.academicYear,
          grade: cleanContext.classLevel,
          subject: cleanContext.subject,
          cycle: cleanContext.cycle,
          week: targetWeek,
          day: selectedDayInfo?.dayNumber || 1, 
          date: selectedDate,
          topic: cleanContext.topic,
          subtopic: cleanContext.subtopic,
          lessonTitle: selectedTopic || cleanContext.topic, 
          learningOutcome: cleanContext.learningOutcome,
          objectives: [cleanContext.learningOutcome], 
          duration: cleanContext.duration, 
          teachingModel,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          calendarDays: activeCalendar?.days
        });

        // Validate generated lesson against curriculum integrity and quality report
        const qualityReport = validateGeneratedLessonQuality(plan, cleanContext);
        if (!qualityReport.valid) {
          console.warn('[Quality Gate] Post-generation validation notes:', qualityReport.errors);
        }

        const lessonIntegrity = validateGeneratedLesson(plan, curriculum, {
          academicYear: cleanContext.academicYear,
          className: cleanContext.classLevel,
          subject: cleanContext.subject,
          cycle: cleanContext.cycle,
          week: targetWeek,
          pacingMaps: cyclePacingMaps,
          topic: cleanContext.topic,
          subtopic: cleanContext.subtopic
        });

        if (!lessonIntegrity.valid) {
          showToast(`Generation rejected: ${lessonIntegrity.reason}`, "error");
          return;
        }

        const standardPlanWithContext = {
          ...plan,
          structured_json: plan,
          academicYear: cleanContext.academicYear,
          schoolYear: cleanContext.academicYear,
          grade: cleanContext.classLevel,
          subject: cleanContext.subject,
          cycle: cleanContext.cycle,
          week: targetWeek,
          date: selectedDate,
          topic: cleanContext.topic,
          subtopic: cleanContext.subtopic,
          curriculumCode: cleanContext.curriculumCode,
          learningOutcome: cleanContext.learningOutcome,
          style: outputStyle,
          includeTeacherScript: userSettings.aiQuality.includeTeacherScript,
          includeDifferentiation: userSettings.aiQuality.includeDifferentiation,
          createdAt: new Date().toISOString(),
          createdBy: '', 
          status: 'Planned',
          isReadyToTeach: !!(plan.videoAssistant && plan.inDepthVisuals && plan.boardVisualPlan && plan.exactMaterials),
          powerpointPresentation: buildDeterministicPowerPoint({
            ...plan,
            subject: cleanContext.subject,
            grade: cleanContext.classLevel,
            topic: cleanContext.topic,
            subtopic: cleanContext.subtopic,
            learningOutcome: cleanContext.learningOutcome
          })
        };

        setGeneratedPlan(standardPlanWithContext);

        generatePowerPoint(standardPlanWithContext).then((aiPres) => {
          if (aiPres && Array.isArray(aiPres.slides) && aiPres.slides.length >= 6) {
            setGeneratedPlan(prev => prev ? { ...prev, powerpointPresentation: aiPres } : null);
          }
        }).catch(err => console.warn('Background AI PowerPoint generation notice:', err));
      }
    } catch (err: any) {
      let friendlyMsg = err?.message || "Failed to generate lesson plan. Please try again.";
      try {
        if (typeof friendlyMsg === 'string' && friendlyMsg.trim().startsWith('{')) {
          const parsed = JSON.parse(friendlyMsg);
          if (parsed?.error?.message) {
            friendlyMsg = parsed.error.message;
          }
        }
      } catch (e) {
        // ignore
      }
      console.warn("Lesson plan generation notification:", friendlyMsg);
      showToast(friendlyMsg, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async (instruction: string) => {
    if (!generatedPlan) return;
    setIsImproving(true);
    try {
      const improved = await improveContent(generatedPlan.content, instruction, generatedPlan);
      setGeneratedPlan(prev => {
        if (!prev) return null;
        const updated = { ...prev, content: improved };
        // Automatically rebuild PowerPoint when lesson is updated
        updated.powerpointPresentation = buildDeterministicPowerPoint(updated);
        return updated;
      });
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
                <p className="text-gray-500">Select curriculum outcomes to generate an AI-powered teach-ready lesson plan.</p>
              </div>
              <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2">
                <CalendarDays className="w-3 h-3 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">{selectedAcademicYear}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Academic Year</label>
                <Select 
                  options={[
                    { label: '2026-2027 (Current)', value: '2026-2027' },
                    { label: '2025-2026', value: '2025-2026' }
                  ]} 
                  value={selectedAcademicYear} 
                  onChange={(val) => setSelectedAcademicYear(val)} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class / Standard</label>
                <Select 
                  disabled={!!activeClass}
                  options={[
                    { label: 'Infant 1', value: 'Infant 1' },
                    { label: 'Infant 2', value: 'Infant 2' },
                    { label: 'Infant 3', value: 'Infant 3' },
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

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instructional Cycle & Week</label>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto-Detected from Date
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Curriculum Cycle</label>
                    <Select 
                      options={[
                        { label: 'Cycle 1', value: 1 },
                        { label: 'Cycle 2', value: 2 },
                        { label: 'Cycle 3', value: 3 },
                        { label: 'Cycle 4', value: 4 }
                      ]} 
                      value={selectedCycle} 
                      onChange={(val) => handleCycleChange(Number(val))} 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Instructional Week</label>
                    <div className={cn(
                      "flex items-center justify-between px-3.5 py-2 rounded-lg border text-sm font-semibold transition-colors min-h-[42px]",
                      detectedWeekDetails.isValid
                        ? "bg-slate-50 border-slate-200 text-slate-900"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    )}>
                      <div className="flex items-center gap-2">
                        <Clock className={cn("w-4 h-4", detectedWeekDetails.isValid ? "text-indigo-600" : "text-rose-500")} />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs sm:text-sm">
                            {detectedWeekDetails.isValid ? detectedWeekDetails.fullLabel : 'Undetermined Week'}
                          </span>
                          {detectedWeekDetails.isValid && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              Cycle {detectedWeekDetails.cycle} • {selectedAcademicYear}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                        !detectedWeekDetails.isValid
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : detectedWeekDetails.isPastWeek
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : detectedWeekDetails.isCurrentWeek
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-100"
                      )}>
                        {!detectedWeekDetails.isValid ? 'Non-Instructional' : detectedWeekDetails.statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-gray-50">
              {detectedWeekDetails.isValid && detectedWeekDetails.isPastWeek && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3 shadow-xs">
                  <History className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                        Historical Lesson Planning
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                        {detectedWeekDetails.fullLabel}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      You are planning or regenerating a lesson for a previous week. Curriculum topics, subtopics, and outcomes below are strictly scoped to {detectedWeekDetails.fullLabel} (Cycle {detectedWeekDetails.cycle}).
                    </p>
                  </div>
                </div>
              )}

              {activeWeekData && filteredTopics.includes(activeWeekData.topic) && (
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Pacing Map Context
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                      Cycle {selectedCycle} • Week {detectedWeek ?? 1}
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

              {!detectedWeekDetails.isValid ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Date Outside Curriculum Calendar</h4>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      {detectedWeekDetails.error || "The instructional week could not be determined for this date."}
                    </p>
                  </div>
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">No Scheduled Topics</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      No approved topics are scheduled for {detectedWeekDetails.fullLabel} in {selectedSubject}.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Topic</label>
                  {isFilteringTopics && (
                    <span className="text-[10px] text-indigo-600 flex items-center gap-1 font-semibold">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Retrieving approved topics...
                    </span>
                  )}
                </div>
                <Select 
                  disabled={filteredTopics.length === 0 || !detectedWeekDetails.isValid}
                  options={filteredTopics.map(t => ({ label: t, value: t }))} 
                  value={selectedTopic} 
                  onChange={(val) => setSelectedTopic(val)} 
                  placeholder={
                    !detectedWeekDetails.isValid
                      ? (detectedWeekDetails.error || "The instructional week could not be determined for this date.")
                      : filteredTopics.length > 0 
                        ? `Select an approved topic for ${detectedWeekDetails.fullLabel}...` 
                        : `No approved topics scheduled for ${detectedWeekDetails.fullLabel}.`
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subtopic</label>
                <Select 
                  disabled={!selectedTopic || filteredSubtopics.length === 0}
                  options={filteredSubtopics.map(t => ({ label: t, value: t }))} 
                  value={selectedSubtopic} 
                  onChange={(val) => setSelectedSubtopic(val)} 
                  placeholder={selectedTopic ? (filteredSubtopics.length > 0 ? "Select a subtopic..." : "No subtopics found") : "Select a topic first"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Learning Outcome</label>
                <Select 
                  disabled={!selectedTopic || filteredOutcomes.length === 0}
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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsTestGeneratorOpen(true)}
                      className="text-[10px] h-7 font-bold text-indigo-700 bg-white border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Weekly Test
                    </Button>
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
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsTestGeneratorOpen(true)}
                        className="text-[10px] h-7 font-bold text-amber-800 bg-white border-amber-300 hover:bg-amber-100 flex items-center gap-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Weekly Test
                      </Button>
                      <Button 
                        variant={isLAWeeklyMode ? "primary" : "outline"} 
                        size="sm" 
                        onClick={() => setIsLAWeeklyMode(!isLAWeeklyMode)}
                        className="text-[10px] h-7"
                      >
                        {isLAWeeklyMode ? "Enabled" : "Enable Mode"}
                      </Button>
                    </div>
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

              {selectedSubject === 'Language Arts' && !isLAWeeklyMode && !isWeeklyPlanMode && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">Daily Language Arts Components</h4>
                        <p className="text-[11px] text-emerald-700 font-medium">Belize Rule: Exactly 2 components per daily lesson</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAutoSelectLAComponents(!autoSelectLAComponents)}
                      className="text-[10px] h-7 bg-white font-semibold border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                    >
                      {autoSelectLAComponents ? "Auto-Pair: ON" : "Custom: 2 Selected"}
                    </Button>
                  </div>

                  {autoSelectLAComponents ? (
                    <div className="p-3 bg-white/90 rounded-lg border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                      <span className="font-bold text-emerald-950">Pedagogical Auto-Pairing Active:</span> The system selects the ideal 2-component pair (e.g. Comprehension + Writing or Phonics + High Frequency Words) aligned with your topic and lesson day.
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                        <span>Select exactly 2 components:</span>
                        <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-bold">
                          {selectedLAComponents.length}/2 Selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {LANGUAGE_ARTS_5_COMPONENTS.map(comp => {
                          const isSelected = selectedLAComponents.includes(comp);
                          return (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (selectedLAComponents.length > 1) {
                                    setSelectedLAComponents(selectedLAComponents.filter(c => c !== comp));
                                  }
                                } else {
                                  if (selectedLAComponents.length < 2) {
                                    setSelectedLAComponents([...selectedLAComponents, comp]);
                                  } else {
                                    // Replace second component
                                    setSelectedLAComponents([selectedLAComponents[0], comp]);
                                  }
                                }
                              }}
                              className={`text-left text-xs p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold shadow-xs' 
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50/50'
                              }`}
                            >
                              <span>{comp}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                  Selected
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleGenerate} isLoading={isGenerating} size="lg" className="w-full py-6 text-lg">
                <Sparkles className="w-5 h-5" />
                {isWeeklyPlanMode ? "Generate Weekly Plan" : isLAWeeklyMode && selectedSubject === 'Language Arts' ? "Generate Weekly LA Plan" : "Generate Lesson Plan"}
              </Button>

              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsTestGeneratorOpen(true)} 
                className="w-full py-3.5 text-sm font-bold border-2 border-indigo-200 text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 flex items-center justify-center gap-2 rounded-xl transition-all"
              >
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Generate Weekly Test (Cycle {selectedCycle} • Week {detectedWeek ?? 1})
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
        <div className="space-y-6 w-full min-w-0">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => { setGeneratedPlan(null); setGeneratedLAWeeklyPlan(null); setGeneratedWeeklyPlan(null); }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Planner
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                onClick={() => setIsTestGeneratorOpen(true)}
                className="font-bold text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Generate Weekly Test
              </Button>
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
              onGenerateFullPack={onGenerateFullPack}
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

      <WeeklyTestGeneratorModal
        isOpen={isTestGeneratorOpen}
        onClose={() => setIsTestGeneratorOpen(false)}
        initialContext={{
          grade: selectedGrade,
          subject: selectedSubject,
          academicYear: selectedAcademicYear,
          cycle: selectedCycle,
          week: detectedWeek ?? 1,
          activeWeeklyPlan: generatedWeeklyPlan || generatedLAWeeklyPlan
        }}
        plans={plans}
        weeklyPlans={weeklyPlans}
        laWeeklyPlans={laWeeklyPlans}
        dailyLessonPlans={dailyLessonPlans}
        curriculum={curriculum}
        schoolName={userSettings.schoolName}
      />
    </div>
  );
}
