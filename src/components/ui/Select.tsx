import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps {
  options: { label: string, value: string | number }[];
  value: string | number;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const Select = ({ options, value, onChange, className, placeholder, disabled }: SelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={cn(
      'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);
