import React, { useState } from 'react';
import { ArrowLeft, Printer, Copy, CheckCircle2, Layers, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import Markdown from 'react-markdown';

interface ResourceDetailViewProps {
  resource: any;
  onBack: () => void;
}

const formatSafeDate = (val: any): string => {
  if (!val) return 'Recently generated';
  if (typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
  if (typeof val === 'object' && 'seconds' in val) return new Date(val.seconds * 1000).toLocaleDateString();
  const d = new Date(val);
  return isNaN(d.getTime()) ? 'Recently generated' : d.toLocaleDateString();
};

export default function ResourceDetailView({ resource, onBack }: ResourceDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const title = resource.title || `${resource.type || 'Resource'}`;
  const grade = typeof resource.grade === 'object' ? resource.grade?.name : resource.grade;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Saved Plans
        </Button>
        <div className="flex gap-2">
          {resource.answerKey && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              {showAnswerKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showAnswerKey ? 'Hide Answer Key' : 'View Answer Key'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied' : 'Copy Content'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">{resource.type || 'Resource'}</Badge>
                {grade && <Badge variant="outline">{grade}</Badge>}
                {resource.subject && <Badge variant="outline">{resource.subject}</Badge>}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500 font-medium">Generated on {formatSafeDate(resource.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-8 prose max-w-none prose-indigo prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600">
          <Markdown>{resource.content || ''}</Markdown>
        </div>

        {resource.answerKey && showAnswerKey && (
          <div className="border-t border-emerald-100 bg-emerald-50/40 p-8">
            <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold text-base">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              Answer Key & Grading Rubric
            </div>
            <div className="p-4 bg-white rounded-xl border border-emerald-200 prose max-w-none text-emerald-900 text-sm">
              <Markdown>{resource.answerKey}</Markdown>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
