type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

const colors: Record<Color, string> = {
  blue: 'bg-sky-50 text-sky-600 border border-sky-200',
  green: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  yellow: 'bg-amber-50 text-amber-600 border border-amber-200',
  red: 'bg-red-50 text-red-500 border border-red-200',
  gray: 'bg-slate-50 text-slate-500 border border-slate-200',
  purple: 'bg-violet-50 text-violet-600 border border-violet-200',
};

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: Color }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export const travelStatusColor: Record<string, Color> = {
  PLANNED: 'blue',
  ONGOING: 'green',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

export const bookingStatusColor: Record<string, Color> = {
  PENDING: 'yellow',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'gray',
};