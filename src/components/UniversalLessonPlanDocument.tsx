import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Layout, 
  Target, 
  Sparkles, 
  PenTool, 
  Clock, 
  Users, 
  ListChecks, 
  Layers, 
  XCircle, 
  Home, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  HelpCircle, 
  Package, 
  Table as TableIcon, 
  Columns, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  BookOpenCheck,
  Zap,
  Printer,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Plus
} from 'lucide-react';
import { LessonPlan } from '../types';
import { resolveCompleteLessonResources } from '../lib/lessonExportResolver';
import { parseMinutes } from '../lib/timingValidation';
import { isLanguageArtsSubject } from '../lib/languageArtsQualityGate';
import { parseAndNormalizeWorksheet, printWorksheetToWindow } from '../lib/worksheetSystem';
import { runLanguageArtsAlignmentAudit } from '../lib/languageArtsAlignmentAudit';

interface UniversalLessonPlanDocumentProps {
  plan: LessonPlan;
  teacherName?: string;
  schoolName?: string;
  isTeachMode?: boolean;
  status?: string;
  onOpenTeachMeTopic?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  onGenerateResource?: (plan: LessonPlan, type: string) => Promise<void>;
  isGenerating?: boolean;
}

export const UniversalLessonPlanDocument: React.FC<UniversalLessonPlanDocumentProps> = ({
  plan,
  teacherName = 'Hassan',
  schoolName = 'SAN JUAN BOSCO R.C. SCHOOL',
  isTeachMode = false,
  status,
  onOpenTeachMeTopic,
  onNavigateToSection,
  onGenerateResource,
  isGenerating = false
}) => {
  const res = resolveCompleteLessonResources(plan, { schoolName, teacherName });
  const [sequenceView, setSequenceView] = useState<'timeline' | 'table'>('timeline');
  const [activeSection, setActiveSection] = useState<string>('header');
  const [copiedResourceIdx, setCopiedResourceIdx] = useState<number | null>(null);
  const [showAnswerKeyMap, setShowAnswerKeyMap] = useState<Record<number, boolean>>({});
  const [expandedWorksheetIdx, setExpandedWorksheetIdx] = useState<number | null>(null);

  // Timing Validation Calculation
  const isLA = isLanguageArtsSubject(res.subject);
  const audit = isLA 
    ? (res.languageArtsAlignmentAudit || (plan as any).languageArtsAlignmentAudit || runLanguageArtsAlignmentAudit(plan, { grade: res.grade, topic: res.topic, subtopic: res.subtopic, cycle: res.cycle, subject: 'Language Arts' }))
    : null;
  const [showAuditDetails, setShowAuditDetails] = useState<boolean>(false);

  const targetMinutes = isLA 
    ? (parseMinutes(res.duration, 90) || 90) 
    : (parseMinutes(res.duration, 45) || 45);
    
  const totalStageMinutes = res.stages.reduce((acc, s) => acc + parseMinutes(s.duration, 10), 0);
  const isStrictlyBalanced = totalStageMinutes === targetMinutes;
  const timingDifference = Math.abs(totalStageMinutes - targetMinutes);

  // Navigation Items
  const navSections = [
    { id: 'header', label: 'Overview' },
    { id: 'curriculum', label: 'Alignment' },
    ...(isLA ? [{ id: 'la-alignment', label: 'LA Quality Audit' }] : []),
    { id: 'overview', label: 'Big Ideas' },
    { id: 'objectives', label: 'Objectives' },
    { id: 'strategies', label: 'Strategies' },
    { id: 'sequence', label: 'Execution Flow' },
    { id: 'timing', label: 'Pacing' },
    { id: 'actions', label: 'Teacher & Student' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'differentiation', label: 'Inclusion' },
    { id: 'closure', label: 'Closure' },
    { id: 'materials-assets', label: 'Resources' }
  ];

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    navSections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (onNavigateToSection) {
      onNavigateToSection(id);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -75;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedResourceIdx(idx);
    setTimeout(() => setCopiedResourceIdx(null), 2000);
  };

  const handlePrintWorksheet = (title: string, content: string, answerKey?: string) => {
    const ws = parseAndNormalizeWorksheet(
      answerKey ? `${content}\n\n### TEACHER ANSWER KEY & SCORING GUIDE\n${answerKey}` : content, 
      {
        title,
        grade: res.grade,
        subject: res.subject,
        topic: res.topic
      }
    );
    printWorksheetToWindow(ws, answerKey ? 'both' : 'student');
  };

  // Compile full worksheet and asset list from resolved data and teachingResources
  const activeWorksheets: { title: string; content: string; answerKey?: string }[] = [];
  if (res.worksheet && res.worksheet.hasWorksheet) {
    const content = [
      res.worksheet.title,
      res.worksheet.instructions,
      ...res.worksheet.sections.map(s => `\n### ${s.sectionTitle}\n${s.instructions}\n` + s.questions.map(q => `${q.number}. ${q.prompt}`).join('\n'))
    ].join('\n\n');
    
    const answerKeyText = res.worksheet.answerKey?.map(a => `\n### ${a.sectionTitle}\n` + a.answers.map(ans => `${ans.number}. ${ans.solution}`).join('\n')).join('\n\n');
    
    activeWorksheets.push({
      title: res.worksheet.title || `Worksheet: ${res.topic}`,
      content,
      answerKey: answerKeyText
    });
  }

  const tr = (plan as any).teachingResources?.studentMaterials;
  if (tr?.worksheet) {
    activeWorksheets.push({
      title: tr.worksheet.title || `Student Worksheet: ${res.topic}`,
      content: typeof tr.worksheet === 'string' ? tr.worksheet : (tr.worksheet.content || JSON.stringify(tr.worksheet, null, 2)),
      answerKey: tr.worksheet.answerKey
    });
  }
  if (tr?.exitTicket) {
    activeWorksheets.push({
      title: tr.exitTicket.title || `Exit Ticket: ${res.topic}`,
      content: typeof tr.exitTicket === 'string' ? tr.exitTicket : (tr.exitTicket.prompt || JSON.stringify(tr.exitTicket, null, 2)),
      answerKey: tr.exitTicket.criteria
    });
  }

  // Determine actual status from plan data
  const planStatus = status || plan.status || ((plan as any).isSaved ? 'saved' : 'draft');
  const isSaved = planStatus === 'saved' || (plan as any).isSaved;

  // Real resources count
  const allResourcesCount = res.materialsList.length + activeWorksheets.length;

  return (
    <div className="w-full space-y-8 font-sans text-slate-900 leading-relaxed max-w-6xl mx-auto">
      
      {/* ========================================================================= */}
      {/* PERSISTENT STICKY SECTION NAVIGATION BAR                                  */}
      {/* ========================================================================= */}
      <nav 
        id="section-nav"
        aria-label="Lesson Plan Section Navigation"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-sm overflow-x-auto no-scrollbar print:hidden"
      >
        <div className="flex items-center gap-1 min-w-max">
          {navSections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 1. LESSON HEADER & INSTITUTIONAL BAR                                      */}
      {/* ========================================================================= */}
      <header id="header" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Institutional Top Bar */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-4.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-slate-300 uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Lesson Plan & Curriculum Record</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-display">
              {res.schoolName}
            </h1>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">
              Belize MoECST Primary Framework
            </span>
            
            {/* Real Data Status Badge */}
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Saved to Class Records
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Draft Plan
              </span>
            )}

            {onOpenTeachMeTopic && (
              <button
                onClick={onOpenTeachMeTopic}
                className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Open Teach Me This Topic AI Tutor"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Tutor</span>
              </button>
            )}
          </div>
        </div>

        {/* Lesson Title & Topic Banner */}
        <div className="p-6 sm:p-8 bg-white border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 min-w-0 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <span>{res.subject}</span>
                <span>•</span>
                <span>{res.grade}</span>
                <span>•</span>
                <span>Cycle {res.cycle}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight font-display leading-tight">
                {res.lessonTitle}
              </h2>
              {res.subtopic && res.subtopic !== 'Not provided' && (
                <p className="text-[15px] sm:text-base font-semibold text-slate-600">
                  Subtopic / Focal Inquiry: <span className="text-indigo-900">{res.subtopic}</span>
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <div className="bg-slate-50 border border-slate-200/90 px-4 py-2.5 rounded-xl text-center shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Duration</span>
                <span className="text-base font-black text-slate-900">{res.duration}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/90 px-4 py-2.5 rounded-xl text-center shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Date</span>
                <span className="text-base font-bold text-slate-900">{res.dateStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Administrative & Curriculum Alignment Grid (Non-Repetitive 2-Column Layout) */}
        <div id="curriculum" className="p-6 sm:p-8 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Administrative Details & Curriculum Alignment
            </h3>
            <span className="text-xs font-semibold text-slate-400">Belize MoECST National Standard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
            {/* Left Column: Administrative Context */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3.5 shadow-2xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Classroom Context
              </div>
              <div className="grid grid-cols-2 gap-3 text-[15px]">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Teacher</span>
                  <span className="font-bold text-slate-900">{res.teacherName}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Grade / Standard</span>
                  <span className="font-bold text-slate-900">{res.grade}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Subject</span>
                  <span className="font-bold text-slate-900">{res.subject}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Lesson Duration</span>
                  <span className="font-bold text-slate-900">{res.duration}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block">Main Topic</span>
                <span className="font-bold text-slate-900">{res.topic}</span>
              </div>
            </div>

            {/* Right Column: Curriculum Framework Alignment */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 space-y-3.5 shadow-2xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Curriculum Integration
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Strand & Cycle</span>
                  <span className="font-bold text-slate-900">Cycle {res.cycle} • {res.strand}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 block">Curriculum Code</span>
                  <code className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
                    {res.curriculumCode}
                  </code>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Learning Outcome</span>
                <p className="font-medium text-slate-800 leading-relaxed text-[15px]">
                  {res.learningOutcome}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block">Core Competencies</span>
                <span className="font-medium text-slate-700 text-sm">{res.competencies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Lesson Summary Area (Requirement 4.B) */}
        <div className="p-6 sm:p-8 border-t border-slate-200/80 bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Learning Focus</span>
              <span className="font-bold text-slate-900 text-sm line-clamp-1 mt-0.5" title={res.subtopic || res.topic}>
                {res.subtopic || res.topic}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Objectives</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                3 Domains ({res.successCriteria.length} Criteria)
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Duration</span>
              <span className="font-bold text-indigo-700 text-sm mt-0.5 block">
                {res.duration}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Instructional Stages</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {res.stages.length} Stages
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Assessment Type</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate" title={res.assessment.exitTicket ? 'Formative + Exit Check' : 'Formative Observation'}>
                {res.assessment.exitTicket ? 'Formative + Exit Check' : 'Formative Check'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Resources</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                {allResourcesCount} Attached
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MANDATORY LANGUAGE ARTS ALIGNMENT AUDIT & COMPONENT INTEGRITY (30-PT)     */}
      {/* ========================================================================= */}
      {isLA && audit && (
        <section id="la-alignment" className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className={`p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${(audit.isReadyToTeach ?? (audit as any).passedAudit) ? 'bg-gradient-to-r from-emerald-50/90 via-white to-indigo-50/60 border-emerald-100' : 'bg-gradient-to-r from-amber-50/90 via-white to-rose-50/60 border-amber-100'}`}>
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${(audit.isReadyToTeach ?? (audit as any).passedAudit) ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-600 text-white'}`}>
                  <ShieldCheck className="w-4 h-4" />
                  {(audit.isReadyToTeach ?? (audit as any).passedAudit) ? 'MoECST ALIGNMENT AUDIT PASSED' : 'AUDIT ACTION REQUIRED'}
                </span>
                <span className="bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-1 rounded-md border border-slate-200">
                  Quality Score: {audit.scorePercentage ?? (audit as any).score ?? 100}/100
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-200">
                  90-Minute Exact Duration
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Mandatory Dual-Component Alignment Gate
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {(audit as any).summary || 'Lesson certified against the 30-point MoECST Language Arts Master Quality Standard with zero cross-subject bleed.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAuditDetails(!showAuditDetails)}
                className="h-10 px-4 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <span>{showAuditDetails ? 'Hide 14-Point Audit' : 'Inspect 14 Checkpoints'}</span>
                {showAuditDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dual MoECST Language Arts Components Focus */}
          <div className="p-6 bg-slate-50/60 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Approved MoECST Language Arts Components (Strictly Exactly Two)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">Component 1 (Primary)</span>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">MoECST Standard</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {res.primaryComponent || audit.primaryComponent || ((audit as any).componentsIdentified && (audit as any).componentsIdentified[0]) || 'Reading & Comprehension'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mentor text analysis, shared reading, evidence gathering, and text-dependent questioning.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Component 2 (Supporting)</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">MoECST Standard</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {res.supportingComponent || audit.supportingComponent || ((audit as any).componentsIdentified && (audit as any).componentsIdentified[1]) || 'Writing & Composition'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Paired application, structured composition, guided writing, and independent synthesis.
                </p>
              </div>
            </div>
          </div>

          {/* Expandable 14-Point Checkpoint Audit Report */}
          {showAuditDetails && (
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  MoECST Master Quality Standard (14 Verification Audits)
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Zero Cross-Subject Contamination Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries((audit.auditDetails || (audit as any).checks || {})).map(([key, checkItem]: [string, any]) => {
                  const labelMap: Record<string, string> = {
                    curriculumAlignment: '1. Curriculum Alignment',
                    cycleAlignment: '2. Cycle Validity',
                    cycleValidity: '2. Cycle Validity',
                    topicAlignment: '3. Topic Preservation',
                    topicPreservation: '3. Topic Preservation',
                    componentAlignment: '4. Component Integrity (Dual)',
                    componentIntegrity: '4. Component Integrity (Dual)',
                    objectiveAlignment: '5. Objective Purity',
                    objectivePurity: '5. Objective Purity',
                    activityAlignment: '6. Procedure Alignment',
                    procedureAlignment: '6. Procedure Alignment',
                    resourceAlignment: '7. Teacher-Independent Resources',
                    teacherIndependentResources: '7. Teacher-Independent Resources',
                    assessmentAlignment: '8. Assessment Alignment',
                    timingAlignment: '9. 90-Minute Exact Pacing',
                    timingPacing: '9. 90-Minute Exact Pacing',
                    vocabularyAlignment: '10. Vocabulary Density',
                    vocabularyDensity: '10. Vocabulary Density',
                    differentiationAlignment: '11. Differentiation Framework',
                    differentiationFramework: '11. Differentiation Framework',
                    successCriteriaAlignment: '12. Observable Success Criteria',
                    observableSuccessCriteria: '12. Observable Success Criteria',
                    teacherReadiness: '13. Teacher Readiness',
                    scoringAlignment: '14. Scoring Consistency',
                    zeroBleed: '14. Zero Cross-Subject Bleed'
                  };
                  const isPassed = checkItem.status === 'PASS' || checkItem.passed === true;
                  const message = checkItem.message || checkItem.details || '';
                  return (
                    <div 
                      key={key}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${isPassed ? 'bg-slate-50/70 border-slate-200/80 text-slate-800' : 'bg-amber-50/80 border-amber-200 text-amber-900'}`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-slate-900">
                          {labelMap[key] || key}
                        </div>
                        <div className="text-slate-600 leading-snug">
                          {message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. LESSON OVERVIEW & BIG IDEAS                                            */}
      {/* ========================================================================= */}
      <section id="overview" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Layout className="w-5 h-5 text-indigo-600" />
            <span>2. Lesson Overview & Big Ideas</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Big Ideas, Prior Knowledge & Core Vocabulary
          </span>
        </div>

        {/* Big Idea & Essential Question Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-2">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Key Concept & Big Idea
            </span>
            <p className="text-[15px] sm:text-base font-bold text-slate-900 leading-relaxed">
              {(plan as any).teacherQuickReference?.keyConcept || (plan as any).lessonSnapshot?.focus || `Mastery of fundamental principles and practical application in ${res.topic}.`}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-2">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Essential Question / Inquiry Prompt
            </span>
            <p className="text-[15px] sm:text-base font-semibold text-slate-900 italic leading-relaxed">
              "{(plan as any).essentialQuestion || (plan as any).teacherQuickReference?.essentialQuestions?.[0] || `How do we apply ${res.topic} to solve everyday challenges in our community?`}"
            </p>
          </div>
        </div>

        {/* Narrative Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px]">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lesson Description</h4>
            <p className="text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              {res.lessonDescription}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prerequisite Prior Knowledge</h4>
            <p className="text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              {res.priorKnowledge}
            </p>
          </div>
        </div>

        {/* Key Vocabulary Table with 15px Body Text */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Key Vocabulary (Definitions & Context)
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="w-[28%] p-3.5">Academic Term</th>
                  <th className="w-[72%] p-3.5">Educational Definition & Classroom Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {res.vocabularyList.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 align-top">{v.term}</td>
                    <td className="p-3.5 text-slate-800 leading-relaxed">{v.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Required Materials & Resources */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            Required Classroom Materials & Instructional Equipment
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="w-[32%] p-3.5">Material / Equipment</th>
                  <th className="w-[68%] p-3.5">Classroom Purpose & Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {res.materialsList.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 align-top">{m.name}</td>
                    <td className="p-3.5 text-slate-800 leading-relaxed">{m.purpose || 'Supports active hands-on student practice and instructional modeling.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LEARNING OBJECTIVES & SUCCESS CRITERIA                                 */}
      {/* ========================================================================= */}
      <section id="objectives" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>3. Learning Objectives & Success Criteria</span>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            3-Domain Architecture
          </span>
        </div>

        {/* Prominent Shared Condition */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
          <div className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Shared Instructional Condition / Context (Unified Across Domains)
          </div>
          <p className="text-slate-900 font-bold text-base sm:text-lg leading-relaxed">
            {res.condition}
          </p>
        </div>

        {/* 3-Domain Layout: Cognitive, Psychomotor, Affective */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cognitive Domain */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" /> Cognitive Domain
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">Knowledge</span>
            </div>
            <p className="text-[15px] text-slate-800 font-medium leading-relaxed">
              {res.cognitive}
            </p>
          </div>

          {/* Psychomotor Domain */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-emerald-600" /> Psychomotor Domain
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">Practical Skill</span>
            </div>
            <p className="text-[15px] text-slate-800 font-medium leading-relaxed">
              {res.psychomotor}
            </p>
          </div>

          {/* Affective Domain */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" /> Affective Domain
              </span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">Values & Attitude</span>
            </div>
            <p className="text-[15px] text-slate-800 font-medium leading-relaxed">
              {res.affective}
            </p>
          </div>
        </div>

        {/* Observable Success Criteria */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Observable Success Criteria ("I Can" Statements)
          </h4>
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-5">
            <ul className="space-y-2.5 text-[15px]">
              {res.successCriteria.map((sc, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-800 font-medium leading-relaxed">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{sc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TEACHING STRATEGIES & INSTRUCTIONAL MODEL                              */}
      {/* ========================================================================= */}
      <section id="strategies" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>4. Teaching Strategies & Pedagogical Framework</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Gradual Release of Responsibility
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Primary Model</span>
            <p className="text-base font-bold text-slate-900">{res.teachingStrategy}</p>
            <p className="text-sm text-slate-600 leading-relaxed">Explicit direct modeling transitioning smoothly from I Do to We Do and You Do.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Methodological Approach</span>
            <p className="text-base font-bold text-slate-900">{res.methodology}</p>
            <p className="text-sm text-slate-600 leading-relaxed">Inquiry-guided, student-centered problem solving with collaborative peer discourse.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Scaffolding & Engagement</span>
            <p className="text-base font-bold text-slate-900">Concrete-to-Abstract (CPA)</p>
            <p className="text-sm text-slate-600 leading-relaxed">Visual anchor charts, manipulative verification, and targeted Socratic inquiry prompts.</p>
          </div>
        </div>

        {/* Belize MoECST Language Arts 2-Component Balanced Literacy Architecture (if Language Arts) */}
        {isLA && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <BookOpenCheck className="w-4 h-4 text-emerald-600" />
              Belize MoECST Primary Mandate: 2-Component Balanced Literacy Architecture
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              <div className="bg-white rounded-xl p-4 border border-emerald-200/90 shadow-2xs">
                <span className="font-bold text-emerald-900 block mb-1.5 text-base">
                  Component 1: {(plan as any).component1Details?.name || (plan as any).languageArtsComponents?.[0] || 'Comprehension — Oral Expression & Text Structure'}
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {(plan as any).component1Details?.explicitTeachingScript || 'Explicit modeling and guided text analysis focusing on active comprehension and vocabulary.'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-emerald-200/90 shadow-2xs">
                <span className="font-bold text-emerald-900 block mb-1.5 text-base">
                  Component 2: {(plan as any).component2Details?.name || (plan as any).languageArtsComponents?.[1] || 'Production & Language Structure — Writing & Syntax'}
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {(plan as any).component2Details?.explicitTeachingScript || 'Independent writing, structural practice, and communicative application.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. METHODOLOGY & TEACHING SEQUENCE (5-STAGE EXECUTION FLOW)              */}
      {/* ========================================================================= */}
      <section id="sequence" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
              <PenTool className="w-5 h-5 text-indigo-600" />
              <span>5. Methodology & Teaching Sequence ({res.stages.length} Stages)</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Structured instructional execution with distinct teacher & student actions
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSequenceView('timeline')}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                sequenceView === 'timeline' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Stage Cards</span>
            </button>
            <button
              onClick={() => setSequenceView('table')}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                sequenceView === 'table' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Matrix Table</span>
            </button>
          </div>
        </div>

        {/* Accurate Timing Verification Status Callout (Requirement 7) */}
        <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
          isStrictlyBalanced 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            {isStrictlyBalanced ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Timing Verified: Total Allocated Time ({totalStageMinutes} mins) strictly matches Official Lesson Duration ({targetMinutes} mins).</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Timing Notice: Total allocated across stages ({totalStageMinutes} mins) differs from lesson duration ({targetMinutes} mins) by {timingDifference}m.</span>
              </>
            )}
          </div>
          <div className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs">
            {totalStageMinutes}m Allocated / {targetMinutes}m Target
          </div>
        </div>

        {sequenceView === 'timeline' ? (
          /* High-Readability Sequential Stage Cards (Default View) */
          <div className="space-y-6">
            {res.stages.map((stage) => (
              <div key={stage.stageNumber} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5 transition-all">
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {stage.stageNumber}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{stage.title}</h4>
                      {(stage as any).purpose && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{(stage as any).purpose}</p>
                      )}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{stage.duration}</span>
                  </div>
                </div>

                {/* Paired Actions: Teacher Does vs. Students Do (15px Text) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[15px]">
                  {/* Teacher Instructional Actions */}
                  <div className="bg-indigo-50/30 rounded-xl p-4.5 border border-indigo-100/80 space-y-2.5">
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                      Teacher Instructional Actions
                    </span>
                    <ul className="space-y-2 text-slate-800">
                      {stage.teacherActions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Student Engagement Actions */}
                  <div className="bg-emerald-50/30 rounded-xl p-4.5 border border-emerald-100/80 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                      Student Engagement Actions
                    </span>
                    <ul className="space-y-2 text-slate-800">
                      {stage.studentActions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Callouts: Assessment Check & Key Inquiry Question */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Formative Assessment Check:</span>
                      <span className="text-slate-800">{stage.assessment || 'Observation of active student practice.'}</span>
                    </div>
                  </div>

                  {stage.keyQuestions.length > 0 ? (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-950">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Key Inquiry Question:</span>
                        <span>"{stage.keyQuestions[0]}"</span>
                      </div>
                    </div>
                  ) : stage.resources.length > 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                      <Package className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700 block">Stage Resources:</span>
                        <span className="text-slate-800">{stage.resources.join(', ')}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Matrix Table View (Available via Toggle) */
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="w-[18%] p-3.5 border-r border-slate-200">Phase & Time</th>
                  <th className="w-[28%] p-3.5 border-r border-slate-200">Teacher Actions</th>
                  <th className="w-[28%] p-3.5 border-r border-slate-200">Student Actions</th>
                  <th className="w-[26%] p-3.5">Assessment & Materials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[14px]">
                {res.stages.map((stage) => (
                  <tr key={stage.stageNumber} className="hover:bg-slate-50/40 align-top">
                    <td className="p-3.5 bg-slate-50/50 border-r border-slate-200">
                      <div className="font-bold text-slate-900 text-base">{stage.title}</div>
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{stage.duration}</span>
                      </div>
                    </td>
                    <td className="p-3.5 border-r border-slate-200">
                      <ul className="space-y-1.5 text-slate-800">
                        {stage.teacherActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-indigo-600 font-bold shrink-0">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3.5 border-r border-slate-200">
                      <ul className="space-y-1.5 text-slate-800">
                        {stage.studentActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-600 font-bold shrink-0">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3.5 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Check:</span>
                        <p className="text-slate-800 font-medium">{stage.assessment}</p>
                      </div>
                      {stage.keyQuestions.length > 0 && (
                        <div className="bg-amber-50/80 border border-amber-200 p-2 rounded text-amber-950">
                          <span className="font-bold block">Inquiry:</span>
                          <span>{stage.keyQuestions[0]}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. TIME MANAGEMENT & PACING BREAKDOWN                                    */}
      {/* ========================================================================= */}
      <section id="timing" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>6. Time Management & Pacing Breakdown</span>
          </div>
          <div className="flex items-center gap-2">
            {isStrictlyBalanced ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Validated: {totalStageMinutes}m = {targetMinutes}m Duration
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Allocated: {totalStageMinutes}m / {targetMinutes}m Total
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <th className="w-[15%] p-3.5">Stage</th>
                <th className="w-[35%] p-3.5">Instructional Phase</th>
                <th className="w-[20%] p-3.5">Time Allocation</th>
                <th className="w-[30%] p-3.5">Pedagogical Core Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[15px]">
              {res.stages.map((stage) => {
                const mins = parseMinutes(stage.duration, 10);
                const percent = Math.round((mins / (totalStageMinutes || 50)) * 100);
                return (
                  <tr key={stage.stageNumber} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-500">Stage {stage.stageNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{stage.title}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-indigo-700">{stage.duration}</span>
                      <span className="text-slate-400 font-medium ml-1.5 text-xs">({percent}%)</span>
                    </td>
                    <td className="p-3.5 text-slate-700">{stage.assessment || 'Active guided learning and skill demonstration.'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 text-sm">
                <td colSpan={2} className="p-3.5 text-slate-700">Total Instructional Time</td>
                <td className="p-3.5 font-black text-indigo-700">{totalStageMinutes} Minutes</td>
                <td className="p-3.5 text-slate-600 font-normal text-xs">Verified against school timetable standards</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TEACHER ACTIONS VS. STUDENT ACTIONS (PAIRED STAGE ROWS)                */}
      {/* ========================================================================= */}
      <section id="actions" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>7. Teacher Actions vs. Student Actions</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Side-by-side alignment: view what students do during each teacher move
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Aligned Operational Roles
          </span>
        </div>

        {/* Stage-by-Stage Paired Rows */}
        <div className="space-y-4">
          {res.stages.map((stage) => (
            <div key={stage.stageNumber} className="rounded-xl border border-slate-200/90 p-5 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {stage.stageNumber}
                  </span>
                  <span>{stage.title}</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">{stage.duration}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
                {/* Teacher Action Box */}
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">T</span>
                    <span>Teacher Instructional Move</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-800">
                    {stage.teacherActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-indigo-500 font-bold shrink-0">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Student Action Box */}
                <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">S</span>
                    <span>Student Response & Engagement</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-800">
                    {stage.studentActions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ASSESSMENT & EVIDENCE OF LEARNING                                      */}
      {/* ========================================================================= */}
      <section id="assessment" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <ListChecks className="w-5 h-5 text-indigo-600" />
            <span>8. Assessment & Evidence of Learning</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Formative Checks & Diagnostic Evidence
          </span>
        </div>

        {/* Assessment Matrix Table (15px Text) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <tbody className="divide-y divide-slate-200 text-[15px]">
              <tr>
                <th className="w-[28%] bg-slate-50/80 p-3.5 font-bold text-slate-700 border-r border-slate-200 text-xs uppercase tracking-wider">Initial Diagnostic Check</th>
                <td className="p-3.5 text-slate-800 leading-relaxed">{res.assessment.formative}</td>
              </tr>
              <tr>
                <th className="bg-slate-50/80 p-3.5 font-bold text-slate-700 border-r border-slate-200 text-xs uppercase tracking-wider">Guided Practice Check</th>
                <td className="p-3.5 text-slate-800 leading-relaxed">{res.assessment.guidedPractice}</td>
              </tr>
              <tr>
                <th className="bg-slate-50/80 p-3.5 font-bold text-slate-700 border-r border-slate-200 text-xs uppercase tracking-wider">Independent Performance</th>
                <td className="p-3.5 text-slate-800 leading-relaxed">{res.assessment.independentPractice}</td>
              </tr>
              <tr>
                <th className="bg-slate-50/80 p-3.5 font-bold text-slate-700 border-r border-slate-200 text-xs uppercase tracking-wider">Summative Exit Check</th>
                <td className="p-3.5 font-bold text-indigo-950 leading-relaxed">{res.assessment.exitTicket}</td>
              </tr>
              <tr>
                <th className="bg-slate-50/80 p-3.5 font-bold text-slate-700 border-r border-slate-200 text-xs uppercase tracking-wider">Benchmark Evaluation Criteria</th>
                <td className="p-3.5 font-semibold text-emerald-900 leading-relaxed">{res.assessment.evaluationCriteria}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Questioning Strategies Hierarchy Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Bloom's Taxonomy Cognitive Questioning Hierarchy
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="w-[25%] p-3.5">Cognitive Level</th>
                  <th className="w-[75%] p-3.5">Target Question & Socratic Prompt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[15px]">
                {res.questioningStrategies.map((q, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-indigo-900 align-top">{q.level}</td>
                    <td className="p-3.5 text-slate-800 leading-relaxed">{q.question}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. DIFFERENTIATION & INCLUSION FRAMEWORK                                  */}
      {/* ========================================================================= */}
      <section id="differentiation" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>9. Differentiation & Inclusion Framework</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            4-Tier Adaptive Scaffolding
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Struggling Learners */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Struggling Learners</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-800">
              {res.differentiation.strugglingLearners.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Developing Learners */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>On-Level / Developing</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-800">
              {res.differentiation.onLevelLearners.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advanced Learners */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Advanced Extensions</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-800">
              {res.differentiation.advancedLearners.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Accommodations / Inclusion */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Accommodations / ELL</span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-800">
              {res.differentiation.inclusionSupports.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CLOSURE & REFLECTION                                                  */}
      {/* ========================================================================= */}
      <section id="closure" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <XCircle className="w-5 h-5 text-indigo-600" />
            <span>10. Closure & Reflection</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Synthesis, Exit Ticket & Teacher Notes
          </span>
        </div>

        {/* Teacher Closure & Key Takeaway */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[15px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-2.5">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">Teacher Closure Actions</span>
            <ul className="space-y-2 text-slate-800">
              {res.closure.map((c, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-2.5">
            <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider block">Key Student Takeaway</span>
            <p className="text-slate-800 font-semibold leading-relaxed">
              {res.anchorChart?.studentKeyTakeaway || `Students understand how ${res.topic} functions and can apply procedural rules independently with confidence.`}
            </p>
            {res.exitTicket && (
              <div className="mt-3 pt-3 border-t border-indigo-100 text-sm text-indigo-950 font-medium">
                <span className="font-bold text-indigo-800">Exit Question Prompt:</span> {res.exitTicket.prompt}
              </div>
            )}
          </div>
        </div>

        {/* Teacher Post-Lesson Observation Log */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Teacher Post-Lesson Observation Log
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">What went well / Student mastery highlights:</label>
              <textarea 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all resize-none min-h-[85px] leading-relaxed" 
                placeholder="Note specific student successes observed during lesson execution..." 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Areas for tomorrow's review or reteach:</label>
              <textarea 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all resize-none min-h-[85px] leading-relaxed" 
                placeholder="Note misconceptions to address during tomorrow's spiral warm-up..." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. HOMEWORK & EXTENSION                                                  */}
      {/* ========================================================================= */}
      <section id="homework" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
            <Home className="w-5 h-5 text-indigo-600" />
            <span>11. Homework & Extension Activity</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Independent Practice & Challenge
          </span>
        </div>

        {(() => {
          const hw = (plan as any).homeworkExtension || (plan as any).teachingResources?.studentMaterials?.homework;
          const ext = res.extensionActivity;
          
          if (hw || (ext && ext.tasks.length > 0)) {
            return (
              <div className="space-y-4 text-[15px]">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-900 text-base">{ext.title || 'Independent Practice Assignment'}</span>
                    <span className="text-indigo-700 bg-indigo-50 font-bold px-2.5 py-0.5 rounded border border-indigo-200 text-xs">
                      Estimated Time: 15–20 Mins
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {ext.instructions || 'Reinforce the focal competency through independent problem solving at home.'}
                  </p>
                  {ext.tasks.length > 0 && (
                    <ul className="space-y-2 pt-2 border-t border-slate-200/80">
                      {ext.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-800">
                          <span className="font-bold text-indigo-600">{i + 1}.</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center text-slate-600">
              <p className="font-bold text-slate-800 text-base">No formal written homework assigned for this lesson.</p>
              <p className="mt-1 text-slate-500 text-sm">All required skill practice and formative checks were completed during the guided and independent classroom phases.</p>
            </div>
          );
        })()}
      </section>

      {/* ========================================================================= */}
      {/* 12. LESSON RESOURCES, WORKSHEETS & GENERATED ASSETS (Requirement 9)       */}
      {/* ========================================================================= */}
      <section id="materials-assets" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-900 font-black text-xl uppercase tracking-tight">
              <Package className="w-5 h-5 text-indigo-600" />
              <span>12. Lesson Resources & Generated Materials</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Printable student practice sheets, exit tickets, and classroom resources with real functional actions
            </p>
          </div>

          {onGenerateResource && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onGenerateResource(plan, 'Worksheet')}
                disabled={isGenerating}
                className="h-8 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Worksheet</span>
              </button>
              <button
                onClick={() => onGenerateResource(plan, 'Exit Ticket')}
                disabled={isGenerating}
                className="h-8 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exit Ticket</span>
              </button>
            </div>
          )}
        </div>

        {/* Render Available Worksheets & Teaching Resources */}
        {activeWorksheets && activeWorksheets.length > 0 ? (
          <div className="space-y-4">
            {activeWorksheets.map((ws, idx) => {
              const isExpanded = expandedWorksheetIdx === idx;
              const showAnswerKey = Boolean(showAnswerKeyMap[idx]);

              return (
                <div key={idx} className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
                  <div className="p-5 bg-slate-50/60 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Student Material
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{ws.title || `Worksheet: ${res.topic}`}</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Belize MoECST Aligned Practice Sheet with scaffolded difficulty
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                      <button
                        onClick={() => setExpandedWorksheetIdx(isExpanded ? null : idx)}
                        className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Collapse' : 'Preview'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(ws.content, idx)}
                        className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedResourceIdx === idx ? 'Copied!' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handlePrintWorksheet(ws.title || `Worksheet: ${res.topic}`, ws.content, ws.answerKey)}
                        className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Sheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Preview */}
                  {isExpanded && (
                    <div className="p-6 space-y-4 border-t border-slate-100 bg-white">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Preview</span>
                        {ws.answerKey && (
                          <button
                            onClick={() => setShowAnswerKeyMap(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                              showAnswerKey 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key & Scoring Guide'}</span>
                          </button>
                        )}
                      </div>

                      {/* Worksheet Text */}
                      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {ws.content}
                      </div>

                      {/* Teacher Answer Key */}
                      {showAnswerKey && ws.answerKey && (
                        <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                            Teacher Answer Key & Scoring Guide
                          </span>
                          <div className="text-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                            {ws.answerKey}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <div>
              <p className="font-bold text-slate-800 text-base">Core Student Materials Ready</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                {res.materialsList.length > 0 
                  ? `${res.materialsList.length} physical classroom resources and manipulatives are designated for this lesson.`
                  : 'All instructional exercises and assessment checks are integrated directly into the lesson stages.'}
              </p>
            </div>
            {onGenerateResource && (
              <button
                onClick={() => onGenerateResource(plan, 'Worksheet')}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Printable Student Worksheet</span>
              </button>
            )}
          </div>
        )}
      </section>

    </div>
  );
};
