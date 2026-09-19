import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Users, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Brain,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { getTeachingModelDefinition, generateAdaptiveDecisions } from '../lib/teachingModelSystem';

interface TeachingModelProfileCardProps {
  teachingModel: string;
  teachingModelProfile?: {
    primaryModel?: string;
    supportingModels?: string[];
    rationale?: string;
    selectionMode?: string;
    modelDetails?: {
      purpose?: string;
      whenAppropriate?: string;
      teacherRole?: string;
      studentRole?: string;
      recommendedActivities?: string[];
      questioningApproach?: string;
      assessmentApproach?: string;
      differentiationConsiderations?: string;
    };
    adaptiveDecisions?: {
      ifDemonstrateUnderstanding: string;
      ifSomeStruggle: string;
      ifManyStruggle: string;
      ifMasteryEarly: string;
    };
    phases?: {
      name: string;
      timeAllocation: string;
      teacherAction: string;
      studentAction: string;
      questions?: string[];
      materials?: string[];
      whatToLookFor?: string;
      differentiation?: string;
      assessmentCheck?: string;
      nextStepGuidance?: string;
    }[];
  };
  topic?: string;
  subject?: string;
}

export const TeachingModelProfileCard: React.FC<TeachingModelProfileCardProps> = ({
  teachingModel,
  teachingModelProfile,
  topic = 'Lesson Topic',
  subject = 'Subject'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'adaptive' | 'roles'>('architecture');

  const modelDef = getTeachingModelDefinition(teachingModelProfile?.primaryModel || teachingModel);
  const primaryName = teachingModelProfile?.primaryModel || modelDef.name;
  const supportingModels = teachingModelProfile?.supportingModels || [];
  const rationale = teachingModelProfile?.rationale || 
    `This lesson is built around ${primaryName} to systematically scaffold student thinking through dedicated pedagogical phases.`;

  const adaptive = teachingModelProfile?.adaptiveDecisions || 
    generateAdaptiveDecisions(modelDef.id, topic, subject);

  return (
    <div 
      className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden mb-6"
      id="teaching-model-profile-banner"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-indigo-200 border border-white/15 shadow-inner shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-white/10 px-2 py-0.5 rounded">
                  Instructional Framework
                </span>
                {teachingModelProfile?.selectionMode && (
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded capitalize">
                    {teachingModelProfile.selectionMode} Mode
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {primaryName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            id="toggle-model-profile-expand"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl border border-white/20 transition-colors"
          >
            <span>{isExpanded ? 'Collapse Architecture' : 'View Architecture & Adaptive Guidance'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Supporting Models Pills */}
        {supportingModels.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-indigo-200 font-medium flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5" /> Supporting Models:
            </span>
            {supportingModels.map((sm, idx) => (
              <span 
                key={idx}
                className="bg-white/15 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border border-white/20"
              >
                {sm}
              </span>
            ))}
          </div>
        )}

        {/* Rationale Quote */}
        <p className="mt-2.5 text-xs text-indigo-100/90 leading-relaxed italic bg-white/5 p-2.5 rounded-xl border border-white/10">
          "{rationale}"
        </p>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-gray-50/50 space-y-4 border-t border-gray-100">
          {/* Subtabs */}
          <div className="flex border-b border-gray-200 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`pb-2 px-2 border-b-2 transition-colors ${
                activeTab === 'architecture'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Instructional Phases
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('adaptive')}
              className={`pb-2 px-2 border-b-2 transition-colors ${
                activeTab === 'adaptive'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Adaptive IF-THEN Decisions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`pb-2 px-2 border-b-2 transition-colors ${
                activeTab === 'roles'
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Classroom Roles & Strategies
            </button>
          </div>

          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modelDef.phases.map((ph, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        {idx + 1}. {ph.phaseName}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        ~{ph.defaultTimePercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mb-2">{ph.focus}</p>
                    <div className="space-y-1 text-[10px] pt-1.5 border-t border-gray-100">
                      <div className="text-gray-700">
                        <span className="font-semibold text-indigo-900">Teacher: </span>{ph.teacherRole}
                      </div>
                      <div className="text-gray-700">
                        <span className="font-semibold text-emerald-900">Student: </span>{ph.studentRole}
                      </div>
                      <div className="text-gray-700">
                        <span className="font-semibold text-amber-900">CFU: </span>{ph.formativeCheckFocus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADAPTIVE DECISIONS */}
          {activeTab === 'adaptive' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                <span className="font-bold">In-the-Moment Pedagogical Adjustments: </span>
                Teachers use these concrete responsive pathways during lesson execution based on live classroom evidence.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. If demonstrate understanding */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>IF Students Demonstrate Understanding:</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {adaptive.ifDemonstrateUnderstanding}
                  </p>
                </div>

                {/* 2. If some struggle */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 text-xs mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>IF Some Students Struggle:</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {adaptive.ifSomeStruggle}
                  </p>
                </div>

                {/* 3. If many struggle */}
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 text-xs mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>IF Many Students Struggle:</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {adaptive.ifManyStruggle}
                  </p>
                </div>

                {/* 4. If mastery early */}
                <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-purple-800 text-xs mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>IF Students Master Early:</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {adaptive.ifMasteryEarly}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROLES & STRATEGIES */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" /> Roles in the Classroom
                </h5>
                <div>
                  <span className="font-semibold text-indigo-900 block">Teacher Role:</span>
                  <p className="text-gray-600 leading-relaxed">{modelDef.teacherRole}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-semibold text-emerald-900 block">Student Role:</span>
                  <p className="text-gray-600 leading-relaxed">{modelDef.studentRole}</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" /> Questioning & Assessment
                </h5>
                <div>
                  <span className="font-semibold text-amber-900 block">Questioning Strategy:</span>
                  <p className="text-gray-600 leading-relaxed">{modelDef.questioningApproach}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-semibold text-purple-900 block">Assessment Strategy:</span>
                  <p className="text-gray-600 leading-relaxed">{modelDef.assessmentApproach}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900 block">Differentiation:</span>
                  <p className="text-gray-600 leading-relaxed">{modelDef.differentiationConsiderations}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
