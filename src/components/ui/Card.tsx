import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, id, onClick }: CardProps) => (
  <div id={id} onClick={onClick} className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);
