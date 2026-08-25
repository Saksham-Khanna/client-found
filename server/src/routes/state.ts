import { Router } from 'express';
import { requireAdmin, requireAuth, AuthedRequest } from '../auth.js';
import { getUserById, runInTransaction } from '../db.js';
import { seedIfEmpty } from '../seed.js';
import {
  allAppConfigs,
  allAssets,
  allChatThreads,
  allClients,
  allInvoices,
  allLeads,
  allLogs,
  allProjects,
  allUsers,
  getAppConfigsByEmail,
  getAssetsByProjectId,
  getChatThreadsByEmail,
  getCMS,
  toProfile,
  wipeAll,
} from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';

export const stateRouter = Router();

stateRouter.get('/', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const user = await getUserById(req.userId!);
  if (!user) {
    res.status(401).json({ success: false, message: 'Session no longer valid.' });
    return;
  }

  if (user.role === 'admin') {
    const [cms, users, leads, projects, invoices, clients, logs, appConfigs, chatThreads, assets] = await Promise.all([
      getCMS(),
      allUsers(),
      allLeads(),
      allProjects(),
      allInvoices(),
      allClients(),
      allLogs(),
      allAppConfigs(),
      allChatThreads(),
      allAssets(),
    ]);
    res.json({
      success: true,
      state: {
        isAuthenticated: true,
        currentUser: toProfile(user),
        registeredUsers: users.map((u) => ({ ...u, passwordHash: undefined })),
        leads,
        projects,
        invoices,
        clients,
        cms,
        logs,
        appConfigs,
        chatThreads,
        assets,
      },
    });
    return;
  }

  const [cms, projects, invoices, clients] = await Promise.all([
    getCMS(),
    allProjects(),
    allInvoices(),
    allClients(),
  ]);
  const email = user.email.toLowerCase();
  const name = user.name.toLowerCase();
  const company = user.company ? user.company.toLowerCase() : '';

  const ownProjects = projects.filter(
    (p) =>
      p.clientEmail.toLowerCase() === email ||
      p.clientName.toLowerCase().includes(name)
  );
  const ownInvoices = invoices.filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(name) ||
      (company !== '' && inv.clientName.toLowerCase().includes(company))
  );
  const ownClients = clients.filter(
    (c) =>
      c.email.toLowerCase() === email ||
      c.name.toLowerCase().includes(name) ||
      (company !== '' && c.company.toLowerCase().includes(company))
  );

  const ownProjectIds = ownProjects.map((p) => p.id);
  const [ownAppConfigs, ownChatThreads, ownAssetsNested] = await Promise.all([
    getAppConfigsByEmail(email),
    getChatThreadsByEmail(email),
    Promise.all(ownProjectIds.map((pid) => getAssetsByProjectId(pid))),
  ]);

  const ownAssets = ownAssetsNested.flat();

  res.json({
    success: true,
    state: {
      isAuthenticated: true,
      currentUser: toProfile(user),
      registeredUsers: [],
      leads: [],
      projects: ownProjects,
      invoices: ownInvoices,
      clients: ownClients,
      cms,
      logs: [],
      appConfigs: ownAppConfigs,
      chatThreads: ownChatThreads,
      assets: ownAssets,
    },
  });
}));

stateRouter.post('/reset', requireAdmin, asyncHandler(async (_req, res) => {
  await runInTransaction(async (q) => {
    await wipeAll(q);
    await seedIfEmpty(q);
  });
  res.json({ success: true });
}));
