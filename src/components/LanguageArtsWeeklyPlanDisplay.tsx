import React, { useState } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Download, 
  FileText, 
  Layers, 
  Users, 
  Sparkles,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  PenTool,
  Mic2,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from './ui';
import { LanguageArtsWeeklyPlan, LanguageArtsDailyPlan, LanguageArtsDailyStrand } from '../types';
import ReactMarkdown from 'react-markdown';
import { exportLAWeeklyToWord } from '../lib/exportUtils';
import { useToasts } from '../context/ToastContext';

interface Props {
  plan: LanguageArtsWeeklyPlan;
}

export function LanguageArtsWeeklyPlanDisplay({ plan }: Props) {
  const { showToast } = useToasts();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeView, setActiveTab] = useState<'weekly' | 'daily' | 'resources'>('weekly');

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    exportLAWeeklyToWord(plan);
    showToast("Generating Word document...", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white border-2 border-amber-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                Language Arts Weekly Plan
              </Badge>
              <Badge variant="outline" className="border-amber-200 text-amber-600">
                {plan.structure} Structure
              </Badge>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{plan.theme}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                Cycle {plan.cycle}, Week {plan.week}
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-500" />
                {plan.grade}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportWord}>
              <FileText className="w-4 h-4" />
              Word
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeView === 'weekly' ? 'primary' : 'ghost'} 
              onClick={() => setActiveTab('weekly')}
              className="gap-2"
            >
              <Layers className="w-4 h-4" />
              Weekly Overview
            </Button>
            <Button 
              variant={activeView === 'daily' ? 'primary' : 'ghost'} 
              onClick={() => setActiveTab('daily')}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Daily Lesson Plans
            </Button>
            <Button 
              variant={activeView === 'resources' ? 'primary' : 'ghost'} 
              onClick={() => setActiveTab('resources')}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Resource Pack
            </Button>
          </div>
        </div>
      </Card>

      {/* Weekly Overview View */}
      {activeView === 'weekly' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Weekly Learning Outcomes
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-gray-700 font-medium">{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50 border-bottom border-gray-200">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-r border-gray-200 w-24">Day</th>
                  {plan.days[0].strands.map((s, i) => (
                    <th key={i} className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {s.strand} ({s.timeAllocation})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.days.map((day) => (
                  <tr key={day.day} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r border-gray-200 bg-gray-50/50">
                      <div className="space-y-1">
                        <span className="text-sm font-black text-gray-900">Day {day.day}</span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{day.date}</p>
                      </div>
                    </td>
                    {day.strands.map((strand, i) => (
                      <td key={i} className="p-4 align-top">
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-900 line-clamp-2">{strand.objective}</p>
                          <div className="flex flex-wrap gap-1">
                            {strand.activities.slice(0, 2).map((act, j) => (
                              <span key={j} className="text-[9px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                {act.length > 20 ? act.substring(0, 20) + '...' : act}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Lesson Plans View */}
      {activeView === 'daily' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {plan.days.map((day) => (
            <Card key={day.day} className="overflow-hidden border-2 border-gray-100">
              <button 
                onClick={() => toggleDay(day.day)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xl">
                    {day.day}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-gray-900">Day {day.day} Lesson Plan</h3>
                    <p className="text-sm text-gray-500 font-medium">{day.date}</p>
                  </div>
                </div>
                {expandedDay === day.day ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
              </button>

              <AnimatePresence>
                {expandedDay === day.day && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6 space-y-8">
                      {day.strands.map((strand, i) => (
                        <div key={i} className="space-y-4">
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-md shadow-sm">
                                {strand.strand.includes('Comprehension') ? <BookOpen className="w-4 h-4 text-blue-500" /> : 
                                 strand.strand.includes('Phonics') ? <Mic2 className="w-4 h-4 text-purple-500" /> : 
                                 <PenTool className="w-4 h-4 text-emerald-500" />}
                              </div>
                              <h4 className="font-black text-gray-900 uppercase tracking-wider text-xs">{strand.strand}</h4>
                            </div>
                            <Badge variant="outline" className="bg-white">{strand.timeAllocation}</Badge>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Objective</label>
                                <p className="text-sm font-bold text-gray-900">{strand.objective}</p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Activities</label>
                                <ul className="space-y-2">
                                  {strand.activities.map((act, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-gray-700">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                      {act}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                                  <h5 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Assessment
                                  </h5>
                                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">{strand.assessment}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                                  <h5 className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5" />
                                    Resources
                                  </h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {strand.resources.map((res, j) => (
                                      <span key={j} className="text-[9px] bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                        {res}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-100 space-y-4">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-amber-600" />
                                  <h5 className="font-black text-amber-900 text-sm">AI Teaching Assistant</h5>
                                </div>
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">What to Say</p>
                                    <p className="text-xs text-amber-900 italic leading-relaxed">"{strand.teacherGuidance.whatToSay}"</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">What to Ask</p>
                                    <p className="text-xs text-amber-900 font-bold leading-relaxed">{strand.teacherGuidance.whatToAsk}</p>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Examples</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {strand.teacherGuidance.examples.map((ex, j) => (
                                        <span key={j} className="text-[10px] bg-white text-amber-800 px-2 py-1 rounded-lg border border-amber-200 font-medium">
                                          {ex}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-amber-200">
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Student Actions</p>
                                    <p className="text-xs text-amber-900 leading-relaxed">{strand.teacherGuidance.studentTasks}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Differentiation Section */}
                      <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Users className="w-5 h-5 text-indigo-500" />
                          Differentiation Strategies
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 space-y-2">
                            <h5 className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Struggling Learners</h5>
                            <p className="text-xs text-rose-900 leading-relaxed">{day.differentiation.support}</p>
                          </div>
                          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
                            <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">On-Level Learners</h5>
                            <p className="text-xs text-indigo-900 leading-relaxed">{day.differentiation.onLevel}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
                            <h5 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Advanced Learners</h5>
                            <p className="text-xs text-emerald-900 leading-relaxed">{day.differentiation.advanced}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {/* Resource Pack View */}
      {activeView === 'resources' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {plan.resourcePack.readingPassage && (
                <Card className="p-8 space-y-4 bg-amber-50/30 border-amber-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-amber-600" />
                      Weekly Reading Passage
                    </h3>
                    <Button variant="outline" size="sm" className="gap-2 bg-white">
                      <Printer className="w-4 h-4" />
                      Print Passage
                    </Button>
                  </div>
                  <div className="prose prose-amber max-w-none bg-white p-8 rounded-2xl border border-amber-100 shadow-sm font-serif leading-relaxed text-lg">
                    <ReactMarkdown>{plan.resourcePack.readingPassage}</ReactMarkdown>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Vocabulary & High Frequency
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vocabulary Words</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.resourcePack.vocabularyList.map((word, i) => (
                          <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Frequency Words</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.resourcePack.highFrequencyWords.map((word, i) => (
                          <Badge key={i} variant="outline" className="border-indigo-200 text-indigo-700">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                    <Mic2 className="w-4 h-4 text-purple-500" />
                    Word Work & Phonics
                  </h4>
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-1">Phonics Focus</p>
                      <p className="text-sm font-bold text-purple-900">{plan.resourcePack.phonicsPractice}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Grammar Focus</p>
                      <p className="text-sm font-bold text-emerald-900">{plan.resourcePack.grammarPractice}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-blue-500" />
                  Writing & Composition
                </h4>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-900 leading-relaxed">{plan.resourcePack.writingPrompt}</p>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  Questioning Prompts
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comprehension Questions</p>
                    <ul className="space-y-2">
                      {plan.resourcePack.comprehensionQuestions.map((q, i) => (
                        <li key={i} className="text-xs text-gray-700 flex gap-2">
                          <span className="font-bold text-amber-600">{i+1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oral Prompts</p>
                    <ul className="space-y-2">
                      {plan.resourcePack.oralQuestioningPrompts.map((q, i) => (
                        <li key={i} className="text-xs text-gray-700 flex gap-2">
                          <span className="font-bold text-indigo-600">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Visual Aids & Worksheets
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anchor Charts</p>
                    <ul className="space-y-1">
                      {plan.resourcePack.anchorChartSuggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Worksheet Ideas</p>
                    <ul className="space-y-1">
                      {plan.resourcePack.worksheetIdeas.map((s, i) => (
                        <li key={i} className="text-xs text-gray-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
