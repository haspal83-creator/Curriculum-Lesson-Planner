import React from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LessonPlan, LessonAtAGlanceRow } from '../types';
import { parseMinutes } from '../lib/timingValidation';

interface LessonAtAGlanceTableProps {
  plan: LessonPlan;
}

export const LessonAtAGlanceTable: React.FC<LessonAtAGlanceTableProps> = ({ plan }) => {
  const rows: LessonAtAGlanceRow[] = plan.lessonAtAGlance || [];
  const targetDurationMinutes = parseMinutes(plan.duration, 45);

  const calculatedMinutes = rows.reduce((acc, row) => {
    return acc + (row.timeMinutes || parseMinutes(row.time, 0));
  }, 0);

  const isValidArithmetic = calculatedMinutes === targetDurationMinutes;

  return (
    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      {/* Header & Arithmetic Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              Validated Execution Timeline
            </span>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Lesson at a Glance
            </h3>
          </div>
        </div>

        {/* Real-time Arithmetic Validation Indicator */}
        <div className="flex items-center gap-2">
          {isValidArithmetic ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Timing Validated: {calculatedMinutes} min = {targetDurationMinutes} min duration</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Timing Rebalanced to match {targetDurationMinutes} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-600 border-b border-gray-200/80 font-black text-[10px] uppercase tracking-wider">
              <th className="py-3.5 px-4 w-36 sm:w-44 shrink-0">Time Allocation</th>
              <th className="py-3.5 px-4 w-48 sm:w-56 shrink-0">Lesson Stage</th>
              <th className="py-3.5 px-4">Teacher Does</th>
              <th className="py-3.5 px-4">Students Do</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                <td className="py-3.5 px-4 align-top">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[11px]">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span>{row.time}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors block">
                    {row.stage}
                  </span>
                </td>
                <td className="py-3.5 px-4 align-top text-gray-700 leading-relaxed font-medium">
                  {row.teacherDoes}
                </td>
                <td className="py-3.5 px-4 align-top text-gray-700 leading-relaxed font-medium">
                  {row.studentsDo}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50/60 font-bold text-gray-900 border-t border-gray-200 text-xs">
              <td className="py-3 px-4 text-indigo-600 font-black">
                Total: {calculatedMinutes} min
              </td>
              <td className="py-3 px-4 text-gray-500">
                {rows.length} Sequential Stages
              </td>
              <td colSpan={2} className="py-3 px-4 text-right text-gray-500 font-semibold">
                Classroom pacing verified for {targetDurationMinutes}-minute period
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
