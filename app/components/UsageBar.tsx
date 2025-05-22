import { useEffect, useState } from 'react';
import { getUserUsage, formatUsageMetrics } from '../api/usage';
import type { UsageMetric, UsageMetricColor } from '../types/usage';
import { getUsername } from '../utils/auth';

const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
};

export function UsageBar() {
    const [metrics, setMetrics] = useState<UsageMetric[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUsername() {
            try {
                const username = await getUsername();
                setUsername(username);
            } catch (err) {
                console.error('Error getting username:', err);
                setError('Failed to get username');
            }
        }
        fetchUsername();
    }, []);

    useEffect(() => {
        async function fetchUsage() {
            if (!username) return;

            try {
                setLoading(true);
                const usageData = await getUserUsage(username);
                const formattedMetrics = formatUsageMetrics(usageData) as UsageMetric[];
                setMetrics(formattedMetrics);
                setError(null);
            } catch (err) {
                setError('Failed to load usage data');
                console.error('Error loading usage:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsage();
    }, [username]);

    if (!username) {
        return (
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="text-gray-500">Loading user information...</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    const metric = metrics[0]; // We now only have one metric
    if (!metric) return null;

    const percentage = (metric.value / metric.max) * 100;
    const color = colorClasses[metric.color as UsageMetricColor || 'blue'];
    const remaining = (metric as any).remaining; // Type assertion for the additional remaining property

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{metric.label}</span>
                    <div className="text-right">
                        <span className="font-medium text-gray-900">
                            {metric.value} / {metric.max}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            ({remaining} remaining)
                        </span>
                    </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color} transition-all duration-300 ease-in-out`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {percentage >= 90 ? 'Credit almost depleted' : 
                     percentage >= 70 ? 'Credit running low' : 
                     'Credit available'}
                </div>
            </div>
        </div>
    );
} 