import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Loader2, 
  Download, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Search, 
  FileText, 
  ListChecks, 
  MessageSquare,
  Presentation,
  BookOpen
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Button, Card, Input, Select } from '../ui';
import { LessonPlan } from '../../types';
import { generateResource } from '../../services/gemini';
import { useToasts } from '../../context/ToastContext';

interface ResourceGenViewProps {
  lessonPlans: LessonPlan[];
  prefilledResource?: { type: string, content: string, planId?: string } | null;
}

export function ResourceGenView({ lessonPlans, prefilledResource }: ResourceGenViewProps) {
  const { showToast } = useToasts();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(prefilledResource?.planId || '');
  const [resourceType, setResourceType] = useState<string>(prefilledResource?.type || 'Worksheet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>(prefilledResource?.content || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefilledResource) {
      setGeneratedContent(prefilledResource.content);
      setResourceType(prefilledResource.type);
      if (prefilledResource.planId) setSelectedPlanId(prefilledResource.planId);
    }
  }, [prefilledResource]);

  const handleGenerate = async () => {
    const plan = lessonPlans.find(p => p.id === selectedPlanId);
    if (!plan) {
      showToast("Please select a lesson plan first.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateResource(resourceType, plan);
      setGeneratedContent(res);
    } catch (err) {
      console.error("Error generating resource:", err);
      showToast("Failed to generate resource. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Resource Generator</h2>
          <p className="text-sm text-gray-500">Create worksheets, quizzes, and teaching aids from your lesson plans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-bold">Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Lesson Plan</label>
                <Select 
                  options={(lessonPlans || []).map(p => ({ label: p.lessonTitle, value: p.id! }))} 
                  value={selectedPlanId} 
                  onChange={(val) => setSelectedPlanId(val)} 
                  placeholder="Choose a plan..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resource Type</label>
                <Select 
                  options={[
                    { label: 'Student Worksheet', value: 'Worksheet' },
                    { label: 'Multiple Choice Quiz', value: 'Quiz' },
                    { label: 'Lesson Notes', value: 'Notebook Notes' },
                    { label: 'PPT Outline', value: 'PowerPoint Outline' },
                    { label: 'Discussion Guide', value: 'Discussion Guide' },
                    { label: 'Vocabulary List', value: 'Vocabulary List' },
                    { label: 'Reading Passage', value: 'Reading Passage' }
                  ]} 
                  value={resourceType} 
                  onChange={(val) => setResourceType(val)} 
                />
              </div>
              <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full py-6">
                <Sparkles className="w-5 h-5" />
                Generate Resource
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setResourceType('Worksheet')}>
              <FileText className="w-6 h-6 text-indigo-600" />
              <span className="text-xs font-bold">Worksheet</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setResourceType('Quiz')}>
              <ListChecks className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-bold">Quiz</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setResourceType('Notebook Notes')}>
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-bold">Notes</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setResourceType('PowerPoint Outline')}>
              <Presentation className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-bold">PPT</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setResourceType('Discussion Guide')}>
              <MessageSquare className="w-6 h-6 text-amber-600" />
              <span className="text-xs font-bold">Discussion</span>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setResourceType('Vocabulary List')}>
              <Layers className="w-6 h-6 text-rose-600" />
              <span className="text-xs font-bold">Vocabulary</span>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isGenerating ? (
            <Card className="p-12 text-center space-y-6 h-full flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Generating Your {resourceType}...</h3>
                <p className="text-gray-500">AI is crafting high-quality teaching materials based on your lesson objectives.</p>
              </div>
            </Card>
          ) : generatedContent ? (
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-900">{resourceType}</h3>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />
                    Print
                  </Button>
                </div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto prose max-w-none prose-indigo prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600">
                <Markdown>{generatedContent}</Markdown>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center space-y-4 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <h3 className="text-lg font-bold">Ready to Generate</h3>
                <p className="text-gray-500 text-sm">Select a lesson plan and resource type to generate teaching materials.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
