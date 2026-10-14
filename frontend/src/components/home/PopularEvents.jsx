import { useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { EventCard } from "../events/EventCard";

const filters = [
  { id: "all", label: "All events" },
  { id: "week", label: "Next 7 days" },
  { id: "free", label: "Free" },
];

export function PopularEvents({ events = [], city = "", loading = false, error = "", onRetry }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const visibleEvents = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return events.filter((event) => {
      if (activeFilter === "free") return Number(event.price) === 0;
      if (activeFilter === "week") {
        const eventDate = new Date(event.date);
        return !Number.isNaN(eventDate.getTime()) && eventDate >= now && eventDate <= end;
      }
      return true;
    }).slice(0, 3);
  }, [events, activeFilter]);

  return (
    <section className="section-shell bg-white" id="nearby">
      <div className="page-container">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">
              {city ? <MapPin aria-hidden="true" size={13} /> : <CalendarDays aria-hidden="true" size={13} />}
              {city ? `Events in ${city}` : "A few more ideas"}
            </p>
            <h2 className="mb-0 text-2xl font-extrabold tracking-tight sm:text-3xl">{city ? "Around your city" : "More events to explore"}</h2>
          </div>
          <div aria-label="Filter these events" className="flex flex-wrap gap-2" role="group">
            {filters.map((filter) => (
              <button aria-pressed={activeFilter === filter.id} className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${activeFilter === filter.id ? "bg-brand-primary text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-brand-primary"}`} key={filter.id} onClick={() => setActiveFilter(filter.id)} type="button">{filter.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-[#faf9ff] px-5 py-8 text-center text-sm text-slate-600" role="status">Loading more event ideas...</p>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center">
            <p className="mb-3 text-sm text-rose-800">More events could not be loaded. Try again.</p>
            <button className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-bold text-rose-800 hover:bg-rose-100" onClick={onRetry} type="button">Retry</button>
          </div>
        ) : visibleEvents.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {visibleEvents.map((event) => <EventCard compact event={event} key={event._id || `${event.title}-${event.date}`} />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-[#faf9ff] px-5 py-8 text-center text-sm text-slate-600">
            {activeFilter === "free" ? "No free events match the current search." : activeFilter === "week" ? "No events in the next 7 days match the current search." : "No events match the current search yet."}
          </p>
        )}
      </div>
    </section>
  );
}
