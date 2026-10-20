import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { deleteAdminEvent, getAdminEvents, updateAdminEventStatus } from "../../services/adminServices";
import { AdminNavigation } from "./AdminNavigation";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function StatusBadge({ status }) {
  const colors = {
    published: "bg-emerald-100 text-emerald-800",
    draft: "bg-amber-100 text-amber-800",
    cancelled: "bg-rose-100 text-rose-800",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {status || "Unknown"}
    </span>
  );
}

function Organizer({ organizer }) {
  if (!organizer) return <span className="text-slate-500">Organizer unavailable</span>;
  return (
    <span className="block">
      <span className="block font-semibold text-slate-800">{organizer.name || "Unnamed organizer"}</span>
      {organizer.email && <span className="block text-xs text-slate-500">{organizer.email}</span>}
    </span>
  );
}

export function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingEventId, setPendingEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getAdminEvents({ page, limit: 10, search, category, status });
        if (active) {
          setEvents(result.events);
          setPagination(result.pagination);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load events.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadEvents();
    return () => { active = false; };
  }, [page, reloadKey, search, category, status]);

  function submitFilters(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setCategory(categoryInput.trim());
  }

  function changeStatus(event) {
    setPage(1);
    setStatus(event.target.value);
  }

  const totalPages = pagination?.totalPages || 0;

  async function runStatusChange(event, nextStatus) {
    const label = nextStatus === "published" ? "publish" : nextStatus === "draft" ? "unpublish" : "cancel";
    const extra = nextStatus === "cancelled"
      ? " Existing bookings and payments will remain unchanged. Any paid bookings need manual refund handling and will not be refunded automatically."
      : "";
    if (!window.confirm(`Are you sure you want to ${label} “${event.title}”?${extra}`)) return;
    setPendingEventId(event.id);
    setNotice("");
    setError("");
    try {
      const result = await updateAdminEventStatus(event.id, nextStatus);
      setNotice(result.message || "Event status updated.");
      setReloadKey((key) => key + 1);
      if (selectedEvent?.id === event.id) setSelectedEvent({ ...selectedEvent, status: nextStatus });
    } catch (actionError) {
      setError(actionError.message || "Could not update event status.");
    } finally {
      setPendingEventId("");
    }
  }

  async function removeEvent(event) {
    if (event.bookingCounts?.total > 0) {
      setError("This event has booking history and cannot be deleted. Unpublish or cancel it instead.");
      return;
    }
    if (!window.confirm(`Delete “${event.title}”? This is allowed only when the event has no booking history.`)) return;
    setPendingEventId(event.id);
    setNotice("");
    setError("");
    try {
      const result = await deleteAdminEvent(event.id);
      setNotice(result.message || "Event deleted.");
      setSelectedEvent(null);
      setReloadKey((key) => key + 1);
    } catch (actionError) {
      setError(actionError.message || "Could not delete event.");
    } finally {
      setPendingEventId("");
    }
  }

  function EventActions({ event }) {
    const busy = pendingEventId === event.id;
    return (
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-violet-50 disabled:opacity-50" disabled={Boolean(pendingEventId)} onClick={() => setSelectedEvent(event)} type="button">Details</button>
        {event.status === "draft" && <button className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50" disabled={Boolean(pendingEventId)} onClick={() => runStatusChange(event, "published")} type="button">{busy ? "Saving…" : "Publish"}</button>}
        {event.status === "published" && <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50" disabled={Boolean(pendingEventId)} onClick={() => runStatusChange(event, "draft")} type="button">{busy ? "Saving…" : "Unpublish"}</button>}
        {event.status !== "cancelled" && <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50" disabled={Boolean(pendingEventId)} onClick={() => runStatusChange(event, "cancelled")} type="button">{busy ? "Saving…" : "Cancel event"}</button>}
        {event.bookingCounts?.total === 0 && <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50" disabled={Boolean(pendingEventId)} onClick={() => removeEvent(event)} type="button">{busy ? "Deleting…" : "Delete"}</button>}
      </div>
    );
  }

  return (
    <section className="min-h-[70vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Gatherix administration</p>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Event Management</h1>
        <p className="mb-7 text-sm leading-6 text-slate-600">Review event details and control availability across all organizers.</p>

        <AdminNavigation />

        <div className="surface-card mb-5 p-4 sm:p-5">
          <form className="grid gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.7fr)_12rem_auto]" onSubmit={submitFilters} role="search">
            <label className="sr-only" htmlFor="admin-event-search">Search event titles</label>
            <input
              className="min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              id="admin-event-search"
              maxLength={100}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search event title"
              type="search"
              value={searchInput}
            />
            <label className="sr-only" htmlFor="admin-event-category">Filter by category</label>
            <input
              className="min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              id="admin-event-category"
              maxLength={80}
              onChange={(event) => setCategoryInput(event.target.value)}
              placeholder="Category"
              type="text"
              value={categoryInput}
            />
            <label className="sr-only" htmlFor="admin-event-status">Filter by status</label>
            <select
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
              id="admin-event-status"
              onChange={changeStatus}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" type="submit">
              <Search aria-hidden="true" size={16} /> Search
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="mb-0">{error}</p>
            <button className="self-start rounded-lg border border-rose-300 bg-white px-3 py-2 font-bold hover:bg-rose-100 sm:self-auto" onClick={() => setReloadKey((key) => key + 1)} type="button">Try again</button>
          </div>
        )}
        {notice && <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{notice}</p>}

        <div aria-busy={isLoading} className="surface-card overflow-hidden">
          {isLoading ? (
            <p className="mb-0 p-6 text-sm text-slate-600" role="status">Loading events…</p>
          ) : events.length === 0 ? (
            <p className="mb-0 p-6 text-sm text-slate-600" role="status">{error ? "Event list could not be loaded." : "No events match these filters."}</p>
          ) : (
            <>
              <div className="grid gap-3 p-3 md:hidden">
                {events.map((event) => (
                  <article className="rounded-xl border border-slate-100 bg-white p-4" key={event.id}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="mb-1 text-base font-extrabold">{event.title}</h2>
                        <p className="mb-0 text-xs font-semibold text-brand-primary">{event.category}</p>
                      </div>
                      <StatusBadge status={event.status} />
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      <div className="col-span-2"><dt className="text-xs text-slate-500">Organizer</dt><dd className="mb-0 mt-1"><Organizer organizer={event.organizer} /></dd></div>
                      <div><dt className="text-xs text-slate-500">Date</dt><dd className="mb-0 mt-1 text-slate-700">{formatDate(event.date)}</dd></div>
                      <div><dt className="text-xs text-slate-500">Price</dt><dd className="mb-0 mt-1 font-semibold text-slate-700">{formatPrice(event.price)}</dd></div>
                      <div><dt className="text-xs text-slate-500">Tickets available</dt><dd className="mb-0 mt-1 text-slate-700">{event.availableTickets} / {event.totalTickets}</dd></div>
                      <div><dt className="text-xs text-slate-500">Location</dt><dd className="mb-0 mt-1 text-slate-700">{[event.location, event.city].filter(Boolean).join(", ") || "—"}</dd></div>
                    </dl>
                    <div className="mt-4 border-t border-slate-100 pt-3"><EventActions event={event} /></div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[76rem] text-left text-sm">
                  <thead className="bg-[#f8f7ff] text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-4 font-bold" scope="col">Event</th>
                      <th className="px-4 py-4 font-bold" scope="col">Category</th>
                      <th className="px-4 py-4 font-bold" scope="col">Organizer</th>
                      <th className="px-4 py-4 font-bold" scope="col">Date</th>
                      <th className="px-4 py-4 font-bold" scope="col">Price</th>
                      <th className="px-4 py-4 font-bold" scope="col">Available</th>
                      <th className="px-4 py-4 font-bold" scope="col">Status</th>
                      <th className="px-4 py-4 font-bold" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((event) => (
                      <tr className="bg-white" key={event.id}>
                        <td className="px-4 py-4">
                          <span className="block font-semibold text-slate-800">{event.title}</span>
                          <span className="block text-xs text-slate-500">{[event.location, event.city].filter(Boolean).join(", ")}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{event.category}</td>
                        <td className="px-4 py-4"><Organizer organizer={event.organizer} /></td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(event.date)}</td>
                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-700">{formatPrice(event.price)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">{event.availableTickets} / {event.totalTickets}</td>
                        <td className="px-4 py-4"><StatusBadge status={event.status} /></td>
                        <td className="px-4 py-4"><EventActions event={event} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {pagination && pagination.totalEvents > 0 && (
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="mb-0">{pagination.totalEvents} {pagination.totalEvents === 1 ? "event" : "events"} · Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
            </div>
          </div>
        )}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEvent(null); }}>
            <section aria-labelledby="admin-event-details-title" aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7" role="dialog">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div><p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-brand-primary">Event details</p><h2 className="mb-0 text-xl font-extrabold" id="admin-event-details-title">{selectedEvent.title}</h2></div>
                <button aria-label="Close event details" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold" onClick={() => setSelectedEvent(null)} type="button">Close</button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedEvent.description || "No description provided."}</p>
              <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div><dt className="text-xs text-slate-500">Organizer</dt><dd className="mb-0 mt-1"><Organizer organizer={selectedEvent.organizer} /></dd></div>
                <div><dt className="text-xs text-slate-500">Status</dt><dd className="mb-0 mt-1"><StatusBadge status={selectedEvent.status} /></dd></div>
                <div><dt className="text-xs text-slate-500">Date</dt><dd className="mb-0 mt-1 text-sm">{formatDate(selectedEvent.date)}</dd></div>
                <div><dt className="text-xs text-slate-500">Location</dt><dd className="mb-0 mt-1 text-sm">{[selectedEvent.location, selectedEvent.city].filter(Boolean).join(", ") || "—"}</dd></div>
                <div><dt className="text-xs text-slate-500">Category / price</dt><dd className="mb-0 mt-1 text-sm">{selectedEvent.category} · {formatPrice(selectedEvent.price)}</dd></div>
                <div><dt className="text-xs text-slate-500">Ticket inventory</dt><dd className="mb-0 mt-1 text-sm">{selectedEvent.availableTickets} available of {selectedEvent.totalTickets}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Booking records (pending / confirmed / paid / cancelled)</dt><dd className="mb-0 mt-1 text-sm">{selectedEvent.bookingCounts?.total || 0} total ({selectedEvent.bookingCounts?.pending || 0} / {selectedEvent.bookingCounts?.confirmed || 0} / {selectedEvent.bookingCounts?.paid || 0} / {selectedEvent.bookingCounts?.cancelled || 0})</dd></div>
              </dl>
              <div className="mt-6 border-t border-slate-100 pt-4"><EventActions event={selectedEvent} /></div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
