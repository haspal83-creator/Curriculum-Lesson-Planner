import React from 'react';
import { 
  Play, 
  Presentation, 
  Printer, 
  Download, 
  Edit, 
  RefreshCw, 
  FileText, 
  Share2,
  Eye,
  EyeOff,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { SavedLesson } from '../../../types';
import { cn } from '../../../lib/utils';

interface TopControlBarProps {
  lesson: SavedLesson;
  onBack: () => void;
  onPresent: () => void;
  onTeachNow: () => void;
  onDownloadPDF: () => void;
  onDownloadWord: () => void;
  isStudentMode: boolean;
  onToggleStudentMode: () => void;
  isSaving?: boolean;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  lesson,
  onBack,
  onPresent,
  onTeachNow,
  onDownloadPDF,
  onDownloadWord,
  isStudentMode,
  onToggleStudentMode,
  isSaving = false
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                lesson.status === 'ready' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
              )}>
                {lesson.status}
              </span>
              {isSaving && (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="font-medium text-indigo-600">{lesson.subject}</span>
              <span>•</span>
              <span>{lesson.class_id}</span>
              {lesson.cycle && (
                <>
                  <span>•</span>
                  <span>Cycle {lesson.cycle}</span>
                </>
              )}
              {lesson.week && (
                <>
                  <span>•</span>
                  <span>Week {lesson.week}</span>
                </>
              )}
              {lesson.duration && (
                <>
                  <span>•</span>
                  <span>{lesson.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4">
            <button 
              onClick={() => isStudentMode && onToggleStudentMode()}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                !isStudentMode ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Teacher
            </button>
            <button 
              onClick={() => !isStudentMode && onToggleStudentMode()}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                isStudentMode ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Student
            </button>
          </div>

          <button 
            onClick={onTeachNow}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Teach Now
          </button>
          <button 
            onClick={onPresent}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
          >
            <Presentation className="w-4 h-4" />
            Present Mode
          </button>
          <button 
            onClick={onDownloadPDF}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" 
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={onDownloadWord}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" 
            title="Download Word (.doc)"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Share Lesson">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
