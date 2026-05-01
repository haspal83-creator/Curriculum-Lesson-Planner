import React from 'react';
import { 
  Clock, 
  Calendar, 
  Presentation, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle, 
  Zap 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { LessonStatus } from '../../types';

interface LessonStatusBadgeProps {
  status?: LessonStatus;
}

export const LessonStatusBadge = ({ status }: LessonStatusBadgeProps) => {
  const config = {
    'Not Started': { color: 'bg-gray-100 text-gray-600', icon: Clock },
    'Planned': { color: 'bg-blue-100 text-blue-600', icon: Calendar },
    'Ready to Teach': { color: 'bg-indigo-100 text-indigo-600', icon: Zap },
    'Taught': { color: 'bg-indigo-100 text-indigo-600', icon: Presentation },
    'Completed': { color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
    'Skipped': { color: 'bg-amber-100 text-amber-600', icon: XCircle },
    'Postponed': { color: 'bg-purple-100 text-purple-600', icon: RefreshCw },
    'Needs Review': { color: 'bg-rose-100 text-rose-600', icon: AlertCircle },
    'Partially Taught': { color: 'bg-cyan-100 text-cyan-600', icon: Zap },
    'Reteach Needed': { color: 'bg-orange-100 text-orange-600', icon: RefreshCw }
  };

  const { color, icon: Icon } = config[status || 'Not Started'] || config['Not Started'];

  return (
    <div className={cn("px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", color)}>
      <Icon className="w-3 h-3" />
      {status || 'Not Started'}
    </div>
  );
};
