import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getAdminUsers, updateAdminUserRole, updateAdminUserStatus } from "../../services/adminServices";
import { AdminNavigation } from "./AdminNavigation";

const currentUserId = (() => {
  try { return JSON.parse(localStorage.getItem("user") || "null")?.id || ""; }
  catch { return ""; }
})();

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingUserId, setPendingUserId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getAdminUsers({ page, limit: 10, search, role });
        if (active) {
          setUsers(result.users);
          setPagination(result.pagination);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load users.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUsers();
    return () => { active = false; };
  }, [page, reloadKey, role, search]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function changeRole(event) {
    setPage(1);
    setRole(event.target.value);
  }

  const totalPages = pagination?.totalPages || 0;

  async function runAction(user, action, value, confirmation) {
    if (!window.confirm(confirmation)) return;
    setPendingUserId(user.id);
    setError("");
    setNotice("");
    try {
      const result = action === "status"
        ? await updateAdminUserStatus(user.id, value)
        : await updateAdminUserRole(user.id, value);
      setNotice(result.message || "User updated successfully.");
      setReloadKey((key) => key + 1);
    } catch (actionError) {
      setError(actionError.message || "Could not update this user.");
    } finally {
      setPendingUserId("");
    }
  }

  return (
    <section className="min-h-[70vh] bg-[#faf8ff] py-10 sm:py-14">
      <div className="page-container">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Gatherix administration</p>
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">User Management</h1>
        <p className="mb-7 text-sm leading-6 text-slate-600">Inspect safe account details and manage account status and supported roles.</p>

        <AdminNavigation />

        <div className="surface-card mb-5 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
            <form className="flex gap-2" onSubmit={submitSearch} role="search">
              <label className="sr-only" htmlFor="admin-user-search">Search users by name or email</label>
              <input
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                id="admin-user-search"
                maxLength={100}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email"
                type="search"
                value={searchInput}
              />
              <button className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-dark" type="submit">
                <Search aria-hidden="true" size={16} /> <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            <div>
              <label className="sr-only" htmlFor="admin-user-role">Filter by role</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
                id="admin-user-role"
                onChange={changeRole}
                value={role}
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="mb-0">{error}</p>
            <button className="self-start rounded-lg border border-rose-300 bg-white px-3 py-2 font-bold hover:bg-rose-100 sm:self-auto" onClick={() => setReloadKey((key) => key + 1)} type="button">Try again</button>
          </div>
        )}
        {notice && <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{notice}</p>}

        <div aria-busy={isLoading} className="surface-card overflow-hidden">
          {isLoading ? (
            <p className="mb-0 p-6 text-sm text-slate-600" role="status">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="mb-0 p-6 text-sm text-slate-600" role="status">{error ? "User list could not be loaded." : "No users match these filters."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[68rem] text-left text-sm">
                <thead className="bg-[#f8f7ff] text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-bold" scope="col">Name</th>
                    <th className="px-5 py-4 font-bold" scope="col">Email</th>
                    <th className="px-5 py-4 font-bold" scope="col">Role</th>
                    <th className="px-5 py-4 font-bold" scope="col">Status</th>
                    <th className="px-5 py-4 font-bold" scope="col">Registered</th>
                    <th className="px-5 py-4 font-bold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr className="bg-white" key={user.id}>
                      <td className="px-5 py-4 font-semibold text-slate-800">{user.name || "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.role === "admin" ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700"}`}>
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.status === "suspended" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                          {user.status === "suspended" ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-violet-50 disabled:opacity-50" disabled={Boolean(pendingUserId)} onClick={() => runAction(user, "status", user.status === "suspended" ? "active" : "suspended", `Are you sure you want to ${user.status === "suspended" ? "reactivate" : "suspend"} ${user.name || user.email}?`)} type="button">
                            {pendingUserId === user.id ? "Saving…" : user.status === "suspended" ? "Reactivate" : "Suspend"}
                          </button>
                          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-violet-50 disabled:opacity-50" disabled={Boolean(pendingUserId) || (user.id === currentUserId && user.role === "admin")} onClick={() => runAction(user, "role", user.role === "admin" ? "user" : "admin", `Change ${user.name || user.email} role to ${user.role === "admin" ? "User" : "Admin"}?`)} type="button">
                            Make {user.role === "admin" ? "User" : "Admin"}
                          </button>
                          <details className="basis-full text-xs text-slate-600">
                            <summary className="cursor-pointer font-bold text-brand-primary">Inspect safe details</summary>
                            <p className="mb-0 mt-2">Name: {user.name || "—"}<br />Email: {user.email}<br />Account ID: {user.id}<br />Role: {user.role}<br />Status: {user.status || "active"}<br />Registered: {formatDate(user.createdAt)}</p>
                          </details>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination && pagination.totalUsers > 0 && (
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="mb-0">{pagination.totalUsers} {pagination.totalUsers === 1 ? "user" : "users"} · Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)} type="button">Previous</button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={page >= totalPages || isLoading} onClick={() => setPage((current) => current + 1)} type="button">Next</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
