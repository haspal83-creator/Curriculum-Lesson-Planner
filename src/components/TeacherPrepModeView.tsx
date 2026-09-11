import React, { useState } from 'react';
import { 
  CheckCircle2, 
  GraduationCap, 
  BookOpen, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  FileText, 
  Users, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Layers, 
  Zap, 
  Award, 
  Clock, 
  Package, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { LessonPlan, ReadyToTeachItem } from '../types';
import { Button } from './ui/Button';
import { STANDARD_READY_TO_TEACH_ITEMS } from '../lib/lessonQualityGate';

interface TeacherPrepModeViewProps {
  plan: LessonPlan;
  onOpenTeachMeTopic: () => void;
  onSwitchToTeachMode: () => void;
}

export const TeacherPrepModeView: React.FC<TeacherPrepModeViewProps> = ({
  plan,
  onOpenTeachMeTopic,
  onSwitchToTeachMode
}) => {
  // Interactive confidence checklist state
  const [checklist, setChecklist] = useState<ReadyToTeachItem[]>(
    plan.readyToTeachChecklist || STANDARD_READY_TO_TEACH_ITEMS.map(item => ({ ...item, checked: false }))
  );

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const checkedCount = checklist.filter(item => item.checked).length;
  const confidencePercent = Math.round((checkedCount / checklist.length) * 100);

  // Accordion state for expandable sections
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    confidence: true,
    whatYouNeedToKnow: true,
    vocabulary: true,
    prerequisites: true,
    misconceptions: true,
    workedExamples: true,
    teacherScript: true,
    instructionalSequence: true,
    questionBank: true,
    formativeChecks: true,
    strugglingStudents: true,
    commonErrors: true,
    completeAssessment: true,
    studentMaterials: true
  });

  const toggleSection = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const prep = plan.teacherPreparation?.whatYouNeedToKnow;
  const vocabTable = plan.keyVocabularyTable || [];
  const prereqs = plan.prerequisiteDiagnostic;
  const misconceptions = plan.commonMisconceptionsTable || [];
  const workedExamples = plan.workedExamplesList || [];
  const script = plan.teacherScriptDetailed;
  const seq = plan.instructionalSequence;
  const qBank = plan.bloomQuestionBank;
  const formative = plan.formativeChecksList || [];
  const struggling = plan.ifStudentsAreStruggling;
  const commonErrors = plan.commonErrorsTable || [];
  const assessment = plan.completeAssessment;
  const studentMaterials = plan.studentMaterials || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Welcome Header */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                Pre-Class Preparation Hub
              </span>
              <span className="text-xs font-bold text-gray-500">
                {plan.grade} • {plan.subject}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
              Teacher Prep Mode: <span className="text-indigo-600">{plan.topic}</span>
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Review core background, teacher scripting, anticipated errors, and student materials before class starts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={onOpenTeachMeTopic}
            variant="outline"
            className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold h-10 px-4 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Teach Me This Topic</span>
          </Button>

          <Button
            onClick={onSwitchToTeachMode}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Start Teach Mode</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: 👩🏽‍🏫 READY TO TEACH? CONFIDENCE CHECKLIST */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('confidence')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Section 1</span>
              <h3 className="text-lg font-black text-gray-900">Ready to Teach? Teacher Confidence Checklist</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700">{confidencePercent}% Ready</span>
            </div>
            {expanded.confidence ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {expanded.confidence && (
          <div className="p-6 sm:p-8 space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Check each item as you prepare. This ensures zero surprises during live classroom instruction:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checklist.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    item.checked 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                      : 'bg-white border-gray-200/80 hover:border-indigo-200 text-gray-700'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    item.checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {item.checked && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold leading-relaxed">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: WHAT YOU NEED TO KNOW (TEACHER BACKGROUND BRIEFING) */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('whatYouNeedToKnow')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Section 2</span>
              <h3 className="text-lg font-black text-gray-900">What You Need to Know: Conceptual Mastery</h3>
            </div>
          </div>
          {expanded.whatYouNeedToKnow ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.whatYouNeedToKnow && prep && (
          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {/* Core Definition & Meaning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">What The Concept Is</span>
                <p className="text-gray-800 leading-relaxed font-medium">{prep.conceptSummary}</p>
              </div>
              <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">What It Means</span>
                <p className="text-gray-800 leading-relaxed font-medium">{prep.whatItMeans}</p>
              </div>
            </div>

            {/* Why It Matters & How It Works */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">Why It Matters</span>
                <p className="text-gray-800 leading-relaxed font-medium">{prep.whyItMatters}</p>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">How It Works</span>
                <p className="text-gray-800 leading-relaxed font-medium">{prep.howItWorks}</p>
              </div>
            </div>

            {/* Important Rules & Terminology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Important Rules</span>
                <ul className="space-y-1.5">
                  {prep.importantRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span className="text-gray-800 font-medium leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Important Terminology</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prep.importantTerminology.map((term, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 px-2.5 py-1 rounded-xl font-bold text-indigo-700 text-[11px]">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Prior Learning & Belizean Real-World Applications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Connection to Prior Learning</span>
                <p className="text-gray-800 leading-relaxed font-medium">{prep.connectionsToPriorLearning}</p>
              </div>
              <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">Real-World Belizean Applications</span>
                <p className="text-gray-800 leading-relaxed font-medium">{prep.realWorldApplications}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: KEY VOCABULARY TABLE (DUAL DEFINITIONS) */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('vocabulary')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Section 3</span>
              <h3 className="text-lg font-black text-gray-900">Key Vocabulary: Teacher vs. Student Definitions</h3>
            </div>
          </div>
          {expanded.vocabulary ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.vocabulary && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-200/80 font-black text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-40">Academic Term</th>
                    <th className="py-3 px-4 w-1/3">Teacher-Friendly Definition</th>
                    <th className="py-3 px-4 w-1/3">Student-Friendly Definition</th>
                    <th className="py-3 px-4">Example Sentence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vocabTable.map((item, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-3 px-4 align-top font-black text-indigo-900">
                        {item.term}
                      </td>
                      <td className="py-3 px-4 align-top text-gray-700 leading-relaxed font-medium">
                        {item.teacherDefinition}
                      </td>
                      <td className="py-3 px-4 align-top text-gray-800 leading-relaxed font-semibold bg-indigo-50/30">
                        "{item.studentDefinition}"
                      </td>
                      <td className="py-3 px-4 align-top text-gray-600 italic leading-relaxed">
                        {item.exampleSentence || `Today we use ${item.term} to show our working.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: PREREQUISITE DIAGNOSTIC CHECK */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('prerequisites')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Section 4</span>
              <h3 className="text-lg font-black text-gray-900">Prerequisite Knowledge & 60-Second Diagnostic Check</h3>
            </div>
          </div>
          {expanded.prerequisites ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.prerequisites && prereqs && (
          <div className="p-6 sm:p-8 space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/70 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Required Prerequisite Concepts</span>
                <ul className="space-y-1.5">
                  {prereqs.requiredConcepts.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/70 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Required Skills</span>
                <ul className="space-y-1.5">
                  {prereqs.requiredSkills.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Diagnostic Card */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Quick Pre-Lesson Diagnostic Check
                </span>
              </div>
              <div className="space-y-2 pl-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Teacher Asks:</span>
                  <p className="text-xs font-bold text-gray-900 italic">{prereqs.diagnosticCheck.teacherAsks}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Expected Student Response:</span>
                  <p className="text-xs font-semibold text-emerald-800">{prereqs.diagnosticCheck.expectedResponse}</p>
                </div>
                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">If Students Cannot Answer:</span>
                  <p className="text-xs font-medium text-rose-900">{prereqs.diagnosticCheck.ifStudentsCannotAnswer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: COMMON MISCONCEPTIONS & EXACT TEACHER CORRECTION */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('misconceptions')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Section 5</span>
              <h3 className="text-lg font-black text-gray-900">Common Misconceptions & Exact Teacher Language</h3>
            </div>
          </div>
          {expanded.misconceptions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.misconceptions && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-200/80 font-black text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-1/4">Anticipated Misconception</th>
                    <th className="py-3 px-4 w-1/3">Correct Understanding</th>
                    <th className="py-3 px-4">Exact Teacher Explanation / Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {misconceptions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3.5 px-4 align-top text-rose-900 font-bold bg-rose-50/30">
                        {item.misconception}
                      </td>
                      <td className="py-3.5 px-4 align-top text-gray-800 leading-relaxed font-semibold">
                        {item.correctUnderstanding}
                      </td>
                      <td className="py-3.5 px-4 align-top text-indigo-900 leading-relaxed font-medium italic bg-indigo-50/20">
                        {item.teacherCorrectionLanguage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: WORKED EXAMPLES (STEP-BY-STEP SOLUTIONS) */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('workedExamples')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Section 6</span>
              <h3 className="text-lg font-black text-gray-900">Step-by-Step Worked Examples & Teacher Models</h3>
            </div>
          </div>
          {expanded.workedExamples ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.workedExamples && (
          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {workedExamples.map((ex, idx) => (
              <div key={idx} className="rounded-2xl border border-teal-200 bg-teal-50/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                    {ex.subjectType} Model #{idx + 1}
                  </span>
                  {ex.belizeanContextNote && (
                    <span className="text-[11px] font-bold text-gray-600">
                      Context: {ex.belizeanContextNote}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1">Problem / Context</span>
                  <p className="text-sm font-black text-gray-900">{ex.problemOrContext}</p>
                </div>

                {ex.stepByStepSolution && ex.stepByStepSolution.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-teal-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 block">Step-by-Step Solution:</span>
                    <div className="space-y-2">
                      {ex.stepByStepSolution.map(step => (
                        <div key={step.step} className="bg-white rounded-xl p-3 border border-teal-100/80 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                            {step.step}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900">{step.action}</p>
                            <p className="text-gray-600 mt-0.5 leading-relaxed">{step.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl p-3 border border-emerald-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-0.5">Final Answer / Model Response</span>
                  <p className="text-xs font-bold text-emerald-900">{ex.finalAnswerOrModelResponse}</p>
                </div>

                {ex.commonErrorOrScientificReasoning && (
                  <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-200 text-rose-900">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block mb-0.5">Watch Out (Common Error):</span>
                    <p className="text-xs font-semibold">{ex.commonErrorOrScientificReasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 7: TEACHER SCRIPT (VERBATIM TEACHER WORDING) */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('teacherScript')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Section 7</span>
              <h3 className="text-lg font-black text-gray-900">Complete Teacher Script: What to Say</h3>
            </div>
          </div>
          {expanded.teacherScript ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.teacherScript && script && (
          <div className="p-6 sm:p-8 space-y-4 text-xs">
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">Opening & Hook</span>
              <p className="text-gray-900 font-semibold italic leading-relaxed">"{script.opening}"</p>
            </div>

            <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">Direct Explanation (Explicit Teaching)</span>
              <p className="text-gray-900 font-semibold italic leading-relaxed">"{script.explanation}"</p>
            </div>

            <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 block">Modeling & Think-Aloud (I DO)</span>
              <p className="text-gray-900 font-semibold italic leading-relaxed">"{script.modeling}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Guiding Questions to Ask</span>
                <ul className="space-y-1.5">
                  {script.questioning.map((q, i) => (
                    <li key={i} className="text-gray-900 font-medium italic">"{q}"</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Transition Statements</span>
                <ul className="space-y-1.5">
                  {script.transitions.map((t, i) => (
                    <li key={i} className="text-gray-900 font-medium italic">"{t}"</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Feedback & Praise Language</span>
                <p className="text-gray-900 font-semibold italic leading-relaxed">"{script.feedbackLanguage}"</p>
              </div>

              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">Correction Prompts</span>
                <p className="text-gray-900 font-semibold italic leading-relaxed">"{script.correctionPrompts}"</p>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">Closing & Synthesis</span>
              <p className="text-gray-900 font-semibold italic leading-relaxed">"{script.closing}"</p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 8: DIFFERENTIATION & RETEACHING PROTOCOL */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('strugglingStudents')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Section 8</span>
              <h3 className="text-lg font-black text-gray-900">If Students Are Struggling: Reteaching Protocol</h3>
            </div>
          </div>
          {expanded.strugglingStudents ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.strugglingStudents && struggling && (
          <div className="p-6 sm:p-8 space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50/40 rounded-2xl p-5 border border-rose-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">Signs of Confusion</span>
                <ul className="space-y-1.5">
                  {struggling.signsOfConfusion.map((s, i) => (
                    <li key={i} className="text-gray-800 font-medium flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">Likely Root Cause</span>
                <p className="text-gray-800 font-medium leading-relaxed">{struggling.likelyCause}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Simpler Explanation</span>
                <p className="text-gray-900 font-semibold italic leading-relaxed">"{struggling.simplerExplanation}"</p>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">Alternative Example</span>
                <p className="text-gray-800 font-medium leading-relaxed">{struggling.alternativeExample}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Guided Practice</span>
                <p className="text-gray-800 font-medium">{struggling.additionalGuidedPractice}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Manipulatives / Visuals</span>
                <p className="text-gray-800 font-medium">{struggling.visualOrManipulativeOption}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Follow-Up Check</span>
                <p className="text-gray-800 font-medium">{struggling.followUpCheck}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 9: COMPLETE ASSESSMENT & ANSWER KEY */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('completeAssessment')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Section 9</span>
              <h3 className="text-lg font-black text-gray-900">Complete Assessment, Full Answer Key & Mastery Standard</h3>
            </div>
          </div>
          {expanded.completeAssessment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.completeAssessment && assessment && (
          <div className="p-6 sm:p-8 space-y-5 text-xs">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Assessment Task</span>
              <p className="text-sm font-bold text-gray-900 leading-relaxed">{assessment.task}</p>
            </div>

            <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Full Answer Key</span>
              <pre className="whitespace-pre-wrap font-sans text-xs text-emerald-950 font-medium leading-relaxed bg-white p-4 rounded-xl border border-emerald-100">
                {assessment.answerKey}
              </pre>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">Measurable Mastery Standard</span>
                <p className="text-xs font-bold text-indigo-950">{assessment.masteryCriteria}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 10: STUDENT MATERIALS & RESOURCES */}
      <div className="rounded-3xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div 
          onClick={() => toggleSection('studentMaterials')}
          className="p-6 cursor-pointer flex items-center justify-between border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Section 10</span>
              <h3 className="text-lg font-black text-gray-900">Generated Student Materials & Resources</h3>
            </div>
          </div>
          {expanded.studentMaterials ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>

        {expanded.studentMaterials && (
          <div className="p-6 sm:p-8 space-y-6 text-xs">
            {studentMaterials.map((mat, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-200 p-5 bg-gray-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">{mat.title}</h4>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-gray-200 text-indigo-600">
                    {mat.type.replace('_', ' ')}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11px] text-gray-800 bg-white p-4 rounded-xl border border-gray-200/80 max-h-80 overflow-y-auto">
                  {mat.content}
                </pre>
                {mat.answerKey && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">Answer Key:</span>
                    <p className="text-xs text-emerald-900 font-medium bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      {mat.answerKey}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
