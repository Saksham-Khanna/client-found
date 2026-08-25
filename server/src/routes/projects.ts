import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../auth.js';
import { addLog } from '../db.js';
import { allProjects, getProject, insertProject, updateProject } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';
import type { Project } from '../types.js';

export const projectsRouter = Router();

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  type: z.string().min(1),
  progress: z.number().min(0).max(100),
  status: z.enum(['In Progress', 'QA Review', 'Shipped', 'On Hold']),
  budget: z.string().min(1),
  dueDate: z.string().min(1),
  stagingUrl: z.string(),
  githubRepo: z.string(),
  milestones: z.array(z.object({ id: z.string(), title: z.string(), completed: z.boolean(), dueDate: z.string() })).default([]),
  team: z.array(z.object({ name: z.string(), role: z.string(), avatarBg: z.string() })).default([]),
});

projectsRouter.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ projects: await allProjects() });
}));

projectsRouter.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid project data.' });
    return;
  }
  const p = parsed.data as Project;
  const project: Project = {
    ...p,
    updatedAt: p.updatedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  await insertProject(project);
  await addLog(`Created new project "${project.name}"`, 'project');
  res.json({ success: true, project });
}));

projectsRouter.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const existing = await getProject(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Project not found.' });
    return;
  }
  await updateProject(existing.id, req.body ?? {});
  await addLog(`Updated project "${existing.name}"`, 'project');
  const updated = await getProject(existing.id);
  res.json({ success: true, project: updated });
}));

projectsRouter.patch('/:id/milestones/:mid/toggle', requireAdmin, asyncHandler(async (req, res) => {
  const prj = await getProject(req.params.id);
  if (!prj) {
    res.status(404).json({ success: false, message: 'Project not found.' });
    return;
  }
  const m = prj.milestones.find((item) => item.id === req.params.mid);
  if (!m) {
    res.status(404).json({ success: false, message: 'Milestone not found.' });
    return;
  }
  m.completed = !m.completed;
  const total = prj.milestones.length;
  const done = prj.milestones.filter((x) => x.completed).length;
  prj.progress = Math.round((done / total) * 100);
  await updateProject(prj.id, { milestones: prj.milestones, progress: prj.progress });
  await addLog(`Toggled milestone "${m.title}" in ${prj.name}`, 'project');
  res.json({ success: true, project: await getProject(prj.id) });
}));
