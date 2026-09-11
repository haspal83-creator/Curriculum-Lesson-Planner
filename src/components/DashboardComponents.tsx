import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from './ui';
import { cn } from '../lib/utils';

export function StatCard({ 
  icon, 
  label, 
  value, 
  color,
  subtext
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string;
  subtext?: string;
}) {
  return (
    <Card className="p-5 flex items-center gap-4 bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm', color)}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: cn('w-6 h-6', (icon as React.ReactElement<any>).props.className) }) : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        {subtext && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtext}</p>}
      </div>
    </Card>
  );
}

export function NavButton({ 
  active, 
  onClick, 
  icon, 
  label,
  collapsed = false,
  badge
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  collapsed?: boolean;
  badge?: string | number;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={cn(
        'relative flex items-center transition-all duration-200 group rounded-xl',
        collapsed 
          ? 'w-11 h-11 mx-auto justify-center'
          : 'w-full gap-3.5 px-3.5 py-2.5 text-sm font-semibold',
        active 
          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200/50' 
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
      )}
    >
      <span className={cn('transition-colors shrink-0 flex items-center justify-center', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-700')}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: cn('w-5 h-5', (icon as React.ReactElement<any>).props.className) }) : icon}
      </span>
      {!collapsed && (
        <>
          <span className="truncate flex-1 text-left">{label}</span>
          {badge !== undefined && (
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold",
              active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
            )}>
              {badge}
            </span>
          )}
        </>
      )}
      {active && !collapsed && (
        <span className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />
      )}
    </button>
  );
}

export function QuickAction({ icon, title, desc, onClick, color }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void, color: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300 group text-left"
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 shrink-0', color)}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: cn('w-6 h-6', (icon as React.ReactElement<any>).props.className) }) : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
    </button>
  );
}
