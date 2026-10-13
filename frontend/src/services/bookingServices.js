import { authenticatedFetch } from "./api";

async function authenticatedBookingRequest(path, options = {}) {
  const response = await authenticatedFetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not complete the booking request.");
  }

  return data;
}

export async function createBooking(bookingData) {
  return authenticatedBookingRequest("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });
}

export async function getMyBookings() {
  const data = await authenticatedBookingRequest("/bookings/mine");
  return data.bookings;
}

export async function createRazorpayOrder(bookingId) {
  return authenticatedBookingRequest(`/bookings/${bookingId}/payment-order`, {
    method: "POST",
  });
}

export async function verifyRazorpayPayment(bookingId, paymentData) {
  return authenticatedBookingRequest(`/bookings/${bookingId}/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });
}
