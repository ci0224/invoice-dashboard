interface ScanResponse {
    status: string;
    scan_upload_url: string;
    scan_id: string;
    upload_key: string;
    content_type: string;
}

const API_BASE_URL = 'https://invoice-api.airyvibe.com';

export async function initiateScan(username: string): Promise<ScanResponse> {
    try {
        const url = `${API_BASE_URL}/scan/${username}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data: ScanResponse = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

export async function uploadImage(uploadUrl: string, file: File, contentType: string): Promise<void> {
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
            throw new Error(`Upload failed: ${response.status}, body: ${errorText}`);
        }
    } catch (error) {
        throw error;
    }
} 