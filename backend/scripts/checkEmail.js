const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const { verifyEmailConfiguration, getEmailEnvironmentStatus } = require("../services/emailService");

console.info("Email environment variable presence:", getEmailEnvironmentStatus());
verifyEmailConfiguration().then((verified) => {
    process.exitCode = verified ? 0 : 1;
});
