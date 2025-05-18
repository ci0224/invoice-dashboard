interface InvoiceSectionProps {
  onCreateInvoice: () => void;
}

export function InvoiceSection({ onCreateInvoice }: InvoiceSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Invoices</h2>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">No invoices found</p>
        </div>
        <button 
          onClick={onCreateInvoice}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Invoice
        </button>
      </div>
    </div>
  );
} 