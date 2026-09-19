import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  Copy, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  FileSpreadsheet, 
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  StructuredWorksheet, 
  parseAndNormalizeWorksheet, 
  formatWorksheetMarkdown, 
  formatAnswerKeyMarkdown,
  exportStructuredWorksheetToDocx,
  printWorksheetToWindow 
} from '../lib/worksheetSystem';
import { Button, Card, Badge } from './ui';

interface WorksheetDisplayViewProps {
  content: string | any;
  answerKey?: string;
  title?: string;
  grade?: string;
  subject?: string;
  topic?: string;
  subtopic?: string;
  schoolName?: string;
  onBack?: () => void;
  className?: string;
}

export const WorksheetDisplayView: React.FC<WorksheetDisplayViewProps> = ({
  content,
  answerKey,
  title,
  grade,
  subject,
  topic,
  subtopic,
  schoolName,
  onBack,
  className = ''
}) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Normalize worksheet using our single source of truth
  const structuredWs: StructuredWorksheet = useMemo(() => {
    // If content already has answerKey or answerKey is passed in separately
    let raw = content;
    if (answerKey && typeof content === 'string' && !content.toLowerCase().includes('answer key')) {
      raw = `${content}\n\n### TEACHER ANSWER KEY & SCORING GUIDE\n${answerKey}`;
    }
    return parseAndNormalizeWorksheet(raw, {
      title,
      grade,
      subject,
      topic,
      subtopic,
      schoolName
    });
  }, [content, answerKey, title, grade, subject, topic, subtopic, schoolName]);

  const handleCopy = () => {
    const md = formatWorksheetMarkdown(structuredWs) + (showAnswerKey ? `\n\n${formatAnswerKeyMarkdown(structuredWs)}` : '');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      await exportStructuredWorksheetToDocx(structuredWs, { includeAnswerKey: true });
    } catch (err) {
      console.error('Failed to export DOCX:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrintStudent = () => {
    printWorksheetToWindow(structuredWs, 'student');
  };

  const handlePrintTeacher = () => {
    printWorksheetToWindow(structuredWs, 'teacher');
  };

  const handlePrintBoth = () => {
    printWorksheetToWindow(structuredWs, 'both');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{structuredWs.title}</h3>
            <p className="text-xs text-gray-500 font-medium">
              {structuredWs.grade} • {structuredWs.subject} • Total Score: {structuredWs.totalPoints} points
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            {showAnswerKey ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
            {showAnswerKey ? 'Hide Answer Key' : 'Teacher Answer Key'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="text-gray-700"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="text-blue-700 border-blue-200 hover:bg-blue-50"
            title="Download editable Microsoft Word document"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {isExportingDocx ? 'Exporting...' : 'Word (.docx)'}
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={handlePrintStudent}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Main Student Worksheet Card (Matches Exact Hierarchy) */}
      <div className="bg-white border-2 border-slate-900 shadow-sm p-8 sm:p-12 rounded-lg max-w-4xl mx-auto font-sans">
        {/* 1. School Name */}
        <div className="text-center pb-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide uppercase">
            {structuredWs.schoolName}
          </h2>
          <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mt-0.5">
            {structuredWs.grade} — {structuredWs.subject}
          </div>
        </div>

        {/* 2. Worksheet Title */}
        <div className="text-center my-4 border-b-2 border-slate-900 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            {structuredWs.title}
          </h1>
          {structuredWs.topic && (
            <p className="text-xs sm:text-sm font-medium text-slate-600 italic mt-1">
              Topic: {structuredWs.topic}{structuredWs.subtopic ? ` — ${structuredWs.subtopic}` : ''}
            </p>
          )}
        </div>

        {/* 3. Metadata Header (Name, Date, Score) - Exactly as required */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-slate-300 p-3 bg-slate-50/70 rounded text-xs font-semibold text-slate-800 mb-6">
          <div className="flex items-center">
            <span className="font-bold text-slate-900 mr-2">Name:</span>
            <span className="border-b border-slate-400 flex-1 h-5"></span>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-slate-900 mr-2">Date:</span>
            <span className="border-b border-slate-400 flex-1 h-5"></span>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <span className="font-bold text-slate-900 mr-2">Score:</span>
            <span className="font-mono font-bold text-indigo-900">______ / {structuredWs.totalPoints}</span>
          </div>
        </div>

        {/* 4. Global Instructions (Unnumbered) */}
        <div className="bg-slate-100 border-l-4 border-indigo-600 p-3.5 rounded-r text-xs text-slate-700 italic mb-8">
          <strong className="font-bold text-slate-900 not-italic">Instructions: </strong>
          {structuredWs.instructions}
        </div>

        {/* 5. Sections with Sequential Question Numbers (1, 2, 3...) */}
        <div className="space-y-8">
          {structuredWs.sections.map((sec) => (
            <div key={sec.letter} className="border-t border-slate-200 pt-6">
              {/* Section Heading (Unnumbered, lettered) */}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded">
                  SECTION {sec.letter}
                </span>
                <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-tight">
                  {sec.title}
                </h3>
              </div>

              {/* Section Directions */}
              {sec.instructions && (
                <p className="text-xs text-slate-600 italic mb-4">
                  {sec.instructions}
                </p>
              )}

              {/* Sequential Questions */}
              <div className="space-y-5 mt-4">
                {sec.tasks.map((task) => (
                  <div key={task.number} className="text-xs sm:text-sm text-slate-900 group">
                    <div className="flex items-start gap-2">
                      <span className="font-black text-slate-900 min-w-[24px]">
                        {task.number}.
                      </span>
                      <div className="flex-1 space-y-2">
                        <p className="font-medium text-slate-800 leading-relaxed">
                          {task.prompt}
                        </p>

                        {/* Multiple Choice Options */}
                        {task.options && task.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-1">
                            {task.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50">
                                <div className="w-4 h-4 rounded border border-slate-400 bg-white" />
                                <span className="text-xs text-slate-700 font-medium">{opt}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Writing Lines for open responses */
                          <div className="pt-2 space-y-3">
                            {Array(task.lines || 2).fill(0).map((_, lineIdx) => (
                              <div key={lineIdx} className="border-b border-slate-300 h-5 w-full" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Answer Key & Scoring Guide (Matching 1, 2, 3... numbering) */}
      {showAnswerKey && (
        <div className="bg-emerald-50/70 border-2 border-emerald-600 rounded-lg p-6 sm:p-8 max-w-4xl mx-auto font-sans shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-600 text-white rounded-lg">
                <KeyRound className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                  Teacher Answer Key & Scoring Guide
                </h3>
                <p className="text-xs font-semibold text-emerald-800">
                  {structuredWs.grade} — {structuredWs.subject} | Total Points: {structuredWs.totalPoints}
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrintTeacher}
              className="bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Key Only
            </Button>
          </div>

          <div className="space-y-6">
            {structuredWs.answerKey.map((sec) => (
              <div key={sec.sectionLetter} className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1">
                  SECTION {sec.sectionLetter}: {sec.sectionTitle}
                </h4>

                <div className="space-y-2.5">
                  {sec.answers.map((ans) => (
                    <div key={ans.number} className="bg-white/80 border border-emerald-200 rounded p-3 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-emerald-800 min-w-[20px]">
                          {ans.number}.
                        </span>
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-emerald-950">
                            {ans.solution}
                          </p>
                          {ans.criteria && (
                            <p className="text-[11px] text-emerald-700 italic">
                              Scoring criteria: {ans.criteria}
                            </p>
                          )}
                        </div>
                        {ans.points && (
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {ans.points} {ans.points === 1 ? 'pt' : 'pts'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
