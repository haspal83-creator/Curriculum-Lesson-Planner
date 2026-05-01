import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  MessageSquare, 
  Users, 
  Target,
  ChevronRight,
  Save,
  Zap
} from 'lucide-react';
import { Button, Card, Input, Select } from './ui';
import { 
  LessonPlan, 
  AssessmentRecord, 
  LessonDeliveryStatus, 
  StudentUnderstandingLevel, 
  ObjectiveMasteryStatus 
} from '../types';
import { cn } from '../lib/utils';

interface PostLessonCheckInProps {
  lesson: LessonPlan;
  onSave: (record: Omit<AssessmentRecord, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  onCancel: () => void;
}

export function PostLessonCheckIn({ lesson, onSave, onCancel }: PostLessonCheckInProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<LessonDeliveryStatus>('Fully taught');
  const [understandingLevel, setUnderstandingLevel] = useState<StudentUnderstandingLevel>('Most understood');
  const [objectiveMastery, setObjectiveMastery] = useState<ObjectiveMasteryStatus>('Mastered');
  
  const [notes, setNotes] = useState({
    whatWentWell: '',
    whatStudentsStruggledWith: '',
    whatNeedsReteaching: '',
    behaviorPacingIssues: '',
    studentsNeedingSupport: ''
  });

  const [results, setResults] = useState({
    studentsMastered: 0,
    studentsNeedingSupport: 0,
    commonErrors: [] as string[],
    nextStepRecommendation: ''
  });

  const [newError, setNewError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddError = () => {
    if (newError.trim()) {
      setResults(prev => ({
        ...prev,
        commonErrors: [...prev.commonErrors, newError.trim()]
      }));
      setNewError('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        lessonId: lesson.id!,
        lessonType: 'standalone', // or detect from lesson
        lessonTitle: lesson.lessonTitle,
        grade: lesson.grade,
        subject: lesson.subject,
        cycle: lesson.cycle,
        week: lesson.week,
        outcome: lesson.topic || lesson.lessonTitle,
        date: new Date().toISOString().split('T')[0],
        deliveryStatus,
        understandingLevel,
        objectiveMastery,
        classPerformanceNotes: notes,
        results: {
          ...results,
          nextStepRecommendation: results.nextStepRecommendation || (objectiveMastery === 'Mastered' ? 'Move on to next lesson' : 'Schedule reteach')
        },
        misconceptionsLogged: results.commonErrors
      });
      onCancel();
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-indigo-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Post-Lesson Check-In</h2>
              <p className="text-sm text-gray-500">{lesson.lessonTitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>✕</Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Section A: Delivery Status */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
              <ChevronRight className="w-4 h-4" />
              A. Lesson Delivery Status
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['Fully taught', 'Partially taught', 'Not completed', 'Postponed', 'Interrupted'] as LessonDeliveryStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setDeliveryStatus(status)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all text-left",
                    deliveryStatus === status 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-indigo-200"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          {/* Section B: Student Understanding */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
              <ChevronRight className="w-4 h-4" />
              B. Student Understanding
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['Most understood', 'Some understood', 'Many struggled', 'Needs reteaching', 'Needs more practice'] as StudentUnderstandingLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setUnderstandingLevel(level)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all flex items-center gap-3",
                    understandingLevel === level 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-emerald-200"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    understandingLevel === level ? "bg-white" : "bg-emerald-400"
                  )} />
                  {level}
                </button>
              ))}
            </div>
          </section>

          {/* Section C: Objective Mastery */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
              <ChevronRight className="w-4 h-4" />
              C. Objective Mastery
            </div>
            <div className="flex gap-3">
              {(['Mastered', 'Partially met', 'Not met'] as ObjectiveMasteryStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setObjectiveMastery(status)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all",
                    objectiveMastery === status 
                      ? "bg-amber-600 border-amber-600 text-white shadow-md" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-amber-200"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          {/* Section D: Performance Notes */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
              <ChevronRight className="w-4 h-4" />
              D. Class Performance Notes
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    What went well?
                  </label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    placeholder="E.g., Students loved the hands-on activity..."
                    value={notes.whatWentWell}
                    onChange={e => setNotes(prev => ({ ...prev, whatWentWell: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    What did they struggle with?
                  </label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    placeholder="E.g., Confused about the numerator..."
                    value={notes.whatStudentsStruggledWith}
                    onChange={e => setNotes(prev => ({ ...prev, whatStudentsStruggledWith: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Students needing extra support
                </label>
                <Input 
                  placeholder="E.g., John D., Sarah M. (needs more reading support)"
                  value={notes.studentsNeedingSupport}
                  onChange={e => setNotes(prev => ({ ...prev, studentsNeedingSupport: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* Section E: Assessment Results */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
              <ChevronRight className="w-4 h-4" />
              E. Assessment Results
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Students who mastered</label>
                <Input 
                  type="number" 
                  placeholder="Count" 
                  value={results.studentsMastered}
                  onChange={e => setResults(prev => ({ ...prev, studentsMastered: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Students needing support</label>
                <Input 
                  type="number" 
                  placeholder="Count" 
                  value={results.studentsNeedingSupport}
                  onChange={e => setResults(prev => ({ ...prev, studentsNeedingSupport: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Common Misconceptions / Errors
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a common error..." 
                  value={newError}
                  onChange={e => setNewError(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddError()}
                />
                <Button variant="secondary" onClick={handleAddError}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {results.commonErrors.map((err, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium flex items-center gap-2">
                    {err}
                    <button onClick={() => setResults(prev => ({ ...prev, commonErrors: prev.commonErrors.filter((_, idx) => idx !== i) }))}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Intelligence: Next Step Recommendation */}
          <section className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Zap className="w-4 h-4" />
              Recommended Next Step
            </div>
            <Select 
              value={results.nextStepRecommendation}
              onChange={(val) => setResults(prev => ({ ...prev, nextStepRecommendation: val }))}
              options={[
                { label: 'Select a recommendation...', value: '' },
                { label: 'Move on to next lesson', value: 'Move on to next lesson' },
                { label: 'Add one more practice lesson', value: 'Add one more practice lesson' },
                { label: 'Schedule reteach', value: 'Schedule reteach' },
                { label: 'Assign intervention worksheet', value: 'Assign intervention worksheet' },
                { label: 'Review during warm-up tomorrow', value: 'Review during warm-up tomorrow' },
                { label: 'Add to Friday revision', value: 'Add to Friday revision' },
                { label: 'Use small-group support next lesson', value: 'Use small-group support next lesson' },
                { label: 'Delay next concept until mastery improves', value: 'Delay next concept until mastery improves' }
              ]}
              className="bg-white"
            />
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Complete Check-In'}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
