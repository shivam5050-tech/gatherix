const nodemailer = require("nodemailer");

function getSafeEmailErrorDetails(error) {
    const message = String(error.message || "Email operation failed")
        .replaceAll(process.env.EMAIL_PASS || "\0", "[redacted]")
        .replaceAll(process.env.EMAIL_USER || "\0", "[redacted]");
    return {
        code: error.code || "EMAIL_OPERATION_FAILED",
        command: error.command,
        syscall: error.syscall,
        address: error.address,
        hostname: error.hostname,
        responseCode: error.responseCode,
        message,
    };
}

function getEmailEnvironmentStatus() {
    return Object.fromEntries([
        "EMAIL_HOST",
        "EMAIL_PORT",
        "EMAIL_SECURE",
        "EMAIL_USER",
        "EMAIL_PASS",
        "EMAIL_FROM",
    ].map((name) => [name, Boolean(process.env[name]?.trim())]));
}

function getEmailConfiguration() {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
    const port = Number(EMAIL_PORT);
    const missing = [
        ["EMAIL_HOST", EMAIL_HOST],
        ["EMAIL_PORT", EMAIL_PORT],
        ["EMAIL_SECURE", EMAIL_SECURE],
        ["EMAIL_USER", EMAIL_USER],
        ["EMAIL_PASS", EMAIL_PASS],
        ["EMAIL_FROM", EMAIL_FROM],
    ].filter(([, value]) => !value).map(([key]) => key);

    if (missing.length) {
        return { error: `Missing required email settings: ${missing.join(", ")}` };
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return { error: "EMAIL_PORT must be a valid TCP port" };
    }

    const secureValue = EMAIL_SECURE.toLowerCase();
    if (secureValue !== "true" && secureValue !== "false") {
        return { error: "EMAIL_SECURE must be either true or false" };
    }
    const secure = secureValue === "true";
    const fromAddress = EMAIL_FROM.match(/<([^>]+)>/)?.[1] || EMAIL_FROM;
    if (EMAIL_HOST.toLowerCase() === "smtp.gmail.com"
        && fromAddress.trim().toLowerCase() !== EMAIL_USER.trim().toLowerCase()) {
        return { error: "For Gmail SMTP, EMAIL_FROM must use the EMAIL_USER address" };
    }

    return {
        transport: {
            host: EMAIL_HOST,
            port,
            secure,
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        },
    };
}

async function createTransporter() {
    const configuration = getEmailConfiguration();
    if (configuration.error) throw new Error(configuration.error);

    return nodemailer.createTransport(configuration.transport);
}

async function verifyEmailConfiguration() {
    const configuration = getEmailConfiguration();
    if (configuration.error) {
        console.error("SMTP configuration failed", { stage: "configuration", error: configuration.error });
        return false;
    }

    let transporter;
    try {
        transporter = await createTransporter();
        await transporter.verify();
        console.info("SMTP verification succeeded", { stage: "connect_and_authenticate" });
        return true;
    } catch (error) {
        console.error("SMTP verification failed", {
            stage: error.code === "EAUTH" ? "authentication" : error.code === "ESOCKET" ? "connection_or_tls" : "connection_or_greeting",
            ...getSafeEmailErrorDetails(error),
        });
        return false;
    } finally {
        transporter?.close();
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function sendWelcomeEmail(email, name) {
    let transporter;
    try {
        transporter = await createTransporter();
    } catch (error) {
        console.error("Welcome email configuration failed", {
            stage: "configuration",
            code: error.code || "EMAIL_CONFIGURATION_INVALID",
            error: error.message,
        });
        throw error;
    }

    const safeName = escapeHtml(name);
    let info;
    try {
        info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Welcome to Gatherix",
            text: `Hi ${name},\n\nWelcome to Gatherix! Discover events, explore the details, and find experiences worth sharing.\n\nWe’re glad you’re here.`,
            html: `<!doctype html><html><body style="margin:0;background:#f7f6ff;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #e7e5f5;border-radius:16px"><tr><td style="padding:32px"><div style="font-size:22px;font-weight:700;color:#4f46e5">Gatherix</div><h1 style="margin:24px 0 12px;font-size:26px">Welcome, ${safeName}!</h1><p style="font-size:16px;line-height:1.6;color:#475569">Your Gatherix account is ready. Discover events, explore the details, and find experiences worth sharing.</p><p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b">We’re glad you’re here.<br />The Gatherix team</p></td></tr></table></td></tr></table></body></html>`,
        });
    } catch (error) {
        console.error("Welcome email SMTP submission failed", {
            stage: error.code === "EAUTH" ? "authentication" : "send_mail",
            ...getSafeEmailErrorDetails(error),
        });
        throw error;
    } finally {
        transporter.close();
    }

    console.info("Welcome email submitted to SMTP", {
        stage: "send_mail",
        messageId: info.messageId,
        acceptedRecipientCount: info.accepted?.length || 0,
        rejectedRecipientCount: info.rejected?.length || 0,
    });

    return Boolean(info.messageId && info.accepted?.length);
}

async function sendPasswordResetOtp(email, otp) {
    const transporter = await createTransporter();
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Your Gatherix password reset code",
            text: `Your Gatherix verification code is ${otp}. It expires in 10 minutes. If you did not request a password reset, you can ignore this email.`,
            html: `<p>Your Gatherix verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes. If you did not request a password reset, you can ignore this email.</p>`,
        });
        return Boolean(info.messageId && info.accepted?.length);
    } finally {
        transporter.close();
    }
}

async function sendBookingConfirmationEmail(booking) {
    const event = booking.event || {};
    const baseUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const bookingsUrl = `${baseUrl}/my-bookings`;
    const attendeeName = booking.attendeeName || "there";
    const eventTitle = event.title || "Your Gatherix event";
    const eventDate = event.date ? new Date(event.date).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" }) : "To be announced";
    const venue = [event.location, event.city].filter(Boolean).join(", ") || "To be announced";
    const quantity = booking.ticketQuantity;
    const amount = booking.paymentStatus === "not_required"
        ? "Free booking"
        : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(booking.subtotal) || 0);
    const safeName = escapeHtml(attendeeName);
    const safeTitle = escapeHtml(eventTitle);
    const safeDate = escapeHtml(eventDate);
    const safeVenue = escapeHtml(venue);
    const safeAmount = escapeHtml(amount);
    const safeReference = escapeHtml(booking._id.toString());
    const safeUrl = escapeHtml(bookingsUrl);

    const transporter = await createTransporter();
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: booking.attendeeEmail,
            subject: `Booking confirmed: ${eventTitle.replace(/[\r\n]/g, " ").slice(0, 120)}`,
            text: `Hi ${attendeeName},\n\nYour booking for ${eventTitle} is confirmed.\n\nDate and time: ${eventDate}\nVenue: ${venue}\nBooking reference: ${booking._id}\nTickets: ${quantity}\nAmount: ${amount}\n\nView your booking and ticket: ${bookingsUrl}\n\nThe Gatherix team`,
            html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#f7f6ff;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #e7e5f5;border-radius:16px"><tr><td style="padding:28px 24px"><div style="font-size:21px;font-weight:700;color:#4f46e5">Gatherix</div><p style="margin:24px 0 6px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Booking confirmed</p><h1 style="margin:0 0 16px;font-size:25px;line-height:1.3">You’re going, ${safeName}!</h1><p style="margin:0 0 22px;color:#475569;font-size:15px;line-height:1.6">Your booking for <strong>${safeTitle}</strong> is confirmed. Here are the details for your visit.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#faf9ff;border-radius:12px"><tr><td style="padding:16px 18px"><p style="margin:0 0 12px;color:#64748b;font-size:12px">DATE AND TIME</p><p style="margin:-8px 0 16px;font-size:15px;font-weight:700">${safeDate}</p><p style="margin:0 0 12px;color:#64748b;font-size:12px">VENUE</p><p style="margin:-8px 0 16px;font-size:15px;font-weight:700">${safeVenue}</p><p style="margin:0 0 12px;color:#64748b;font-size:12px">BOOKING REFERENCE</p><p style="margin:-8px 0 16px;font-size:13px;font-family:monospace;word-break:break-all">${safeReference}</p><p style="margin:0 0 12px;color:#64748b;font-size:12px">TICKETS · AMOUNT</p><p style="margin:-8px 0 0;font-size:15px;font-weight:700">${quantity} · ${safeAmount}</p></td></tr></table><p style="margin:24px 0;text-align:center"><a href="${safeUrl}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;text-decoration:none">View my booking</a></p><p style="margin:0;color:#64748b;font-size:12px;line-height:1.6">Your ticket QR is available in My Bookings. Keep your booking reference handy, and enjoy the event!</p></td></tr></table></td></tr></table></body></html>`,
        });
        return Boolean(info.messageId && info.accepted?.length);
    } finally {
        transporter.close();
    }
}

module.exports = { sendWelcomeEmail, sendPasswordResetOtp, sendBookingConfirmationEmail, verifyEmailConfiguration, getEmailEnvironmentStatus, getSafeEmailErrorDetails };
