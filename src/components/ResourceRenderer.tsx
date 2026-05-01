import React from 'react';
import { Printer, Download, FileText, Layout, Image as ImageIcon, CreditCard } from 'lucide-react';
import { LessonResourcesResponse, WorksheetContent, FlashcardContent, VisualAidContent, GraphicOrganizerContent } from '../types/index';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResourceRendererProps {
  resource: LessonResourcesResponse['resources'][number];
}

export const ResourceRenderer: React.FC<ResourceRendererProps> = ({ resource }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
      <div className="p-4 bg-slate-50 border-bottom border-slate-200 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          {resource.type === 'worksheet' && <FileText className="w-5 h-5 text-blue-600" />}
          {resource.type === 'flashcards' && <CreditCard className="w-5 h-5 text-purple-600" />}
          {resource.type === 'visual_aid' && <ImageIcon className="w-5 h-5 text-emerald-600" />}
          {resource.type === 'graphic_organizer' && <Layout className="w-5 h-5 text-orange-600" />}
          <h3 className="font-semibold text-slate-800">{resource.title}</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
            title="Print Resource"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-8 print:p-0">
        {resource.type === 'worksheet' && <WorksheetView content={resource.content as WorksheetContent} />}
        {resource.type === 'flashcards' && <FlashcardsView content={resource.content as FlashcardContent} />}
        {resource.type === 'visual_aid' && <VisualAidView content={resource.content as VisualAidContent} />}
        {resource.type === 'graphic_organizer' && <GraphicOrganizerView content={resource.content as GraphicOrganizerContent} />}
      </div>
    </div>
  );
};

const WorksheetView: React.FC<{ content: WorksheetContent }> = ({ content }) => (
  <div className="space-y-8 max-w-3xl mx-auto font-sans">
    <div className="border-b-2 border-slate-900 pb-4 mb-8">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-1">
          <div className="h-6 w-48 border-b border-slate-400 text-xs text-slate-400 flex items-end">Name:</div>
          <div className="h-6 w-48 border-b border-slate-400 text-xs text-slate-400 flex items-end">Date:</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-500">Student Worksheet</div>
        </div>
      </div>
    </div>

    {content?.sections?.map((section, idx) => (
      <section key={idx} className="space-y-4">
        <h4 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">{section.title}</h4>
        <p className="text-slate-600 italic text-sm">{section.instructions}</p>
        <div className="space-y-6 mt-4">
          {section.questions?.map((q, qIdx) => (
            <div key={q.id} className="space-y-2">
              <p className="font-medium text-slate-800">{qIdx + 1}. {q.text}</p>
              {q.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 gap-2 ml-4">
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-slate-400 rounded-full" />
                      <span className="text-slate-700">{opt}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.type === 'short_answer' && (
                <div className="h-12 w-full border-b border-slate-300 ml-4" />
              )}
              {q.type === 'true_false' && (
                <div className="flex gap-4 ml-4">
                  <span className="text-slate-700 font-bold">TRUE</span>
                  <span className="text-slate-700 font-bold">FALSE</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const FlashcardsView: React.FC<{ content: FlashcardContent }> = ({ content }) => (
  <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
    {content?.cards?.map((card, idx) => (
      <div key={idx} className="border-2 border-dashed border-slate-300 p-6 aspect-[5/3] flex flex-col items-center justify-center text-center relative group">
        <div className="absolute top-2 left-2 text-[10px] text-slate-400 uppercase font-bold">Front</div>
        <p className="text-lg font-bold text-slate-800">{card.front}</p>
        <div className="w-full h-px bg-slate-200 my-4" />
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 uppercase font-bold">Back</div>
        <p className="text-sm text-slate-600">{card.back}</p>
      </div>
    ))}
  </div>
);

const VisualAidView: React.FC<{ content: VisualAidContent }> = ({ content }) => (
  <div className="space-y-6 text-center">
    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 inline-block min-w-[300px]">
      <h4 className="text-lg font-bold mb-6 text-slate-800">{content?.description}</h4>
      <div className="flex items-end justify-center gap-4 h-48">
        {content?.elements?.map((el, idx) => {
          const maxVal = Math.max(...(content?.elements?.map(e => Number(e.value)) || [1]));
          const height = typeof el.value === 'number' ? `${(el.value / (maxVal || 1)) * 100}%` : '50%';
          return (
            <div key={idx} className="flex flex-col items-center gap-2 w-12">
              <div 
                className="w-full rounded-t-lg transition-all duration-500" 
                style={{ 
                  height, 
                  backgroundColor: el.color || `hsl(${idx * 40}, 70%, 60%)` 
                }} 
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase rotate-45 origin-left whitespace-nowrap">{el.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const GraphicOrganizerView: React.FC<{ content: GraphicOrganizerContent }> = ({ content }) => (
  <div className="space-y-8">
    {content?.organizerType === 'venn' && (
      <div className="relative h-[400px] flex items-center justify-center">
        <div className="w-64 h-64 border-2 border-blue-400 rounded-full flex items-center justify-center bg-blue-50/30 -mr-20">
          <div className="text-center p-4">
            <p className="font-bold text-blue-800 mb-2">{content.data?.leftTitle}</p>
            <ul className="text-xs text-blue-600 list-disc list-inside text-left">
              {content.data?.leftItems?.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div className="w-64 h-64 border-2 border-purple-400 rounded-full flex items-center justify-center bg-purple-50/30 -ml-20">
          <div className="text-center p-4">
            <p className="font-bold text-purple-800 mb-2">{content.data?.rightTitle}</p>
            <ul className="text-xs text-purple-600 list-disc list-inside text-left">
              {content.data?.rightItems?.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 p-4 rounded-lg border border-slate-200 shadow-sm max-w-[150px] text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Common</p>
            <ul className="text-[10px] text-slate-600 list-disc list-inside text-left">
              {content.data?.commonItems?.map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    )}

    {content?.organizerType === 'story_map' && (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 border-2 border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Setting & Characters</p>
          <p className="text-slate-800">{content.data?.setting}</p>
        </div>
        <div className="border-2 border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">The Problem</p>
          <p className="text-slate-800">{content.data?.problem}</p>
        </div>
        <div className="border-2 border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">The Solution</p>
          <p className="text-slate-800">{content.data?.solution}</p>
        </div>
        <div className="col-span-2 border-2 border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Key Events</p>
          <ol className="list-decimal list-inside space-y-2">
            {content.data?.events?.map((e: string, i: number) => <li key={i} className="text-slate-800">{e}</li>)}
          </ol>
        </div>
      </div>
    )}

    {content?.organizerType === 'concept_map' && (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg border-4 border-blue-200 min-w-[200px] text-center">
            <p className="text-xs uppercase font-black opacity-70 mb-1">Main Concept</p>
            <p className="text-xl font-bold">{content.data?.mainConcept}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {content.data?.subConcepts?.map((sub: any, i: number) => (
            <div key={i} className="relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-300" />
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm text-center">
                <p className="font-bold text-slate-800 mb-2">{sub.title}</p>
                <p className="text-xs text-slate-500">{sub.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {content?.organizerType === 'kwl' && (
      <div className="grid grid-cols-3 border-2 border-slate-800 rounded-xl overflow-hidden">
        <div className="border-r-2 border-slate-800">
          <div className="bg-slate-800 text-white p-3 text-center font-bold">K - What I Know</div>
          <div className="p-4 min-h-[300px] space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-px bg-slate-200 mt-8" />)}
          </div>
        </div>
        <div className="border-r-2 border-slate-800">
          <div className="bg-slate-800 text-white p-3 text-center font-bold">W - What I Want to Know</div>
          <div className="p-4 min-h-[300px] space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-px bg-slate-200 mt-8" />)}
          </div>
        </div>
        <div>
          <div className="bg-slate-800 text-white p-3 text-center font-bold">L - What I Learned</div>
          <div className="p-4 min-h-[300px] space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-px bg-slate-200 mt-8" />)}
          </div>
        </div>
      </div>
    )}

    {(!content?.organizerType || (content.organizerType !== 'venn' && content.organizerType !== 'story_map' && content.organizerType !== 'concept_map' && content.organizerType !== 'kwl')) && (
      <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center">
        <p className="text-slate-500 italic">Graphic organizer data structure not recognized, but title is: {content?.organizerType}</p>
        <pre className="text-left text-xs bg-slate-50 p-4 mt-4 overflow-auto">
          {JSON.stringify(content?.data, null, 2)}
        </pre>
      </div>
    )}
  </div>
);
