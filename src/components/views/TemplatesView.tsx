import React from 'react';
import { Layout, Plus, ChevronRight, FileText, Calendar, Layers, Zap, BookOpen } from 'lucide-react';
import { Button, Card } from '../ui';

export function TemplatesView() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Lesson Templates</h2>
          <p className="text-sm text-gray-500">Choose a pre-defined structure for your lesson plans.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TemplateCard 
          icon={<Zap className="text-indigo-600" />} 
          title="5E Model" 
          desc="Engage, Explore, Explain, Elaborate, Evaluate" 
          color="bg-indigo-50" 
        />
        <TemplateCard 
          icon={<BookOpen className="text-emerald-600" />} 
          title="Direct Instruction" 
          desc="Teacher-led modeling and guided practice" 
          color="bg-emerald-50" 
        />
        <TemplateCard 
          icon={<Layers className="text-amber-600" />} 
          title="Inquiry-Based" 
          desc="Student-led exploration and problem solving" 
          color="bg-amber-50" 
        />
        <TemplateCard 
          icon={<Calendar className="text-rose-600" />} 
          title="Weekly Overview" 
          desc="High-level planning for a full teaching week" 
          color="bg-rose-50" 
        />
        <TemplateCard 
          icon={<FileText className="text-cyan-600" />} 
          title="Ministry Standard" 
          desc="Formal documentation for official reporting" 
          color="bg-cyan-50" 
        />
      </div>
    </div>
  );
}

function TemplateCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <Card className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          {icon}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </Card>
  );
}

import { cn } from '../../lib/utils';
