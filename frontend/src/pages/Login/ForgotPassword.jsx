import { useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/password-reset";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10";
const buttonClass = "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-violet px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60";

export function ForgotPassword() {
    const [stage, setStage] = useState("request");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function submit(path, payload) {
        setLoading(true); setError(""); setMessage("");
        try {
            const response = await fetch(`${API}/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) { setError(data.message || "Something went wrong. Please try again."); return null; }
            setMessage(data.message || "Request complete.");
            return data;
        } catch {
            setError("Could not connect to Gatherix. Check your connection and try again.");
            return null;
        } finally { setLoading(false); }
    }

    async function requestCode(event) {
        event.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
        const data = await submit("request", { email: email.trim().toLowerCase() });
        if (data) setStage("verify");
    }

    async function verifyCode(event) {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) { setError("Enter the six-digit code from your email."); return; }
        const data = await submit("verify", { email: email.trim().toLowerCase(), otp });
        if (data?.resetToken) { setResetToken(data.resetToken); setStage("reset"); }
    }

    async function savePassword(event) {
        event.preventDefault();
        if (password !== confirmPassword) { setError("Passwords must match."); return; }
        const data = await submit("reset", { email: email.trim().toLowerCase(), resetToken, password, confirmPassword });
        if (data) { setResetToken(""); setPassword(""); setConfirmPassword(""); setStage("done"); }
    }

    const titles = { request: ["Reset your password", "Enter your account email and we’ll send a verification code."], verify: ["Check your email", "Enter the six-digit code sent to your Gatherix email."], reset: ["Choose a new password", "Use at least 8 characters with uppercase, lowercase, and a number."], done: ["Password updated", "Your password has been changed successfully."] };
    return (
        <main className="bg-[#faf9ff] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto grid min-h-[min(600px,calc(100vh-8rem))] max-w-5xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-xl shadow-indigo-950/[0.06] lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#181a38] via-[#28265e] to-[#4336b7] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-12"><Link className="relative inline-flex items-center gap-3 text-xl font-extrabold text-white" to="/"><span className="grid size-10 place-items-center rounded-xl bg-white/15">G</span> Gatherix</Link><div><h2 className="mb-4 text-3xl font-extrabold leading-tight text-white">Back to the experiences you love.</h2><p className="max-w-sm leading-7 text-indigo-100">Securely recover access to your Gatherix account.</p></div><p className="mb-0 text-xs text-indigo-200">Discover. Book. Experience.</p></aside>
                <section className="flex items-center px-5 py-10 sm:px-10 sm:py-12 lg:px-12"><div className="mx-auto w-full max-w-md">
                    <Link className="mb-8 inline-flex items-center gap-2 font-extrabold text-ink lg:hidden" to="/"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-violet text-white">G</span> Gatherix</Link>
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Account recovery</p><h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">{titles[stage][0]}</h1><p className="mb-7 text-sm leading-6 text-slate-600">{titles[stage][1]}</p>
                    {message && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{message}</p>}{error && <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}
                    {stage === "request" && <form className="space-y-5" onSubmit={requestCode}><label className="block text-sm font-bold text-slate-700" htmlFor="reset-email">Email address<input className={`${inputClass} mt-1.5`} id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className={buttonClass} disabled={loading}>{loading ? "Sending…" : "Send verification code"}</button></form>}
                    {stage === "verify" && <form className="space-y-5" onSubmit={verifyCode}><label className="block text-sm font-bold text-slate-700" htmlFor="reset-otp">Six-digit code<input className={`${inputClass} mt-1.5 tracking-[0.3em]`} id="reset-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} required /></label><button className={buttonClass} disabled={loading}>{loading ? "Verifying…" : "Verify code"}</button><button className="w-full text-sm font-bold text-brand-primary disabled:opacity-50" disabled={loading} onClick={requestCode} type="button">Request another code</button></form>}
                    {stage === "reset" && <form className="space-y-5" onSubmit={savePassword}><label className="block text-sm font-bold text-slate-700" htmlFor="new-password">New password<input className={`${inputClass} mt-1.5`} id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label><label className="block text-sm font-bold text-slate-700" htmlFor="confirm-password">Confirm new password<input className={`${inputClass} mt-1.5`} id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label><button className={buttonClass} disabled={loading}>{loading ? "Updating…" : "Reset password"}</button></form>}
                    {stage === "done" && <Link className={`${buttonClass} no-underline`} to="/login">Return to sign in</Link>}
                    {stage !== "done" && <p className="mb-0 mt-7 text-center text-sm text-slate-600"><Link className="font-extrabold text-brand-primary hover:text-brand-primary-dark" to="/login">Back to sign in</Link></p>}
                </div></section>
            </div>
        </main>
    );
}
