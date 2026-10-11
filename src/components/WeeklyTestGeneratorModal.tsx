import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Printer, 
  FileText, 
  Download, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Plus, 
  Copy, 
  Sliders, 
  BookOpen, 
  Award, 
  Clock, 
  Check, 
  Layers, 
  Eye, 
  Edit3, 
  ShieldCheck,
  HelpCircle,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';
import { Button, Card, Input, Select } from './ui';
import { 
  GradeLevel, 
  Subject, 
  CurriculumEntry, 
  LessonPlan, 
  WeeklyCurriculumPlan, 
  DailyLessonPlan, 
  LanguageArtsWeeklyPlan,
  WeeklyLessonPlan,
  WeeklyTest,
  TestQuestion,
  TestQuestionType,
  SpecificQuestionType,
  TestDifficulty,
  WeeklyTestCoverageMap,
  WeeklyTestSettings
} from '../types';
import { 
  buildWeeklyCoverageMap, 
  buildDeterministicTestQuestions, 
  generateWeeklyTestWithAI,
  adjustQuestionCount, 
  regenerateSingleQuestion, 
  validateWeeklyTestQuality,
  TestQualityCheckReport 
} from '../lib/weeklyTestService';
import { generateScienceWeeklyTest } from '../lib/scienceWeeklyTestEngine';
import { generateInstructionalVisual } from '../lib/weeklyTestVisuals';
import { 
  normalizeGrade, 
  normalizeSubject, 
  normalizeCycle, 
  normalizeAcademicYear 
} from '../services/curriculumFilterService';
import { 
  exportWeeklyTestToWord, 
  printWeeklyTest, 
  exportWeeklyTestToText, 
  saveWeeklyTestToStorage 
} from '../lib/weeklyTestExport';
import { useToasts } from '../context/ToastContext';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

interface WeeklyTestGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: {
    grade?: GradeLevel;
    subject?: Subject;
    academicYear?: string;
    cycle?: number;
    week?: number;
    activeWeeklyPlan?: WeeklyLessonPlan | LanguageArtsWeeklyPlan | null;
  };
  plans?: LessonPlan[];
  weeklyPlans?: WeeklyCurriculumPlan[];
  laWeeklyPlans?: LanguageArtsWeeklyPlan[];
  dailyLessonPlans?: DailyLessonPlan[];
  curriculum?: CurriculumEntry[];
  schoolName?: string;
}

export function WeeklyTestGeneratorModal({
  isOpen,
  onClose,
  initialContext,
  plans = [],
  weeklyPlans = [],
  laWeeklyPlans = [],
  dailyLessonPlans = [],
  curriculum = [],
  schoolName = 'SAN JUAN BOSCO R.C. SCHOOL'
}: WeeklyTestGeneratorModalProps) {
  const { showToast } = useToasts();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'blueprint' | 'student-test' | 'teacher-key' | 'editor' | 'quality'>('blueprint');

  // Context state
  const [grade, setGrade] = useState<GradeLevel>(initialContext?.grade || 'Standard 4');
  const [subject, setSubject] = useState<Subject>(initialContext?.subject || 'Mathematics');
  const [academicYear, setAcademicYear] = useState<string>(initialContext?.academicYear || '2026-2027');
  const [cycle, setCycle] = useState<number>(initialContext?.cycle || 1);
  const [week, setWeek] = useState<number>(initialContext?.week || 1);

  // Synchronize when initialContext updates
  useEffect(() => {
    if (initialContext) {
      if (initialContext.grade) setGrade(initialContext.grade);
      if (initialContext.subject) setSubject(initialContext.subject);
      if (initialContext.academicYear) setAcademicYear(initialContext.academicYear);
      if (initialContext.cycle !== undefined) setCycle(initialContext.cycle);
      if (initialContext.week !== undefined) setWeek(initialContext.week);
    }
  }, [initialContext]);

  // Test Settings State
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<TestQuestionType>('Mixed Question Types');
  const [difficulty, setDifficulty] = useState<TestDifficulty>('Mixed');
  const [timeAllowed, setTimeAllowed] = useState<string>('45 minutes');
  const [teacherName, setTeacherName] = useState<string>(auth.currentUser?.displayName || 'Classroom Teacher');
  const [instructions, setInstructions] = useState<string>(
    'Read each question carefully before answering. Write all answers clearly in the spaces provided. Show all intermediate working where applicable.'
  );
  const [includeVisuals, setIncludeVisuals] = useState<boolean>(true);

  // Generated Test State
  const [generatedTest, setGeneratedTest] = useState<WeeklyTest | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [useAiEngine, setUseAiEngine] = useState<boolean>(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Determine available weeks for the selected (grade, subject, academicYear, cycle)
  const availableWeeks = useMemo<{ weekNumber: number; lessonCount: number; label: string }[]>(() => {
    const targetGrade = normalizeGrade(grade);
    const targetSubject = normalizeSubject(subject);
    const targetCycle = normalizeCycle(cycle);
    const targetYear = normalizeAcademicYear(academicYear);

    const weekCounts = new Map<number, number>();

    const checkMatch = (itemGrade?: string, itemSubject?: string, itemCycle?: number, itemWeek?: number, itemYear?: string) => {
      if (!itemGrade || !itemSubject || itemCycle === undefined || itemWeek === undefined) return;
      if (normalizeGrade(itemGrade) !== targetGrade) return;
      if (normalizeSubject(itemSubject) !== targetSubject) return;
      if (normalizeCycle(itemCycle) !== targetCycle) return;
      if (itemYear && normalizeAcademicYear(itemYear) !== targetYear) return;
      const wNum = Number(itemWeek);
      if (wNum > 0 && !isNaN(wNum)) {
        weekCounts.set(wNum, (weekCounts.get(wNum) || 0) + 1);
      }
    };

    // 1. activeWeeklyPlan
    if (initialContext?.activeWeeklyPlan) {
      const act = initialContext.activeWeeklyPlan as any;
      const actWeekNum = act.week_number || act.week?.week_number || act.week?.week || act.week;
      const actGrade = act.week?.grade || act.grade;
      const actSubj = act.week?.subject || act.subject || (act.strands ? 'Language Arts' : undefined);
      const actCycle = act.week?.cycle || act.cycle;
      const actYear = act.academicYear || act.week?.academicYear;
      checkMatch(actGrade, actSubj, actCycle, actWeekNum, actYear);
    }

    // 2. plans
    plans.forEach(p => checkMatch(p.grade, p.subject, p.cycle, p.week, p.academicYear || (p as any).schoolYear));

    // 3. weeklyPlans
    weeklyPlans.forEach(wp => checkMatch(wp.grade_level || wp.grade, wp.subject, wp.cycle, wp.week_number, wp.academicYear || wp.schoolYear));

    // 4. laWeeklyPlans
    laWeeklyPlans.forEach(law => checkMatch(law.grade, law.subject || 'Language Arts', law.cycle, law.week, (law as any).academicYear));

    // 5. dailyLessonPlans
    dailyLessonPlans.forEach(dlp => {
      const dlpCycle = (dlp as any).cycle || dlp.structured_json?.cycle || (dlp.structured_json as any)?.week?.cycle;
      const dlpWeek = (dlp as any).week || dlp.structured_json?.week || (dlp.structured_json as any)?.week?.week_number;
      const dlpYear = (dlp as any).academicYear || dlp.structured_json?.academicYear;
      checkMatch(dlp.grade, dlp.subject, dlpCycle, dlpWeek, dlpYear);
    });

    // 6. curriculum
    curriculum.forEach(c => checkMatch(c.grade, c.subject, c.cycle, c.week, (c as any).academicYear));

    // If matches exist in saved plans/curriculum, return them sorted
    const foundWeeks = Array.from(weekCounts.keys()).sort((a, b) => a - b);
    if (foundWeeks.length > 0) {
      return foundWeeks.map(w => ({
        weekNumber: w,
        lessonCount: weekCounts.get(w) || 0,
        label: `Week ${w} (${weekCounts.get(w)} plan${weekCounts.get(w) === 1 ? '' : 's'})`
      }));
    }

    // Default fallback to 10 standard instructional weeks
    return Array.from({ length: 10 }, (_, i) => ({
      weekNumber: i + 1,
      lessonCount: 0,
      label: `Week ${i + 1}`
    }));
  }, [grade, subject, academicYear, cycle, plans, weeklyPlans, laWeeklyPlans, dailyLessonPlans, curriculum, initialContext?.activeWeeklyPlan]);

  // Keep selected week valid within availableWeeks
  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.some(w => w.weekNumber === week)) {
      setWeek(availableWeeks[0].weekNumber);
    }
  }, [availableWeeks, week]);

  // 1. Build Coverage Map strictly isolated to this exact context
  const coverageMap = useMemo<WeeklyTestCoverageMap>(() => {
    return buildWeeklyCoverageMap({
      classLevel: grade,
      subject,
      academicYear,
      cycle,
      week,
      plans,
      weeklyPlans,
      laWeeklyPlans,
      dailyLessonPlans,
      curriculum,
      activeWeeklyPlan: initialContext?.activeWeeklyPlan
    });
  }, [grade, subject, academicYear, cycle, week, plans, weeklyPlans, laWeeklyPlans, dailyLessonPlans, curriculum, initialContext?.activeWeeklyPlan]);

  // Quality check report
  const qualityReport: TestQualityCheckReport | null = useMemo(() => {
    if (!generatedTest) return null;
    return validateWeeklyTestQuality(generatedTest);
  }, [generatedTest]);

  // Handle generation of new test
  const handleGenerateTest = async () => {
    if (questionCount <= 0) {
      showToast('Please enter a valid number of questions (1 or more).', 'error');
      return;
    }

    setIsGenerating(true);

    const settings: WeeklyTestSettings = {
      questionCount,
      questionTypes: questionType,
      difficulty,
      timeAllowed,
      totalMarks: questionCount,
      instructions,
      randomizeQuestions: false,
      randomizeAnswerChoices: false,
      includeAnswerKey: true,
      includeVisuals
    };

    try {
      if (useAiEngine) {
        setGenerationStage('Extracting weekly lesson content and instructional notes...');
        await new Promise(r => setTimeout(r, 200));
        setGenerationStage('Generating student-friendly questions with Gemini AI...');
        const { test: aiTest } = await generateWeeklyTestWithAI(coverageMap, settings);
        aiTest.schoolName = schoolName;
        aiTest.teacherName = teacherName;
        setGeneratedTest(aiTest);
        setActiveTab('student-test');
        showToast(`Generated ${aiTest.questions.length} questions strictly grounded in Week ${week}'s lessons!`, 'success');
      } else {
        setGenerationStage('Building curriculum-grounded assessment...');
        const isScience = normalizeSubject(subject) === 'Science and Technology' || subject.includes('Science');

        if (isScience) {
          const { test: sciTest } = generateScienceWeeklyTest(coverageMap, settings);
          sciTest.schoolName = schoolName;
          sciTest.teacherName = teacherName;
          setGeneratedTest(sciTest);
          setActiveTab('student-test');
          showToast(`Generated print-ready Science test with ${sciTest.questions.length} curriculum-grounded questions!`, 'success');
          return;
        }

        const questions = buildDeterministicTestQuestions(coverageMap, settings);
        const calculatedTotalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0);

        const newTest: WeeklyTest = {
          id: `test-${grade.replace(/\s+/g, '_')}-${subject.replace(/\s+/g, '_')}-c${cycle}-w${week}-${Date.now()}`,
          schoolName,
          classLevel: grade,
          subject,
          academicYear,
          cycle,
          week,
          testTitle: `${grade} ${subject} — Cycle ${cycle} Week ${week} Assessment`,
          date: new Date().toISOString().split('T')[0],
          teacherName,
          timeAllowed,
          totalMarks: calculatedTotalMarks,
          instructions,
          questionCount: questions.length,
          questionTypeSelection: questionType,
          difficulty,
          randomizeQuestions: false,
          randomizeAnswerChoices: false,
          includeAnswerKey: true,
          weeklyTopic: coverageMap.lessonTopics[0] || `${subject} Core Concepts`,
          weeklySubtopics: coverageMap.subtopics,
          weeklyOutcomes: coverageMap.learningOutcomes,
          coverageSummary: {
            lessonTopics: coverageMap.lessonTopics,
            outcomesCovered: coverageMap.learningOutcomes,
            competenciesCovered: coverageMap.competencies
          },
          questions,
          createdAt: new Date().toISOString()
        };

        setGeneratedTest(newTest);
        setActiveTab('student-test');
        showToast(`Generated print-ready test with ${questions.length} curriculum-grounded questions!`, 'success');
      }
    } catch (err: any) {
      console.error('Test generation error:', err);
      const isScience = normalizeSubject(subject) === 'Science and Technology' || subject.includes('Science');
      if (isScience) {
        const { test: sciTest } = generateScienceWeeklyTest(coverageMap, settings);
        sciTest.schoolName = schoolName;
        sciTest.teacherName = teacherName;
        setGeneratedTest(sciTest);
        setActiveTab('student-test');
        showToast(`Generated print-ready Science test with ${sciTest.questions.length} curriculum-grounded questions!`, 'success');
        return;
      }
      // Fallback to grounded questions
      const questions = buildDeterministicTestQuestions(coverageMap, settings);
      const calculatedTotalMarks = questions.reduce((acc, q) => acc + (q.marks || 1), 0);
      const fallbackTest: WeeklyTest = {
        id: `test-${grade.replace(/\s+/g, '_')}-${subject.replace(/\s+/g, '_')}-c${cycle}-w${week}-${Date.now()}`,
        schoolName,
        classLevel: grade,
        subject,
        academicYear,
        cycle,
        week,
        testTitle: `${grade} ${subject} — Cycle ${cycle} Week ${week} Assessment`,
        date: new Date().toISOString().split('T')[0],
        teacherName,
        timeAllowed,
        totalMarks: calculatedTotalMarks,
        instructions,
        questionCount: questions.length,
        questionTypeSelection: questionType,
        difficulty,
        randomizeQuestions: false,
        randomizeAnswerChoices: false,
        includeAnswerKey: true,
        weeklyTopic: coverageMap.lessonTopics[0] || `${subject} Core Concepts`,
        weeklySubtopics: coverageMap.subtopics,
        weeklyOutcomes: coverageMap.learningOutcomes,
        coverageSummary: {
          lessonTopics: coverageMap.lessonTopics,
          outcomesCovered: coverageMap.learningOutcomes,
          competenciesCovered: coverageMap.competencies
        },
        questions,
        createdAt: new Date().toISOString()
      };
      setGeneratedTest(fallbackTest);
      setActiveTab('student-test');
      showToast('Generated questions using curriculum-grounded engine.', 'info');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Handle intelligent count adjustment while preserving existing questions
  const handleQuestionCountChange = (newCount: number) => {
    setQuestionCount(newCount);
    if (generatedTest && newCount > 0) {
      const settings: WeeklyTestSettings = {
        questionCount: newCount,
        questionTypes: questionType,
        difficulty,
        timeAllowed,
        totalMarks: newCount,
        instructions,
        randomizeQuestions: false,
        randomizeAnswerChoices: false,
        includeAnswerKey: true,
        includeVisuals
      };

      const adjusted = adjustQuestionCount(generatedTest.questions, newCount, coverageMap, settings);
      const newTotalMarks = adjusted.reduce((acc, q) => acc + (q.marks || 1), 0);

      setGeneratedTest({
        ...generatedTest,
        questionCount: adjusted.length,
        totalMarks: newTotalMarks,
        questions: adjusted
      });
      showToast(`Adjusted test to ${adjusted.length} questions (existing questions preserved).`, 'info');
    }
  };

  // Handle single question regeneration
  const handleRegenerateQuestion = (questionNumber: number) => {
    if (!generatedTest) return;
    const settings: WeeklyTestSettings = {
      questionCount: generatedTest.questions.length,
      questionTypes: questionType,
      difficulty,
      timeAllowed,
      totalMarks: generatedTest.totalMarks,
      instructions,
      randomizeQuestions: false,
      randomizeAnswerChoices: false,
      includeAnswerKey: true,
      includeVisuals
    };

    const updated = regenerateSingleQuestion(generatedTest.questions, questionNumber, coverageMap, settings);
    const newTotalMarks = updated.reduce((acc, q) => acc + (q.marks || 1), 0);

    setGeneratedTest({
      ...generatedTest,
      totalMarks: newTotalMarks,
      questions: updated
    });
    showToast(`Regenerated Question ${questionNumber} while keeping other questions intact.`, 'success');
  };

  // Handle question edit
  const handleUpdateQuestion = (updatedQ: TestQuestion) => {
    if (!generatedTest) return;
    const updated = generatedTest.questions.map(q => q.id === updatedQ.id ? updatedQ : q);
    const newTotalMarks = updated.reduce((acc, q) => acc + (q.marks || 1), 0);
    setGeneratedTest({
      ...generatedTest,
      totalMarks: newTotalMarks,
      questions: updated
    });
    setEditingQuestionId(null);
    showToast(`Updated Question ${updatedQ.questionNumber}.`, 'success');
  };

  // Reorder questions
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!generatedTest) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= generatedTest.questions.length) return;

    const copy = [...generatedTest.questions];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    // Renumber sequentially 1..N
    const renumbered = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setGeneratedTest({
      ...generatedTest,
      questions: renumbered
    });
  };

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    if (!generatedTest) return;
    const copy = [...generatedTest.questions];
    copy.splice(index, 1);
    const renumbered = copy.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    const newTotalMarks = renumbered.reduce((acc, q) => acc + (q.marks || 1), 0);

    setGeneratedTest({
      ...generatedTest,
      questionCount: renumbered.length,
      totalMarks: newTotalMarks,
      questions: renumbered
    });
    setQuestionCount(renumbered.length);
    showToast(`Deleted question. Remaining: ${renumbered.length}`, 'info');
  };

  // Add new question manually
  const handleAddQuestion = () => {
    if (!generatedTest) return;
    const nextNum = generatedTest.questions.length + 1;
    const newQ: TestQuestion = {
      id: `q-custom-${Date.now()}`,
      questionNumber: nextNum,
      type: 'Short Answer',
      questionText: `Explain one key concept learned in this week's study of ${coverageMap.lessonTopics[0] || subject}.`,
      marks: 2,
      difficulty: 'Moderate',
      lessonTopicSource: coverageMap.lessonTopics[0] || `${subject} Core Concepts`,
      answerLines: 3,
      correctAnswer: 'Accept valid, accurate student explanation aligned with the lesson objectives.',
      markingGuidance: 'Award 2 marks for complete explanation, 1 mark for partial understanding.'
    };

    const updated = [...generatedTest.questions, newQ];
    const newTotalMarks = updated.reduce((acc, q) => acc + (q.marks || 1), 0);

    setGeneratedTest({
      ...generatedTest,
      questionCount: updated.length,
      totalMarks: newTotalMarks,
      questions: updated
    });
    setQuestionCount(updated.length);
    setEditingQuestionId(newQ.id);
    showToast(`Added Question ${nextNum}. Click edit to customize.`, 'success');
  };

  // Export handlers
  const handleExportWord = async (includeAnswerKey: boolean) => {
    if (!generatedTest) return;
    try {
      showToast('Generating official Word (.docx) test document...', 'info');
      await exportWeeklyTestToWord(generatedTest, includeAnswerKey);
      showToast('Test exported to Word successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export to Word document.', 'error');
    }
  };

  const handlePrint = (mode: 'student' | 'teacher' | 'rubric') => {
    if (!generatedTest) return;
    printWeeklyTest(generatedTest, mode);
  };

  const handleCopyText = (includeAnswerKey: boolean) => {
    if (!generatedTest) return;
    const text = exportWeeklyTestToText(generatedTest, includeAnswerKey);
    navigator.clipboard.writeText(text);
    showToast('Copied test text to clipboard!', 'success');
  };

  const handleSaveTest = () => {
    if (!generatedTest) return;
    saveWeeklyTestToStorage(generatedTest);
    showToast('Weekly Test saved to local storage! Accessible anytime.', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">Weekly Test Generator</h2>
                <span className="text-[10px] uppercase font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  Curriculum-Grounded
                </span>
                <span className="text-[10px] uppercase font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Strict Data Isolation
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automatically builds print-ready assessments based strictly on lessons taught during the selected week.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'blueprint' 
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              1. Blueprint & Settings
            </button>
            <button
              onClick={() => {
                if (!generatedTest) handleGenerateTest();
                setActiveTab('student-test');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'student-test' 
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              2. Student Test (Print-Ready)
            </button>
            <button
              onClick={() => {
                if (!generatedTest) handleGenerateTest();
                setActiveTab('teacher-key');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'teacher-key' 
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              3. Teacher Answer Key & Rubric
            </button>
            <button
              onClick={() => {
                if (!generatedTest) handleGenerateTest();
                setActiveTab('editor');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'editor' 
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              4. Edit & Reorder ({generatedTest?.questions.length || 0})
            </button>
            <button
              onClick={() => {
                if (!generatedTest) handleGenerateTest();
                setActiveTab('quality');
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'quality' 
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Award className="w-3.5 h-3.5" />
              5. Quality Check {qualityReport && `(${qualityReport.score}%)`}
            </button>
          </div>

          {generatedTest && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePrint('student')}
                className="text-xs h-8 bg-white border-slate-300"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print Test
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportWord(true)}
                className="text-xs h-8 bg-white border-slate-300"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Word (.docx)
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSaveTest}
                className="text-xs h-8"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Save Test
              </Button>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: BLUEPRINT & SETTINGS */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              
              {/* Context Selector Card */}
              <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      Weekly Lesson Context (Automatically Populated)
                    </h3>
                    <p className="text-xs text-slate-500">
                      The assessment blueprint automatically extracts content strictly from this week's lessons.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {coverageMap.totalLessonsFound} Lesson{coverageMap.totalLessonsFound === 1 ? '' : 's'} Detected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Class / Standard</label>
                    <Select
                      value={grade}
                      onChange={(val) => setGrade(val as GradeLevel)}
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
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Subject</label>
                    <Select
                      value={subject}
                      onChange={(val) => setSubject(val as Subject)}
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
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Academic Year</label>
                    <Select
                      value={academicYear}
                      onChange={(val) => setAcademicYear(val)}
                      options={[
                        { label: '2026-2027 (Current)', value: '2026-2027' },
                        { label: '2025-2026', value: '2025-2026' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Cycle</label>
                    <Select
                      value={cycle}
                      onChange={(val) => setCycle(Number(val))}
                      options={[
                        { label: 'Cycle 1', value: 1 },
                        { label: 'Cycle 2', value: 2 },
                        { label: 'Cycle 3', value: 3 },
                        { label: 'Cycle 4', value: 4 }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Instructional Week</label>
                    <Select
                      value={week}
                      onChange={(val) => setWeek(Number(val))}
                      options={availableWeeks.map(w => ({
                        label: w.label,
                        value: w.weekNumber
                      }))}
                    />
                  </div>
                </div>

                {/* Coverage Map Visualization */}
                <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Weekly Lesson Assessment Blueprint
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Isolated to {grade} • {subject} • Cycle {cycle} Week {week}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Topics Taught This Week:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {coverageMap.lessonTopics.map((t, idx) => (
                          <span key={idx} className="bg-white text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Subtopics & Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {coverageMap.subtopics.map((st, idx) => (
                          <span key={idx} className="bg-white text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1 text-xs">Target Learning Outcomes:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                      {coverageMap.learningOutcomes.map((lo, idx) => (
                        <li key={idx}>{lo}</li>
                      ))}
                    </ul>
                  </div>

                  {coverageMap.importantConcepts.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-1 text-xs">Key Vocabulary / Concepts:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {coverageMap.importantConcepts.slice(0, 8).map((c, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Test Parameters Card */}
              <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    Test Settings & Parameters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customize test length, question types, difficulty, and student instructions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Number of Questions: Any positive number input */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                      <span>Number of Questions</span>
                      <span className="text-indigo-600 lowercase font-medium">any whole number</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={150}
                      value={questionCount}
                      onChange={(e) => handleQuestionCountChange(Math.max(1, parseInt(e.target.value) || 1))}
                      className="font-bold text-slate-900"
                    />
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[5, 10, 15, 20, 25, 40].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => handleQuestionCountChange(cnt)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold border transition-colors",
                            questionCount === cnt
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 block">Question Types</label>
                    <Select
                      value={questionType}
                      onChange={(val) => setQuestionType(val as TestQuestionType)}
                      options={[
                        { label: 'Mixed Question Types (Balanced)', value: 'Mixed Question Types' },
                        { label: 'Multiple Choice Only', value: 'Multiple Choice' },
                        { label: 'True / False Only', value: 'True/False' },
                        { label: 'Fill in the Blank Only', value: 'Fill in the Blank' },
                        { label: 'Matching Only', value: 'Matching' },
                        { label: 'Short Answer Only', value: 'Short Answer' },
                        { label: 'Extended Response Only', value: 'Extended Response' },
                        { label: 'Problem Solving Only', value: 'Problem Solving' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 block">Difficulty Progression</label>
                    <Select
                      value={difficulty}
                      onChange={(val) => setDifficulty(val as TestDifficulty)}
                      options={[
                        { label: 'Mixed (Recall → HOTS)', value: 'Mixed' },
                        { label: 'Easy (Recall & Recognition)', value: 'Easy' },
                        { label: 'Moderate (Application & Steps)', value: 'Moderate' },
                        { label: 'Challenging (Reasoning & Analysis)', value: 'Challenging' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 block">Time Allowed</label>
                    <Input
                      value={timeAllowed}
                      onChange={(e) => setTimeAllowed(e.target.value)}
                      placeholder="e.g. 45 minutes"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 block">Teacher Name</label>
                    <Input
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Classroom Teacher"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1 block">Instructions to Students</label>
                    <Input
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Instructions text..."
                    />
                  </div>
                </div>

                {/* Generation Engine Selection */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {useAiEngine ? "Gemini AI Question Generation Engine" : "Curriculum-Grounded Engine"}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {useAiEngine 
                          ? "Generates student-friendly questions based on actual lesson notes with realistic Belizean distractors."
                          : "Generates authentic questions deterministically from extracted lesson concepts and vocabulary."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setUseAiEngine(true)}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-bold transition-all",
                        useAiEngine ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      AI Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseAiEngine(false)}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-bold transition-all",
                        !useAiEngine ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Deterministic
                    </button>
                  </div>
                </div>

                {/* Instructional Visuals & Diagrams Selection (Requirement 4) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 block">
                          Instructional Visuals & Diagrams
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {includeVisuals
                          ? "Intelligently embeds high-resolution diagrams, fraction models, circuits, maps, charts, and science processes matching the selected week's lessons."
                          : "Generates text-only assessment questions without diagrams or illustrations."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIncludeVisuals(true)}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-bold transition-all",
                        includeVisuals ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Include Visuals
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludeVisuals(false)}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-bold transition-all",
                        !includeVisuals ? "bg-slate-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Text Only
                    </button>
                  </div>
                </div>

                {/* Progress Stage Banner */}
                {isGenerating && generationStage && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2.5 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                    <span>{generationStage}</span>
                  </div>
                )}

                {/* Generate Action Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleGenerateTest}
                    isLoading={isGenerating}
                    size="lg"
                    className="w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    <Sparkles className="w-5 h-5" />
                    {generatedTest ? "Regenerate Full Weekly Test" : "Generate Print-Ready Weekly Test"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: STUDENT TEST (PRINT-READY) */}
          {activeTab === 'student-test' && generatedTest && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Test Paper View</h3>
                  <p className="text-xs text-slate-500">Formatted cleanly without answers for printing and student administration.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePrint('student')}>
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Print Student Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCopyText(false)}>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy Text
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportWord(false)}>
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Word (.docx)
                  </Button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-md space-y-6 font-sans">
                {/* School Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <h1 className="text-xl font-black text-indigo-950 uppercase tracking-tight">{schoolName}</h1>
                  <h2 className="text-base font-bold text-slate-900 uppercase">
                    {generatedTest.classLevel} {generatedTest.subject} Weekly Assessment
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Cycle {generatedTest.cycle} • Week {generatedTest.week} • Academic Year {generatedTest.academicYear} • Topic: {generatedTest.weeklyTopic}
                  </p>
                </div>

                {/* Student Info Box */}
                <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded-lg p-3 text-xs bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Student Name:</span>
                    <span className="flex-1 border-b border-dotted border-slate-400"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Date:</span>
                    <span className="flex-1 border-b border-dotted border-slate-400"></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Teacher:</span>
                    <span>{generatedTest.teacherName}</span>
                    <span className="text-slate-400">|</span>
                    <span className="font-bold text-slate-800">Time Allowed:</span>
                    <span>{generatedTest.timeAllowed}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-bold text-indigo-900 text-sm">Score:</span>
                    <span className="w-16 border-b border-dotted border-slate-400"></span>
                    <span className="font-black text-slate-900">/ {generatedTest.totalMarks} Marks</span>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="bg-slate-50 border-l-4 border-indigo-800 p-3 rounded text-xs text-slate-800">
                  <span className="font-bold uppercase text-indigo-950">Instructions: </span>
                  {generatedTest.instructions}
                </div>

                {/* Questions List */}
                <div className="space-y-6 pt-2">
                  {generatedTest.questions.map((q) => (
                    <div key={q.id} className="space-y-2 border-b border-slate-100 pb-5 last:border-none">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-sm text-slate-900">
                          Question {q.questionNumber}. <span className="text-xs font-normal text-slate-500">({q.type})</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          [{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {q.questionText}
                      </p>

                      {/* Instructional Visual / Diagram Graphic (Requirement 4) */}
                      {q.visual && q.visual.svgContent && (
                        <div className="my-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col items-center">
                          <div className="flex items-center gap-1.5 self-start mb-2 px-2 py-0.5 bg-indigo-100/70 text-indigo-800 rounded text-[11px] font-bold">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{q.visual.title || 'Instructional Diagram'}</span>
                            <span className="text-indigo-500 font-normal">({q.visual.visualQuestionType || q.visual.type})</span>
                          </div>
                          <div 
                            className="w-full max-w-md overflow-hidden flex justify-center py-1"
                            dangerouslySetInnerHTML={{ __html: q.visual.svgContent }}
                          />
                          <p className="text-[11px] text-slate-500 italic mt-1.5 text-center">
                            Figure {q.questionNumber}: {q.visual.caption || q.visual.altText}
                          </p>
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {q.type === 'Multiple Choice' && q.options && (
                        <div className="space-y-1.5 pl-4 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                              <span className="w-4 h-4 rounded-full border-2 border-slate-400 shrink-0 inline-block"></span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* True / False Response */}
                      {q.type === 'True/False' && (
                        <div className="pt-1 pl-4 text-xs font-bold text-slate-700">
                          Answer [ TRUE / FALSE ]: ____________________________________
                        </div>
                      )}

                      {/* Fill in the Blank */}
                      {q.type === 'Fill in the Blank' && (
                        <div className="pt-1 pl-4 text-xs font-bold text-slate-700">
                          Answer: __________________________________________________________________
                        </div>
                      )}

                      {/* Matching */}
                      {q.type === 'Matching' && q.matchingPairs && (
                        <div className="pt-2">
                          <table className="w-full border-collapse border border-slate-300 text-xs">
                            <tbody>
                              {q.matchingPairs.map((pair, pIdx) => (
                                <tr key={pIdx} className="border-b border-slate-200">
                                  <td className="p-2 border-r border-slate-300 font-bold text-slate-800 w-2/5">{pair.left}</td>
                                  <td className="p-2 text-slate-700">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] &nbsp; {pair.right}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Problem Solving Workspace */}
                      {q.type === 'Problem Solving' && (
                        <div className="border border-slate-300 rounded-lg p-3 h-32 relative bg-slate-50/30 mt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Workspace / Show your working:</span>
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2 text-xs font-bold text-slate-800">
                            <span>Final Answer:</span>
                            <span className="flex-1 border-b border-slate-400"></span>
                          </div>
                        </div>
                      )}

                      {/* Short Answer / Extended Response Lines */}
                      {(q.type === 'Short Answer' || q.type === 'Extended Response') && (
                        <div className="space-y-2 pt-1">
                          {Array.from({ length: q.type === 'Extended Response' ? (q.answerLines || 6) : (q.answerLines || 3) }).map((_, lineIdx) => (
                            <div key={lineIdx} className="border-b border-slate-300 h-6"></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEACHER ANSWER KEY & SOLUTIONS */}
          {activeTab === 'teacher-key' && generatedTest && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Teacher Answer Key & Marking Guide
                  </h3>
                  <p className="text-xs text-slate-500">Authoritative solutions, scoring criteria, and curricular sources for all {generatedTest.questions.length} questions.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePrint('teacher')}>
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Print Teacher Key
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrint('rubric')}>
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Print Rubric Only
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportWord(true)}>
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export with Key
                  </Button>
                </div>
              </div>

              {/* Answer Key Document */}
              <div className="bg-white p-8 sm:p-12 rounded-xl border border-emerald-200 shadow-md space-y-6">
                <div className="text-center border-b-2 border-emerald-900 pb-4 space-y-1">
                  <h1 className="text-xl font-black text-emerald-950 uppercase">{schoolName}</h1>
                  <h2 className="text-base font-bold text-slate-900 uppercase">
                    TEACHER ANSWER KEY & MARKING GUIDE
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {generatedTest.classLevel} {generatedTest.subject} • Cycle {generatedTest.cycle} Week {generatedTest.week} • Total Marks: {generatedTest.totalMarks}
                  </p>
                </div>

                <div className="space-y-4">
                  {generatedTest.questions.map((q) => (
                    <div key={q.id} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-sm text-indigo-950">
                            Question {q.questionNumber} <span className="text-xs font-normal text-slate-500">({q.type} • {q.difficulty})</span>
                          </span>
                          <p className="text-xs text-slate-700 font-medium mt-0.5">{q.questionText}</p>
                        </div>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0">
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </div>

                      {q.visual && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-emerald-100 text-xs">
                          <ImageIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">Visual Diagram: {q.visual.title || 'Instructional Diagram'}</span>
                            {q.visual.caption && (
                              <p className="text-[11px] text-slate-500 italic">{q.visual.caption}</p>
                            )}
                            {q.visual.labels && q.visual.labels.length > 0 && (
                              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                                Labeled Parts: {q.visual.labels.map(l => `${l.id}: ${l.text || l.target || ''}`).join(' | ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-emerald-100/60 space-y-1">
                        <div className="text-xs">
                          <strong className="text-emerald-900 font-bold">Authoritative Answer: </strong>
                          <span className="font-bold text-emerald-800">{q.correctAnswer}</span>
                        </div>

                        {q.markingGuidance && (
                          <div className="text-xs text-slate-700 bg-white p-2 rounded border border-emerald-100">
                            <strong className="text-indigo-900">Marking Guidance / Rubric: </strong>
                            {q.markingGuidance}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 pt-1">
                          <strong>Taught Curriculum Source:</strong> {q.lessonTopicSource}
                          {q.learningOutcomeSource && ` • ${q.learningOutcomeSource}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEACHER EDIT & REORDER */}
          {activeTab === 'editor' && generatedTest && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Teacher Editing & Question Customizer</h3>
                  <p className="text-xs text-slate-500">Edit, reorder, delete, or regenerate any question. Existing questions stay intact.</p>
                </div>
                <Button size="sm" onClick={handleAddQuestion} className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Custom Question
                </Button>
              </div>

              <div className="space-y-4">
                {generatedTest.questions.map((q, idx) => (
                  <Card key={q.id} className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">
                          {q.questionNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{q.type}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          {q.marks} mark{q.marks > 1 ? 's' : ''}
                        </span>
                        {q.visual && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Visual Diagram
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move question up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === generatedTest.questions.length - 1}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move question down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegenerateQuestion(q.questionNumber)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                          title="Regenerate only this question"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                          title="Edit question text and answers"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingQuestionId === q.id ? (
                      /* Inline Editor Form */
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Question Text</label>
                          <textarea
                            value={q.questionText}
                            onChange={(e) => {
                              const updated = { ...q, questionText: e.target.value };
                              handleUpdateQuestion(updated);
                            }}
                            rows={3}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-sans focus:outline-indigo-600"
                          />
                        </div>

                        {q.type === 'Multiple Choice' && q.options && (
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Options</label>
                            <div className="space-y-1.5">
                              {q.options.map((opt, optIdx) => (
                                <Input
                                  key={optIdx}
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...q.options!];
                                    newOpts[optIdx] = e.target.value;
                                    handleUpdateQuestion({ ...q, options: newOpts });
                                  }}
                                  className="text-xs h-8"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Correct Solution</label>
                            <Input
                              value={q.correctAnswer}
                              onChange={(e) => handleUpdateQuestion({ ...q, correctAnswer: e.target.value })}
                              className="text-xs h-8"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Marks</label>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              value={q.marks}
                              onChange={(e) => handleUpdateQuestion({ ...q, marks: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="text-xs h-8"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 block">Marking Rubric / Criteria</label>
                          <Input
                            value={q.markingGuidance || ''}
                            onChange={(e) => handleUpdateQuestion({ ...q, markingGuidance: e.target.value })}
                            className="text-xs h-8"
                          />
                        </div>

                        {/* Visual diagram attachment control in editor */}
                        <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-indigo-700 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                {q.visual ? `Attached: ${q.visual.title || 'Instructional Diagram'}` : 'No Visual Diagram Attached'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {q.visual ? (q.visual.caption || q.visual.altText) : 'Attach an instructional diagram or model to this question'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (q.visual) {
                                handleUpdateQuestion({ ...q, visual: undefined });
                              } else {
                                const generated = generateInstructionalVisual({
                                  subject: generatedTest.subject,
                                  topic: q.lessonTopicSource || generatedTest.weeklyTopic,
                                  subtopic: generatedTest.weeklySubtopics[0] || '',
                                  concepts: coverageMap.importantConcepts,
                                  outcomes: coverageMap.learningOutcomes,
                                  questionIndex: idx
                                });
                                if (generated) {
                                  handleUpdateQuestion({ ...q, visual: generated });
                                  showToast('Attached curriculum-aligned instructional visual diagram!', 'success');
                                } else {
                                  showToast('No matching diagram template found for this specific topic.', 'info');
                                }
                              }
                            }}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded font-bold transition-all border",
                              q.visual 
                                ? "bg-white text-rose-600 border-rose-200 hover:bg-rose-50" 
                                : "bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-xs"
                            )}
                          >
                            {q.visual ? 'Remove Visual' : '+ Attach Diagram'}
                          </button>
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button size="sm" onClick={() => setEditingQuestionId(null)}>
                            Done Editing
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Preview */
                      <div>
                        <p className="text-xs text-slate-800 font-medium">{q.questionText}</p>
                        {q.visual && q.visual.svgContent && (
                          <div className="my-2 p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center">
                            <div 
                              className="w-full max-w-xs overflow-hidden flex justify-center py-1"
                              dangerouslySetInnerHTML={{ __html: q.visual.svgContent }}
                            />
                            <span className="text-[10px] text-slate-500 italic mt-0.5">Figure: {q.visual.caption || q.visual.title}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                          Correct: {q.correctAnswer}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FINAL QUALITY CHECK */}
          {activeTab === 'quality' && generatedTest && qualityReport && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Comprehensive 14-Point Teacher Quality Audit
                    </h3>
                    <p className="text-xs text-slate-500">Automatic pre-print verification ensuring curriculum fidelity and zero errors.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600">{qualityReport.score}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality Score</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                  {qualityReport.summary}
                </div>

                <div className="space-y-2.5 pt-2">
                  {qualityReport.checks.map((chk, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{chk.name}</span>
                        <p className="text-xs text-slate-600">{chk.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {generatedTest ? (
              <span>
                Assessment: <strong>{generatedTest.classLevel} {generatedTest.subject}</strong> • Cycle {generatedTest.cycle} Week {generatedTest.week} • {generatedTest.questions.length} Questions ({generatedTest.totalMarks} Marks)
              </span>
            ) : (
              <span>Ready to generate weekly test from lesson plans.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {generatedTest && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExportWord(true)}
                  className="font-bold text-slate-700"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export Word
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handlePrint('student')}
                  className="font-bold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print Test
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSaveTest}
                  className="font-bold"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Test
                </Button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
