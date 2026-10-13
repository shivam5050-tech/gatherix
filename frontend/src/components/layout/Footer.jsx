import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Find events", href: "/#events" },
      { label: "Categories", href: "/#categories" },
      { label: "What Gatherix offers", href: "/#features" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create an account", href: "/signup" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-indigo-100 bg-[#f3f2ff]">
      <div className="page-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:py-14">
        <div>
          <Link aria-label="Gatherix home" className="inline-flex items-center gap-2.5" to="/">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-violet text-base font-extrabold text-white">G</span>
            <span className="text-xl font-extrabold tracking-tight text-ink">Gatherix</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">Discover events and find experiences that make getting together special.</p>
          <Link className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:text-brand-primary-dark" to="/#events">Explore events <ArrowUpRight aria-hidden="true" size={15} /></Link>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-extrabold text-ink">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}><Link className="text-sm text-slate-600 transition hover:text-brand-primary" to={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>
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
