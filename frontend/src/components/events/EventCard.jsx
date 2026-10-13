import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import fallbackImage from "../../assets/bg.jpg";

function formatEventDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price to be announced";
  if (price === 0) return "Free";
  return `From ₹${price.toLocaleString()}`;
}

export function EventCard({ event, compact = false }) {
  const location = [event.location, event.city].filter(Boolean).join(", ");

  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-950/[0.08] ${compact ? "sm:flex" : ""}`}>
      <div className={`relative overflow-hidden bg-violet-100 ${compact ? "h-40 sm:h-auto sm:w-40 sm:shrink-0" : "aspect-[16/10]"}`}>
        <img alt={event.title || "Event"} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" onError={(imageEvent) => { imageEvent.currentTarget.src = fallbackImage; }} src={event.image || fallbackImage} />
        {event.category && <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-primary shadow-sm backdrop-blur">{event.category}</span>}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CalendarDays aria-hidden="true" size={14} />{formatEventDate(event.date)}</p>
        <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-ink sm:text-lg">{event.title || "Untitled event"}</h3>
        {location && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><MapPin aria-hidden="true" className="shrink-0" size={14} /><span className="truncate">{location}</span></p>}
        {compact && event.description && <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{event.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tickets from</p>
            <p className="mb-0 text-sm font-extrabold text-ink">{formatPrice(event.price)}</p>
          </div>
          {event._id ? (
            <Link className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2.5 text-xs font-extrabold text-brand-primary transition hover:bg-brand-primary hover:text-white" to={`/events/${event._id}`}>
              <Ticket aria-hidden="true" size={14} /> View event
            </Link>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-500">
              <Ticket aria-hidden="true" size={14} /> Details unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
