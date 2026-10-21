const crypto = require("node:crypto");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectImageType(buffer) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
    if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
    return null;
}

function cloudinaryConfiguration() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error("Image uploads are not configured. Set Cloudinary environment variables.");
    }
    return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET };
}

function cloudinarySignature(params, apiSecret) {
    const value = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
    return crypto.createHash("sha1").update(`${value}${apiSecret}`).digest("hex");
}

async function uploadEventImage(buffer) {
    if (!Buffer.isBuffer(buffer) || !buffer.length) throw Object.assign(new Error("Choose an image to upload."), { status: 400 });
    if (buffer.length > MAX_IMAGE_BYTES) throw Object.assign(new Error("Image must be 5 MB or smaller."), { status: 413 });
    const detectedType = detectImageType(buffer);
    if (!detectedType || !IMAGE_TYPES.has(detectedType)) throw Object.assign(new Error("Upload a valid JPEG, PNG, or WebP image."), { status: 400 });

    const { cloudName, apiKey, apiSecret } = cloudinaryConfiguration();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "gatherix/events";
    const signature = cloudinarySignature({ folder, timestamp }, apiSecret);
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: detectedType }), `event-image.${detectedType.split("/")[1]}`);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", folder);
    form.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.secure_url || !result.public_id) {
        const error = new Error("Cloudinary could not store this image. Try again.");
        error.status = 502;
        throw error;
    }
    return { url: result.secure_url, publicId: result.public_id };
}

function createCleanupToken(userId, publicId) {
    return crypto.createHmac("sha256", process.env.JWT_SECRET).update(`${userId}:${publicId}`).digest("hex");
}

async function deleteEventImage(publicId) {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfiguration();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinarySignature({ public_id: publicId, timestamp }, apiSecret);
    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    return response.ok && ["ok", "not found"].includes(result.result);
}

module.exports = { MAX_IMAGE_BYTES, createCleanupToken, deleteEventImage, uploadEventImage };
