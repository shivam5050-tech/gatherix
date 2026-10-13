import { CalendarSearch, MapPinned, Tags } from "lucide-react";

const features = [
  { icon: CalendarSearch, title: "Search your way", description: "Filter the events loaded here by name, category, city, and date." },
  { icon: Tags, title: "Explore by interest", description: "Browse a range of categories and see which events fit your plans." },
  { icon: MapPinned, title: "See the details", description: "Preview the event date, venue, organizer, and starting price when provided." },
];

export function Features() {
  return (
    <section className="section-shell bg-[#f7f6ff]" id="features">
      <div className="page-container">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">Made for finding your next thing</p>
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">A simpler way to discover events</h2>
          <p className="mb-0 text-sm leading-6 text-slate-600">Useful ways to narrow down what you see and explore the information available for each event.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6" key={title}>
              <span className={`mb-5 grid size-11 place-items-center rounded-xl ${index === 1 ? "bg-pink-100 text-pink-700" : index === 2 ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-brand-primary"}`}><Icon aria-hidden="true" size={20} /></span>
              <h3 className="mb-2 text-base font-extrabold">{title}</h3>
              <p className="mb-0 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
