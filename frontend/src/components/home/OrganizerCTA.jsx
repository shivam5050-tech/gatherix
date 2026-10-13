import { ArrowRight, CalendarPlus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function OrganizerCTA() {
  return (
    <section className="section-shell bg-white" id="organizers">
      <div className="page-container">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#181a38] via-[#28265e] to-[#4336b7] px-6 py-9 text-white shadow-xl shadow-indigo-950/15 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-violet-100"><Sparkles aria-hidden="true" size={13} /> For event organizers</p>
              <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">Have an event to share?</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">Create a Gatherix account to get started. Event publishing and organizer tools can be connected as the platform grows.</p>
              <Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-800 transition hover:bg-violet-50" to="/signup">Create an account <ArrowRight aria-hidden="true" size={16} /></Link>
            </div>
            <div aria-hidden="true" className="hidden justify-center lg:flex">
              <div className="grid size-48 place-items-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-indigo-950/20 backdrop-blur">
                <div className="grid size-28 place-items-center rounded-[1.5rem] bg-gradient-to-br from-violet-300 to-fuchsia-300 text-indigo-950"><CalendarPlus size={54} strokeWidth={1.5} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
