import { useState, useRef } from 'react';
import { initiateScan, uploadImage } from '../api/scan';
import { getUsername } from '../utils/auth';

interface InvoiceSectionProps {
  onCreateInvoice: () => void;
}

export function InvoiceSection({ onCreateInvoice }: InvoiceSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateInvoice = async () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files?.[0];
    if (!file) {
      console.log('[InvoiceSection] No file selected');
      return;
    }

    console.log('[InvoiceSection] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.warn('[InvoiceSection] Invalid file type:', file.type);
      setError('Please select an image file');
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.warn('[InvoiceSection] File too large:', file.size);
      setError('File size must be less than 10MB');
      return;
    }

    try {
      console.log('[InvoiceSection] Starting upload process');
      setIsUploading(true);
      setError(null);

      // Get username
      const username = await getUsername();
      if (!username) {
        console.error('[InvoiceSection] No username found');
        throw new Error('User not authenticated');
      }
      console.log('[InvoiceSection] Got username:', username);

      // Initiate scan and get upload URL
      console.log('[InvoiceSection] Initiating scan...');
      const scanResponse = await initiateScan(username);
      console.log('[InvoiceSection] Got scan response:', {
        status: scanResponse.status,
        scan_id: scanResponse.scan_id,
        upload_key: scanResponse.upload_key
      });
      
      if (!scanResponse.scan_upload_url) {
        throw new Error('No upload URL received from server');
      }

      // Upload the image
      console.log('[InvoiceSection] Starting image upload...');
      file = new File([file], scanResponse.upload_key, { type: scanResponse.content_type });
      await uploadImage(scanResponse.scan_upload_url, file, scanResponse.content_type);
      console.log('[InvoiceSection] Upload completed successfully');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('[InvoiceSection] Error in upload process:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      console.error('[InvoiceSection] Error details:', {
        message: errorMessage,
        error: err
      });
      setError(errorMessage);
    } finally {
      console.log('[InvoiceSection] Upload process finished');
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Invoices</h2>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">No invoices found</p>
        </div>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Upload button */}
        <button 
          onClick={handleCreateInvoice}
          disabled={isUploading}
          className={`w-full px-4 py-2 rounded-md transition-colors ${
            isUploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Create New Invoice'}
        </button>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Upload progress indicator */}
        {isUploading && (
          <div className="mt-2">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }} />
            </div>
            <p className="text-sm text-gray-500 mt-1">Processing your invoice...</p>
          </div>
        )}
      </div>
    </div>
  );
} 