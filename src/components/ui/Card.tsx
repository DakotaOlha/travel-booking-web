import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface Props extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ children, className, padding = true }: Props) {
  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-sm', padding && 'p-6', className)}>
      {children}
    </div>
  );
}