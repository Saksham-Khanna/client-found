import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../auth.js';
import { addLog } from '../db.js';
import { allAssets, deleteAsset, getAssetsByProjectId, insertAsset } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';
import type { ProjectAsset } from '../types.js';

export const assetsRouter = Router();

const assetSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['design', 'build', 'code', 'document', 'brand']),
  url: z.string().min(1),
  fileSize: z.string().optional(),
  version: z.string().optional(),
  uploadedBy: z.string().default('ClientFound Studio'),
});

// ── Get assets by project ID (Client or Admin) ──
assetsRouter.get('/project/:projectId', requireAuth, asyncHandler(async (req, res) => {
  const assets = await getAssetsByProjectId(req.params.projectId);
  res.json({ success: true, assets });
}));

// ── Get all assets (Admin) ──
assetsRouter.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  const assets = await allAssets();
  res.json({ success: true, assets });
}));

// ── Add new project asset (Client or Admin) ──
assetsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  const parsed = assetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid asset data.' });
    return;
  }
  const d = parsed.data;
  const asset: ProjectAsset = {
    id: d.id || `AST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    projectId: d.projectId,
    title: d.title,
    category: d.category,
    url: d.url,
    fileSize: d.fileSize,
    version: d.version,
    uploadedBy: d.uploadedBy,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };

  await insertAsset(asset);
  await addLog(`Asset added to project ${asset.projectId}: "${asset.title}" (${asset.category})`, 'asset');
  res.json({ success: true, asset });
}));

// ── Delete asset (Admin) ──
assetsRouter.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const deleted = await deleteAsset(req.params.id);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'Asset not found.' });
    return;
  }
  await addLog(`Deleted project asset ${req.params.id}`, 'asset');
  res.json({ success: true });
}));
