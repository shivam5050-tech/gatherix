import { authenticatedFetch } from "./api";

async function authenticatedBookingRequest(path, options = {}) {
  const response = await authenticatedFetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Could not complete the booking request.");
    error.status = response.status;
    throw error;
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

export async function getEventBookings(eventId) {
  return authenticatedBookingRequest(`/bookings/events/${eventId}`);
}

export async function cancelBooking(bookingId) {
  return authenticatedBookingRequest(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
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

export async function verifyTicketToken(token) {
  return authenticatedBookingRequest("/bookings/tickets/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function startBookingPayment(booking, eventTitle) {
  const order = await createRazorpayOrder(booking._id);
  if (!await loadRazorpayCheckout()) {
    throw new Error("Razorpay Checkout could not load. Check your internet connection and try again.");
  }

  return new Promise((resolve) => {
    let settled = false;
    let verificationInProgress = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Gatherix",
      description: `Booking for ${eventTitle || "your event"}`,
      order_id: order.orderId,
      prefill: {
        ...(booking.attendeeName ? { name: booking.attendeeName } : {}),
        ...(booking.attendeeEmail ? { email: booking.attendeeEmail } : {}),
      },
      handler: async (response) => {
        verificationInProgress = true;
        try {
          const result = await verifyRazorpayPayment(booking._id, {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
          finish({ status: "verified", booking: result.booking });
        } catch (error) {
          finish({ status: "error", message: error.message || "Payment could not be verified. The booking remains unpaid." });
        }
      },
      modal: {
        ondismiss: () => {
          if (!verificationInProgress) finish({ status: "dismissed" });
        },
      },
    });

    razorpay.on("payment.failed", () => finish({ status: "failed" }));
    razorpay.open();
  });
}
