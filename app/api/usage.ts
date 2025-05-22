interface UsageResponse {
    status: string;
    username: string;
    usage: number;
    credit: string;
    remaining_credit: string;
}

const API_BASE_URL = 'https://invoice-api.airyvibe.com';

export async function getUserUsage(username: string): Promise<UsageResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/usage/${username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: UsageResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching usage data:', error);
        throw error;
    }
}

export function formatUsageMetrics(usageData: UsageResponse) {
    const credit = parseInt(usageData.credit);
    const usage = usageData.usage;
    
    // Calculate percentage of credit used
    const usagePercentage = (usage / credit) * 100;
    
    return [{
        label: 'Credit Usage',
        value: usage,
        max: credit,
        color: usagePercentage >= 90 ? 'red' : usagePercentage >= 70 ? 'yellow' : 'green',
        remaining: credit - usage
    }];
} 