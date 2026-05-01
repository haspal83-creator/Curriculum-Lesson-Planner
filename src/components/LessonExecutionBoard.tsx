import React from 'react';
import { Clock, User, GraduationCap, HelpCircle, Package, PenTool, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { Card } from './ui';
import { cn } from '../lib/utils';
import { LessonPlan } from '../types';

interface LessonExecutionStepProps {
  step: any;
  index: number;
  isTeachMode?: boolean;
}

const LessonExecutionStep = ({ 
  step, 
  index, 
  isTeachMode 
}: LessonExecutionStepProps) => {
  const displayTitle = step.phase || step.title;
  const displayTime = step.timeAllocation || step.time;
  const displayTeacherActions = step.teacherActions;
  const displayStudentActions = step.studentActions;

  return (
    <Card className={cn(
      "w-full overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[16px] bg-white",
      isTeachMode ? "p-10 border-indigo-200" : "p-8"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm">
            {index + 1}
          </div>
          <h4 className={cn(
            "font-black text-gray-900 font-display uppercase tracking-tight",
            isTeachMode ? "text-3xl" : "text-xl"
          )}>{displayTitle}</h4>
        </div>
        {displayTime && (
          <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-2 rounded-full shadow-sm">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">{displayTime}</span>
          </div>
        )}
      </div>

      {/* Content Stack */}
      <div className="space-y-10">
        {/* Teacher Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] px-2">
            <User className="w-4 h-4" /> Teacher Actions
          </div>
          <div className={cn(
            "bg-indigo-50/20 rounded-2xl border border-indigo-50/50",
            isTeachMode ? "p-8" : "p-6"
          )}>
            <div className={cn(
              "prose prose-indigo max-w-none text-gray-700 font-medium leading-relaxed",
              isTeachMode ? "text-2xl" : "text-base"
            )}>
              <Markdown>{Array.isArray(displayTeacherActions) ? displayTeacherActions.join('\n\n') : displayTeacherActions}</Markdown>
            </div>
          </div>
        </div>

        {/* Student Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[10px] px-2">
            <GraduationCap className="w-4 h-4" /> Student Actions
          </div>
          <div className={cn(
            "bg-emerald-50/20 rounded-2xl border border-emerald-50/50",
            isTeachMode ? "p-8" : "p-6"
          )}>
            <div className={cn(
              "prose prose-emerald max-w-none text-gray-700 font-medium leading-relaxed",
              isTeachMode ? "text-2xl" : "text-base"
            )}>
              <Markdown>{Array.isArray(displayStudentActions) ? displayStudentActions.join('\n\n') : displayStudentActions}</Markdown>
            </div>
          </div>
        </div>

        {/* Strategy Section (New) */}
        {step.engagementStrategy && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-black uppercase tracking-widest text-[10px] px-2">
              <Sparkles className="w-4 h-4" /> Teaching Strategy
            </div>
            <div className={cn(
              "bg-amber-50/20 rounded-2xl border border-amber-50/50",
              isTeachMode ? "p-8" : "p-6"
            )}>
              <p className={cn(
                "font-bold text-amber-900 leading-relaxed",
                isTeachMode ? "text-2xl" : "text-base"
              )}>
                {step.engagementStrategy}
              </p>
            </div>
          </div>
        )}

        {/* Support Metadata (Optional) */}
        {(step.questionsToAsk?.length > 0 || step.materialsUsed?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-50">
            {step.questionsToAsk?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Key Questions
                </p>
                <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100/50">
                  <ul className="space-y-2">
                    {step.questionsToAsk.map((q: string, i: number) => (
                      <li key={i} className="text-sm font-bold text-amber-900 flex gap-2">
                        <span className="text-amber-400">•</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {step.materialsUsed?.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4" /> Resources
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.materialsUsed.map((m: string, i: number) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface LessonExecutionBoardProps {
  plan: LessonPlan;
  isTeachMode?: boolean;
  compact?: boolean;
}

export const LessonExecutionBoard: React.FC<LessonExecutionBoardProps> = ({ 
  plan, 
  isTeachMode,
  compact
}) => {
  if (compact) {
    const steps = plan.executionBoard || [
      { phase: "Introduction / Set Induction", timeAllocation: "10 mins" },
      { phase: "Teacher Modeling (I Do)", timeAllocation: "20 mins" },
      { phase: "Guided Practice (We Do)", timeAllocation: "15 mins" },
      { phase: "Independent Practice (You Do)", timeAllocation: "10 mins" },
      { phase: "Closure / Review", timeAllocation: "5 mins" },
    ];

    return (
      <div className="space-y-3">
        {steps.map((step: any, i: number) => (
          <div key={i} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                {i + 1}
              </div>
              <span className="text-[13px] font-bold text-gray-700 truncate max-w-[150px]">
                {step.phase || step.title}
              </span>
            </div>
            { (step.timeAllocation || step.time) && (
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                <Clock className="w-2 h-2" />
                {step.timeAllocation || step.time}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="procedures" className="space-y-8">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
          <PenTool className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-[32px] font-black text-gray-900 font-display uppercase tracking-tight">Lesson Execution Flow</h3>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Step-by-step teaching delivery roadmap</p>
        </div>
      </div>

      <div className="space-y-8">
        {plan.executionBoard ? (
          plan.executionBoard.map((step, i) => (
            <LessonExecutionStep 
              key={i}
              step={step}
              isTeachMode={isTeachMode}
              index={i}
            />
          ))
        ) : (
          <div className="space-y-8">
            <LessonExecutionStep 
              step={{
                phase: "Introduction / Set Induction",
                timeAllocation: "10 mins",
                teacherActions: plan.introduction,
                studentActions: "Listen and participate in the opening activity.",
                questionsToAsk: ["What do you already know about this topic?", "How does this relate to our previous lesson?"]
              }}
              isTeachMode={isTeachMode}
              index={0}
            />
            <LessonExecutionStep 
              step={{
                phase: "Teacher Modeling (I Do)",
                timeAllocation: "20 mins",
                teacherActions: plan.development,
                studentActions: "Observe the demonstration and take notes.",
                materialsUsed: ["Visual Aids", "Board Plan"]
              }}
              isTeachMode={isTeachMode}
              index={1}
            />
            <LessonExecutionStep 
              step={{
                phase: "Guided Practice (We Do)",
                timeAllocation: "15 mins",
                teacherActions: plan.guidedPractice,
                studentActions: "Work with the teacher to solve examples."
              }}
              isTeachMode={isTeachMode}
              index={2}
            />
            <LessonExecutionStep 
              step={{
                phase: "Independent Practice (You Do Alone)",
                timeAllocation: "10 mins",
                teacherActions: plan.independentPractice,
                studentActions: "Complete the worksheet or activity independently.",
                materialsUsed: ["Worksheet A"]
              }}
              isTeachMode={isTeachMode}
              index={3}
            />
            <LessonExecutionStep 
              step={{
                phase: "Closure / Review",
                timeAllocation: "5 mins",
                teacherActions: plan.closure,
                studentActions: "Summarize learning and complete exit ticket.",
                questionsToAsk: ["What is the most important thing you learned today?"]
              }}
              isTeachMode={isTeachMode}
              index={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};
