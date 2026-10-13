import { BriefcaseBusiness, FlaskConical, Heart, Laptop, Music, Palette, Trophy, Utensils } from "lucide-react";

const categories = [
  { name: "Music", note: "Live shows & concerts", icon: Music, color: "bg-violet-100 text-violet-700" },
  { name: "Technology", note: "Ideas & innovation", icon: Laptop, color: "bg-indigo-100 text-indigo-700" },
  { name: "Business", note: "Meetups & startups", icon: BriefcaseBusiness, color: "bg-pink-100 text-pink-700" },
  { name: "Arts", note: "Art & culture", icon: Palette, color: "bg-purple-100 text-purple-700" },
  { name: "Sports", note: "Move & compete", icon: Trophy, color: "bg-blue-100 text-blue-700" },
  { name: "Food", note: "Food & drink", icon: Utensils, color: "bg-rose-100 text-rose-700" },
  { name: "Workshops", note: "Learn something new", icon: FlaskConical, color: "bg-fuchsia-100 text-fuchsia-700" },
  { name: "Lifestyle", note: "Make time for you", icon: Heart, color: "bg-emerald-100 text-emerald-700" },
];

export function CategorySection({ selectedCategory = "", onSelectCategory = () => {} }) {
  return (
    <section className="section-shell bg-[#f8f7ff]" id="categories">
      <div className="page-container">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">A little something for everyone</p>
            <h2 className="mb-0 text-2xl font-extrabold tracking-tight sm:text-3xl">Browse by category</h2>
          </div>
          {selectedCategory && <button className="self-start rounded-full px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-violet-100 sm:self-auto" onClick={() => onSelectCategory("")} type="button">Clear category</button>}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {categories.map(({ name, note, icon: Icon, color }) => {
            const active = selectedCategory === name;
            return (
              <button
                aria-pressed={active}
                className={`group flex min-h-20 items-center gap-3 rounded-2xl border p-3 text-left transition sm:gap-4 sm:p-4 ${active ? "border-brand-primary bg-violet-50 shadow-md shadow-indigo-950/5" : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"}`}
                key={name}
                onClick={() => onSelectCategory(active ? "" : name)}
                type="button"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}><Icon aria-hidden="true" size={20} /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-ink">{name}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{note}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
