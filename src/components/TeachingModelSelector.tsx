import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Layers, 
  Info, 
  Check, 
  ChevronRight, 
  Clock, 
  Compass, 
  Users, 
  HelpCircle, 
  Target, 
  ShieldAlert, 
  BookOpen,
  X,
  RotateCcw
} from 'lucide-react';
import { 
  getAllTeachingModels, 
  getTeachingModelDefinition, 
  recommendTeachingModel,
  normalizeTeachingModelId,
  TeachingModelDefinition,
  ModelRecommendationResult
} from '../lib/teachingModelSystem';

export interface TeachingModelSelectorProps {
  grade?: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  duration?: string;
  learningOutcome?: string;
  objectives?: string[];
  mode: 'auto' | 'manual' | 'hybrid';
  onModeChange: (mode: 'auto' | 'manual' | 'hybrid') => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  supportingModels: string[];
  onSupportingModelsChange: (models: string[]) => void;
  onRecommendationChange?: (rec: ModelRecommendationResult) => void;
  compact?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All 20 Models',
  direct: 'Direct & Explicit',
  inquiry: 'Inquiry & Discovery',
  problem: 'Problem & Project',
  cooperative: 'Collaborative & Peer',
  discourse: 'Discourse & Socratic',
  adaptive: 'Adaptive & Stations',
  experiential: 'Active & Experiential'
};

export const TeachingModelSelector: React.FC<TeachingModelSelectorProps> = ({
  grade = 'Standard 4',
  subject = 'Mathematics',
  topic = '',
  subtopic = '',
  duration = '45 minutes',
  learningOutcome = '',
  objectives = [],
  mode,
  onModeChange,
  selectedModel,
  onModelChange,
  supportingModels,
  onSupportingModelsChange,
  onRecommendationChange,
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectingModel, setInspectingModel] = useState<TeachingModelDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allModels = useMemo(() => getAllTeachingModels(), []);

  // Compute recommendation based on context
  const recommendation = useMemo(() => {
    return recommendTeachingModel({
      subject,
      grade,
      topic: topic || 'Unit Topic',
      subtopic,
      duration,
      learningOutcome,
      objectives,
      preferredMode: mode,
      manualPrimary: mode !== 'auto' ? selectedModel : undefined,
      manualSupporting: mode === 'manual' ? supportingModels : undefined
    });
  }, [subject, grade, topic, subtopic, duration, learningOutcome, objectives, mode, selectedModel, supportingModels]);

  // Sync recommendation to parent if changed
  useEffect(() => {
    if (onRecommendationChange) {
      onRecommendationChange(recommendation);
    }
    if (mode === 'auto' && recommendation.primaryModel.name !== selectedModel) {
      onModelChange(recommendation.primaryModel.name);
      onSupportingModelsChange(recommendation.supportingModels.map(m => m.name));
    }
  }, [mode, recommendation.primaryModel.name]);

  // Filtered models for manual select
  const filteredModels = useMemo(() => {
    return allModels.filter(m => {
      const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subjectAffinities.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [allModels, selectedCategory, searchQuery]);

  const currentPrimaryDef = useMemo(() => {
    return getTeachingModelDefinition(selectedModel);
  }, [selectedModel]);

  const toggleSupportingModel = (modelName: string) => {
    if (supportingModels.includes(modelName)) {
      onSupportingModelsChange(supportingModels.filter(m => m !== modelName));
    } else {
      if (supportingModels.length >= 3) {
        // Replace oldest or cap at 3
        onSupportingModelsChange([...supportingModels.slice(1), modelName]);
      } else {
        onSupportingModelsChange([...supportingModels, modelName]);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden" id="teaching-model-selector-container">
      {/* Mode Navigation Bar */}
      <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 tracking-tight">Instructional Teaching Model</h4>
            <p className="text-[10px] text-gray-500">Select how pedagogical phases, actions, and decisions are architected</p>
          </div>
        </div>

        {/* 3 Modes: Auto, Manual, Hybrid */}
        <div className="flex items-center bg-gray-200/70 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            id="teaching-model-mode-auto"
            onClick={() => {
              onModeChange('auto');
              onModelChange(recommendation.primaryModel.name);
              onSupportingModelsChange(recommendation.supportingModels.map(m => m.name));
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] ${
              mode === 'auto'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Auto Select</span>
            <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1 py-0.2 rounded font-black uppercase tracking-wider">AI</span>
          </button>

          <button
            type="button"
            id="teaching-model-mode-manual"
            onClick={() => onModeChange('manual')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] ${
              mode === 'manual'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>Manual Select</span>
          </button>

          <button
            type="button"
            id="teaching-model-mode-hybrid"
            onClick={() => onModeChange('hybrid')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-[11px] ${
              mode === 'hybrid'
                ? 'bg-white text-emerald-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hybrid Blend</span>
          </button>
        </div>
      </div>

      {/* Mode Content */}
      <div className="p-4 space-y-4">
        {/* AUTO SELECT VIEW */}
        {mode === 'auto' && (
          <div className="space-y-3" id="teaching-model-auto-view">
            <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/60 rounded-xl border border-indigo-100 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> AI Pedagogical Match
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">
                    {recommendation.primaryModel.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {recommendation.primaryModel.purpose}
                  </p>
                </div>
                <button
                  type="button"
                  id="inspect-auto-model-btn"
                  onClick={() => setInspectingModel(recommendation.primaryModel)}
                  className="shrink-0 text-xs text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200 font-semibold shadow-xs flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" /> Details
                </button>
              </div>

              {/* Rationale */}
              <div className="text-xs bg-white/90 p-2.5 rounded-lg border border-indigo-100/80 text-gray-700">
                <span className="font-bold text-indigo-900">Selection Rationale: </span>
                {recommendation.rationale}
              </div>

              {/* Supporting Models & Phases preview */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-gray-500">Supporting Models:</span>
                {recommendation.supportingModels.map(sm => (
                  <span 
                    key={sm.id} 
                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-gray-800 border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-emerald-600" /> {sm.name}
                  </span>
                ))}
              </div>

              {/* Key Phases Timeline Preview */}
              <div className="pt-2 border-t border-indigo-100/80">
                <div className="text-[11px] font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-500" /> Lesson Architecture ({duration})</span>
                  <span className="text-[10px] text-gray-500 font-normal">{recommendation.phases.length} Phases</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                  {recommendation.phases.map((ph, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-gray-200 text-left">
                      <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight truncate">
                        {ph.phaseName}
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5 font-medium">
                        {recommendation.phaseTimings[idx]?.timeAllocation || '10 min'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MANUAL SELECT VIEW */}
        {mode === 'manual' && (
          <div className="space-y-4" id="teaching-model-manual-view">
            {/* Search & Category Filter */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-gray-800">
                  Select Primary Model <span className="text-gray-400 font-normal">(1 of 20)</span>
                </label>
                <div className="w-full sm:w-48">
                  <input
                    type="text"
                    id="teaching-model-search-input"
                    placeholder="Search 20 models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategory(catKey)}
                    className={`text-[11px] px-2 py-1 rounded-md transition-colors font-medium ${
                      selectedCategory === catKey
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {catLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredModels.map(m => {
                const isSelected = selectedModel.toLowerCase().trim() === m.name.toLowerCase().trim() ||
                                   selectedModel.toLowerCase().trim() === m.shortName.toLowerCase().trim() ||
                                   selectedModel.toLowerCase().trim() === m.id.toLowerCase().trim();
                return (
                  <div
                    key={m.id}
                    id={`model-card-${m.id}`}
                    onClick={() => onModelChange(m.name)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all text-left flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-gray-900 leading-tight">
                          {m.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {m.purpose}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400 font-medium">
                        {m.phases.length} phases
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingModel(m);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supporting Models Multi-Select */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-800">
                  Select Supporting Models <span className="text-gray-400 font-normal">(Optional, up to 3)</span>
                </label>
                <span className="text-[10px] text-gray-500">{supportingModels.length} selected</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Supporting models infuse specific phases (e.g. Cooperative Learning during guided practice, Scaffolding during independent work).
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allModels
                  .filter(m => m.name !== selectedModel)
                  .map(m => {
                    const isChecked = supportingModels.includes(m.name);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSupportingModel(m.name)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                        {m.shortName || m.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* HYBRID BLEND VIEW */}
        {mode === 'hybrid' && (
          <div className="space-y-4" id="teaching-model-hybrid-view">
            <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-blue-50/60 rounded-xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                    <Layers className="w-3 h-3 text-emerald-700" /> Hybrid Instructional Blend
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    You choose the primary model architecture, and the AI automatically selects and weaves the optimal supporting models.
                  </p>
                </div>
              </div>

              {/* Primary Model Dropdown */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-2">
                <label className="text-xs font-bold text-gray-800 block">
                  Choose Your Anchor Primary Model:
                </label>
                <select
                  id="hybrid-primary-model-select"
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-hidden focus:border-emerald-500"
                >
                  {allModels.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.phases.length} phases — {m.category})
                    </option>
                  ))}
                </select>
                {currentPrimaryDef && (
                  <p className="text-[11px] text-gray-600 italic">
                    "{currentPrimaryDef.purpose}"
                  </p>
                )}
              </div>

              {/* AI Auto-Selected Supporting Complement */}
              <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI-Blended Supporting Models:
                  </span>
                  <button
                    type="button"
                    onClick={() => onSupportingModelsChange(recommendation.supportingModels.map(m => m.name))}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Re-optimize
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendation.supportingModels.map(sm => (
                    <span 
                      key={sm.id}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> {sm.name}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed pt-1 border-t border-gray-100">
                  <span className="font-semibold text-gray-800">Synergy: </span>
                  {recommendation.rationale}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODEL INSPECTOR MODAL */}
      {inspectingModel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" id="teaching-model-details-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Instructional Model Blueprint
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {inspectingModel.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Category: <span className="font-semibold text-gray-700 capitalize">{inspectingModel.category}</span> | Best for: {inspectingModel.subjectAffinities.join(', ')}
                </p>
              </div>
              <button
                type="button"
                id="close-model-inspector"
                onClick={() => setInspectingModel(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Purpose & When Appropriate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  <h5 className="font-bold text-blue-900 mb-1 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-600" /> Pedagogical Purpose
                  </h5>
                  <p className="text-gray-700 leading-relaxed">{inspectingModel.purpose}</p>
                </div>
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <h5 className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> When Most Appropriate
                  </h5>
                  <p className="text-gray-700 leading-relaxed">{inspectingModel.whenAppropriate}</p>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-900 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-600" /> Classroom Roles & Dynamic
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-indigo-900 block">Teacher Role:</span>
                    <p className="text-gray-600">{inspectingModel.teacherRole}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-900 block">Student Role:</span>
                    <p className="text-gray-600">{inspectingModel.studentRole}</p>
                  </div>
                </div>
              </div>

              {/* Lesson Phases */}
              <div className="space-y-2">
                <h5 className="font-bold text-gray-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Lesson Phases ({inspectingModel.phases.length} Phases)
                </h5>
                <div className="space-y-2">
                  {inspectingModel.phases.map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 text-xs">
                          {idx + 1}. {p.phaseName}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          ~{p.defaultTimePercent}% of time
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1"><span className="font-medium text-gray-700">Focus:</span> {p.focus}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200/60">
                        <div><span className="font-medium text-gray-700">Questioning:</span> {p.keyQuestioningStrategy}</div>
                        <div><span className="font-medium text-gray-700">Check for Understanding:</span> {p.formativeCheckFocus}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questioning & Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70">
                  <h5 className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" /> Questioning Style
                  </h5>
                  <p className="text-gray-700">{inspectingModel.questioningApproach}</p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/70">
                  <h5 className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-purple-700" /> Assessment Approach
                  </h5>
                  <p className="text-gray-700">{inspectingModel.assessmentApproach}</p>
                </div>
              </div>

              {/* Differentiation */}
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/70">
                <h5 className="font-bold text-indigo-900 mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-700" /> Differentiation Considerations
                </h5>
                <p className="text-gray-700">{inspectingModel.differentiationConsiderations}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInspectingModel(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onModelChange(inspectingModel.name);
                  setInspectingModel(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Select This Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
