import { api } from '../api/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: 'admin' | 'client';
  joinedDate: string;
}

export interface UserAccount extends UserProfile {
  passwordHash: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  description: string;
  status: 'New' | 'Reviewing' | 'Quoted' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatarBg: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  type: string;
  progress: number;
  status: 'In Progress' | 'QA Review' | 'Shipped' | 'On Hold';
  budget: string;
  dueDate: string;
  stagingUrl: string;
  githubRepo: string;
  milestones: Milestone[];
  team: TeamMember[];
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  issuedDate: string;
  description: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalSpent: number;
  activeProjectsCount: number;
  joinedDate: string;
}

export interface CMSConfig {
  openSlotsText: string;
  availableSlotsCount: number;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  nextAvailableStart: string;
  filmVideoUrl: string;
  filmPosterUrl: string;
  contactEmail: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  type: 'lead' | 'project' | 'invoice' | 'cms' | 'auth' | 'chat' | 'asset' | 'app_config';
}

export interface AppConfig {
  id: string;
  userId?: string;
  projectId?: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  appName: string;
  appType: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  theme: 'dark' | 'light';
  icon: string;
  features: string[];
  platforms: string[];
  estimatedCost: string;
  estimatedWeeks: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Building' | 'Completed';
  createdAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'client' | 'admin' | 'visitor';
  content: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  clientName: string;
  clientEmail: string;
  company?: string;
  subject: string;
  category: 'General' | 'Project Inquiry' | 'Bug / Fix Request' | 'Urgent Support';
  status: 'Open' | 'In Progress' | 'Resolved';
  lastMessage: string;
  lastMessageAt: string;
  unreadCountClient: number;
  unreadCountAdmin: number;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  title: string;
  category: 'design' | 'build' | 'code' | 'document' | 'brand';
  url: string;
  fileSize?: string;
  version?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface StudioState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  registeredUsers: UserAccount[];
  leads: Lead[];
  projects: Project[];
  invoices: Invoice[];
  clients: ClientAccount[];
  cms: CMSConfig;
  logs: AuditLog[];
  appConfigs: AppConfig[];
  chatThreads: ChatThread[];
  assets: ProjectAsset[];
}

const EMPTY_CMS: CMSConfig = {
  openSlotsText: '',
  availableSlotsCount: 0,
  heroTitle: '',
  heroHighlight: '',
  heroSubtitle: '',
  nextAvailableStart: '',
  filmVideoUrl: '',
  filmPosterUrl: '',
  contactEmail: '',
};

function emptyState(): StudioState {
  return {
    isAuthenticated: false,
    currentUser: null,
    registeredUsers: [],
    leads: [],
    projects: [],
    invoices: [],
    clients: [],
    cms: EMPTY_CMS,
    logs: [],
    appConfigs: [],
    chatThreads: [],
    assets: [],
  };
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

class StudioStore {
  private state: StudioState;
  private listeners: Set<() => void> = new Set();
  private ready = false;

  constructor() {
    this.state = emptyState();
  }

  private async loadState(): Promise<void> {
    try {
      const res = await api.getState();
      this.state = { ...res.state, cms: res.state.cms || EMPTY_CMS };
    } catch {
      try {
        const { cms } = await api.getCMS();
        this.state = { ...emptyState(), cms };
      } catch {
        this.state = emptyState();
      }
    }
    this.notify();
  }

  public async init(): Promise<void> {
    await this.loadState();
    this.ready = true;
    this.notify();
  }

  public isReady(): boolean {
    return this.ready;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): StudioState {
    return this.state;
  }

  private syncWarn(action: string, err: unknown) {
    console.warn(`[store] Failed to sync ${action}:`, err);
  }

  // ── Authentication System ──
  public async clientLogin(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await api.login(email, password);
      if (!res.success || !res.user) {
        return { success: false, message: res.message || 'Invalid email or password.' };
      }
      this.applyUser(res.user);
      await this.loadState();
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, message: (err as Error).message || 'Invalid email or password.' };
    }
  }

  public async clientRegister(data: { name: string; email: string; password: string; company: string }): Promise<AuthResult> {
    try {
      const res = await api.register(data);
      if (!res.success || !res.user) {
        return { success: false, message: res.message || 'Registration failed.' };
      }
      this.applyUser(res.user);
      await this.loadState();
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, message: (err as Error).message || 'Registration failed.' };
    }
  }

  public async adminLogin(password: string): Promise<boolean> {
    try {
      const res = await api.adminLogin(password);
      if (!res.success || !res.user) return false;
      this.applyUser(res.user);
      await this.loadState();
      return true;
    } catch (err) {
      console.warn('[store] Admin login failed:', err);
      return false;
    }
  }

  private applyUser(user: UserProfile) {
    this.state.currentUser = user;
    this.state.isAuthenticated = true;
    this.notify();
  }

  public async logout() {
    this.state.currentUser = null;
    this.state.isAuthenticated = false;
    this.notify();
    try {
      await api.logout();
    } catch (err) {
      this.syncWarn('logout', err);
    }
    await this.loadState();
  }

  // ── Leads ──
  public addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `LEAD-${crypto.randomUUID()}`,
      status: 'New',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    this.state.leads.unshift(newLead);
    this.notify();
    api.addLead(newLead).catch((err) => this.syncWarn('lead submission', err));
    return newLead;
  }

  public updateLeadStatus(id: string, status: Lead['status']) {
    const lead = this.state.leads.find((l) => l.id === id);
    if (lead) {
      lead.status = status;
      this.notify();
      api.updateLeadStatus(id, status).catch((err) => this.syncWarn(`lead ${id} status`, err));
    }
  }

  public convertLeadToProject(leadId: string, overrides?: Partial<Project>): Project | null {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    lead.status = 'Approved';

    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newProject: Project = {
      id: `PRJ-${crypto.randomUUID()}`,
      name: `${lead.company} ${lead.service}`,
      clientName: lead.name,
      clientEmail: lead.email,
      type: lead.service,
      progress: 10,
      status: 'In Progress',
      budget: lead.budget,
      dueDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
      stagingUrl: `https://${slug(lead.company)}-dev.clientfound.app`,
      githubRepo: `github.com/clientfound/${slug(lead.company)}`,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      team: [
        { name: 'Ana S.', role: 'Lead Engineer', avatarBg: 'bg-[#c9a86c]' },
        { name: 'Tom W.', role: 'Fullstack Dev', avatarBg: 'bg-[#8fa3b8]' },
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Project Kickoff & Figma Design Signoff', completed: true, dueDate: 'Week 1' },
        { id: `m-${Date.now()}-2`, title: 'Core Architecture & API Integrations', completed: false, dueDate: 'Week 3' },
        { id: `m-${Date.now()}-3`, title: 'QA Testing & Final Deployment', completed: false, dueDate: 'Week 5' },
      ],
      ...overrides,
    };

    this.state.projects.unshift(newProject);
    this.notify();
    api.convertLead(leadId, newProject).catch((err) => this.syncWarn('lead conversion', err));
    return newProject;
  }

  // ── Projects ──
  public addProject(project: Omit<Project, 'id' | 'updatedAt'>): Project {
    const newPrj: Project = {
      ...project,
      id: `PRJ-${crypto.randomUUID()}`,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    this.state.projects.unshift(newPrj);
    this.notify();
    api.addProject(newPrj).catch((err) => this.syncWarn('project creation', err));
    return newPrj;
  }

  public updateProject(id: string, updates: Partial<Project>) {
    const prj = this.state.projects.find((p) => p.id === id);
    if (prj) {
      Object.assign(prj, updates, { updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) });
      this.notify();
      api.updateProject(id, updates).catch((err) => this.syncWarn(`project ${id} update`, err));
    }
  }

  public toggleMilestone(projectId: string, milestoneId: string) {
    const prj = this.state.projects.find((p) => p.id === projectId);
    if (prj) {
      const m = prj.milestones.find((item) => item.id === milestoneId);
      if (m) {
        m.completed = !m.completed;
        const total = prj.milestones.length;
        const done = prj.milestones.filter((x) => x.completed).length;
        prj.progress = Math.round((done / total) * 100);
        prj.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
        this.notify();
        api.toggleMilestone(projectId, milestoneId).catch((err) => this.syncWarn('milestone toggle', err));
      }
    }
  }

  // ── Invoices ──
  public addInvoice(inv: Omit<Invoice, 'id' | 'issuedDate'>): Invoice {
    const newInv: Invoice = {
      ...inv,
      id: `INV-${crypto.randomUUID()}`,
      issuedDate: new Date().toISOString().slice(0, 10),
    };
    this.state.invoices.unshift(newInv);
    this.notify();
    api.addInvoice(newInv).catch((err) => this.syncWarn('invoice creation', err));
    return newInv;
  }

  public updateInvoiceStatus(id: string, status: Invoice['status']) {
    const inv = this.state.invoices.find((i) => i.id === id);
    if (inv) {
      inv.status = status;
      this.notify();
      api.updateInvoiceStatus(id, status).catch((err) => this.syncWarn(`invoice ${id} status`, err));
    }
  }

  // ── CMS ──
  public updateCMS(updates: Partial<CMSConfig>) {
    const next = { ...this.state.cms, ...updates };
    this.state.cms = next;
    this.notify();
    api.updateCMS(next).catch((err) => this.syncWarn('cms update', err));
  }

  // ── Logs / Notifications ──
  public deleteLog(id: string) {
    this.state.logs = this.state.logs.filter((log) => log.id !== id);
    this.notify();
    api.deleteLog(id).catch((err) => this.syncWarn(`log ${id} delete`, err));
  }

  // ── App Configs (Personal App Builder) ──
  public async saveAppConfig(config: Partial<AppConfig>): Promise<AppConfig> {
    const user = this.state.currentUser;
    const newConfig: AppConfig = {
      id: config.id || `APP-CFG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      userId: user?.id,
      clientName: config.clientName || user?.name || 'Prospective Client',
      clientEmail: config.clientEmail || user?.email || '',
      companyName: config.companyName || user?.company || '',
      appName: config.appName || 'My Custom App',
      appType: config.appType || 'Creator Community',
      tagline: config.tagline || '',
      primaryColor: config.primaryColor || '#c9a86c',
      accentColor: config.accentColor || '#e3c893',
      theme: config.theme || 'dark',
      icon: config.icon || 'sparkles',
      features: config.features || [],
      platforms: config.platforms || ['iOS App Store', 'Android Play Store', 'PWA Web App'],
      estimatedCost: config.estimatedCost || '$25,000 - $35,000',
      estimatedWeeks: config.estimatedWeeks || '4-6 Weeks',
      status: config.status || 'Submitted',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: config.notes,
    };

    this.state.appConfigs.unshift(newConfig);
    this.notify();

    try {
      const res = await api.saveAppConfig(newConfig);
      if (res.success && res.appConfig) {
        const idx = this.state.appConfigs.findIndex((c) => c.id === newConfig.id);
        if (idx !== -1) {
          this.state.appConfigs[idx] = res.appConfig;
          this.notify();
        }
        return res.appConfig;
      }
    } catch (err) {
      this.syncWarn('app config save', err);
    }
    return newConfig;
  }

  public updateAppConfigStatus(id: string, status: AppConfig['status']) {
    const cfg = this.state.appConfigs.find((c) => c.id === id);
    if (cfg) {
      cfg.status = status;
      this.notify();
      api.updateAppConfigStatus(id, status).catch((err) => this.syncWarn(`app config ${id} status`, err));
    }
  }

  // ── Direct Chat & Queries ──
  public async createChatThread(data: {
    clientName: string;
    clientEmail: string;
    company?: string;
    subject: string;
    category: ChatThread['category'];
    initialMessage: string;
  }): Promise<ChatThread> {
    const threadId = `THR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e3)}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const initialMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderName: data.clientName,
      senderEmail: data.clientEmail,
      senderRole: 'client',
      content: data.initialMessage,
      timestamp: now,
    };

    const newThread: ChatThread = {
      id: threadId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      company: data.company,
      subject: data.subject,
      category: data.category,
      status: 'Open',
      lastMessage: data.initialMessage,
      lastMessageAt: now,
      unreadCountClient: 0,
      unreadCountAdmin: 1,
      createdAt: now,
      messages: [initialMsg],
    };

    this.state.chatThreads.unshift(newThread);
    this.notify();

    try {
      const res = await api.createChatThread(data);
      if (res.success && res.thread) {
        const idx = this.state.chatThreads.findIndex((t) => t.id === threadId);
        if (idx !== -1) {
          this.state.chatThreads[idx] = res.thread;
          this.notify();
        }
        return res.thread;
      }
    } catch (err) {
      this.syncWarn('chat thread creation', err);
    }
    return newThread;
  }

  public async sendChatMessage(threadId: string, content: string, senderRole: 'client' | 'admin' = 'client'): Promise<ChatMessage | null> {
    const user = this.state.currentUser;
    const thread = this.state.chatThreads.find((t) => t.id === threadId);
    const senderName = senderRole === 'admin' ? (user?.name ? `${user.name} (Engineering)` : 'ClientFound Team') : (user?.name || thread?.clientName || 'Client');
    const senderEmail = user?.email || thread?.clientEmail || 'client@studio.com';
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      threadId,
      senderName,
      senderEmail,
      senderRole,
      content,
      timestamp: now,
    };

    if (thread) {
      thread.messages.push(newMsg);
      thread.lastMessage = content;
      thread.lastMessageAt = now;
      if (senderRole === 'admin') {
        thread.unreadCountClient += 1;
      } else {
        thread.unreadCountAdmin += 1;
      }
      this.notify();
    }

    try {
      const res = await api.sendChatMessage(threadId, { senderName, senderEmail, senderRole, content });
      if (res.success && res.thread) {
        const idx = this.state.chatThreads.findIndex((t) => t.id === threadId);
        if (idx !== -1) {
          this.state.chatThreads[idx] = res.thread;
          this.notify();
        }
        return res.message;
      }
    } catch (err) {
      this.syncWarn('chat message send', err);
    }
    return newMsg;
  }

  public markChatRead(threadId: string, role: 'admin' | 'client') {
    const thread = this.state.chatThreads.find((t) => t.id === threadId);
    if (thread) {
      if (role === 'admin') thread.unreadCountAdmin = 0;
      else thread.unreadCountClient = 0;
      this.notify();
      api.markChatRead(threadId, role).catch((err) => this.syncWarn(`chat ${threadId} mark read`, err));
    }
  }

  public updateChatThreadStatus(threadId: string, status: ChatThread['status']) {
    const thread = this.state.chatThreads.find((t) => t.id === threadId);
    if (thread) {
      thread.status = status;
      this.notify();
      api.updateChatThreadStatus(threadId, status).catch((err) => this.syncWarn(`chat ${threadId} status`, err));
    }
  }

  // ── Assets & Deliverables ──
  public async addProjectAsset(asset: Partial<ProjectAsset>): Promise<ProjectAsset> {
    const user = this.state.currentUser;
    const newAsset: ProjectAsset = {
      id: asset.id || `AST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      projectId: asset.projectId || '',
      title: asset.title || 'Project Asset',
      category: asset.category || 'build',
      url: asset.url || '#',
      fileSize: asset.fileSize,
      version: asset.version,
      uploadedBy: asset.uploadedBy || user?.name || 'ClientFound Studio',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    this.state.assets.unshift(newAsset);
    this.notify();

    try {
      const res = await api.addProjectAsset(newAsset);
      if (res.success && res.asset) {
        const idx = this.state.assets.findIndex((a) => a.id === newAsset.id);
        if (idx !== -1) {
          this.state.assets[idx] = res.asset;
          this.notify();
        }
        return res.asset;
      }
    } catch (err) {
      this.syncWarn('asset addition', err);
    }
    return newAsset;
  }

  public deleteProjectAsset(id: string) {
    this.state.assets = this.state.assets.filter((a) => a.id !== id);
    this.notify();
    api.deleteProjectAsset(id).catch((err) => this.syncWarn(`asset ${id} delete`, err));
  }

  // ── Reset ──
  public async resetToDefaults() {
    try {
      await api.resetState();
    } catch (err) {
      this.syncWarn('state reset', err);
    }
    await this.init();
  }
}

export const studioStore = new StudioStore();

