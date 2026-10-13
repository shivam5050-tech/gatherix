import { useState } from "react";
import { Mail } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setMessage("Thanks! This is a local demo — your email was not saved or subscribed.");
  };

  return (
    <section className="bg-white py-10 sm:py-12" id="newsletter">
      <div className="page-container grid gap-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-white via-violet-50 to-fuchsia-50 p-5 sm:p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-primary shadow-sm"><Mail aria-hidden="true" size={20} /></span>
          <div><h2 className="mb-1 text-lg font-extrabold">A little inspiration in your inbox</h2><p className="mb-0 text-sm leading-6 text-slate-600">Try the newsletter form. Subscription is not connected yet.</p></div>
        </div>
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input autoComplete="email" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand-primary focus:outline-none" id="newsletter-email" onChange={(event) => { setEmail(event.target.value); setMessage(""); }} placeholder="Your email address" required type="email" value={email} />
          <button className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-primary-dark" type="submit">Subscribe</button>
          <p aria-live="polite" className="basis-full text-xs text-slate-600 sm:ml-1">{message || "Demo interaction only; no email is sent or stored."}</p>
        </form>
      </div>
    </section>
  );
}
