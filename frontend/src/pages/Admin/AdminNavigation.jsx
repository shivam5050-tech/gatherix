import { NavLink } from "react-router-dom";

const links = [
  { label: "Overview", to: "/admin", end: true },
  { label: "Users", to: "/admin/users", end: false },
  { label: "Events", to: "/admin/events", end: false },
  { label: "Bookings", to: "/admin/bookings", end: false },
];

export function AdminNavigation() {
  return (
    <nav aria-label="Admin navigation" className="mb-7 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map(({ label, to, end }) => (
        <NavLink
          className={({ isActive }) => `rounded-xl px-4 py-2 text-sm font-bold transition ${isActive ? "bg-brand-primary text-white shadow-sm" : "text-slate-600 hover:bg-violet-50 hover:text-brand-primary"}`}
          end={end}
          key={to}
          to={to}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
