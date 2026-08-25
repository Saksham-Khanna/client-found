import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add a Neon (Postgres) connection string to server/.env');
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

export type Queryable = Pick<Pool, 'query'>;

export async function runInTransaction<T>(fn: (q: Queryable) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export interface RowLike {
  [key: string]: unknown;
}

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      company TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin','client')),
      password_hash TEXT NOT NULL,
      joined_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      total_spent INTEGER NOT NULL DEFAULT 0,
      active_projects_count INTEGER NOT NULL DEFAULT 0,
      joined_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      service TEXT NOT NULL,
      budget TEXT NOT NULL,
      timeline TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      type TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'In Progress',
      budget TEXT NOT NULL,
      due_date TEXT NOT NULL,
      staging_url TEXT NOT NULL,
      github_repo TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      milestones TEXT NOT NULL DEFAULT '[]',
      team TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      project_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      due_date TEXT NOT NULL,
      issued_date TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cms (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      open_slots_text TEXT NOT NULL,
      available_slots_count INTEGER NOT NULL,
      hero_title TEXT NOT NULL,
      hero_highlight TEXT NOT NULL,
      hero_subtitle TEXT NOT NULL,
      next_available_start TEXT NOT NULL,
      film_video_url TEXT NOT NULL,
      film_poster_url TEXT NOT NULL,
      contact_email TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      "user" TEXT NOT NULL,
      action TEXT NOT NULL,
      type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_configs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      project_id TEXT,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      company_name TEXT NOT NULL,
      app_name TEXT NOT NULL,
      app_type TEXT NOT NULL,
      tagline TEXT NOT NULL,
      primary_color TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT 'dark',
      icon TEXT NOT NULL,
      features TEXT NOT NULL DEFAULT '[]',
      platforms TEXT NOT NULL DEFAULT '[]',
      estimated_cost TEXT NOT NULL,
      estimated_weeks TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Submitted',
      created_at TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      company TEXT,
      subject TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      status TEXT NOT NULL DEFAULT 'Open',
      last_message TEXT NOT NULL DEFAULT '',
      last_message_at TEXT NOT NULL,
      unread_count_client INTEGER NOT NULL DEFAULT 0,
      unread_count_admin INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin', 'visitor')),
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_assets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('design', 'build', 'code', 'document', 'brand')),
      url TEXT NOT NULL,
      file_size TEXT,
      version TEXT,
      uploaded_by TEXT NOT NULL DEFAULT 'ClientFound Studio',
      created_at TEXT NOT NULL
    );
  `);
}

function rowToUser(row: RowLike): UserAccountShape {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: row.company ? String(row.company) : undefined,
    role: row.role as 'admin' | 'client',
    passwordHash: String(row.password_hash),
    joinedDate: String(row.joined_date),
  };
}

export interface UserAccountShape {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: 'admin' | 'client';
  passwordHash: string;
  joinedDate: string;
}

export async function getUserByEmail(email: string): Promise<UserAccountShape | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function getUserById(id: string): Promise<UserAccountShape | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ? rowToUser(rows[0]) : null;
}

export async function insertUser(u: UserAccountShape, q: Queryable = pool) {
  await q.query(
    `INSERT INTO users (id, name, email, company, role, password_hash, joined_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [u.id, u.name, u.email.toLowerCase().trim(), u.company ?? null, u.role, u.passwordHash, u.joinedDate]
  );
}

export async function countUsers(q: Queryable = pool): Promise<number> {
  const { rows } = await q.query('SELECT COUNT(*) as c FROM users');
  return Number(rows[0].c);
}

export async function addLog(action: string, type: string, user = 'System') {
  const id = `log-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
  await pool.query('INSERT INTO logs (id, timestamp, "user", action, type) VALUES ($1, $2, $3, $4, $5)', [
    id,
    timestamp,
    user,
    action,
    type,
  ]);
  await pool.query('DELETE FROM logs WHERE id NOT IN (SELECT id FROM logs ORDER BY timestamp DESC LIMIT 100)');
}
