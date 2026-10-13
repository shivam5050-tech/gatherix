import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

function readSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function Profile() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState(readSavedUser);

  function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  }

  return (
    <section className="min-h-[60vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container max-w-3xl">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Your account</p>
        <h1 className="mb-7 text-3xl font-extrabold tracking-tight sm:text-4xl">Profile</h1>

        {!isLoggedIn ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-extrabold">You’re not logged in</h2>
            <p className="text-sm leading-6 text-slate-600">Log in to view the account information saved by this app.</p>
            <p className="mb-4 text-xs text-slate-500">This is a frontend-only check and does not securely protect a route.</p>
            <Link className="inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-dark" to="/login">Go to login</Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-violet-100 text-brand-primary">
                <UserRound aria-hidden="true" size={30} />
              </span>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Gatherix account</p>
                <h2 className="mb-0 break-all text-xl font-extrabold">{user?.email || "User information not available"}</h2>
              </div>
            </div>

            <dl className="mt-7 grid gap-4 rounded-xl bg-[#f8f7ff] p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Name</dt>
                <dd className="mb-0 mt-1 text-sm font-semibold text-slate-800">{user?.name || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Email</dt>
                <dd className="mb-0 mt-1 break-all text-sm font-semibold text-slate-800">{user?.email || "Not available"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-slate-500">Account ID</dt>
                <dd className="mb-0 mt-1 break-all text-sm font-semibold text-slate-800">{user?.id || user?._id || "Not available"}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link className="rounded-xl border border-indigo-200 px-4 py-3 text-center text-sm font-bold text-brand-primary hover:bg-violet-50" to="/my-bookings">View my bookings</Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={logOut} type="button"><LogOut aria-hidden="true" size={16} /> Log out</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
