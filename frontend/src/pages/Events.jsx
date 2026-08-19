import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { formatDate, eventDayLabel } from '../lib/utils.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import Section from '../components/Section.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listEvents()
      .then((data) => setEvents(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events
    .filter((ev) => new Date(`${ev.event_date}T23:59:59`) >= now)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = events
    .filter((ev) => new Date(`${ev.event_date}T23:59:59`) < now)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));

  function EventCard({ ev }) {
    return (
      <div className="card group flex flex-col overflow-hidden">
        <div className="relative">
          <ImagePlaceholder
            src={ev.image}
            caption={ev.title}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-maroon-800/90 px-3 py-1 text-xs font-semibold text-gold-200 ring-1 ring-gold-500/50">
            {eventDayLabel(ev.event_date)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-bold text-maroon-800">{ev.title}</h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-stone-500">{ev.description}</p>
          <div className="mt-4 space-y-1 text-sm text-stone-600">
            <p>{formatDate(ev.event_date)}</p>
            {ev.event_time && <p>{ev.event_time}</p>}
            {ev.location && <p>{ev.location}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="mandala-overlay bg-maroon-800 bg-gradient-to-br from-maroon-700 to-maroon-900 py-16 text-center text-cream-100">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-300">Events</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
            Our Events
          </h1>
          <p className="mt-4 text-cream-100/95">
            From the grand sthapana to visarjan — every celebration of the Mandal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {loading ? (
          <Spinner full />
        ) : error ? (
          <div className="card mx-auto max-w-xl p-10 text-center text-red-600">{error}</div>
        ) : events.length === 0 ? (
          <div className="card mx-auto max-w-xl p-12 text-center">
            <h2 className="mt-3 font-display text-xl font-bold text-maroon-800">No events yet</h2>
            <p className="mt-2 text-stone-500">Check back soon — events are being planned!</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Section align="left" eyebrow="Coming up" title="Upcoming Events" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((ev) => (
                    <EventCard key={ev.id} ev={ev} />
                  ))}
                </div>
              </>
            )}
            {past.length > 0 && (
              <div className="mt-16">
                <Section align="left" eyebrow="Recap" title="Past Events" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {past.map((ev) => (
                    <EventCard key={ev.id} ev={ev} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
