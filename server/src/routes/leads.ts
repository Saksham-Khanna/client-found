import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../auth.js';
import { addLog } from '../db.js';
import { sendInquiryNotification } from '../mailer.js';
import { allLeads, getLead, insertLead, updateLeadStatus, getProject, insertProject } from '../repo.js';
import { asyncHandler } from '../asyncHandler.js';
import type { Project } from '../types.js';

export const leadsRouter = Router();

const leadSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  service: z.string().min(1),
  budget: z.string().min(1),
  timeline: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['New', 'Reviewing', 'Quoted', 'Approved', 'Rejected']).optional(),
  createdAt: z.string().optional(),
});

leadsRouter.get('/', requireAdmin, asyncHandler(async (_req, res) => {
  res.json({ leads: await allLeads() });
}));

leadsRouter.post('/', asyncHandler(async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid lead data.' });
    return;
  }
  const data = parsed.data;
  const lead = {
    id: data.id || `LEAD-${crypto.randomUUID()}`,
    name: data.name,
    email: data.email,
    company: data.company,
    service: data.service,
    budget: data.budget,
    timeline: data.timeline,
    description: data.description,
    status: data.status || ('New' as const),
    createdAt: data.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  await insertLead(lead);
  await addLog(`New lead submission from ${lead.company} (${lead.name})`, 'lead');
  void sendInquiryNotification(lead).catch(() => {});
  res.json({ success: true, lead });
}));

const statusSchema = z.object({
  status: z.enum(['New', 'Reviewing', 'Quoted', 'Approved', 'Rejected']),
});

leadsRouter.patch('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  const lead = await getLead(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found.' });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Invalid status.' });
    return;
  }
  await updateLeadStatus(lead.id, parsed.data.status);
  await addLog(`Lead ${lead.id} (${lead.company}) status updated to "${parsed.data.status}"`, 'lead');
  res.json({ success: true });
}));

leadsRouter.post('/:id/convert', requireAdmin, asyncHandler(async (req, res) => {
  const lead = await getLead(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found.' });
    return;
  }

  const body = req.body as { project?: Partial<Project> } | undefined;
  let project: Project;
  if (body?.project?.id) {
    project = body.project as Project;
  } else {
    const base = lead.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    project = {
      id: `PRJ-${crypto.randomUUID()}`,
      name: `${lead.company} ${lead.service}`,
      clientName: lead.name,
      clientEmail: lead.email,
      type: lead.service,
      progress: 10,
      status: 'In Progress',
      budget: lead.budget,
      dueDate: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
      stagingUrl: `https://${base}-dev.clientfound.app`,
      githubRepo: `github.com/clientfound/${base}`,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      team: [
        { name: 'Ana S.', role: 'Lead Engineer', avatarBg: 'bg-[#c9a86c]' },
        { name: 'Tom W.', role: 'Fullstack Dev', avatarBg: 'bg-[#8fa3b8]' },
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Project Kickoff & Figma Design Signoff', completed: true, dueDate: 'Week 1' },
        { id: `m-${Date.now()}-2`, title: 'Core Architecture & API Integrations', completed: false, dueDate: 'Week 3' },
        { id: `m-${Date.now()}-3`, title: 'QA Testing & Final Deployment', completed: false, dueDate: 'Week 5' },
      ],
    };
  }

  await updateLeadStatus(lead.id, 'Approved');
  await insertProject(project);
  await addLog(`Converted lead ${lead.id} into active project ${project.id}`, 'project');
  res.json({ success: true, project });
}));

leadsRouter.get('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const lead = await getLead(req.params.id);
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found.' });
    return;
  }
  res.json({ lead });
}));
