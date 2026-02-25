import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-600">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all outline-none',
          'focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400',
          error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
);