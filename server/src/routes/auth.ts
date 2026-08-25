import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth, setSessionCookie, clearSessionCookie, signToken, readToken, AuthedRequest } from '../auth.js';
import { addLog, getUserByEmail, getUserById, insertUser, pool } from '../db.js';
import { insertClient, toProfile } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  company: z.string().max(100).optional(),
});

authRouter.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid registration data.' });
    return;
  }
  const { name, email, password, company } = parsed.data;
  const trimmedEmail = email.toLowerCase().trim();

  if (await getUserByEmail(trimmedEmail)) {
    res.status(409).json({ success: false, message: 'Account with this email already exists. Please log in.' });
    return;
  }

  const joinedDate = new Date().toISOString().slice(0, 10);
  const id = `usr-cli-${Date.now()}`;
  await insertUser({
    id,
    name,
    email: trimmedEmail,
    company: company || '',
    role: 'client',
    passwordHash: bcrypt.hashSync(password, 10),
    joinedDate,
  });
  await insertClient({
    id: `CLI-${Date.now()}`,
    name,
    company: company || '',
    email: trimmedEmail,
    phone: '+1 (512) 555-0199',
    totalSpent: 0,
    activeProjectsCount: 0,
    joinedDate,
  });

  const user = await getUserById(id);
  if (!user) {
    res.status(500).json({ success: false, message: 'Failed to create account.' });
    return;
  }
  setSessionCookie(res, signToken(user.id, user.role));
  await addLog(`New client account registered: ${user.email} (${user.company || 'N/A'})`, 'auth', user.name);
  res.json({ success: true, user: toProfile(user) });
}));

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid email or password.' });
    return;
  }
  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  setSessionCookie(res, signToken(user.id, user.role));
  await addLog(`User ${user.email} (${user.role}) logged in successfully`, 'auth', user.name);
  res.json({ success: true, user: toProfile(user) });
}));

authRouter.post('/admin', asyncHandler(async (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const { rows } = await pool.query(`SELECT * FROM users WHERE role = 'admin' ORDER BY joined_date ASC LIMIT 1`);
  const admin = rows[0] as
    | { id: string; name: string; email: string; company: string | null; role: string; password_hash: string; joined_date: string }
    | undefined;

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    res.status(401).json({ success: false, message: 'Invalid master password.' });
    return;
  }

  const user = await getUserById(admin.id);
  if (!user) {
    res.status(500).json({ success: false, message: 'Failed to load admin account.' });
    return;
  }
  setSessionCookie(res, signToken(user.id, user.role));
  await addLog('Master Admin authenticated into console', 'auth', user.name);
  res.json({ success: true, user: toProfile(user) });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const payload = readToken(req);
  if (payload) await addLog('User logged out', 'auth');
  clearSessionCookie(res);
  res.json({ success: true });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const user = await getUserById(req.userId!);
  if (!user) {
    clearSessionCookie(res);
    res.status(401).json({ success: false, message: 'Session no longer valid.' });
    return;
  }
  res.json({ success: true, user: toProfile(user) });
}));
