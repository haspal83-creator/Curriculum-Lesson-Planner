import React from 'react';
import { 
  X, 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Compass, 
  Check 
} from 'lucide-react';
import { Button } from './ui/Button';
import { LessonPlan } from '../types';

interface TeachMeThisTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
}

export const TeachMeThisTopicModal: React.FC<TeachMeThisTopicModalProps> = ({
  isOpen,
  onClose,
  plan
}) => {
  if (!isOpen) return null;

  const briefing = plan.teachMeThisTopic;
  const topic = plan.topic || 'This Topic';
  const grade = plan.grade || 'Primary Level';

  const questions = [
    {
      num: 1,
      title: "What is this topic?",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      content: briefing?.whatIsThisTopic || `${topic} focuses on building clear conceptual understanding and procedural competence in the ${grade} primary curriculum.`
    },
    {
      num: 2,
      title: "Why does it matter?",
      icon: Compass,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      content: briefing?.whyItMatters || `Without mastery of ${topic}, students will struggle with subsequent multi-step skills, problem solving, and standard national assessments.`
    },
    {
      num: 3,
      title: "What are the most important ideas?",
      icon: Lightbulb,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      content: briefing?.mostImportantIdeas || [
        `Anchor abstract rules in concrete physical or visual representations.`,
        `Have students verbalize and write the academic vocabulary explicitly.`,
        `Focus on justification of reasoning, not just mechanical speed.`
      ]
    },
    {
      num: 4,
      title: "What must I understand before teaching it?",
      icon: GraduationCap,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      content: briefing?.mustUnderstandBeforeTeaching || `Be prepared to demonstrate at least one worked example step-by-step on the board while thinking aloud. Keep direct explanation concise so students spend most of the period practicing.`
    },
    {
      num: 5,
      title: "How can I explain it simply?",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      content: briefing?.howToExplainSimply || `Connect to a familiar everyday experience: break the procedure into three clear, numbered steps that any primary student can remember and track.`
    },
    {
      num: 6,
      title: "What example should I use first?",
      icon: CheckCircle2,
      color: "text-teal-600 bg-teal-50 border-teal-100",
      content: briefing?.firstExampleToUse || `Use a clean, foundational problem with simple numbers/words so students focus purely on the new rule or procedure without extraneous cognitive load.`
    },
    {
      num: 7,
      title: "What mistakes should I watch for?",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      content: briefing?.mistakesToWatchFor || [
        `Rushing and skipping the intermediate verification step.`,
        `Misaligning digits, columns, or grammatical structures in notebooks.`,
        `Giving up on multi-step problems without reviewing the anchor chart.`
      ]
    },
    {
      num: 8,
      title: "How can I quickly check understanding?",
      icon: HelpCircle,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
      content: briefing?.quickCheckUnderstanding || `Conduct a 30-second mini-whiteboard check or call-and-response on Step 1 before allowing students to start independent practice.`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                  Teacher Rapid Mastery Briefing
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {plan.grade} • {plan.subject}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Teach Me This Topic: <span className="text-indigo-600">{topic}</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
            title="Close briefing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle Banner */}
        <div className="px-6 sm:px-8 py-3 bg-amber-50/60 border-b border-amber-100/80 text-xs font-semibold text-amber-900 flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Everything you need to confidently teach this lesson in 3 minutes—no outside research required.</span>
        </div>

        {/* Scrollable Questions Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {questions.map((q) => {
              const Icon = q.icon;
              return (
                <div 
                  key={q.num}
                  className="rounded-2xl border border-gray-200/80 bg-white p-5 hover:border-indigo-200 hover:shadow-sm transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${q.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Question {q.num} of 8
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {q.title}
                      </h4>
                    </div>
                  </div>

                  <div className="text-xs text-gray-700 leading-relaxed pl-1 pt-1 flex-1">
                    {Array.isArray(q.content) ? (
                      <ul className="space-y-1.5">
                        {q.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{q.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-gray-700">Curriculum-Aligned Teacher Briefing</span>
          </div>
          <Button 
            onClick={onClose}
            className="px-6 rounded-xl font-bold text-xs shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            I'm Ready to Teach
          </Button>
        </div>
      </div>
    </div>
  );
};
