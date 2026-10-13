import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { getEventById } from "../../services/eventServices";
import fallbackImage from "../../assets/bg.jpg";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";
  return date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price not available";
  if (price === 0) return "Free";
  return `₹${price.toLocaleString()}`;
}

export function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrentPage = true;

    async function loadEvent() {
      setLoading(true);
      setError("");
      setEvent(null);

      if (!/^[a-f\d]{24}$/i.test(id || "")) {
        setError("This event link has an invalid ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await getEventById(id);
        if (!isCurrentPage) return;
        if (!response?.event) {
          setError("We couldn’t find that event.");
        } else {
          setEvent(response.event);
        }
      } catch (requestError) {
        if (!isCurrentPage) return;
        if (requestError.response?.status === 404) {
          setError("We couldn’t find that event.");
        } else {
          setError("We couldn’t load this event. Please try again later.");
        }
      } finally {
        if (isCurrentPage) setLoading(false);
      }
    }

    loadEvent();
    return () => {
      isCurrentPage = false;
    };
  }, [id]);

  return (
    <div className="min-h-[60vh] bg-[#faf8ff] py-8 sm:py-12">
      <div className="page-container">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark" to="/">
          ← Back to homepage
        </Link>

        {loading && (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600" role="status">Loading event details...</p>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <p className="mb-4 text-rose-700">{error}</p>
            <Link className="inline-flex rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/">Return to homepage</Link>
          </div>
        )}

        {!loading && event && (
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img
              alt={event.title || "Event"}
              className="max-h-[480px] w-full bg-violet-100 object-cover"
              onError={(imageEvent) => { imageEvent.currentTarget.src = fallbackImage; }}
              src={event.image || fallbackImage}
            />

            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_300px] lg:p-10">
              <div>
                {event.category && <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">{event.category}</p>}
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{event.title || "Event details"}</h1>

                <div className="mt-5 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-6">
                  <p className="mb-0 flex items-center gap-2"><CalendarDays aria-hidden="true" className="text-brand-primary" size={18} />{formatDate(event.date)}</p>
                  <p className="mb-0 flex items-center gap-2"><MapPin aria-hidden="true" className="text-brand-primary" size={18} />{event.location || "Venue not available"}</p>
                  <p className="mb-0 flex items-center gap-2"><MapPin aria-hidden="true" className="text-brand-primary" size={18} />{event.city || "City not available"}</p>
                </div>

                <section className="mt-8">
                  <h2 className="text-lg font-extrabold">About this event</h2>
                  <p className="whitespace-pre-line leading-7 text-slate-600">{event.description || "No description has been provided for this event."}</p>
                </section>
              </div>

              <aside className="h-fit rounded-2xl border border-indigo-100 bg-[#f8f7ff] p-5 sm:p-6">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Ticket price</p>
                <p className="mb-5 text-2xl font-extrabold text-ink">{formatPrice(event.price)}</p>

                {event.availableTickets !== undefined && event.availableTickets !== null && (
                  <p className="mb-5 text-sm text-slate-600">
                    {Number(event.availableTickets) === 0 ? "No tickets currently available" : `${event.availableTickets} tickets available`}
                  </p>
                )}

                <Link className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-primary-dark" to={`/events/${id}/book`}>
                  <Ticket aria-hidden="true" size={18} /> Book Tickets
                </Link>
              </aside>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
