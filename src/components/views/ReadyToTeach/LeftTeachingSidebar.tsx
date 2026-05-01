import React from 'react';
import { 
  Layout, 
  FileText, 
  Video, 
  PenTool, 
  FlaskConical, 
  Image, 
  Package, 
  ClipboardList, 
  GraduationCap, 
  Home, 
  Users, 
  ShieldAlert, 
  MessageSquareQuote,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { LessonResourceType } from '../../../types';

interface LeftTeachingSidebarProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
  completionStatus: Record<string, boolean>;
}

const sections = [
  { id: 'lesson_overview', label: 'Lesson Overview', icon: Layout },
  { id: 'lesson_plan', label: 'Full Lesson Plan', icon: FileText },
  { id: 'ai_video', label: 'AI Teaching Video', icon: Video },
  { id: 'teacher_script', label: 'Teacher Script', icon: MessageSquareQuote },
  { id: 'board_plan', label: 'Board Plan', icon: PenTool },
  { id: 'demonstration', label: 'Demonstration', icon: FlaskConical },
  { id: 'visual_aids', label: 'Visual Aids', icon: Image },
  { id: 'materials_prep', label: 'Materials & Prep', icon: Package },
  { id: 'worksheets', label: 'Worksheets', icon: ClipboardList },
  { id: 'assessment', label: 'Assessment', icon: GraduationCap },
  { id: 'homework', label: 'Homework', icon: Home },
  { id: 'differentiation', label: 'Differentiation', icon: Users },
  { id: 'classroom_management', label: 'Classroom Management', icon: ShieldAlert },
  { id: 'reflection', label: 'Reflection & Follow-Up', icon: CheckCircle2 },
];

export const LeftTeachingSidebar: React.FC<LeftTeachingSidebarProps> = ({
  activeSection,
  onSectionClick,
  completionStatus
}) => {
  return (
    <div className="sticky top-24 h-[calc(100vh-8rem)] w-64 bg-white border border-gray-200 rounded-xl shadow-sm p-4 overflow-y-auto scrollbar-hide">
      <div className="space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isCompleted = completionStatus[section.id];

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <span>{section.label}</span>
              </div>
              {isCompleted && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="px-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Lesson Progress</span>
            <span className="text-[10px] font-bold text-indigo-600">65%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
