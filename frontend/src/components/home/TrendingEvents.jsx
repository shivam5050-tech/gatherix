import { ArrowRight, CalendarX2, RefreshCw } from "lucide-react";
import { EventCard } from "../events/EventCard";

export function TrendingEvents({ events = [], loading = false, error = "", onRetry, onClearFilters }) {
  return (
    <section className="section-shell scroll-mt-20 bg-gradient-to-b from-[#f3f2ff] to-[#faf9ff]" id="events">
      <div className="page-container">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">Find your next plan</p>
            <h2 className="mb-0 text-2xl font-extrabold tracking-tight sm:text-3xl">Trending events</h2>
          </div>
          <a className="hidden items-center gap-1 text-sm font-bold text-brand-primary hover:text-brand-primary-dark sm:inline-flex" href="#categories">Browse categories <ArrowRight aria-hidden="true" size={16} /></a>
        </div>

        {loading ? (
          <div aria-label="Loading events" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status">
            {Array.from({ length: 4 }, (_, index) => <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" key={index}><div className="aspect-[16/10] animate-pulse bg-violet-100" /><div className="space-y-3 p-4"><div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" /><div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" /><div className="h-8 w-full animate-pulse rounded bg-slate-100" /></div></div>)}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-sm text-rose-700">{error}</p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" onClick={onRetry} type="button"><RefreshCw aria-hidden="true" size={15} /> Try again</button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-white/80 px-6 py-12 text-center">
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-violet-100 text-brand-primary"><CalendarX2 aria-hidden="true" size={22} /></span>
            <h3 className="text-lg font-extrabold">No events match those filters</h3>
            <p className="mx-auto max-w-md text-sm leading-6 text-slate-600">Try another search, city, category, or date to see what’s available.</p>
            <button className="mt-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-bold text-brand-primary hover:bg-violet-50" onClick={onClearFilters} type="button">Clear filters</button>
          </div>
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.slice(0, 4).map((event) => <EventCard event={event} key={event._id || `${event.title}-${event.date}`} />)}
          </div>
        )}
      </div>
    </section>
  );
}
