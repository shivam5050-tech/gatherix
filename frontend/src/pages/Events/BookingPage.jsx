import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, ShieldAlert, Ticket } from "lucide-react";
import { getEventById } from "../../services/eventServices";
import { createBooking, createRazorpayOrder, verifyRazorpayPayment } from "../../services/bookingServices";
import fallbackImage from "../../assets/bg.jpg";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BookingPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    let isCurrentPage = true;

    async function loadEvent() {
      setLoading(true);
      setError("");

      if (!/^[a-f\d]{24}$/i.test(id || "")) {
        setError("This event link has an invalid ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await getEventById(id);
        if (isCurrentPage) setEvent(response.event);
      } catch (requestError) {
        if (isCurrentPage) setError(requestError.response?.status === 404
          ? "We could not find that event."
          : "We could not load this event. Please try again later.");
      } finally {
        if (isCurrentPage) setLoading(false);
      }
    }

    loadEvent();
    return () => {
      isCurrentPage = false;
    };
  }, [id, retryCount]);

  const ticketsAvailable = Math.max(0, Number(event?.availableTickets) || 0);
  const ticketLimit = Math.min(10, ticketsAvailable);
  const ticketQuantity = ticketLimit === 0 ? 0 : Math.min(quantity, ticketLimit);
  const estimatedTotal = (Number(event?.price) || 0) * ticketQuantity;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail);

  async function handleSubmit(formEvent) {
    formEvent.preventDefault();
    setShowErrors(true);
    setError("");
    setErrorStatus(null);

    if (!isLoggedIn) {
      setError("Please log in before creating a booking.");
      return;
    }

    if (!attendeeName.trim() || !validEmail || ticketQuantity === 0) return;

    setSubmitting(true);
    try {
      const result = await createBooking({
        eventId: id,
        ticketQuantity,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
      });
      setBooking(result.booking);
      setEvent(result.event);
    } catch (requestError) {
      setError(requestError.message || "Could not create your booking. Please try again.");
      setErrorStatus(requestError.status || null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayment() {
    if (!booking) return;

    setPaymentLoading(true);
    setPaymentMessage("");
    try {
      const order = await createRazorpayOrder(booking._id);
      const checkoutLoaded = await loadRazorpayCheckout();

      if (!checkoutLoaded) {
        setPaymentMessage("Razorpay Checkout could not load. Check your internet connection and try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Gatherix",
        description: `Booking for ${event.title}`,
        order_id: order.orderId,
        prefill: {
          name: booking.attendeeName,
          email: booking.attendeeEmail,
        },
        handler: async (response) => {
          setPaymentLoading(true);
          setPaymentMessage("");
          try {
            const result = await verifyRazorpayPayment(booking._id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            setBooking(result.booking);
            setPaymentMessage("Payment was verified by the server. Your booking is confirmed.");
          } catch (requestError) {
            setPaymentMessage(requestError.message || "Payment could not be verified. Your booking is still pending and unpaid.");
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPaymentMessage("Checkout was closed. Your booking is still pending and unpaid."),
        },
      });

      razorpay.on("payment.failed", () => {
        setPaymentMessage("Payment failed. Your booking is still pending and unpaid.");
      });
      razorpay.open();
    } catch (requestError) {
      setPaymentMessage(requestError.message || "Could not start Razorpay Checkout. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading || error && !event) {
    return (
      <section className="min-h-[60vh] bg-[#faf8ff] py-10 sm:py-14">
        <div className="page-container">
          <Link className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary" to="/explore"><ArrowLeft size={16} /> Back to Explore</Link>
          {loading && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600" role="status">Loading checkout...</p>}
          {!loading && error && <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <p className="mb-4 text-rose-700" role="alert">{error}</p>
            <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setRetryCount((count) => count + 1)} type="button">Try again</button>
          </div>}
        </div>
      </section>
    );
  }

  if (booking) {
    return (
      <section className="min-h-[60vh] bg-[#faf8ff] py-10 sm:py-14">
        <div className="page-container max-w-2xl">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
            <CheckCircle2 className="mb-4 text-emerald-600" size={36} />
            <h1 className="mb-2 text-3xl font-extrabold">Booking saved</h1>
            <p className="text-slate-600">Your booking for <strong>{event.title}</strong> was saved by the server.</p>
            {booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed" ? (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">Payment is <strong>paid</strong> and your booking is <strong>confirmed</strong> in Razorpay Test Mode.</p>
            ) : (
              <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">This booking is <strong>pending</strong> and <strong>unpaid</strong>. Test Mode is a simulation; no real money is collected.</p>
            )}
            <p className="text-sm text-slate-600">Booking ID: {booking._id}</p>
            {paymentMessage && <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status">{paymentMessage}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              {booking.paymentStatus !== "paid" && <button className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark disabled:opacity-60" disabled={paymentLoading} onClick={handlePayment} type="button">{paymentLoading ? "Preparing payment..." : "Pay with Razorpay Test Mode"}</button>}
              <Link className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/my-bookings">View my bookings</Link>
              <Link className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" to={`/events/${id}`}>Back to event</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#faf8ff] py-8 sm:py-12">
      <div className="page-container">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-dark" to={`/events/${id}`}><ArrowLeft size={16} /> Back to event</Link>
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Ticket booking</p>
            <h1 className="mb-0 text-3xl font-extrabold tracking-tight sm:text-4xl">Reserve your tickets</h1>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"><ShieldAlert aria-hidden="true" size={15} /> Pending booking · no payment</span>
        </div>

        <form className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <p className="mb-2">{errorStatus === 401 ? "Your session is missing or expired. Log in again before reserving tickets." : error}</p>
              {errorStatus === 401 && <Link className="font-bold underline" to="/login">Log in</Link>}
            </div>}
            {!isLoggedIn && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Please <Link className="font-bold underline" to="/login">log in</Link> before reserving tickets.</p>}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold"><Ticket className="text-brand-primary" size={19} /> Select tickets</h2>
              <div className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-[#faf9ff] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h3 className="mb-1 font-bold">General admission</h3><p className="mb-0 text-sm text-slate-500">{formatPrice(event.price)} per ticket</p></div>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">Quantity
                  <select aria-label="Ticket quantity" className="rounded-lg border border-slate-300 bg-white px-3 py-2" disabled={ticketLimit === 0 || submitting} onChange={(changeEvent) => setQuantity(Number(changeEvent.target.value))} value={ticketQuantity || ""}>
                    {ticketLimit === 0 ? <option value="">0</option> : Array.from({ length: ticketLimit }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                  </select>
                </label>
              </div>
              <p className="mb-0 mt-3 text-xs text-slate-500">{ticketsAvailable} tickets currently available. The server checks availability again when you submit.</p>
              {ticketLimit === 0 && <p className="mb-0 mt-3 text-sm font-semibold text-rose-700">This event has no available tickets.</p>}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 text-lg font-extrabold">Attendee information</h2>
              <label className="block text-sm font-semibold text-slate-700">Full name
                <input autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" disabled={submitting} onChange={(changeEvent) => setAttendeeName(changeEvent.target.value)} placeholder="Attendee name" required value={attendeeName} />
                {showErrors && !attendeeName.trim() && <span className="mt-1 block text-xs font-medium text-rose-700">Enter the attendee name.</span>}
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">Email address
                <input autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-brand-primary" disabled={submitting} onChange={(changeEvent) => setAttendeeEmail(changeEvent.target.value)} placeholder="you@example.com" required type="email" value={attendeeEmail} />
                {showErrors && !validEmail && <span className="mt-1 block text-xs font-medium text-rose-700">Enter a valid email address.</span>}
              </label>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img alt={event.title || "Event"} className="h-40 w-full bg-violet-100 object-cover" onError={(imageEvent) => { imageEvent.currentTarget.src = fallbackImage; }} src={event.image || fallbackImage} />
              <div className="p-5">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-primary">Booking summary</p>
                <h2 className="mb-3 text-lg font-extrabold">{event.title || "Event"}</h2>
                <p className="mb-2 flex items-start gap-2 text-xs leading-5 text-slate-600"><CalendarDays className="mt-0.5 shrink-0 text-brand-primary" size={15} />{formatDate(event.date)}</p>
                <p className="mb-0 flex items-start gap-2 text-xs leading-5 text-slate-600"><MapPin className="mt-0.5 shrink-0 text-brand-primary" size={15} />{[event.location, event.city].filter(Boolean).join(", ") || "Location not available"}</p>
                <div className="mt-5 flex justify-between gap-4 border-t border-slate-100 pt-4 text-sm font-extrabold"><span>{ticketQuantity} × ticket</span><span>{formatPrice(estimatedTotal)}</span></div>
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">This creates a pending, unpaid booking. You can then pay with Razorpay Test Mode; no real money is collected.</p>
                <button className="mt-4 w-full rounded-xl bg-brand-primary px-5 py-3 text-sm font-extrabold text-white hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300" disabled={ticketLimit === 0 || submitting} type="submit">{submitting ? "Saving booking..." : "Reserve tickets"}</button>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </section>
  );
}
