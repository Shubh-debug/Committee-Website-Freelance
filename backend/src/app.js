import express from 'express';
import cors from 'cors';

import { isSupabaseConfigured } from './config/supabase.js';
import * as dashboardModule from './routes/dashboard.js';
import * as postsModule from './routes/posts.js';
import * as eventsModule from './routes/events.js';
import * as announcementsModule from './routes/announcements.js';
import * as galleryModule from './routes/gallery.js';
import * as membersModule from './routes/members.js';
import * as financeModule from './routes/finance.js';

function unwrapRouter(module) {
  let router = module;
  while (router && typeof router !== 'function' && router.default) router = router.default;
  return router;
}

const dashboardRouter = unwrapRouter(dashboardModule);
const postsRouter = unwrapRouter(postsModule);
const eventsRouter = unwrapRouter(eventsModule);
const announcementsRouter = unwrapRouter(announcementsModule);
const galleryRouter = unwrapRouter(galleryModule);
const membersRouter = unwrapRouter(membersModule);
const financeRouter = unwrapRouter(financeModule);

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || process.env.URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: false,
}));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ganesh-mandal-2026-api',
    supabaseConfigured: isSupabaseConfigured(),
    time: new Date().toISOString(),
  });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/posts', postsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/members', membersRouter);
app.use('/api/finance', financeRouter);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;