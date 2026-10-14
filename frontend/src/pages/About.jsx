import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  HeartHandshake,
  MapPin,
  Search,
  Sparkles,
  TicketCheck,
} from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Find your kind of event",
    description: "Browse events and narrow your search by details like category, city, or date.",
    color: "bg-violet-100 text-violet-700",
  },
  {
    icon: MapPin,
    title: "Explore nearby plans",
    description: "Use event locations and city information to discover what is happening around you.",
    color: "bg-rose-100 text-rose-700",
  },
  {
    icon: TicketCheck,
    title: "Book in one place",
    description: "Review event details and continue to booking through the Gatherix experience.",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export function About() {
  return (
    <div className="bg-[#faf9ff]">
      <section className="relative isolate overflow-hidden bg-[#f3f0ff]">
        <div className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 -z-10 size-80 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="page-container py-16 text-center sm:py-20 lg:py-24">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-primary shadow-sm">
            <Sparkles aria-hidden="true" size={14} /> About Gatherix
          </p>
          <h1 className="mx-auto mb-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">
            Make room for <span className="bg-gradient-to-r from-brand-primary via-brand-violet to-brand-pink bg-clip-text text-transparent">good plans</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Gatherix helps you discover events, explore the details, and book tickets for experiences worth sharing.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-violet px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:-translate-y-0.5" to="/explore">
              Explore events <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-6 py-3 text-sm font-extrabold text-brand-primary transition hover:bg-white" to="/signup">
              Join Gatherix
            </Link>
          </div>
          {/* <div aria-hidden="true" className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
            <div className="grid aspect-square place-items-center rounded-3xl border border-white bg-white/80 text-brand-primary shadow-sm sm:aspect-[1.7/1]"><CalendarDays size={30} /></div>
            <div className="grid aspect-square place-items-center rounded-3xl border border-white bg-gradient-to-br from-brand-primary to-brand-violet text-white shadow-lg shadow-indigo-500/15 sm:aspect-[1.7/1]"><Compass size={34} /></div>
            <div className="grid aspect-square place-items-center rounded-3xl border border-white bg-white/80 text-brand-pink shadow-sm sm:aspect-[1.7/1]"><HeartHandshake size={32} /></div>
          </div> */}
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="page-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">A simpler way to make plans</p>
            <h2 className="mb-0 text-2xl font-extrabold tracking-tight sm:text-3xl">What is Gatherix?</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            <p>Gatherix is an event discovery and ticket-booking platform. It brings event listings and useful details together so you can search for something that fits your interests, location, and schedule.</p>
            <p>When you find an event you like, you can explore its information and continue to the booking flow. Organizers can also use Gatherix to create events and manage their bookings.</p>
          </div>
        </div>
      </section>

      <section className="section-shell bg-[#f7f6ff]">
        <div className="page-container">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">Our direction</p>
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Built around bringing people together</h2>
            <p className="mb-0 text-sm leading-6 text-slate-600">A clear purpose for discovering events and making it easier to take part.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
              <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-violet-100 text-brand-primary"><HeartHandshake aria-hidden="true" size={23} /></span>
              <h3 className="mb-3 text-xl font-extrabold">Our mission</h3>
              <p className="mb-0 text-sm leading-7 text-slate-600">Make it easier for people to discover events they care about and turn that discovery into a plan.</p>
            </article>
            <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
              <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-pink-100 text-pink-700"><Compass aria-hidden="true" size={23} /></span>
              <h3 className="mb-3 text-xl font-extrabold">Our vision</h3>
              <p className="mb-0 text-sm leading-7 text-slate-600">Help more people find meaningful ways to spend time together through live events and shared experiences.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell bg-white">
        <div className="page-container">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">Discover, decide, enjoy</p>
            <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Why Gatherix?</h2>
            <p className="mb-0 text-sm leading-6 text-slate-600">A straightforward place to explore event options and take the next step.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description, color }) => (
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6" key={title}>
                <span className={`mb-5 grid size-11 place-items-center rounded-xl ${color}`}><Icon aria-hidden="true" size={20} /></span>
                <h3 className="mb-2 text-base font-extrabold">{title}</h3>
                <p className="mb-0 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f6ff] py-10 sm:py-14">
        <div className="page-container">
          <div className="rounded-3xl bg-gradient-to-br from-[#181a38] via-[#28265e] to-[#4336b7] px-6 py-9 text-center shadow-xl shadow-indigo-950/15 sm:px-10 sm:py-12">
            <h2 className="mb-3 text-2xl font-extrabold text-white sm:text-3xl">Your next great plan starts here</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-indigo-100">Browse upcoming events and find something to look forward to.</p>
            <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-800 transition hover:bg-violet-50" to="/explore">Explore events <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
