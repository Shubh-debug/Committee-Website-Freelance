import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { isSupabaseConfigured } from './config/supabase.js';

import dashboardRouter from './routes/dashboard.js';
import postsRouter from './routes/posts.js';
import eventsRouter from './routes/events.js';
import announcementsRouter from './routes/announcements.js';
import galleryRouter from './routes/gallery.js';
import membersRouter from './routes/members.js';

const app = express();

app.use(cors()); // configure stricter origins for production if needed
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

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// centralized error handler
app.use((err, _req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🪔 गणेश मित्र मंडळ API listening on http://localhost:${PORT}`);
  if (!isSupabaseConfigured()) {
    console.warn('⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — copy backend/.env.example to backend/.env');
  }
});
