import { Link } from 'react-router-dom';
import { SITE_NAME, TAGLINE } from '../lib/supabase.js';

export default function Footer() {
  return (
    <footer className="mandala-overlay-light bg-maroon-800 text-cream-100 border-t border-gold-500/20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Brand & About */}
        <div className="space-y-4">
          <div>
            <p className="font-display text-2xl font-bold text-gold-200">{SITE_NAME}</p>
            <p className="text-sm font-semibold tracking-wider text-gold-400">स्थापना २०२४</p>
          </div>
          <p className="text-sm leading-relaxed text-cream-100/80">
            एकत्र येऊया, साजरा करूया. देवाच्या आशीर्वादाने आपला गणेशोत्सव अधिक भव्य आणि
            दिमाखदार बनवूया.
          </p>
          <p className="text-base font-semibold text-gold-100 italic">"{TAGLINE}"</p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-300">Quick Links</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="text-cream-100/80 transition-colors hover:text-gold-200" to="/about">About Us</Link></li>
            <li><Link className="text-cream-100/80 transition-colors hover:text-gold-200" to="/events">Events</Link></li>
            <li><Link className="text-cream-100/80 transition-colors hover:text-gold-200" to="/posts">Posts</Link></li>
            <li><Link className="text-cream-100/80 transition-colors hover:text-gold-200" to="/gallery">Gallery</Link></li>
            <li><Link className="text-cream-100/80 transition-colors hover:text-gold-200" to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-300">Community</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link className="group flex items-center gap-2 text-cream-100/80 transition-colors hover:text-gold-200" to="/register">
                <span>Join the Mandal</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </li>
            <li>
              <Link className="text-cream-100/80 transition-colors hover:text-gold-200" to="/login">
                Member Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gold-300">Contact</p>
          <ul className="space-y-3 text-sm text-cream-100/80">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-gold-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </span>
              <span>Shri Krishna Nagar, Buti Bori,<br/>Nagpur - Maharashtra, 441108</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0 text-gold-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <a href="mailto:shriganeshmitramandal24@gmail.com" className="hover:text-gold-200 transition-colors">
                shriganeshmitramandal24@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="shrink-0 text-gold-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.864-1.051l-3.215-.536c-.538-.09-1.068.14-1.373.571l-1.366 1.952a15.485 15.485 0 01-8.23-8.23l1.952-1.366c.431-.305.661-.835.571-1.373l-.536-3.215C12.716 2.601 12.266 2.25 11.75 2.25h-1.372c-1.243 0-2.25 1.007-2.25 2.25z" />
                </svg>
              </span>
              <span>+91 89995 02699 / +91 94033 29478</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream-100/10 bg-maroon-900/50 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-6 text-center text-xs text-cream-100/60 sm:grid-cols-3 sm:text-left">
          <p>© {new Date().getFullYear()} {SITE_NAME} · All rights reserved</p>
          <p className="sm:text-center">Made with ❤️ and lots of modak</p>
          <p className="hidden sm:block"></p> {/* Invisible block to force the center text to align perfectly in the middle */}
        </div>
      </div>
    </footer>
  );
}