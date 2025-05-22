export type UsageMetricColor = 'blue' | 'green' | 'yellow' | 'red';

export interface UsageMetric {
    label: string;
    value: number;
    max: number;
    color?: UsageMetricColor;
} 