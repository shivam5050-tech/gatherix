import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const footerGroups = [
  {
    title: "Discover",
    links: [
      { label: "Explore events", to: "/explore" },
      { label: "About Gatherix", to: "/about" },
      { label: "Home", to: "/" },
    ],
  },
  {
    title: "Your Gatherix",
    links: [
      { label: "Log in", to: "/login" },
      { label: "Create an account", to: "/signup" },
      { label: "Organizer dashboard", to: "/organizer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-indigo-100 bg-[#f3f2ff]">
      <div className="page-container grid gap-9 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-12 lg:py-14">
        <div>
          <Link aria-label="Gatherix home" className="inline-flex items-center gap-2.5" to="/">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-violet text-base font-extrabold text-white">G</span>
            <span className="text-xl font-extrabold tracking-tight text-ink">Gatherix</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">Discover events, explore new experiences, and book a plan worth looking forward to.</p>
          <Link className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-primary transition hover:text-brand-primary-dark" to="/explore">Find an event <ArrowUpRight aria-hidden="true" size={15} /></Link>
        </div>

        {footerGroups.map((group) => (
          <nav aria-label={group.title} key={group.title}>
            <h2 className="text-sm font-extrabold text-ink">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}><Link className="text-sm text-slate-600 transition hover:text-brand-primary" to={link.to}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-indigo-100/80">
        <div className="page-container flex flex-col gap-2 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="mb-0">© {new Date().getFullYear()} Gatherix. All rights reserved.</p>
          <p className="mb-0">Discover. Book. Experience.</p>
        </div>
      </div>
    </footer>
  );
}
