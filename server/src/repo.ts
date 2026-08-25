import { pool, type Queryable } from './db.js';
import type {
  AppConfig,
  AuditLog,
  ChatMessage,
  ChatThread,
  ClientAccount,
  CMSConfig,
  Invoice,
  Lead,
  Project,
  ProjectAsset,
  TeamMember,
  Milestone,
  UserAccount,
  UserProfile,
} from './types.js';

type Row = Record<string, unknown>;

// ── App Configs ──
function rowToAppConfig(r: Row): AppConfig {
  return {
    id: String(r.id),
    userId: r.user_id ? String(r.user_id) : undefined,
    projectId: r.project_id ? String(r.project_id) : undefined,
    clientName: String(r.client_name),
    clientEmail: String(r.client_email),
    companyName: String(r.company_name),
    appName: String(r.app_name),
    appType: String(r.app_type),
    tagline: String(r.tagline),
    primaryColor: String(r.primary_color),
    accentColor: String(r.accent_color),
    theme: (r.theme as 'dark' | 'light') || 'dark',
    icon: String(r.icon),
    features: JSON.parse(String(r.features || '[]')) as string[],
    platforms: JSON.parse(String(r.platforms || '[]')) as string[],
    estimatedCost: String(r.estimated_cost),
    estimatedWeeks: String(r.estimated_weeks),
    status: (r.status as AppConfig['status']) || 'Submitted',
    createdAt: String(r.created_at),
    notes: r.notes ? String(r.notes) : undefined,
  };
}

export async function allAppConfigs(): Promise<AppConfig[]> {
  const { rows } = await pool.query('SELECT * FROM app_configs ORDER BY created_at DESC');
  return rows.map(rowToAppConfig);
}

export async function getAppConfig(id: string): Promise<AppConfig | null> {
  const { rows } = await pool.query('SELECT * FROM app_configs WHERE id = $1', [id]);
  return rows[0] ? rowToAppConfig(rows[0]) : null;
}

export async function getAppConfigsByEmail(email: string): Promise<AppConfig[]> {
  const { rows } = await pool.query('SELECT * FROM app_configs WHERE LOWER(client_email) = $1 ORDER BY created_at DESC', [
    email.toLowerCase().trim(),
  ]);
  return rows.map(rowToAppConfig);
}

export async function insertAppConfig(c: AppConfig, q: Queryable = pool) {
  await q.query(
    `INSERT INTO app_configs (id, user_id, project_id, client_name, client_email, company_name, app_name, app_type, tagline, primary_color, accent_color, theme, icon, features, platforms, estimated_cost, estimated_weeks, status, created_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      c.id,
      c.userId ?? null,
      c.projectId ?? null,
      c.clientName,
      c.clientEmail.toLowerCase().trim(),
      c.companyName,
      c.appName,
      c.appType,
      c.tagline,
      c.primaryColor,
      c.accentColor,
      c.theme,
      c.icon,
      JSON.stringify(c.features),
      JSON.stringify(c.platforms),
      c.estimatedCost,
      c.estimatedWeeks,
      c.status,
      c.createdAt,
      c.notes ?? null,
    ]
  );
}

export async function updateAppConfigStatus(id: string, status: AppConfig['status']) {
  await pool.query('UPDATE app_configs SET status = $1 WHERE id = $2', [status, id]);
}

// ── Chat & Direct Queries ──
function rowToChatMessage(r: Row): ChatMessage {
  return {
    id: String(r.id),
    threadId: String(r.thread_id),
    senderName: String(r.sender_name),
    senderEmail: String(r.sender_email),
    senderRole: r.sender_role as ChatMessage['senderRole'],
    content: String(r.content),
    timestamp: String(r.timestamp),
  };
}

export async function allChatThreads(): Promise<ChatThread[]> {
  const { rows } = await pool.query('SELECT * FROM chat_threads ORDER BY last_message_at DESC');
  const threads: ChatThread[] = [];
  for (const r of rows) {
    const threadId = String(r.id);
    const { rows: msgRows } = await pool.query(
      'SELECT * FROM chat_messages WHERE thread_id = $1 ORDER BY timestamp ASC',
      [threadId]
    );
    threads.push({
      id: threadId,
      clientName: String(r.client_name),
      clientEmail: String(r.client_email),
      company: r.company ? String(r.company) : undefined,
      subject: String(r.subject),
      category: (r.category as ChatThread['category']) || 'General',
      status: (r.status as ChatThread['status']) || 'Open',
      lastMessage: String(r.last_message),
      lastMessageAt: String(r.last_message_at),
      unreadCountClient: Number(r.unread_count_client),
      unreadCountAdmin: Number(r.unread_count_admin),
      createdAt: String(r.created_at),
      messages: msgRows.map(rowToChatMessage),
    });
  }
  return threads;
}

export async function getChatThread(id: string): Promise<ChatThread | null> {
  const { rows } = await pool.query('SELECT * FROM chat_threads WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const r = rows[0];
  const { rows: msgRows } = await pool.query(
    'SELECT * FROM chat_messages WHERE thread_id = $1 ORDER BY timestamp ASC',
    [id]
  );
  return {
    id: String(r.id),
    clientName: String(r.client_name),
    clientEmail: String(r.client_email),
    company: r.company ? String(r.company) : undefined,
    subject: String(r.subject),
    category: (r.category as ChatThread['category']) || 'General',
    status: (r.status as ChatThread['status']) || 'Open',
    lastMessage: String(r.last_message),
    lastMessageAt: String(r.last_message_at),
    unreadCountClient: Number(r.unread_count_client),
    unreadCountAdmin: Number(r.unread_count_admin),
    createdAt: String(r.created_at),
    messages: msgRows.map(rowToChatMessage),
  };
}

export async function getChatThreadsByEmail(email: string): Promise<ChatThread[]> {
  const { rows } = await pool.query(
    'SELECT * FROM chat_threads WHERE LOWER(client_email) = $1 ORDER BY last_message_at DESC',
    [email.toLowerCase().trim()]
  );
  const threads: ChatThread[] = [];
  for (const r of rows) {
    const threadId = String(r.id);
    const { rows: msgRows } = await pool.query(
      'SELECT * FROM chat_messages WHERE thread_id = $1 ORDER BY timestamp ASC',
      [threadId]
    );
    threads.push({
      id: threadId,
      clientName: String(r.client_name),
      clientEmail: String(r.client_email),
      company: r.company ? String(r.company) : undefined,
      subject: String(r.subject),
      category: (r.category as ChatThread['category']) || 'General',
      status: (r.status as ChatThread['status']) || 'Open',
      lastMessage: String(r.last_message),
      lastMessageAt: String(r.last_message_at),
      unreadCountClient: Number(r.unread_count_client),
      unreadCountAdmin: Number(r.unread_count_admin),
      createdAt: String(r.created_at),
      messages: msgRows.map(rowToChatMessage),
    });
  }
  return threads;
}

export async function insertChatThread(t: Omit<ChatThread, 'messages'>, initialMessage?: string) {
  await pool.query(
    `INSERT INTO chat_threads (id, client_name, client_email, company, subject, category, status, last_message, last_message_at, unread_count_client, unread_count_admin, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      t.id,
      t.clientName,
      t.clientEmail.toLowerCase().trim(),
      t.company ?? null,
      t.subject,
      t.category,
      t.status,
      t.lastMessage,
      t.lastMessageAt,
      t.unreadCountClient,
      t.unreadCountAdmin,
      t.createdAt,
    ]
  );
  if (initialMessage) {
    const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
    await insertChatMessage({
      id: msgId,
      threadId: t.id,
      senderName: t.clientName,
      senderEmail: t.clientEmail,
      senderRole: 'client',
      content: initialMessage,
      timestamp: t.createdAt,
    });
  }
}

export async function insertChatMessage(m: ChatMessage) {
  await pool.query(
    `INSERT INTO chat_messages (id, thread_id, sender_name, sender_email, sender_role, content, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [m.id, m.threadId, m.senderName, m.senderEmail.toLowerCase().trim(), m.senderRole, m.content, m.timestamp]
  );

  const isAdmin = m.senderRole === 'admin';
  await pool.query(
    `UPDATE chat_threads
     SET last_message = $1,
         last_message_at = $2,
         unread_count_admin = CASE WHEN $3 = true THEN 0 ELSE unread_count_admin + 1 END,
         unread_count_client = CASE WHEN $3 = true THEN unread_count_client + 1 ELSE 0 END
     WHERE id = $4`,
    [m.content, m.timestamp, isAdmin, m.threadId]
  );
}

export async function updateChatThreadStatus(id: string, status: ChatThread['status']) {
  await pool.query('UPDATE chat_threads SET status = $1 WHERE id = $2', [status, id]);
}

export async function markChatRead(threadId: string, role: 'admin' | 'client') {
  if (role === 'admin') {
    await pool.query('UPDATE chat_threads SET unread_count_admin = 0 WHERE id = $1', [threadId]);
  } else {
    await pool.query('UPDATE chat_threads SET unread_count_client = 0 WHERE id = $1', [threadId]);
  }
}

// ── Project Assets & Deliverables ──
function rowToAsset(r: Row): ProjectAsset {
  return {
    id: String(r.id),
    projectId: String(r.project_id),
    title: String(r.title),
    category: r.category as ProjectAsset['category'],
    url: String(r.url),
    fileSize: r.file_size ? String(r.file_size) : undefined,
    version: r.version ? String(r.version) : undefined,
    uploadedBy: String(r.uploaded_by),
    createdAt: String(r.created_at),
  };
}

export async function getAssetsByProjectId(projectId: string): Promise<ProjectAsset[]> {
  const { rows } = await pool.query('SELECT * FROM project_assets WHERE project_id = $1 ORDER BY created_at DESC', [
    projectId,
  ]);
  return rows.map(rowToAsset);
}

export async function allAssets(): Promise<ProjectAsset[]> {
  const { rows } = await pool.query('SELECT * FROM project_assets ORDER BY created_at DESC');
  return rows.map(rowToAsset);
}

export async function insertAsset(a: ProjectAsset) {
  await pool.query(
    `INSERT INTO project_assets (id, project_id, title, category, url, file_size, version, uploaded_by, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [a.id, a.projectId, a.title, a.category, a.url, a.fileSize ?? null, a.version ?? null, a.uploadedBy, a.createdAt]
  );
}

export async function deleteAsset(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM project_assets WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// ── Reset ──
export async function wipeAll(q: Queryable = pool) {
  for (const table of [
    'users',
    'clients',
    'leads',
    'projects',
    'invoices',
    'cms',
    'logs',
    'app_configs',
    'chat_messages',
    'chat_threads',
    'project_assets',
  ]) {
    await q.query(`DELETE FROM ${table}`);
  }
}


// ── Users ──
export async function allUsers(): Promise<UserAccount[]> {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY joined_date ASC');
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    company: r.company ? String(r.company) : undefined,
    role: r.role as 'admin' | 'client',
    joinedDate: String(r.joined_date),
    passwordHash: String(r.password_hash),
  }));
}

export function toProfile(u: { id: string; name: string; email: string; company?: string; role: 'admin' | 'client'; joinedDate: string }): UserProfile {
  return { id: u.id, name: u.name, email: u.email, company: u.company, role: u.role, joinedDate: u.joinedDate };
}

// ── Clients ──
export async function allClients(): Promise<ClientAccount[]> {
  const { rows } = await pool.query('SELECT * FROM clients ORDER BY joined_date ASC');
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    company: String(r.company),
    email: String(r.email),
    phone: String(r.phone),
    totalSpent: Number(r.total_spent),
    activeProjectsCount: Number(r.active_projects_count),
    joinedDate: String(r.joined_date),
  }));
}

export async function insertClient(c: Omit<ClientAccount, 'id'> & { id?: string }, q: Queryable = pool) {
  const id = c.id ?? `CLI-${Date.now()}`;
  await q.query(
    `INSERT INTO clients (id, name, company, email, phone, total_spent, active_projects_count, joined_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, c.name, c.company, c.email.toLowerCase().trim(), c.phone, c.totalSpent, c.activeProjectsCount, c.joinedDate]
  );
}

// ── Leads ──
function rowToLead(r: Row): Lead {
  return {
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    company: String(r.company),
    service: String(r.service),
    budget: String(r.budget),
    timeline: String(r.timeline),
    description: String(r.description),
    status: r.status as Lead['status'],
    createdAt: String(r.created_at),
  };
}

export async function allLeads(): Promise<Lead[]> {
  const { rows } = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
  return rows.map(rowToLead);
}

export async function getLead(id: string): Promise<Lead | null> {
  const { rows } = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
  return rows[0] ? rowToLead(rows[0]) : null;
}

export async function insertLead(l: Lead, q: Queryable = pool) {
  await q.query(
    `INSERT INTO leads (id, name, email, company, service, budget, timeline, description, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [l.id, l.name, l.email, l.company, l.service, l.budget, l.timeline, l.description, l.status, l.createdAt]
  );
}

export async function updateLeadStatus(id: string, status: Lead['status']) {
  await pool.query('UPDATE leads SET status = $1 WHERE id = $2', [status, id]);
}

// ── Projects ──
function rowToProject(r: Row): Project {
  return {
    id: String(r.id),
    name: String(r.name),
    clientName: String(r.client_name),
    clientEmail: String(r.client_email),
    type: String(r.type),
    progress: Number(r.progress),
    status: r.status as Project['status'],
    budget: String(r.budget),
    dueDate: String(r.due_date),
    stagingUrl: String(r.staging_url),
    githubRepo: String(r.github_repo),
    updatedAt: String(r.updated_at),
    milestones: JSON.parse(String(r.milestones || '[]')) as Milestone[],
    team: JSON.parse(String(r.team || '[]')) as TeamMember[],
  };
}

export async function allProjects(): Promise<Project[]> {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY updated_at DESC');
  return rows.map(rowToProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return rows[0] ? rowToProject(rows[0]) : null;
}

export async function insertProject(p: Project, q: Queryable = pool) {
  await q.query(
    `INSERT INTO projects (id, name, client_name, client_email, type, progress, status, budget, due_date, staging_url, github_repo, updated_at, milestones, team)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      p.id, p.name, p.clientName, p.clientEmail, p.type, p.progress, p.status, p.budget, p.dueDate,
      p.stagingUrl, p.githubRepo, p.updatedAt,
      JSON.stringify(p.milestones), JSON.stringify(p.team),
    ]
  );
}

export async function updateProject(id: string, patch: Record<string, unknown>) {
  const allowed = [
    'name', 'clientName', 'clientEmail', 'type', 'progress', 'status', 'budget', 'dueDate',
    'stagingUrl', 'githubRepo', 'milestones', 'team',
  ];
  const mapped: Record<string, unknown> = {};
  for (const key of allowed) {
    if (patch[key] === undefined) continue;
    const col = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    mapped[col] = key === 'milestones' || key === 'team' ? JSON.stringify(patch[key]) : patch[key];
  }
  if (Object.keys(mapped).length === 0) return;
  mapped.updated_at = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const cols = Object.keys(mapped);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  await pool.query(`UPDATE projects SET ${set} WHERE id = $${cols.length + 1}`, [...Object.values(mapped), id]);
}

// ── Invoices ──
export async function allInvoices(): Promise<Invoice[]> {
  const { rows } = await pool.query('SELECT * FROM invoices ORDER BY issued_date DESC');
  return rows.map((r) => ({
    id: String(r.id),
    clientName: String(r.client_name),
    projectName: String(r.project_name),
    amount: Number(r.amount),
    status: r.status as Invoice['status'],
    dueDate: String(r.due_date),
    issuedDate: String(r.issued_date),
    description: String(r.description),
  }));
}

export async function insertInvoice(i: Invoice, q: Queryable = pool) {
  await q.query(
    `INSERT INTO invoices (id, client_name, project_name, amount, status, due_date, issued_date, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [i.id, i.clientName, i.projectName, i.amount, i.status, i.dueDate, i.issuedDate, i.description]
  );
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
  await pool.query('UPDATE invoices SET status = $1 WHERE id = $2', [status, id]);
}

// ── CMS ──
export async function getCMS(): Promise<CMSConfig | null> {
  const { rows } = await pool.query('SELECT * FROM cms WHERE id = 1');
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    openSlotsText: String(r.open_slots_text),
    availableSlotsCount: Number(r.available_slots_count),
    heroTitle: String(r.hero_title),
    heroHighlight: String(r.hero_highlight),
    heroSubtitle: String(r.hero_subtitle),
    nextAvailableStart: String(r.next_available_start),
    filmVideoUrl: String(r.film_video_url),
    filmPosterUrl: String(r.film_poster_url),
    contactEmail: String(r.contact_email),
  };
}

export async function insertCMS(c: CMSConfig, q: Queryable = pool) {
  await q.query(
    `INSERT INTO cms (id, open_slots_text, available_slots_count, hero_title, hero_highlight, hero_subtitle, next_available_start, film_video_url, film_poster_url, contact_email)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      c.openSlotsText, c.availableSlotsCount, c.heroTitle, c.heroHighlight, c.heroSubtitle,
      c.nextAvailableStart, c.filmVideoUrl, c.filmPosterUrl, c.contactEmail,
    ]
  );
}

export async function updateCMS(c: CMSConfig) {
  await pool.query(
    `UPDATE cms SET open_slots_text = $1, available_slots_count = $2, hero_title = $3, hero_highlight = $4, hero_subtitle = $5, next_available_start = $6, film_video_url = $7, film_poster_url = $8, contact_email = $9 WHERE id = 1`,
    [
      c.openSlotsText, c.availableSlotsCount, c.heroTitle, c.heroHighlight, c.heroSubtitle,
      c.nextAvailableStart, c.filmVideoUrl, c.filmPosterUrl, c.contactEmail,
    ]
  );
}

// ── Logs ──
export async function allLogs(): Promise<AuditLog[]> {
  const { rows } = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
  return rows.map((r) => ({
    id: String(r.id),
    timestamp: String(r.timestamp),
    user: String(r.user),
    action: String(r.action),
    type: r.type as AuditLog['type'],
  }));
}

export async function deleteLog(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM logs WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

