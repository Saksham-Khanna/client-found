import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth, AuthedRequest, readToken } from '../auth.js';
import { addLog, getUserById } from '../db.js';
import {
  allChatThreads,
  getChatThread,
  getChatThreadsByEmail,
  insertChatMessage,
  insertChatThread,
  markChatRead,
  updateChatThreadStatus,
} from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';
import type { ChatMessage, ChatThread } from '../types.js';

export const chatRouter = Router();

// ── Admin: List all chat threads ──
chatRouter.get('/threads', requireAdmin, asyncHandler(async (_req, res) => {
  const threads = await allChatThreads();
  res.json({ success: true, threads });
}));

// ── Client: List threads for their email or current session ──
chatRouter.get('/my-threads', asyncHandler(async (req, res) => {
  const email = (req.query.email as string)?.toLowerCase().trim();
  if (!email) {
    // Check if logged in via token
    const token = readToken(req);
    if (token) {
      const user = await getUserById(token.sub);
      if (user) {
        const threads = await getChatThreadsByEmail(user.email);
        res.json({ success: true, threads });
        return;
      }
    }
    res.json({ success: true, threads: [] });
    return;
  }
  const threads = await getChatThreadsByEmail(email);
  res.json({ success: true, threads });
}));

// ── Get single thread with messages ──
chatRouter.get('/threads/:id', asyncHandler(async (req, res) => {
  const thread = await getChatThread(req.params.id);
  if (!thread) {
    res.status(404).json({ success: false, message: 'Chat thread not found.' });
    return;
  }
  res.json({ success: true, thread });
}));

// ── Create a new thread / query ──
const newThreadSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  company: z.string().optional(),
  subject: z.string().min(1),
  category: z.enum(['General', 'Project Inquiry', 'Bug / Fix Request', 'Urgent Support']).default('General'),
  initialMessage: z.string().min(1),
});

chatRouter.post('/threads', asyncHandler(async (req, res) => {
  const parsed = newThreadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid chat data.' });
    return;
  }
  const { clientName, clientEmail, company, subject, category, initialMessage } = parsed.data;
  const id = `THR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e3)}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const threadMeta: Omit<ChatThread, 'messages'> = {
    id,
    clientName,
    clientEmail,
    company,
    subject,
    category,
    status: 'Open',
    lastMessage: initialMessage,
    lastMessageAt: now,
    unreadCountClient: 0,
    unreadCountAdmin: 1,
    createdAt: now,
  };

  await insertChatThread(threadMeta, initialMessage);
  await addLog(`New chat query from ${clientName} (${clientEmail}): "${subject}" [${category}]`, 'chat');

  const createdThread = await getChatThread(id);
  res.json({ success: true, thread: createdThread });
}));

// ── Send a message in a thread ──
const sendMessageSchema = z.object({
  senderName: z.string().min(1),
  senderEmail: z.string().email(),
  senderRole: z.enum(['client', 'admin', 'visitor']),
  content: z.string().min(1),
});

chatRouter.post('/threads/:id/messages', asyncHandler(async (req, res) => {
  const thread = await getChatThread(req.params.id);
  if (!thread) {
    res.status(404).json({ success: false, message: 'Thread not found.' });
    return;
  }

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid message body.' });
    return;
  }

  const { senderName, senderEmail, senderRole, content } = parsed.data;
  const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const message: ChatMessage = {
    id: msgId,
    threadId: thread.id,
    senderName,
    senderEmail,
    senderRole,
    content,
    timestamp: now,
  };

  await insertChatMessage(message);

  if (senderRole === 'admin') {
    await addLog(`Team reply sent to thread ${thread.id} (${thread.clientName})`, 'chat', senderName);
  }

  const updatedThread = await getChatThread(thread.id);
  res.json({ success: true, thread: updatedThread, message });
}));

// ── Mark thread as read ──
chatRouter.patch('/threads/:id/read', asyncHandler(async (req, res) => {
  const role = (req.body?.role === 'admin' ? 'admin' : 'client') as 'admin' | 'client';
  await markChatRead(req.params.id, role);
  res.json({ success: true });
}));

// ── Update thread status (Open / In Progress / Resolved) ──
chatRouter.patch('/threads/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const statusSchema = z.object({
    status: z.enum(['Open', 'In Progress', 'Resolved']),
  });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid status.' });
    return;
  }
  await updateChatThreadStatus(req.params.id, parsed.data.status);
  await addLog(`Chat thread ${req.params.id} marked as "${parsed.data.status}"`, 'chat');
  res.json({ success: true });
}));
