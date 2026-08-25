import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { allClients } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';

export const clientsRouter = Router();

clientsRouter.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ clients: await allClients() });
}));
