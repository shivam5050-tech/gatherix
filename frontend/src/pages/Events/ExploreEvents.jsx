import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { EventCard } from "../../components/events/EventCard";
import { getEvents } from "../../services/eventServices";

function toLocalDateString(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function eventMatchesText(event, query) {
  if (!query.trim()) return true;
  const searchable = [event.title, event.description, event.category, event.location, event.city]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  return searchable.includes(query.trim().toLocaleLowerCase());
}

export function ExploreEvents() {
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const response = await getEvents();
      setEvents(Array.isArray(response?.events) ? response.events : []);
    } catch (requestError) {
      console.error("Failed to load events:", requestError);
      setError("Could not load events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = [...new Set(events.map((event) => event.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const cities = [...new Set(events.map((event) => event.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const filteredEvents = events.filter((event) => {
    const matchesSearch = eventMatchesText(event, searchText);
    const matchesCategory = !selectedCategory || String(event.category || "").trim().toLocaleLowerCase() === selectedCategory.trim().toLocaleLowerCase();
    const matchesCity = !selectedCity || String(event.city || "").trim().toLocaleLowerCase() === selectedCity.trim().toLocaleLowerCase();
    const matchesDate = !selectedDate || toLocalDateString(event.date) === selectedDate;

    return matchesSearch && matchesCategory && matchesCity && matchesDate;
  });

  function clearFilters() {
    setSearchText("");
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedDate("");
  }

  return (
    <section className="min-h-[65vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container">
        <div className="mb-8">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Find something to do</p>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Explore events</h1>
          <p className="mb-0 text-sm text-slate-600">Search event details, then narrow the list by category, city, or date.</p>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 focus-within:border-brand-primary">
              <Search aria-hidden="true" className="shrink-0 text-brand-primary" size={18} />
              <span className="min-w-0 flex-1">
                <span className="sr-only">Search event details</span>
                <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" onChange={(event) => setSearchText(event.target.value)} placeholder="Search events, venues, cities" type="search" value={searchText} />
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 focus-within:border-brand-primary">
              <SlidersHorizontal aria-hidden="true" className="shrink-0 text-brand-primary" size={17} />
              <span className="min-w-0 flex-1">
                <span className="sr-only">Filter by category</span>
                <select className="w-full bg-transparent text-sm text-slate-700 outline-none" onChange={(event) => setSelectedCategory(event.target.value)} value={selectedCategory}>
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 focus-within:border-brand-primary">
              <MapPin aria-hidden="true" className="shrink-0 text-brand-primary" size={17} />
              <span className="min-w-0 flex-1">
                <span className="sr-only">Filter by city</span>
                <select className="w-full bg-transparent text-sm text-slate-700 outline-none" onChange={(event) => setSelectedCity(event.target.value)} value={selectedCity}>
                  <option value="">All cities</option>
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 focus-within:border-brand-primary">
              <CalendarDays aria-hidden="true" className="shrink-0 text-brand-primary" size={17} />
              <span className="min-w-0 flex-1">
                <span className="sr-only">Filter by date</span>
                <input aria-label="Filter by date" className="w-full bg-transparent text-sm text-slate-700 outline-none" onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
              </span>
            </label>

            <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-violet-50 hover:text-brand-primary" onClick={clearFilters} type="button">Clear filters</button>
          </div>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600" role="status">Loading events...</p>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <p className="mb-4 text-rose-700">{error}</p>
            <button className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" onClick={loadEvents} type="button">Try again</button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-extrabold">No events found</h2>
            <p className="mb-0 text-sm text-slate-600">Try another search, date, city, or category, or clear your filters.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">Showing {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEvents.map((event) => <EventCard event={event} key={event._id || `${event.title}-${event.date}`} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
