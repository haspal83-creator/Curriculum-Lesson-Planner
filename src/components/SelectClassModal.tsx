import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeLevel, ALL_GRADE_LEVELS } from '../types';
import { Button, Card } from './ui';
import { Users, ChevronRight, X, Star, Check, Sparkles, BookOpen, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

interface SelectClassModalProps {
  isOpen: boolean;
  activeClass?: GradeLevel | null;
  assignedClasses?: GradeLevel[];
  onSelect: (grade: GradeLevel) => void;
  onClose?: () => void;
  onSaveAssignedClasses?: (classes: GradeLevel[]) => Promise<void>;
}

export const SelectClassModal: React.FC<SelectClassModalProps> = ({
  isOpen,
  activeClass,
  assignedClasses = [],
  onSelect,
  onClose,
  onSaveAssignedClasses
}) => {
  const [isManagingClasses, setIsManagingClasses] = useState(false);
  const [selectedAssigned, setSelectedAssigned] = useState<GradeLevel[]>(
    assignedClasses.length > 0 ? assignedClasses : ['Standard 4', 'Standard 5']
  );
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when assignedClasses prop changes
  React.useEffect(() => {
    if (assignedClasses.length > 0) {
      setSelectedAssigned(assignedClasses);
    }
  }, [assignedClasses]);

  if (!isOpen) return null;

  const toggleAssigned = (grade: GradeLevel) => {
    if (selectedAssigned.includes(grade)) {
      if (selectedAssigned.length <= 1) return; // Keep at least one
      setSelectedAssigned(selectedAssigned.filter(g => g !== grade));
    } else {
      setSelectedAssigned([...selectedAssigned, grade]);
    }
  };

  const handleSaveAssigned = async () => {
    if (onSaveAssignedClasses) {
      setIsSaving(true);
      try {
        await onSaveAssignedClasses(selectedAssigned);
        setIsManagingClasses(false);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsManagingClasses(false);
    }
  };

  const getDivisionInfo = (grade: GradeLevel) => {
    if (grade.startsWith('Infant')) {
      return { division: 'Early Childhood', range: 'Ages 4–6', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (grade === 'Standard 1' || grade === 'Standard 2') {
      return { division: 'Lower Primary', range: 'Ages 6–8', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (grade === 'Standard 3' || grade === 'Standard 4') {
      return { division: 'Middle Primary', range: 'Ages 8–10', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    }
    return { division: 'Upper Primary', range: 'Ages 10–12', color: 'text-purple-600 bg-purple-50 border-purple-200' };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl my-8"
        >
          <Card className="p-6 sm:p-8 shadow-2xl border-indigo-100 relative overflow-hidden bg-white">
            {/* Close button if user already has an active class */}
            {activeClass && onClose && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-100">
                <Users className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {isManagingClasses ? 'Configure My Classes' : 'Switch Workspace Class'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                {isManagingClasses 
                  ? 'Select the classes you actively teach so they appear in your quick-switch shortcuts.' 
                  : 'Select any class below to switch your lesson plans, curriculum mapping, and dashboard.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl mb-6 border border-gray-100">
              <button
                onClick={() => setIsManagingClasses(false)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                  !isManagingClasses 
                    ? "bg-white text-indigo-900 shadow-sm border border-gray-100" 
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Select Class
              </button>
              <button
                onClick={() => setIsManagingClasses(true)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                  isManagingClasses 
                    ? "bg-white text-indigo-900 shadow-sm border border-gray-100" 
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                <Star className="w-3.5 h-3.5" />
                Manage My Teaching Classes
              </button>
            </div>

            {/* Content: Manage Mode */}
            {isManagingClasses ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_GRADE_LEVELS.map((grade) => {
                    const isChecked = selectedAssigned.includes(grade);
                    const info = getDivisionInfo(grade);
                    return (
                      <div
                        key={`manage-${grade}`}
                        onClick={() => toggleAssigned(grade)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between",
                          isChecked 
                            ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                            : "border-gray-100 bg-white hover:border-gray-200"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{grade}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", info.color)}>
                              {info.division}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{info.range}</p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                          isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300 bg-white"
                        )}>
                          {isChecked && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button variant="ghost" onClick={() => setIsManagingClasses(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveAssigned} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Content: Selection Mode */
              <div className="space-y-6">
                {/* My Classes Quick Switch */}
                {selectedAssigned.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5 px-1">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        My Assigned Classes
                      </span>
                      <button
                        onClick={() => setIsManagingClasses(true)}
                        className="text-xs text-indigo-600 hover:underline font-semibold"
                      >
                        Edit List
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedAssigned.map((grade) => {
                        const isActive = activeClass === grade;
                        const info = getDivisionInfo(grade);
                        return (
                          <button
                            key={`assigned-grid-${grade}`}
                            onClick={() => onSelect(grade)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all relative group flex items-center justify-between",
                              isActive
                                ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                                : "border-indigo-100 bg-indigo-50/20 hover:border-indigo-300 hover:bg-indigo-50/50"
                            )}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{grade}</span>
                                {isActive && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", info.color)}>
                                  {info.division}
                                </span>
                                <span className="text-[11px] text-gray-400">{info.range}</span>
                              </div>
                            </div>
                            <ChevronRight className={cn(
                              "w-5 h-5 text-gray-300 transition-transform group-hover:translate-x-1",
                              isActive ? "text-indigo-600" : "group-hover:text-indigo-600"
                            )} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Classes */}
                <div>
                  <div className="mb-2.5 px-1">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      All Belize Curriculum Classes
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_GRADE_LEVELS.map((grade) => {
                      const isActive = activeClass === grade;
                      const isAssigned = selectedAssigned.includes(grade);
                      const info = getDivisionInfo(grade);
                      return (
                        <button
                          key={`all-grid-${grade}`}
                          onClick={() => onSelect(grade)}
                          className={cn(
                            "p-3.5 rounded-xl border text-left transition-all relative group flex items-center justify-between",
                            isActive
                              ? "border-indigo-600 bg-indigo-50/60 font-semibold shadow-xs"
                              : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">{grade}</span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">
                                  Current
                                </span>
                              )}
                              {isAssigned && !isActive && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-semibold">
                                  Assigned
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 block">
                              {info.division} ({info.range})
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>💡 You can switch classes instantly from the top workspace header at any time.</span>
                  {activeClass && onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
