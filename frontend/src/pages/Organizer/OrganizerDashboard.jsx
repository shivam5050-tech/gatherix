import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { deleteEvent, getMyEvents, updateEvent } from "../../services/eventServices";

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price not set";
  return price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleString();
}

function toDateTimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function makeEditForm(event) {
  return {
    title: event.title || "",
    date: toDateTimeLocal(event.date),
    city: event.city || "",
    price: String(event.price ?? ""),
    totalTickets: String(event.totalTickets ?? ""),
    availableTickets: String(event.availableTickets ?? ""),
  };
}

export function OrganizerDashboard() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);
  const [success, setSuccess] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingId, setSavingId] = useState("");

  async function loadMyEvents() {
    if (!isLoggedIn) return;

    setLoading(true);
    setError("");
    setErrorStatus(null);
    try {
      const myEvents = await getMyEvents();
      setEvents(myEvents);
    } catch (requestError) {
      setError(requestError.message || "Could not load your events. Please log in again and try again.");
      setErrorStatus(requestError.status || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyEvents();
  }, []);

  function startEditing(event) {
    setEditingEvent(event);
    setEditForm(makeEditForm(event));
    setError("");
    setErrorStatus(null);
    setSuccess("");
  }

  function updateEditField(changeEvent) {
    const { name, value } = changeEvent.target;
    setEditForm({ ...editForm, [name]: value });
  }

  async function saveEvent(submitEvent) {
    submitEvent.preventDefault();
    if (!editingEvent) return;

    const price = Number(editForm.price);
    const totalTickets = Number(editForm.totalTickets);
    const availableTickets = Number(editForm.availableTickets);

    if (!Number.isFinite(price) || price < 0) {
      setError("Ticket price must be zero or more.");
      return;
    }

    if (!Number.isInteger(totalTickets) || totalTickets < 0) {
      setError("Total tickets must be a whole number that is zero or more.");
      return;
    }

    if (!Number.isInteger(availableTickets) || availableTickets < 0 || availableTickets > totalTickets) {
      setError("Available tickets must be between zero and the total ticket count.");
      return;
    }

    setSavingId(editingEvent._id);
    setError("");
    setErrorStatus(null);
    setSuccess("");
    try {
      const updatedEvent = await updateEvent(editingEvent._id, {
        title: editForm.title.trim(),
        date: new Date(editForm.date).toISOString(),
        city: editForm.city.trim(),
        price,
        totalTickets,
        availableTickets,
      });
      setEvents(events.map((event) => (event._id === updatedEvent._id ? updatedEvent : event)));
      setEditingEvent(null);
      setEditForm(null);
      setSuccess(`“${updatedEvent.title}” was updated successfully.`);
    } catch (requestError) {
      setError(requestError.message || "Could not update the event. Please try again.");
      setErrorStatus(requestError.status || null);
    } finally {
      setSavingId("");
    }
  }

  async function removeEvent(event) {
    const confirmed = window.confirm(`Delete “${event.title}”? This cannot be undone.`);
    if (!confirmed) return;

    setSavingId(event._id);
    setError("");
    setErrorStatus(null);
    setSuccess("");
    try {
      await deleteEvent(event._id);
      await loadMyEvents();
      setSuccess(`“${event.title}” was deleted successfully.`);
    } catch (requestError) {
      setError(requestError.message || "Could not delete the event. Please try again.");
      setErrorStatus(requestError.status || null);
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="min-h-[65vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container max-w-5xl">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Organizer tools</p>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Organizer Dashboard</h1>
        <p className="mb-8 max-w-2xl text-sm leading-6 text-slate-600">Create, view, and manage the events you have created on Gatherix.</p>

        {!isLoggedIn ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-extrabold">Log in to continue</h2>
            <p className="text-sm leading-6 text-slate-600">You need to log in before using the create-event form.</p>
            <p className="mb-5 text-xs text-slate-500">This is a frontend check only. The existing event API also checks the login token.</p>
            <Link className="inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/login">Go to login</Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="mb-1 text-lg font-extrabold">Create an event</h2>
                <p className="mb-0 text-sm text-slate-600">Add the event information and preview it before submitting.</p>
              </div>
              <Link className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/organizer/create"><CalendarPlus aria-hidden="true" size={17} /> Create event</Link>
            </div>

            {success && <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{success}</p>}
            {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <p className="mb-2">{errorStatus === 401 ? "Your session is missing or expired. Log in again to manage your events." : error}</p>
              {errorStatus === 401 && <Link className="font-bold underline" to="/login">Log in</Link>}
            </div>}

            <section aria-labelledby="my-events-heading">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="mb-1 text-xl font-extrabold" id="my-events-heading">My events</h2>
                  <p className="mb-0 text-sm text-slate-600">Only events created by your account are shown here.</p>
                </div>
                <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60" disabled={loading} onClick={loadMyEvents} type="button">Refresh</button>
              </div>

              {loading ? (
                <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading your events...</p>
              ) : events.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  You have not created any events yet. Use the Create event button above to add your first one.
                </div>
              ) : (
                <div className="grid gap-4">
                  {events.map((event) => (
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={event._id}>
                      {editingEvent?._id === event._id ? (
                        <form className="space-y-4" onSubmit={saveEvent}>
                          <h3 className="text-lg font-extrabold">Edit event</h3>
                          <label className="block text-sm font-semibold text-slate-700">Title
                            <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" name="title" onChange={updateEditField} required value={editForm.title} />
                          </label>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-semibold text-slate-700">Date and time
                              <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" name="date" onChange={updateEditField} required type="datetime-local" value={editForm.date} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">City
                              <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" name="city" onChange={updateEditField} required value={editForm.city} />
                            </label>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <label className="block text-sm font-semibold text-slate-700">Price
                              <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" min="0" name="price" onChange={updateEditField} required step="0.01" type="number" value={editForm.price} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">Total tickets
                              <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" min="0" name="totalTickets" onChange={updateEditField} required step="1" type="number" value={editForm.totalTickets} />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">Available tickets
                              <input className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal" min="0" name="availableTickets" onChange={updateEditField} required step="1" type="number" value={editForm.availableTickets} />
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark disabled:opacity-60" disabled={savingId === event._id} type="submit">{savingId === event._id ? "Saving..." : "Save changes"}</button>
                            <button className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => { setEditingEvent(null); setEditForm(null); }} type="button">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="mb-2 text-lg font-extrabold text-slate-900">{event.title}</h3>
                              <p className="mb-1 text-sm text-slate-600">{formatDate(event.date)}</p>
                              <p className="mb-0 text-sm text-slate-600">{event.city || "City not set"} · {formatPrice(event.price)} · {event.availableTickets ?? "Not set"} tickets available</p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <Link className="inline-flex items-center rounded-xl bg-brand-primary px-3 py-2 text-sm font-bold text-white hover:bg-brand-primary-dark" to={`/organizer/events/${event._id}/bookings`}>View bookings</Link>
                              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => startEditing(event)} type="button"><Pencil aria-hidden="true" size={16} /> Edit</button>
                              <button className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60" disabled={savingId === event._id} onClick={() => removeEvent(event)} type="button"><Trash2 aria-hidden="true" size={16} /> {savingId === event._id ? "Deleting..." : "Delete"}</button>
                            </div>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </section>
  );
}
