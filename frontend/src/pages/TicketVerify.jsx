import { useEffect, useState } from "react";
import { verifyTicketToken } from "../services/bookingServices";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

export function TicketVerify() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get("token");
    // Keep the bearer token out of the visible address bar and browser history.
    window.history.replaceState(window.history.state, "", window.location.pathname);

    if (!token) {
      setError("This QR code does not contain a ticket token.");
      setLoading(false);
      return () => { active = false; };
    }

    verifyTicketToken(token)
      .then((result) => { if (active) setTicket(result); })
      .catch((requestError) => {
        if (active) setError(requestError.status === 404 ? "This ticket could not be found." : requestError.message || "Could not verify this ticket.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  return (
    <section className="min-h-[65vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container max-w-xl">
        <div className="surface-card p-6 text-center sm:p-8">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Gatherix ticket check</p>
          <h1 className="mb-5 text-2xl font-extrabold">Ticket verification</h1>
          {loading ? <p className="mb-0 text-sm text-slate-600" role="status">Checking ticket…</p> : null}
          {!loading && error && <p className="mb-0 rounded-xl bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
          {!loading && ticket && (
            <>
              <p className={`mb-5 rounded-xl p-4 text-lg font-extrabold ${ticket.valid ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`} role={ticket.valid ? "status" : "alert"}>
                {ticket.valid ? "Valid ticket" : ticket.ticketStatus === "cancelled" ? "Ticket cancelled" : ticket.ticketStatus === "event_cancelled" ? "Event cancelled — ticket not valid" : "Ticket is not valid"}
              </p>
              {ticket.event && <dl className="grid gap-3 text-left text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-slate-500">Event</dt><dd className="mb-0 mt-1 font-semibold">{ticket.event.title}</dd></div>
                <div><dt className="text-xs text-slate-500">Date</dt><dd className="mb-0 mt-1">{formatDate(ticket.event.date)}</dd></div>
                <div><dt className="text-xs text-slate-500">Venue</dt><dd className="mb-0 mt-1">{[ticket.event.location, ticket.event.city].filter(Boolean).join(", ")}</dd></div>
                <div><dt className="text-xs text-slate-500">Quantity</dt><dd className="mb-0 mt-1">{ticket.ticketQuantity}</dd></div>
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Booking reference</dt><dd className="mb-0 mt-1 break-all font-mono text-xs">{ticket.bookingReference}</dd></div>
              </dl>}
              <p className="mb-0 mt-5 text-xs text-slate-500">Verification does not modify booking or payment status.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
