import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getAdminBookings } from "../../services/adminServices";
import { AdminNavigation } from "./AdminNavigation";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatAmount(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function StatusBadge({ value }) {
  const colors = {
    confirmed: "bg-emerald-100 text-emerald-800",
    paid: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    unpaid: "bg-slate-100 text-slate-700",
    cancelling: "bg-orange-100 text-orange-800",
    cancelled: "bg-rose-100 text-rose-800",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${colors[value] || "bg-slate-100 text-slate-700"}`}>
      {value || "Unknown"}
    </span>
  );
}

function BookingEvent({ event }) {
  if (!event) return <span className="text-slate-500">Event unavailable</span>;
  return (
    <span className="block">
      <span className="block font-semibold text-slate-800">{event.title || "Untitled event"}</span>
      {event.organizer?.name && <span className="block text-xs text-slate-500">By {event.organizer.name}</span>}
    </span>
  );
}

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getAdminBookings({ page, limit: 10, search, bookingStatus, paymentStatus });
        if (active) {
          setBookings(result.bookings);
          setPagination(result.pagination);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load bookings.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBookings();
    return () => { active = false; };
  }, [page, reloadKey, search, bookingStatus, paymentStatus]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function changeFilter(setFilter, event) {
    setPage(1);
    setFilter(event.target.value);
  }

  const totalPages = pagination?.totalPages || 0;

  return (
    <section className="min-h-[70vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Gatherix administration</p>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Booking Management</h1>
        <p className="mb-7 text-sm leading-6 text-slate-600">Review bookings across the platform. This view does not modify bookings, payments, or ticket inventory.</p>

        <AdminNavigation />

        <div className="surface-card mb-5 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_14rem_14rem]">
            <form className="flex gap-2" onSubmit={submitSearch} role="search">
              <label className="sr-only" htmlFor="admin-booking-search">Search bookings</label>
              <input
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                id="admin-booking-search"
                maxLength={100}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Attendee, email, event, or booking ID"
                type="search"
                value={searchInput}
              />
              <button className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" type="submit">
                <Search aria-hidden="true" size={16} /> <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            <div>
              <label className="sr-only" htmlFor="admin-booking-status">Filter booking status</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="admin-booking-status" onChange={(event) => changeFilter(setBookingStatus, event)} value={bookingStatus}>
                <option value="">All booking statuses</option>
                <option value="pending">Pending</option>
                <option value="cancelling">Cancelling</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="sr-only" htmlFor="admin-payment-status">Filter payment status</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="admin-payment-status" onChange={(event) => changeFilter(setPaymentStatus, event)} value={paymentStatus}>
                <option value="">All payment statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="mb-0">{error}</p>
            <button className="self-start rounded-lg border border-rose-300 bg-white px-3 py-2 font-bold hover:bg-rose-100 sm:self-auto" onClick={() => setReloadKey((key) => key + 1)} type="button">Try again</button>
          </div>
        )}

        <div aria-busy={isLoading} className="surface-card overflow-hidden">
          {isLoading ? (
            <p className="mb-0 p-6 text-sm text-slate-600" role="status">Loading bookings…</p>
          ) : bookings.length === 0 ? (
            <p className="mb-0 p-6 text-sm text-slate-600" role="status">{error ? "Booking list could not be loaded." : "No bookings match these filters."}</p>
          ) : (
            <>
              <div className="grid gap-3 p-3 md:hidden">
                {bookings.map((booking) => (
                  <article className="rounded-xl border border-slate-100 bg-white p-4" key={booking.id}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <BookingEvent event={booking.event} />
                        <p className="mb-0 mt-2 text-xs text-slate-500">{booking.attendeeName}</p>
                        <p className="mb-0 text-xs text-slate-500">{booking.attendeeEmail}</p>
                      </div>
                      <StatusBadge value={booking.bookingStatus} />
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      <div><dt className="text-xs text-slate-500">Quantity</dt><dd className="mb-0 mt-1 text-slate-700">{booking.ticketQuantity}</dd></div>
                      <div><dt className="text-xs text-slate-500">Booking total</dt><dd className="mb-0 mt-1 font-semibold text-slate-700">{formatAmount(booking.totalAmount, booking.currency)}</dd></div>
                      <div><dt className="text-xs text-slate-500">Payment</dt><dd className="mb-0 mt-1"><StatusBadge value={booking.paymentStatus} /></dd></div>
                      <div><dt className="text-xs text-slate-500">Booked</dt><dd className="mb-0 mt-1 text-slate-700">{formatDate(booking.createdAt)}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[76rem] text-left text-sm">
                  <thead className="bg-[#f8f7ff] text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-4 font-bold" scope="col">Event</th>
                      <th className="px-4 py-4 font-bold" scope="col">Attendee</th>
                      <th className="px-4 py-4 font-bold" scope="col">Quantity</th>
                      <th className="px-4 py-4 font-bold" scope="col">Booking total</th>
                      <th className="px-4 py-4 font-bold" scope="col">Booking status</th>
                      <th className="px-4 py-4 font-bold" scope="col">Payment status</th>
                      <th className="px-4 py-4 font-bold" scope="col">Booked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => (
                      <tr className="bg-white" key={booking.id}>
                        <td className="px-4 py-4"><BookingEvent event={booking.event} /></td>
                        <td className="px-4 py-4">
                          <span className="block font-semibold text-slate-800">{booking.attendeeName}</span>
                          <span className="block text-xs text-slate-500">{booking.attendeeEmail}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{booking.ticketQuantity}</td>
                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-700">{formatAmount(booking.totalAmount, booking.currency)}</td>
                        <td className="px-4 py-4"><StatusBadge value={booking.bookingStatus} /></td>
                        <td className="px-4 py-4"><StatusBadge value={booking.paymentStatus} /></td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(booking.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {pagination && pagination.totalBookings > 0 && (
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="mb-0">{pagination.totalBookings} {pagination.totalBookings === 1 ? "booking" : "bookings"} · Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
