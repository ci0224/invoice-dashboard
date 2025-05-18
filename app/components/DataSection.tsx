interface DataSectionProps {
  onExportData: () => void;
  onViewReports: () => void;
}

export function DataSection({ onExportData, onViewReports }: DataSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">View Data</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onExportData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Export Data
          </button>
          <button 
            onClick={onViewReports}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            View Reports
          </button>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">Select an option to view or export your data</p>
        </div>
      </div>
    </div>
  );
} 