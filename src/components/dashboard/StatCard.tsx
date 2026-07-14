import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tint: 'green' | 'amber' | 'violet' | 'blue';
}

const TINTS: Record<StatCardProps['tint'], string> = {
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  blue: 'bg-blue-50 text-blue-600',
};

export function StatCard({ label, value, icon: Icon, tint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TINTS[tint]}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}
