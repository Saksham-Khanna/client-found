import { createApp, ensureDbReady } from '../dist/app.js';

const app = createApp();

export default async function handler(req, res) {
  await ensureDbReady();
  return app(req, res);
}
