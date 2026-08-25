import type { AppConfig, ChatMessage, ChatThread, CMSConfig, Invoice, Lead, Project, ProjectAsset, StudioState, UserProfile } from '../store/studioStore';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = (body as { message?: string } | null)?.message || (body as { error?: string } | null)?.error || `Request failed (${res.status}).`;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

export const api = {
  // ── Auth ──
  login: (email: string, password: string) =>
    request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { name: string; email: string; password: string; company: string }) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  adminLogin: (password: string) =>
    request<AuthResult>('/auth/admin', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  // ── State ──
  getState: () => request<{ success: boolean; state: StudioState }>('/state'),
  resetState: () => request<{ success: boolean }>('/state/reset', { method: 'POST' }),

  // ── Leads ──
  addLead: (lead: Lead) => request<{ success: boolean; lead: Lead }>('/leads', { method: 'POST', body: JSON.stringify(lead) }),
  updateLeadStatus: (id: string, status: Lead['status']) =>
    request<{ success: boolean }>(`/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  convertLead: (id: string, project: Project) =>
    request<{ success: boolean; project: Project }>(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify({ project }) }),

  // ── Projects ──
  addProject: (project: Project) =>
    request<{ success: boolean; project: Project }>('/projects', { method: 'POST', body: JSON.stringify(project) }),
  updateProject: (id: string, patch: Partial<Project>) =>
    request<{ success: boolean; project: Project }>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  toggleMilestone: (projectId: string, milestoneId: string) =>
    request<{ success: boolean; project: Project }>(`/projects/${projectId}/milestones/${milestoneId}/toggle`, { method: 'PATCH' }),

  // ── Invoices ──
  addInvoice: (invoice: Invoice) =>
    request<{ success: boolean; invoice: Invoice }>('/invoices', { method: 'POST', body: JSON.stringify(invoice) }),
  updateInvoiceStatus: (id: string, status: Invoice['status']) =>
    request<{ success: boolean }>(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ── CMS ──
  getCMS: () => request<{ cms: CMSConfig }>('/cms'),
  updateCMS: (cms: CMSConfig) => request<{ success: boolean; cms: CMSConfig }>('/cms', { method: 'PUT', body: JSON.stringify(cms) }),

  // ── Logs / Notifications ──
  deleteLog: (id: string) => request<{ success: boolean }>(`/logs/${id}`, { method: 'DELETE' }),

  // ── App Configs (Personal App Builder) ──
  saveAppConfig: (config: Partial<AppConfig>) =>
    request<{ success: boolean; appConfig: AppConfig }>('/app-config', { method: 'POST', body: JSON.stringify(config) }),
  getAllAppConfigs: () =>
    request<{ success: boolean; appConfigs: AppConfig[] }>('/app-config'),
  getMyApps: () =>
    request<{ success: boolean; appConfigs: AppConfig[] }>('/app-config/my-apps'),
  updateAppConfigStatus: (id: string, status: AppConfig['status']) =>
    request<{ success: boolean }>(`/app-config/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ── Chat & Direct Queries ──
  getAllChatThreads: () =>
    request<{ success: boolean; threads: ChatThread[] }>('/chat/threads'),
  getMyChatThreads: (email?: string) =>
    request<{ success: boolean; threads: ChatThread[] }>(`/chat/my-threads${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  getChatThread: (id: string) =>
    request<{ success: boolean; thread: ChatThread }>(`/chat/threads/${id}`),
  createChatThread: (data: { clientName: string; clientEmail: string; company?: string; subject: string; category: ChatThread['category']; initialMessage: string }) =>
    request<{ success: boolean; thread: ChatThread }>('/chat/threads', { method: 'POST', body: JSON.stringify(data) }),
  sendChatMessage: (threadId: string, data: { senderName: string; senderEmail: string; senderRole: 'client' | 'admin' | 'visitor'; content: string }) =>
    request<{ success: boolean; thread: ChatThread; message: ChatMessage }>(`/chat/threads/${threadId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  markChatRead: (threadId: string, role: 'admin' | 'client') =>
    request<{ success: boolean }>(`/chat/threads/${threadId}/read`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  updateChatThreadStatus: (threadId: string, status: ChatThread['status']) =>
    request<{ success: boolean }>(`/chat/threads/${threadId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ── Project Assets & Deliverables ──
  getProjectAssets: (projectId: string) =>
    request<{ success: boolean; assets: ProjectAsset[] }>(`/assets/project/${projectId}`),
  getAllAssets: () =>
    request<{ success: boolean; assets: ProjectAsset[] }>('/assets'),
  addProjectAsset: (asset: Partial<ProjectAsset>) =>
    request<{ success: boolean; asset: ProjectAsset }>('/assets', { method: 'POST', body: JSON.stringify(asset) }),
  deleteProjectAsset: (id: string) =>
    request<{ success: boolean }>(`/assets/${id}`, { method: 'DELETE' }),
};

