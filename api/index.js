import { createApp, ensureDbReady } from '../server/dist/app.js';

let appInstance = null;

export default async function handler(req, res) {
  try {
    if (!appInstance) {
      await ensureDbReady();
      appInstance = createApp();
    }
    return appInstance(req, res);
  } catch (err) {
    console.error('Vercel API error:', err);
    return res.status(500).json({ error: 'Server initialization error', details: err?.message || String(err) });
  }
}
