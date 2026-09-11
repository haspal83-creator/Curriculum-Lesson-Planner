import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeLevel, ALL_GRADE_LEVELS } from '../types';
import { GraduationCap, ChevronDown, Check, Settings, Sparkles, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface ClassSwitcherProps {
  activeClass: GradeLevel | null;
  assignedClasses?: GradeLevel[];
  onSelectClass: (grade: GradeLevel) => void;
  onOpenModal: () => void;
  variant?: 'header' | 'sidebar';
}

export const ClassSwitcher: React.FC<ClassSwitcherProps> = ({
  activeClass,
  assignedClasses = [],
  onSelectClass,
  onOpenModal,
  variant = 'header'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (grade: GradeLevel) => {
    onSelectClass(grade);
    setIsOpen(false);
  };

  const getDivision = (grade: GradeLevel) => {
    if (grade.startsWith('Infant')) return 'Early Childhood';
    if (grade === 'Standard 1' || grade === 'Standard 2') return 'Lower Primary';
    if (grade === 'Standard 3' || grade === 'Standard 4') return 'Middle Primary';
    return 'Upper Primary';
  };

  if (variant === 'sidebar') {
    return (
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left",
            "bg-indigo-50/80 hover:bg-indigo-100/70 border border-indigo-100 group shadow-sm",
            isOpen && "ring-2 ring-indigo-500/20 border-indigo-300"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block leading-tight">
                Current Class
              </span>
              <p className="text-sm font-black text-gray-900 truncate">
                {activeClass || 'Select a Class'}
              </p>
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-transform shrink-0", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 bottom-full mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 max-h-96 overflow-y-auto"
            >
              <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Switch Class</span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenModal();
                  }}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Manage
                </button>
              </div>

              {assignedClasses.length > 0 && (
                <div className="py-2 border-b border-gray-50">
                  <span className="px-3 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block mb-1">
                    My Classes
                  </span>
                  <div className="space-y-0.5">
                    {assignedClasses.map((grade) => {
                      const isActive = activeClass === grade;
                      return (
                        <button
                          key={`sidebar-assigned-${grade}`}
                          onClick={() => handleSelect(grade)}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl text-left text-sm flex items-center justify-between transition-colors",
                            isActive 
                              ? "bg-indigo-600 text-white font-bold shadow-sm" 
                              : "text-gray-700 hover:bg-indigo-50/60 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span>{grade}</span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-medium",
                              isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                            )}>
                              {getDivision(grade)}
                            </span>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="py-2">
                <span className="px-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                  All Grades
                </span>
                <div className="space-y-0.5">
                  {ALL_GRADE_LEVELS.map((grade) => {
                    const isActive = activeClass === grade;
                    const isAssigned = assignedClasses.includes(grade);
                    return (
                      <button
                        key={`sidebar-all-${grade}`}
                        onClick={() => handleSelect(grade)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl text-left text-sm flex items-center justify-between transition-colors",
                          isActive 
                            ? "bg-indigo-600 text-white font-bold shadow-sm" 
                            : "text-gray-700 hover:bg-gray-50 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{grade}</span>
                          {isAssigned && !isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-semibold">
                              Assigned
                            </span>
                          )}
                        </div>
                        {isActive && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Header variant
  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-sm",
          "bg-white border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-indigo-300",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-400 bg-indigo-50/20"
        )}
        title="Switch teaching class"
      >
        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          <GraduationCap className="w-3.5 h-3.5" />
        </div>
        <div className="text-left flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 hidden sm:inline">Class:</span>
          <span className="text-xs font-black text-indigo-900 tracking-tight">
            {activeClass || 'Select Class'}
          </span>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform ml-0.5", isOpen && "rotate-180 text-indigo-600")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-900">Switch Workspace Class</p>
                <p className="text-[11px] text-gray-400">Instantly filters planner & lessons</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenModal();
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Manage class settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Assigned Classes */}
            {assignedClasses.length > 0 && (
              <div className="py-2 border-b border-gray-100">
                <div className="flex items-center justify-between px-3 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    My Assigned Classes
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {assignedClasses.map((grade) => {
                    const isActive = activeClass === grade;
                    return (
                      <button
                        key={`header-assigned-${grade}`}
                        onClick={() => handleSelect(grade)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all",
                          isActive 
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" 
                            : "bg-indigo-50/50 text-indigo-950 hover:bg-indigo-100/60"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{grade}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-normal",
                            isActive ? "bg-white/20 text-white" : "bg-white text-indigo-700 border border-indigo-200"
                          )}>
                            {getDivision(grade)}
                          </span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Classes */}
            <div className="py-2">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                All Grade Levels
              </span>
              <div className="grid grid-cols-1 gap-1">
                {ALL_GRADE_LEVELS.map((grade) => {
                  const isActive = activeClass === grade;
                  const isAssigned = assignedClasses.includes(grade);
                  return (
                    <button
                      key={`header-all-${grade}`}
                      onClick={() => handleSelect(grade)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors",
                        isActive 
                          ? "bg-indigo-600 text-white font-bold shadow-sm" 
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{grade}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-normal",
                          isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        )}>
                          {getDivision(grade)}
                        </span>
                        {isAssigned && !isActive && (
                          <span className="text-[9px] px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold">
                            Assigned
                          </span>
                        )}
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 mt-1 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenModal();
                }}
                className="w-full px-3 py-2 rounded-xl text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Customize Assigned Classes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
