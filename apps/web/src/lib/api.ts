const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit & { orgId?: string; token?: string } = {},
): Promise<T> {
  const { orgId, token, headers, ...customConfig } = options;

  const storedToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('agentflow_token') : null);
  const storedOrgId =
    orgId || (typeof window !== 'undefined' ? localStorage.getItem('agentflow_active_org_id') : null);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (storedToken) {
    defaultHeaders['Authorization'] = `Bearer ${storedToken}`;
  }

  if (storedOrgId) {
    defaultHeaders['x-organization-id'] = storedOrgId;
  }

  const response = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (typeof data === 'object' && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage, response.status, data);
  }

  return data as T;
}
