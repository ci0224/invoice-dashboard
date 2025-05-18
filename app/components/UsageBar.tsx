import type { ReactNode } from 'react';

interface UsageMetric {
  label: string;
  value: number;
  max: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

interface UsageBarProps {
  metrics: UsageMetric[];
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

export function UsageBar({ metrics }: UsageBarProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const percentage = (metric.value / metric.max) * 100;
          const color = colorClasses[metric.color || 'blue'];
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{metric.label}</span>
                <span className="font-medium text-gray-900">
                  {metric.value} / {metric.max}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-300 ease-in-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 