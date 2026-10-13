import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Ticket } from "lucide-react";
import { createEvent } from "../../services/eventServices";

const emptyEvent = {
  title: "",
  description: "",
  category: "",
  date: "",
  location: "",
  city: "",
  price: "",
  totalTickets: "",
  image: "",
};

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || value === "") return "Price not set";
  return price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;
}

export function CreateEvent() {
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [error, setError] = useState("");
  const [createdEvent, setCreatedEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  function updateField(changeEvent) {
    const { name, value } = changeEvent.target;
    setEventForm({ ...eventForm, [name]: value });
    setError("");
    setCreatedEvent(null);
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setError("");
    setCreatedEvent(null);

    const ticketPrice = Number(eventForm.price);
    const ticketCount = Number(eventForm.totalTickets);

    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
      setError("Ticket price must be zero or more.");
      return;
    }

    if (!Number.isInteger(ticketCount) || ticketCount < 1) {
      setError("Total tickets must be a whole number greater than zero.");
      return;
    }

    const eventData = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      category: eventForm.category.trim(),
      date: new Date(eventForm.date).toISOString(),
      location: eventForm.location.trim(),
      city: eventForm.city.trim(),
      price: ticketPrice,
      totalTickets: ticketCount,
      image: eventForm.image.trim(),
    };

    setSaving(true);
    try {
      const savedEvent = await createEvent(eventData);
      setCreatedEvent(savedEvent);
    } catch (requestError) {
      setError(requestError.message || "Could not create the event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <section className="min-h-[60vh] bg-[#faf8ff] py-10 sm:py-14">
        <div className="page-container max-w-3xl">
          <Link className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary" to="/organizer"><ArrowLeft size={16} /> Back to dashboard</Link>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-extrabold">Log in to create an event</h1>
            <p className="text-sm text-slate-600">The existing event API requires a login token.</p>
            <Link className="inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/login">Go to login</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#faf8ff] py-8 sm:py-12">
      <div className="page-container max-w-6xl">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark" to="/organizer"><ArrowLeft size={16} /> Back to dashboard</Link>

        <div className="mb-7">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Organizer tools</p>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Create an event</h1>
          <p className="mb-0 text-sm text-slate-600">Fill in the event information. The preview updates as you type.</p>
        </div>

        {createdEvent && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
            <p className="mb-1 font-extrabold">Event created successfully.</p>
            <p className="mb-0">The existing API confirmed that “{createdEvent.title}” was saved.</p>
            {createdEvent._id && <Link className="mt-2 inline-block font-bold underline" to={`/events/${createdEvent._id}`}>View event</Link>}
          </div>
        )}

        {error && <p className="mb-6 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700" role="alert">{error}</p>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700">
              Event title
              <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="title" onChange={updateField} required value={eventForm.title} />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Description
              <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="description" onChange={updateField} required value={eventForm.description} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Category
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="category" onChange={updateField} required value={eventForm.category} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Date and time
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="date" onChange={updateField} required type="datetime-local" value={eventForm.date} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Venue / location
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="location" onChange={updateField} required value={eventForm.location} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                City
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="city" onChange={updateField} required value={eventForm.city} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Ticket price (₹)
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" min="0" name="price" onChange={updateField} required step="0.01" type="number" value={eventForm.price} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Total tickets
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" min="1" name="totalTickets" onChange={updateField} required step="1" type="number" value={eventForm.totalTickets} />
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Image URL <span className="font-normal text-slate-500">(optional)</span>
              <input className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" name="image" onChange={updateField} type="url" value={eventForm.image} />
            </label>

            <button className="w-full rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white hover:bg-brand-primary-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto" disabled={saving} type="submit">{saving ? "Creating event..." : "Create event"}</button>
          </form>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
            {eventForm.image ? (
              <img alt="Event preview" className="h-48 w-full bg-violet-100 object-cover" onError={(imageEvent) => { imageEvent.currentTarget.style.display = "none"; }} src={eventForm.image} />
            ) : (
              <div className="grid h-36 place-items-center bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-semibold text-brand-primary">Event image preview</div>
            )}
            <div className="p-5">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-brand-primary">Live preview</p>
              <p className="mb-1 text-xs font-semibold text-slate-500">{eventForm.category || "Category"}</p>
              <h2 className="text-xl font-extrabold">{eventForm.title || "Your event title"}</h2>
              <p className="line-clamp-4 text-sm leading-6 text-slate-600">{eventForm.description || "Your event description will appear here."}</p>
              <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays aria-hidden="true" className="text-brand-primary" size={16} />{eventForm.date ? new Date(eventForm.date).toLocaleString() : "Date and time"}</p>
              <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin aria-hidden="true" className="text-brand-primary" size={16} />{[eventForm.location, eventForm.city].filter(Boolean).join(", ") || "Venue and city"}</p>
              <p className="mb-0 mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-extrabold"><Ticket aria-hidden="true" className="text-brand-primary" size={16} />{formatPrice(eventForm.price)} · {eventForm.totalTickets || "0"} tickets</p>
            </div>
          </aside>
        </div>

        <p className="mb-0 mt-5 text-xs leading-5 text-slate-500">The form sends data to the existing authenticated create-event API. It does not create a payment or booking.</p>
      </div>
    </section>
  );
}
