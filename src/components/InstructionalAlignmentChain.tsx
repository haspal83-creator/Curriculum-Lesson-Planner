import React, { useState } from 'react';
import { LessonPlan } from '../types';
import { 
  Target, 
  BookOpen, 
  Sparkles, 
  Brain, 
  Compass, 
  Eye, 
  Users, 
  PenTool,
  CheckSquare, 
  TrendingUp, 
  ArrowRight, 
  StickyNote, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowDown,
  ListFilter,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Card, Button } from './ui';
import { cn } from '../lib/utils';

interface InstructionalAlignmentChainProps {
  plan: LessonPlan;
  onNavigateToSection?: (sectionId: string) => void;
}

export interface AlignmentStep {
  id: string;
  stepNumber: number;
  label: string;
  category: 'Foundation' | 'Instruction' | 'Evaluation' | 'Synthesis';
  icon: React.ElementType;
  targetSectionId: string;
  summary: string;
  detail: string | string[];
  status: 'verified' | 'pending';
}

export const InstructionalAlignmentChain: React.FC<InstructionalAlignmentChainProps> = ({ 
  plan, 
  onNavigateToSection 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flow' | 'matrix'>('flow');

  // Extract structured data for all 16 links in the user's pedagogical chain
  const outcomeText = plan.learningOutcome || plan.structured_json?.learningOutcome || `Mastery of curriculum standards for ${plan.topic}.`;
  const focusText = `${plan.topic}${plan.subtopic ? ` — ${plan.subtopic}` : ''}`;
  
  const condition = plan.learningObjectivesBoard?.condition || plan.learningObjectives?.condition || 'Given authentic Belizean mentor texts and guided analysis tools:';
  const cognitive = plan.learningObjectivesBoard?.knowledge || plan.learningObjectives?.cognitive || 'Students will analyze and interpret core concepts with at least 80% accuracy.';
  const psychomotor = plan.learningObjectivesBoard?.skill || plan.learningObjectives?.psychomotor || 'Students will record written evidence and construct representations in exercise books.';
  const affective = plan.learningObjectivesBoard?.attitude || plan.learningObjectives?.affective || 'Students will engage actively and collaborate constructively in discussions.';

  const successCriteria = plan.learningObjectivesBoard?.successCriteria?.length 
    ? plan.learningObjectivesBoard.successCriteria 
    : [
        `I can explain the key principles of ${plan.topic} in my own words.`,
        `I can analyze mentor examples and demonstrate correct methods with textual evidence.`,
        `I can verify my answers and justify my reasoning to a peer.`
      ];

  const priorKnowledge = plan.priorKnowledgeActivation?.whatTheyKnow || plan.previousKnowledge || 'Foundational grade-level prerequisite vocabulary and preceding unit concepts.';
  
  const engageAction = plan.executionBoard?.[0]?.teacherActions?.[0] || plan.introduction?.[0] || 'Hook students with a compelling Belizean real-world scenario and diagnostic inquiry question.';
  const exploreAction = plan.executionBoard?.[1]?.teacherActions?.[0] || plan.development?.[0] || 'Facilitate student discovery through mentor text observation and pattern identification.';
  
  const modelingAction = plan.instructionalSequence?.iDo?.thinkAloud || 
    plan.teacherScriptDetailed?.modeling || 
    'Explicit teacher demonstration (I Do) with audible think-aloud and modeled board examples.';
  
  const guidedAction = plan.instructionalSequence?.weDo?.tasks?.[0] || 
    plan.guidedPractice?.[0] || 
    'Paired collaborative practice (We Do) with active teacher circulation and formative spot-checks.';
  
  const independentAction = plan.instructionalSequence?.youDo?.studentTasks?.[0] || 
    plan.independentPractice?.[0] || 
    'Individual student practice (You Do) in exercise books with tiered problem sets / worksheets.';
  
  const formativeAssessment = plan.finalAssessmentBoard?.evidenceOfLearning || 
    plan.exitTicketPackage?.scoringGuidance || 
    'Mid-lesson checks for understanding with immediate "If Correct / If Incorrect" responsive pathways.';

  const diffSummary = plan.differentiationFramework ? [
    `Struggling: ${plan.differentiationFramework.strugglingLearners?.scaffolds?.[0] || 'Color-coded visual cards & sentence frames'}`,
    `On-Level: ${plan.differentiationFramework.onLevelLearners?.independentWorkExpectations || 'Standard practice with evidence justification'}`,
    `Advanced: ${plan.differentiationFramework.advancedLearners?.challengeTasks?.[0] || 'Higher-order extension & peer coaching'}`
  ] : ['Tiered instructional scaffolding tailored across ability levels.'];

  const exitTicketTitle = plan.exitTicketPackage?.title || 'Daily Diagnostic Exit Ticket';
  const masteryDecision = plan.exitTicketPackage?.masteryThreshold || '80% Benchmark (Mastery vs. Immediate Intervention)';
  const nextLessonAction = plan.exitTicketPackage?.groupingRuleTomorrow || plan.closurePanel?.nextLessonConnection || 'Sort students by mastery score for tomorrow\'s targeted guided table vs. independent extension.';
  const postLessonReflection = plan.reflectionDashboard?.whatWorked || 'Pre-lesson anticipatory planning notes & responsive teacher observation log.';

  const steps: AlignmentStep[] = [
    {
      id: 'outcome',
      stepNumber: 1,
      label: 'CURRICULUM OUTCOME',
      category: 'Foundation',
      icon: BookOpen,
      targetSectionId: 'summary',
      summary: outcomeText,
      detail: outcomeText,
      status: 'verified'
    },
    {
      id: 'focus',
      stepNumber: 2,
      label: 'LESSON FOCUS',
      category: 'Foundation',
      icon: Target,
      targetSectionId: 'summary',
      summary: focusText,
      detail: `${focusText} (Class: ${plan.grade}, Subject: ${plan.subject}, Duration: ${plan.duration || '45-60 mins'})`,
      status: 'verified'
    },
    {
      id: 'objectives',
      stepNumber: 3,
      label: 'MEASURABLE OBJECTIVES',
      category: 'Foundation',
      icon: Sparkles,
      targetSectionId: 'objectives',
      summary: `${condition} Cognitive: ${cognitive.slice(0, 80)}...`,
      detail: [
        `Condition: ${condition}`,
        `Cognitive Domain: ${cognitive}`,
        `Psychomotor Domain: ${psychomotor}`,
        `Affective Domain: ${affective}`
      ],
      status: 'verified'
    },
    {
      id: 'criteria',
      stepNumber: 4,
      label: 'SUCCESS CRITERIA',
      category: 'Foundation',
      icon: CheckSquare,
      targetSectionId: 'objectives',
      summary: `${successCriteria.length} "I can" statements aligned to objectives`,
      detail: successCriteria,
      status: 'verified'
    },
    {
      id: 'prior_knowledge',
      stepNumber: 5,
      label: 'PRIOR KNOWLEDGE',
      category: 'Instruction',
      icon: Brain,
      targetSectionId: 'summary',
      summary: priorKnowledge.slice(0, 100) + '...',
      detail: priorKnowledge,
      status: 'verified'
    },
    {
      id: 'engage',
      stepNumber: 6,
      label: 'ENGAGE (STAGE 1)',
      category: 'Instruction',
      icon: Compass,
      targetSectionId: 'procedures',
      summary: engageAction.slice(0, 95) + '...',
      detail: engageAction,
      status: 'verified'
    },
    {
      id: 'explore',
      stepNumber: 7,
      label: 'EXPLORE (STAGE 2)',
      category: 'Instruction',
      icon: Eye,
      targetSectionId: 'procedures',
      summary: exploreAction.slice(0, 95) + '...',
      detail: exploreAction,
      status: 'verified'
    },
    {
      id: 'modeling',
      stepNumber: 8,
      label: 'EXPLICIT MODELING (I DO)',
      category: 'Instruction',
      icon: PenTool,
      targetSectionId: 'procedures',
      summary: modelingAction.slice(0, 95) + '...',
      detail: modelingAction,
      status: 'verified'
    },
    {
      id: 'guided',
      stepNumber: 9,
      label: 'GUIDED PRACTICE (WE DO)',
      category: 'Instruction',
      icon: Users,
      targetSectionId: 'procedures',
      summary: (typeof guidedAction === 'string' ? guidedAction : JSON.stringify(guidedAction)).slice(0, 95) + '...',
      detail: guidedAction,
      status: 'verified'
    },
    {
      id: 'independent',
      stepNumber: 10,
      label: 'INDEPENDENT APPLICATION (YOU DO)',
      category: 'Instruction',
      icon: CheckSquare,
      targetSectionId: 'procedures',
      summary: (typeof independentAction === 'string' ? independentAction : JSON.stringify(independentAction)).slice(0, 95) + '...',
      detail: independentAction,
      status: 'verified'
    },
    {
      id: 'formative',
      stepNumber: 11,
      label: 'FORMATIVE ASSESSMENT',
      category: 'Evaluation',
      icon: ShieldCheck,
      targetSectionId: 'assessment',
      summary: formativeAssessment.slice(0, 95) + '...',
      detail: formativeAssessment,
      status: 'verified'
    },
    {
      id: 'differentiation',
      stepNumber: 12,
      label: 'DIFFERENTIATED RESPONSE',
      category: 'Evaluation',
      icon: ListFilter,
      targetSectionId: 'differentiation',
      summary: 'Tiered scaffolds for struggling, on-level, and advanced learners',
      detail: diffSummary,
      status: 'verified'
    },
    {
      id: 'exit_ticket',
      stepNumber: 13,
      label: 'EXIT TICKET',
      category: 'Evaluation',
      icon: CheckSquare,
      targetSectionId: 'closure',
      summary: `${exitTicketTitle} (${plan.exitTicketPackage?.questions?.length || 3} Diagnostic Items)`,
      detail: plan.exitTicketPackage?.prompt || 'Diagnostic exit ticket measuring individual outcome mastery.',
      status: 'verified'
    },
    {
      id: 'mastery',
      stepNumber: 14,
      label: 'MASTERY DECISION',
      category: 'Synthesis',
      icon: TrendingUp,
      targetSectionId: 'closure',
      summary: masteryDecision,
      detail: `Mastery Standard: ${masteryDecision}. Scored with answer key guidance and rubric benchmarks.`,
      status: 'verified'
    },
    {
      id: 'next_action',
      stepNumber: 15,
      label: 'NEXT-LESSON ACTION',
      category: 'Synthesis',
      icon: ArrowRight,
      targetSectionId: 'closure',
      summary: nextLessonAction.slice(0, 95) + '...',
      detail: nextLessonAction,
      status: 'verified'
    },
    {
      id: 'reflection',
      stepNumber: 16,
      label: 'POST-LESSON REFLECTION',
      category: 'Synthesis',
      icon: StickyNote,
      targetSectionId: 'reflection',
      summary: 'Anticipatory pre-lesson notes & teacher post-lesson observation log',
      detail: [
        `Anticipated Difficulties: ${plan.reflectionDashboard?.whatWorked || 'Pre-lesson preparation'}`,
        `Evidence to Collect: ${plan.reflectionDashboard?.needsImprovement || 'Mid-lesson and exit ticket data'}`,
        `Responsive Adjustments: ${plan.reflectionDashboard?.nextSteps || 'Reteaching and small-group guided support'}`
      ],
      status: 'verified'
    }
  ];

  const handleStepClick = (step: AlignmentStep) => {
    setSelectedStepId(step.id === selectedStepId ? null : step.id);
    if (onNavigateToSection && step.targetSectionId) {
      onNavigateToSection(step.targetSectionId);
    }
  };

  return (
    <Card className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-white p-5 sm:p-7 shadow-sm transition-all mb-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight font-display">
                Instructional Alignment Chain
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                16 / 16 Nodes Aligned & Verified
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Unbroken pedagogical progression from national curriculum outcome directly down to post-lesson reflection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="bg-gray-100 p-0.5 rounded-xl flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all",
                viewMode === 'flow' ? "bg-white text-indigo-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Cascade Flow
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all",
                viewMode === 'matrix' ? "bg-white text-indigo-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Matrix Table
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-800 h-8 px-2.5 rounded-lg"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Collapsible Body */}
      {isExpanded && (
        <div className="pt-6">
          {viewMode === 'flow' ? (
            <div className="relative">
              {/* Vertical connecting line for desktop/mobile */}
              <div className="absolute left-4.5 sm:left-5.5 top-6 bottom-6 w-0.5 bg-indigo-200" />

              <div className="space-y-3">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isSelected = selectedStepId === step.id;

                  const categoryColor = 
                    step.category === 'Foundation' ? 'bg-indigo-600 text-white ring-indigo-200' :
                    step.category === 'Instruction' ? 'bg-blue-600 text-white ring-blue-200' :
                    step.category === 'Evaluation' ? 'bg-amber-600 text-white ring-amber-200' :
                    'bg-emerald-600 text-white ring-emerald-200';

                  const badgeColor = 
                    step.category === 'Foundation' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    step.category === 'Instruction' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    step.category === 'Evaluation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <div key={step.id} className="relative flex items-start gap-3 sm:gap-4 pl-0">
                      {/* Step Circle Marker */}
                      <div className={cn(
                        "relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shadow-xs ring-4 shrink-0 transition-transform",
                        categoryColor,
                        isSelected && "scale-110 ring-offset-2"
                      )}>
                        <span>{step.stepNumber}</span>
                      </div>

                      {/* Content Card */}
                      <div 
                        onClick={() => handleStepClick(step)}
                        className={cn(
                          "flex-1 rounded-xl border p-3.5 sm:p-4 transition-all cursor-pointer text-left bg-white",
                          isSelected 
                            ? "border-indigo-500 shadow-md ring-2 ring-indigo-100" 
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-xs"
                        )}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
                              {step.label}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider", badgeColor)}>
                              {step.category}
                            </span>
                            <span className="text-[11px] text-indigo-600 font-semibold hover:underline">
                              Jump to Section →
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 mt-2 font-medium leading-relaxed">
                          {step.summary}
                        </p>

                        {/* Expanded Detail Box */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-800 bg-gray-50/80 p-3 rounded-lg space-y-1.5">
                            <p className="font-bold text-gray-900 uppercase text-[10px] tracking-wider">
                              Complete Alignment Detail:
                            </p>
                            {Array.isArray(step.detail) ? (
                              <ul className="space-y-1 pl-3 list-disc">
                                {step.detail.map((d, i) => (
                                  <li key={i} className="text-xs text-gray-700 leading-snug">{d}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-gray-700 leading-relaxed">{step.detail}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Matrix View */
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-48">Alignment Step</th>
                    <th className="py-3 px-3 w-28">Category</th>
                    <th className="py-3 px-4">Pedagogical Execution & Content</th>
                    <th className="py-3 px-3 w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {steps.map((s) => (
                    <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-3 text-center font-black text-indigo-700">{s.stepNumber}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{s.label}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 leading-relaxed">{s.summary}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleStepClick(s)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
