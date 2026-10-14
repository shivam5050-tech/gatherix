const nodemailer = require("nodemailer");

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function sendWelcomeEmail(email, name) {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
    const port = Number(EMAIL_PORT);
    const isConfigured = EMAIL_HOST && Number.isInteger(port) && port > 0
        && EMAIL_USER && EMAIL_PASS && EMAIL_FROM;

    if (!isConfigured) {
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port,
        secure: String(EMAIL_SECURE).toLowerCase() === "true",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const safeName = escapeHtml(name);
    await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: "Welcome to Gatherix",
        text: `Hi ${name},\n\nWelcome to Gatherix! Discover events, explore the details, and find experiences worth sharing.\n\nWe’re glad you’re here.`,
        html: `<!doctype html><html><body style="margin:0;background:#f7f6ff;font-family:Arial,sans-serif;color:#172033"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #e7e5f5;border-radius:16px"><tr><td style="padding:32px"><div style="font-size:22px;font-weight:700;color:#4f46e5">Gatherix</div><h1 style="margin:24px 0 12px;font-size:26px">Welcome, ${safeName}!</h1><p style="font-size:16px;line-height:1.6;color:#475569">Your Gatherix account is ready. Discover events, explore the details, and find experiences worth sharing.</p><p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b">We’re glad you’re here.<br />The Gatherix team</p></td></tr></table></td></tr></table></body></html>`,
    });

    return true;
}

module.exports = { sendWelcomeEmail };
