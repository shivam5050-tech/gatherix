require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectdb = require('./config/db.js')
const authRoutes = require("./routes/authRoutes.js");
const eventRoutes = require('./routes/eventRoutes.js')

connectdb()
const app = express();

app.use(cors());

app.use(express.json());

app.use("/", authRoutes);
app.use('/events',eventRoutes);


app.use((req, res) => {

    res.status(404).json({
        message: "Route not found"
    });

});


app.listen(process.env.PORT, () => {

    console.log("Server is running");

});