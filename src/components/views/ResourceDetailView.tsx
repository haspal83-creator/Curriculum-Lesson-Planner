import React from 'react';
import { ArrowLeft, Printer, Download, Copy, CheckCircle2, Layers } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import Markdown from 'react-markdown';

interface ResourceDetailViewProps {
  resource: any;
  onBack: () => void;
}

export default function ResourceDetailView({ resource, onBack }: ResourceDetailViewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Saved Plans
        </Button>
        <div className="flex gap-2">
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
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{resource.type}</h2>
              <p className="text-xs text-gray-500 font-medium">Generated on {new Date(resource.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="p-8 prose max-w-none prose-indigo prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600">
          <Markdown>{resource.content}</Markdown>
        </div>
      </Card>
    </div>
  );
}
