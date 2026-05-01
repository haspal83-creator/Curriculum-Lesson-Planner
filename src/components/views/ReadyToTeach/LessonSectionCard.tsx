import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Printer, 
  RefreshCw, 
  Save, 
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../../lib/utils';
import { LessonResourceNew, LessonResourceType } from '../../../types';

interface LessonSectionCardProps {
  resource: LessonResourceNew;
  onEdit: (id: string, content: any) => void;
  onRegenerate: (type: LessonResourceType) => void;
  isStudentMode?: boolean;
}

export const LessonSectionCard: React.FC<LessonSectionCardProps> = ({ 
  resource, 
  onEdit, 
  onRegenerate,
  isStudentMode = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(resource.content);

  const handleSave = () => {
    onEdit(resource.id, editedContent);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          className="w-full h-64 p-4 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={JSON.stringify(editedContent, null, 2)}
          onChange={(e) => {
            try {
              setEditedContent(JSON.parse(e.target.value));
            } catch (err) {
              // Handle invalid JSON
            }
          }}
        />
      );
    }

    // Default rendering for content
    return (
      <div className="prose prose-indigo max-w-none">
        {typeof resource.content === 'string' ? (
          <ReactMarkdown>{resource.content}</ReactMarkdown>
        ) : (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(resource.content, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "bg-white border-2 border-gray-900 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden transition-all print:shadow-none print:border-gray-300",
      !isExpanded && "h-14"
    )}>
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-900 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <h3 className="font-black text-gray-900 uppercase tracking-tight">{resource.title}</h3>
          {resource.generated_by_ai && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-none">
              AI Generated
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isStudentMode && (
            <>
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit Section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onRegenerate(resource.resource_type)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Regenerate Section"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </>
              )}
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Print Section"
              >
                <Printer className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-6"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
