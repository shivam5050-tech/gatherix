const nodemailer = require("nodemailer");

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
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        },
    };
}

function createTransporter() {
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

    const transporter = nodemailer.createTransport(configuration.transport);
    try {
        await transporter.verify();
        console.info("SMTP verification succeeded", { stage: "connect_and_authenticate" });
        return true;
    } catch (error) {
        console.error("SMTP verification failed", {
            stage: error.code === "EAUTH" ? "authentication" : "connection_or_greeting",
            code: error.code || "SMTP_VERIFY_FAILED",
            responseCode: error.responseCode,
        });
        return false;
    } finally {
        transporter.close();
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
        transporter = createTransporter();
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
            code: error.code || "EMAIL_SEND_FAILED",
            responseCode: error.responseCode,
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

module.exports = { sendWelcomeEmail, verifyEmailConfiguration, getEmailEnvironmentStatus };
