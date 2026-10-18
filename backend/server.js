const path = require("path");
const dotenvResult = require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;

if (dotenvResult.error) {
    console.warn("Backend .env file was not loaded from the backend directory");
}

const { getEmailEnvironmentStatus } = require("./services/emailService.js");
console.info("Email environment variable presence:", getEmailEnvironmentStatus());

console.info("Razorpay test configuration:", {
    keyIdPresent: Boolean(razorpayKeyId),
    keyIdUsesTestMode: Boolean(razorpayKeyId?.startsWith("rzp_test_")),
    keySecretPresent: Boolean(process.env.RAZORPAY_KEY_SECRET),
});

const usesSystemCa = process.execArgv.includes("--use-system-ca")
    || /(?:^|\s)--use-system-ca(?:\s|$)/.test(process.env.NODE_OPTIONS || "");
console.info("Node system CA store enabled:", usesSystemCa);

const express = require("express");
const cors = require("cors");
const connectdb = require('./config/db.js')
const authRoutes = require("./routes/authRoutes.js");
const eventRoutes = require('./routes/eventRoutes.js')
const bookingRoutes = require("./routes/bookingRoutes.js");

connectdb()
const app = express();

app.use(cors());

app.use(express.json());

app.use("/", authRoutes);
app.use('/events',eventRoutes);
app.use("/bookings", bookingRoutes);


app.use((req, res) => {

    res.status(404).json({
        message: "Route not found"
    });

});


app.listen(process.env.PORT, () => {

    console.log("Server is running");

});
