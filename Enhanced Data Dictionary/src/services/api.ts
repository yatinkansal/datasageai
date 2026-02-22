/**
 * API Service for DataSage AI
 * Handles all communication with the backend Flask API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = `API Error: ${response.status} ${response.statusText}`;
      try {
        const body = await response.json();
        if (body?.detail) message = body.detail;
        else if (body?.error) message = body.error;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === 'Failed to fetch' || msg.includes('Load failed') || msg.includes('NetworkError')) {
      throw new Error(
        'Cannot reach the backend. Start the backend on port 5001 (e.g. run "python app.py" in the datastage_backend folder).'
      );
    }
    throw error;
  }
}

/**
 * Extract database metadata
 * GET /extract
 */
export async function extractMetadata() {
  return fetchAPI('/extract');
}

/**
 * Profile a specific table
 * GET /profile/:table
 */
export async function profileTable(tableName: string) {
  return fetchAPI(`/profile/${tableName}`);
}

/**
 * Generate documentation for a table
 * GET /generate-doc/:table
 */
export async function generateDocumentation(tableName: string) {
  return fetchAPI(`/generate-doc/${tableName}`);
}

/**
 * Generate documentation for a single column
 * GET /generate-doc/:table/:column
 */
export async function generateColumnDocumentation(tableName: string, columnName: string) {
  return fetchAPI(`/generate-doc/${encodeURIComponent(tableName)}/${encodeURIComponent(columnName)}`);
}

/**
 * Chat with AI about the data
 * POST /chat
 */
export async function chatWithAI(question: string) {
  return fetchAPI('/chat', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

/**
 * Generate SQL from natural language
 * POST /generate-sql
 */
export async function generateSQL(query: string) {
  return fetchAPI('/generate-sql', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

/**
 * Health check
 * GET /
 */
export async function healthCheck() {
  return fetchAPI('/');
}

/**
 * Save connection config and get current DB stats
 * POST /connect
 */
export async function connectDatabase(config: {
  type: string;
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
}) {
  return fetchAPI('/connect', {
    method: 'POST',
    body: JSON.stringify(config),
  }) as Promise<{ success: boolean; tables: number; columns: number; message?: string }>;
}

/**
 * Get connection status and current DB stats
 * GET /connection-status
 */
export async function getConnectionStatus() {
  return fetchAPI('/connection-status') as Promise<{
    connected: boolean;
    config: Record<string, unknown> | null;
    tables: number;
    columns: number;
  }>;
}

/**
 * User settings
 */
// Note: profile & notification settings are currently stored on the frontend
// via UserContext/localStorage for simplicity during the hackathon.
