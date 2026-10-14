import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { ArrowRight, Eye, EyeOff, TicketCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const loginSchema = yup.object({
    email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
    password: yup.string().required("Password is required"),
});

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: loginSchema,
        onSubmit: async (values, { setStatus }) => {
            setStatus("");
            try {
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: values.email.trim().toLowerCase(), password: values.password }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setStatus(data.message || "Login failed. Check your details and try again.");
                    return;
                }

                if (!data.token) {
                    setStatus("We could not complete sign in. Please try again.");
                    return;
                }

                localStorage.setItem("token", data.token);
                if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
                window.dispatchEvent(new Event("gatherix-auth-change"));
                navigate("/");
            } catch {
                setStatus("Could not connect to Gatherix. Check your connection and try again.");
            }
        },
    });

    const emailError = formik.touched.email ? formik.errors.email : "";
    const passwordError = formik.touched.password ? formik.errors.password : "";

    return (
        <main className="bg-[#faf9ff] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto grid min-h-[min(680px,calc(100vh-8rem))] max-w-5xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-xl shadow-indigo-950/[0.06] lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#181a38] via-[#28265e] to-[#4336b7] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
                    <div className="absolute -right-20 top-20 size-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
                    <Link className="relative inline-flex items-center gap-3 text-xl font-extrabold text-white" to="/" aria-label="Gatherix home">
                        <span className="grid size-10 place-items-center rounded-xl bg-white/15">G</span> Gatherix
                    </Link>
                    <div className="relative">
                        <TicketCheck aria-hidden="true" className="mb-7 text-violet-200" size={42} />
                        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white">Your next great plan is waiting.</h2>
                        <p className="mb-0 max-w-sm leading-7 text-indigo-100">Sign in to pick up where you left off and explore events on Gatherix.</p>
                    </div>
                    <p className="relative mb-0 text-xs text-indigo-200">Discover. Book. Experience.</p>
                </aside>

                <section className="flex items-center px-5 py-10 sm:px-10 sm:py-12 lg:px-12">
                    <div className="mx-auto w-full max-w-md">
                        <Link className="mb-8 inline-flex items-center gap-2 font-extrabold text-ink lg:hidden" to="/" aria-label="Gatherix home">
                            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-violet text-white">G</span> Gatherix
                        </Link>
                        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Welcome back</p>
                        <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">Sign in to Gatherix</h1>
                        <p className="mb-7 text-sm leading-6 text-slate-600">Use your account to continue discovering events.</p>

                        {location.state?.message && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{location.state.message}</p>}
                        {formik.status && <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{formik.status}</p>}

                        <form className="space-y-5" noValidate onSubmit={formik.handleSubmit}>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="login-email">Email address</label>
                                <input autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="login-email" placeholder="you@example.com" type="email" {...formik.getFieldProps("email")} aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "login-email-error" : undefined} />
                                {emailError && <p className="mt-1 text-xs font-medium text-rose-700" id="login-email-error">{emailError}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="login-password">Password</label>
                                <div className="relative">
                                    <input autoComplete="current-password" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="login-password" placeholder="Your password" type={showPassword ? "text" : "password"} {...formik.getFieldProps("password")} aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "login-password-error" : undefined} />
                                    <button aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-brand-primary" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                {passwordError && <p className="mt-1 text-xs font-medium text-rose-700" id="login-password-error">{passwordError}</p>}
                            </div>
                            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-violet px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60" disabled={formik.isSubmitting} type="submit">
                                {formik.isSubmitting ? "Signing in…" : "Sign in"}
                                {!formik.isSubmitting && <ArrowRight aria-hidden="true" size={17} />}
                            </button>
                        </form>
                        <p className="mb-0 mt-6 text-center text-sm text-slate-600">Don’t have an account? <Link className="font-extrabold text-brand-primary hover:text-brand-primary-dark" to="/signup">Sign up</Link></p>
                    </div>
                </section>
            </div>
        </main>
    );
}
