import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { ArrowRight, Eye, EyeOff, TicketCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const signupSchema = yup.object({
    name: yup.string().trim().required("Full name is required").max(100, "Name must be 100 characters or fewer"),
    email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
    password: yup.string()
        .min(8, "Use at least 8 characters")
        .matches(/[a-z]/, "Include at least one lowercase letter")
        .matches(/[A-Z]/, "Include at least one uppercase letter")
        .matches(/\d/, "Include at least one number")
        .required("Password is required"),
    confirmPassword: yup.string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
});

function FieldError({ id, children }) {
    return <p className="mt-1 text-xs font-medium text-rose-700" id={id}>{children}</p>;
}

export function Signup() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const formik = useFormik({
        initialValues: { name: "", email: "", password: "", confirmPassword: "" },
        validationSchema: signupSchema,
        onSubmit: async (values, { setStatus }) => {
            setStatus("");
            try {
                const response = await fetch("http://localhost:5000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: values.name.trim(),
                        email: values.email.trim().toLowerCase(),
                        password: values.password,
                    }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    setStatus(data.message || "Could not create your account. Please try again.");
                    return;
                }

                navigate("/login", { state: { message: data.message || "Your account was created. Sign in to continue." } });
            } catch {
                setStatus("Could not connect to Gatherix. Check your connection and try again.");
            }
        },
    });

    function getError(field) {
        return formik.touched[field] ? formik.errors[field] : "";
    }

    return (
        <main className="bg-[#faf9ff] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto grid min-h-[min(760px,calc(100vh-8rem))] max-w-5xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-xl shadow-indigo-950/[0.06] lg:grid-cols-[0.9fr_1.1fr]">
                <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#181a38] via-[#28265e] to-[#4336b7] p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
                    <div className="absolute -right-20 top-20 size-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
                    <Link className="relative inline-flex items-center gap-3 text-xl font-extrabold text-white" to="/" aria-label="Gatherix home">
                        <span className="grid size-10 place-items-center rounded-xl bg-white/15">G</span> Gatherix
                    </Link>
                    <div className="relative">
                        <TicketCheck aria-hidden="true" className="mb-7 text-violet-200" size={42} />
                        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white">Find the moments worth showing up for.</h2>
                        <p className="mb-0 max-w-sm leading-7 text-indigo-100">Discover events, explore the details, and keep your next great plan in reach.</p>
                    </div>
                    <p className="relative mb-0 text-xs text-indigo-200">Discover. Book. Experience.</p>
                </aside>

                <section className="flex items-center px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
                    <div className="mx-auto w-full max-w-md">
                        <Link className="mb-7 inline-flex items-center gap-2 font-extrabold text-ink lg:hidden" to="/" aria-label="Gatherix home">
                            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-violet text-white">G</span> Gatherix
                        </Link>
                        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Join Gatherix</p>
                        <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl">Create your account</h1>
                        <p className="mb-7 text-sm leading-6 text-slate-600">Sign up to discover events and book experiences.</p>

                        {formik.status && <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{formik.status}</p>}

                        <form className="space-y-4" noValidate onSubmit={formik.handleSubmit}>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="signup-name">Full name</label>
                                <input autoComplete="name" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="signup-name" placeholder="Your name" {...formik.getFieldProps("name")} aria-invalid={Boolean(getError("name"))} aria-describedby={getError("name") ? "signup-name-error" : undefined} />
                                {getError("name") && <FieldError id="signup-name-error">{getError("name")}</FieldError>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="signup-email">Email address</label>
                                <input autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="signup-email" placeholder="you@example.com" type="email" {...formik.getFieldProps("email")} aria-invalid={Boolean(getError("email"))} aria-describedby={getError("email") ? "signup-email-error" : undefined} />
                                {getError("email") && <FieldError id="signup-email-error">{getError("email")}</FieldError>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="signup-password">Password</label>
                                <div className="relative">
                                    <input autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="signup-password" placeholder="At least 8 characters" type={showPassword ? "text" : "password"} {...formik.getFieldProps("password")} aria-invalid={Boolean(getError("password"))} aria-describedby={getError("password") ? "signup-password-error" : undefined} />
                                    <button aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-brand-primary" onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                {getError("password") && <FieldError id="signup-password-error">{getError("password")}</FieldError>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="signup-confirm-password">Confirm password</label>
                                <div className="relative">
                                    <input autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10" id="signup-confirm-password" placeholder="Enter your password again" type={showConfirmation ? "text" : "password"} {...formik.getFieldProps("confirmPassword")} aria-invalid={Boolean(getError("confirmPassword"))} aria-describedby={getError("confirmPassword") ? "signup-confirm-password-error" : undefined} />
                                    <button aria-label={showConfirmation ? "Hide confirmation" : "Show confirmation"} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-500 hover:text-brand-primary" onClick={() => setShowConfirmation((visible) => !visible)} type="button">{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                {getError("confirmPassword") && <FieldError id="signup-confirm-password-error">{getError("confirmPassword")}</FieldError>}
                            </div>
                            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-violet px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60" disabled={formik.isSubmitting} type="submit">
                                {formik.isSubmitting ? "Creating account…" : "Create account"}
                                {!formik.isSubmitting && <ArrowRight aria-hidden="true" size={17} />}
                            </button>
                        </form>
                        <p className="mb-0 mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="font-extrabold text-brand-primary hover:text-brand-primary-dark" to="/login">Log in</Link></p>
                    </div>
                </section>
            </div>
        </main>
    );
}
