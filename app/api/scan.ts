interface ScanResponse {
    status: string;
    scan_upload_url: string;
    scan_id: string;
    upload_key: string;
    content_type: string;
}

const API_BASE_URL = 'https://invoice-api.airyvibe.com';

export async function initiateScan(username: string): Promise<ScanResponse> {
    console.log(`[Scan API] Initiating scan for user: ${username}`);
    try {
        const url = `${API_BASE_URL}/scan/${username}`;
        console.log(`[Scan API] Calling endpoint: ${url}`);
        
        const response = await fetch(url);
        console.log(`[Scan API] Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Scan API] Error response: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data: ScanResponse = await response.json();
        console.log('[Scan API] Successfully got scan response:', {
            status: data.status,
            scan_id: data.scan_id
        });
        
        return data;
    } catch (error) {
        console.error('[Scan API] Error initiating scan:', error);
        throw error;
    }
}

export async function uploadImage(uploadUrl: string, file: File, contentType: string): Promise<void> {
    console.log('[Upload API] Starting image upload:', {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
    });

    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': contentType,
            },
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Upload API] Upload failed: ${response.status}, body: ${errorText}`);
            throw new Error(`Upload failed: ${response.status}, body: ${errorText}`);
        }
        
        console.log('[Upload API] Upload completed successfully');
    } catch (error) {
        console.error('[Upload API] Error uploading image:', error);
        throw error;
    }
} 