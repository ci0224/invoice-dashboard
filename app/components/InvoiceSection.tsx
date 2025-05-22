import { useState, useRef } from 'react';
import { initiateScan, uploadImage } from '../api/scan';
import { getUsername } from '../utils/auth';

// Add JsonViewer component
interface JsonViewerProps {
  data: any;
  level?: number;
}

const JsonViewer = ({ data, level = 0 }: JsonViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const indent = level * 2;

  if (data === null) {
    return <span className="text-gray-500">null</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-purple-600">{data.toString()}</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-blue-600">{data}</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-green-600">"{data}"</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500">[]</span>;
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '▼' : '▶'} [
        </button>
        {isExpanded && (
          <div style={{ marginLeft: `${indent}px` }}>
            {data.map((item, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-2">{index}:</span>
                <JsonViewer data={item} level={level + 1} />
                {index < data.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="text-gray-500">]</span>
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-gray-500">{'{}'}</span>;
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '▼' : '▶'} {'{'}
        </button>
        {isExpanded && (
          <div style={{ marginLeft: `${indent}px` }}>
            {entries.map(([key, value], index) => (
              <div key={key} className="flex">
                <span className="text-orange-600 mr-2">"{key}":</span>
                <JsonViewer data={value} level={level + 1} />
                {index < entries.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="text-gray-500">{'}'}</span>
      </div>
    );
  }

  return <span className="text-gray-500">{String(data)}</span>;
};

interface InvoiceSectionProps {
  onCreateInvoice: () => void;
}

// Add logging utility
const log = (message: string, data?: any) => {
  console.log(`[InvoiceSection] ${message}`, data ? data : '');
};

export function InvoiceSection({ onCreateInvoice }: InvoiceSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleCreateInvoice = async () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files?.[0];
    if (!file) {
      log('No file selected');
      return;
    }

    log('File selected', { name: file.name, type: file.type, size: file.size });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      log('Invalid file type', file.type);
      setError('Please select an image file');
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      log('File too large', file.size);
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      log('Starting upload process');

      // Get username
      const username = await getUsername();
      if (!username) {
        log('User not authenticated');
        throw new Error('User not authenticated');
      }
      log('User authenticated', { username });

      // Initiate scan and get upload URL
      log('Initiating scan');
      const scanResponse = await initiateScan(username);
      log('Scan initiated', scanResponse);
      
      if (!scanResponse.scan_upload_url) {
        log('No upload URL received');
        throw new Error('No upload URL received from server');
      }

      // Upload the image
      log('Uploading image');
      file = new File([file], scanResponse.upload_key, { type: scanResponse.content_type });
      await uploadImage(scanResponse.scan_upload_url, file, scanResponse.content_type);
      log('Image upload successful');

      // Call scan API after successful upload
      setIsScanning(true);
      log('Starting scan API call');
      try {
        const scanApiResponse = await fetch('https://592d465kt6.execute-api.us-west-2.amazonaws.com/prod/lambda-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            scan_id: scanResponse.scan_id
          })
        });

        log('Scan API response received', { status: scanApiResponse.status });

        if (!scanApiResponse.ok) {
          const errorText = await scanApiResponse.text();
          log('Scan API error', { status: scanApiResponse.status, error: errorText });
          throw new Error(`Scan API failed: ${scanApiResponse.statusText}`);
        }

        const result = await scanApiResponse.json();
        log('Scan API success', result);
        if (result.statusCode === 200 && result.body?.extracted_data) {
          setScanResult(result.body.extracted_data);
        } else {
          throw new Error('Failed to extract invoice data');
        }
      } catch (scanErr) {
        log('Scan API error', scanErr);
        console.error('Scan API Error:', scanErr);
        setError(scanErr instanceof Error ? scanErr.message : 'Failed to process scan');
      } finally {
        setIsScanning(false);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        log('File input reset');
      }

    } catch (err) {
      log('Upload process error', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      log('Upload process completed');
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

        {isScanning && (
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Processing invoice...</p>
          </div>
        )}

        {scanResult && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Extracted Invoice Data</h3>
            <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap font-mono text-sm">
              <JsonViewer data={scanResult} />
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 