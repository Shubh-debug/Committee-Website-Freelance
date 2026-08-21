import { supabase } from './supabase.js';

/**
 * Thin wrapper around fetch for the Express API.
 * Attaches the Supabase session JWT automatically on every request.
 */
const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

const get = (path) => request(path);
const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });
const put = (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) });
const del = (path) => request(path, { method: 'DELETE' });

export const api = {
  // ---- posts ----
  listPosts: (search) => get(`/posts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getPost: (id) => get(`/posts/${id}`),
  adminPosts: (search) => get(`/posts?all=1${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  adminPost: (id) => get(`/posts/admin/${id}`),
  createPost: (data) => post('/posts', data),
  updatePost: (id, data) => put(`/posts/${id}`, data),
  deletePost: (id) => del(`/posts/${id}`),

  // ---- events ----
  listEvents: () => get('/events'),
  getEvent: (id) => get(`/events/${id}`),
  createEvent: (data) => post('/events', data),
  updateEvent: (id, data) => put(`/events/${id}`, data),
  deleteEvent: (id) => del(`/events/${id}`),

  // ---- announcements ----
  listAnnouncements: () => get('/announcements'),
  adminAnnouncements: () => get('/announcements?all=1'),
  createAnnouncement: (data) => post('/announcements', data),
  updateAnnouncement: (id, data) => put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => del(`/announcements/${id}`),

  // ---- gallery ----
  listGallery: () => get('/gallery'),
  createGalleryItem: (data) => post('/gallery', data),
  deleteGalleryItem: (id) => del(`/gallery/${id}`),

  // ---- members ----
  me: () => get('/members/me'),
  updateMe: (data) => put('/members/me', data),
  adminMembers: () => get('/members'),
  updateMember: (id, data) => put(`/members/${id}`, data),
  deleteMember: (id) => del(`/members/${id}`),

  // ---- dashboard ----
  dashboardStats: () => get('/dashboard/stats'),

  // ---- finance ----
  financeOverview: (year) => get(`/finance/overview?year=${year}`),
  financeSettings: () => get('/finance/settings'),
  updateFinanceSettings: (data) => put('/finance/settings', data),
  contributions: (year) => get(`/finance/contributions?year=${year}`),
  createContribution: (data) => post('/finance/contributions', data),
  updateContribution: (id, data) => put(`/finance/contributions/${id}`, data),
  deleteContribution: (id) => del(`/finance/contributions/${id}`),
  expenses: (year) => get(`/finance/expenses?year=${year}`),
  createExpense: (data) => post('/finance/expenses', data),
  updateExpense: (id, data) => put(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => del(`/finance/expenses/${id}`),
};
