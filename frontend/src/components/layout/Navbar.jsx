import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronDown, LogOut, Menu, UserRound, X } from "lucide-react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

function readSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function ProfileDropdown({ user, isOpen, onToggle, onClose, onLogout, mobile = false }) {
  const email = user?.email;
  const initial = email ? email.charAt(0).toUpperCase() : null;

  return (
    <div className="relative" data-profile-dropdown>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className={`flex items-center gap-2 rounded-xl p-1.5 text-slate-700 transition hover:bg-violet-50 ${mobile ? "border border-slate-200" : ""}`}
        onClick={onToggle}
        type="button"
      >
        <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-violet-100 text-sm font-extrabold text-brand-primary">
          {initial || <UserRound aria-hidden="true" size={18} />}
        </span>
        <ChevronDown aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-indigo-950/10" role="menu">
          <div className="border-b border-slate-100 px-3 py-3">
            <p className="mb-0 truncate text-sm font-semibold text-slate-700">{email || "Signed in"}</p>
          </div>
          <Link className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-brand-primary" onClick={onClose} role="menuitem" to="/profile">My Profile</Link>
          <Link className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-brand-primary" onClick={onClose} role="menuitem" to="/my-bookings">My Bookings</Link>
          <Link className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-brand-primary" onClick={onClose} role="menuitem" to="/organizer">Organizer Dashboard</Link>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={onLogout} role="menuitem" type="button"><LogOut aria-hidden="true" size={16} /> Log Out</button>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState(readSavedUser);

  useEffect(() => {
    function updateLoginState() {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
      setUser(readSavedUser());
    }

    function closeMenusOnEscape(event) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setMenuOpen(false);
      }
    }

    function closeProfileOnOutsideClick(event) {
      if (event.target instanceof Element && !event.target.closest("[data-profile-dropdown]")) {
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener("gatherix-auth-change", updateLoginState);
    window.addEventListener("storage", updateLoginState);
    document.addEventListener("keydown", closeMenusOnEscape);
    document.addEventListener("mousedown", closeProfileOnOutsideClick);

    return () => {
      window.removeEventListener("gatherix-auth-change", updateLoginState);
      window.removeEventListener("storage", updateLoginState);
      document.removeEventListener("keydown", closeMenusOnEscape);
      document.removeEventListener("mousedown", closeProfileOnOutsideClick);
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }

  function logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    closeMenu();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/90 shadow-sm shadow-indigo-950/[0.03] backdrop-blur-xl">
      <nav aria-label="Main navigation" className="page-container flex min-h-16 items-center justify-between gap-4 py-3">
        <Link aria-label="Gatherix home" className="flex shrink-0 items-center gap-2.5" onClick={closeMenu} to="/">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-violet text-base font-extrabold text-white shadow-md shadow-indigo-500/20">G</span>
          <span className="text-lg font-extrabold tracking-tight text-ink">Gatherix</span>
        </Link>

        <div className="hidden items-center gap-5 lg:gap-7 md:flex">
          {navigation.map((item) => (
            <Link className="whitespace-nowrap text-sm font-semibold text-slate-600 transition hover:text-brand-primary" key={item.label} onClick={closeMenu} to={item.href}>{item.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <ProfileDropdown
              isOpen={profileMenuOpen}
              onClose={() => setProfileMenuOpen(false)}
              onLogout={logOut}
              onToggle={() => setProfileMenuOpen((open) => !open)}
              user={user}
            />
          ) : (
            <>
              <Link className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-brand-primary" onClick={closeMenu} to="/login">Log in</Link>
              <Link className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-brand-primary-dark" onClick={closeMenu} to="/signup">Sign up <ArrowUpRight aria-hidden="true" size={16} /></Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && (
            <ProfileDropdown
              isOpen={profileMenuOpen}
              mobile
              onClose={closeMenu}
              onLogout={logOut}
              onToggle={() => setProfileMenuOpen((open) => !open)}
              user={user}
            />
          )}
          <button aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700" onClick={() => setMenuOpen((open) => !open)} type="button">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50" key={item.label} onClick={closeMenu} to={item.href}>{item.label}</Link>
            ))}
            {!isLoggedIn && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <Link className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700" onClick={closeMenu} to="/login">Log in</Link>
                <Link className="rounded-xl bg-brand-primary px-4 py-3 text-center text-sm font-bold text-white" onClick={closeMenu} to="/signup">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
