const path = require("path");
const dotenvResult = require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);


if (dotenvResult.error) {
    console.warn("Backend .env file was not loaded from the backend directory");
}

const { getEmailEnvironmentStatus } = require("./services/emailService.js");
console.info("Email environment variable presence:", getEmailEnvironmentStatus());

const usesSystemCa = process.execArgv.includes("--use-system-ca")
    || /(?:^|\s)--use-system-ca(?:\s|$)/.test(process.env.NODE_OPTIONS || "");
console.info("Node system CA store enabled:", usesSystemCa);

const express = require("express");
const cors = require("cors");
const connectdb = require('./config/db.js')
const authRoutes = require("./routes/authRoutes.js");
const eventRoutes = require('./routes/eventRoutes.js')
const bookingRoutes = require("./routes/bookingRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

connectdb()
const app = express();

app.use(cors());

app.use(express.json());

app.use("/", authRoutes);
app.use('/events',eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);


app.use((req, res) => {

    res.status(404).json({
        message: "Route not found"
    });

});


app.listen(process.env.PORT, () => {

    console.log("Server is running");

});
