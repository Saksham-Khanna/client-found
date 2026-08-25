import bcrypt from 'bcryptjs';
import { countUsers, insertUser, type Queryable } from './db.js';
import {
  allClients, allInvoices, allLeads, allProjects, getCMS, insertClient, insertCMS, insertInvoice, insertLead, insertProject,
} from './repo.js';
import type { Lead, Project, Invoice, ClientAccount, CMSConfig } from './types.js';

function hash(pw: string): string {
  return bcrypt.hashSync(pw, 10);
}

const SEED_LEADS: Lead[] = [
  {
    id: 'LEAD-101',
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.io',
    company: 'Cyberdyne AI',
    service: 'Web Development',
    budget: '$25,000 - $50,000',
    timeline: '4-6 Weeks',
    description: 'Looking to build a next-gen web platform with interactive 3D visualizations and real-time LLM query streams.',
    status: 'New',
    createdAt: '2026-07-22 14:30',
  },
  {
    id: 'LEAD-102',
    name: 'Michael Vance',
    email: 'mvance@vancecap.com',
    company: 'Vance Capital',
    service: 'FinTech App',
    budget: '$50,000+',
    timeline: '8 Weeks',
    description: 'Need a mobile iOS/Android React Native wallet with automated portfolio rebalancing and biometric authentication.',
    status: 'Reviewing',
    createdAt: '2026-07-21 09:15',
  },
  {
    id: 'LEAD-103',
    name: 'Elena Rostova',
    email: 'elena@biomedx.org',
    company: 'BioMedX Health',
    service: 'HIPAA Portal',
    budget: '$25,000 - $50,000',
    timeline: '6 Weeks',
    description: 'HIPAA compliant patient intake system with automated lab test report parsing and PDF exports.',
    status: 'Quoted',
    createdAt: '2026-07-19 16:45',
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-01',
    name: 'Hearth Banking Portal',
    clientName: 'Jordan Michaels (Slate)',
    clientEmail: 'jordan@slate.inc',
    type: 'FinTech Web App',
    progress: 85,
    status: 'In Progress',
    budget: '$45,000',
    dueDate: '2026-08-15',
    stagingUrl: 'https://hearth-staging.clientfound.app',
    githubRepo: 'github.com/clientfound/hearth-banking',
    updatedAt: '2026-07-23 11:00',
    team: [
      { name: 'Ana S.', role: 'Lead Architect', avatarBg: 'bg-[#c9a86c]' },
      { name: 'Tom W.', role: 'Senior Frontend', avatarBg: 'bg-[#8fa3b8]' },
    ],
    milestones: [
      { id: 'm1', title: 'DB Schema & OAuth2 Auth', completed: true, dueDate: '2026-07-01' },
      { id: 'm2', title: 'Real-time Transaction Feed & Charts', completed: true, dueDate: '2026-07-14' },
      { id: 'm3', title: 'Stripe Treasury API Integration', completed: true, dueDate: '2026-07-25' },
      { id: 'm4', title: 'Security & Penetration Audit', completed: false, dueDate: '2026-08-05' },
    ],
  },
  {
    id: 'PRJ-2026-02',
    name: 'Wildpath Outdoor Companion',
    clientName: 'Lena Carstens',
    clientEmail: 'lena@wildpath.app',
    type: 'React Native Mobile App',
    progress: 100,
    status: 'Shipped',
    budget: '$38,000',
    dueDate: '2026-06-30',
    stagingUrl: 'https://wildpath.app',
    githubRepo: 'github.com/clientfound/wildpath-mobile',
    updatedAt: '2026-07-10 15:20',
    team: [
      { name: 'Ryan K.', role: 'Mobile Specialist', avatarBg: 'bg-[#9caf88]' },
      { name: 'Priya M.', role: 'UX Designer', avatarBg: 'bg-[#b8927a]' },
    ],
    milestones: [
      { id: 'wm1', title: 'Vector Map Tiles & Offline Sync', completed: true, dueDate: '2026-05-20' },
      { id: 'wm2', title: 'GPS Route Tracking Engine', completed: true, dueDate: '2026-06-05' },
      { id: 'wm3', title: 'App Store Submission & Review', completed: true, dueDate: '2026-06-28' },
    ],
  },
  {
    id: 'PRJ-2026-03',
    name: 'Canvas Telehealth Platform',
    clientName: 'Dr. Priya Mehta',
    clientEmail: 'priya@canvashealth.com',
    type: 'Healthcare SaaS',
    progress: 60,
    status: 'QA Review',
    budget: '$62,000',
    dueDate: '2026-09-01',
    stagingUrl: 'https://canvas-qa.clientfound.app',
    githubRepo: 'github.com/clientfound/canvas-telehealth',
    updatedAt: '2026-07-22 18:00',
    team: [
      { name: 'Ana S.', role: 'Fullstack Dev', avatarBg: 'bg-[#c9a86c]' },
      { name: 'Lucas C.', role: 'Backend Security', avatarBg: 'bg-[#a08fb4]' },
    ],
    milestones: [
      { id: 'cm1', title: 'WebRTC Video Consultation Room', completed: true, dueDate: '2026-07-05' },
      { id: 'cm2', title: 'HIPAA Compliant Encrypted Vault', completed: true, dueDate: '2026-07-18' },
      { id: 'cm3', title: 'AI Clinical Notes Transcription', completed: false, dueDate: '2026-08-10' },
    ],
  },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-001',
    clientName: 'Jordan Michaels (Slate)',
    projectName: 'Hearth Banking Portal',
    amount: 22500,
    status: 'Paid',
    dueDate: '2026-07-01',
    issuedDate: '2026-06-15',
    description: 'Milestone 1 & 2 Delivery (50% upfront)',
  },
  {
    id: 'INV-2026-002',
    clientName: 'Jordan Michaels (Slate)',
    projectName: 'Hearth Banking Portal',
    amount: 22500,
    status: 'Pending',
    dueDate: '2026-08-15',
    issuedDate: '2026-07-20',
    description: 'Final Milestone Delivery & Launch',
  },
  {
    id: 'INV-2026-003',
    clientName: 'Lena Carstens',
    projectName: 'Wildpath Outdoor Companion',
    amount: 38000,
    status: 'Paid',
    dueDate: '2026-06-30',
    issuedDate: '2026-06-01',
    description: 'Complete App Release Payment',
  },
  {
    id: 'INV-2026-004',
    clientName: 'Dr. Priya Mehta',
    projectName: 'Canvas Telehealth Platform',
    amount: 31000,
    status: 'Paid',
    dueDate: '2026-07-10',
    issuedDate: '2026-06-20',
    description: 'Sprint Phase 1 Delivery',
  },
];

const SEED_CLIENTS: ClientAccount[] = [
  {
    id: 'CLI-01',
    name: 'Jordan Michaels',
    company: 'Slate / Hearth Banking',
    email: 'jordan@slate.inc',
    phone: '+1 (512) 890-3411',
    totalSpent: 45000,
    activeProjectsCount: 1,
    joinedDate: '2026-05-10',
  },
  {
    id: 'CLI-02',
    name: 'Lena Carstens',
    company: 'Wildpath Inc',
    email: 'lena@wildpath.app',
    phone: '+1 (415) 762-9012',
    totalSpent: 38000,
    activeProjectsCount: 0,
    joinedDate: '2026-04-12',
  },
  {
    id: 'CLI-03',
    name: 'Dr. Priya Mehta',
    company: 'Canvas Health Solutions',
    email: 'priya@canvashealth.com',
    phone: '+1 (650) 431-8890',
    totalSpent: 62000,
    activeProjectsCount: 1,
    joinedDate: '2026-03-01',
  },
];

const SEED_CMS: CMSConfig = {
  openSlotsText: '2 build slots open for Q2 2026',
  availableSlotsCount: 2,
  heroTitle: 'Websites & apps,',
  heroHighlight: 'engineered to ship.',
  heroSubtitle: 'Client Found is a senior product team building high-converting websites and mobile applications for funded startups, enterprises and public-sector organisations.',
  nextAvailableStart: 'Monday, May 12',
  filmVideoUrl: 'https://videos.pexels.com/video-files/8631879/8631879-uhd_3840_2160_25fps.mp4',
  filmPosterUrl: 'https://images.pexels.com/videos/8631879/pexels-photo-8631879.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200',
  contactEmail: 'hello@clientfound.com',
};

export async function seedIfEmpty(q: Queryable) {
  if ((await countUsers(q)) > 0) return;

  await insertUser({
    id: 'usr-admin-01',
    name: 'Principal Admin',
    email: 'admin@clientfound.com',
    company: 'Client Found Studios',
    role: 'admin',
    passwordHash: hash('admin123'),
    joinedDate: '2026-01-01',
  }, q);
  await insertUser({
    id: 'usr-cli-01',
    name: 'Jordan Michaels',
    email: 'jordan@slate.inc',
    company: 'Slate / Hearth Banking',
    role: 'client',
    passwordHash: hash('client123'),
    joinedDate: '2026-05-10',
  }, q);
  await insertUser({
    id: 'usr-cli-02',
    name: 'Dr. Priya Mehta',
    email: 'priya@canvashealth.com',
    company: 'Canvas Health',
    role: 'client',
    passwordHash: hash('client123'),
    joinedDate: '2026-03-01',
  }, q);
  await insertUser({
    id: 'usr-cli-03',
    name: 'Lena Carstens',
    email: 'lena@wildpath.app',
    company: 'Wildpath Inc',
    role: 'client',
    passwordHash: hash('client123'),
    joinedDate: '2026-04-12',
  }, q);

  for (const c of SEED_CLIENTS) await insertClient(c, q);
  for (const l of SEED_LEADS) await insertLead(l, q);
  for (const p of SEED_PROJECTS) await insertProject(p, q);
  for (const i of SEED_INVOICES) await insertInvoice(i, q);
  await insertCMS(SEED_CMS, q);

  // Seed sample app configs
  await q.query(
    `INSERT INTO app_configs (id, user_id, project_id, client_name, client_email, company_name, app_name, app_type, tagline, primary_color, accent_color, theme, icon, features, platforms, estimated_cost, estimated_weeks, status, created_at, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
    [
      'APP-CFG-01',
      'usr-cli-01',
      'PRJ-2026-01',
      'Jordan Michaels',
      'jordan@slate.inc',
      'Slate / Hearth',
      'Hearth Banking',
      'FinTech App',
      'Bespoke mobile banking & treasury management for venture founders',
      '#c9a86c',
      '#e3c893',
      'dark',
      'shield',
      JSON.stringify(['Biometric Auth', 'Push Alerts', 'Live Charts', 'Card Lock / Freeze', 'Real-time WebSockets']),
      JSON.stringify(['iOS App Store', 'Android Play Store', 'PWA Web App']),
      '$45,000',
      '8 Weeks',
      'Building',
      '2026-07-15 10:00',
      'Requires strict PCI-DSS audit compliance and Plaid API integration.',
    ]
  );

  // Seed sample chat threads for multiple clients (WhatsApp style)
  const thread1 = 'THR-DEMO-01';
  const thread2 = 'THR-DEMO-02';
  const thread3 = 'THR-DEMO-03';
  const thread4 = 'THR-DEMO-04';

  await q.query(
    `INSERT INTO chat_threads (id, client_name, client_email, company, subject, category, status, last_message, last_message_at, unread_count_client, unread_count_admin, created_at) VALUES
     ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12),
     ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24),
     ($25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36),
     ($37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48)`,
    [
      // Jordan Michaels
      thread1, 'Jordan Michaels', 'jordan@slate.inc', 'Slate / Hearth Banking', 'TestFlight beta invite & biometric auth update', 'Project Inquiry', 'Open', 'The biometric FaceID unlock works seamlessly on iOS. When will the dark theme toggle be merged?', '2026-08-23 16:40', 0, 1, '2026-08-23 14:00',
      // Dr. Priya Mehta
      thread2, 'Dr. Priya Mehta', 'priya@canvashealth.com', 'Canvas Health', 'HIPAA encrypted video consultation latency', 'Bug / Fix Request', 'In Progress', 'We ran a test with 12 simultaneous doctors in Mumbai and latency was under 80ms! Incredible work.', '2026-08-23 15:20', 0, 0, '2026-08-23 11:30',
      // Lena Carstens
      thread3, 'Lena Carstens', 'lena@wildpath.app', 'Wildpath Inc', 'Mapbox offline vector tiles integration', 'General', 'Open', 'Hi team! Can we schedule a quick sprint demo for the GPS tracking module tomorrow?', '2026-08-23 14:15', 0, 2, '2026-08-23 10:00',
      // Marcus Vance
      thread4, 'Marcus Vance', 'marcus@apexcap.co', 'Apex Guild Community', 'Custom domain white-labeling & Stripe Connect paywalls', 'Project Inquiry', 'Resolved', 'Thanks for the quick fix on the Webhook secret! Everything is working properly.', '2026-08-22 18:30', 0, 0, '2026-08-22 12:00',
    ]
  );

  await q.query(
    `INSERT INTO chat_messages (id, thread_id, sender_name, sender_email, sender_role, content, timestamp) VALUES
     ($1, $2, $3, $4, $5, $6, $7),
     ($8, $2, $9, $10, $11, $12, $13),
     ($14, $2, $3, $4, $5, $15, $16),
     ($17, $18, $19, $20, $21, $22, $23),
     ($24, $18, $9, $10, $11, $25, $26),
     ($27, $28, $29, $30, $31, $32, $33),
     ($34, $35, $36, $37, $38, $39, $40)`,
    [
      // Jordan thread
      'msg-1', thread1, 'Jordan Michaels', 'jordan@slate.inc', 'client', 'Hi Ana! Excited about the progress on Sprint 3.', '2026-08-23 14:00',
      'msg-2', 'Ana S. (Principal)', 'ana@clientfound.com', 'admin', 'Hey Jordan! We just deployed the FaceID biometric module to the staging environment. Let us know how it feels.', '2026-08-23 14:45',
      'msg-3', 'Jordan Michaels', 'jordan@slate.inc', 'client', 'The biometric FaceID unlock works seamlessly on iOS. When will the dark theme toggle be merged?', '2026-08-23 16:40',

      // Priya thread
      'msg-4', thread2, 'Dr. Priya Mehta', 'priya@canvashealth.com', 'client', 'Testing the WebRTC consultation video streams today.', '2026-08-23 11:30',
      'msg-5', 'Ana S. (Principal)', 'ana@clientfound.com', 'admin', 'We optimized the TURN/STUN routing servers across Asia-South region for Canvas.', '2026-08-23 12:15',

      // Lena thread
      'msg-6', thread3, 'Lena Carstens', 'lena@wildpath.app', 'client', 'Hi team! Can we schedule a quick sprint demo for the GPS tracking module tomorrow?', '2026-08-23 14:15',

      // Marcus thread
      'msg-7', thread4, 'Marcus Vance', 'marcus@apexcap.co', 'client', 'Thanks for the quick fix on the Webhook secret! Everything is working properly.', '2026-08-22 18:30',
    ]
  );

  // Seed sample deliverables/assets
  await q.query(
    `INSERT INTO project_assets (id, project_id, title, category, url, file_size, version, uploaded_by, created_at) VALUES
     ($1, $2, $3, $4, $5, $6, $7, $8, $9),
     ($10, $2, $11, $12, $13, $14, $15, $8, $9),
     ($16, $2, $17, $18, $19, $20, $21, $8, $9),
     ($22, $2, $23, $24, $25, $26, $27, $8, $9)`,
    [
      'ast-1', 'PRJ-2026-01', 'Figma Design System v2.4 (Component Library)', 'design', 'https://figma.com/@clientfound/hearth-ui', '24.8 MB', 'v2.4', 'ClientFound Design Studio', '2026-07-10 11:30',
      'ast-2', 'PRJ-2026-01', 'Hearth Beta Android APK (Build 142)', 'build', 'https://builds.clientfound.app/hearth-v0.8.2.apk', '48.2 MB', 'v0.8.2-beta', 'CI/CD Pipeline', '2026-07-22 17:00',
      'ast-3', 'PRJ-2026-01', 'GitHub Core Monorepo (Next.js + Fastify)', 'code', 'https://github.com/clientfound/hearth-banking', '12.4 MB', 'main@a8f1b9', 'Ana S.', '2026-07-12 09:00',
      'ast-4', 'PRJ-2026-01', 'Hearth Technical Architecture & Security SOW', 'document', 'https://docs.clientfound.app/hearth-architecture-sow.pdf', '3.1 MB', 'v1.0', 'ClientFound Legal & Eng', '2026-07-05 14:00',
    ]
  );

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  await q.query(
    `INSERT INTO logs (id, timestamp, "user", action, type) VALUES
     ($1, $2, $3, $4, $5),
     ($6, $2, $7, $8, $9),
     ($10, $2, $11, $12, $13),
     ($14, $2, $15, $16, $17)`,
    [
      'log-1', now, 'Admin', 'Logged into Admin Dashboard', 'auth',
      'log-2', 'System', 'New lead received from Cyberdyne AI', 'lead',
      'log-3', 'Admin', 'Generated invoice INV-2026-002 ($22,500)', 'invoice',
      'log-4', 'Ana S.', 'Marked milestone "HIPAA Vault" complete', 'project',
    ]
  );

  console.log('Seeded database with demo data.');
}

export async function hasAdmin(q: Queryable): Promise<boolean> {
  const { rows } = await q.query(`SELECT COUNT(*) as c FROM users WHERE role = 'admin'`);
  return Number(rows[0].c) > 0;
}
