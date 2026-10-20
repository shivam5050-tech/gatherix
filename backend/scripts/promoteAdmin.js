const path = require("path");
const readline = require("readline/promises");
const { stdin, stdout } = require("process");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Users = require("../modules/userSchema");

dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required in backend/.env");
    }

    const prompt = readline.createInterface({ input: stdin, output: stdout });

    try {
        const email = (await prompt.question("Email of the existing account to promote: "))
            .trim()
            .toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Enter a valid email address");
        }

        await mongoose.connect(process.env.MONGO_URI);
        const user = await Users.findOne({ email }).select("email role");
        if (!user) {
            throw new Error("No existing account was found for that email");
        }
        if (user.role === "admin") {
            throw new Error("That account is already an administrator");
        }
        if (user.role !== "user") {
            throw new Error("That account has an unexpected role; no changes were made");
        }

        const confirmation = await prompt.question(
            `Type PROMOTE ${email} to grant this account administrator access: `
        );
        if (confirmation !== `PROMOTE ${email}`) {
            throw new Error("Confirmation did not match; no changes were made");
        }

        const result = await Users.updateOne(
            { _id: user._id, role: "user" },
            { $set: { role: "admin" } }
        );
        if (result.modifiedCount !== 1) {
            throw new Error("The account changed during promotion; no account was promoted");
        }

        console.log("Administrator role granted to the verified account.");
    } finally {
        prompt.close();
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
