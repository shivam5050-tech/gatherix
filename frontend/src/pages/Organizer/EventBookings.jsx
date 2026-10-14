import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { getEventBookings } from "../../services/bookingServices";

function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Amount unavailable";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function bookingStatusStyle(status) {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-800";
  if (status === "cancelled") return "bg-slate-100 text-slate-700";
  if (status === "cancelling") return "bg-orange-50 text-orange-800";
  return "bg-amber-50 text-amber-800";
}

function paymentStatusStyle(status) {
  return status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800";
}

export function EventBookings() {
  const { eventId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);

  async function loadBookings() {
    setLoading(true);
    setError("");
    setErrorStatus(null);
    try {
      setResult(await getEventBookings(eventId));
    } catch (requestError) {
      setError(requestError.message || "Could not load bookings for this event.");
      setErrorStatus(requestError.status || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [eventId]);

  return (
    <section className="min-h-[65vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container max-w-5xl">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark" to="/organizer">
          <ArrowLeft aria-hidden="true" size={16} /> Back to organizer dashboard
        </Link>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Organizer tools</p>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Event bookings</h1>

        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600" role="status">Loading event bookings...</p>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <p className="mb-4 text-sm text-rose-800" role="alert">{errorStatus === 401 ? "Your session is missing or expired. Log in to view event bookings." : error}</p>
            <div className="flex flex-wrap gap-3">
              {errorStatus === 401 && <Link className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/login">Log in</Link>}
              <button className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-800 hover:bg-rose-100" onClick={loadBookings} type="button">Retry</button>
            </div>
          </div>
        ) : result ? (
          <>
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="event-title">
              <h2 className="mb-3 text-xl font-extrabold" id="event-title">{result.event.title}</h2>
              <p className="mb-2 flex items-center gap-2 text-sm text-slate-600"><CalendarDays aria-hidden="true" className="text-brand-primary" size={16} />{formatDate(result.event.date)}</p>
              <p className="mb-0 flex items-center gap-2 text-sm text-slate-600"><MapPin aria-hidden="true" className="text-brand-primary" size={16} />{[result.event.location, result.event.city].filter(Boolean).join(", ")}</p>
            </section>

            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Users aria-hidden="true" className="text-brand-primary" size={17} />
              {result.count} booking{result.count === 1 ? "" : "s"}
            </div>

            {result.bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No bookings have been made for this event yet.</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {result.bookings.map((booking) => (
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" key={booking._id}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h2 className="mb-0 text-lg font-extrabold text-slate-900">{booking.attendeeName}</h2>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${bookingStatusStyle(booking.bookingStatus)}`}>
                        {booking.bookingStatus === "cancelling" ? "cancellation processing" : booking.bookingStatus}
                      </span>
                    </div>
                    <p className="mb-4 break-all text-sm text-slate-600">{booking.attendeeEmail}</p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm">
                      <div><dt className="text-xs text-slate-500">Tickets</dt><dd className="mb-0 font-semibold text-slate-800">{booking.ticketQuantity}</dd></div>
                      <div><dt className="text-xs text-slate-500">Total</dt><dd className="mb-0 font-semibold text-slate-800">{formatPrice(booking.subtotal)}</dd></div>
                      <div><dt className="text-xs text-slate-500">Payment</dt><dd className="mb-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${paymentStatusStyle(booking.paymentStatus)}`}>{booking.paymentStatus}</span></dd></div>
                      <div><dt className="text-xs text-slate-500">Booked</dt><dd className="mb-0 text-slate-700">{formatDate(booking.createdAt)}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
