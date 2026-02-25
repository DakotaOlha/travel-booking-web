type Color = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

const colors: Record<Color, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: Color }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export const travelStatusColor: Record<string, Color> = {
  PLANNED: 'blue', ONGOING: 'green', COMPLETED: 'gray', CANCELLED: 'red',
};
export const bookingStatusColor: Record<string, Color> = {
  PENDING: 'yellow', CONFIRMED: 'green', CANCELLED: 'red', COMPLETED: 'gray',
};