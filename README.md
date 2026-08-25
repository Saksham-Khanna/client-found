# Client Found Studios

> Websites & apps, engineered to ship.

A full-stack product studio management platform — public marketing site + admin console + client portal + interactive app configurator, all in one monorepo.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon Serverless) |
| Auth | JWT (httpOnly cookies), bcryptjs |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (serverless) / Render (Node.js) |

## Features

### Public Landing Page
- Animated hero with CMS-controlled content
- Scroll-driven immersive video section
- Services grid, pricing, FAQ, testimonial quotes
- Interactive mobile app configurator with live phone simulator

### Admin Console
- **Dashboard** — KPIs, charts, revenue overview
- **Leads Manager** — Pipeline tracking (New → Reviewing → Quoted → Approved)
- **Projects Manager** — CRUD, milestones, progress tracking, staging URLs
- **Invoices Manager** — Create/update invoices, status management
- **Chat Inbox** — Threaded conversations with clients
- **CMS Manager** — Edit hero text, film content, contact info
- **Audit Logs** — System activity tracking

### Client Portal
- Project overview with milestone progress
- Invoice viewer with status badges
- Asset & deliverable management
- Team member viewer
- Account settings

### Chat Widget
- WhatsApp-style floating support widget
- Threaded messaging with categories (General, Bug, Urgent)
- Read receipts and status management

## Project Structure

```
client-found/
├── api/index.js              # Vercel serverless entry
├── server/                   # Express backend
│   └── src/
│       ├── index.ts          # Server entry
│       ├── app.ts            # Express app config
│       ├── db.ts             # PostgreSQL connection & schema
│       ├── auth.ts           # JWT middleware
│       ├── repo.ts           # Data access layer
│       ├── mailer.ts         # Email service
│       ├── seed.ts           # Database seeder
│       └── routes/           # API routes
├── web/                      # React frontend
│   └── src/
│       ├── App.tsx           # Main SPA
│       ├── components/
│       │   ├── admin/        # Admin console
│       │   ├── client/       # Client portal
│       │   ├── configurator/ # App configurator
│       │   └── common/       # Shared components
│       ├── store/            # State management
│       └── api/              # API client
├── vercel.json               # Vercel config
└── render.yaml               # Render config
```

## Getting Started

### Prerequisites
- Node.js >= 22
- PostgreSQL database (Neon recommended)

### Installation

```bash
git clone https://github.com/Saksham-Khanna/client-found.git
cd client-found
npm install
```

### Environment Setup

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
JWT_SECRET=your-super-secret-random-string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=you@gmail.com
```

### Development

```bash
# Run both frontend + backend
npm run dev

# Frontend only (http://localhost:5173)
npm run dev:client

# Backend only (http://localhost:4000)
npm run dev:server
```

### Build & Deploy

```bash
# Build for production
npm run build:all

# Start production server
npm start
```

## Deployment

### Vercel
Push to GitHub and connect the repo on Vercel. Set environment variables in the dashboard.

### Render
Deploy via `render.yaml` — set `DATABASE_URL`, `JWT_SECRET`, and SMTP vars in Render dashboard.

## Default Credentials (Seed Data)

On first run with an empty database, the seeder creates demo data:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@clientfound.com` | `admin123` |
| Client | `jordan@slate.inc` | `client123` |
| Client | `priya@canvashealth.com` | `client123` |
| Client | `lena@wildpath.app` | `client123` |

## License

Private — Client Found Studios
