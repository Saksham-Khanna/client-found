import { createApp, ensureDbReady } from './app.js';

const PORT = Number(process.env.PORT) || 4000;

ensureDbReady()
  .then(() => {
    createApp().listen(PORT, () => {
      console.log(`Client Found API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
