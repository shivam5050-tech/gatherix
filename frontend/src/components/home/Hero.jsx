import { useState } from "react";
import { CalendarDays, ChevronDown, MapPin, Search, Sparkles, Tag } from "lucide-react";
import bg from "../../assets/bg.jpg";

const categoryOptions = ["Music", "Technology", "Business", "Arts", "Sports", "Food", "Workshops", "Lifestyle"];

export function Hero({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  city,
  onCityChange,
  date,
  onDateChange,
  cities = [],
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative isolate overflow-hidden bg-violet-100">
      <img alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" src={bg} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/80 via-[#f5f2ff]/90 to-[#f6f4ff]" />
      <div className="absolute -right-24 top-12 -z-10 size-80 rounded-full bg-fuchsia-200/25 blur-3xl" />
      <div className="page-container py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-primary shadow-sm">
            <Sparkles aria-hidden="true" size={14} /> Find your next experience
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">
            Discover amazing events <span className="bg-gradient-to-r from-brand-primary via-brand-violet to-brand-pink bg-clip-text text-transparent">around you</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            From live music to creative workshops, explore gatherings and experiences that bring people together.
          </p>
        </div>

        <form className="mx-auto mt-9 max-w-5xl rounded-3xl border border-white/80 bg-white p-3 shadow-[0_24px_80px_-32px_rgba(49,46,129,0.4)] sm:mt-11 sm:p-5" onSubmit={handleSubmit}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl bg-violet-50/80 px-4 py-3.5 focus-within:ring-2 focus-within:ring-brand-primary/30">
              <Search aria-hidden="true" className="shrink-0 text-brand-primary" size={19} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">What are you looking for?</span>
                <input className="mt-1 w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-slate-400" onChange={(event) => onQueryChange(event.target.value)} placeholder="Event, artist, venue..." type="search" value={query} />
              </span>
            </label>

            <label className="flex min-w-0 items-center gap-3 rounded-2xl bg-violet-50/80 px-4 py-3.5 focus-within:ring-2 focus-within:ring-brand-primary/30">
              <Tag aria-hidden="true" className="shrink-0 text-brand-primary" size={19} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">Category</span>
                <span className="relative mt-1 block">
                  <select className="w-full appearance-none bg-transparent pr-5 text-sm font-semibold text-ink outline-none" onChange={(event) => onCategoryChange(event.target.value)} value={category}>
                    <option value="">All categories</option>
                    {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-0.5 text-slate-500" size={16} />
                </span>
              </span>
            </label>

            <label className="flex min-w-0 items-center gap-3 rounded-2xl bg-violet-50/80 px-4 py-3.5 focus-within:ring-2 focus-within:ring-brand-primary/30">
              <MapPin aria-hidden="true" className="shrink-0 text-brand-primary" size={19} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">City</span>
                <span className="relative mt-1 block">
                  <select className="w-full appearance-none bg-transparent pr-5 text-sm font-semibold text-ink outline-none" onChange={(event) => onCityChange(event.target.value)} value={city}>
                    <option value="">Anywhere</option>
                    {cities.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-0.5 text-slate-500" size={16} />
                </span>
              </span>
            </label>

            <label className="flex min-w-0 items-center gap-3 rounded-2xl bg-violet-50/80 px-4 py-3.5 focus-within:ring-2 focus-within:ring-brand-primary/30">
              <CalendarDays aria-hidden="true" className="shrink-0 text-brand-primary" size={19} />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">Date</span>
                <input className="mt-1 w-full bg-transparent text-sm font-semibold text-ink outline-none" onChange={(event) => onDateChange(event.target.value)} type="date" value={date} />
              </span>
            </label>
          </div>
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="mb-0 text-xs leading-5 text-slate-500">Search filters the events currently loaded in this page.</p>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-violet px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-lg" type="submit">
              <Search aria-hidden="true" size={16} /> {submitted ? "Update results" : "Explore events"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}