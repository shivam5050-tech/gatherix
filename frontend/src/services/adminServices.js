import { authenticatedFetch } from "./api";

export async function getAdminDashboardStats() {
  const response = await authenticatedFetch("/admin/dashboard-stats");
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Could not load dashboard statistics.");
    error.status = response.status;
    throw error;
  }

  return data.stats;
}

export async function getAdminUsers({ page = 1, limit = 10, search = "", role = "" } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  if (role) query.set("role", role);

  const response = await authenticatedFetch(`/admin/users?${query.toString()}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Could not load users.");
    error.status = response.status;
    throw error;
  }

  return data;
}

async function updateAdminUser(path, payload) {
  const response = await authenticatedFetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Could not update this user.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function updateAdminUserStatus(id, status) {
  return updateAdminUser(`/admin/users/${encodeURIComponent(id)}/status`, { status });
}

export function updateAdminUserRole(id, role) {
  return updateAdminUser(`/admin/users/${encodeURIComponent(id)}/role`, { role });
}

export async function getAdminEvents({ page = 1, limit = 10, search = "", category = "", status = "" } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  if (category) query.set("category", category);
  if (status) query.set("status", status);

  const response = await authenticatedFetch(`/admin/events?${query.toString()}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Could not load events.");
    error.status = response.status;
    throw error;
  }

  return data;
}

async function updateAdminEvent(path, options = {}) {
  const response = await authenticatedFetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Could not update this event.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function updateAdminEventStatus(id, status) {
  return updateAdminEvent(`/admin/events/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminEvent(id) {
  return updateAdminEvent(`/admin/events/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getAdminBookings({ page = 1, limit = 10, search = "", bookingStatus = "", paymentStatus = "" } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) query.set("search", search);
  if (bookingStatus) query.set("bookingStatus", bookingStatus);
  if (paymentStatus) query.set("paymentStatus", paymentStatus);

  const response = await authenticatedFetch(`/admin/bookings?${query.toString()}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Could not load bookings.");
    error.status = response.status;
    throw error;
  }

  return data;
}
