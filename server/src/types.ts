export type UserRole = 'admin' | 'client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: UserRole;
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

