import React from 'react';
import { ArrowLeft, Printer, Download, Calendar, Target, BookOpen, CheckCircle2, FileText } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { DailyLessonPlan } from '../../types';
import { exportDailyPlanToWord } from '../../lib/exportUtils';

interface DailyPlanDetailViewProps {
  plan: DailyLessonPlan;
  onBack: () => void;
}

export default function DailyPlanDetailView({ plan, onBack }: DailyPlanDetailViewProps) {
  const handleExportWord = () => {
    exportDailyPlanToWord(plan);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Saved Plans
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportWord}>
            <FileText className="w-4 h-4 mr-2" />
            Word
          </Button>
        </div>
      </div>

      <Card className="p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Daily Lesson Plan</Badge>
            <Badge variant="outline">{plan.grade}</Badge>
            <Badge variant="outline">{plan.subject}</Badge>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{plan.lesson_title}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Cycle {plan.cycle}, Week {plan.week}, Day {plan.day}
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              {plan.topic}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Lesson Focus
              </h3>
              <p className="text-gray-900 font-medium">{plan.focus}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Learning Objective
              </h3>
              <p className="text-gray-900">{plan.objectiveSummary}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Main Activity
              </h3>
              <p className="text-gray-900">{plan.mainActivity}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Assessment Check
              </h3>
              <p className="text-gray-900">{plan.assessmentCheck}</p>
            </div>
          </div>
        </div>

        {plan.teacher_notes && (
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Teacher Notes</h3>
            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 italic">
              {plan.teacher_notes}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
