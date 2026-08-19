# श्री गणेश मित्र मंडळ 2026 — Community Website 🪔

A full-stack, production-ready community website for a Ganesh Chaturthi mandal:

- **Frontend** — React 18 + Vite + JSX + Tailwind CSS (Indian festive theme)
- **Backend** — Node.js + Express REST API with role-based authorization
- **Database** — Supabase PostgreSQL with RLS
- **Auth** — Supabase Auth (email/password)
- **Storage** — Supabase Storage (public `images` bucket)
- **Security** — Supabase RLS **and** backend admin checks (defense in depth)

> 🔑 The pre-configured **admin** account (`milindbawane2002@gmail.com`) is created by a
> **server-side script** (`backend/scripts/createAdmin.js`) using your Supabase
> **service-role** key — it is never hardcoded in frontend code, never sent to the
> browser, and the password lives only in your `backend/.env` (or replace it with
> your own password when you run the script).

---

## ✨ Features

| Area | Details |
|---|---|
| Public pages | Home, About, Events, Announcements, Posts (+details), Gallery, Contact |
| Member | Register (auto `member` role), login/logout, view content, manage own profile |
| Admin | Full CRUD for posts, events, announcements, gallery; manage members (roles/delete); dashboard stats |
| Admin dashboard | `/admin` — total members, posts, events, announcements, gallery images + management pages |
| Design | Saffron/gold/maroon/cream theme, mandala & diya decorations, graceful SVG placeholders for Ganesha idol, logo, festival photos |
| Extras | Loading/error states, protected routes, responsive mobile/desktop, `.env.example` files, SQL migration, this README |

> All image slots use elegant **inline SVG placeholders** until real photos are
> uploaded through the admin panel (Supabase Storage).

---

## 📁 Project structure

```
ganesh-mandal-2026/
├── frontend/                 # React + Vite + Tailwind
│   ├── .env.example          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   └── src/
│       ├── lib/              # supabase client (anon key), api wrapper, utils, placeholders
│       ├── context/          # AuthContext (session + profile + role)
│       ├── components/       # Navbar, Footer, ProtectedRoute, ImageUpload, …
│       └── pages/            # public pages + admin/ (dashboard & CRUD managers)
├── backend/                  # Node.js + Express
│   ├── .env.example          # server-side secrets (service-role key, admin creds)
│   ├── src/
│   │   ├── config/supabase.js        # admin (service-role) client
│   │   ├── middleware/auth.js        # JWT verify + requireAuth + requireAdmin
│   │   ├── routes/                   # posts, events, announcements, gallery, members, dashboard
│   │   └── server.js                 # Express app
│   └── scripts/createAdmin.js        # creates/promotes the admin account (idempotent)
└── supabase/
    └── migrations/001_initial_schema.sql   # tables, RLS, triggers, storage bucket + policies
```

---

## 🚀 Setup (local development)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** (region: Mumbai/Asia if possible).
2. Open **SQL Editor** → paste the contents of
   `supabase/migrations/001_initial_schema.sql` → **Run**.
   This creates all tables, RLS policies, triggers, the storage bucket and its policies.
3. (Optional but recommended) **Authentication → Providers → Email**: enable
   "Confirm email" if you want email verification, or disable it for instant logins.

### 2. Configure the environment

```bash
# Frontend
cp frontend/.env.example frontend/.env
# → fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
#   (Dashboard → Settings → API → Project URL / anon public key)

# Backend
cp backend/.env.example backend/.env
# → fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (service_role = SECRET, server-only),
#   ADMIN_EMAIL, ADMIN_PASSWORD
```

> ⚠️ The **service-role key is secret** — it only ever lives in `backend/.env`.
> Never put it in frontend code or commit it to Git (`.gitignore` already excludes `.env`).

### 3. Create the admin account

```bash
cd backend
npm install
npm run create:admin
```

Creates `milindbawane2002@gmail.com` (or whatever you set in `ADMIN_EMAIL`) in
Supabase Auth with email confirmed, and assigns the **admin** role in `profiles`.
Idempotent — if the user exists it is simply promoted to admin.
*The password in `.env.example` is the default; change it in your `.env` before
running, or change it after first login from the Profile page.*

### 4. Run the app

```bash
# Terminal 1 — backend API on :5000
cd backend && npm run dev

# Terminal 2 — frontend dev server on :5173 (proxies /api → :5000)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 → register a normal member to test the member experience,
then sign in with the admin credentials to try `/admin`.

---

## 🧪 What to test

1. **Member flow** — register → confirm email (if enabled) → login → browse all pages → edit own profile (name + photo).
2. **Member restrictions** — a member visiting `/admin` is redirected home; direct API calls with a member JWT get `403`.
3. **Admin flow** — login as admin → `/admin` shows dashboard stats → create/edit/publish/delete posts, events, announcements → upload images and add gallery photos → change member roles / delete a member.
4. **RLS** — try direct Supabase writes from the browser console: they fail for non-admins.

---

## 🔐 Security model (defense in depth)

- **RLS (database):** public can read published rows only; profiles are self-editable; **all** content writes require the admin role (`is_admin()` security-definer function). Storage: public reads, authenticated uploads, admin-only delete.
- **Backend (API):** every protected route verifies the Supabase JWT (`requireAuth`), and every mutation goes through `requireAdmin`, which checks the caller's `role` in `profiles`. The API uses the service-role client, so a request only succeeds if the role check already passed.
- **Frontend:** the anon-key client can never bypass the above — UI visibility (AdminRoute) is convenience, not the security boundary.
- New sign-ups are auto-added as **member** via a trigger on `auth.users` — nobody can self-assign admin.

---

## ☁️ Deployment

### Frontend → Vercel

1. Push the repo to GitHub, import `frontend/` as a Vercel project
   (Root directory: `frontend`).
2. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   and `VITE_API_BASE=https://<your-backend>.onrender.com`.
3. Build command `npm run build`, output `dist`. Deploy.

### Backend → Render (or Railway/Fly.io)

1. Create a new **Web Service** pointing at the repo, Root directory `backend`,
   build `npm install`, start `npm start`.
2. Add env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `PORT=5000`.
3. Run `npm run create:admin` **once** (Render → Shell, or locally against the
   same Supabase project) to provision the admin.
4. If Vite's proxy is not used in production, the frontend calls
   `VITE_API_BASE` directly (already supported in `src/lib/api.js`).

**CORS note:** the API enables `cors()` for all origins by default — for
production you should restrict it, e.g. `app.use(cors({ origin: 'https://your-app.vercel.app' }))`
in `backend/src/server.js`.

### Supabase

Nothing extra to deploy — SQL migration + envs are all that is needed.

---

## 🛠 Tech notes

- `posts`, `announcements` have a `published` flag (drafts invisible to public).
- Events are sorted upcoming-first on the public pages.
- Gallery uploads go through `supabase.storage.from('images')` with a signed-in
  user; the gallery row is created via the admin API.
- Updated timestamps are maintained by DB triggers.

## 🙏

गणपती बाप्पा मोरया! मंगलमूर्ती मोरया!
