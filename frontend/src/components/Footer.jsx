import { Link } from 'react-router-dom';
import { SITE_NAME, TAGLINE } from '../lib/supabase.js';

export default function Footer() {
  return (
    <footer className="mandala-overlay-light bg-maroon-800 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-xl font-bold text-gold-200">{SITE_NAME} 2026</p>
          <p className="text-sm text-cream-100/90">
            एकत्र येऊया, साजरा करूया. देवाच्या आशीर्वादाने आपला गणेशोत्सव अधिक भव्य आणि
            दिमाखदार बनवूया.
          </p>
          <p className="text-lg font-semibold text-gold-100">{TAGLINE}</p>
        </div>

        <div>
          <p className="mb-3 font-semibold text-gold-200">Quick Links</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/about">About Us</Link></li>
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/events">Events</Link></li>
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/posts">Posts</Link></li>
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/gallery">Gallery</Link></li>
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-gold-200">Community</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/register">Join the Mandal</Link></li>
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/login">Member Login</Link></li>
            <li><Link className="text-cream-100/90 hover:text-gold-100" to="/announcements">Announcements</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold text-gold-200">Contact</p>
          <ul className="space-y-2 text-sm text-cream-100/90">
            <li>📍 Mumbai, Maharashtra, India</li>
            <li>✉️ mandal@example.com</li>
            <li>🪔 Ganesh Chaturthi 2026</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/15 py-5 text-center text-xs text-cream-100/80">
        <p>© 2026 {SITE_NAME} · Made with 🙏 and lots of modak · All rights reserved</p>
        <p className="mt-1">गणपती बाप्पा मोरया · मंगलमूर्ती मोरया</p>
      </div>
    </footer>
  );
}
