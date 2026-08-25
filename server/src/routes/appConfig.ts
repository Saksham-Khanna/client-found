import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth, AuthedRequest } from '../auth.js';
import { addLog, getUserById } from '../db.js';
import { allAppConfigs, getAppConfig, getAppConfigsByEmail, insertAppConfig, updateAppConfigStatus } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';
import type { AppConfig } from '../types.js';

export const appConfigRouter = Router();

const appConfigSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  companyName: z.string().min(1),
  appName: z.string().min(1),
  appType: z.string().min(1),
  tagline: z.string().default(''),
  primaryColor: z.string().default('#c9a86c'),
  accentColor: z.string().default('#e3c893'),
  theme: z.enum(['dark', 'light']).default('dark'),
  icon: z.string().default('sparkles'),
  features: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  estimatedCost: z.string().default('$25,000 - $35,000'),
  estimatedWeeks: z.string().default('4-6 Weeks'),
  status: z.enum(['Draft', 'Submitted', 'Under Review', 'Building', 'Completed']).default('Submitted'),
  notes: z.string().optional(),
});

appConfigRouter.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  const configs = await allAppConfigs();
  res.json({ success: true, appConfigs: configs });
}));

appConfigRouter.get('/my-apps', requireAuth, asyncHandler(async (req: AuthedRequest, res) => {
  const user = await getUserById(req.userId!);
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const configs = await getAppConfigsByEmail(user.email);
  res.json({ success: true, appConfigs: configs });
}));

appConfigRouter.get('/:id', asyncHandler(async (req, res) => {
  const config = await getAppConfig(req.params.id);
  if (!config) {
    res.status(404).json({ success: false, message: 'App configuration not found.' });
    return;
  }
  res.json({ success: true, appConfig: config });
}));

appConfigRouter.post('/', asyncHandler(async (req, res) => {
  const parsed = appConfigSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid configuration data.' });
    return;
  }
  const d = parsed.data;
  const config: AppConfig = {
    id: d.id || `APP-CFG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    userId: d.userId,
    projectId: d.projectId,
    clientName: d.clientName,
    clientEmail: d.clientEmail,
    companyName: d.companyName,
    appName: d.appName,
    appType: d.appType,
    tagline: d.tagline,
    primaryColor: d.primaryColor,
    accentColor: d.accentColor,
    theme: d.theme,
    icon: d.icon,
    features: d.features,
    platforms: d.platforms,
    estimatedCost: d.estimatedCost,
    estimatedWeeks: d.estimatedWeeks,
    status: d.status,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    notes: d.notes,
  };

  await insertAppConfig(config);
  await addLog(`New personal app spec configured: "${config.appName}" (${config.appType}) by ${config.clientName}`, 'app_config');
  res.json({ success: true, appConfig: config });
}));

appConfigRouter.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const statusSchema = z.object({
    status: z.enum(['Draft', 'Submitted', 'Under Review', 'Building', 'Completed']),
  });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid status.' });
    return;
  }
  await updateAppConfigStatus(req.params.id, parsed.data.status);
  await addLog(`App config ${req.params.id} status updated to "${parsed.data.status}"`, 'app_config');
  res.json({ success: true });
}));
