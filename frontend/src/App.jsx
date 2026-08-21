import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';
import { ToastProvider } from './components/Toast.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Events from './pages/Events.jsx';
import Announcements from './pages/Announcements.jsx';
import Posts from './pages/Posts.jsx';
import PostDetails from './pages/PostDetails.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminPosts from './pages/admin/AdminPosts.jsx';
import AdminEvents from './pages/admin/AdminEvents.jsx';
import AdminAnnouncements from './pages/admin/AdminAnnouncements.jsx';
import AdminGallery from './pages/admin/AdminGallery.jsx';
import AdminMembers from './pages/admin/AdminMembers.jsx';
import AdminFunds from './pages/admin/AdminFunds.jsx';
import AdminExpenses from './pages/admin/AdminExpenses.jsx';

function NotFound() {
  return (
    <div className="mandala-overlay flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-br from-maroon-700 to-deep px-6 text-center text-cream-100">
      <p className="text-7xl">🪔</p>
      <h1 className="mt-4 font-display text-4xl font-extrabold text-gradient-gold">404</h1>
      <p className="mt-2 text-cream-200/80">This page does not exist.</p>
      <Link to="/" className="btn-gold mt-8">Back to Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin area — protected by AdminRoute (backend also enforces it) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="funds" element={<AdminFunds />} />
            <Route path="expenses" element={<AdminExpenses />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      </div>
    </ToastProvider>
  );
}
