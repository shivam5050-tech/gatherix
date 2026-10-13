import { MessageSquareQuote } from "lucide-react";

const samples = [
  { quote: "Finding an event for the weekend felt straightforward. I could narrow the list and check the details in one place.", label: "Sample attendee" },
  { quote: "The category browsing made it easy to spot a kind of event I would not have searched for by name.", label: "Sample attendee" },
  { quote: "A clear event preview is a helpful starting point when deciding what to explore next.", label: "Sample attendee" },
];

export function Testimonials() {
  return (
    <section className="section-shell bg-[#f7f6ff]" id="stories">
      <div className="page-container">
        <div className="mx-auto mb-8 max-w-xl text-center">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-primary">Stories</p>
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Good things happen when we get together</h2>
          <p className="mb-0 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"><MessageSquareQuote aria-hidden="true" size={14} /> Sample copy for design preview — not real customer reviews</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {samples.map((sample, index) => (
            <figure className="m-0 flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6" key={sample.quote}>
              <div aria-label="Sample, no rating" className="mb-4 text-sm tracking-widest text-amber-500">Sample story {index + 1}</div>
              <blockquote className="mb-6 flex-1 text-sm leading-6 text-slate-700">“{sample.quote}”</blockquote>
              <figcaption className="border-t border-slate-100 pt-4 text-xs font-extrabold text-slate-500">{sample.label} · Demo content</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
