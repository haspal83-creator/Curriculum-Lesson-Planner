import React from 'react';
import { 
  ArrowLeft, 
  ChevronDown, 
  Printer, 
  Download, 
  Layers, 
  ListChecks, 
  MessageSquare, 
  Calendar, 
  Target, 
  List, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Button, Card, DropdownMenu } from '../ui';
import { WeeklyCurriculumPlan, LessonPlan } from '../../types';
import { exportWeeklyCurriculumToWord } from '../../lib/exportUtils';

interface WeeklyPlanDetailViewProps {
  plan: WeeklyCurriculumPlan;
  onBack: () => void;
  onGenerateResource: (plan: LessonPlan, type: string) => Promise<void>;
}

export default function WeeklyPlanDetailView({ plan, onBack, onGenerateResource }: WeeklyPlanDetailViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    exportWeeklyCurriculumToWord(plan);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Saved Plans
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportWord}>
            <FileText className="w-4 h-4" />
            Word
          </Button>
          <DropdownMenu 
            trigger={
              <Button size="sm">
                Generate Resource
                <ChevronDown className="w-4 h-4" />
              </Button>
            }
            items={[
              { label: 'Worksheet', onClick: () => onGenerateResource(plan as any, 'Worksheet'), icon: <Layers className="w-4 h-4" /> },
              { label: 'Quiz', onClick: () => onGenerateResource(plan as any, 'Quiz'), icon: <ListChecks className="w-4 h-4" /> },
              { label: 'Discussion Guide', onClick: () => onGenerateResource(plan as any, 'Discussion Guide'), icon: <MessageSquare className="w-4 h-4" /> }
            ]}
          />
        </div>
      </div>

      <Card className="p-8 space-y-8 print:p-0 print:border-none print:shadow-none">
        <div className="border-b border-gray-100 pb-6 print:pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">Weekly Overview</span>
              <span className="text-xs text-gray-400 font-medium">{new Date(plan.createdAt).toLocaleDateString()}</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight print:text-2xl">{plan.weekly_topic}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">{plan.grade_level}</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-black uppercase tracking-widest">{plan.subject}</span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase tracking-widest">Cycle {plan.cycle}</span>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-black uppercase tracking-widest">Week {plan.week_number}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              Weekly Big Idea
            </h3>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-50">
              <p className="text-indigo-900 leading-relaxed italic">"{plan.weekly_big_idea}"</p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600">
              <Target className="w-5 h-5" />
              Skill Progression
            </h3>
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-50">
              <p className="text-emerald-900 text-sm leading-relaxed">{plan.weekly_skill_progression}</p>
            </div>
          </section>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <List className="w-5 h-5 text-indigo-600" />
            Daily Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Day</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Lesson Title</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Focus</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plan.daily_breakdown_table.map((day) => (
                  <tr key={day.day}>
                    <td className="py-4 px-4 font-bold text-gray-600">Day {day.day}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{day.lessonTitle}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{day.focus}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{day.mainActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <ListChecks className="w-5 h-5 text-indigo-600" />
            Suggested Assessment
          </h3>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed">{plan.suggested_assessment}</p>
          </div>
        </section>
      </Card>
    </div>
  );
}
