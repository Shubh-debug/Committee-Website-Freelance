import express from 'express';
import cors from 'cors';

import { isSupabaseConfigured } from './config/supabase.js';
import dashboardRouter from './routes/dashboard.js';
import postsRouter from './routes/posts.js';
import eventsRouter from './routes/events.js';
import announcementsRouter from './routes/announcements.js';
import galleryRouter from './routes/gallery.js';
import membersRouter from './routes/members.js';
import financeRouter from './routes/finance.js';

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