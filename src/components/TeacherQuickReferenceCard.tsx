import React from 'react';
import { 
  Zap, 
  Clock, 
  Target, 
  BookOpen, 
  Award, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Package, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { LessonPlan } from '../types';

interface TeacherQuickReferenceCardProps {
  plan: LessonPlan;
  onOpenTeachMeTopic?: () => void;
}

export const TeacherQuickReferenceCard: React.FC<TeacherQuickReferenceCardProps> = ({
  plan,
  onOpenTeachMeTopic
}) => {
  const qr = plan.teacherQuickReference;
  const normObj = plan.learningObjectivesBoard;

  const duration = plan.duration || '45 minutes';
  const topic = plan.topic || qr?.topic || 'Core Concept';
  const standard = qr?.standard || `Belize National Primary Curriculum (${plan.grade})`;
  const cycle = plan.cycle || qr?.cycle || 2;
  const strand = plan.strand || qr?.strand || `${plan.subject} Strand`;
  const learningOutcome = plan.learningOutcome || qr?.learningOutcome || 'Master core competency and practical application.';
  const condition = normObj?.condition || qr?.objective?.split(':')[0] || 'Given classroom instruction and resources,';
  const cognitive = normObj?.cognitive || normObj?.knowledge || 'Students will explain and apply the core skill.';
  const psychomotor = normObj?.psychomotor || normObj?.skill || 'Students will write and demonstrate step-by-step procedures.';
  const affective = normObj?.affective || normObj?.attitude || 'Students will collaborate respectfully and show confidence.';
  const keyConcept = qr?.keyConcept || plan.lessonSnapshot?.focus || `Mastery of principles and procedural steps for ${topic}.`;
  const vocabulary = qr?.essentialVocabulary?.length 
    ? qr.essentialVocabulary 
    : (plan.keyVocabularyTable?.map(v => v.term) || ['Core Concept', 'Procedure', 'Rule']);
  const prereqs = qr?.prerequisiteKnowledge || plan.priorKnowledgeActivation?.whatTheyKnow || 'Prior unit competencies and basic grade-level operations.';
  const materials = qr?.materials?.length 
    ? qr.materials 
    : (plan.materialsBoard?.map(m => m.name) || plan.materials || ['Student Exercise Books', 'Board / Chart Paper', 'Manipulatives']);
  const strategy = qr?.teachingStrategy || plan.teachingModel || 'Direct Instruction (I Do, We Do, You Do) with Concrete-Pictorial-Abstract Scaffolding';
  const assessment = qr?.assessment || 'Formative questioning, guided pair checks, independent problem set, and exit ticket';
  const masteryTarget = qr?.masteryTarget || '80% of students independently solve target problems accurately on exit ticket.';

  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-6 sm:p-8 shadow-sm">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-100/70">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                Quick Reference
              </span>
              <span className="text-xs font-bold text-gray-500">
                {standard}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
              Teacher Quick Reference: <span className="text-indigo-600">{topic}</span>
            </h2>
          </div>
        </div>

        {onOpenTeachMeTopic && (
          <button
            onClick={onOpenTeachMeTopic}
            className="self-start sm:self-auto h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Teach Me This Topic</span>
          </button>
        )}
      </div>

      {/* Grid of Key Reference Fields */}
      <div 
        className="grid gap-4 pt-6 w-full"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
      >
        {/* Subject & Cycle */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Subject & Cycle
          </span>
          <p className="text-sm font-bold text-gray-900">{plan.subject}</p>
          <p className="text-xs text-indigo-600 font-semibold">{plan.grade} • Cycle {cycle}</p>
        </div>

        {/* Strand & Topic */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-500" /> Strand & Topic
          </span>
          <p className="text-sm font-bold text-gray-900 truncate" title={topic}>{topic}</p>
          <p className="text-xs text-gray-500 truncate" title={strand}>{strand}</p>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" /> Lesson Duration
          </span>
          <p className="text-sm font-bold text-emerald-700">{duration}</p>
          <p className="text-xs text-gray-500 font-medium">Planned Instructional Time</p>
        </div>

        {/* Mastery Target */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Mastery Target
          </span>
          <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2" title={masteryTarget}>{masteryTarget}</p>
        </div>
      </div>

      {/* Curriculum Learning Outcome & One Shared Condition Objective */}
      <div className="mt-4 bg-white rounded-2xl p-5 border border-indigo-100/90 shadow-xs space-y-4 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Curriculum Learning Outcome
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900 leading-relaxed pl-6">
            {learningOutcome}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
              One Shared Condition Learning Objectives
            </span>
          </div>
          
          <div className="pl-6 space-y-2.5">
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl px-4 py-3 w-full min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">Shared Condition:</span>
              <p className="text-sm font-bold text-purple-900 leading-relaxed italic break-words">
                "{condition}"
              </p>
            </div>

            <div 
              className="grid gap-3 text-xs w-full min-w-0"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
            >
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block mb-1">1. Cognitive Domain</span>
                <p className="text-gray-800 leading-snug font-medium break-words">{cognitive}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">2. Psychomotor / Skills</span>
                <p className="text-gray-800 leading-snug font-medium break-words">{psychomotor}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 block mb-1">3. Affective Domain</span>
                <p className="text-gray-800 leading-snug font-medium break-words">{affective}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Concept, Prereqs, Materials, Vocab & Strategy Row */}
      <div 
        className="grid gap-4 mt-4 text-xs w-full min-w-0"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
      >
        {/* Key Concept & Strategy */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Key Concept</span>
            <p className="text-gray-800 font-semibold leading-relaxed">{keyConcept}</p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Teaching Strategy</span>
            <p className="text-indigo-700 font-medium leading-relaxed">{strategy}</p>
          </div>
        </div>

        {/* Essential Vocabulary & Prerequisites */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">Essential Vocabulary</span>
            <div className="flex flex-wrap gap-1.5">
              {vocabulary.map((v, i) => (
                <span key={i} className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100/80 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Prerequisite Knowledge</span>
            <p className="text-gray-700 font-medium leading-relaxed">{prereqs}</p>
          </div>
        </div>

        {/* Materials & Assessment */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200/70 shadow-xs space-y-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1.5">
              <Package className="w-3.5 h-3.5 text-gray-400" /> Materials Needed
            </span>
            <div className="flex flex-wrap gap-1.5">
              {materials.slice(0, 4).map((m, i) => (
                <span key={i} className="inline-block bg-gray-50 text-gray-700 border border-gray-200/60 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                  {m}
                </span>
              ))}
              {materials.length > 4 && (
                <span className="text-[10px] text-gray-400 font-bold self-center">+{materials.length - 4} more</span>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" /> Assessment Method
            </span>
            <p className="text-gray-700 font-medium leading-relaxed">{assessment}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
