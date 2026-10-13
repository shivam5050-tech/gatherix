import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { getMyBookings } from "../services/bookingServices";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleString();
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function MyBookings() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState("");

  async function loadBookings() {
    if (!isLoggedIn) return;

    setLoading(true);
    setError("");
    try {
      setBookings(await getMyBookings());
    } catch (requestError) {
      setError(requestError.message || "Could not load your bookings. Please log in again and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <section className="min-h-[60vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Your tickets</p>
        <h1 className="mb-7 text-3xl font-extrabold tracking-tight sm:text-4xl">My Bookings</h1>

        {!isLoggedIn ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-extrabold">You are not logged in</h2>
            <p className="text-sm leading-6 text-slate-600">Log in to view your bookings.</p>
            <Link className="inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/login">Go to login</Link>
          </div>
        ) : (
          <>
            {error && <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="mb-0 text-sm text-slate-600">These are booking records created by your account.</p>
              <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60" disabled={loading} onClick={loadBookings} type="button">Refresh</button>
            </div>

            {loading ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600" role="status">Loading your bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">You have no bookings yet. Explore events to reserve tickets.</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {bookings.map((booking) => {
                  const event = booking.event;
                  const isPaidAndConfirmed = booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed";
                  return (
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" key={booking._id}>
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-brand-primary"><Ticket aria-hidden="true" size={20} /></span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${isPaidAndConfirmed ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{booking.bookingStatus} · {booking.paymentStatus}</span>
                      </div>
                      <h2 className="mt-4 text-lg font-extrabold">{event?.title || "Event unavailable"}</h2>
                      <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="text-brand-primary" size={16} />{formatDate(event?.date)}</p>
                      <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="text-brand-primary" size={16} />{[event?.location, event?.city].filter(Boolean).join(", ") || "Location unavailable"}</p>
                      <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-700">
                        <p className="mb-1 font-semibold">{booking.ticketQuantity} ticket{booking.ticketQuantity === 1 ? "" : "s"} · {formatPrice(booking.subtotal)}</p>
                        <p className={`mb-0 text-xs ${isPaidAndConfirmed ? "text-emerald-800" : "text-amber-800"}`}>{isPaidAndConfirmed ? "Payment verified in Razorpay Test Mode. Booking confirmed." : "Payment is pending. This booking remains unpaid until Razorpay verifies it."}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
