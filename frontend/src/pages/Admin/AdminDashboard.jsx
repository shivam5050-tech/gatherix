import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, CircleDollarSign, RefreshCw, Ticket, Users } from "lucide-react";
import { getAdminDashboardStats } from "../../services/adminServices";
import { AdminNavigation } from "./AdminNavigation";

const cards = [
  { key: "totalUsers", label: "Registered users", icon: Users, detail: "Gatherix accounts" },
  { key: "totalEvents", label: "Events", icon: CalendarDays, detail: "All events" },
  { key: "totalBookings", label: "Bookings", icon: Ticket, detail: "All booking records" },
  { key: "paidBookings", label: "Paid bookings", icon: BadgeCheck, detail: "Verified and confirmed" },
  { key: "verifiedRevenue", label: "Verified revenue", icon: CircleDollarSign, detail: "Captured payments" },
];

function formatValue(key, stats) {
  if (key === "verifiedRevenue") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: stats.currency || "INR",
      maximumFractionDigits: 2,
    }).format(stats[key] || 0);
  }

  return new Intl.NumberFormat("en-IN").format(stats[key] || 0);
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setStats(await getAdminDashboardStats());
    } catch (loadError) {
      setError(loadError.message || "Could not load dashboard statistics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className="min-h-[70vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Gatherix administration</p>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Admin Dashboard</h1>
            <p className="mb-0 text-sm leading-6 text-slate-600">A current overview of accounts, events, bookings, and verified payments.</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-violet-50 hover:text-brand-primary disabled:cursor-wait disabled:opacity-60 sm:self-auto"
            disabled={isLoading}
            onClick={loadStats}
            type="button"
          >
            <RefreshCw aria-hidden="true" className={isLoading ? "animate-spin" : ""} size={16} />
            Refresh
          </button>
        </div>

        <AdminNavigation />

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="mb-0">{error}</p>
            <button className="self-start rounded-lg border border-rose-300 bg-white px-3 py-2 font-bold hover:bg-rose-100 sm:self-auto" onClick={loadStats} type="button">Try again</button>
          </div>
        )}

        {isLoading && !stats ? (
          <div className="surface-card p-6 text-sm text-slate-600" role="status">Loading dashboard statistics…</div>
        ) : stats ? (
          <div aria-busy={isLoading} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ key, label, icon: Icon, detail }) => (
              <article className="surface-card p-5 sm:p-6" key={key}>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-slate-600">{label}</p>
                    <p className="mb-0 text-xs text-slate-500">{detail}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-brand-primary">
                    <Icon aria-hidden="true" size={21} />
                  </span>
                </div>
                <p className="mb-0 break-words text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{formatValue(key, stats)}</p>
              </article>
            ))}
          </div>
        ) : !error ? (
          <div className="surface-card p-6 text-sm text-slate-600" role="status">No statistics are available yet.</div>
        ) : null}
      </div>
    </section>
  );
}
