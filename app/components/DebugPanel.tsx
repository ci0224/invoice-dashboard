import type { ReactNode } from 'react';

interface DebugPanelProps {
  title?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function DebugPanel({ title = 'Debug Information', children, defaultOpen = false }: DebugPanelProps) {
  // Only render in development environment
  if (import.meta.env.VITE_DEV_ENVIRONMENT !== 'true') {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-medium">
              Debug Mode Active - This information is only visible in development environment
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow border-2 border-yellow-200">
        <details open={defaultOpen}>
          <summary className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-gray-600 flex items-center">
            <span className="mr-2">🔍</span>
            {title}
          </summary>
          <div className="mt-4 space-y-4">
            {children}
          </div>
        </details>
      </div>
    </div>
  );
}

interface DebugItemProps {
  label: string;
  value: string | number | boolean | null | undefined;
  type?: 'json' | 'text';
}

export function DebugItem({ label, value, type = 'text' }: DebugItemProps) {
  const displayValue = type === 'json' && value 
    ? JSON.stringify(value, null, 2)
    : value?.toString() || 'Not available';

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
        <span className="text-yellow-500 mr-2">⚡</span>
        {label}
      </h3>
      <div className="bg-gray-100 p-4 rounded border border-yellow-100">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {displayValue}
        </pre>
      </div>
    </div>
  );
} 